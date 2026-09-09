# Desk system — decision log

What changed on `index.html`, why, and what to carry over when the same
material system gets applied to the case-study pages (`work/*.html`).
Written after the fact, from the actual sequence of decisions — not a
spec written up front.

## 1. What replaced what

| Old system | New system |
|---|---|
| One continuous "paper on a mat" — `<body>` itself was the sheet, full page height | Each `<section>` is its own separate paper card; the mat shows through in the gaps between them (`#main { display:flex; flex-direction:column; gap:… }`) |
| Token-derived color palette (`--color-*` computed from the mat-picker's chosen hue) | Fixed hardcoded palette from `docs/paper-stack-lab.html`'s own Rev C values — independently re-verified by computing contrast ratios, not copied on trust |
| Light theme + dark theme (`[data-theme="dark"]`) | One committed theme, site-wide. Dark theme removed entirely — tokens, JS toggle, and the header/segmented-bar UI for it |
| Mat-color picker (recolor the mat, derives a matching accent) | Removed from `index.html` only. **Still present and working on every other page** — case studies, colophon, 404. This is the one piece of the old system intentionally *not* migrated yet |
| Geist Mono / Caveat | IBM Plex Mono / Architects Daughter — swapped site-wide (shared tokens, not index-only) |
| Sticky header attached to the paper's top edge | Header detached: floating, blurred glass, independent of any card, always at the same visual layer above every card |
| `.work-card-media` images always fetched (hover-gated only, `loading="lazy"` didn't actually skip mobile) | `data-src` + a `ResizeObserver`-gated script only sets `src` once the container is wide enough — verified via Resource Timing API, not assumed |

## 2. The card model

- **Six top-level cards on `index.html`**: Hero+Highlights (merged into one), Work, About, Skills, Certifications, Contact.
- **Every top-level card is now the same stock: `.sheet.p-graph`** (graph/grid paper). This was a late correction — cards started out varied (kraft board for Work, index card for About, sticky note for Contact, etc.) and got unified for consistency once seen side by side. **Carry this over as-is**: case-study pages should give each major section the same `.sheet.p-graph` treatment, not a different stock per section.
- **Nested item-level cards keep variety.** Inside Work, the five project tiles each use a *different* stock on purpose (Blueprint→cyanotype, Healthcare SaaS→vellum, two others→sticky note, Incridea→ruled index card) — this was a deliberate, explicit request, distinct from the top-level "keep it consistent" rule. The pattern to reuse for case studies: **the page-level sections are uniform graph paper; only content that specifically calls for a different material (a named artifact, a quote, a metric callout) gets a distinct stock.**
- **No card is translucent on its own.** `.p-trace` (vellum) needs an opaque card *behind* it to look right — it was tried as a top-level section background directly on the mat and looked wrong (mat green tinting through). Only use `.p-trace` for something sitting *on* another card, never as a section's own base.

## 3. Header

- Detached from the paper entirely: `position: sticky`, but its own floating glass bar, not visually part of any card.
- `background: rgb(27 99 83 / 0.92)` + `backdrop-filter: blur(20px)`. The opacity is deliberately high — **there is no lower opacity that keeps white text ≥4.5:1 against every possible backdrop scrolling behind it.** The fix for "translucent but always legible" is making the header's own tint dominant enough that the backdrop barely shows through in color terms; the blur is what still sells "glass."
- All header text/icons are white, not the site's usual dark ink — the mat-green tint is dark, so dark-on-dark would fail outright.
- No blue accent color inside the header (hover/pressed states): `--color-accent` against this dark tint drops under 2:1. Feedback states use opacity/underline instead of a color swap.
- Buttons/toggle chrome inside the header are transparent at rest, a faint white fill only on hover — no border, no filled pill background.

## 4. Footer

- Moved outside `<main>`, sits directly on the mat (no card wraps it).
- Full-bleed to the actual viewport width via the standard `inline-size: 100vw; margin-inline-start: calc(50% - 50vw)` break-out — **this requires `overflow-x: clip` on `<html>`** (not `hidden` — `clip` doesn't create a scroll container, so it can't interfere with the header's `position: sticky`). Without it, `100vw` overshoots the real viewport by the scrollbar's width and the page gets a few px of real horizontal scroll.
- Text color: white at 0.72 alpha (matches `paper-stack-lab.html`'s own `.mat-foot` recipe), not the site's default secondary ink — the mat is dark, secondary ink is a dark warm grey, that pairing is close to invisible.
- **A block-level element with a `max-inline-size` clamp (the site-wide `p { max-inline-size: var(--measure) }` rule) needs `margin-inline: auto` to actually center — `text-align: center` alone only centers the text *inside* the box, not the (now narrower) box itself.** This bit twice in this pass (once here); worth remembering for any other centered text block that inherits the same `p` rule.
- The "line to mark the end" is a short (96px), centered `::before` rule, not a full-width border — a full-bleed border read as a second section edge, not a mark under the copyright line.

## 5. Cards + the mat: the isolation requirement

**`.sheet` must carry `isolation: isolate`.** `.sheet::after` (the grain texture) uses `mix-blend-mode: multiply`. Without an isolating ancestor, a blend mode composites against *everything* behind it in the same root stacking context — including the mat's own fixed light-field layers (`html::after`, `z-index: -1`) sitting behind the opaque card. This was invisible on the single-sheet layout (nothing but body's own background was ever behind the blend) and only surfaced once cards became separate objects with the mat genuinely visible behind them: the mat's dark corner-lobe gradient was visibly bleeding through onto the paper's surface. Any new stock or card-like component built on `.sheet` gets this for free; anything that reimplements a grain/texture blend from scratch needs to isolate it deliberately.

## 6. Contrast pairings actually computed (not eyeballed) this pass

- Kraft (#AD8A5F) caps white text at ~3.2:1 — no shade of white clears AA on it. (This is *why* kraft got dropped from every top-level card in favor of graph paper — it's not just a consistency call, it's a contrast ceiling.)
- Blue accent on kraft: 2.26:1 — fails both text and focus-ring contrast. Same reason blue-accented content (Contact's link row) can't sit on kraft.
- White text at 0.92 opacity on the header's mat tint, worst case against the lightest stock on the page (`--dk-card`, #FCFBF6): 4.83:1.
- Footer text, white at 0.72 alpha, on the plain mat: 5.39:1.
- Every stock/ink pairing already in `css/desk.css`'s own header comment carries its verified ratio inline — check there before reusing a stock in a new context rather than assuming a pairing that worked once works everywhere.

## 7. What's still index.html-only (not yet decided for the rest of the site)

- The mat-color picker: removed from `index.html`, still live everywhere else. Case studies still let a visitor recolor the mat; index.html no longer does. Whether case studies should also drop it, or index.html should get it back in some form, hasn't been decided.
- `css/desk.css` itself is written to be self-contained and index.html-exclusive (it says so in its own header comment) — it doesn't touch `tokens.css`'s original values, specifically so nothing here could regress another page. Applying this system elsewhere means either promoting parts of `desk.css` into something shared, or giving each case study its own equivalent file — that choice hasn't been made yet, and matters most for the palette/token-override block (section 1 of `desk.css`), since that's what every other page would need to inherit to render "the same" cards.
