# Design critique fix plan

Source: `.impeccable/critique/2026-08-25T18-46-07Z__index-html.md`
User decision (2026-08-25): fix all 6 priority issues, plus reconsider the two "noted tension" items.
This file is the resumability checkpoint — if the session breaks, read this file to see what's
done and what's next. Update the checkbox and add a one-line note under an item as soon as it lands.

## Status legend
`[ ]` not started · `[~]` in progress · `[x]` done (commit hash noted)

---

- [x] **1. [P0] Hero GIF can't honor reduced motion** — done (dbc0d9b)
  File: `index.html` (hero avatar, ~line 95), possibly new asset in `assets/images/`.
  Plan: replace the always-animating `<img src="rolan-says-hello.gif">` with a version that
  respects `prefers-reduced-motion`. Approach: keep the GIF as the default, but swap to a static
  frame when `prefers-reduced-motion: reduce` is active, via a tiny CSS/JS swap (background-image
  media query trick, or a `<picture>`-style JS check in `js/main.js` alongside the existing
  theme/lang init). Need a static PNG frame extracted from the GIF as a new asset.

- [x] **2. [P1] RTL heading/button letter-spacing not reset** — done (a265099)
  File: `css/tokens.css` (~line 444-451, the `[dir="rtl"] h1...h6, .btn` rule).
  Plan: add `letter-spacing: 0;` to that rule block so it actually matches CLAUDE.md's claimed
  global RTL letter-spacing reset. Small, low-risk, one-line CSS fix. Verify live with `dir="rtl"`
  before/after via `getComputedStyle`.

- [x] **3. [P1] Tools & Skills sticker board unusable on mobile** — done (0360639). Note: the
  "placeholder copy" part of the original finding was wrong on inspection — the 19 descriptions are
  real, personal content; only the stale comment was inaccurate, now corrected. Also found (not
  fixed, out of scope): desktop scatter (>=48em) still has ~29 overlapping pairs at 1280px, likely
  intentional "scattered stickers" look given the abundant white space there, but flagging in case
  the user wants it tightened too.
  File: `index.html` (sticker markup + `data-description`/`data-proficiency` values), `css/styles.css`
  (sticker positioning rules), `js/main.js` (drag behavior) if a mobile-specific fallback is needed.
  Plan: (a) add a mobile breakpoint fallback that lays stickers out in a non-overlapping grid instead
  of scattered absolute positioning below ~768px; (b) replace all 19 placeholder `data-description`
  values with real copy — this needs the user's actual input per tool, flag which ones need real
  content from Rolan if generic filler can't be written responsibly (CLAUDE.md: never invent factual
  claims).

- [x] **4. [P2] Em-dash / AI-sentence-framing cleanup in remaining case studies** — done
  - [x] `work/ai-design-to-code.html` — done (68c0186)
  - [x] `work/ai-process-framework.html` — done (6c1a803)
  - [x] `work/blueprint-design-system.html` — done (2fcbf8b)
  Note: title-tag em-dashes ("Page — Rolan Gomes") deliberately left alone in all files above,
  deferred to item 8 (site-wide, one pass).

- [x] **5. [P2] Emotional dead zone: About → Skills → Certifications → Contact** — done (4ac424e)
  File: `index.html` (section order: About ~line 248, Skills ~276, Certs ~367, Contact ~420).
  Plan: default approach is a one-line bridge sentence added after About's closing line, rather than
  reordering sections (reordering risks bigger layout/IA side effects for a P2). Reconsider full
  reorder only if the bridge-copy fix feels insufficient after implementing it.

- [x] **6. [P3] text-overflow on site logo and a repeated span** — investigated, NOT reproduced.
  Checked `.site-logo` at 375px and 1280px (parent-vs-child bounding box): no overflow found at
  either width. Checked every shared-component span present on all three pages (`.icon-directional`,
  `.nav-toggle-icon`, `.surface-picker-trigger-swatch`, `.eyebrow`, `.status-callout-label`,
  `.tag-pill`) via both parent-vs-child and scrollWidth-vs-clientWidth methods: nothing overflows.
  Per the plan's own rule ("do not guess-fix without confirming the selector"), leaving this as an
  unconfirmed/unreproduced finding rather than applying a speculative fix. Possible explanations:
  Assessment B's detector measured at a moment before web fonts finished loading (a real but
  transient layout-shift window, not a persistent bug), or a viewport/state I didn't try.

- [~] **7. [Reconsider] Eyebrow density (5 of 7 homepage sections)** — awaiting user sign-off,
  see item 7's own plan text below for the specific trade proposed. Items 1-6 and 8 are all done.
  File: `index.html` (eyebrows at ~144 WORKS, ~250 ABOUT ME, ~278 Tools & skills, ~369 Certifications,
  ~422 CONTACT).
  Plan: CLAUDE.md names mono eyebrows as the deliberate site signature, so full removal is off the
  table. Middle-ground proposal: drop the eyebrow on 1-2 of the shorter/self-evident sections (About,
  Contact are arguably self-explanatory without a kicker) to bring density closer to the generic
  1-per-3-sections guidance without abandoning the pattern entirely. Confirm this specific trade with
  the user before applying (a branding call, not a mechanical bug fix) — do not silently remove a
  documented signature element.

- [x] **8. [Reconsider] Title-tag em-dash separator ("Page Name — Rolan Gomes")** — done (371f2b0).
  Applied site-wide to all 14 pages with a title tag, plus index.html's og:title/og:description.

---

## Out-of-scope finding (not acted on, flagging only)
A final site-wide grep for em-dashes turned up prose em-dashes on pages the critique never
scanned and this plan never covered: `about.html`, `contact.html`, `more-work.html`,
`work/speery-health.html`, `work/incridea-2022-branding.html`, and all four `writing/*.html`
pages. None of these were part of the critique's Assessment A/B scope (only index.html,
blueprint-design-system.html, and hub-modernization.html were reviewed), so fixing them wasn't
part of "fix everything found." Left untouched pending explicit direction, since it's a
same-shape but separately-scoped request, not a continuation of this plan.

## Execution notes
- One commit per item, matching this session's established pattern (small, reviewable, one concern
  each). Commit message format: `type: short description` per CLAUDE.md.
- After each item: re-verify in browser (console errors, RTL/dark mode where relevant) before
  committing, per CLAUDE.md's accessibility/RTL checklist expectations.
- Do not push anything without explicit user go-ahead (standing instruction from earlier this session).
