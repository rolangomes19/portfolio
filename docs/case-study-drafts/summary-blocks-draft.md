# Case study summary blocks — draft for review

A compact problem / role / impact / stack block for each case study, meant to
sit at the top of the page (right after the hero summary, before or replacing
the current facts-bar) so a skimming technical reader gets the shape of the
work in ~10 seconds before deciding to read on. Sourced entirely from
existing case-study copy — no new claims, no new numbers.

Not wired into any HTML yet. Once you approve wording, I'll fold these into
each case study's markup (and, for the three pages with `en-simple`/`ar`
translations — Blueprint, Hub, Speery — add matching `data-i18n` entries).

---

## Blueprint Design System

**Problem** — Five squads on the Hub platform were shipping the same button
five different ways, with no bridge between Figma and code beyond screenshots.

**Role** — Design lead, foundational architecture through documentation,
alongside a UX Lead Architect (final sign-off) and a frontend engineer
(Phase 2, Code Connect).

**Impact** — 80% accurate LLM component-conversion rate in a design-to-code
proof of concept. Phase 1 (tokens, foundations, component kit) complete;
Phase 2 (React port, Code Connect) in development. Not yet live in
production — phased adoption is the case this result makes, not a shipped
result itself.

**Stack** — Figma · OKLCH tokens · Atomic Design · Code Connect · React ·
Tailwind v4

---

## Healthcare SaaS Redesign

**Problem** — An AI-generated prototype for a healthcare-data platform was
functionally complete but structurally empty: colors carried no consistent
meaning, no hierarchy, nothing signaling trustworthiness to an enterprise
buyer.

**Role** — Solo, design to handoff. Figma only; build handed to the client's
engineering team.

**Impact** — Full information-architecture rebuild, a three-axis semantic
tagging system (type / priority / sentiment), and a reusable collapsed-sidebar
navigation pattern. Delivered in two weeks, start to handoff.

**Stack** — Figma · Smart Animate prototyping · semantic color/tagging system

---

## Hub Platform Modernization

**Problem** — A Power Pages data-model migration was required to unlock
Bootstrap 5, which forced a full front-end rebuild — and that rebuild
surfaced 35 WCAG Critical/Serious violations, mismatched Azure AD B2C flows,
and three uncoordinated loading spinners.

**Role** — Design for the visual system upgrade; front-end development for
the Bootstrap rebuild, the 11 Azure AD B2C flows, and the spinner
consolidation. (The Power Pages migration itself was backend platform work,
not mine.)

**Impact** — 35 → 0 WCAG violations remediated. 14 of ~20 page-level CSS
files consolidated into one token-based stylesheet. All five efforts shipped
to production, no exceptions.

**Stack** — Bootstrap 3→5 · Power Pages · Dynamics 365 · Azure AD B2C · Deque
Axe

---

## Not included

**Incridea 2022** and **AI-generated frontend POC** are left out of this
pass — Incridea links out to a finished Behance case study rather than
living on this site, and the POC page is still marked "documentation in
progress," so a summary block would be describing content that doesn't
exist yet.
