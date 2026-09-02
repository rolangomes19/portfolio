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

The palette is **kami** (`references/tokens.json`): warm parchment canvas and
warm grays throughout — every gray has a yellow-brown undertone (`R ≥ G ≥ B`),
never a cool blue-gray. It replaced a Carbon Blue / Carbon Green pairing on a
near-white paper.

**The accent is not fixed — it tracks the cutting mat.** kami's own rule is
"one chromatic accent"; this site keeps that rule but lets the visitor's mat
choice decide *which* hue gets to be it. Pick the green swatch, the accent is
green. Pick red, blue, a custom colour typed into the native picker — same. A
mat with no real hue (the grayscale swatches, or a near-neutral custom pick)
falls back to the ink-blue identity the site shipped with before this existed.
Full mechanism: **§3c below.**

Two kami rules matter more than any individual value here:

- **A raised surface is *brighter* than what it sits on.** `--color-bg-subtle`
  (ivory) is lighter than `--color-bg` (parchment), which is the opposite of
  the old tokens. The fill *is* the lift, so cards carry no border. Anything
  that should read as pressed-in rather than lifted uses
  `--color-surface-interactive` (warm sand) instead.
- **One chromatic accent, wherever it currently points.** Capped at roughly 5%
  of surface area, same as always — mat-tracking changes *which* hue that is,
  never *how many* hues are live at once.

All ratios are measured against the **paper**, not white.

### Light theme — ink on warm parchment
| Token | Value | Role | Contrast check |
|---|---|---|---|
| `--color-mat` | `#095848` | Cutting mat field — the default, green | no text on it |
| `--color-bg` | `#f5f4ed` | The paper (kami Parchment) | — |
| `--color-bg-subtle` | `#faf9f5` | Card/lifted surface (kami Ivory) — brighter than the paper | — |
| `--color-surface-interactive` | `#e8e6dc` | Buttons, pressed chrome (kami Warm Sand) | — |
| `--color-border` | `#e8e6dc` | Hairlines, section dividers | decorative; use `--color-border-strong` for meaningful borders |
| `--color-border-soft` | `#e5e3d8` | Row separators inside lists | decorative |
| `--color-border-strong` | `#7a746a` | Interactive component borders | 4.20:1 paper / 4.40:1 ivory / 3.70:1 warm sand ✓ |
| `--color-text` | `#141413` | Primary text (kami Near Black) | 16.72:1 paper / 17.50:1 ivory ✓ |
| `--color-text-secondary` | `#504e49` | Meta, captions (kami Olive) | 7.54:1 paper / 6.64:1 warm sand ✓ |
| `--color-accent` | `#116151` | **Mat-derived** — green mat's default. Links, active states | 6.68:1 paper / 5.88:1 warm sand ✓ |
| `--color-accent-hover` | `#0c4338` | **Mat-derived.** Link hover | 10.15:1 ✓ |
| `--color-on-accent` | `#faf9f5` | Text on accent fill | verified ≥4.5:1 for every derived accent ✓ |
| `--color-focus` | `var(--color-accent)` | Focus outlines — aliased, so it tracks the mat too | ≥6.68:1, same as accent ✓ |
| `--color-tint-brand` | `#e0e7df` | **Mat-derived.** Quietest fill; inline code, ghost-button hover | accent text on it: ≥4.5:1 ✓ |
| `--color-tag-bg` | `var(--color-tint-brand)` | All tag/badge fills — one alias, was two separate tokens | same as tint-brand |
| `--color-concept` | `var(--color-accent)` | Hero underlines + work-card tag text — was two separate tokens | same as accent |

### §3c. Mat-driven accent — mechanism
`--color-accent`, `--color-accent-hover`, `--color-on-accent`, and
`--color-tint-brand` are the only four tokens the mat actually drives.
Everything else that used to be its own colour — `--color-concept` (hero
underlines, work-card tags), `--color-tag-bg` (every badge fill),
`--color-focus` in light theme — is now declared **once**, as a `var()` alias
of one of those four, so a JS override of the four automatically carries
through to all of it. No component-specific JS exists or is needed.

`js/main.js` §4b solves each derived pair exactly the way the original fixed
ink-blue was solved by hand: convert the mat's hex to HSL, clamp saturation to
40–70% (keeps a very pale or neon custom pick from producing a washed-out or
shouting accent), then binary-search the lightness, at that hue, that clears
**4.5:1** against parchment, warm sand, AND the worst single pixel the paper's
own grain can produce (light theme) — or paper, subtle, and its own worst pixel
(dark theme). Hover repeats the search at a **7.0:1** target. `on-accent` picks
whichever of ivory/near-black contrasts better against the result. `tint-brand`
mixes the accent into the paper at a fixed *cosmetic* ratio (kami: "lightest
solid wins") and only backs that ratio down — never up — if it doesn't clear
4.5:1 against the accent text sitting on it.

Two paths produce a set: an **offline-verified lookup table** for the picker's
11 built-in swatches (values below), or the **same algorithm run live** for a
custom colour from the native `<input type="color">`. A saturation under 15%
(the grayscale swatches; a near-neutral custom pick) has no hue to derive from
and falls back to the ink-blue identity pair.

| Mat (label) | Light accent / hover | Dark accent / hover |
|---|---|---|
| `#095848` Green (default) | `#116151` / `#0c4338` | `#1eaa8d` / `#25d2af` |
| `#0b3556` Navy | `#19598c` / `#113e60` | `#489ddf` / `#8bc1eb` |
| `#7a3418` Rust | `#8f3d1c` / `#632a14` | `#de7d56` / `#eaad94` |
| `#4a2545` Plum | `#85397a` / `#5c2755` | `#c87ebe` / `#dcacd5` |
| `#0d4f4a` Teal | `#11605a` / `#0c423e` | `#1ea89e` / `#25d0c3` |
| `#1B365D` Ink blue | `#2b5694` / `#1e3b66` | `#6f99d5` / `#a1bde4` |
| Charcoal / Graphite / Slate / Olive / Smoke grey | `#1B365D` / `#12253F` (fallback) | `#c48c39` / `#dab57e` (fallback, amber) |

A theme toggle re-solves from the **same** mat hex for the newly active theme
(a colour that clears 4.5:1 on light parchment is not the same lightness that
clears 4.5:1 on dark paper) — cached per-theme in `localStorage.accentTokens`
so the toggle is instant, no recomputation. The anti-FOUC `<head>` script on
every page applies that cache before first paint, same as it always has for
`--color-mat` itself, so a returning visitor with a customised mat never sees
a flash of the wrong accent.

### The two concepts are unified — and now read as a highlight, not an underline
Design and engineering styling has gone through four states: Carbon Blue vs
Carbon Green (two hues), ink-blue vs kami's warm brown (one hue, one neutral —
the brown read as a caution/error state and, being warmer and more saturated,
actually outshouted the blue it was meant to support), one shared colour
carried by an underline (wavy vs dashed, equal optical weight), and now:
**a light wash of the mat-driven tint behind the word, no underline, no
recoloured text** — `.concept-design` / `.concept-engineering` in
`css/styles.css`.

```css
.concept-design,
.concept-engineering {
  background: var(--color-tint-brand);
  border-radius: var(--radius-sm);
  padding-inline: 0.15em;
  margin-inline: -0.15em;
  color: inherit;
}
```

`--color-tint-brand` already **is** "the accent mixed lightly into the current
paper" — no new token, and it stays mat-reactive: pick a different mat, the
highlight retints along with everything else accent-driven. Text colour reverts
to `inherit` (the surrounding heading's or paragraph's own ink) rather than the
accent, so the highlight is the *entire* signal — the way a real highlighter
never changes the colour of the ink beneath it. Padding/margin are `em`, not
the spacing scale, deliberately: the highlight sits inside both a 40px `h1`
and a 17px `.sub` paragraph, and only a font-relative unit keeps the mark
proportional at both sizes. The negative inline margin cancels the padding's
push on neighbouring words, so the highlight appears without shifting text.

Both spans now render *identically* — the only thing distinguishing "design"
from "engineering" anywhere on the page is the word itself, not any styling.
Verified: inherited text against `--color-tint-brand` clears comfortably above
4.5:1 in both themes and for all eleven mat options (worst case 6.58:1,
secondary-text tier), since a kami tint is by construction always close to the
paper's own lightness — the same property that makes it read as "bleeding into
the paper" is what keeps ordinary text legible on top of it.

`--color-border-strong` is the one value that is **not** a kami token. kami's
own `--border` measures 1.08:1 on parchment, which cannot satisfy WCAG 1.4.11
(3:1) for a border that identifies an interactive component, so this value is
derived on kami's warm ramp between Stone (`#6b6a64`) and Border (`#e8e6dc`).

kami's Stone was also **rejected** as a third text level: it measures 4.34:1 on
warm sand, i.e. it fails AA on the interactive surface. The site keeps two text
levels only.

### Dark theme — black mat, craft paper
The paper is dark, warm, and pushed browner than a neutral charcoal
(R38 G35 B30, a wider R-to-B spread than kami's R48 G48 B46) so it reads as a
sheet of dark stock rather than a UI panel. kami's own Dark Surface (`#30302e`)
sat too light and too neutral for that.

The mat is true black, and that is what keeps the darker sheet legible against
it: `#26231e` on kami's `#141413` separates at only **1.12**, on black at
**1.34** — effectively unchanged from the 1.39 the lighter paper had. The lift
itself has always come from `--color-paper-edge` and the shadow, not the fills.

Foregrounds are **not** a mechanical inversion of the light palette: each was
solved against the worst single pixel the paper's own grain can produce (see
`--paper-texture` in `tokens.css`). kami's Ink Light (`#2D5A8A`) is unusable on
any of these surfaces at under 2:1.

| Token | Value | Role | Contrast check |
|---|---|---|---|
| `--color-mat` | `#000000` | Cutting mat field — the default, black (neutral → no hue to derive from) | no text on it |
| `--color-bg` | `#26231e` | The paper — craft-toned | — |
| `--color-bg-subtle` | `#302c26` | Card/lifted surface | — |
| `--color-surface-interactive` | `#3b372f` | Buttons, pressed chrome | — |
| `--color-border` | `#3b372f` | Hairlines | — |
| `--color-border-soft` | `#332f29` | Row separators | — |
| `--color-border-strong` | `#8e8880` | Interactive borders | 4.46:1 paper / 3.95:1 subtle ✓ |
| `--color-text` | `#faf9f5` | Primary text (kami Ivory) | 14.86:1 ✓ |
| `--color-text-secondary` | `#c3bfb6` | Meta, captions | 8.53:1 paper / 6.47:1 worst-pixel ✓ |
| `--color-accent` | `#c48c39` | **Mat-derived** — black mat's fallback (neutral). Amber/bronze, not ink-blue — see box below. Links | 5.34:1 paper / 4.73:1 subtle / 4.61:1 worst-pixel ✓ |
| `--color-accent-hover` | `#dab57e` | **Mat-derived.** Link hover | 8.12:1 ✓ |
| `--color-on-accent` | `#141413` | Text on accent fill | 6.28:1 ✓ |
| `--color-focus` | `#ffffff` | Focus outlines — deliberately **not** aliased to accent; stays maximally visible regardless of the mat's hue | 15.65:1 ✓ |
| `--color-tint-brand` | `#362e21` | **Mat-derived.** Quietest fill | accent text on it: 4.56:1 ✓ |

**Why amber, not ink-blue.** The original dark-theme fallback was an
ink-blue-family pair carried over from before mat-tracking existed. On the
warm craft paper (`#26231e`) that cool blue was the one place the whole dark
palette broke its own warm-monochromatic logic. The fallback is now solved
the identical way every mat-derived accent is — hue/saturation fixed, binary
search the lightness that clears 4.5:1 against paper, subtle, AND the worst
textured pixel (§3c) — just at a fixed amber/bronze hue (36°, 55% sat)
instead of a mat's own, since black itself carries no hue to derive from.

Deliberately **mid-lightness (49.6%), not pale**: the accent has to read as a
distinct hue at a glance against `--color-text`'s near-white ivory (97%
light) — a 47.5-point lightness gap. Matching the accent's brightness to body
text would make buttons and links blend into ordinary prose instead of
standing apart from it, which is the actual functional job an accent has to
do regardless of how monochromatic the palette gets.

`--color-concept` and `--color-tag-bg` are declared once, under `:root` (see
the light-theme table above) — no dark-theme redeclaration needed, since a
`var()` alias re-resolves against whichever `--color-accent` /
`--color-tint-brand` is in scope, dark override included.

Rule: any new color pair must be checked in **both** themes before merging,
against **both** `--color-bg` and `--color-bg-subtle` — and, for anything that
recolors on hover, in the **hover state** as well, not just at rest. A hover
that changes either the foreground or the background has to be measured twice.

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

### Mobile/tablet nav (`.nav-toggle` / `.site-nav-panel`)
Below `64em` the header's nav links and lang/theme toggles collapse behind
a hamburger button; at `64em`+ they render exactly as before — a flat row
in the header. Same open/close vocabulary as the surface picker (roving
trigger/panel, outside-click and `Escape` both close it), and the same
"purely additive" rule as the lightbox and drag engine everywhere else on
this site.

- **`display: contents` is the load-bearing default.** `.site-nav-panel`
  wraps `.site-nav` and `.header-controls` and is `display: contents` at
  *every* width until `js/main.js` §12 proves it can drive the toggle
  (adds `.nav-js-ready` to `.site-header`) — `display: contents` makes the
  wrapper invisible to layout, so its children render as direct flex
  children of `.site-header .container` exactly as they did before this
  wrapper existed. Absent JS, nothing about the header changes at any
  width — no hamburger appears (nothing to click), nav links and toggles
  sit in their normal flow position and wrap at narrow widths the same
  way they always have. This is deliberate: a hamburger that's visible
  but does nothing would be worse than no hamburger at all.
- **`aria-expanded` is the single source of truth**, not a separate
  JS-toggled class — the hamburger↔X icon animation reads the trigger's
  own `[aria-expanded="true"]` in CSS, so the visual state and the
  accessible state can never drift apart.
- **`64em`+ has its own escape hatch**: `.site-nav-panel[hidden] { display: contents }`
  under `min-width: 64em` guarantees the nav is never stuck hidden at
  desktop width, regardless of whatever open/closed state a visitor's
  last mobile-width interaction left behind — a CSS backstop underneath
  the JS, which also actively closes the panel on that same `64em`
  crossing via a `matchMedia` listener.
- **Static markup, not injected.** Unlike the lightbox/tool-popover
  (built by script, since they're wholly new UI), the toggle button and
  panel wrapper are authored directly in each page's `<header>` — every
  page shares the identical structure (`index.html`, `work/*.html`,
  `writing/*.html`, `more-work.html`), only the nav links' `href` prefix
  differs by folder depth.

### Surface picker

A floating control (`.surface-picker`, bottom-inline-end, independent of the
header toggle row) lets a visitor recolor the mat: **eleven** curated
swatches — the original six saturated colours (Green, Charcoal, Navy, Rust,
Plum, Teal) plus five kami-derived warm neutrals (Ink blue, Graphite, Slate,
Olive, Smoke grey) — plus a native `<input type="color">` for anything else.
Picking a color persists to `localStorage.matColor`. A saved color is
intentionally **global across both themes** — it overrides the theme-driven
default in light and dark alike — with a "Reset to default" action that clears
the override and lets the theme-driven color show again.

Picking a mat colour now does two things, not one: it recolors the mat SVG
(as always), and it re-solves `--color-accent` and its three dependents from
that same hex — see **§3c** above. The claim that mat colour "is guaranteed
not to touch text contrast" (kept below, in the section on the mat *rendering
layer*) is about the SVG paint order, not about this: the mat's hex is
deliberately read as *input* to the accent derivation, and every derived
output is contrast-verified before it is ever applied.

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

The mat's *rendering* is contrast-safe by construction: it sits entirely
behind the paper on `html::before`, and no paper token (`--color-bg`,
`--color-text`, etc.) ever references `--color-mat` in CSS. A mat colour is
guaranteed not to bleed through visually — verified by setting an extreme
saturated mat color and confirming `<body>`'s computed background and color
(everything EXCEPT the accent family) are byte-identical before and after.
The accent family is the one deliberate exception (§3c): `js/main.js` reads
the mat's hex as the *input* to a contrast-verified derivation, so the mat
does influence text colour there — on purpose, and never below 4.5:1.

The swatch group follows the APG radio-group pattern: roving `tabindex`,
`aria-checked`, arrow keys move focus *and* select (matching native
`<input type="radio">`), `Escape` closes the popover and returns focus to
the trigger.

**Discoverability**: the trigger is a small floating circle with no visible
label, so a `.surface-picker-hint` span ("Recolor mat") fades in on hover of
the whole `.surface-picker`, `aria-hidden` since the button's own
`aria-label` already carries the accessible name — purely a sighted-mouse
nudge, gated `@media (hover: hover)`. The one-time "Play hint" banner (see
below) mentions this control too, for visitors who never hover it.

### Sticky note (`.sticky-note`)
One physical-object component, reused wherever the site needs a paper note
rather than a flat UI card: the homepage Highlights strip (`--stat`), the
drag-anywhere tip (`--tip`), and a case study's margin annotations
(`--margin`, the NDA note and any pull quote). Shares the same
`--dx/--dy/--base-rot/--hover-rot/--hover-scale` transform stack as
`.tool-sticker`/`.about-photo` — a note is a physical object resting on the
page, not a flat card, so it gets `--radius-sm` (matching those two) rather
than `--radius-md` (the flat `.card-surface` family's radius). Paper fill
(`--color-note-bg`/`--color-note-text`), elevation (`--shadow-note`), and
label typography (`--font-hand`, the self-hosted Caveat variable font) are
all dedicated tokens, distinct from the flat-card system, verified at
≥4.5:1 in both themes. `--font-hand` is applied to label/annotation text
only, never the large `.highlight-number` stat figures (stays on
`--font-heading` for scannability) and never under `[dir="rtl"]` (Caveat has
no Arabic coverage — falls back to `--font-sans-arabic`, same as every
other component).

### Play hint (`.sticky-note.sticky-note--tip`)
A dismissible tip, built once by `js/main.js` §10 and revealed only once an
`IntersectionObserver` reports the sticker board has actually scrolled into
view. Introduces both the drag-anywhere feature (Draggable objects, above)
and the surface picker. Dismissal is a single `localStorage.hintDismissed`
flag; once set, the tip never appears again. Sits as a normal-flow sibling
right before `.sticker-board` (not `position: fixed`, not appended to
`<body>`) — a contextual note near the thing it explains, not a floating
global toast.

- **Its own observer, not the shared reveal machinery.** The note exists in
  the DOM from the moment it's built (inserted ahead of the board it's
  about to explain), so it needs its own `IntersectionObserver` watching
  the sticker board itself, not the note.
- **Hidden unconditionally, not gated behind reduced motion.** Unlike a
  decorative reveal, "hidden until the sticker board is reached" is this
  component's actual function, not an animation nicety — so
  `opacity`/`visibility` are hidden by default in plain CSS, and only the
  fade/rise *transition* is wrapped in
  `prefers-reduced-motion: no-preference`. A reduced-motion visitor still
  only sees it appear at the right scroll position, just without the
  animated entrance.
- **`visibility`, not `opacity` alone**, keeps the close button out of the
  tab order while hidden — otherwise a keyboard user tabbing through the
  page could land on an invisible control before the note ever appears.

### Surface texture

The mat and the paper carry a second, independent background layer each, but
they're no longer the same *kind* of texture. `--mat-texture` is unchanged:
flat `feTurbulence` fractalNoise, alpha shaped by a `feComponentTransfer`
gamma curve, blended with `screen` in both themes (mat colors are never
near-white, so screen — which only adds visible *lighter* speckle — reads
correctly everywhere from the default black dark-theme mat to the lightest
preset). `--mat-texture` stays isotropic and coarse — a self-healing cutting
mat's rubber mottles at a glance rather than showing fibre — and it never sits
under text, so it carries no contrast obligation.

`--paper-texture` is a different pipeline, matched to marijanapav.com/stamps's
actual paper effect: `feTurbulence` feeds `feDiffuseLighting` (a distant light
at 45°/60° azimuth/elevation lighting the noise as a bump map), producing real
raised-fibre relief rather than flat grain — the same underlying primitive a
real paper photograph's highlight/shadow relief comes from. That output (RGB
155–255 measured, at these settings) gets a closing `feColorMatrix` that pins
it to a constant alpha, then composites with `background-blend-mode: normal`
— **not themed anymore**; normal is what this technique needs in both themes,
matching how the reference site's own `opacity 0.2; mix-blend-mode: normal`
overlay composites. What still differs per theme is baked into the token
itself: a different constant alpha (0.20 light, 0.04 dark).

`multiply`/`screen` were self-limiting in one direction each — multiply's
worst pixel bounded to roughly `alpha ÷ 4` darkening, screen's to lightening
with no ceiling. `normal` has no self-limit in *either* direction: the same
image has a bright peak and a dark valley, so it can push contrast down by
lightening a dark-text background OR by darkening a light-text background,
depending which foreground token is looking at it. Any change to
`--paper-texture` must be re-verified the same way this pass was: render the
actual filter to a canvas, sample its real min/max (don't estimate it), then
composite both extremes — `bg × (1 − alpha) + litMin × alpha` and
`bg × (1 − alpha) + litMax × alpha` — and check every foreground token
(body text, secondary text, **and the accent** — an inline link is real paper
content) against both.

**Current alpha: `--paper-texture` 0.20 light / 0.04 dark; `--mat-texture`
0.22 in both themes, unchanged.** The asymmetry between light and dark isn't
cosmetic — it's the accent. Light theme's accent has real headroom (worst
case 5.68:1 even at the reference's own unmodified 0.20). Dark theme's
amber/bronze accent only has 5.34:1 to begin with, and a *white*-lit texture
erodes exactly that token fastest, since both trend toward white together —
0.20 there put it as low as 3.19:1, and 0.04 is the highest alpha that holds
every token ≥4.5:1 (accent worst-case 4.75:1; body/secondary text stay
≥12:1). This is the same shape of asymmetry the old multiply/screen version
already had (0.16 light / 0.05 dark) — dark theme simply has less contrast
budget to spend on texture, whichever blend mode is doing the compositing.

Both textures are static (no animation), so there's nothing to gate behind
`prefers-reduced-motion`.

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Body | InterVariable (Inter), self-hosted from rsms.me/inter/ | Weight 400 (Regular) only; `letter-spacing: -0.02em` (`--tracking-body`) — Inter's own recommended tight tracking for text sizes |
| Headings (h1–h4) | InterVariable | Weight 600; `letter-spacing: normal` (doesn't inherit body's -2%); `font-feature-settings: var(--font-feature-alt)` enables Inter's full character-variant bundle (single-story a, open digits, alternate 1/3, compact f/t, etc.) — the modern equivalent of the old "Inter UI var alt" cut, which is no longer published as a separate family/file |
| Eyebrows, meta, tags, code | IBM Plex Mono | Weight 400; uppercase eyebrows with `letter-spacing: 0.08em` (LTR only) |
| Arabic (RTL) headings/buttons | El Messiri | Applied via `[dir="rtl"] h1-h6, .btn` (substitutes for Commissioner); letter-spacing forced to 0 |
| Arabic (RTL) body/mono/eyebrow | Harmattan | Applied via `[dir="rtl"] body, .eyebrow, .mono` (substitutes for Inter and Geist Mono); letter-spacing forced to 0; falls back to InterVariable for any Latin text mixed into RTL content |

Type scale — headings are sized in `cqi` (1% of the paper's width), so type
scales with the sheet rather than the window. The rem values are guard rails,
not the intended size; the `cqi` term should win at most widths.

Proportions follow kami's ladder (36 / 22 / 16 / 13 / 11 / 10 / 9pt) compressed
into the span this site actually has: display is capped where it already sat and
body is pinned at 16px, so the whole ladder lives inside 2.5× rather than kami's
3.6×.

| Token | Value | Resolved | Use |
|---|---|---|---|
| `--text-display` | `clamp(1.75rem, 3.9cqi, 2.5rem)` | 28 → 40px | Hero one-liner only. **This is the ceiling — nothing goes above it.** |
| `--text-h2` | `clamp(1.3125rem, 2.14cqi, 1.375rem)` | 21 → 22px | Section titles, work-card titles |
| `--text-h3` | `1.1875rem` | 19px | Tile titles, subsection heads, stat values, pull quotes |
| `--text-lead` | `1.0625rem` | 17px | Intro paragraphs (`.lead`, `.hero .sub`, `.case-summary`) |
| `--text-body` | `1rem` — **fixed, do not scale** | 16px | Body copy; line-height 1.6; measure 65ch |
| `--text-small` | `0.875rem` | 14px | Card copy, meta, captions; line-height 1.45 |
| `--text-mono` | `0.75rem` | 12px | Eyebrows, tags, chips, index numbers |

**Only `--text-display` and `--text-h2` are fluid, and they share one window.**
That is deliberate, and it fixed a real defect: the three heading tiers used to
scale in `cqi` over completely disjoint ranges (display over a 718–1026px sheet,
h2 over 870–1130px, h3 over 1133–1267px). Because the windows never overlapped,
the ratios between tiers changed with viewport width and the hierarchy collapsed
at the most common one — on an 864px sheet the ladder flattened to
33.7 / 20 / 17 / 16, where h3 sat 1px above body. Both fluid tiers now reach
maximum at the same sheet width; everything below them is fixed, because a
stable ladder matters more at 17–19px than fluidity does.

**Ladder discipline**: every rendered `font-size` must land on a step above —
never between them. A reader cannot tell 13.5 from 14, so an in-between value
registers as noise rather than hierarchy. Audit with
`grep 'font-size:' css/styles.css | sort | uniq -c`.

**The 12px step is for uppercase micro-labels and badges only — prose stops at
14.** `.colophon`, `.cert-meta`, and `.play-hint p` were moved off 12px for
exactly this reason; they carry sentence-case text up to 29 words.

Body is deliberately excluded from the scale. 16px is the floor for readable
prose, and anything smaller makes iOS zoom on focused form inputs.

Line-height by role: `--leading-tight` 1.2 (headings), `--leading-body` 1.6
(reading prose), `--leading-dense` 1.45 (card copy, meta, captions — kami's
dense tier). Headings also carry `text-wrap: balance`; paragraphs carry
`text-wrap: pretty`.

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
  | `.more-work-grid` | 34em | 1 col → 2 cols |
  | `.prose` margin column (`.sticky-note--margin`) | 72em | single column → main column + margin annotations |

  `.facts-bar` specifically: 2 columns at 40em, not 4 — a case study's 5 facts
  (Role/Team/Timeline/Status/Scope) always put the last one, Scope, on its own
  full-width closing row (`.fact:last-child { grid-column: 1 / -1 }`), so a
  5-item list never wraps into a half-empty row.

- 8px rhythm: everything snaps to the scale. No magic numbers.

## 6. Section anatomy (index.html)

```
[skip link]
[header: name/logo · nav (Work, Skills, About) · dir toggle · theme toggle]  — sticky, see §7
01 hero        — eyebrow, one-line intro (h1), sub-line, two actions (View work / Download CV)
02 selected work — 4 rows: image + (index, year, title, description, tags, arrow)
03 skills & tools — scattered, draggable logo stickers (replaced the grouped
   text lists), see §7
04 about       — short bio + scrapbook photo stack, draggable, bleeds off
   the paper at desktop, see §7
[footer: contact email · social links · a11y & RTL statement · colophon]
```

Eyebrow pattern: `01 — Selected work` in Plex Mono, uppercase, text-secondary.
The numbering is real information: it mirrors nav order and page flow.

## 7. Components

### Site header (`.site-header`)
`position: sticky; inset-block-start: 0`, standard hide-on-scroll-down /
reveal-on-scroll-up pattern (Medium, GitHub docs, etc.) — `js/main.js` §8
drives it, `css/styles.css` supplies two state classes:

- `.is-header-hidden` — `transform: translateY(-100%)`.
- `.is-header-stuck` — `box-shadow: var(--shadow-whisper)`, the same lift a
  card gets on hover, the one depth cue this site allows itself.

**The gate**: above one viewport height (`window.innerHeight` — "the first
fold") the header just stays pinned, no hide/show at all — small scroll
adjustments near the top shouldn't make it jitter. Past that point, ANY
upward scroll reveals it immediately (no distance threshold: an upward
scroll reads as "take me back to nav"), and continued downward scroll hides
it. `is-header-stuck` is independent of the hide/reveal state — it's just
"has the visitor scrolled at all" (`scrollY > 0`), on regardless of which
direction.

**Accessibility**: a header that's visually off-screen must not still be in
the tab order — a keyboard user tabbing through mid-page content could
otherwise land on controls they can't see. When hidden, the header gets
`inert` (feature-detected via `"inert" in HTMLElement.prototype`), removed
the instant it reveals — the same pattern this codebase already uses for
modal focus containment. The `.skip-link` sits outside the header entirely
and keeps `z-index: 10` (header is `8`), so it's never occluded regardless of
header state.

**Motion**: `transform`/`box-shadow` transitions wrapped in
`prefers-reduced-motion: no-preference` — reduced motion still functionally
hides/reveals, just without the slide. Needs its own opaque
`background: var(--color-bg)` now that page content scrolls beneath it (it
used to be a normal in-flow block, inheriting the paper's background by
position; now it has to paint its own).

**Verification note**: the hide/reveal logic is throttled through
`requestAnimationFrame`, which — like all rAF-driven code — cannot be
exercised via live scroll simulation in a non-compositing test environment
(a hidden browser pane never fires rAF callbacks). It was verified instead by
running the actual `js/main.js` source in a Node `vm` sandbox with a stubbed
DOM, calling `updateHeader()` directly across a full scroll trajectory
(within-fold → past-fold-down → further-down → scroll-up → back-to-top) and
asserting `hidden`/`stuck`/`inert` at each step — same technique used to
verify the mat-driven accent derivation.



### Work card (`.work-card`)
- Whole row hover/focus-within: background shifts to `--color-bg-subtle`
  (pointer-gated hover, ungated focus-within — see §8 "Hover is always gated").
- Card-link pattern: title `<a>` gets an `::after` covering the row → whole row
  clickable, single tab stop, accessible name = title.
- `.work-card-media`: the image column. Default reading is **text only** —
  the placeholder box sits at `opacity: 0` at rest (not `display: none`, so
  the grid column stays reserved and nothing reflows) and fades to `opacity:
  1` only on the row's hover/focus-within, `--duration-base` motion-safe.
  Once a real thumbnail replaces the placeholder fill, it inherits this same
  reveal-on-hover behaviour for free.
- **Edge-to-edge, not inset.** Padding lives on `.work-card-content` (`
  --space-07 --space-06`), not on `.work-card` itself — the row is
  padding-free so the media column can fill it completely: full height via
  the grid's `align-items: stretch`, flush to the row's outer inline edge
  since it's the last grid track with nothing left inset around it. The text
  column supplies its own identical padding, so the reading experience is
  unchanged; only the image now runs top-to-bottom and edge-to-edge instead
  of sitting in a padded island. Corner radius (`--radius-md`) is a
  deliberate aesthetic choice, not a padding-derived one, now that there's no
  surrounding inset left to be concentric with. Verified flush on all three
  edges (block-start, block-end, outer inline-end) in both `ltr` and `rtl` —
  the grid's content-first column order (documented above) mirrors the media
  to the left edge under `rtl` automatically, no extra rule needed.
- Tags (`.tag-pill`): one fill for both `--design`/`--engineering` variants —
  `var(--color-concept)` text on `var(--color-tag-bg)`, both mat-driven (§3c).
  The variant classes stay on the markup but no longer style differently; the
  label text itself ("Design System" vs "Code Connect") is what tells the two
  apart.

### Certification item (`.cert-item`)
- `name · meta · [credential link] · status chip` per row, `flex-wrap`.
- `.cert-link`: optional, present only when a real, checkable credential URL
  exists. Styled as an in-text link (accent colour, underline, gated hover —
  the `.prose a` / `.footer-links a` vocabulary), not a button or a badge:
  it's a reference to outside proof, not an action this page performs. Each
  cert in `index.html` carries a commented `<!-- PLACEHOLDER -->` pair ready
  to uncomment once a credential ID/URL exists — never fabricate one.

### Tools sticker board (`.sticker-board` / `.tool-sticker`)
Replaced the earlier grouped text lists (`.skill-item` et al. — the gorix
"index · chip · name" pattern) with one board of logo stickers, one per
tool, on request. Each is a real `<button>` wrapping an `<img.tool-sticker-img>`
(the image's `alt` carries the tool name and doubles as the button's
accessible name), scattered and made draggable by `js/main.js` §9 — see
"Draggable objects" below for the shared drag mechanics and "Tool info
popover" for what the button *does*.

- **A real button, not a bare `<img>`, on purpose.** Clicking/tapping a
  sticker — without dragging it — opens a popover with its name,
  description, and proficiency (§ below). That's real content, so unlike
  the drag gesture itself (mouse/touch/pen only, by design) the button
  must be keyboard-focusable and answer Enter/Space like any other
  control on this site — a plain, non-interactive `<img>` couldn't. This
  is the one deliberate divergence from `.about-photo`, which stays
  exactly as decorative and keyboard-inert as before: it was never asked
  to carry a click-revealed payload, so it doesn't need to become
  interactive to satisfy WCAG 2.2 AA.
- **Size is ~2x the original** (`clamp(7rem, 18cqi, 11rem)`, was
  `clamp(3.5rem, 9cqi, 5.5rem)`) on request, with `.sticker-board`'s own
  `min-block-size` grown to `clamp(32rem, 80cqi, 46rem)` to match — the
  scatter grid below sizes its cells only from the sticker *count*, not
  their pixel size, so a bigger board is what actually gives bigger
  stickers more room per cell without touching the JS.
- **DOM order stays grouped by category** (design & UI, accessibility,
  AI/dev workflow, creative & process) even though the visual layout is
  randomized, so a screen reader still gets a sensible list. Adding a
  sticker later is just another `<button class="tool-sticker">` in the
  right category position — the scatter algorithm sizes itself off the
  sticker count, no code change needed.
- **Scatter, not a real layout system**: a loose N-cell grid sized to the
  sticker count, cell order shuffled (so DOM/category order doesn't leak
  into a left-to-right visual order), each sticker jittered to a random
  point inside its own cell plus a random `±12deg` tilt. Cheap
  collision-avoidance without physics. Regenerated fresh on every load —
  no seed, matching the no-persistence rule the drag feature itself
  follows.
- **The SVGs already bake in their own drop shadow** (a three-layer
  `feDropShadow`-style filter, verified by reading the source files) — no
  extra `box-shadow` needed here, unlike `.about-photo`'s `--shadow-paper`.
- **One reveal for the whole board** (`data-reveal` on `.sticker-board`
  itself), not one per sticker — these aren't a reading sequence, so a
  17-way stagger would just be noise.
- **Content is placeholder.** Every sticker's `data-description`/
  `data-proficiency` is literal placeholder text (`<!-- PLACEHOLDER -->`,
  same convention as the certifications section) — proficiency is a
  factual claim about Rolan, not something to invent. Replace all before
  publishing.

### Tool info popover (`.tool-popover`)
One shared `<dialog>`, built lazily on first use and appended to `<body>`
— same "purely additive" shape as the case-study image lightbox
(`js/main.js` §6), and its open/close mechanics are copied from that
lightbox one-for-one (`showModal()`, manual `Escape` handler alongside the
native one, backdrop-click-to-close, focus returned to the trigger on
close) rather than re-solved. A compact centered *card*, though, not a
full-bleed scrim replacing the page — it floats ON `--color-scrim` using
the site's own card tokens (`--color-bg`/`--color-text`), not the
lightbox's on-scrim ones.

- **`aria-labelledby`, not `aria-label`.** The dialog has a visible
  heading (the tool name), so its accessible name points at that heading
  by id rather than duplicating the string in an attribute — the WAI-ARIA
  APG's recommended pattern for a dialog with a visible title.
- **Proficiency reuses `.tag-pill` as-is** (see "Concept tags" below) —
  the same shape/fill contract every other badge on this site follows,
  already contrast-verified in both themes, not a new component.
- **Description/proficiency text stays English-only**, matching this
  project's existing "long-form content stays English in v1" rule for
  bios and case studies (`docs/CONTENT-GUIDE.md`) — only the close
  button (chrome) is bilingual, reusing `STRINGS[lang]["lightbox.close"]`
  rather than a duplicate key, since the label text is identical either
  way.

### Buttons & links
Two button variants, no third, both pill-shaped (`--radius-pill`):
- **Primary**: `--color-accent` fill, `--color-on-accent` text, matching border.
- **Ghost** (`.btn-secondary`): transparent, 1.5px `--color-accent` border,
  accent text; hover fills with `--color-tint-brand`. The ghost carries the
  accent rather than a neutral outline, so "this is an action" is signalled by
  the same ink that signals "this is a link" everywhere else.
- Both get `scale(0.96)` on `:active`, motion-safe only.
- In-text links: underlined always (never color-only), `text-underline-offset: 0.15em`.
  kami's own link rule (brand color, no underline) is **deliberately not
  followed** — WCAG 1.4.1 forbids color as the sole signal, and that outranks
  palette fidelity on this site.

**Badges are pills too** (`--radius-pill`), matching the buttons — `.tag-pill`,
`.tag`, and `.cert-status` all share one shape. Shape is therefore *not* what
separates an action from a label here; **fill and size are**. A button carries
the accent as a solid fill or a 1.5px border and sits at body size; a badge
carries a flat tint at 12px mono with no border. Keep that distinction when
adding either.

### Cards
One resting treatment and one hover treatment across the entire site — two
sections with different card physics read as two different products.
- **Resting**: `--color-bg-subtle` fill, no closed border, `--radius-md`. The
  lift *is* the fill.
- **Hover**: whisper shadow (`--shadow-whisper`) plus a 1px rise, via
  `.is-liftable`. Motion-safe and behind `@media (hover: hover)`.
  `:focus-within` gets the same treatment so keyboard users are not excluded.
- Never a ring shadow on a card: layering a ring over a surface that already
  has an edge stacks three outlines and reads digital rather than papery.
  Rings are for buttons, whispers are for cards.

**Every hover rule is gated behind `@media (hover: hover)`.** On a touch screen
`:hover` latches after a tap, so an ungated rule leaves the element stuck in its
hover state. `:focus-visible` is never gated.

### Theme + direction toggles
- Real `<button>`s with `aria-pressed` and visible labels
  (`AR / EN`, sun/moon glyph + sr-only text). 44px hit area.

### About: text column + scrapbook photos (`.about-text` / `.about-photos` / `.about-photo`)
Two photos styled like physical prints — tilted, stacked one below the
other, taped onto the paper with a corner deliberately bleeding past its own
edge onto the mat behind it. The one place on the site that breaks the
"whisper shadow only" rule (§8) on purpose: reuses `--shadow-paper` — the
same dramatic shadow that lifts the whole page off the mat — one level down,
since these are meant to read as objects sitting *on* the page rather than
cards *within* it.

- **Two dedicated grid tracks at desktop, not shared space.** `#about .prose`
  has exactly two direct children — `.about-text` (all six paragraphs) and
  `.about-photos` — and at `64em`+ becomes `grid-template-columns: 60% 1fr`.
  This replaced an earlier version where text found its own width (up to
  `65ch`) and the photos floated beside it hoping there'd be enough natural
  gutter; measuring the built page found a real 90px overlap at the paper's
  own `44rem` floor width (pinned across the *entire* `64em`–`~73.3em`
  range). A hard column split makes that collision impossible by
  construction — neither track's content can ever reach into the other's
  space, regardless of how the paper's fluid width happens to land — rather
  than something to keep re-verifying against a padding hack.
- **Below `64em` (tablet *and* mobile, deliberately grouped — not split at
  the `48em` tablet line): single implicit column, centered.** `.about-text`
  and `.about-photos` are `.prose`'s only two children, so with no
  `grid-template-columns` set they simply stack — full-width text, then the
  photos below it, `justify-self: center` + `margin-inline: auto`. This
  used to bleed to the far edge here too (the desktop treatment, below,
  reused verbatim) — changed on request: with no text running beside the
  stack at this width, an edge-bled block just reads as stranded space
  rather than composition, so it now sits in the middle of the room the
  text leaves behind instead. The **bleed-past-the-paper treatment is
  desktop-only now** — `justify-self: end` + the negative
  `margin-inline-end` bleed both move inside the `64em`+ media query, where
  the two-column grid gives the stack real text to sit beside.
- **Size**: `.about-photos { inline-size: clamp(16rem, 30cqi, 22rem) }` —
  raised from an earlier `clamp(11rem, 20cqi, 15rem)` on request, for more
  presence. Capped well under the source photos' real 800×800px so it never
  upscales past their native resolution.
- **The photo stack is a flex column** (`.about-photos { display: flex;
  flex-direction: column }`), not absolute-positioned percentages — an
  earlier version pinned the second photo at a fixed 62% down the first
  one's own box, which only looked right for whatever aspect ratio the
  placeholder square happened to have. Flex stacks each photo at its own
  natural height, so it holds for whatever aspect ratio a real photo turns
  out to be. `.about-photo--two` carries a small negative
  `margin-block-start` on top of the flex `gap` for a slight tuck/overlap —
  reads as one stack, not two separate cards.
- **Anchoring needs no `position: relative` anywhere in the base layout.**
  Nothing here is `position: absolute` at rest, so `.prose` doesn't need to
  be a containing block for it — a stray comment on `<body>` in
  `styles.css` used to claim `container-type: inline-size` alone makes it
  one for positioned descendants; checked directly with a throwaway
  absolutely-positioned probe, and it doesn't (the probe landed at the
  document origin, not body's box). This is exactly what makes the drag
  feature below work: a dragged photo switches to `position: absolute`
  and still resolves against the real document (the initial containing
  block), not some accidental ancestor containing block.
- **Draggable.** Each photo can be picked up (mouse/touch/pen) and moved
  anywhere on screen, including past the paper's edge onto the mat — see
  "Draggable objects" below, which the Tools sticker board (§7) shares.
- **Bleed offset**: `margin-inline-end:
  calc(-1 * var(--paper-margin-inline) - var(--space-09))` — the same token
  `.container` already spends on its own inline padding, cancelled out and
  then pushed further. Being logical, it mirrors to the paper's *left* edge
  under `[dir="rtl"]` automatically — verified directly (photos bleed off
  the left edge by the same 48px in RTL as they do off the right in LTR).
- **Mobile crop**: below `48em` the paper runs edge-to-edge with the
  viewport, so "past the paper's edge" would otherwise mean "past the
  viewport, causing horizontal scroll." `#main` gets `overflow: clip` (both
  axes — leaving one at `visible` forces UAs to compute it as `auto` instead,
  reopening exactly the scroll this exists to prevent) at that same
  breakpoint, right next to the rule that turns the mat image off. This is
  set on `#main`, not `body` or `html`: `body`'s overflow propagates up to
  become the *viewport's own* used overflow (`clip` turning into `hidden`
  in that propagated form), and iOS Safari has long-standing WebKit bugs
  locking up native touch-scroll on a root scroller with `overflow: hidden`
  until a pinch-zoom forces a relayout — this caused a reported case of the
  page being stuck on the first section on iPhone until the visitor
  pinch-zoomed. Setting it on `html` directly avoids that propagation path
  but is worse: the spec defines `clip` as having no scrolling user
  interface at all on the element it's set on, and combined with this
  site's global `scroll-behavior: smooth`, even `window.scrollTo()`
  silently no-ops — verified directly — which would break every in-page
  anchor link on mobile, not just touch-scroll. `#main` is a plain
  descendant box, so clipping it never touches the viewport's own overflow
  either way, while still covering every section that bleeds.
- **Content**: real photos now (`rolan-sq.jpg`, `rolan-extend.webp`, both
  genuinely 800×800 — `width`/`height` attributes match, no layout shift).
  Alt text describes what's actually in each photo.

### Draggable objects (`.draggable` / `--dx` / `--dy` / `--base-rot`)
Shared pointer-drag mechanics behind both the About photos and the Tools
sticker board, added by `js/main.js` §9. Pointer Events, not HTML5
drag-and-drop — the latter is built for reorder/dropzone patterns and
fights free-form dragging.

- **Composition, not literal `transform` writes.** Each component's own
  base class (`.about-photo`, `.tool-sticker`) declares
  `--dx`/`--dy`/`--base-rot`/`--hover-rot`/`--hover-scale` and one
  `transform` combining all five via `calc()`. JS only ever touches
  `--dx`/`--dy` (drag) or `left`/`top` (the pickup anchor); CSS only ever
  touches `--hover-rot`/`--hover-scale` (`:hover`). This is what lets the
  resting tilt still render with zero JS, and lets a CSS `:hover` cue and a
  JS-driven drag translate coexist without one clobbering the other — an
  inline `style.transform` string would have made hover impossible to
  layer on top.
- **`.draggable` is added by script, not authored in HTML.** Same "nothing
  promised that doesn't work" rule as the lightbox: cursor/hover affordances
  only appear once dragging has actually been wired up, gated behind
  `"PointerEvent" in window`.
- **Dragging itself has no keyboard equivalent, on purpose** — it's
  mouse/touch/pen only for both consumers. `.about-photo` gets no
  `tabindex`/role change at all, so it's fully keyboard-inert.
  `.tool-sticker` IS keyboard-focusable, but only because it's a real
  `<button>` for an unrelated reason (opening its info popover — see
  "Tool info popover" above); the drag gesture layered on top of that
  button still has no keyboard path, matching `.about-photo`.
- **Click vs. drag** (`.tool-sticker` only — `.about-photo` never passes
  `onClick`, so none of this runs for it): `pointerdown` no longer starts
  a drag by itself, only records the start position. The real pickup
  (measure, reparent, detach — everything below) runs lazily, the first
  time `pointermove` crosses an 8px threshold, so a plain tap never
  touches the DOM and the browser's own `click` fires normally afterward
  — which is also how keyboard Enter/Space reaches `onClick`, since
  activating a focused button produces a `click` with no pointer events
  at all, so the threshold logic simply never applies to that path. If
  the threshold *was* crossed, a `justDragged` flag swallows the one
  trailing `click` a browser still fires right after a real drag's
  `pointerup` — the standard technique any drag library uses to coexist
  with a native click.
- **`position: absolute`, not `fixed` — a dropped item scrolls with the
  page.** Fixed was tried first and was wrong: a dropped item stayed
  pinned to its spot on the *screen* as the page scrolled underneath it,
  so it visibly vanished the moment you scrolled away from wherever you'd
  dropped it. `position: absolute` against the viewport-sized initial
  containing block still allows a bleed past the paper onto the mat, but,
  being `absolute` rather than `fixed`, scrolls normally with the
  document instead.
- **Reparented to `<body>` on pickup, before repositioning.** `.about-photo`
  has no positioned ancestor, so `absolute` on it already resolves against
  the document — but `.tool-sticker`'s own parent, `.sticker-board`, is
  `position: relative` (needed for its base scatter layout's percentage
  `left`/`top`), which would make *that* the containing block instead,
  producing a large, disorienting jump on pickup (measured: ~300px) since
  the drag math assumes document-relative coordinates throughout.
  Reparenting to `<body>` (itself unpositioned) — done AFTER measuring the
  current rect but BEFORE switching `position` — sidesteps the whole
  category of "does some ancestor happen to be positioned" bug for every
  current and future draggable, rather than special-casing the sticker
  board. Every `.about-photo`/`.tool-sticker` rule is an unqualified class
  selector (no ancestor scoping), so nothing depends on where in the DOM
  the element actually lives.
- **Pickup**: `getBoundingClientRect()` at that instant (the first
  over-threshold move, per above — not pointerdown), converted from
  viewport-relative to document-relative by adding the current scroll
  offset (captured once per drag — `touch-action: none` + the
  in-progress `preventDefault()` keep the page from scrolling mid-drag,
  so it can't go stale) → `left`/`top` set to it (no jump, and correct
  regardless of whether the element started in flow or was already
  dropped elsewhere) → `--dx`/`--dy` reset to `0px`. All in one
  synchronous update alongside `.is-dragging` (`transition: none`), so
  nothing animates the jump.
- **Move**: `--dx`/`--dy` only, clamped so the element's rendered box
  stays fully inside the *current viewport* — reasoned in viewport space
  (using the position captured at pickup, before the document-relative
  conversion) since that's what's actually meant to stay on screen during
  the gesture itself.
- **Move tracking listens on `document`, not the dragged element.** Pointer
  capture is still requested as a secondary aid, but the real fix for a
  drag that visibly lagged behind the cursor: once an element left its own
  (now possibly tiny, now-elsewhere) bounds, an element-scoped listener
  could stop receiving events. `document`-level listeners always fire
  regardless of where the pointer is, filtered by `pointerId` so
  simultaneous multi-touch drags don't cross-talk.
- **Drop**: `.is-dragging` removed; no "bake into `left`/`top`" step —
  the next pickup just reads a fresh rect again.
- **No persistence.** Position is never written to `localStorage`; a
  refresh is the reset, by design (simpler, and avoids a returning visitor
  ever seeing a stale layout).
- **Resize safety**: a `resize` listener re-clamps every `.is-detached`
  element back inside the current viewport (adjusting `left`/`top` by
  whatever delta the *rendered* position needs — coordinate-system
  agnostic, so this needed no change when pickup switched from fixed to
  absolute), so a resize/rotation can't strand one somewhere unreachable.
- **z-index**: dragged/dropped items sit at `6`–`7`, under the header (`8`)
  and surface picker (`9`) — see §7's z-index note there.

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

### Press feedback
`scale(0.96)` on `:active`, on **every** pressable element — `.btn`,
`.toggle-btn`, and the surface picker's trigger, swatches, reset, and the
lightbox close button. Having it on some controls but not others is worse than
not having it: the ones without it read as controls that did not register the
press. Motion-safe only.

Never below `0.95` — anything smaller reads as exaggerated. Deliberately **not**
applied to `.figure-zoom`, which wraps a full-width image: at that size a 4%
scale is a large movement rather than a press cue, and the existing opacity
change already carries the feedback.

### The one popover
The surface-picker panel scales in from the corner it is anchored to
(`transform-origin: bottom right`, mirrored to `bottom left` under `[dir="rtl"]`
— `transform-origin` takes physical keywords and will not flip on its own).
`scale(0.97)` → `1`, 150ms, entrance curve. Never `scale(0)`: a panel that grows
from a point reads as a special effect rather than as a panel arriving.

Entry runs off `@starting-style` with `display` on an `allow-discrete`
transition, so it animates from the existing `hidden` attribute with no extra
class and no JS change. Browsers without `@starting-style` get today's instant
show/hide.

### Hover is always gated
Every `:hover` rule sits inside `@media (hover: hover)`. On a touch screen
`:hover` latches after a tap, leaving the element stuck in its hover state —
a shipped bug, not a nicety. `:focus-visible` is **never** gated: a keyboard
user needs that cue on every device, and it does not latch.

## 8b. Forced colours (Windows High Contrast)

Because cards are carried by their fill and not by a border, and forced-colours
mode overrides `background-color` and drops `box-shadow`, every card would lose
all definition there. `@media (forced-colors: active)` restores a
`1px solid CanvasText` border on card and chip surfaces — the one place the
no-closed-border rule is traded away, because in that mode the fill it depends
on does not exist. The focus ring switches to the system `Highlight` colour.

## 8c. Focus on the scrim

The lightbox scrim is theme-invariant (near-opaque black in both themes), so
the theme's own focus colour is the wrong one inside it: in light theme that is
ink blue, which measures **1.52:1** against the scrim — an invisible ring on the
close button for keyboard users. `.lightbox :focus-visible` overrides
`outline-color` to `--color-on-scrim` instead (18.4:1).

The general rule this comes from: a focus indicator must be verified against
**every** colour it can land on, not just the page background.

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
