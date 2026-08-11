# Accessibility & RTL Checklist

Run the relevant sections before merging any change. Run everything before deploying.

---

## A. Keyboard

- [ ] Skip link appears on first Tab and jumps to `#main` — test with a real
      Tab press, not `.focus()` in the console: programmatic focus does not
      trigger `:focus-visible`, so the link stays hidden and the test lies.
      (`<body>` is a size container; confirm the link is still positioned
      against the viewport and fully on screen.)
- [ ] Tab order follows visual/reading order in **both** LTR and RTL
- [ ] Every interactive element reachable and operable (Enter/Space)
- [ ] Focus visible on every element in both themes (2px outline, offset 2px)
- [ ] No keyboard traps; Esc closes anything that opens
- [ ] Surface picker: Enter/Space opens the popover and moves focus to the
      checked swatch; arrow keys move focus *and* selection through the
      radiogroup (native `<input type="radio">` behavior, not focus-only);
      Escape closes it and returns focus to the trigger button
- [ ] Work tiles: one tab stop per tile, accessible name = project title

## B. Screen reader (test at least one: NVDA+Firefox on Windows, VoiceOver+Safari on macOS/iOS)

- [ ] Page title unique and descriptive per page
- [ ] Landmarks announced: banner, navigation, main, contentinfo
- [ ] Headings outline reads as a sensible document (one h1, no skipped levels)
- [ ] Images: meaningful alt or `alt=""` for decorative
- [ ] Theme toggle announces state (aria-pressed) and has a text label
- [ ] Direction toggle announces language change; `lang` attribute updates
- [ ] Links make sense out of context (no bare "view work" without context — the
      card-link pattern ties them to titles)

## C. Visual / WCAG 2.2 AA

- [ ] Text contrast ≥ 4.5:1; large text & UI parts ≥ 3:1 — **both themes**
- [ ] Contrast measured against the **paper** (`--color-bg`) *and* the card
      background (`--color-bg-subtle`), never against white. A link can pass on
      the paper and fail inside a card — that is exactly why the light accent is
      Blue 70 and not Blue 60.
- [ ] 200% browser zoom: no loss of content or horizontal scroll at 1280px
- [ ] 320px viewport (WCAG reflow): everything readable, nothing clipped
- [ ] Touch targets ≥ 24×24 px (aim 44×44 for header controls)
- [ ] Information never conveyed by color alone (links underlined)
- [ ] `prefers-reduced-motion: reduce` → no movement anywhere, **and every
      element is visible at full opacity** (check the hero and any
      `[data-reveal]` / `[data-reveal-children]` block — a reveal that hides
      content without an ungated visible state is a content-loss bug, not a
      motion bug)
- [ ] With JavaScript disabled, all content is visible (nothing depends on
      `.reveal` being removed)
- [ ] `prefers-contrast` / forced-colors mode: site remains usable (spot check)

## D. Automated (run all three — they catch different things)

- [ ] Lighthouse (Chrome DevTools) Accessibility = 100
- [ ] axe DevTools browser extension: 0 violations per page
- [ ] HTML validator (validator.w3.org): 0 errors

## E. RTL

Flip with the toggle (or set `<html dir="rtl" lang="ar">` in DevTools):

- [ ] Layout fully mirrors: nav, tiles, skill rows, footer columns
- [ ] No stray `left/right` physical properties (`grep -rn "margin-left\|margin-right\|padding-left\|padding-right\|text-align: left\|text-align: right" css/` returns nothing)
- [ ] Directional arrows flip (`.icon-directional`)
- [ ] Arabic strings render in IBM Plex Sans Arabic, letter-spacing 0
- [ ] Numbers, +91/+971 phone numbers, emails, URLs stay LTR (`<bdi>` / `dir="ltr"`)
- [ ] Mixed English terms inside Arabic sentences don't break word order
- [ ] Scrollbars/overflow behave; nothing clipped at inline-start edge
- [ ] Focus outlines and hover translations mirror correctly

## F. Content quality

- [ ] No `<!-- PLACEHOLDER -->` markers remain on published pages
- [ ] All metrics/claims match the resume (source of truth)
- [ ] External links: `rel="noopener noreferrer"`
- [ ] Meta description, OG tags, and favicon present per page

## Tools

- Contrast: webaim.org/resources/contrastchecker
- axe DevTools: deque.com/axe/devtools
- Screen readers: NVDA (free, Windows), VoiceOver (built-in, macOS/iOS)
- RTL quick test: DevTools console → `document.documentElement.dir = 'rtl'`
