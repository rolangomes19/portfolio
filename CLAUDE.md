# CLAUDE.md — Rolan Gomes Portfolio

This file is read by Claude Code at the start of every session. Follow it strictly.

## Project overview

Personal portfolio for **Rolan Gomes — UX Designer / Engineer** specializing in
Design Systems, Accessibility (WCAG 2.2), and AI-assisted design-to-code workflows.
Target audience: UAE recruiters, design leads, and hiring managers.

The site is a live demonstration of the owner's skills. **Every implementation
decision must be defensible in a design-system review.** If a recruiter opens
DevTools, the code should look like it was written by an accessibility specialist —
because that is the entire point.

## Tech stack (do not change without asking)

- Plain **HTML + CSS + vanilla JS**. No frameworks, no build step, no npm dependencies.
- Fonts: all self-hosted in `assets/fonts/` — Inter (body, from rsms.me/inter/), Commissioner (headings + buttons, from kosbarts/Commissioner), Geist Mono (mono/meta, from vercel/geist-font), El Messiri (RTL headings + buttons, from Google Fonts) and Harmattan (RTL body + mono/meta, from Google Fonts).
- Hosting target: any static host (GitHub Pages / Vercel / Netlify).
- Local preview: `npx serve .` or VS Code Live Server. Never require a build.

## File map

```
portfolio/
├── CLAUDE.md                  ← you are here
├── README.md                  ← setup + workflow for the human
├── index.html                 ← landing page (hero, work, skills, about)
├── work/
│   └── blueprint-design-system.html   ← case study; ALSO the template for new ones
├── css/
│   ├── tokens.css             ← ALL design tokens. The only place colors/sizes live.
│   └── styles.css             ← base + components. Consumes tokens only.
├── js/
│   └── main.js                ← theme toggle, direction toggle, reveal, misc
├── docs/
│   ├── DESIGN-GUIDELINES.md   ← typography, grid, spacing, motion, component specs
│   ├── ACCESSIBILITY-RTL-CHECKLIST.md ← test before every release
│   └── CONTENT-GUIDE.md       ← how to add case studies + image specs
└── assets/images/             ← optimized images only (see CONTENT-GUIDE)
```

## Non-negotiable rules

### 1. Accessibility (WCAG 2.2 AA minimum)

- Semantic HTML first: `header/nav/main/section/article/footer`, one `h1` per page,
  heading levels never skip.
- Skip link is the first focusable element on every page.
- Every interactive element: visible `:focus-visible` outline
  (`2px solid var(--color-focus)`, `outline-offset: 2px`). Never `outline: none`
  without a replacement.
- Color contrast: text ≥ 4.5:1, large text and UI components ≥ 3:1 — **in both themes**.
  Verify with the token pairs listed in `docs/DESIGN-GUIDELINES.md`; if you add a
  color, check it with a contrast tool before committing.
- Touch targets ≥ 24×24 CSS px (WCAG 2.2 Target Size), preferably 44×44.
- All images: meaningful `alt`; decorative images `alt=""`.
- Motion: every animation wrapped in `@media (prefers-reduced-motion: no-preference)`.
  The site must be fully usable with animations off.
- Project tiles: the whole card is clickable, but the accessible name comes from the
  title link (card-link pattern already implemented — keep it).
- Never convey information by color alone.
- Test keyboard-only (Tab / Shift+Tab / Enter / Esc) after any interactive change.

### 2. RTL readiness (hard requirement — UAE market)

- **CSS logical properties only.** Never write `margin-left/right`,
  `padding-left/right`, `left/right`, `text-align: left/right`, or `border-left/right`.
  Use `margin-inline-start/end`, `padding-inline`, `inset-inline-start`,
  `text-align: start/end`, `border-inline-start`.
- Flexbox/Grid handle mirroring automatically — never hardcode order for direction.
- Directional icons (arrows) must flip: use the `.icon-directional` class which
  applies `[dir="rtl"] { transform: scaleX(-1) }`.
- The `<html>` element carries `lang` and `dir`. The direction toggle in `main.js`
  switches `en/ltr ↔ ar/rtl`. UI strings come from the `data-i18n` mechanism in
  `main.js` — add new UI strings there in both languages.
- Arabic text renders in `--font-sans-arabic-heading` (El Messiri, headings/buttons)
  or `--font-sans-arabic-body` (Harmattan, body/mono/eyebrow), handled by `[dir="rtl"]`
  rules in `tokens.css` / `styles.css`. Never letter-space Arabic text
  (`[dir="rtl"] { letter-spacing: 0 }` is already global — don't override).
- Numbers, phone numbers, and email addresses stay LTR inside RTL text: wrap them
  in `<bdi>` or `dir="ltr"` spans.
- After any layout change, test with `dir="rtl"` set on `<html>`.

### 3. Design tokens

- **No raw values in `styles.css` or inline styles.** Every color, font size,
  spacing value, radius, duration, and easing must reference a custom property
  from `tokens.css`.
- Spacing uses the Carbon-style scale (`--space-01` … `--space-12`). Do not invent
  in-between values; if a design needs one, add it to the scale deliberately.
- Themes: light is default on `:root`; dark overrides live under
  `[data-theme="dark"]`. Both must pass contrast (rule 1). `color-scheme` is set so
  form controls/scrollbars follow the theme.
- When adding a component, add tokens first, then the component CSS.

### 4. Performance budget

- No JS libraries. No web-font families beyond the three Plex families.
- Images: WebP/AVIF, `loading="lazy"` below the fold, explicit `width`/`height`
  to prevent layout shift.
- Target: Lighthouse ≥ 95 on Performance, 100 on Accessibility, ≥ 95 Best
  Practices/SEO. Run Lighthouse after significant changes.

### 5. Security & hygiene

- Static site: **no secrets, keys, or tokens ever enter this repo.**
- All external links: `rel="noopener noreferrer"` with `target="_blank"`.
- If a contact form is added, use a third-party endpoint (Formspree/Basin) with
  their spam protection — never roll custom form handling or expose email
  harvestable in plain text beyond the deliberate `mailto:`.
- No third-party scripts (analytics only if privacy-friendly, e.g., Plausible,
  and only when asked).

## Agent skills to use

Install once from the repo root:

```
npx skills add jakubkrehel/skills     # better-ui, better-typography, better-colors
npx skills add emilkowalski/skills    # animation-vocabulary, improve-animations, review-animations
```

When to invoke:
- Touching type scale, line-height, or measure → **better-typography**
- Adding/adjusting colors or themes → **better-colors** (then re-verify contrast)
- New component or layout work → **better-ui**
- Any animation/transition work → **animation-vocabulary** first, then
  **review-animations** on the result. Keep motion minimal — this site's
  personality is precision, not spectacle.

## Design intent (summary — full spec in docs/DESIGN-GUIDELINES.md)

- References: Carbon Design System (typography, grid, restraint), gorix.zip
  (IA and section flow), karolinaszczur.com (focus states, humane a11y),
  jakub.kr (content-first minimalism).
- Signature: the site exposes its own system — mono-font section eyebrows
  (`01 — Selected work`), token-driven everything, and a footer statement that
  the site is WCAG 2.2 AA and RTL-ready.
- Restraint over decoration. When unsure, remove the accessory.

## Workflow expectations

- Small, reviewable changes. One concern per commit.
  Commit format: `type: short description` (types: feat, fix, a11y, rtl, content, docs, perf).
- Before declaring any task done, run through the relevant sections of
  `docs/ACCESSIBILITY-RTL-CHECKLIST.md` and say which checks you performed.
- The human is a beginner at production web apps: explain *why* behind
  non-obvious decisions in your responses, briefly.
- Placeholder content is marked with `<!-- PLACEHOLDER -->` comments — the human
  will replace it. Never invent factual claims (metrics, employers, dates);
  reuse what exists or mark clearly as placeholder.
