# Content Guide

How to replace placeholders and add case studies. The resume
(`Rolan-Gomes-Resume`) is the source of truth for all claims and metrics.

---

## 1. Placeholder inventory

Search the codebase for `<!-- PLACEHOLDER` — every one marks content to replace:

| Location | What to supply |
|---|---|
| `index.html` hero | Confirm the one-liner; adjust sub-line if positioning changes |
| Work tiles ×4 | Real cover images (specs below); confirm titles/blurbs/metrics |
| Skills section | Add/remove tools honestly — only list what you'd discuss in an interview |
| About section | Portrait image + final bio pass |
| Footer | Confirm email, LinkedIn, GitHub URLs; CV PDF path (`assets/rolan-gomes-cv.pdf`) |
| `work/blueprint-design-system.html` | Full case study body + images |

## 2. Adding a new case study

1. Duplicate `work/blueprint-design-system.html` → `work/your-slug.html`
   (lowercase, hyphens).
2. Update: `<title>`, meta description, OG tags, hero (eyebrow, h1, summary),
   facts bar, body sections, prev/next links.
3. Add its tile to `index.html` (copy a `.work-item`, keep the pattern intact —
   especially the card-link `::after` structure).
4. Update prev/next links on the neighboring case studies.
5. Run checklist sections A–E from `ACCESSIBILITY-RTL-CHECKLIST.md`.

### Case study writing structure

- **Context** (2–3 sentences): company, product, your role, constraints.
- **Problem**: what was broken/missing, who it hurt, how you know.
- **Process**: decisions, not diary. 3–5 key moves with reasoning.
- **Solution**: what shipped. Show, don't narrate — images do the work.
- **Outcome**: numbers first (match the resume exactly), then qualitative.
- NDA-safe pattern: blur/redact client data in images, state "details under NDA,
  happy to walk through live" — recruiters respect this.

## 3. Image specifications

| Use | Size | Format | Notes |
|---|---|---|---|
| Work tile cover | 1200×900 (4:3) | WebP, quality ~80 | Under 150 KB each |
| Case study inline | 1600w max | WebP | Under 250 KB; use `<figure>` + `<figcaption>` |
| Portrait | 800×800 | WebP | |
| OG/social card | 1200×630 | PNG or JPG | One per case study eventually |

- Always set explicit `width` and `height` attributes (prevents layout shift).
- Below-the-fold images: `loading="lazy" decoding="async"`.
- Alt text: describe what matters ("Blueprint DS button component page in Figma
  showing variants and tokens"), not "screenshot of Figma".
- Compression: squoosh.app or `npx @squoosh/cli`.

## 4. Arabic content

The site ships a three-way content-mode toggle: `en` (original technical
English) / `en-simple` (a Simplified Technical English draft, ASD-STE100
inspired) / `ar` (Arabic, translated from the `en-simple` draft — short,
controlled-vocabulary source text translates far more reliably than dense
technical prose). All three live on the same page/URL via the `STRINGS`
object in `js/main.js` plus `data-i18n`/`data-i18n-label`/`data-i18n-desc`/
`data-i18n-title`/`data-i18n-meta-description` attributes — there is no
paired-page (`work/slug.ar.html`) architecture; that earlier plan was
superseded once en-simple made full-body translation practical.

**Scope, decided and shipped**: `index.html` and three case studies —
`work/blueprint-design-system.html`, `work/hub-modernization.html`,
`work/speery-health.html` (displayed as "Healthcare SaaS Redesign", an
NDA-safe label) — have full `en-simple`/`ar` content for every heading and
paragraph. No other page (`more-work.html`, `writing/*`, the other 3 case
studies, `about.html`, `contact.html`) has body content in any mode beyond
`en` — they still get the shared nav/footer chrome toggle, nothing more.
Don't re-litigate this scope without a reason; extending it means writing
STE + Arabic for the newly-added page from scratch.

- Every `data-i18n` value is set via `innerHTML`, not `textContent` —
  several paragraphs carry inline `<strong>`/`<code>`/`<em>`/`<a>` markup
  that would otherwise flatten into literal angle-bracket text on a mode
  switch. Every value is authored site copy, never user input.
- `en` key values must be an exact copy of the original static HTML
  (including inline tags) — they're what makes switching back to `en` from
  `en-simple`/`ar` actually restore the original, since `data-i18n` only
  ever *writes* a value it has.
- Terminology is locked in `docs/AR-GLOSSARY.md` — check it (and extend it,
  never re-decide a rendering already in it) before adding new Arabic
  strings.
- Digits inside Arabic prose use Eastern Arabic-Indic numerals (٠١٢٣…) — a
  deliberate, sitewide policy, not a per-string choice.
- A native-speaker proofread pass is still recommended before treating the
  shipped Arabic as final — see `docs/AR-GLOSSARY.md`'s closing note.

## 5. Tone rules

Sentence case. Numbers over adjectives. No "passionate". First person singular,
present tense for skills, past tense for shipped work. Every claim must survive
the interview question "tell me more about that".
