# Cleanup & optimization plan

Findings from a full-repo review on 2026-09-07, ranked by what they cost.
Read `docs/ARCHITECTURE.md` first — it says what each feature is and why it
exists. This file says what is wrong with it.

**Nothing below removes a feature.** Sections P0–P3 are fixes, deletions of
code that is already dead, or changes that preserve behaviour exactly.
Section E is the separate list of *additions* — things the site does not have
yet — kept apart so the cleanup work can be judged without them.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## What is already good (do not "fix" these)

Established by measurement, not by reading comments:

- **Token discipline is real.** 83 tokens (was 84; `--color-highlight-mark`
  was removed in phase 1 alongside its only consumers, see 1.7), 1 unused
  (`--space-10`, part of a
  deliberate scale — keep it). Two raw hex values in `styles.css`, both
  deliberate and documented in place. Zero `!important`.
- **RTL discipline is real.** Zero physical `margin-left`/`padding-right`/
  `left`/`right` in any layout rule. `dir="rtl"` renders correctly at 320px
  with no overflow.
- **Accessibility is real.** One `h1` per page, no skipped heading levels, no
  duplicate IDs, no missing `alt`, no `target="_blank"` without `noopener`,
  no `outline: none`, no touch target under 24px, zero contrast failures in
  either theme across all five mat swatches.
- **The comment density is a feature, not bloat.** This site is a work sample;
  a recruiter opening DevTools is the point. Do not strip comments to save
  bytes — gzip already handles most of it and the trade is bad.

---

## P0 — costs opportunities right now

### [x] 0.1 `og:image` points at a file that does not exist — *done 2026-09-07*
`index.html:12` pointed at `.../assets/portfolio-thumbnail.jpg`; the file is
at `assets/images/portfolio-thumbnail.jpg`. Fixed the one path segment.
Verified live: fetching the corrected `og:image` URL returns 200.

### [x] 0.2 Stale India phone number — *resolved by 0.7*
`writing/index.html:147` and `more-work.html:168` both listed
`+91 90195 36394` against a homepage that says `+971 56 232 6907` and "Already
based in the UAE". Both files are deleted by 0.6 and 0.7, so no edit is
needed. After those deletions the site carries exactly one phone number.

### [x] 0.3 The Writing section has no way in — *resolved by 0.7*
`more-work.html` and `writing/index.html` linked only to each other, so both
were unreachable from the homepage. Both are now deleted rather than linked.

### [x] 0.4 No Open Graph tags on the 6 case studies — *done 2026-09-07*
Added `rel="canonical"` plus a full Open Graph block (`og:image`, `og:title`,
`og:description`, `og:type`, `og:url`) to all 6 case studies. Title/
description text reused verbatim from each page's own `<title>`/meta
description — nothing newly written, so nothing to invent or get wrong.
`og:image` reuses the site-wide `portfolio-thumbnail.jpg` for now; **real,
distinct per-page cover images are E.2's job, deliberately deferred to phase
4** where it's paired with 2.2's asset re-export (the plan's own original
scheduling note — doing it here would mean exporting the same source assets
twice). `og:type` is `"article"` for case studies vs. `index.html`'s
`"website"`, the standard distinction.

Also closed the rest of 0.4's site-wide list:
- **`rel="canonical"` site-wide** — added to `index.html` (was missing
  entirely) and all 6 case studies; absolutized the two redirect stubs'
  existing relative canonicals (`about.html`, `contact.html`) to match.
- **`sitemap.xml`** — the homepage + 6 case studies, absolute URLs. The two
  redirect stubs are deliberately excluded: including them would contradict
  their own canonical tag, which already tells crawlers to index the
  homepage anchor instead.
- **`robots.txt`** — allow-all plus a `Sitemap:` directive.
- **`404.html`** — GitHub Pages serves this automatically for any unmatched
  path on a Project Pages site. Built with the full site header/nav/footer
  (a lost visitor needs to navigate, unlike `about.html`/`contact.html`
  which know exactly where the visitor meant to go), the 11-swatch surface
  picker matching every non-homepage page, `<meta name="robots"
  content="noindex">` (an error page has no correct URL to index), and
  GoatCounter (a 404 hit is data worth having, same reasoning as 0.5).
- **JSON-LD `Person`/`WebSite`** — added to `index.html` only. Built from
  facts already visible elsewhere on that same page (name, job title,
  email, LinkedIn/Behance/Instagram URLs) — nothing asserted to search
  engines that a person reading the page can't also see.

Verified: all 2 JSON-LD blocks parse as valid JSON with the right `@type`;
`sitemap.xml` parses as valid XML; every case study carries exactly 1
canonical and 5 `og:*` tags; live browser check on `index.html`, one case
study, and `404.html` (header/nav/theme-toggle/footer all functional,
`noindex` present, 11 swatches, analytics tag present, no console errors).

### [x] 0.5 Analytics only on `index.html` — *done 2026-09-07*
GoatCounter added to all 6 case studies (one, `speery-health.html`, has a
slightly different `<head>` structure — no font comment, per the finding
already on record in 1.3 — so it needed its own insertion point, not the
other five's). Also added to the new `404.html`, beyond this item's literal
"six case studies" scope: a 404 is a real page a visitor lands on and might
explore, the same rationale as the case studies, and it was being built
fresh in this same phase anyway. The two redirect stubs (`about.html`,
`contact.html`) still correctly get nothing — they 0-second-redirect before
a visitor ever sees them.

### [x] 0.6 Delete `more-work.html` — *done 2026-09-07*
The five case studies linked from the homepage are the intended set; the
"Range beyond enterprise UI" page is not wanted. Removal was fully contained —
verified by a repo-wide sweep before deleting, nothing else depended on it:

| What | Where |
|---|---|
| Delete the file | `more-work.html` |
| ~~Remove one nav link~~ | `writing/index.html:156` held the only inbound link. Moot — 0.7 deletes that file too. No surviving page links here. |
| Delete dead CSS | `css/styles.css:2513–2549` — the whole `/* ------ More Work grid ------ */` block (`.more-work-grid`, `.more-item-media`, `.more-item-body`, `.more-item-title`, `.more-item-desc`, `.more-item-link`). Used by no other page. |
| Delete 4 orphaned assets | `assets/images/placeholder-incridea.svg`, `-offsites.svg`, `-i3t-video.svg`, `-freelance-branding.svg` |
| Update doc references | `docs/CONTENT-GUIDE.md`, `docs/DESIGN-GUIDELINES.md` (the nav-panel page list, the breakpoint table's `.more-work-grid` row, and the `.cert-link` section's `.footer-links a` mention) |

Verified as **not** affected: no `data-i18n` key was used only by this page
(all 11 of its keys were shared nav/footer chrome), and `.more-item-link` was
already dead CSS before this decision.

**Found during implementation, out of the original scope table, fixed
anyway:** `.footer-grid`/`.footer-heading`/`.footer-links` (`css/styles.css`)
were also dead — the four-column footer they styled existed only on
`more-work.html` and `writing/index.html`, and every surviving page already
used the plain single-line colophon footer. Removed alongside the scoped
items since they're the same category of work and were found while grepping
for that footer's usage.

**Content dropped with the page, deliberately (Decision 3, 2026-09-07):** the
I3T all-hands video, the Wipfli internal offsites / Wipforia 2024, and the
2019–2022 freelance record. Rolan's call: none of the three can be *shown* —
the first two are NDA-constrained and the freelance work is graphic-design
output that does not read as UX evidence. Nothing is salvaged into About.
About's existing prose mention of freelancing stays as narrative background;
it never linked here, so no link breaks. Incridea, the fourth item, is already
a homepage case study and loses nothing.

### [x] 0.7 Delete `writing/` entirely — *done 2026-09-07*
All three planned articles restate a case study that already exists: *35 → 0*
is the Hub Platform Modernization accessibility work, and *The Design System
Is the AI's Instruction Manual* and *Directing an LLM to Build a Frontend* are
both the AI design-to-code study. A second telling adds nothing.

The state of the section makes this easier, not harder: **none of the three
articles is written.** `writing/index.html` publicly promises "Publishing over
the coming weeks", tags the three rows *Draft in progress · Not yet started ·
Not yet started*, and each article page says "This piece hasn't published yet"
over a `Placeholder — draft this second` note. Following that section today
costs a recruiter three clicks to reach three unwritten pages and an unkept
promise. Removing it is a net gain even before the duplication argument.

| What | Where |
|---|---|
| Delete 4 pages | `writing/index.html`, `writing/35-violations-to-zero.html`, `writing/design-system-ai-instruction-manual.html`, `writing/directing-an-llm-to-build-a-frontend.html` |
| Delete 2 internal drafts | `writing/blueprint-ds-case-study-working-draft.md`, `writing/portfolio-template-structure-copy.md` — 66KB of working notes currently served publicly. Also closes half of item 3.2. |
| Delete dead CSS | `css/styles.css` — the whole `/* ------ Writing list ------ */` block |
| Drop `.writing-item` from two selectors | The shared card-contract group (`.case-stat`, `.compare-col`, `.status-callout` keep the rule), and a second, easy-to-miss copy inside the `@media (forced-colors: active)` block — found only by grepping the class name after the first removal |
| Simplify one selector | `.tag,` dropped from the `.tag, .cert-status` group — `.tag` had no other user; `.cert-status` keeps the rule, with its comment rewritten (it used to explain a two-user component, now a one-user one) |
| Remove 6 `STRINGS` entries | `footer.contact`, `footer.explore`, `footer.elsewhere` × en / ar. Corrected count: `en-simple` never had these three keys — they were already in that mode's 33-key fallback-to-English list, so only 2 languages × 3 keys existed to remove, not 3 |

Verified as **not** affected: `.draft-note` (still used by
`work/ai-process-framework.html`), `.is-liftable` (still used by
`index.html`), and every asset — no image becomes orphaned.

**Found during implementation, out of the original scope table, fixed
anyway:** three stale comments that named `.tag`, "the Writing index," or
`.more-item-media` as if they still existed — one in the `.tag-pill` comment
block, one in the `.cert-link` comment block (which also cited the
now-deleted `.footer-links a`), and one in the `.work-card-media img`
comment. Also `.footer-grid`/`.footer-heading`/`.footer-links` themselves —
see the note under 0.6, since that CSS died from `more-work.html`'s removal
as much as `writing/`'s.

**Knock-on:** `work/ai-process-framework.html` loses one of its two inbound
links. The contextual link from inside `work/hub-modernization.html` survives
and remains its route in — see Decision 2.

---

## P1 — correctness and consistency

### [x] 1.1 The surface picker is a different component on the homepage — *done 2026-09-08*
`index.html` shipped **5** swatches (Green, Red `#7a1f1f`, Purple, Black,
Blue) with a `.surface-picker-hint` label and `title` attributes; the other
6 pages shipped **11** (Green, Charcoal, Navy, Rust, Plum, Teal, Ink blue,
Graphite, Slate, Olive, Smoke) with neither.

**Which one to standardise on wasn't arbitrary** — checked `MAT_ACCENT_TABLE`
directly: its keys are exactly the 11-swatch set. `#7a1f1f` (homepage's Red)
has no entry there at all and was falling through to the live solver every
time. So the 11-swatch set was already the "real," fully-covered one; the
homepage's 5 were the outlier. Standardised every page on 11 swatches + the
hint + `title` attributes (the hint and titles are cheap, sighted-user
affordances worth having everywhere, not just where they happened to survive).

Verified live: all 8 pages report `11` swatches with matching labels in the
same order; clicking a previously-table-only swatch (e.g. Ink blue) on
`index.html` now resolves through `MAT_ACCENT_TABLE` with no live-solve
fallback, confirmed by checking the resulting `--color-accent` matches the
pre-solved value exactly.

### [x] 1.2 17 transitions are not gated on `prefers-reduced-motion` — *done 2026-09-07*
CLAUDE.md rule 1 says every animation is wrapped in a motion query. 17 were
not. Fixed with one block, not 17 edits — every transition/animation in the
file already routed through `--duration-fast` / `--duration-base` /
`--duration-reveal` (re-verified before applying), so collapsing the tokens
themselves is the single site-wide switch:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 1ms;
    --duration-base: 1ms;
    --duration-reveal: 1ms;
  }
}
```

Added to the existing global reduced-motion block in `css/styles.css`
(`html { scroll-behavior: auto; }`) rather than a new media query. 1ms, not
0s — the sticky-note tip's `allow-discrete` transition on `display` needs a
non-zero duration to run at all; 0s can make the browser skip the discrete
step and never show the element. No `!important`, no per-rule churn, and it
stays correct for transitions added later.

### [x] 1.3 The font comment in 6 `<head>`s is wrong — *done 2026-09-07*
Every page said *"Estedad (RTL — headings, buttons, and body)"*. Not a typo:
`docs/FONT-LOADING-PERF-PLAN.md` and `css/tokens.css`'s own comments confirm
Estedad was a real font this site shipped at one point, later swapped for
El Messiri + Harmattan — the per-page comment just never got updated after
that swap, and Estedad is not in `assets/fonts/` today. Corrected count: 6
pages had the stale comment, not 7 — the estimate was made before phase 0
deleted the `writing/*` pages, which also carried it. Fixed in `index.html`
and all 6 case studies' `<head>`, now listing all 6 real font families
(Inter, Commissioner, Geist Mono, El Messiri, Harmattan, Caveat) and noting
only the first three are preloaded.

**Found by the same "check for this drift" instruction, in a file item 1.3
didn't name — fixed anyway:** `docs/ACCESSIBILITY-RTL-CHECKLIST.md`'s own RTL
section told a tester to verify "Arabic strings render in Estedad" — an
active QA checklist pointing at a font that no longer loads is worse than a
stale comment, since it would pass a reviewer checking the wrong thing.
Fixed to El Messiri/Harmattan. Same pass also caught two more drifts in that
file: "footer columns" (the four-column footer it referred to no longer
exists anywhere, per 0.6/0.7) and "+91/+971 phone numbers" (the +91 number
left the codebase with `writing/index.html`, per 0.2) — both corrected.

Also fixed the second half of the finding: `CLAUDE.md`'s font list named 5
families, omitting Caveat (sticky-note handwriting) — added it.
`docs/DESIGN-GUIDELINES.md` and `README.md` were checked as instructed and
did not have this specific drift, but checking `DESIGN-GUIDELINES.md`
surfaced a bigger, separate one — see the new finding below.

**Found while checking `DESIGN-GUIDELINES.md` for this exact drift, NOT
fixed — needs its own pass:** §4's typography table is stale against the
actual CSS. It says headings render in "InterVariable" — ground truth
(`--font-heading` in `tokens.css`, applied via `h1..h6` in `styles.css`) is
Commissioner, with Inter only as the CSS fallback. It also says eyebrows/
meta/code use "IBM Plex Mono" — ground truth (`--font-mono`) is Geist Mono;
IBM Plex Mono isn't in the repo at all. This wasn't a quick fix-in-passing
like the Estedad correction: it needs a full row-by-row re-verification of
§4 against the CSS (weights, `font-feature-settings`, letter-spacing per
row), not a rushed one-line swap that risks introducing a second wrong
answer. Left flagged, not touched.

**Also found, not fixed — a real gap, not just a doc error:** `assets/fonts/`
has an `OFL-*.txt` licence file for every font except Caveat. Caveat is a
Google Fonts SIL OFL font like El Messiri and Harmattan, which do have their
licence files. Not fixed here because writing licence text needs verified
accuracy (the correct copyright line), not a guess — flag for whoever adds
it to source and copy the real `OFL.txt` from Caveat's Google Fonts package.

### [x] 1.4 `Caveat-Variable.woff2` is unsubsetted and unpreloaded — *done 2026-09-07*
Character subsetting alone (the same command, same `--unicodes` range used
for Inter/Commissioner/GeistMono) barely moved this one: 75KB → 73KB. Checked
why before accepting that result: Caveat's `cmap` only ever covered 226
codepoints to begin with — nowhere near the multi-script bloat that made
subsetting work so well on the other three — so there wasn't much character
coverage left to cut. The estimated "~75KB → ~25KB" in this item's original
text assumed the same lever would work the same way twice; it doesn't, and
the number was corrected rather than forced.

The actual bulk turned out to be the variable-font weight axis (`fvar`/`gvar`,
400–700), and the site only ever renders Caveat at one weight: grepped every
rule reachable from `.sticky-note` (the only place `--font-hand` is used) and
confirmed no `font-weight` override exists anywhere in that chain, so it's
always the inherited/default 400. Applied `fonttools varLib.instancer` to
pin `wght=400` as a true static instance (not just a narrower variable
range) — safe specifically *because* no second weight is ever requested —
then ran the same character subset on top. **75KB → 47KB (37%).**

Verified before shipping: `getBestCmap()` on the final file still contains
every character actually used inside `.sticky-note` content, scanned across
every page the same way the original font-perf pass scanned the repo (found:
`·` U+00B7 and `→` U+2192, both inside range); no fewer glyphs than needed,
`fvar` table confirmed gone. Rendered original vs. subsetted side-by-side at
28px in a real `@font-face` — pixel-identical.

Added to the preload block (and the font-comment fix from 1.3) on all 8
pages that load Caveat: `index.html`, `404.html`, all 6 case studies. Also
closed a leftover inconsistency while touching this block: `speery-health.html`
was the one page missing the font-explainer comment entirely (noted in 1.3,
not fixed there) — added now since this item required editing that exact
block anyway.

### [x] 1.5 Six images on `index.html` have no `width`/`height` — *done 2026-09-07*
`assets/rolan-icon.png` (80×80) and the five `.work-card-media` covers
(1200×600 / 1106×909 / 1200×600 / 1200×600 / 1200×846 — read from each
file's own intrinsic size, not guessed) now carry explicit `width`/`height`.
Verified live: attributes match actual file dimensions, images still render
correctly at their CSS-controlled display size in both card and logo
contexts.

### [x] 1.6 Arabic mode leaves three contact labels in English — *done 2026-09-07*
`contact.linkedin`, `contact.behance`, `contact.instagram` had no `ar` entry.
Took the plan's second option: dropped the `data-i18n` attribute from all
three (`index.html` only — the sole page with a contact section) and removed
the now-unused `en` keys from `STRINGS` (they were never in `ar` or
`en-simple` to begin with). A one-line comment in the markup records this is
deliberate — brand names aren't translated, same reasoning `en-simple`
already applies to nav labels. Verified live in Arabic mode: EMAIL/PHONE/
RESUME render in Arabic, LINKEDIN/BEHANCE/INSTAGRAM stay English, exactly as
before but now a documented choice instead of a silent gap.

### [x] 1.7 Small markup contradictions — *mostly done 2026-09-07*
- [x] `.work-card-media` `alt=""` on all 5 images — done, verified live.
- [x] The two identical-`data-description` a11y stickers — **not a defect,
  resolved 2026-09-08.** Rolan's call: both stickers (the a11y icon and the
  a11y logotype) stay, deliberately sharing the same copy, as two separate
  stickers on the board. No further action, no further flag.
- [x] `work.incridea.status` — dead key in all 3 `STRINGS` dicts, referenced
  by no page (confirmed: the Incridea work card has no status element at
  all — this was orphaned content, not a wired feature with one line
  missing). Removed from en/en-simple/ar.
- [x] 3 of the 4 dead CSS classes — `.concept-design`/`.concept-engineering`
  (fully unused, deleted with their comment block) and `.highlight-card`
  (dropped from the one place it appeared, the `forced-colors` selector
  list — the explanatory comment nearby, "moved to .sticky-note", was
  accurate history and left alone). `.more-item-link` was already removed
  in phase 0 (it was `more-work.html`'s CSS).
- [ ] `.cert-link` — deliberately not touched. It's unused only because no
  certification has a credential URL yet (Decision 5, still open with
  Rolan). Once URLs land, this is used, not dead.
- 15 `PLACEHOLDER` comments remain — expected; each marks content only
  Rolan can supply (credential URLs, a CV file, etc.), not a defect.

**Found while fixing 1.7, out of its scope table, fixed anyway (same
mechanical-cleanup category):** deleting `.concept-design`/`.concept-engineering`
left `--color-highlight-mark` (both theme blocks in `tokens.css`) with zero
remaining consumers — removed. Also caught and fixed a self-inflicted bug
during that same edit: removing the rule between two CSS comments left the
first comment's `/*` with no closing `*/` (the block it was explaining was
gone, so its own closer went with it) — verified with a proper single-pass
open/close scanner (a raw `/*`-vs-`*/` character count is not reliable here,
since prose like "work/*.html" contains a literal `/*` substring) that no
comment is unclosed anywhere in the file after the fix.

### [ ] 1.8 `DESIGN-GUIDELINES.md` §4's typography table names the wrong fonts
Found while checking this file for item 1.3's font-comment drift, not fixed
— it's bigger than that one-line fix and deserves its own verified pass.

The table says headings render in "InterVariable" (weight 600, with a
`font-feature-settings` alt-character-set claim) and that eyebrows/meta/code
use "IBM Plex Mono". Neither matches the CSS. Verified ground truth:
`--font-heading` (`tokens.css`) is `"Commissioner", var(--font-sans)` —
Inter is only the fallback in that chain, not the actual heading font — and
`h1`–`h6` in `styles.css` do apply `var(--font-heading)`. `--font-mono` is
`"Geist Mono", ui-monospace, "SF Mono", monospace` — IBM Plex Mono does not
exist anywhere in this repo.

The `font-feature-settings: var(--font-feature-alt)` and `font-weight: 600`
claims on the heading row DID check out against the live `h2..h6` rule — only
the family name is wrong, not the whole row. That partial accuracy is exactly
why this needs a careful line-by-line pass rather than a rewrite: getting the
family right while accidentally breaking a correct weight/feature claim would
be a net loss.

**Fix, when picked up:** re-verify every row of the §4 table (family, weight,
letter-spacing, `font-feature-settings`) against the actual CSS rule for that
role, not just the two rows this pass happened to catch.

### [ ] 1.9 `Caveat` ships with no `OFL-Caveat.txt` licence file
Found alongside 1.3/1.8 while auditing the font list. Every other font in
`assets/fonts/` — including Caveat's fellow Google Fonts entries, El Messiri
and Harmattan — ships its own `OFL-*.txt`. Caveat (Google Fonts, SIL OFL) has
none. Not fixed here: writing licence text from memory risks getting the
copyright line wrong, which matters for a legal file in a way it doesn't for
prose. Whoever next touches `assets/fonts/` should pull the real `OFL.txt`
from Caveat's Google Fonts package rather than reconstruct it.

---

## P2 — weight

Current cost of a case-study page, gzipped, before any image loads: **505KB**.

### [x] 2.1 Delete 5.1MB of deployed, unreferenced assets — *done 2026-09-07*
Re-verified each of the 12 files below against the current tree (not the
original scan, which predates phases 0–2) before deleting any of them —
confirmed still genuinely unreferenced, not by name substring (`favicon.svg`
naively matches inside `rolan-favicon-svg.svg`; checked the exact path, not
the string). All 12 deleted:

| Size | File |
|---|---|
| 1909KB | `assets/images/rolan-write-2.gif` |
| 1611KB | `assets/images/rolan-write-1.gif` |
| 528KB | `assets/images/cutting-mat-50.8x28.57.png` |
| 513KB | `assets/images/cutting-mat-50.8x28.57 (1).png` |
| 499KB | `assets/images/cutting-mat-50.8x28.57 (2).png` |
| 83KB | `assets/images/button-bds.png` |
| 54KB | `assets/images/mat-green.webp` |
| 38KB | `assets/images/mat-black.webp` |
| ~4KB | 7 × `placeholder-*.svg` (3 already orphaned; 4 more from 0.6), `assets/favicon.svg` |

Kept the four `OFL-*.txt` licence files — a licence condition, not dead
weight. `portfolio-thumbnail.jpg` is untouched and correctly live now — bug
0.1 (phase 1) already fixed the path that made it look unreferenced.

Separately, the working tree carries **~40MB of untracked Incridea images**
(`assets/images/incridea/*.png|jpg`, several over 4MB each) that are not wired
into the case study. **Resolved by Decision 6:** only the 4 already-linked
images ever get committed; the other 13 stay local, enforced by a
`.gitignore` rule scoped to that one directory.

### [x] 2.2 Seven large image files, two different real problems — *done 2026-09-08*
The premise needed correcting before fixing anything: **only 3 of these 7
files actually contain `<image href="data:...;base64,...">`.** Checked with
a regex scan for the actual embedded-image tag, not just file size —
`typography-bds.svg`, `shadow-bds.svg`, `spacing.svg`, and `color-bds.svg`
have zero base64 content. They're large because they're genuinely detailed
vector diagrams (a lot of real `<path>`/text data), not raster in disguise.
Rasterizing those four would have been the wrong fix — it would have thrown
away vector scalability to solve a problem they don't have.

**The 3 genuine base64-in-SVG files**, rasterized to WebP at the exact
dimensions they're displayed at (not guessed — read from each page's own
`width`/`height` attributes) using `sharp` (chosen over a browser
canvas-roundtrip after that path proved unnecessarily expensive):

| File | Before | After | Cut |
|---|---|---|---|
| `speery-image.svg` → `.webp` | 1471KB | 15.7KB | 99% |
| `bds-tile.svg` → `.webp` | 845KB | 33.3KB | 96% |
| `tools/Github Copilot.svg` → `.webp` | 599KB | 7.8KB | 99% |

The extreme ratios are real, not a rendering failure — verified two ways: a
pixel-diff against the original at 300×300/40×40 sampling (avg channel
diff 2.7–7.2 out of 255, consistent with normal lossy WebP variance, not
corruption) and a visual side-by-side. The source PNGs embedded inside these
SVGs were 2–8× the resolution ever displayed (one was 4096×2465 shown at
1200×600), on top of raw base64 paying its own 33% encoding tax — both
problems compound, which is why re-encoding at the correct size did so much.

**The 4 genuine vector files** got the favicon's fix (2.3) instead —
`svgo --precision=1` — since that's what their actual problem is:

| File | Before | After | Cut |
|---|---|---|---|
| `typography-bds.svg` | 1094KB | 227KB | 79% |
| `spacing.svg` | 1024KB | 150KB | 85% |
| `shadow-bds.svg` | 1050KB | 184KB | 82% |
| `color-bds.svg` | 985KB | 174KB | 82% |

Verified with the same pixel-diff method (avg diff 0.24–0.43 out of 255 at
300×300) plus a full-resolution visual check of the most detail-sensitive
one (the typography spec sheet) — every label, table row, and type sample
still legible and correctly positioned.

**Total: 7.07MB → 0.79MB (89%)** across all 7 files combined. Updated the 3
webp references in `index.html`; the 4 vector files kept their exact paths
(pure re-encode, no rename needed) so `work/blueprint-design-system.html`
needed no changes. Verified live: all 7 new files return 200, console clean,
homepage work cards and the Blueprint case study's diagrams render
correctly.

### [x] 2.3 The favicon is 124KB — *done 2026-09-07, target revised*
Optimised with `svgo` (path-precision reduction — the file's actual bloat,
verified by inspection: an auto-traced illustration with far more decimal
precision than a 16–32px render can show). Tested three precision levels
side-by-side before picking one, since this lever has a real failure mode
here, not just diminishing returns:

| Precision | Size | Visual result |
|---|---|---|
| default (3) | 33KB | fine, but not the biggest win available |
| 1 | 18KB | **pixel-identical to the original at both 128px and 16px** |
| 0 | 3.1KB | integer-rounded coordinates destroy the illustration — unrecognisable blob, confirmed by rendering it |

Shipped precision=1: **124KB → 18KB (85%)**. The item's original "1–3KB"
target was precision=0 — verified visually broken, not used. 85% with zero
visual regression beats hitting an arbitrary byte target by breaking the
icon.

### [x] 2.4 `tokens.css` is 82KB, 49KB of it two mat images — *done 2026-09-07*
Extracted both data URIs verbatim (byte-for-byte, via URL-decode — not
regenerated) to `assets/mat-light.svg` and `assets/mat-dark.svg`, replaced
each `--mat-image` value with `url("../assets/mat-light.svg")` /
`url("../assets/mat-dark.svg")`. Confirmed before extracting, not assumed:
neither file contains a `var(--...)` reference — both `color-mix()` calls
already carry literal hex colours — so they resolve identically as external
files with no dependency on the CSS that used to inline them.

**`tokens.css`: 82KB → 31.7KB.** Verified live: both files serve at 200,
`--mat-image` correctly resolves to the light or dark file per theme, the
reset button correctly falls back to the external reference (not a stale
inline value), and `js/main.js`'s live custom-mat-colour generator — a
completely separate code path that writes its own inline data URI when a
visitor picks a custom colour — is unaffected, confirmed by picking a swatch
and checking `--mat-image` switches to a fresh inline value as before.

### [x] 2.5 `main.js` ships 208KB of translations to every page — *done 2026-09-08*
`STRINGS` was 208KB of `main.js`'s 285KB raw. `work/incridea-2022-branding.html`
uses **7** of the 208 keys and was downloading all three languages of every
case study's full prose regardless.

Actual shared-chrome set turned out smaller than estimated — 9 keys, not
~35 (`brand.name`, `nav.work/about/contact/toggle`, `toggle.theme`,
`lightbox.expand/close`, `footer.colophon`), found by cross-referencing
every page's actual `data-i18n` usage rather than guessing from the
category names in the original estimate. Split into `js/strings.js`
(`window.CASE_STRINGS`, 191 EN / 176 simple / 193 AR keys — the "content"
side: `hero.*`, `about.*`, `skills.*`, `contact.*`, `certs.*`,
`highlight.*`, `work.*`, `case.*`, `meta.*`), loaded with `defer` **before**
`js/main.js` (defer preserves document order, so it's guaranteed to run
first) only on the 5 pages that need it — `index`, `blueprint-design-system`,
`ai-design-to-code`, `hub-modernization`, `speery-health`. `main.js` merges
`window.CASE_STRINGS` into its own chrome-only `STRINGS` at init if present;
absent entirely, `STRINGS` just stays chrome-only, which is exactly what
`ai-process-framework`, `incridea-2022-branding`, and `404.html` need (none
of them use `data-i18n` for body content either).

**A mechanical bug caught before it shipped:** the first cut of the split
script flattened the three `en`/`en-simple`/`ar` objects into one (each
language's wrapper `{`/`}` got sliced away along with its content, and
`node --check` still passed — duplicate keys in one flat object are
syntactically legal JS, just semantically wrong). Caught by inspecting the
actual object structure, not trusting the syntax check alone; rebuilt with
the three objects properly nested.

Also fixed, found while rewriting this exact code: the section comment
above `STRINGS` named only 3 of the 4 fully-translated case studies (missing
`ai-design-to-code.html`/the AI-Directed Frontend POC) — a pre-existing
drift from `docs/CONTENT-GUIDE.md`, which had it right. Corrected, and
extended to document the new file split.

**`main.js`: 285KB → 78.6KB raw (25KB gzipped) for the 4 pages that don't
load `strings.js`** (`ai-process-framework`, `incridea-2022-branding`,
`404`, plus `about`/`contact` which load neither script). The 5 pages that
need the content pay about the same combined total as before (78.6KB +
206.6KB ≈ the original 285KB) — nothing was duplicated or bloated in the
split.

Verified live: `window.CASE_STRINGS` is `true` on the 5 content pages and
`undefined` on the other 3; all three language modes (en/en-simple/ar)
render correctly on both `index.html` and a case study; chrome-only pages
still render their nav/footer/toggle correctly with no console errors.

### [x] 2.6 The workflow deploys the whole repo — *done 2026-09-08*
`static.yml` uploaded `.` unfiltered, so `CLAUDE.md`, `docs/`, `.impeccable/`,
and `.claude-crawl/` were all publicly served. (The two `writing/*.md`
working drafts were the worst of it; 0.7 already removed those files.)

**Worse than the plan named:** `path: '.'` also uploaded `.git` itself.
GitHub Pages does not block dotfiles/dot-directories from being served —
unlike the internal docs (readable but not sensitive), a public `.git`
directory means the full commit history and objects are directly fetchable
at a guessable URL. No secrets were ever committed this session, but the
exposure mechanism itself was worth fixing regardless of what happened to
be in the history.

**Fix:** added a "Stage deployable files" step between checkout and upload
that `rsync`s everything except `.git`, `.github`, `.claude`,
`.claude-crawl`, `.impeccable`, `CLAUDE.md`, and `docs/` into a `_site/`
directory, then points `upload-pages-artifact` at that directory instead of
`.`. Still zero build step for local dev — the filtering is a CI-only step
on a throwaway checkout, not a toolchain the site or a contributor ever
needs to run.

Verified: the YAML parses correctly and the step order is right (checkout →
stage → upload → deploy). **Not verified by an actual deploy** — this repo
has no way to dry-run a GitHub Pages publish from here; the real test is
the next push to `main`.

---

## P3 — maintainability

### [x] 3.1 ~90 lines of chrome are copy-pasted into 7 pages — *done 2026-09-08*
The pre-paint head script, the header (nav, mode select, mobile controls all
nested inside it), the footer, and the surface picker are duplicated
verbatim. Changing one nav item was 7 edits, and this had **already** caused
real divergence — checked by diffing every page's actual blocks against
each other before deciding anything, and found two genuine instances, not
hypothetical ones:

- **`work/incridea-2022-branding.html`'s header was missing the mobile nav
  entirely** — no `.nav-toggle` button, no `.site-nav-panel` wrapper. Below
  64em this page had no way to reach the hamburger menu at all: `nav`,
  `mode-select`, and `mobile-controls` sat directly in the header, unwrapped.
  Fixed by replacing its header with the verified-correct structure from
  another case study. Verified live at mobile width: the hamburger now
  opens a working panel with nav links, language switch, and theme toggle —
  none of which existed before.
- **`work/speery-health.html`'s head script was missing a 4-line comment**
  present in every other page's copy — cosmetic only, no functional
  difference, but confirms the drift risk was real, not theoretical.

Of the three ways out the plan considered, went with the one it ranked
lowest-effort rather than its top recommendation, for a reason specific to
this codebase: a full auto-rewrite sync script (treating one page as
canonical and rewriting the rest) needs real template logic here, not just
path-prefix substitution — `index.html` and `404.html` legitimately use a
different site-logo (a self-link with the face icon) than the six case
studies (a back-arrow), so a blind rewrite would have clobbered that
intentional difference. Building a template engine to work around one
special case felt like solving a problem bigger than the one that exists.

**Built `tools/check-chrome.py` instead** — the plan's own "lazier interim"
option. Diffs the head-script, header, footer, and surface-picker blocks
across all 8 pages (path-prefix differences between root-level pages and
`work/*.html` normalized before comparing, so those don't register as false
drift), correctly excluding `index.html`/`404.html`'s header from the
header comparison (their logo difference is by design, not drift) while
still checking their footer/surface-picker/head-script match everyone
else's. Run by hand before committing a chrome change; reports drift and
exits non-zero, doesn't rewrite anything.

**Verified the checker actually works, not just that it runs:** deliberately
reintroduced a one-word difference in a live file, confirmed it failed with
the exact page and block named, then restored the file and confirmed it
passed again — caught a copy-paste error in that restore step itself
(a failed `cp` left the test change in place silently) and fixed it before
moving on, rather than assuming the revert succeeded.

### [x] 3.2 `main.js` section numbering has holes — *done 2026-09-08*
§5 and §7 were removed and never re-flowed. Took the note option, not the
renumber: the section numbers are cross-referenced by comments throughout
`main.js` itself and in `ARCHITECTURE.md`/`DESIGN-GUIDELINES.md` (e.g. "see
main.js section 4b", "§3c") — renumbering would mean finding and updating
every one of those across three files for a cosmetic fix, versus one
sentence that removes the confusion at the point a reader actually hits it.
Added to the top of `main.js`, right in the file's own opening comment
rather than only in `ARCHITECTURE.md` (which already explained this, but
not to someone reading the source directly first).

### [x] 3.3 Rename `brand-wipfli.svg` — *done 2026-09-07, see Decision 4*
The policy is now set: every case study stays anonymised ("a top-20 US
accounting and consulting firm") **except** Hub Platform Modernization, which
may name Wipfli. Checked against every case study's actual text — not just
the obvious candidate — and the prose was already compliant:
`blueprint-design-system.html`, `ai-design-to-code.html` and
`ai-process-framework.html` all already say "the firm", never "Wipfli", in
their body copy. `hub-modernization.html` names no firm at all today, which
is also compliant with the policy (permitted to name Wipfli, not required to).

The one real leak is a filename, not prose: `work/blueprint-design-system.html:161`
loads `assets/images/brand-wipfli.svg`. Blueprint is one of the pages the
policy says must **not** name Wipfli, and a filename is not private — it is
visible in the page's rendered HTML, in DevTools' Network tab, and to anyone
who saves the image. For a site whose stated audience opens DevTools
(CLAUDE.md), this is the one identifying detail that survived the text pass.

Renamed to `brand-guidelines-existing.svg` (matching its own alt text,
"Existing Brand Guidelines") and updated the one `src` reference in
`work/blueprint-design-system.html`. Also updated the one other place the old
filename was mentioned in prose — a historical measurement note in
`docs/FONT-LOADING-PERF-PLAN.md` that named the file by its old name — so it
still points at something that exists. Verified: no remaining reference to
`brand-wipfli` anywhere in the repo (grepped `.html`/`.md`/`.css`/`.js`), and
the renamed file loads.

### [ ] 3.4 Open item inherited from the previous review — *blocked, see Decision 7*
`.impeccable/critique/fix-plan.md` item 7 (eyebrow density on the homepage)
is still `[~]` awaiting sign-off. Found while reviewing what's left after
phase 6: this item was never assigned to a phase in the sequence table and
had no Decision number, unlike every other item that needs Rolan's input
(0.2/E.5/Decision 5, item 3.4/Decision 7 now) — a gap in this plan's own
bookkeeping, not a sign the item was resolved. Given a Decision number now
so it doesn't stay invisible; see Decision 7 for the actual question.

---

## Decisions — answered and open

Decisions 1, 2, 3, 4 and 6 were answered by Rolan on 2026-09-07 and are
folded into items 0.6, 0.7, 3.3 and 2.1 above. They are kept here with their
reasoning so a later reader can see why five pages left the site and two
naming/asset policies were set. **Decisions 5 and 7 are still open** —
5 waiting on the credential URLs, 7 inherited from a prior review and still
open there too. Neither blocks a scheduled phase.

### Decision 1 — Does `writing/` survive? — **ANSWERED: delete** (2026-09-07)
All three planned articles restate a case study that already exists: *35 → 0*
is the Hub Platform Modernization accessibility work; *The Design System Is
the AI's Instruction Manual* and *Directing an LLM to Build a Frontend* are
both the AI design-to-code study. Telling the same story twice does not make
it more credible.

*A correction to this document's earlier recommendation:* it argued for
keeping the section on the grounds that the articles were "the written
evidence behind the claims the case studies make". That was wrong on the
facts. Checking the pages: none of the three is written. The index tags them
*Draft in progress · Not yet started · Not yet started* and each article page
carries a `Placeholder — draft this second` note. There was no written
evidence to keep — only an unkept public promise to publish. See 0.7.

### Decision 2 — Does `work/ai-process-framework.html` stay? — **ANSWERED: keep** (2026-09-07)
Kept as the sixth case study. After 0.7 it is reached solely from the
contextual mid-prose link inside `work/hub-modernization.html`, which is a
legitimate route — "five case studies on the homepage" and "six case studies
exist" are not in conflict.

*One thing to watch:* a single inbound link is thin. If analytics (0.5) later
show the page gets no traffic while the Hub study does, the cheap fix is a
sixth homepage work card, not a rewrite. Worth revisiting once there is data —
not worth acting on now.

### Decision 3 — Do the three unique `more-work.html` achievements go? — **ANSWERED: drop all three** (2026-09-07)
Rolan's reasoning: the I3T video and the Wipfli offsites are NDA-constrained
with nothing showable, and the 2019–2022 freelance work is graphic-design
output that does not read as evidence in a UX context. Nothing is salvaged
into About; the existing prose mention of freelancing stands on its own as
narrative background. The portfolio narrows to enterprise UX, design systems
and AI-directed delivery — a coherent position rather than a thinner one.

### Decision 4 — One anonymisation policy — **ANSWERED** (2026-09-07)
**Policy: every case study stays anonymised ("a top-20 US accounting and
consulting firm") except Hub Platform Modernization, which may name Wipfli.**
Reason given: the other engagements are not public works; Hub is.

Checked against the actual text of every case study, not assumed: the prose
in `blueprint-design-system.html`, `ai-design-to-code.html` and
`ai-process-framework.html` was already compliant — all three already say
"the firm", never "Wipfli". `hub-modernization.html` currently names no firm
at all, which is also compliant (permitted to name Wipfli, not required to —
no content is being added on spec). The one actual violation was a filename:
`brand-wipfli.svg`, loaded only by `blueprint-design-system.html`, one of the
pages required to stay anonymous. Filenames are visible in DevTools' Network
tab and page source — exactly where CLAUDE.md says this site's audience
looks — so it counts as naming Wipfli even though no visible text does. Fixed
as item 3.3: rename the file, update the one reference.

### Decision 5 — The six certification credential URLs — *open, item E.5*
**Update (2026-09-07):** Rolan will attach or update the certifications soon.
Item E.5 stays open until the URLs arrive — no other action needed now.

**Update (2026-09-08):** scope grew — this isn't just missing URLs anymore.
Several of the six listed certifications need to be reviewed and updated;
Rolan will do that review separately, on his own schedule. Noted here as an
observation, not turned into a new tracked item, since the review itself
(which certs stay, which change, what's current) is content work only
Rolan can do — there's nothing for this plan to schedule until that review
lands. E.5 and `.cert-link` stay blocked on it exactly as before.

### Decision 6 — The 40MB of untracked Incridea images — **ANSWERED** (2026-09-07)
**Policy: only images already linked into a page get committed. Everything
else in `assets/images/incridea/` stays local — never pushed to GitHub.**

This resolves item 2.1's "decide per file" question by removing the need for
a per-file call: no re-export, no case-study rewrite, no judgment about which
of the 17 look like case-study material versus personal records. The 4
already-referenced Incridea images (`inc-tile.webp` plus the ones inside
`work/incridea-2022-branding.html`) are unaffected and stay exactly as they
are; the other 13 (certificate scans, t-shirt photos, social carousels, most
4–5MB PNGs) are excluded from every future commit.

**Done 2026-09-08, see item 1a.** The repo's first `.gitignore`, scoped to
this one directory with the real linked filenames (the case-study work this
note anticipated waiting on had already landed by the time this was
implemented — 14 real `.webp` files, all already tracked). Verified with
`git check-ignore` and a clean `git status` on the directory.

### Decision 7 — Homepage eyebrow density — *open, item 3.4*
Inherited from `.impeccable/critique/fix-plan.md` (a previous review, not
this one), and still open there too — this plan didn't create the question,
it's just recording it so it stays visible instead of falling through the
gap between two separate review documents.

The finding: 5 of `index.html`'s 7 sections carry a mono-font eyebrow
(WORKS, About, Tools & skills, Certifications, Contact) — denser than the
generic "roughly 1 in 3 sections" guidance the original critique measured
against. CLAUDE.md names mono eyebrows as a deliberate site signature, so
removing the pattern entirely was already ruled out before this plan
existed. The specific trade on the table: drop the eyebrow from 1–2 of the
shorter, self-evident sections (About and Contact are the candidates
named — arguably clear without a kicker) to bring density down without
abandoning the signature.

*No recommendation from this pass either* — it's a branding/voice call
about the site's own signature element, not a mechanical bug, and the prior
review was explicit that it needs sign-off before touching, not a silent
fix. Answering it resolves both 3.4 here and item 7 in `fix-plan.md`.

---

## E — enhancements (additions, not fixes)

Everything above restores something that is broken or removes something that
is dead. This section is the opposite: things the site does not have, that the
code is already shaped to support cheaply. Each one is optional — listed with
what it costs, so it can be declined on the merits.

### [x] E.1 Prev/next navigation between case studies — *done 2026-09-08*
Six case studies and no way to move from one to the next without going back to
the homepage. A recruiter who finishes Blueprint has to
navigate backwards to find the AI design-to-code study that continues the same
story. Two links in the case-study footer; the pages already share a footer
template, so this lands once (see 3.1) rather than six times. Also the cheapest
place to surface `ai-process-framework`, which after 0.7 has one inbound link.
**Cost:** ~20 lines of markup. **Risk:** none.

**Correction, not an implementation:** this was already fully built before
this cleanup project started — `git show` on the pre-session commit shows
every case study already carrying a `<nav class="case-nav" aria-label="Case
study navigation">` with working prev/next links. The original audit that
produced this item missed that it existed; there was nothing to build in
phase 7. Verified live (all six pages, both directions of the chain) with no
code change made.

### [ ] E.2 Per-page Open Graph images — *deliberately not folded into 2.2*
Item 0.4 gave the six case studies OG *tags*, sharing one `og:image`
(`portfolio-thumbnail.jpg`) across all of them. This item is distinct *images*
per page — still not done, and not a byproduct of 2.2 despite that item's own
scheduling note suggesting they'd land together.

Re-read closely once 2.2 was underway: 2.2 re-encodes 3 covers at their
*existing* aspect ratio (e.g. `bds-tile` stayed 1200×600). An OG image needs
a fixed 1200×630 (1.91:1) crop — a different ratio, and for the 3 covers 2.2
didn't touch (`hub-mod-tile.svg`, `wrkfeed-poc.svg`, `inc-tile.webp`, plus
`speery-image` at 1106×909, nowhere near 1.91:1), that means a real
composition decision per image — what to crop, what to pad, whether a
portrait-oriented source needs a background treatment rather than a crop —
not a mechanical re-export. That is a different, larger task than 2.2's,
better done deliberately with visual review per image than folded in as an
efficiency shortcut. Left open.
**Cost:** 6 compositions (not just exports) plus one meta line per page.

### [x] E.3 Reduce Simple English mode's fallback surface — *done 2026-09-08*
`en-simple` covers 177 of 208 keys. The 33 gaps are almost all correct
(nothing to simplify about "Works" or "LINKEDIN") — but `about.title`,
`about.eyebrow` and the five `highlight.*.number` values fall back to English
phrasing like "6-product rollout planned" and "80% match · 7 days", which is
exactly the compressed register the mode exists to avoid. Eight keys.
**Cost:** eight lines of copy. **Value:** the mode is a genuine
differentiator for a UAE audience reading in a second language; it should not
break on the numbers that carry the achievements.

**Note on the original count:** written against the pre-phase-5 file. After
5's chrome/content split the same real gap is 7 keys in `js/strings.js`'s
`en-simple` block, not 33 against 208 — the split changed the denominator,
not the substance of the item. Added: `about.eyebrow`, `about.title`, and the
five `highlight.*.number` values (`highlight.bds.number`,
`highlight.poc.number`, `highlight.wcag.number`, `highlight.css.number`,
`highlight.incridea.number`), each written to the mode's plain-language
register instead of falling back to the English original. `en-simple` key
count: 176 → 183. Verified live: all seven render correctly with Simple
English selected; English and Arabic modes untouched (checked by diffing
their rendered text before/after).

### [ ] E.4 A visible "what I'm looking for" line above the fold
The hero states what he does; the UAE availability is a `.hero-role` line in
smaller mono text, and the concrete ask ("looking for opportunities in Dubai,
Abu Dhabi, Sharjah") sits in the Contact section at the bottom. For a
job-search portfolio the ask is the conversion event and it is currently below
five sections of content.
**Cost:** copy decision, no code. **Note:** this is a judgment call about
positioning, not a defect — listed because the code review surfaced it, not
because the code is wrong.

### [ ] E.5 Give the certifications their credential links
Six certifications, six `<!-- PLACEHOLDER: add the real credential URL -->`
comments, and a fully-styled `.cert-link` component waiting for them. An
unverifiable certification list is weaker than a short verified one. This is
the only item in this document that needs input nobody but Rolan has.
**Cost:** six URLs. **Blocks on:** Decision 5.

### [x] E.6 A `humans.txt`-style colophon page — *done 2026-09-08*
The site's stated signature is that it exposes its own system — mono eyebrows,
token-driven everything, a footer claiming WCAG 2.2 AA and RTL-readiness. That
claim is currently unevidenced. A short colophon page (the token model, the
six fonts and why, the accessibility testing actually performed, the
measurement numbers now in `ARCHITECTURE.md` §7) turns a claim into a work
sample, using material that already exists in `docs/`.
**Cost:** one page, mostly assembled from existing docs. **Value:** high for
this specific audience — it is the same argument the case studies make, made
about the site itself.

New page: `colophon.html`, at the project root. Six sections — tokens (83
custom properties, the two deliberate raw-colour exceptions and why), fonts
(all six, one line each on what each is for), accessibility (the specific
things actually verified live: contrast across all 11 mat swatches, touch
targets, reflow, motion, keyboard/structure), RTL (zero physical `left`/
`right` in `styles.css`, logical properties, `<bdi>`-wrapped numbers), the
performance pass's real before/after numbers (89%/85%/61%/72%, re-measured
fresh rather than copied from earlier doc entries), and a short "no build
step" close. Content is source-checked against `ARCHITECTURE.md` and this
plan's own phase write-ups — nothing invented, per `CLAUDE.md`'s rule against
fabricated claims.

Uses the case-study component vocabulary (`.case-hero`, `.prop-list`,
`.detail-list`, `.case-stats`, `.prose`) so it doesn't introduce new CSS.
Layout is a deliberate hybrid: the back-arrow logo a case study uses (this
page is reached *from* the homepage, same as a case study, so "go back" is
the right affordance) combined with root-level asset/link paths (`href=`
without `../`, since the file lives at the project root, not in `work/`).
That combination is unique to this one page, so it's intentionally **not**
added to `tools/check-chrome.py`'s `SUBPAGES` comparison group — the
checker's prefix-normalisation only strips `../` for `work/`-nested pages,
and folding in a page that's neither a root page nor a `work/` page would
need new logic for a single one-off. Verified manually instead (see below).

Linked from every page's footer: the shared `footer.colophon` copyright
string couldn't carry a path-depth-dependent link itself (it's one JS string
shared by pages at two different folder depths), so the link is a sibling
`<a>` next to it in the static HTML — `href="colophon.html"` on `index.html`/
`404.html`/`colophon.html` itself, `href="../colophon.html"` on the six
`work/*.html` pages — with its own translated label (`footer.colophonLink`,
added to `main.js`'s chrome `STRINGS`, English/Arabic). Also added to
`sitemap.xml`.

Verified: `node --check` on `main.js`; `tools/check-chrome.py` passes (the
footer link is byte-identical across all 9 compared pages once path prefixes
are normalised — confirming the sibling-link approach didn't reintroduce
chrome drift); live browser pass on `colophon.html` in both themes and both
directions (Arabic/RTL correctly persisted from a prior page in the same
session, mirrored the whole layout, no console errors on any asset the page
itself loads); footer link confirmed present and correctly targeted from
`index.html`.

---

## Suggested sequence

| Phase | Items | Effort | Payoff |
|---|---|---|---|
| **0** | 0.6, 0.7 | ~40m | **Done 2026-09-07.** Deleted `more-work.html` and `writing/`: 5 pages, 2 internal drafts, 4 assets, ~140 lines of dead CSS (2 scoped blocks plus the `.footer-grid` component and stale comments found while implementing), and 6 `STRINGS` entries. Verified with a repo-wide grep sweep, a Node syntax check on `main.js`, and a live browser pass (both deleted URLs 404, homepage and a case study render with no console errors, footer/RTL/dark-mode toggle unaffected). |
| **1** | 0.1, 1.2, 1.3, 1.5, 1.6, 1.7, 3.3 | ~1h | **Done 2026-09-07.** Broken share card fixed and verified live (200 on the corrected URL); the motion rule the repo claims is now true (one token-collapsing block, not 17 hand-wrapped rules); the wrong RTL-font comment fixed on all 6 case studies plus `index.html`, and `CLAUDE.md`'s font list corrected to match; 6 images gained explicit dimensions (real intrinsic sizes, not guessed); the Arabic contact-label gap became a documented choice; `alt=""` set on 5 decorative card images; 2 dead STRINGS keys and 2 dead CSS component blocks plus a newly-orphaned token removed; the one Wipfli-naming leak (a filename, not prose) closed. Two items intentionally left for Rolan: the duplicate-description a11y stickers (a content/design call, not mine to make — resolved 2026-09-08, see 1.7: deliberate, both stay) and `.cert-link` (blocked on Decision 5). One larger drift found and flagged, not fixed: `DESIGN-GUIDELINES.md` §4's typography table names the wrong fonts entirely (says Inter/IBM Plex Mono; ground truth is Commissioner/Geist Mono) — needs its own verified pass, not a rushed swap. Verified with static checks (Node syntax, CSS brace/comment balance, repo-wide grep) and a live browser pass in both languages and both themes. |
| **1a** | Decision 6's `.gitignore` rule | ~5m | **Done 2026-09-08.** Better than expected: `work/incridea-2022-branding.html` already references 14 real `.webp` files, and all 14 are already tracked — the case-study work Decision 6 was waiting on had already landed. Wrote the allowlist with the real filenames directly (no placeholder `.gitkeep` needed). Verified: `git check-ignore` confirms all 14 referenced files stay tracked and all 15 leftover working files (raw screenshots, certs, social carousels) are now ignored; `git status` for the directory is empty; nothing outside `assets/images/incridea/` is affected. |
| **2** | 0.4, 0.5 | ~1.5h | **Done 2026-09-07.** All 6 case studies now carry canonical + full OG tags + analytics; `index.html` gained its own missing canonical plus `Person`/`WebSite` JSON-LD; new `sitemap.xml`, `robots.txt`, and a fully-chromed `404.html` closed the rest of 0.4's site-wide list. Real per-page OG images intentionally deferred to phase 4 (E.2), not done here — see 0.4's note on why. Verified: valid JSON-LD, valid sitemap XML, live browser pass on the homepage, a case study, and the new 404 page. |
| **3** | 2.1, 2.3, 1.4, 2.4 | ~2h | **Done 2026-09-07.** 5.1MB of dead assets deleted (12 files, re-verified against the current tree first); favicon 124KB→18KB (85%, precision=1 — precision=0 hit the plan's original 1-3KB target but visibly broke the icon, verified by rendering both); Caveat font 75KB→47KB (37% — character subsetting alone barely helped this font, so instanced it to a static 400-weight first, the real bulk); `tokens.css` 82KB→31.7KB (both mat images extracted to external, cacheable SVGs). Verified: all static checks pass, live browser pass across the homepage, a case study, and theme/mat-picker interaction — no regressions. |
| **4** | 2.2 | ~2h | **Done 2026-09-08.** 7.07MB → 0.79MB (89%) across the 7 flagged files — but only 3 were actually base64-in-SVG (verified by scanning for the actual embedded-image tag, not trusting file size); the other 4 were genuine vectors and got `svgo` instead of a wrong rasterization fix. E.2 (per-page OG images) was **not** folded in despite the original scheduling note — turned out to need real per-image composition decisions (crop/pad to 1200×630), not a mechanical re-export; left open. |
| **5** | 1.1, 2.5, 2.6, 3.1 | ~3h | **Done 2026-09-08.** One 11-swatch surface picker everywhere (`index.html`'s 5 were the outlier, confirmed against `MAT_ACCENT_TABLE`); `main.js`/`js/strings.js` split cuts 4 chrome-only pages from 285KB to 78.6KB raw; the deploy workflow now stages a filtered copy instead of uploading `.git` and internal docs publicly; `tools/check-chrome.py` built and proven to catch drift, which caught 2 real pre-existing bugs (a missing mobile-nav wrapper on the Incridea page, a stripped comment on Speery) — both fixed. Verified: static checks, the checker script itself, and a live browser pass including the newly-fixed mobile nav. |
| **6** | 3.2 | ~10m | **Done 2026-09-08.** One-line note added to `main.js`'s own opening comment explaining the §5/§7 numbering gap, instead of renumbering (which would have meant updating cross-references in two other docs for no functional gain). Verified: syntax check, chrome checker, and a live theme-toggle click all still pass. |
| **7** | E.1, E.3, E.6 | ~2h | **Done 2026-09-08.** E.1 turned out to already be built (a gap in the original audit, not new work — see E.1's note); E.3 closed the real 7-key Simple English fallback gap left after phase 5's split; E.6 shipped a new `colophon.html` turning the footer's WCAG/RTL claim into an evidenced page, linked from every page's footer. Verified: static checks, the chrome checker, and a live browser pass in both themes and both directions. |
| *unscheduled* | 1.8, 1.9 | ~1–2h | Found during phase 1, deliberately not folded into any phase: 1.8 needs a careful row-by-row doc audit (rushing it risks a second wrong answer), 1.9 needs the real Caveat licence text pulled from source, not reconstructed. Pick up whenever `DESIGN-GUIDELINES.md` or `assets/fonts/` is next touched. |

Phase 0 goes first — deleting a page before optimising it is strictly cheaper
than the reverse, and it shrinks every count in phases 1–5. Phases 1–3 are then
independent of each other and of everything after. Phase 5's item 3.1 is worth
doing *before* any future chrome change, not after.

**Nothing scheduled is blocked.** Decisions 1, 2, 3, 4 and 6 are answered
and folded into the items above. Decision 5 (credential URLs) gates only
E.5, and Decision 7 (eyebrow density) gates only 3.4 — neither item was
ever scheduled into a phase, so both decisions can sit open indefinitely
without holding anything else up.

**After phase 0 the site is 9 pages:** `index.html`, six case studies, and the
two redirect stubs. Phase 2 added a 10th, `404.html` — an error page, not
part of normal navigation or the sitemap, but real markup a visitor can land
on. Phase 7 added an 11th, `colophon.html` — in the sitemap and linked from
every page's footer, unlike `404.html`. `ARCHITECTURE.md` §1 has been updated
to match.

**Two scheduling notes.** E.2 (per-page OG images) should be folded into
phase 4, since 2.2 is re-exporting the same source assets anyway — doing them
separately means exporting twice. E.1 (prev/next links) should land *after*
3.1, so it is written once into a shared footer instead of six times into six
copies. E.5 is blocked on Decision 5 and E.4 is a positioning call, so neither
is scheduled.

**Re-run after each phase:** `docs/ACCESSIBILITY-RTL-CHECKLIST.md` sections A
and C, plus Lighthouse on `work/blueprint-design-system.html` (the heaviest
page, and the one furthest from the ≥95 target).
