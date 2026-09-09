# material.css — Claude Code handoff

Rev D · 2026-09-09. Point a Claude Code session at this file. It is the complete
brief for the material layer; it should not need to read the reference sites, the
lab artifact, or re-derive any of these values.

**Rule for the whole task: `material.css` is ADDITIVE.** It loads after the
existing token sheet and only adds. Do not edit the token layer. Do not
restructure the HTML except where noted under Redaction.

---

## 0 · Prerequisite (do this first, it pays for itself immediately)

`--mat-image` is a 24,619-character inline SVG data URI and `--paper-texture` is
another 924. Move both to files:

    assets/mat.svg          <- from --mat-image
    assets/paper-grain.png  <- optional; the inline noise below is fine

Then reference with `url(assets/mat.svg)`. That data URI costs ~7k tokens on
every single read of the stylesheet, in every future session.

---

## 1 · Light and material

Light sits at ~300° (upper-right) and never moves. Every shadow offsets
negative-X, positive-Y.

```css
:root{
  --grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");

  --sh-flat:  -1px 1px 1px rgb(6 26 21/.34), -3px 5px 8px rgb(6 26 21/.22), -8px 14px 26px rgb(6 26 21/.14);
  --sh-thin:  -1px 1px 1px rgb(6 26 21/.26), -2px 4px 6px rgb(6 26 21/.14);
  --sh-card:  -1px 1px 0 rgb(6 26 21/.38), -3px 6px 8px rgb(6 26 21/.24), -10px 20px 34px rgb(6 26 21/.16);
  --sh-trace: -1px 1px 1px rgb(6 26 21/.14), -3px 6px 12px rgb(6 26 21/.10);
  --lit-edge:  inset 0 1px 0 rgb(255 255 255/.58);
  --dark-edge: inset 0 -1px 0 rgb(0 0 0/.07);
}
```

Ramp height scales with stock: card taller, newsprint shorter, **vellum halved**.
Translucent paper casting a full shadow is the main tell that kills the illusion.

### The mat's light field
Three white lobes, two black, irregular and off-centre, one dark lobe hard in a
corner. `blur(72px)` + `soft-light`. Measured from Rolan's reference posters:
~±23% luminance swing with multiple local maxima. Clean radial gradients read as
CG; this reads as a photograph.

```css
.mat{position:relative;isolation:isolate;background:var(--color-mat);overflow:hidden}
.mat::before{                       /* light — MUST sit above the grid */
  content:"";position:absolute;inset:-14%;z-index:-1;pointer-events:none;
  filter:blur(72px);mix-blend-mode:soft-light;
  background:
    radial-gradient(38% 30% at 26% 22%, rgb(255 255 255/.92), transparent 68%),
    radial-gradient(46% 36% at 63% 58%, rgb(255 255 255/.80), transparent 70%),
    radial-gradient(30% 22% at 14% 78%, rgb(255 255 255/.44), transparent 72%),
    radial-gradient(44% 34% at 92%  6%, rgb(0 0 0/.95),        transparent 66%),
    radial-gradient(40% 30% at  4%104%, rgb(0 0 0/.70),        transparent 70%);
}
.mat::after{                        /* grid + weave — BELOW the light */
  content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;
  background:
    linear-gradient(45deg, transparent calc(50% - .5px), rgb(255 255 255/.13) calc(50% - .5px) calc(50% + .5px), transparent calc(50% + .5px)),
    repeating-linear-gradient(90deg, rgb(255 255 255/.11) 0 1px, transparent 1px 46px),
    repeating-linear-gradient( 0deg, rgb(255 255 255/.11) 0 1px, transparent 1px 46px),
    repeating-linear-gradient(90deg, rgb(255 255 255/.035) 0 1px, transparent 1px 4px),
    repeating-linear-gradient( 0deg, rgb(0 0 0/.05)        0 1px, transparent 1px 4px);
}
.mat > *{position:relative;z-index:1}
```

Two z-index rules that are not optional:
- **Light above grid.** If the grid paints over the field, the lines stay
  uniformly bright everywhere and the surface reads as flat. This single swap
  was the largest jump in realism in the lab.
- **Light on the mat only, never on the paper.** The paper must catch flatter,
  duller light than the surface under it. That specularity difference is how an
  eye separates two materials.

Grain: **mat 10-12% over `overlay`, paper 4% over `multiply`.** One tile, two
opacities. Heavy grain on cream paper just reads as dirty.

---

## 2 · Paper stocks — one `.sheet` base plus a modifier each

```css
.sheet{position:relative;background-color:var(--color-bg);
       box-shadow:var(--sh-flat),var(--lit-edge),var(--dark-edge)}
.sheet::after{content:"";position:absolute;inset:0;pointer-events:none;
  opacity:.045;mix-blend-mode:multiply;background:var(--grain) 0 0/160px repeat}
```

| Class | Stock | Job |
|---|---|---|
| `.p-graph` | grid paper `#F7F2E3`, fine 8px `#ECE5D3`, major 40px `#E2DAC3` | main sheet |
| `.p-trace` | vellum, 60% opaque, `backdrop-filter: blur(1.4px) saturate(.88)`, **halved shadow** | annotations, NDA overlay |
| `.p-kraft` | `#AD8A5F`, matte — **no lit edge, no specular**, fibre flecks at 4 prime sizes | folder tabs, dividers |
| `.p-news` | `#E3DFD2`, 3px halftone dots, 2-part shadow | writing / articles |
| `.p-card` | `#FCFBF6`, ruled 1.55rem, red rule at 2.6rem, taller ramp + 1px cut edge | metrics |
| `.p-sticky` | `#FBF3D4`, 178° gradient for the adhesive strip, CSS corner curl | callouts |
| `.p-blueprint` | `#123A8F`, major 18% / fine 8% white lines, `blur(.3px)`, text bloom | dark mode |

Realism order of impact: **translucency > contact-shadow tightness > edge cut >
rotation.** Rotations under 2.5°, all different, never exactly 0.

Shipping variants: **Desk** (kraft + graph + card + sticky) for document-proof
case studies · **Light table** as dark mode · **Working drawing** (mat + graph +
vellum) for token-architecture sections.

---

## 3 · CONTRAST GATE — the grid is a legibility surface

Text on graph paper is measured against the **darkest thing it crosses**, which
is the grid line, not the paper. Three inks were failing AA before this fix.

| Text over a major grid line | Before | After |
|---|---|---|
| body ink `#1B1D1A` | 8.73 | **12.16** AAA |
| secondary `#54574F` | 3.78 FAIL | **5.28** AA |
| mono labels → `#5E6157` | 2.42 FAIL | **4.53** AA |
| blue annotation `#2B4FB8` | 4.11 | **5.17** AA |
| red flag → `#9E3122` | 4.23 FAIL | **4.71** AA |
| cyanotype body on white line | 4.00 FAIL | **5.59** AA |
| mat footer caption → `.72` alpha | 2.38 FAIL | **4.54** AA |

Grid stays visible at 1.12:1 (fine) and 1.25:1 (major) against the paper.

Side effect worth knowing: the feathered cream pad behind hero text became
unnecessary and was **deleted**. The accessibility fix made the CSS shorter.

**Standing rule:** any new texture, tint, grain or blend that sits under text
gets this computation before it ships. This site hosts a WCAG case study.

Escape hatch if a display moment ever needs a stronger grid: suppress the 8px
lines under running text, keep the 40px majors. One class.

---

## 4 · Edges — mask, not border

Assets: `assets/edge-torn-top.png`, `assets/edge-deckle-top.png` (2400×36 alpha
strips, 15KB and 8KB). Tileable — sine bands at integer frequencies.

```css
.p-torn,.p-deckle{--edge:36px;
  mask-size:auto var(--edge),100% calc(100% - var(--edge) + 1px);
  mask-position:top left,bottom left;
  mask-repeat:repeat-x,no-repeat;
  -webkit-mask-size:auto var(--edge),100% calc(100% - var(--edge) + 1px);
  -webkit-mask-position:top left,bottom left;
  -webkit-mask-repeat:repeat-x,no-repeat}
.p-torn  {mask-image:url(assets/edge-torn-top.png),linear-gradient(#000,#000);
  -webkit-mask-image:url(assets/edge-torn-top.png),linear-gradient(#000,#000)}
.p-deckle{mask-image:url(assets/edge-deckle-top.png),linear-gradient(#000,#000);
  -webkit-mask-image:url(assets/edge-deckle-top.png),linear-gradient(#000,#000)}

/* GOTCHA: a mask erases box-shadow. Shadow moves to a wrapper, where
   drop-shadow correctly follows the torn silhouette instead of a rectangle. */
.edge-wrap{filter:
  drop-shadow(-1px 1px 1px rgb(6 26 21/.34))
  drop-shadow(-3px 5px 8px rgb(6 26 21/.22))
  drop-shadow(-8px 14px 22px rgb(6 26 21/.14))}
.edge-wrap > .sheet{box-shadow:none}
```

**Scope decision: the main sheet stays blade-cut.** A cutting mat exists because
you cut straight lines on it; a torn hero sheet contradicts the set. Torn is for
a notebook page inside a case study and the kraft folder tab. Two elements, not
a system.

---

## 5 · NDA redaction on the vellum overlay

**The sensitive string must be absent from the DOM.** A black bar over real text
is a disclosure bug — Ctrl+A, view-source and screen readers all reveal it. The
bar is a stand-in for content that was never sent.

```html
<p>Three-tier model shipped for
   <span class="redact" style="--ch:22" aria-label="Client name withheld under NDA"></span>,
   a <span class="redact" style="--ch:9" aria-label="Sector withheld under NDA"></span>
   platform serving six products.</p>
```

```css
.redact{display:inline-block;position:relative;
  inline-size:calc(var(--ch,8) * .55em);block-size:1.02em;vertical-align:-.19em;
  background:#15140F;border-radius:1.5px;transform:rotate(-.45deg);
  box-shadow:0 0 0 .5px rgb(21 20 15/.45),-1px 1px 2px rgb(21 20 15/.22)}
.redact::before{content:"";position:absolute;left:-2%;top:8%;width:104%;height:88%;
  background:#15140F;opacity:.75;border-radius:2px;transform:rotate(.7deg);filter:blur(.4px)}
.redact::after{content:"";position:absolute;inset:-1px;border-radius:2px;
  box-shadow:inset 0 0 2px 1px rgb(21 20 15/.5)}
```

Two overlapping marker passes at different rotations plus ink bleed. A single
sharp rectangle reads as a div; a real marker never covers in one stroke.

The redaction lives on the **overlay**, not the drawing — which is how a
reviewed drawing actually works, and means one case study can publish at two
clearance levels by swapping one sheet. The overlay must never sit over text the
reader needs; constrain the text column and let the vellum land in the gutter.

---

## 6 · Arabic — three swaps, not a pass

The existing RTL configuration stays. Change only these:

| | From | To |
|---|---|---|
| body | Harmattan | **IBM Plex Sans Arabic** |
| display | El Messiri | **Reem Kufi** |
| stack order | Arabic-first | **Latin-first** |

Harmattan is a SIL text face for West African Arabic, not a UI face; it thins
out badly at 15-17px. Reem Kufi is geometric Kufi — the script of architecture,
tilework and inscription — so on a drafting table it is concept-true, not
decorative. Warmer alternative for display: **Amiri**, a Naskh revival of the
Bulaq Press type. All verified live on the Google Fonts css2 API 2026-09-09.

### Untranslated technical terms keep the English face — automatically

```css
--f-text-ar:    "Commissioner", "IBM Plex Sans Arabic", system-ui, sans-serif;
--f-display-ar: "Fraunces",     "Reem Kufi",            Georgia,   serif;

[dir="rtl"], :lang(ar){
  letter-spacing: normal;        /* tracking shatters connected script */
  font-feature-settings: normal;
  line-height: 1.95;             /* ~+0.25 over Latin: dots, deep descenders */
  text-align: start;
}
```

Latin first, **including on the Arabic side**. Commissioner and Fraunces ship no
Arabic subset — checked against the Google Fonts API, they carry latin,
latin-ext, cyrillic, greek and vietnamese only. So the browser resolves font per
character: Arabic finds no glyph in Commissioner and falls through to Plex
Arabic, while `tokens`, `Code Connect` and `WCAG 2.1 AA` hit Commissioner first
and stay in the English face. No spans, no classes, no JavaScript.

Note the trap: every one of these Arabic families **also** ships a `latin`
subset. Listing the Arabic face first would render embedded English in Plex
Arabic's Latin instead of Commissioner. Order is the whole mechanism.

### Bidi is a separate problem from font fallback

Wrap every embedded Latin run in `<bdi>`:

```html
<p lang="ar">بنيت نظام <bdi>Blueprint Design System</bdi> بالكامل — من معمارية
<bdi>tokens</bdi> إلى <bdi>Code Connect</bdi> — ثم وجّهت نموذجًا لغويًا لتوليد
واجهة أمامية بنسبة تطابق 80% في سبعة أيام.</p>
```

`<bdi>` is a native element whose entire purpose is this; it defaults to
`unicode-bidi: isolate`, needs no CSS and no `dir`. Without it, Latin runs
reorder wrongly at the boundaries and adjacent punctuation jumps to the wrong end.

Also:
- **Arabic labels get no uppercase tracking.** No case in Arabic, and tracking
  breaks the joins. Signal a label with weight 600 and a size step.
- **Keep Western digits** for technical figures. `80%`, `35 → 0`, `WCAG 2.1 AA`
  read as terms of art; Eastern Arabic-Indic numerals make metrics harder to scan.
- If Arabic looks small beside the Latin, add `size-adjust: 105%` to a
  self-hosted Arabic `@font-face` rather than bumping `font-size` in a media
  query. Needs eyeballing — there is no formula.

---

## 7 · Verification gate — none of this ships without it

1. axe / Lighthouse on a throttled connection
2. Keyboard focus visible on every lifted artifact (hover-lift must have a
   focus equivalent)
3. RTL pass with the new faces, checking dot and diacritic collisions at 1.95
   line-height
4. `@media (prefers-reduced-transparency: reduce)` — vellum drops
   `backdrop-filter` and becomes opaque
5. `@media (prefers-reduced-motion: reduce)` on every lift and transition
6. Confirm no redacted string exists anywhere in the served HTML: `grep -ri` the
   real client names across `dist/` and fail the build if any hit

---

## Not built yet
- Torn edge applied to the notebook artifact and kraft tab (assets are ready)
- Reduced-transparency fallback
- View-transition page tear (`@view-transition { navigation: auto }`)
