# Arabic Glossary — Locked Terminology

Reference for every Arabic string in `js/main.js`. Lock a rendering here once,
reuse it everywhere — don't re-decide a term mid-translation. Extend this file
before adding new Arabic strings for a newly in-scope page; don't invent a
new rendering for a term already listed here.

This file is also the handoff artifact for a native-speaker proofread pass.
**The Arabic shipped on this site is an LLM draft** (Claude, per
`en-ar-translation-guidelines.md`'s pipeline). A paid proofread pass by a
bilingual UX/tech-literate translator is still recommended before treating it
as final — budget it as a small one-time cost against the reputational cost
of a visible error on a portfolio whose whole pitch is attention to detail.

## Always English (never translate, never transliterate)

Tool, platform, and framework names; acronyms with no accepted Arabic
industry rendering; this site's own project/product names.

Figma, React, Tailwind CSS, Code Connect, Style Dictionary, Base UI, Radix
UI, shadcn, TypeScript, JavaScript, HTML, CSS, WCAG 2.2 / 2.4.3, ARIA, API,
CI/CD, GitHub, GitHub Actions, GitHub Copilot, VS Code, Notion, Claude,
Claude Code, Midjourney, Adobe Illustrator, Adobe Photoshop, Adobe Premiere
Pro, Microsoft Office, DevOps, Power Pages, Dynamics 365 / D365, Azure AD
B2C, Bootstrap, FontAwesome, Fluent UI, Deque Axe, OKLCH, Adobe Spectrum,
Material Symbols, Inter Tight, Roboto Flex, Roboto Mono, Atkinson
Hyperlegible Next, Anton, Montserrat, Lora, Smart Animate, Blueprint Design
System / Blueprint DS, Hub platform, Atomic Design (and its five tier names:
atoms, molecules, organisms, templates, pages — Brad Frost's own coinages;
translating them to their literal chemistry equivalents would confuse a
bilingual technical reader, which is exactly the guideline's test for
leaving a term in English).

**Personal name**: "Rolan Gomes" is transliterated to **رولان غوميس** in
every Arabic string (headlines, site-logo, meta titles) — except the footer
copyright line, which is fixed, identical text in all three modes by
deliberate choice and never transliterated.

## Established Arabic terms

| English | Arabic |
| --- | --- |
| UX / user experience | تجربة المستخدم |
| UI / user interface | واجهة المستخدم |
| Design system | نظام التصميم |
| Accessibility | إمكانية الوصول |

## Gray-zone terms (locked rendering, reuse everywhere)

Pattern: Arabic term with the English original in parentheses on first use
per page, Arabic alone after — per `en-ar-translation-guidelines.md`.

| English | Locked Arabic rendering |
| --- | --- |
| Design token(s) | رمز تصميمي / رموز تصميمية — first use per page: "رموز تصميمية (design tokens)" |
| Token architecture | بنية الرموز |
| Governance (design-system process) | الحوكمة |
| Elevation (shadow/depth model) | الارتفاع (elevation) on first use, ارتفاع after |

## Numerals

**Eastern Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩)** for every digit inside Arabic
prose — a deliberate, sitewide policy (not the guideline skill's own
recommendation of Western digits, which defaults toward UAE/Gulf tech
convention; this site made the opposite deliberate choice). Percent sign
follows the digits: ٨٠٪. Never mix Eastern and Western digits within the
same page's Arabic text.

## Notes for extending scope later

If Arabic is ever added to another page (see the scope note in
`docs/CONTENT-GUIDE.md` §4), check this file first for any term the new
page reuses (e.g. "Figma", "WCAG", "design token") before translating —
consistency across pages matters as much as within one page.
