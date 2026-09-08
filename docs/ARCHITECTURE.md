# Architecture

What exists at runtime, which file owns it, and why each piece is there.

`docs/DESIGN-GUIDELINES.md` covers how things should *look*. This file covers
how they *work* — the feature inventory, the ownership map, and the contracts
that constrain any future change. Written 2026-09-07 from a full read of
`index.html`, `css/tokens.css`, `css/styles.css`, `js/main.js` and all 14
pages as they stood that day — five of which have since been deleted, see the
note below. Verified in a live browser (see "Verified behaviour" at the end).

> **Applied 2026-09-07:** `more-work.html` and the whole `writing/` directory
> have been removed. The six case studies are the portfolio; the "More work"
> page held nothing showable under NDA, and all three planned articles
> restated a case study that already existed (and none of the three was ever
> written). The counts below reflect the post-removal site plus one page
> added since (`colophon.html`, CLEANUP-PLAN E.6) — **10 pages**, not 14. See
> `docs/CLEANUP-PLAN.md` items 0.6 and 0.7 for what was removed, E.6 for what
> was added, and its Decisions section for the reasoning.

---

## 1. Shape of the thing

10 navigable HTML pages plus one error page, 2 stylesheets, 2 scripts, zero
dependencies, zero build step. Every page is independently servable; nothing
is generated.

```
index.html          single-page: hero → highlights → work ×5 → about →
                    skills → certifications → contact
work/               6 case studies (blueprint-design-system is the template).
                    5 are linked from the homepage; ai-process-framework is
                    reached only from a mid-prose link inside
                    hub-modernization — its single route in.
about.html          0-second meta-refresh stub → index.html#about
contact.html        0-second meta-refresh stub → index.html#contact
colophon.html       Added CLEANUP-PLAN E.6. Turns the footer's WCAG 2.2 AA /
                    RTL-readiness claim into an evidenced page: the token
                    count, the six fonts and why, the accessibility checks
                    actually run, and the performance pass's real numbers.
                    Root-level paths (no case study lives here) but the
                    case studies' back-arrow logo, not index.html's — reached
                    from every page's footer, not the homepage itself.
404.html            GitHub Pages' auto-served error page. Added CLEANUP-PLAN
                    0.4 — full header/nav/footer chrome (a lost visitor needs
                    to navigate, unlike the redirect stubs above, which
                    already know where the visitor meant to go), noindex,
                    not in sitemap.xml.
sitemap.xml         index.html + the 6 case studies + colophon.html. Added
                    0.4, extended E.6; the redirect stubs are deliberately
                    excluded (see below).
robots.txt          allow-all + Sitemap: directive. Added 0.4.
css/tokens.css      83 custom properties. Light on :root, dark under
                    [data-theme="dark"]. Also the @font-face block's
                    companion (the faces themselves live in styles.css).
css/styles.css      every component. Tokens only, logical properties only,
                    zero !important.
js/main.js          all runtime behaviour, one IIFE, 12 numbered sections.
                    STRINGS here holds only the ~9 shared chrome keys every
                    page needs (nav/toggle/lightbox/footer).
js/strings.js       page-specific body copy (hero/about/skills/contact on
                    index.html; case.* on the four fully-translated case
                    studies) — merged into main.js's STRINGS at init, when
                    loaded. Only 5 pages load it (index.html,
                    blueprint-design-system, ai-design-to-code,
                    hub-modernization, speery-health); the rest don't pay
                    for content they don't have. Added CLEANUP-PLAN 2.5.
tools/check-chrome.py  run by hand before committing a header/footer/
                    surface-picker/head-script change. Diffs those blocks
                    across every page and fails loudly on drift — it found
                    and this session fixed two real instances (a missing
                    mobile-nav wrapper on incridea-2022-branding.html, a
                    stripped comment on speery-health.html). Added 3.1.
```

**Progressive-enhancement contract.** Nothing on this site is hidden by CSS
alone and revealed by JS. With `js/main.js` blocked, every page still renders
its full content, in the right theme, in the right direction, fully readable
and navigable. Every feature below is *additive*. This is the constraint that
rules out any "render the chrome from JS" refactor.

---

## 2. Runtime features (`js/main.js`)

Sections are numbered in the file. **§5 and §7 no longer exist** — features
were removed and the numbering was never re-flowed, which is why the sequence
reads 1, 2, 3, 4, 4b, 6, 8, 9, 10, 11, 12.

| § | Feature | Why it exists |
|---|---|---|
| 1 | **Theme toggle** | Light/dark. Order of truth: saved choice > OS preference > light. Drives both the circular icon button (desktop) and the "Light mode / Dark mode" segmented bar (mobile), which stay in sync because both call the same `setTheme()`. On switch it re-applies the mat-derived accent (§4b) — a hue that clears 4.5:1 on parchment is not the same lightness that clears it on dark paper. |
| 2 | **Content mode** | Three modes: `en` (original), `en-simple` (Simplified Technical English), `ar` (Arabic). Sets `lang`/`dir` on `<html>`; layout mirrors on its own because the CSS is 100% logical properties. Swaps text via `[data-i18n]` (innerHTML — case-study paragraphs carry inline `<strong>`/`<code>`), plus `[data-i18n-label]` → aria-label, `[data-i18n-desc]` → `data-description` (sticker popovers), `[data-i18n-title]` → `document.title`, `[data-i18n-meta-description]` → meta content. |
| 3 | **Scroll reveal** | `IntersectionObserver`, gated on `prefers-reduced-motion: no-preference`. `[data-reveal-children]` opts in every direct child so a card grid staggers without per-node markup. Stagger capped at 5 steps. Listens for a live reduced-motion change and un-hides everything if it flips on mid-session. The hero is deliberately *not* here — it's pure CSS, because a backgrounded tab pauses rAF and would leave above-the-fold content at opacity 0. |
| 4 | **Surface picker** | Recolours the cutting mat. Regenerates the whole ruled-mat SVG (grid, ruler ticks, corner protractor) at the chosen base colour and writes it to `--mat-image` as a data URI. The default mat is pure CSS in `tokens.css`, so the page is correct with this script absent. |
| 4b | **Mat-driven accent** | "Green mat gets a green accent." Two paths: an 11-entry pre-solved table (`MAT_ACCENT_TABLE`) for the built-in swatches, and a live solve (`deriveAccentSet`) for any custom colour. The live solve binary-searches HSL lightness at the picked hue for the value that clears 4.5:1 against *every* background that colour of text can land on — parchment, the subtle card fill, **and both the bright peak and dark valley of the paper's lit-relief texture**. Writes 4 tokens (`--color-accent`, `-hover`, `--color-on-accent`, `--color-tint-brand`); `--color-concept`, `--color-tag-bg` and light-theme `--color-focus` are declared as aliases of those in `tokens.css`, so 4 writes re-theme underlines, tag pills, status chips, ghost-button hover and inline code at once, with no per-component JS. |
| 6 | **Case-study lightbox** | Wraps every `.prose figure img` in a `<button>` and opens one shared `<dialog>` full-screen. `showModal()` supplies focus trapping, Escape and top-layer stacking for free — there is no hand-rolled focus trap. Labels refresh on language change. |
| 8 | **Sticky header** | Pinned by CSS `position: sticky`; JS only toggles two classes plus `inert`. Above one viewport height it never hides (no jitter near the top); past that, any upward scroll reveals immediately. `inert` when hidden so a keyboard user can't tab into off-screen controls. |
| 9 | **Drag-anywhere** | Pointer Events, not HTML5 drag-and-drop. Powers both the About photos and the Tools stickers. An 8px threshold separates a click from a drag, so a tap still opens the sticker popover and a keyboard Enter/Space still works (no pointer events involved). Pickup measures from the element's *centre* (a rotated element's bounding box lies about its corner), reparents to `<body>`, switches to `position: absolute` (not `fixed` — fixed made dropped items appear to vanish on scroll), then moves only via `--dx`/`--dy` custom properties feeding each component's own `transform`, so movement is compositor-only. `pointermove`/`up` listen on `document`, filtered by `pointerId`, because pointer capture alone dropped events once the element left its own bounds. Desktop-only, checked live on every press via a `MediaQueryList` so it stays correct across a resize with no reload. Also here: the sticker scatter (jittered N-cell grid, collision margins that account for each sticker's own rotated footprint) and the work-card photo tilt. Positions are never persisted — refresh is the reset, by design. |
| 10 | **Play hint** | One-time dismissible sticky note introducing the drag feature and the mat picker. Has its own `IntersectionObserver` on the sticker board rather than reusing §3, because it sits *before* the board in the DOM and would otherwise fire immediately. Hidden state is unconditional (it's the component's function, not decoration); only the fade is motion-gated. |
| 11 | **Tool popover** | One shared `<dialog>`, built lazily on first use. Same open/close mechanics as §6. Reuses `.tag-pill` for the proficiency badge rather than inventing a badge. `aria-labelledby` pointing at the visible heading, not a duplicated `aria-label`. |
| 12 | **Mobile/tablet nav** | Progressive enhancement in the strict sense: the panel is `display: contents` by default, so with JS off the header behaves exactly as it always has at every width. Only once JS runs does `.nav-js-ready` land on the header and turn the hamburger on below 64em. |

### Shared conventions the sections deliberately mirror

Three disclosure widgets (surface picker §4, mode select §2, nav §12) use the
same trigger/panel/outside-click/Escape shape, and two dialogs (§6, §11) use
the same `showModal()` + manual-Escape + backdrop-click + focus-return shape.
That repetition is intentional — one pattern learned five times over, rather
than five slightly different ones.

---

## 3. The pre-paint `<head>` script

Every page except the two redirect stubs carries an identical ~35-line inline
IIFE before the stylesheets. It reads four `localStorage` keys and applies
them before first paint so there is no flash of the wrong theme, direction,
mat colour, or accent.

It sets `--color-mat` but **not** `--mat-image` — rebuilding the full ruled
grid would mean duplicating the generator's loops and trigonometry into 7
inline scripts. The flat mat colour is correct instantly; the deferred script
fills in the grid moments later.

### localStorage keys

| Key | Written by | Read by |
|---|---|---|
| `theme` | §1 | head script, §1 |
| `mode` | §2 | head script (`ar` only, for `dir`), §2 |
| `matColor` | §4 | head script, §4 |
| `accentTokens` | §4b (a `{light, dark}` JSON blob) | head script |
| `hintDismissed` | §10 | §10 |

The head script re-reads `accentTokens` from cache; §4b then re-derives and
re-persists anyway. That is deliberate self-healing for a visitor whose last
visit predates the accent feature and so has a `matColor` but no cached set.

---

## 4. CSS architecture

**`tokens.css`** — the only place raw values live. 83 custom properties
across colour, type, space (Carbon-style `--space-01`…`--space-12`), radius,
shadow, duration and easing. Light theme on `:root`; dark overrides in a
single `[data-theme="dark"]` block. `color-scheme` is set per theme so form
controls and scrollbars follow.

It also carries two inline SVG data URIs — `--mat-texture` and
`--paper-texture` (a `feTurbulence` + `feDiffuseLighting` lit-relief recipe,
identical in both themes, only the alpha differs) — kept inline because both
are small (tileable noise patterns, not full illustrations). `--mat-image`
(the green mat / black mat ruled-grid SVGs, ~24.6KB URL-encoded each) used
to be a third pair of inline data URIs here too, until CLEANUP-PLAN 2.4
moved both to `assets/mat-light.svg` / `assets/mat-dark.svg` and replaced
the values with `url()` references — verified safe first, since neither SVG
depended on a CSS custom property to render. That one change took
`tokens.css` from ~82KB to 31.7KB raw (11.5KB gzipped), since those two
values had been roughly 60% of the file's bytes.

**`styles.css`** — every component, consuming tokens only. Verified: zero raw
colour values except two deliberate `#faf9f5` fills (`.work-card-media` and
`.about-photo`, documented in place — a physical printed photo does not turn
dark because the page theme did), zero `!important`, zero physical
`margin-left`/`padding-right`/`left`/`right` in any layout rule. Also holds
the `@font-face` block for all six families.

### Fonts (six families, all self-hosted)

| File | Role | Preloaded |
|---|---|---|
| `InterVariable.woff2` (123KB) | body | yes |
| `Commissioner-Variable.woff2` (119KB) | headings, buttons | yes |
| `GeistMono-Variable.woff2` (40KB) | mono, eyebrows, meta | yes |
| `Caveat-Variable.woff2` (47KB) | sticky-note handwriting | **yes** |
| `ElMessiri-Variable.woff2` (22KB) | RTL headings, buttons | no (RTL only) |
| `Harmattan-Regular.woff2` (136KB) | RTL body, mono, eyebrow | no (RTL only) |

The first three are Latin-subsetted (`pyftsubset`; see
`docs/FONT-LOADING-PERF-PLAN.md` for the command and the 74% cut it bought).
Caveat was added later and, until CLEANUP-PLAN 1.4, was neither subsetted
nor preloaded (75KB, discovered late via CSS). Character subsetting alone
barely helped this one (75→73KB — its `cmap` only ever covered 226
codepoints, not the multi-script bloat the other three had). The real win
was instancing it from a variable font (400–700 weight axis) to a static
400-weight file — the only weight `.sticky-note` (Caveat's sole consumer)
ever requests — then subsetting on top: **75KB → 47KB**, now preloaded
alongside the other three.

---

## 5. Internationalisation

As of CLEANUP-PLAN 2.5, the dictionary is split across two files rather than
one: `js/main.js`'s own `STRINGS` holds only the shared chrome (10 English
keys — `brand.name`, `nav.*`, `toggle.theme`, `lightbox.*`,
`footer.colophon`, `footer.colophonLink` (added E.6, links to the new
`colophon.html`) — plus their `ar` translations; `en-simple` has none of
these, see below), and `js/strings.js`'s `window.CASE_STRINGS` holds
everything else (191 English keys, 193 Arabic, 183 Simple English — E.3
closed 7 of the mode's fallback gaps: `about.eyebrow`, `about.title`, and the
five `highlight.*.number` values), merged into `STRINGS` at init on the 5
pages that load that file. Combined: 201 English, 203 Arabic, 183 Simple
English (ar naturally runs 2 above en — `case.bds.foundationsBridge` and
`case.speery.readtwice.p3` exist only in ar). Missing keys fall back to
English by design — `en-simple` omits nav labels and proper nouns because
there is nothing to simplify about "Works", and
`contact.linkedin`/`contact.behance`/`contact.instagram` were deliberately
dropped from every dict — see below.

Per-page key usage is very uneven — which is exactly why the split pays off:

| Page | Keys used | Loads `strings.js`? | Page | Keys used | Loads `strings.js`? |
|---|---|---|---|---|---|
| `work/blueprint-design-system.html` | 73 | yes | `work/hub-modernization.html` | 34 | yes |
| `index.html` | 66 | yes | `work/ai-design-to-code.html` | 32 | yes |
| `work/speery-health.html` | 30 | yes | `work/ai-process-framework.html` | 8 | no |
| `404.html` | 9 | no | `work/incridea-2022-branding.html` | 7 | no |
| `colophon.html` | 9 | no | | | |

Before the split, every page downloaded all 200 × 3 keys regardless. Now the
chrome-only pages (`ai-process-framework`, `incridea-2022-branding`, `404`,
`colophon` (added E.6, after the split — never carried the full dictionary),
plus `about`/`contact`, which don't load either script) download only
the 10-key chrome dictionary — `main.js` dropped from 285KB raw / 92KB
gzipped to 78.6KB raw / 25KB gzipped for those pages, a real page-weight cut
where the visitor never needed the other 191 keys anyway.

Two rounds of dead-key cleanup before the split (CLEANUP-PLAN 0.7 and
1.6/1.7): the four-column footer's `footer.contact`/`footer.explore`/
`footer.elsewhere` (only `more-work.html` and `writing/index.html` used it,
both now deleted), `contact.linkedin`/`contact.behance`/`contact.instagram`
(proper nouns with no `ar` entry — `data-i18n` dropped from the markup
instead of inventing a translation, see CLEANUP-PLAN 1.6), and
`work.incridea.status` (a status label with no element left to attach it
to — the Incridea work card never had one).

---

## 6. Deployment

`.github/workflows/static.yml` stages a filtered copy before deploying
(added CLEANUP-PLAN 2.6) — a `rsync` step excludes `.git`, `.github`,
`.claude`, `.claude-crawl`, `.impeccable`, `CLAUDE.md`, and `docs/`, and
only that staged directory is uploaded to GitHub Pages. Before this, `path:
'.'` uploaded the checkout root as-is: no build, no filtering, so all of the
above were publicly served — `.git` included, which Pages does not block
from being served like any other directory, making the full commit history
directly fetchable at a guessable URL. Still zero build step for local
dev — the filtering exists only in this CI job, on a throwaway checkout, and
was structurally validated (valid YAML, correct step order) but not
exercised via a live deploy.

Analytics: GoatCounter on `index.html`, all 6 case studies, `404.html`
(added CLEANUP-PLAN 0.5), and `colophon.html` (added E.6) — not on the two
redirect stubs, which never render long enough for a visitor to generate a
hit.

**SEO/sharing metadata** (added CLEANUP-PLAN 0.4, extended E.6): every page
has `rel="canonical"` (absolute URLs); the 6 case studies, `index.html`, and
`colophon.html` carry full Open Graph tags (`og:image` currently shared —
`portfolio-thumbnail.jpg` — across every page; distinct per-page images are
E.2, deferred to phase 4 alongside the image re-export in 2.2); `index.html`
alone carries `Person`/`WebSite` JSON-LD built only from facts already
visible elsewhere on that page.

---

## 7. Verified behaviour (2026-09-07, live browser)

Measured, not assumed:

- **Contrast** — zero WCAG AA failures across every text node on `index.html`,
  in both themes, for all five homepage mat swatches (10 combinations). The
  live derivation for `#7a1f1f`, which has no pre-solved table entry, clears
  AA on its own in both themes.
- **Reflow** — no horizontal overflow at a 320px viewport, LTR or RTL.
- **Touch targets** — no interactive element under 24×24px at 320px.
- **RTL** — `lang="ar"`, `dir="rtl"`, El Messiri on headings, `letter-spacing:
  normal` (the RTL reset holds).
- **Console** — no errors on any page.
- **Payload** (case study, before images), re-measured 2026-09-07 after
  CLEANUP-PLAN phase 3: **~478KB**, down from 505KB — fonts 329KB (woff2 is
  already compressed, so this is transferred bytes, not a gzip figure; all
  four core fonts are now preloaded, replacing the old 282KB-preloaded/75KB
  fetched-late split), CSS 39.9KB gzipped (`tokens.css` 11.5KB + `styles.css`
  28.4KB — `tokens.css` alone dropped from ~25KB to 11.5KB gzipped once the
  two inline mat images left it, item 2.4), `main.js` 91.75KB gzipped
  (unchanged this phase), HTML 18.6KB gzipped.

### Measurement note for future audits

Computed styles read in a **hidden** browser pane are unreliable: transitions
never advance, so `getComputedStyle` returns the pre-transition value
indefinitely. An earlier pass of this audit read `body`'s background as the
dark-theme colour while `--color-bg` correctly held the light value, and
produced 30 phantom contrast failures. Freeze motion first —

```js
document.head.insertAdjacentHTML('beforeend',
  '<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>');
```

— then measure.
