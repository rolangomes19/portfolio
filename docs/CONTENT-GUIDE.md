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

## 4. Arabic content (phase 2)

v1 ships English content with a functioning RTL/direction toggle (UI chrome
strings are already bilingual via `data-i18n`). When ready for full Arabic:

- Translate professionally — machine-translated portfolio copy reads badly to
  native speakers and undermines the "detail-oriented" claim.
- Add strings to the `STRINGS` object in `js/main.js` for UI, and use
  `data-i18n` attributes; long-form content can become paired pages
  (`work/slug.ar.html`) later.
- Keep proper nouns (Wipfli, Figma, WCAG) in Latin script inside `<bdi>`.

## 5. Tone rules

Sentence case. Numbers over adjectives. No "passionate". First person singular,
present tense for skills, past tense for shipped work. Every claim must survive
the interview question "tell me more about that".
