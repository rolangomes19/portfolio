# Design Guidelines

The visual spec for the portfolio. `css/tokens.css` is the implementation of this
document — if they ever disagree, fix one of them immediately.

---

## 1. Design references and what we take from each

| Reference | What we borrow | What we do NOT borrow |
|---|---|---|
| Carbon Design System | Productive type-pairing discipline (mono for meta, humanist sans for body), productive type scale, spacing scale, restrained interactions, 8px rhythm | Carbon's own IBM Plex Sans pairing (swapped for Inter — see §4), full component library, its blue-heavy marketing pages |
| gorix.zip | Section flow: hero → work tiles → toolstack → about → contact; numbered mono labels on tools | Dark-only theme, heavy motion/sfx, playful register |
| karolinaszczur.com | Skip links, generous focus states, accessibility statement in footer, humane tone | Serif display type |
| jakub.kr | List-first IA, content density, zero chrome | Newsletter section |

## 2. Brand voice

Precision with warmth. Sentence case everywhere. Short declarative sentences.
No buzzwords ("passionate", "ninja", "pixel-perfect"). Numbers over adjectives:
"35 WCAG violations to zero" beats "deeply committed to accessibility".

## 3. Color tokens

Light is default. Dark overrides under `[data-theme="dark"]`.
Accent is Carbon Blue 70 (light) / Blue 40 (dark) — a deliberate nod to the
stated "forever inspiration".

All ratios below are measured against the **paper**, not white. That distinction
is why light-theme accent is Blue 70 and not Blue 60: `#0f62fe` measures 4.72:1
on `--color-bg` but only **4.36:1 on `--color-bg-subtle`**, so links sitting
inside a card would have failed AA.

### Light theme — ink on warm paper
| Token | Value | Role | Contrast check |
|---|---|---|---|
| `--color-mat` | `#095848` | Cutting mat field (sampled from the artwork) | no text on it |
| `--color-bg` | `#faf8f4` | The paper | — |
| `--color-bg-subtle` | `#f2efe8` | Tile/card background | — |
| `--color-border` | `#e3ded3` | Hairlines, dividers | decorative; use `--color-border-strong` for meaningful borders |
| `--color-border-strong` | `#8a8378` | Interactive component borders | 3.54:1 on paper, 3.27:1 on subtle ✓ |
| `--color-text` | `#1a1917` | Primary text | 16.56:1 on paper ✓ |
| `--color-text-secondary` | `#57534c` | Meta, captions | 7.21:1 paper / 6.66:1 subtle ✓ |
| `--color-accent` | `#0043ce` | Links, active states | 7.35:1 paper / 6.79:1 subtle ✓ |
| `--color-accent-hover` | `#002d9c` | Link hover | 10.67:1 ✓ |
| `--color-on-accent` | `#ffffff` | Text on accent fill | 7.79:1 ✓ |
| `--color-focus` | `#0043ce` | Focus outlines | 7.35:1 ✓ |

### Dark theme — black mat, warm charcoal paper
| Token | Value | Role | Contrast check |
|---|---|---|---|
| `--color-mat` | `#000000` | Cutting mat field | no text on it |
| `--color-bg` | `#1c1b19` | The paper | — |
| `--color-bg-subtle` | `#262521` | Tile/card background | — |
| `--color-border` | `#3a3833` | Hairlines | — |
| `--color-border-strong` | `#8e8880` | Interactive borders | 4.90:1 paper / 4.37:1 subtle ✓ |
| `--color-text` | `#f5f2ec` | Primary text | 15.40:1 ✓ |
| `--color-text-secondary` | `#c3bfb6` | Meta, captions | 9.38:1 paper / 8.36:1 subtle ✓ |
| `--color-accent` | `#78a9ff` | Links | 7.31:1 on paper ✓ |
| `--color-accent-hover` | `#a6c8ff` | Link hover | 10.10:1 ✓ |
| `--color-on-accent` | `#1c1b19` | Text on accent fill | 7.31:1 ✓ |
| `--color-focus` | `#ffffff` | Focus outlines | 17.21:1 ✓ |

Rule: any new color pair must be checked at
https://webaim.org/resources/contrastchecker/ in **both** themes before merging,
against **both** `--color-bg` and `--color-bg-subtle`.

## 3b. Surface: paper on a cutting mat

The site is a sheet of warm paper resting on a cutting mat. Two rules make it work:

- **The mat lives on `<html>`, the paper IS `<body>`.** `<html>` must keep an
  explicit `background-color`, or `<body>`'s background propagates to the canvas
  and the paper floods the viewport. The artwork rides on a fixed
  `html::before` rather than `background-attachment: fixed`, which iOS Safari
  degrades to `scroll` and stretches down the whole document.
- **`<body>` is a size container** (`container-type: inline-size`). Headings,
  page margins, and every layout breakpoint are measured against the *sheet*,
  not the window — see §4 and §5.

Sheet geometry: a mat gap above the header, and **no bottom edge** — the paper
runs to the end of the document so scrolling never reveals where it stops.

| Viewport | `--paper-inline` | Result | Mat |
|---|---|---|---|
| < 48em | `100%` | full bleed | not painted — it can never be seen |
| ≥ 48em | `78vw` | ~78% | visible gutters |
| ≥ 64em | `clamp(44rem, 60vw, 80rem)` | exactly 60% from ~1173px to ~2133px | visible gutters |

The floor keeps narrow laptops readable; the ceiling stops an ultrawide from
producing an absurd sheet. Elevation is `--shadow-paper`: a 1px ring plus a
contact shadow plus two diffuse layers. In dark mode the ring flips to white —
on a black mat a dark shadow does nothing, so the ring carries the edge.

### The mat is vector, not a photograph

`--mat-image` is a hand-authored **1280×680px SVG "chunk" of a ruled cutting
mat** — a 50×25-unit grid at 24px pitch (bold every 5 units, the site's own
8px rhythm scaled up so it reads as a mat and not fine graph paper), axis
rulers numbered 0–50 along the top and 0–25 (mirrored) down both sides, and a
quarter-circle protractor fanning 15°/30°/45°/60° from the bottom-left origin
— embedded as a CSS data URI and tiled with `background-repeat: repeat`
rather than stretched with `cover`, so the grid holds a consistent scale from
a 768px sheet to a 2560px one. It replaced an earlier plain-grid-only version
after user feedback that a bare tiled grid read as generic graph paper rather
than an actual mat — the rulers and protractor are what sell the object.

The default light (green) and dark (black) mats are baked directly into
`tokens.css`, so the mat renders correctly **even with JavaScript disabled**.

Every grid line, tick, and label color is *derived*, not authored separately:
it's the base color run through `color-mix(in oklch, <base> 100%, white
16%/32%/48%)`, written literally inside the SVG's own `stroke`/`fill`
attributes. That function resolves at paint time inside the image — it needs
no CSS custom-property inheritance — which is what lets `js/main.js` reuse
the exact same generator (same grid pitch, same trig for the protractor) to
build a live SVG for any color a visitor picks, not just the two shipped
defaults.

### Surface picker

A floating control (`.surface-picker`, bottom-inline-end, independent of the
header toggle row) lets a visitor recolor the mat: six curated swatches plus
a native `<input type="color">`. Picking a color persists to
`localStorage.matColor`. A saved color is intentionally **global across both
themes** — it overrides the theme-driven default in light and dark alike —
with a "Reset to default" action that clears the override and lets the
theme-driven color show again.

(An earlier version also offered two static photo surfaces — white plaster,
wood grain — as a swap-in for the recolorable grid. They were removed: flat
stock photography read as pasted-on next to the mat's hand-authored SVG
grid, and the procedural mat/paper grain below covers the "make it feel
textured" goal without a photographic asset.)

Applying a color change is split across two moments, deliberately:

- The anti-FOUC `<head>` read on every page (mirroring the existing
  theme/lang pattern) sets only **`--color-mat`** before first paint — no
  wrong-color flash on reload.
- The full **`--mat-image`** rebuild — the grid/ruler/protractor generator
  for the picked color — runs in the deferred `js/main.js` instead.
  Duplicating that generator's loops and trigonometry inside 12 pre-paint
  `<head>` scripts wasn't worth it for a background layer — the flat mat
  color is already correct instantly, and the detailed grid fills in
  moments later once the deferred script runs, which is imperceptible in
  practice.

The mat renders once per page, not tiled: `background-repeat: no-repeat`,
`background-size: cover`, `background-position: left bottom` (see
`html::before` in styles.css). The grid's ruled origin — and the protractor
fanning from it — always sits at the viewport's actual bottom-left corner
this way, instead of the origin recurring at every tile boundary. Axis
numbers run along the top and right edges only; the left and bottom edges
keep their tick marks but drop the digits, since a single cover-scaled
instance doesn't need the same number repeated on every edge.

This is contrast-safe by construction: the mat sits entirely behind the paper
on `html::before`, and no paper token (`--color-bg`, `--color-text`, etc.)
ever references `--color-mat`. Any mat color is guaranteed not to touch text
contrast — verified by setting an extreme saturated mat color and confirming
`<body>`'s computed background and color are byte-identical before and after.

The swatch group follows the APG radio-group pattern: roving `tabindex`,
`aria-checked`, arrow keys move focus *and* select (matching native
`<input type="radio">`), `Escape` closes the popover and returns focus to
the trigger.

### Surface texture

Both the mat and the paper carry a second, independent background layer: a
tileable SVG noise panel (`feTurbulence` fractalNoise, 5–6 octaves,
`stitchTiles: stitch` so the tile has no visible seam — `--mat-texture` and
`--paper-texture` in `tokens.css`). Each pixel's alpha is coupled to its own
lightness (both driven off the same `feComponentTransfer` gamma curve), so
the grain has real peaks and valleys instead of a flat, uniform speckle —
that coupling is what makes it read as "rough" rather than "hazy."
`--paper-texture`'s `baseFrequency` is anisotropic (different on its two
axes) for a directional, fibrous look; `--mat-texture` stays isotropic and
runs at a coarser frequency — a self-healing cutting mat's rubber mottles
at a glance rather than showing fibre.

The blend mode is deliberately NOT `overlay` (an earlier version used it,
uniformly, for both layers). Overlay is built to protect highlights/shadows
and only perturb midtones — which makes it go nearly invisible right at the
backdrop extremes our surfaces actually sit at (paper: near-white in light
theme, near-black in dark; mat: every preset and default is dark-to-mid).
Instead:

- `--mat-texture` blends with `screen` in both themes — mat colors are
  never near-white, so screen (which only adds visible *lighter* speckle)
  reads correctly everywhere from the default black dark-theme mat to the
  lightest preset.
- `--paper-texture` uses a **themed** blend mode via `--paper-texture-blend`
  — `multiply` in light theme (adds visible *darker* speckle to near-white
  paper), `screen` under `[data-theme="dark"]` (adds visible *lighter*
  speckle to near-black paper).

Multiply is self-limiting by construction — because rising alpha and rising
source value cancel each other at the extreme, the worst possible single
pixel is bounded to roughly `alpha ÷ 4` darkening, which is why light
theme's `--paper-texture` alpha can run as high as 0.32 and still keep
`--color-text` at 13.3:1 in that worst case. Screen has no equivalent
ceiling — an unchecked alpha can wash a peak pixel out toward full white —
so dark theme's `--paper-texture` alpha is kept low (0.10). That value was
picked by solving for the worst single-pixel case against every dark theme
text token and keeping all of them ≥4.5:1 (`--color-accent` is the
tightest, at 5.4:1; body text stays at 10.9:1). `--mat-texture` never sits
under text, so it isn't bound by this and runs at a richer alpha (0.22) in
both themes.

(These alpha/gamma values are a second-pass tuning — an earlier, punchier
version, 0.55/0.14/0.4 with steeper gamma curves, clearly read as texture
but lost the material's subtlety and felt closer to sandpaper than paper.)

Both textures are static (no animation), so there's nothing to gate behind
`prefers-reduced-motion`.

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Body | InterVariable (Inter), self-hosted from rsms.me/inter/ | Weight 400 (Regular) only; `letter-spacing: -0.02em` (`--tracking-body`) — Inter's own recommended tight tracking for text sizes |
| Headings (h1–h4) | InterVariable | Weight 600; `letter-spacing: normal` (doesn't inherit body's -2%); `font-feature-settings: var(--font-feature-alt)` enables Inter's full character-variant bundle (single-story a, open digits, alternate 1/3, compact f/t, etc.) — the modern equivalent of the old "Inter UI var alt" cut, which is no longer published as a separate family/file |
| Eyebrows, meta, tags, code | IBM Plex Mono | Weight 400; uppercase eyebrows with `letter-spacing: 0.08em` (LTR only) |
| Arabic (RTL) | IBM Plex Sans Arabic | Applied via `[dir="rtl"]`; letter-spacing forced to 0; falls back to InterVariable for any Latin text mixed into RTL content |

Type scale — headings are sized in `cqi` (1% of the paper's width), so type
scales with the sheet rather than the window. The rem values are guard rails,
not the intended size; the `cqi` term should win at most widths.

| Token | Value | Use |
|---|---|---|
| `--text-display` | `clamp(1.75rem, 3.9cqi, 2.5rem)` | Hero one-liner only |
| `--text-h2` | `clamp(1.25rem, 2.3cqi, 1.625rem)` | Section titles |
| `--text-h3` | `clamp(1.0625rem, 1.5cqi, 1.1875rem)` | Tile titles, subsection heads |
| `--text-body` | `1rem` — **fixed, do not scale** | Body copy; line-height 1.6; measure 65ch |
| `--text-small` | `0.8125rem` | Meta, captions; line-height 1.5 |
| `--text-mono` | `0.75rem` | Eyebrows, tags, index numbers |

Body is deliberately excluded from the scale. 16px is the floor for readable
prose, and anything smaller makes iOS zoom on focused form inputs. The
"smaller type" of this design comes from the headings — display went from a
56px cap to 40px, h2 from 32px to 26px — not from shrinking the reading text.

Resolved sizes: display is 28px up to ~1200px viewport, then fluid to 40px at
1920px. Headings: line-height 1.15–1.25, `text-wrap: balance`.

## 5. Spacing & grid

Carbon-style scale (tokens `--space-01` … `--space-12`):
`0.125 / 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 2.5 / 3 / 4 / 5 / 6 rem`.

- The paper is the width authority. `.container` no longer caps width — it
  supplies the **page margins**: `--paper-margin-inline`
  (`clamp(--space-05, 6.5cqi, --space-12)`), which scales with the sheet and
  therefore needs no breakpoints. 24px at mobile → 75px at a 1152px sheet.
- Section vertical rhythm: `--section-rhythm`
  (`clamp(--space-09, 5.5cqi, --space-11)`). The last section drops its bottom
  rule, which on paper would read as a line stranded mid-sheet.
- **Layout breaks on the container, not the viewport.** Because the sheet is
  only 60vw on desktop, a `@media` breakpoint would fire while the content
  column is still narrow — a 768px viewport would try to put a five-across
  strip inside a 599px sheet. Use `@container`:

  | Component | Threshold | Below → above |
  |---|---|---|
  | `.highlight-list` | 48em | 2 cols → 5 cols |
  | `.work-item`, `.about-grid`, `.facts-bar`, `.footer-grid` | 40em | stacked → side-by-side |
  | `.skills-grid`, `.more-work-grid` | 34em | 1 col → 2 cols |

- 8px rhythm: everything snaps to the scale. No magic numbers.

## 6. Section anatomy (index.html)

```
[skip link]
[header: name/logo · nav (Work, Skills, About) · dir toggle · theme toggle]
01 hero        — eyebrow, one-line intro (h1), sub-line, two actions (View work / Download CV)
02 selected work — 4 rows: image + (index, year, title, description, tags, arrow)
03 skills & tools — grouped categories, numbered mono list items (gorix pattern)
04 about       — portrait placeholder + short bio + availability/location line
[footer: contact email · social links · a11y & RTL statement · colophon]
```

Eyebrow pattern: `01 — Selected work` in Plex Mono, uppercase, text-secondary.
The numbering is real information: it mirrors nav order and page flow.

## 7. Components

### Work tile (`.work-item`)
- Whole row hover: background shifts to `--color-bg-subtle`, arrow translates
  4px inline-end (150ms).
- Card-link pattern: title `<a>` gets an `::after` covering the row → whole row
  clickable, single tab stop, accessible name = title.
- Image: 4:3, `object-fit: cover`, radius `--radius-md`, explicit width/height.
- Meta row (year · tags) in Plex Mono small.

### Skill item (`.skill-item`)
- `index (mono) · two-letter chip · name` per row; grouped under category
  headings (Design / Systems & code / Accessibility / AI & workflow).
- Chip: 2ch mono in bordered square — the gorix nod, kept static (no filter
  JS in v1; add later if wanted).

### Buttons & links
- Primary action: solid accent bg, white text (check contrast in dark: use
  `#161616` text on `#78a9ff`). Secondary: 1px `--color-border-strong` outline.
- In-text links: underlined always (never color-only), `text-underline-offset: 0.15em`.

### Theme + direction toggles
- Real `<button>`s with `aria-pressed` and visible labels
  (`AR / EN`, sun/moon glyph + sr-only text). 44px hit area.

## 8. Motion

Personality is precision — motion is scarce and functional.
- Durations: `--duration-fast: 150ms` (hover), `--duration-base: 300ms` (theme
  and colour transitions), `--duration-reveal: 520ms` (content arriving).
- Easing: `--ease: cubic-bezier(0.2, 0, 0.38, 0.9)` (Carbon productive) for
  controls; `--ease-entrance: cubic-bezier(0, 0, 0.3, 1)` (Carbon expressive
  entrance) for reveals. A control responding and content arriving are not the
  same gesture and should not share a curve.
- Reveal geometry: opacity + `--reveal-rise` (16px), once, staggered
  `--reveal-stagger` (60ms) between siblings, capped at 5 steps so a long list
  never leaves its last item waiting.

**Two mechanisms, on purpose:**

| | Below the fold | The hero |
|---|---|---|
| Driver | JS `IntersectionObserver` | pure CSS `@keyframes reveal-rise` |
| Opt-in | `[data-reveal]`, or `[data-reveal-children]` on a parent to stagger its direct children | `[data-reveal-intro]` on the page's first content block |
| Why | nothing to observe until you scroll | **above-the-fold content must never need JS to become visible** — a backgrounded tab pauses `requestAnimationFrame`, which would strand the hero at `opacity: 0` |

`[data-reveal-children]` is expanded by `main.js` before the observer runs, so
long article bodies stagger without tagging every node in the markup.

- Everything that hides content sits inside
  `prefers-reduced-motion: no-preference`, and JS never adds `.reveal` when the
  user prefers reduced motion — so with motion off, or with JS off entirely,
  every element is visible at full opacity. Verify this after any reveal change.
- The mat is a **static** fixed layer. No parallax, no cursor effects, no sound.

## 9. Case study page anatomy (work/*.html)

```
[header: ← All work · toggles]
hero      — eyebrow (year · role · tags), h1 title, one-para summary
facts bar — mono grid: Timeline / Role / Team / Impact metric
body      — h2 sections: Context → Problem → Process → Solution → Outcome
            (images interleaved, figure + figcaption)
next      — prev/next case study links
[footer]
```

Body copy max measure 65ch. Every metric in the Outcome section must be real —
placeholders are marked and must be replaced before publishing.

## 10. Definition of done (per change)

1. Tokens only — no raw values.
2. Logical properties only — flip `dir="rtl"` and eyeball every changed view.
3. Keyboard pass: tab order sane, focus visible, no traps.
4. Both themes checked.
5. Reduced-motion checked.
6. Lighthouse a11y = 100 if HTML changed.
