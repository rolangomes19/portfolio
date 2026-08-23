# Blueprint DS — Case Study Working Draft & Decision Log

*Internal working document. Source material for the polished portfolio copy, not the copy itself. This version cross-references the actual source docs (button.md, color-system-docs-v2.html, dataviz-color-reference.html, and the token JSONs) against everything captured so far. Per your instruction, JSON token files are treated as latest when they conflict with anything else; the HTML docs are treated as reasoning/logic references, not as the source of truth for exact values.*

---

## Status

- **Phase 1 — complete.** Figma component kit, color/typography/spacing/elevation/iconography foundations, all documented.
- **Phase 2 — in development.** React port, Code Connect, built with one frontend engineer, targeting a task management proof of concept inside the Hub platform first.
- **Adoption — not yet live in production.** A design-to-code proof of concept hit an 80% accurate LLM component conversion rate. Phased adoption is the pitch that result supports, not something that's happened yet.
- **NDA masking:** firm referred to as "the firm," internal platform as "the Hub platform."

---

## ⚠ Conflicts — status

Cross-referenced against button.md and color-system-docs-v2.html. Two are settled with clear decisions below; two remain genuinely open and need your call before this goes into portfolio copy.

### 1. Focus ring: outline vs. box-shadow — RESOLVED

**Decision: outline.** The Safari <16.4 border-radius bug that motivated the foundation doc's box-shadow recommendation is no longer a live concern. button.tsx uses `focus-visible:outline` consistently, matching button.md's actual code. The foundation doc (`color-system-docs-v2.html`) is the one that needs updating to stop recommending box-shadow for focus rings — it currently still tells the opposite story.

### 2. Critical vs. Destructive vs. Danger — RESOLVED, one concept, deliberate naming

All three names refer to the same intent. **"Critical" is the deliberate choice, and it's a real decision worth a line in the case study**: red in this system isn't reserved only for destructive actions, it's used anywhere something needs the user's immediate attention. "Critical" communicates that broader meaning; "Destructive" and "Danger" both describe only a subset of what the color is actually used for. `Component.tokens.json`'s "Destructive" and `colors-semantic.tokens.json`'s "Danger" are the token-layer names that predate this decision and should get reconciled to "Critical" (or documented as intentional aliases) so the vocabulary stops drifting across files.

### 3. Button prop names — RESOLVED

**Decision: button.md's naming is correct.** `intent` (positive/neutral/critical), `btnStyle` (not `variant`) for solid/outline/ghost, `size` (`md`/`sm`/`icon`/`icon-sm`), `shape` (not `corner`) with values `rect`/`pill` (not `rectangular`/`rounded`). button.tsx has been revised to match.

### 4. Button sizing — RESOLVED

**Decision: button.md's numbers are correct.** Medium = 36px (`h-9`), Small = 24px (`h-6`), plus dedicated square `icon`/`icon-sm` sizes rather than reusing the text-button heights. button.tsx has been revised to match.

### 5. Corner radius on the Button specifically — RESOLVED, and it's a real divergence from button.md, not an error

**Decision: rect = `rounded-md` (4px), staying with button.tsx's original value.** This is a deliberate call, not a correction — button.md's own Shape table says `radius/sm` (2px) for rectangular, and that's what the JSON scale would also suggest. button.tsx is being treated as the reference file, so 4px is what ships; button.md's documentation needs to be updated to match rather than the other way round. Worth being explicit about this in the case study if it comes up: the token scale and the doc said one thing, the actual component shipped with a different, considered choice.

The broader radius scale question (JSON vs. the HTML foundation doc's concentric-radius numbers, for components other than Button) is unaffected by this and still worth a five-minute check if you use the concentric-radius story elsewhere in the case study.

### 6. Icon-only + Critical — RESOLVED, button.md's rule doesn't apply here

**Decision: icon-only Critical buttons are allowed.** An icon-only delete button is fine in this system. button.md explicitly prohibits this pattern ("Icon-only Critical buttons are prohibited... label must be visible"); that rule isn't being adopted. What is being adopted from button.md: icon-only buttons require both `aria-label` and a visible tooltip, no exception for intent. button.tsx enforces the tooltip+aria-label pairing at the type level and no longer restricts icon-only by intent.

### 7. Purple's role — RESOLVED: real, recent, incomplete — exclude from the case study

Purple was brought in recently, specifically to mark AI-generated content, which is why it doesn't show up in the foundation doc's color-science-only "accent" framing or in the semantic token file, it hasn't been fully built out yet. **Leave it out of the case study entirely for now** rather than presenting a partially-built intent as a finished part of the five-color system. If it's fully built out later, it's a genuinely good addition to add back in, distinguishing AI-generated content from associate-generated content is a real, differentiated idea, just not one to claim before it's real.

### 8. Brand blue anchor — RESOLVED: #004DFF is the anchor, no revision history

**Decision: present `#004DFF` as the blue the system started with, not a fix applied to an earlier candidate.** Drop the "corrected from #0050FF" framing entirely — the underlying reasoning stays the same and is still true: blue needed to hold up against black as much as against white, since blue elements are frequently paired with black text and used directly on black backgrounds in banners, buttons, and marketing graphics, not just blue-on-white body copy. That decision anchored blue-500 in OKLCH, and every other hue in the system — red, green, yellow, the tinted greys — was built downstream of it by holding lightness constant against that same anchor and adjusting hue and chroma. That's also why yellow's anchor moving to 600 instead of 500 reads as a considered exception rather than an inconsistency, rather than a second "correction" story stacked on top of the first.

**Threshold note, keep in mind if a specific contrast claim gets added to the case study copy:** `#004DFF` against pure black works out to roughly 3.5:1 by standard WCAG relative luminance (the same method gives `#004DFF` 5.99:1 against white, matching `color-system-docs-v2.html`). That clears the WCAG minimum for large text, UI components, and graphical elements (3:1), not the stricter normal-text minimum (4.5:1). Stay qualitative in the copy ("chosen to hold up against black") rather than asserting a specific pass/fail number — if a number gets added later, use "meets the large-text/UI-component minimum against black," not an unqualified "AA compliant."

---

## 1. Problem & Trigger

The firm's brand system was built for print and editorial, never for product. Into that gap, engineering teams filled in their own interpretations, on different stacks, with no shared reference point.

The trigger wasn't abstract. Inside a single project, the same button component had four different implementations built by four different developers. No shared framework, no single source of truth, and cross-team collaboration suffered because of it. That's the moment the need stopped being a design preference and became a documentation and definition problem.

I took this to the firm's internal IT Director and proposed building a design system. That pitch got approved with assigned hours per sprint, which is what actually funded the work.

**Still open (minor):** one connective sentence showing how the "four button implementations" trigger merged with the broader brand/web-guidelines problem into a single initiative.

---

## 2. Why a Design System, Not Just a Style Guide

Multiple versions of the same component meant no unified control and no unified styling. Every bug or component change had to be fixed locally, page by page, turning simple fixes into tedious, repeated work across the codebase. Exact cost wasn't tracked, but the pattern itself is specific enough to carry the point without a number.

---

## 3. Scope: Phase 1 to Phase 2, and the Pivot

Phase 1 was Figma and documentation only. The task: audit the most heavily used components inside the Hub platform, then build them from scratch as a UI component kit, defining color, typography, spacing, elevation, iconography, and the other atomic structures underneath before building a single component.

The pivot to Phase 2 came out of a realization mid-Phase 1: a well-defined, well-documented design system doesn't just make Figma consistent, it makes a design-to-code workflow possible. A frontend engineer joined the team, background in React, Base UI, Radix UI, and Tailwind CSS. The decision was to move fast on getting components into code, starting with the task management proof of concept inside the Hub platform.

**Role split, confirmed as peer collaboration.** I owned design, definitions, documentation, and foundational architecture decisions. The frontend engineer owned how it came together in code, including Code Connect, with real ownership of that domain.

---

## 4. Typography: Brand Identity vs. Product Legibility

Phase 1 launched with the brand's editorial typography: Anton, Montserrat, Lora. It didn't hold up in a data-heavy product UI. Anton, all caps with thick strokes and designed for large display sizes, was hard to read as a title font at product scale. Montserrat's wide character width made it inefficient for showing dense data.

The fix, per `typography.md`: **Inter Tight** for Display and Headings (not just "Inter" — the condensed variant specifically, chosen for authoritative high-legibility at large sizes), **Roboto Flex** for body (a variable font with fine-grained weight control, tuned for dense data interfaces), and **Roboto Mono** for data values, IDs, and code snippets. The decision came down to readability, simplicity, and legibility at small sizes.

**New: a real accessibility feature, not just a legibility fix.** The system includes a fourth typeface, **Atkinson Hyperlegible Next**, designed specifically for low-vision readers, wired in as a user-facing accessibility preference — activating it swaps the `FontFamily/Body` binding across every Text Style without touching scale, size, or line-height. This is worth its own line in the case study: it's a concrete, shippable accessibility feature, not a contrast-ratio checkbox.

**Architecture worth naming:** font family and weight live only in the primitive layer, never in semantic tokens — they're bound directly inside each Text Style. If the typeface needs to change system-wide, one primitive updates and every Text Style follows. Same reasoning pattern as "why components only consume Tier 2" in the token architecture section, worth linking the two explicitly as one consistent principle applied twice.

**Conflict to flag:** `typography_primitives.tokens.json`'s `LineHeight` group is `16, 20, 24, 28, 32, 40`. `typography.md`'s own primitive list and its type scale table both use `18` (not `16`) for the smallest step, and `numbers.primitive.tokens.json`'s separate `LineHeight` group (under a "Base" mode) also has `18`, not `16`. So the doc and one JSON agree on 18; a different JSON has 16. This affects the `label` style specifically: at 12px/18lh it's a clean 1.5× ratio (matches the doc's stated ratio); at 12px/16lh it'd be 1.33×, still clears the system's stated 1.25× accessibility floor, but doesn't match the ratio the doc claims. Worth a five-minute check of which line-height token the `label` and `caption` styles actually reference in the live file.

---

## 5. Iconography

Same shape as the typography problem: brand didn't specify something the product actually needed, resolved the same way, a deliberate, specified choice.

Material Symbols, Outline style, fits the firm's sharp, sans-curve visual identity while staying open-source and well-constructed. `iconography.md` gives the full spec, more precise than what's been in this doc so far:

- **Axes:** Weight 300, Grade 0, Optical size 20, Fill 0 (outlined; Fill 1 reserved for active/selected states only, never used interchangeably with outlined for the same action).
- **Self-hosted**, not served from Google's CDN — a deliberate versioning decision, icon assets only change when the team updates them, not when an external CDN updates.
- **Three sizes** (16/20/24px), each paired to a specific line-height, not a font-size, so the icon sits flush within the text's vertical rhythm.
- **Touch targets:** interactive icons get a minimum 44×44px hit area via padding, never by inflating the icon itself (WCAG 2.5.5). Decorative icons next to a label are exempt.
- Explicitly benchmarked against **Carbon DS (IBM), Atlassian DS, and Material Design 3.**

---

## 6. Token Architecture

Three-tier model: Primitive, Semantic, Component. Worked example, and it's worth telling as a decision rather than just a value: `#004DFF` is the anchor blue the system started with — chosen to hold up against black as much as against white (see Conflicts #8) — set at the primitive layer as `blue-500`. So: `#004DFF` (`blue-500` primitive, the anchor blue) → `Brand/Primary` (semantic) → `Button/Solid/Brand/BG` (component).

Four decisions, each with real rationale:

- **Tinted grey over neutral grey.** Coherence with the blue-dominant brand palette.
- **OKLCH.** Perceptually uniform, better gamut for dark mode, directly compatible with Tailwind v4.
- **Components consume only the semantic tier.** Theming changes per brand or product without breaking any component downstream. (Same principle typography uses: keep the swappable thing isolated to one layer.)
- **Style Dictionary.** Platform-agnostic, one source of truth emits CSS variables, Tailwind's `@theme`, and JSON.

**Spacing, now resolved with more nuance than expected.** `Layout_tokens.json` shows two separate, purpose-built spacing scales, not one generic scale:

- **Component spacing** (padding/gaps *inside* a component): `XS=4, SM=8, MD=12, LG=16, XL=20`
- **Layout spacing** (space *between* components or sections): `XS=16, SM=24, MD=32, LG=40, XL=48`

Both built on a 4px base unit, but kept as separate semantic scales so a component's internal padding and the whitespace between components can evolve independently. Worth stating explicitly, it's a more deliberate answer than "we used an 8px grid."

**Radius scale, corrected (see Conflicts #5):** `None=0, SM=2, MD=4, LG=8, XL=12, Full=9999`.

**Motion tokens exist but are still forming.** Named durations (`Fast=100ms, Normal=200ms, Slow=300ms, VerySlow=400ms`) and four named easing curves (`Standard, Emphasized, Linear, SpringSoft`) are defined, but the actual cubic-bezier values didn't come through in the export. Treat this the way you treated governance early on: honest, in-progress, not yet something to present as finished.

---

## 7. Color System

The build order: start with the brand's anchor blue, convert to OKLCH, extend into an 11-stop ramp. Holding lightness constant across stops, build red, green, and yellow off that same structure. For slate, take a desaturated version of the anchor blue and expand it into a full grey scale, using Adobe Spectrum's scale as a reference point.

The interesting decision is where lightness-constant broke down: applying it to yellow produced a muddy, dark result, so yellow's anchor moved to the 600 stop while every other color keeps its anchor at 500.

**Now with real numbers**, from `color-system-docs-v2.html` — this resolves the APCA gap that's been open since the first round:

| Color | Anchor stop | Hex | APCA Lc |
|---|---|---|---|
| Blue (brand) | 500 | #004DFF | 76 |
| Green (success) | 500 | #007E40 | 72 |
| Red (error) | 500 | #C60800 | 77 |
| Yellow (warning) | 600 (not 500) | #D66F09 | 72 |

Purple isn't in this table on purpose — see Conflicts #7, it's excluded from the case study for now.

The yellow constraint is stated as a hard rule in the source doc, not a suggestion: Yellow-500 (#F2940E) is Lc 60, large text/icons/graphic fills only. Body text always routes to Yellow-600. This is a stronger, more specific version of the story already in this doc, use the real numbers.

**Elevation model, a real v1→v2 pivot that wasn't captured here before.** In v1, elevation was communicated by darkening the background as you went up the stack (layer-1 = tg-50, layer-2 = tg-100, layer-3 = tg-150). It produced clean structure but the wrong perceptual signal: floating elements like modals ended up looking darker and heavier than the page instead of lighter and closer. In v2, every elevated surface is capped at white or tg-50, and shadow depth alone carries the elevation signal, an inset ring shadow replaces the CSS `border` property entirely, since it adapts to any background and transitions smoothly where a solid-color border can't. This is the same shape of story as the yellow anchor and the typography swap: a method applied consistently, a real problem found, a deliberate, defensible correction. Worth including with equal weight to those two.

**Surface layering** (confirmed consistent with what was already captured, now with the reasoning behind it):

| Layer | Background | Shadow | Use |
|---|---|---|---|
| Base | tg-25 | none | Page canvas |
| Raised | tg-50 | shadow-sm | Cards, list items, table rows |
| Panel | tg-50 (same stop as Raised) | shadow-md | Sidebars, panels |
| Floating | tg-0 (white) | shadow-lg | Dropdowns, tooltips, command palette |
| Modal | tg-0 (white) | shadow-xl | Dialogs, drawers, overlays |
| Field | tg-0 (white) | shadow-inset-field | Form inputs (inset, not raised) |

Shadow anatomy: every non-inset shadow token stacks three layers, a 1px ring (replaces border entirely), a tight contact shadow (anchors the element to the surface below), and a soft ambient shadow (the actual lift cue, gets larger and softer the higher the element sits). Shadow color is `rgba(8,16,48,...)`, the brand navy, not neutral grey, so shadows read as tonally part of the palette rather than muddy.

**Interaction states follow a stated rule, not ad hoc choices:** one-stop background increment per state (hover = +1 stop + shadow-md; pressed = inset shadow replaces the drop shadow), which is exactly why `Component.tokens.json`'s Brand tokens step `Blue.500 → 600 → 700` across Default → Hover → Pressed. Worth stating this rule explicitly, it's the justification for the whole token progression, not just an observed pattern.

**Semantic intents for the case study: blue (action, brand, in-process), red (critical, used for anything needing immediate attention, not only destructive actions — see Conflicts #2 on why "critical" over "destructive"/"danger"), green (success), yellow (warning).** Purple exists in the system as an accent hue but isn't included here, see Conflicts #7. Info is intentionally folded into blue rather than given its own hue: `colors-semantic.tokens.json`'s own token description confirms this in writing, `Status.Info` is explicitly documented as "aliases Brand; same Blue/500 by design," not an oversight.

**Research grounding worth naming as a pattern, not a one-off:** the color and shadow system cites Adobe Spectrum (grey scale reference) and, per `color-system-docs-v2.html`, Jakub Krehel's interface-craft writing specifically for the three-layer shadow system, the concentric radius formula, and global antialiasing; separately, Rauno Freiberg (interfaces.rauno.me) for the box-shadow-over-outline focus ring reasoning (see Conflicts #1). Combined with Carbon DS, Atlassian DS, and Material Design 3 showing up across iconography and the button doc, this is a consistent thread across the whole system, worth one sentence in the case study naming it as a pattern: every major decision was benchmarked against a named, credible source, not made in isolation.

**Concentric radius** (concept from `color-system-docs-v2.html`, values corrected per Conflicts #5): outer radius = inner radius + padding between the nested elements. A card at 8px radius (`radius/lg` under the corrected scale is actually 8, recheck which step name lines up) sitting inside a modal needs the modal's radius to equal the card's radius plus the padding between them, or the nesting reads as visually wrong. Good technical sophistication signal once the numbers are reconciled.

---

## 8. Data Visualization Color System — new, not previously captured

`dataviz-color-reference.html` documents a full, separate color system specifically for charts and dashboards, all built on the same primitives as the UI (swapping the design system's theme updates dataviz colors automatically). Worth including as its own beat in the case study: for a firm running tax, audit, and workflow-assignment dashboards, a rigorously accessible dataviz system is directly relevant, not a nice-to-have.

- **14-color categorical palette**, sequenced so adjacent steps maximize perceptual contrast, with pre-validated subsets for known series counts (a 3-series chart doesn't just take the first 3 of the 14, it uses a specifically validated combination).
- **5 sequential ramps** (Blue, Green, Red, Yellow, Slate) for magnitude/ranked data, lightness encoding quantity.
- **2 diverging palettes** (Blue↔Red for temperature/threshold framing; Green↔Yellow for performance/risk, deliberately avoiding temperature connotation where it would mislead), used only when data has a genuine neutral midpoint.
- **Alert palette** mapped directly to the UI's semantic status colors, with the same Warning-vs-Caution split as the core color system (Yellow-500 for large graphic fills only, Yellow-600 for any text-sized use, meets AA where 500 doesn't).
- A stated accessibility principle: never encode meaning with color alone, roughly 8% of male users are color-vision deficient, always pair with shape, pattern, or direct labeling.
- Explicitly referenced against **Carbon Design System**.

---

## 9. Component Anatomy: Buttons

`button.md` turns out to be a full, real component spec, substantially deeper than what's been captured here. Structure below reflects it, with corrected prop names (see Conflicts #3).

**Anatomy:** Container (interactive hit area, carries background/border/radius) → Label (sentence case, required unless icon-only) → Icon (optional, leading and/or trailing) → Focus ring → Spinner (loading, replaces the leading icon).

**Variant dimensions, confirmed final:**
- `intent`: positive / neutral / critical
- `btnStyle`: solid / outline / ghost (public prop name; avoids colliding with React's built-in `style` prop)
- `size`: md (36px) / sm (24px) / icon (36×36) / icon-sm (24×24)
- `shape`: rect (`rounded-md`, 4px — a deliberate divergence from button.md's stated `radius/sm`/2px, see Conflicts #5) / pill (`radius/full`, 9999px)

**States: six, not five.** Enabled, Hover, Active/Pressed, Focus, Disabled, and **Loading** — Loading wasn't previously captured here at all. It's implemented carefully: `aria-busy="true"`, *not* the `disabled` attribute, because disabling would pull the button out of the tab order and announce it as unavailable mid-operation. The spinner takes the leading icon's position; the label stays visible and can update ("Saving…") but isn't required to.

**Padding, confirmed final rule:** the label's own horizontal padding equals the button's overall horizontal padding at that size — 0.5rem (`px-2`) at Medium, 0.25rem (`px-1`) at Small, applied on both sides of the label regardless of which icon slots are filled. This produces the same numbers as button.md's per-icon-configuration table (container padding + matching label padding reproduces its "8px · icon · 8px · label · 16px" breakdowns exactly) as one general rule instead of a four-row lookup table. button.tsx implements it this way.

**Accessibility, confirmed final:**
- Native `<button>` always, never a styled `<div>`.
- Icon-only buttons need **both** `aria-label` *and* a visible tooltip — button.tsx now enforces this structurally (the component wraps itself in a Tooltip when icon-only, not left to the consumer to remember).
- **Icon-only Critical buttons are allowed in this system** — a deliberate divergence from button.md's stated prohibition (see Conflicts #6). An icon-only delete button is fine here, as long as it carries the required `aria-label` and tooltip.
- Full keyboard table: Tab, Shift+Tab, Enter, Space.
- Focus management rules beyond the button itself: after a loading action resolves, focus stays on the button (success) or moves to an error summary (failure); after a modal opened by a button closes, focus returns to that button; after a Critical confirmation dialog, focus goes to a safe element.
- Critical actions always confirm via a dialog restating what will be destroyed, never execute on a single click.

**Usage guidance worth summarizing, not reproducing in full:** one Solid button per logical region (a form, modal, card, not the whole page); Outline for secondary actions paired with a Solid; Ghost for tertiary/supplementary; a stated intent-selection decision tree (forward-moving → Positive, neutral/cancel → Neutral, irreversible-destructive → Critical, reversible-but-negative → Neutral Outline/Ghost, not Critical, to avoid alarm fatigue); button groups capped at 3, shared width by the widest label, 8px gap; alignment rules tied to F-pattern vs. Z-pattern scanning depending on context (full pages left-aligned, modals right-aligned). All cite Carbon DS and/or Atlassian DS by name.

**Planned but not built:** a split/dropdown button and a connected (segmented) button group are both fully designed and documented, explicitly marked "not yet available as built components." This is good material for the case study, it shows the documentation itself distinguishes shipped from planned, which is the same discipline the Phase 1/Phase 2 status framing already uses elsewhere.

---

## 10. Governance & Contribution Model

Resolved, real process. When a team requests a new component, design convenes with dev and the proposer (BA, QA, PO, whoever) to check for overlap, usage frequency, and reuse scope. That decides whether it gets built. If yes: designed against the foundational layer, broken into atoms, scoped, then built in code and documented (anatomy, usage, behavior, accessibility) before becoming official. If no: the requesting team gets a clear reason and a path to make a stronger case.

---

## 11. Versioning Strategy

Two approaches, not mutually exclusive. **Token-separated versioning:** publish tokens/CSS independently from React component packages, so a color or spacing bump doesn't risk pulling in a behavioral change, and non-React consumers can use the same primitives without framework overhead (Style Dictionary or Tokens Studio driving the pipeline). **Figma-synchronous versioning:** a Figma library publish triggers a webhook → CI/CD (GitHub Actions) → pulls new tokens via the Figma API → opens a PR → cuts a beta/RC package, keeping design and code from drifting silently and giving both sides a shared version language.

---

## 12. Documentation Strategy

Docs live in a custom Docsite on the firm's DevOps wiki. Each component page: definitions, anatomy, properties, code snippet in React and plain HTML/CSS, accessibility notes. From the engineering side, documentation functions as a visual and interactive blueprint before any code gets written.

**New:** the documentation itself models good practice around scope, explicitly separating built components from planned-but-undelivered ones (see Section 9, Planned Variants). Worth naming this as a deliberate documentation discipline, not just a content inventory.

---

## 13. Cross-Functional Process

Token naming: CSS files correspond directly to Figma variable collections, flowing Primitives → Semantics → Components, written via the `@theme` directive (`color.blue.900` → `-color-blue-900`). Little to no disagreement on naming between design and engineering, because the structure was built for two consumers, human developers and LLMs, from the outset, which is the direct explanation for the 80% design-to-code conversion result later.

**Attribution, confirmed.** The Q&A material and Developer Experience section in this doc are the frontend engineer's own thinking, framed in the case study as his stated perspective.

**Still open (optional):** friction between Figma Variables and Style Dictionary output, and how Figma-to-CSS parity gets validated in practice day to day.

---

## 14. Outcomes & Developer Impact

- **80% accurate component conversion rate** in the design-to-code proof of concept.
- **65% migration progress** — 13 of 20 audited Figma components migrated and mapped into code, separate from the LLM experiment.

Beyond the numbers: developers moved from manually translating pixel values to working from mapped semantic tokens; Code Connect cut context switching; standardized variant/property names gave design and engineering shared vocabulary; PR reviews shifted toward business logic over UI nitpicking; onboarding got faster against predictable props and full documentation; product-wide visual refreshes became token-level updates instead of JSX refactors.

**Still open (optional):** target timeline for closing the remaining 35% of migration and for the task management POC shipping.

---

## 15. Reflection

Engineering-side, confirmed as the frontend engineer's own: components should be split into their most granular atomic pieces before mapping to code, not after, a Combobox's input/trigger and its menu list should be separately mapped, not one file, or nested Figma nodes and code composition drift apart.

**Still open:** a design-side reflection to sit alongside it.

---

## button.tsx — revised, decisions locked in

button.tsx is now the reference file for button decisions, confirmed. Where it diverges from button.md, button.tsx wins and the doc needs to catch up, not the other way round. What changed and why:

1. **Prop names:** `variant` → `btnStyle`, `corner` → `shape`, values `rect`/`pill`. Matches button.md.
2. **Sizing:** `h-10`/`h-8` → `h-9`/`h-6` (36px/24px), plus dedicated square `icon`/`icon-sm` sizes. Matches button.md.
3. **Rectangular radius: stays `rounded-md` (4px).** A deliberate divergence from button.md's stated `radius/sm` (2px), not a bug. button.md needs updating to match this, not the reverse.
4. **Focus ring: outline, not box-shadow.** The Safari <16.4 bug that justified the foundation doc's box-shadow recommendation is no longer a live concern. Matches button.md; the foundation doc (`color-system-docs-v2.html`) needs updating.
5. **Icon-only requires both `aria-label` and a visible tooltip**, enforced at the type level and structurally (the component wraps itself in a Tooltip when `iconOnly` is true, rather than leaving that composition to the consumer to remember).
6. **Icon-only Critical buttons are allowed.** An icon-only delete button is fine here. button.md's prohibition on this isn't being adopted.
7. **Loading state added.** `aria-busy`, never `disabled` — disabling would pull the button out of the tab order mid-operation. `pointer-events-none` plus a guarded click handler block interaction without touching focusability. The spinner always takes the leading position, even if there was no leading icon to begin with.
8. **Label padding**, generalized rather than table-driven: the label's own horizontal padding equals the button's own horizontal padding at that size (0.5rem / `px-2` at md, 0.25rem / `px-1` at sm), same value on both sides. Worth noting this is mathematically the same result as button.md's more detailed per-icon-configuration table (container padding + matching label padding reproduces button.md's "8px · icon · 8px · label · 16px" style breakdowns exactly), just expressed as one rule instead of a lookup table. Cleaner to implement, same output.

**Follow-up, not urgent:** button.md itself (the actual docsite file) now disagrees with the shipped component on radius and focus ring. Worth a pass to update that doc so it doesn't contradict the real implementation the next time someone reads both.

---

## Pending Pointers (live list, updated)

**Content gaps:**
1. A design-side reflection.
2. Connective sentence linking the "four button implementations" trigger to the branding/web-guidelines problem.

**Lower priority / optional:**
3. Figma Variables vs. Style Dictionary output friction, if any.
4. How Figma-to-CSS parity gets validated day to day.
5. Target timeline for the remaining migration and the task management POC ship date.
6. Which `LineHeight` value (16 vs. 18) the live `label`/`caption` styles actually reference.
7. Update button.md itself to match button.tsx on radius and focus ring, so the doc stops contradicting the shipped component.
8. Reconcile "Destructive"/"Danger" token names to "Critical" (or document the alias) in Component.tokens.json and colors-semantic.tokens.json.
9. `tokens-bds.svg` (the token architecture diagram used in the live case study) still visually shows the old `#0050FF → #004DFF` substitution story with literal `#0050FF`-colored swatches. It needs to be recolored/relabeled to match the new anchor-blue framing (see Conflicts #8) — flagged as a follow-up, not done in this pass.

Resolved this round: Critical vs. Destructive vs. Danger (Critical is deliberate, red covers more than destructive actions), Purple's status (real but incomplete, excluded from the case study), and the brand blue anchor — `#004DFF` is now documented as the system's starting blue, chosen to hold up against black as much as white, with no "corrected from #0050FF" narrative (see Conflicts #8). All eight items from the button.tsx revision pass are also resolved and applied. Nothing is currently blocking, aside from the diagram follow-up noted above.
