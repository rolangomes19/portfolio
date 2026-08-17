# Font-loading performance plan

**Status: implemented and verified (2026-08-17).** Both steps below were
carried out as written — italic face dropped, three remaining fonts
Latin-subsetted with `pyftsubset`, identical `--unicodes` list used for all
three. Results are in a new **Outcome** section at the bottom. Kept as a
record of the reasoning (and the re-subset command, if a future edit ever
needs a character outside the current range) rather than deleted now that
it's done.

## The problem

Lighthouse (mobile, default simulated throttling — ~1.6 Mbps, 150ms RTT) on
every case study:

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| blueprint-design-system | 69 | 100 | 100 | 100 |
| hub-accessibility | 65 | 100 | 100 | 100 |
| hub-migration | 70 | 100 | 100 | 100 |
| ai-design-to-code | 70 | 100 | 100 | 100 |
| ai-process-framework | 69 | 100 | 100 | 100 |
| incridea-2022-branding | 82 | 100 | 100 | 100 |

Accessibility/Best Practices/SEO are already at the CLAUDE.md target (100).
Performance is not (target ≥95). axe-core found **zero violations** on any
page, open-lightbox state included, so this is purely a loading-weight
problem, not a markup/a11y problem.

## Root cause

Four self-hosted fonts, ~1.08MB combined, all fetched during initial page
load on every page (this isn't case-study-specific — the same `<head>`
boilerplate and `css/styles.css` `@font-face` block ship on every page):

| File | Size on disk | Preloaded? |
|---|---|---|
| `InterVariable.woff2` | 352 KB | yes |
| `InterVariable-Italic.woff2` | 388 KB | no, but still fetched eagerly (see below) |
| `Commissioner-Variable.woff2` | 268 KB | yes |
| `GeistMono-Variable.woff2` | 72 KB | yes |

(`Estedad-Variable.woff2`, 128 KB, is RTL-only and not implicated — it only
loads once a visitor toggles Arabic, which is already correct behavior.)

Three of the four are `<link rel="preload">`'d in every page's `<head>`
(e.g. `index.html:33-35`) — high priority, competing for bandwidth from the
first moment. The italic face isn't preloaded (`css/styles.css:8-10`
explains why: "rarely the first thing painted"), but it's still fetched
during initial load anyway, because the browser fetches any `@font-face`
source as soon as it encounters matching text — and matching text exists:
`work/blueprint-design-system.html:149` has one `<em>`, and `.draft-note`
(`css/styles.css:953-961`, used for `<!-- PLACEHOLDER -->` narrative
sections) is styled `font-style: italic`.

Under simulated mobile throughput, ~1MB of font payload competing with
everything else pushes First Contentful Paint to ~3.4s and Largest
Contentful Paint to ~7.3s on every case study — that's what's actually
being scored.

## The fix, in priority order

### 1. Drop the italic face entirely (highest impact, lowest risk)

Site-wide usage of true italic is exactly two things: one `<em>` in one
case study, and the (temporary, meant to be deleted once real content
replaces it) `.draft-note` placeholder style. Neither needs a licensed
italic design — the browser's synthetic/faux italic (automatic oblique
slant of the upright face, standard behavior whenever `font-style: italic`
is requested but no italic face is registered) is indistinguishable at body
text size for this little usage, and costs nothing.

- Delete the `@font-face` block for `InterVariable-Italic` in
  `css/styles.css:19-25`.
- Delete `assets/fonts/InterVariable-Italic.woff2`. (No separate license
  file to worry about — unlike Commissioner/Estedad/GeistMono, there's no
  `OFL-Inter.txt` in `assets/fonts/` to begin with.)
- No preload link to touch (it was never preloaded).
- **Removes 388 KB — the single largest file — for zero markup changes.**

### 2. Latin-only subset the three preloaded fonts

`InterVariable.woff2`, `Commissioner-Variable.woff2`, and
`GeistMono-Variable.woff2` all ship full Unicode coverage (Cyrillic, Greek,
Vietnamese, etc.) that this site never uses — all non-Latin content runs
through Estedad instead (Arabic, handled entirely separately per
CLAUDE.md's font strategy). Subsetting to Latin + Latin Extended (covers
English plus the accented characters likely to show up in names/places)
typically cuts 30–50% off a general-purpose variable font without touching
the weight axis or the "one variable file per family" architecture
CLAUDE.md deliberately chose.

This is a **one-time asset regeneration**, not an ongoing build step — run
it once, commit the smaller `.woff2` files, done. Tooling: `fonttools`
(`pip install "fonttools[woff]" brotli`), which ships `pyftsubset`.

Before picking a range, every `.html`/`.js` file in the repo was scanned for
non-ASCII characters actually in use, to ground the range in real content
instead of a generic guess (found: `§ © ° · ×` , the em/en dash + right
single quote + ellipsis, the three directional arrows, and the theme
toggle's ◐ — plus the Arabic block, which is irrelevant here since Arabic
always renders through Estedad, never these three fonts). The range below
is deliberately wider than that exact scan result — enough headroom for
names/punctuation a future case study might reasonably use — while still
excluding the scripts (Cyrillic, Greek, Vietnamese, etc.) driving most of
the original file size:

```bash
pyftsubset InterVariable.woff2 \
  --output-file=InterVariable.woff2 \
  --flavor=woff2 \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F,U+2000-206F,U+20A0-20CF,U+2190-21FF,U+25A0-25FF" \
  --layout-features='*' \
  --name-IDs='*' \
  --recalc-average-width
```

(Repeat per file — same `--unicodes` value for all three. Verify nothing
real dropped out before shipping: `TTFont(path).getBestCmap()` should still
contain every codepoint the repo scan found, per font. It's fine — expected,
even — if a couple of exotic ones like ◐ U+25D0 are still missing after
subsetting, *as long as they were already missing in the original,
un-subsetted file* — that just means the browser was already falling back
to a system font for that one character, and subsetting didn't change
anything there.)

### 3. Re-audit and iterate

Re-run Lighthouse on all six `work/*.html` pages plus `index.html` after
steps 1–2. If still short of 95:

- Reconsider whether `GeistMono-Variable.woff2` needs to be in the
  `<head>` preload list at all — check whether mono text (eyebrows, meta
  labels) is actually above the fold on each template, or whether it can
  load un-preloaded like the italic face used to.
- Stretch option, more invasive: `fonttools varLib.instancer` to pin each
  variable font to a narrower weight range than the full 100–900 (e.g.
  400–600 for Inter, since body text never goes bolder than that). This
  changes what the variable font *can* do, not just its file size, so
  confirm no current or planned use needs a weight outside the pinned
  range before doing this. Lower priority than 1–2; only pursue if needed.

## Acceptance criteria

- Lighthouse Performance ≥95 on all six `work/*.html` pages (mobile,
  default throttling) — matches the existing Accessibility/Best
  Practices/SEO scores already at 100.
- axe-core still zero violations (shouldn't be touched by this work, but
  re-check anyway).
- Visual check: the one `<em>` in blueprint-design-system.html and any
  live `.draft-note` render with the browser's synthetic italic and still
  look reasonable at body/small text size, in both themes.
- No change to the Arabic/Estedad path.

## Outcome (2026-08-17)

Font payload: `InterVariable.woff2` 352→120KB, `Commissioner-Variable.woff2`
268→116KB, `GeistMono-Variable.woff2` 72→40KB, `InterVariable-Italic.woff2`
388KB→gone. **~1.08MB of eager font weight down to ~276KB — a 74% cut.**
Verified lossless: `getBestCmap()` on every subset font contains every
character the repo-wide scan found, and the couple of pre-existing gaps
(◐ U+25D0 wasn't in any of the three fonts even before subsetting) are
unchanged from before — the site was already relying on system-font
fallback for those, same as now.

Lighthouse, mobile/default throttling, before → after:

| Page | Performance | FCP | LCP |
|---|---|---|---|
| blueprint-design-system | 69 → 84 | 3.4s → 1.4s | 7.3s → 3.1s |
| hub-accessibility | 65 → **95** | — → 1.4s | — → 2.8s |
| hub-migration | 70 → **96** | — → 1.3s | — → 2.8s |
| ai-design-to-code | 70 → **95** | — → 1.3s | — → 2.8s |
| ai-process-framework | 69 → 93 | — → 1.5s | — → 2.8s |
| incridea-2022-branding | 82 → **95** | — → 1.4s | — → 2.7s |

4 of 6 pages now meet or exceed the ≥95 target; `ai-process-framework` is
close (93). Accessibility/Best Practices/SEO stayed at 100 throughout, and
axe-core is still zero violations post-fix (re-verified, both resting and
with the lightbox open).

`blueprint-design-system` remains the furthest below target — but no longer
because of fonts. Its network waterfall now tops out with a 142KB
`brand-wipfli.svg`, bigger than any single font file post-fix. **This is a
separate, unrelated finding, not part of this plan**: while auditing I also
found `index.html` loads a 1.7MB `rolan-says-hello.gif` as its largest
resource by a wide margin (LCP 11.8s on that page) — worth its own look
(image weight / hero-asset strategy), but out of scope here and not
actioned.
