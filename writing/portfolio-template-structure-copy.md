---

## Blueprint DS Portfolio Case Study

### Audience-First Framing

Enterprise, Banking, Government, and Product teams hiring at this level are not evaluating your visual taste. They're evaluating:

- **Can you architect a system that scales across teams?**
- **Can you make technical decisions and defend them?**
- **Can you drive adoption and reduce engineering friction?**
- **Do you understand governance, versioning, and contribution models?**

Your case study must answer all four. Show thinking, not just outcomes.

---

## Sections to Include

### 1. Context & Problem Statement *(the "why")*

The hardest thing for most DS portfolios to communicate clearly. Answer:

- What triggered Blueprint DS? Existing inconsistency? A product migration? A rebrand?
- What was failing before? (designer-to-engineer handoff, theming sprawl, copy-pasted colors)
- Who was the primary stakeholder, and what did they need to believe for this to succeed?

**For enterprise audiences:** Frame this as an organizational problem you solved, not a visual project you designed.

---

### 2. Scope & Constraints *(shows maturity)*

- What was in v1 scope vs. explicitly deferred?
- What were the technical constraints you designed within? (Wipfli's existing stack, WCAG 2.1 AA compliance requirements, white-label requirements if any)
- What did you *not* build, and why?

This section signals seniority. Junior designers show everything they made. Senior systems designers show they made deliberate choices about what not to build.

---

### 3. Token Architecture *(your most technically differentiating section)*

This is where Blueprint DS stands out. Show the **three-tier model** visually and explain the rationale:

```
Tier 1 — Primitives    →   Tier 2 — Semantic    →   Tier 3 — Component
tg-700 (#3D4A64)            text/body                  button/label
blue-500 (#004DFF)          action/primary             button/bg-default
```

Key decisions to surface with rationale:

- **Why tinted grey instead of neutral grey?** (Perceptual warmth, visual coherence with blue accent palette)
- **Why OKLCH?** (Perceptually uniform, better gamut for dark mode, Tailwind v4 compatibility)
- **Why components only consume Tier 2?** (Theming without breaking anything downstream)
- **Why Style Dictionary?** (Platform agnosticism — same source emits CSS vars, Tailwind `@theme`, and JSON)

Show a short before/after: "Before: 47 hardcoded hex values across 3 files. After: 1 source of truth, 2 build passes."

---

### 4. Color System *(show system thinking, not palette beauty)*

- Explain **semantic intent** as a system: the six intents (Info/Success/Critical/Warning/Neutral/AI) and why each maps to specific hues
- Show the **surface layering model** — how `surface/base → layer-1 → layer-2` creates elevation through shadow, not darkening (this is a sophisticated decision most candidates don't make)
- Demonstrate **light/dark mode parity** — same token names, different values, zero component rewrites needed

One annotated diagram beats six Figma screenshots.

---

### 5. Component Anatomy *(pick one or two, go deep)*

Do not show every component. Pick one component that exposes your thinking. The Button is a good candidate because it has:

- Variants (primary, secondary, ghost, destructive)
- All interaction states (hover, active, focus, disabled, loading)
- Size scale
- Icon support (alignment, optical padding)
- Accessibility (ARIA, keyboard, focus ring)

Show:

1. The anatomy diagram with token callouts
2. The decision: *why does the destructive variant use Critical/Red and not just a different button style?*
3. What engineering received: the component API shape, CVA variants, token mapping

---

### 6. Governance & Contribution Model *(critical for banking/government)*

This section separates "I built a component library" from "I built a system."

- How are new component requests submitted and prioritized?
- Who approves breaking changes?
- What's the versioning strategy (semver)?
- How are migration paths documented?
- How do teams consume updates without breaking their product?

Even if the governance model is still forming, show that you *designed* one and can articulate the tradeoffs.

---

### 7. Documentation Strategy *(shows you think about adoption)*

Show that you treat internal teams as users:

- What documentation format did you choose and why? (Storybook, Zeroheight, MDX, a custom Docsite?)
- What does a component page include by default? (Variants, props table, accessibility notes, do/don'ts, code snippet)
- How do designers vs. engineers navigate it differently?

One annotated screenshot of a single well-documented component page is more persuasive than a gallery of 40 component thumbnails.

---

### 8. Cross-Functional Process *(show how you work with engineers)*

- How did you align with the engineering team on token naming conventions?
- Were there tradeoffs between what Figma supports natively and what Style Dictionary produces?
- How did you validate parity between Figma variables and CSS output?

---

### 9. Outcomes & Metrics *(keep honest, even if partial)*

Quantify what you can:

- Reduction in hardcoded values in the codebase
- Time to implement a new themed component
- Adoption across products or teams
- Accessibility pass rate before/after
- Engineering ticket reduction related to visual inconsistency

If the project is still in progress, say so clearly. Frame it: "Phase 1 (tokens + foundations) is complete. Phase 2 (React component library) is in development." That's a mature answer, not a liability.

---

### 10. Reflection *(what you'd do differently)*

One paragraph. This is the single most-read section by senior hiring managers and it's the most skipped by candidates. Answering it authentically signals that you have the judgment to grow in the role.

---

## What NOT to Include

| Skip This | Why |
| --- | --- |
| Full token dump / spreadsheet of every value | Noise. Show architecture, not inventory. |
| Figma board screenshots without narrative | "Look at all my sticky notes" is not a case study. |
| Every component state in a grid | Gallery mode signals output, not thinking. |
| Generic process statements ("I conducted stakeholder interviews") | Specificity is credibility. What did you learn that changed the direction? |
| Work presented as shipped if it isn't | Senior hiring panels at enterprise orgs verify. Mark it clearly as in-progress. |
| Competitive analysis without a thesis | Only include if it directly influenced a decision. |
| Accessibility mentioned as a checkbox | It's a system constraint — show how it shaped token values (Lc scores, contrast requirements for yellow). |

---

## Structure Order (Recommended)

```
1. Cover — Project name, company/context, your role, timeline
2. Problem Statement
3. Scope & Constraints
4. Token Architecture (diagram + key decisions)
5. Color System + Intent Model
6. Component Deep Dive (1–2 components)
7. Governance Model
8. Documentation Strategy
9. Cross-Functional Process
10. Outcomes / Current Status
11. Reflection
```

---

## One Framing Principle to Keep in Mind

The strongest design systems case studies read like **engineering design documents with great visual communication** — not like visual design portfolios that happen to mention tokens. Your audience knows what a button looks like. What they're hiring for is the judgment to know why your button token is called `action/primary` instead of `brand/blue`, and what breaks if someone changes it.

Blueprint DS has that depth of thinking already built in. The case study just needs to surface it.

## Full UX Portfolio Guide — Rolan Gomes

---

### Foundational Framing

Before anything else, internalize this: **Dubai hiring managers in enterprise/finance read portfolios differently than Silicon Valley ones.** They are looking for evidence of reliability, system-level thinking, measurable business impact, and the ability to work within constraints. They are less impressed by visual polish alone and more by someone who can reduce risk, accelerate delivery, and communicate clearly with non-design stakeholders. Your background is almost perfectly calibrated for this — your job is to make that obvious, fast.

**Your portfolio does one job:** convince a Design Manager, Product Lead, or Hiring Director at a UAE enterprise company that you can own complex design problems end-to-end and ship them with engineering rigor and business awareness.

**Your single positioning line (use this everywhere — LinkedIn headline, portfolio hero, bio):**

> *Design Systems designer and UI engineer who closes the gap between Figma and production.*
> 

---

## Section 1 — Portfolio Architecture

### Site Structure

```
/ (Home — Hero + 3-sentence positioning + featured work grid)
/work/blueprint-design-system
/work/ai-design-to-code
/work/hub-accessibility
/work/hub-migration
/work/ai-process-framework    ← can double as article
/about
/writing                      ← LinkedIn article archive + longer reads
/contact
```

**Order rationale:** Blueprint first because it's your flagship systems piece. AI second because it's the most timely differentiator. Accessibility third because UAE finance/government cares deeply about compliance. Migration fourth for engineering depth. Framework fifth as thought leadership. **Deliberate strategy change, confirmed:** Incridea 2022 stays as a featured case study on the homepage because of its scale — it's not a discrepancy with the rest of this guidance, just a later call that overrides this specific line. Offsite still moves to a "More Work" section or the About page as a range signal.

### Hero Section (Home)

Do not use a generic tagline. Write two to three sentences that state:

1. What you do specifically
2. The kind of problems you solve
3. One concrete proof point

Example:

> I design and engineer design systems for enterprise products — from token architecture in Figma to component code in production. At Wipfli, I built the Blueprint Design System end-to-end, which was adopted by six products and served as the foundation for an AI-generated frontend POC that hit 80% component match in seven days.
> 

### How to Handle NDA Constraints

For every piece of Wipfli work, use this approach:

- **Mask product names and client-facing UI** — replace with "Enterprise Finance Portal" or "Hub Platform"
- **Show process artifacts, not screens** — token structures, component anatomy diagrams, audit spreadsheets, decision frameworks, before/after states at the component level rather than the full page
- **Use numbers freely** — violation counts, component counts, sprint metrics, adoption counts are not confidential
- **State the constraint openly** — add a single line on each case study: *"Detailed UI masked per NDA. Process artifacts and metrics shared with permission."* This signals professionalism, not weakness

---

## Section 2 — Case Study Briefs

---

### Case Study 1 — Blueprint Design System

**Type:** Flagship case study

**Approximate reading time target:** 8–10 minutes

**Priority:** 1 — This is your anchor piece. Everything else supports it.

#### The Narrative Arc

Start with the problem, not the system. The system is the solution. The problem was: five products with no shared design language, inconsistent component behavior, no token infrastructure, and no bridge between Figma and code. You were handed that problem and built the entire response.

**Arc:** Fragmentation → System Design → Build → Adoption → Impact

#### The Six Questions This Case Study Must Answer

1. **What was broken and why did it matter?** — Describe the state before Blueprint. What did developers, designers, and product teams lose without a shared system? Quantify if possible: how many inconsistencies, how many duplicate components, how many products were diverging.
2. **How did you decide what the system needed to be?** — Show your thinking framework. What was your process for auditing existing components? How did you prioritize what to build first? This is where you demonstrate systems thinking, not just Figma skills.
3. **What were the hardest design decisions?** — Pick two or three: token naming conventions, component API decisions, how you handled dark/light mode, how you resolved conflicting patterns across products. Show the reasoning, not just the outcome.
4. **How did you connect Figma to code?** — Explain Code Connect specifically. Most designers cannot do this. Walk through the mechanism: how a Figma component maps to a code component, how tokens flow from Figma Variables to CSS/design token JSON, what the developer experience looks like. This is your strongest technical differentiator.
5. **How was it adopted?** — Six products adopted Blueprint. How did that happen? Was it voluntary or mandated? Did you have to sell it? What resistance did you face and how did you handle it? Adoption is a product and communication problem, not just a design problem.
6. **What did it enable that wasn't possible before?** — This is your forward bridge to the AI POC case study. The system enabled a 7-day AI-generated frontend. That's the proof that a well-structured system multiplies velocity.

#### Perspective to Lead With

You are not a designer who made pretty components. You are someone who **treated a design system as a product** with users (developers and designers), adoption metrics, and a delivery roadmap. Lead with that framing explicitly.

#### How to Guide the Discussion

Open with a one-paragraph context-setter on what enterprise design fragmentation costs (developer time, QA cycles, brand inconsistency). Then move into your audit. Show the token architecture decision as a diagram — even a text-based one works on a process-focused site. Show one component's anatomy with its token bindings labeled. End with the adoption numbers and the sentence: *"Blueprint became the foundation that made AI-generated frontend work possible."* This trails directly into Case Study 2.

#### What to Show (NDA-safe)

- Token naming structure as a diagram (no actual UI values needed)
- Component anatomy sketch (generic enough: Button, Card, Input)
- Before/after component count or consistency metric
- Code Connect mapping diagram (abstract — Figma component → code component → token chain)
- Adoption timeline: 1 product → 6 products

---

### Case Study 2 — WorkFeed v2 AI-Generated Frontend POC

**Type:** Process + innovation case study

**Approximate reading time target:** 6–8 minutes

**Priority:** 2 — This is your sharpest differentiator in the current market. AI fluency + design systems + shipping code is rare.

#### The Narrative Arc

This is not a story about AI doing the work. This is a story about **what you had to build and think through to make AI work well.** The 80% component match rate did not happen because you typed a prompt. It happened because Blueprint was structured correctly, Code Connect was set up, and you knew how to direct an LLM with precision.

**Arc:** The hypothesis → What made it possible → How you directed the LLM → What it produced → Where it broke → What it proves

#### The Six Questions This Case Study Must Answer

1. **What was the hypothesis?** — What were you trying to prove? That an LLM could generate production-grade frontend from a well-structured design system? State the goal clearly.
2. **What prerequisites made the experiment possible?** — This is crucial. Blueprint, Code Connect, design tokens, and component documentation were all pre-conditions. Without them, the POC would have failed. This is your argument for investing in design systems — not as designer tooling, but as AI enablement infrastructure.
3. **How did you direct the LLM?** — This is the craft part. What prompting strategy did you use? Did you feed it component documentation? Token references? Figma data? How did you handle ambiguity? What iteration loop did you run? This shows you are not a passive AI user but a skilled director.
4. **What did 80% component match actually mean?** — Unpack this metric. Which 80% was correct? What was the 20% that failed and why? Was it component complexity, layout ambiguity, missing token coverage? The honest accounting of what broke is more convincing than the headline number.
5. **What would have taken longer without this approach?** — The 7-day turnaround. What was the counterfactual? How long would this have taken through a conventional design-then-handoff-then-build workflow? Make the time/cost argument explicit.
6. **What does this mean for how design systems should be built going forward?** — Share your thesis. Design systems are no longer just consistency tools. They are AI training and execution infrastructure. This positions you as someone thinking ahead.

#### Perspective to Lead With

Frame this as a **systems + process story, not a technology story.** You are not saying "I used AI." You are saying "I built the conditions under which AI could work reliably, then directed it precisely, and measured the output." That is a senior design practitioner perspective.

#### How to Guide the Discussion

Open with the business problem: fast frontend exploration without burning engineering cycles. Show the architecture decision: why a well-linked design system was the prerequisite. Walk through your prompting and direction methodology step by step — even a simple numbered list of the iteration loop is powerful. Show the 80%/20% breakdown honestly. Close with the strategic implication.

#### What to Show (NDA-safe)

- Workflow diagram: Figma Design System → Code Connect → LLM prompt → Component output → Review loop
- Component match breakdown (generic: "Navigation components: ✓, Form components: ✓, Data table: partial, Custom layout: ✗")
- A before/after of a prompt refinement — how your direction improved the output
- Timeline graphic: Day 1 → Day 7 with milestones

---

### Case Study 3 — WCAG 2.2 Accessibility Remediation

**Type:** Process + compliance case study

**Approximate reading time target:** 5–6 minutes

**Priority:** 3 — Accessibility is a legal requirement in UAE government and finance sectors. This case study signals commercial awareness.

#### The Narrative Arc

You did not just fix bugs. You built a remediation system across a live product under a major migration, and took it from 35 violations (8 Critical, 27 Serious) to zero. That is a complete compliance delivery.

**Arc:** Discovery → Triage → Fix methodology → Re-test → Zero state

#### The Five Questions This Case Study Must Answer

1. **How did you discover and classify the violations?** — What auditing tools and methodology did you use? How did you triage by severity? Show the logic of Critical vs. Serious vs. Minor and why that order mattered.
2. **What were the hardest categories to fix and why?** — Pick three violation types (focus states, modal behavior, clickable affordances, ARIA roles — you mentioned these). Explain the specific pattern you standardized for each. This shows technical depth.
3. **How did you coordinate the fixes during an active migration?** — You did this during Bootstrap 5 and Enhanced Data Model rollout. That is high-complexity coordination. How did you prevent regressions? How did you work with developers? Did you create a reference document?
4. **How did you verify zero violations?** — What was your re-testing process? What tools, what environment (QA, pre-PROD)? Who signed off?
5. **What systemic changes did you make so the violations wouldn't recur?** — Did you add accessibility standards to the Blueprint Design System? To the component documentation? This is the mature answer — remediation is reactive, prevention is systemic.

#### Perspective to Lead With

Frame this as **risk reduction and compliance delivery**, not as "good design practice." In UAE finance and government contexts, accessibility is becoming a legal requirement. You reduced legal exposure and audit risk. Lead with that.

#### What to Show (NDA-safe)

- Violation classification matrix (categories, counts, severity — no screenshots needed)
- Before/after on specific component patterns (focus ring: before = none, after = 3px offset outline, token-linked)
- Re-test results summary
- Prevention mechanism: how violations are now caught at the component level in Blueprint

---

### Case Study 4 — Hub Portal Bootstrap 3 → 5 Migration

**Type:** Engineering depth / scale case study

**Approximate reading time target:** 5–6 minutes

**Priority:** 4 — Demonstrates the scale of frontend work you can own and the architectural thinking behind CSS consolidation

#### The Narrative Arc

This is a story about technical debt, scale, and architecture decisions under real constraints — not a design story, but a design-engineering story.

**Arc:** Legacy state → Migration scope → CSS architecture decision → Execution → Outcome

#### The Five Questions This Case Study Must Answer

1. **What was the cost of the legacy state?** — Bootstrap 3.3, 14 fragmented CSS files, inconsistent components across 10+ pages. What was this costing the team in maintenance, inconsistency, and onboarding time?
2. **What were the migration decisions that had the most impact?** — Specifically the CSS consolidation from 14 files to a single global architecture. Walk through the decision: what principles guided the new architecture, how specificity was managed, how it scaled across sections.
3. **How did you handle scope at this scale?** — 10+ pages, 25+ components, 12+ modals, 3+ forms, 3+ web templates. What was your sequencing strategy? How did you avoid regressions? How did you coordinate with developers?
4. **What did the new architecture enable?** — Specifically, how does a clean CSS architecture make future work easier? How does it connect to Blueprint adoption? This shows you think beyond the sprint.
5. **What would you do differently?** — This is the maturity question. Every senior practitioner has a "knowing what I know now" reflection. Include one. It signals self-awareness and growth.

#### Perspective to Lead With

Frame this as **technical leadership on a frontend modernization program**, not as "I updated some CSS." You owned an architectural decision that affects every future front-end contribution to the platform.

#### What to Show (NDA-safe)

- Before/after CSS architecture diagram (file structure tree — no code, just the organizational model)
- Component migration scope table (categories + counts)
- Architecture principle diagram: specificity layers, token integration points

---

### Case Study 5 — AI in UX Design-to-Development Process Framework

**Type:** Thought leadership / process article (can live as both a portfolio piece and a LinkedIn article)

**Approximate reading time target:** 6–7 minutes

**Priority:** 5 — But highest LinkedIn article priority

#### The Narrative Arc

You did not just use AI tools. You contributed to a **firm-wide framework** that was formally adopted, presented to technical directors and partners, and is influencing the firm's AI strategy. That is organizational change work, not tool usage.

**Arc:** The gap it addressed → How you built the framework → What the framework says → How it was adopted → What it changed

#### The Five Questions This Case Study/Article Must Answer

1. **What problem did the existing Design-to-Dev handoff have that AI could address?** — Be specific. Was it documentation gaps? Component interpretation? Spec ambiguity? This frames the framework's purpose.
2. **What does your section of the framework actually prescribe?** — Walk through the Design section's core guidance. What decisions did you make about when AI should and shouldn't be used? What guardrails did you define? What inputs does the designer need to prepare for AI to work reliably?
3. **What made the framework worth adopting at the firm level?** — What changed in team practice as a result? What was the before/after on how designers approached handoff?
4. **What did you learn about the limits of AI in this workflow?** — Where does AI break down in design-to-code? What still requires human judgment? This honest answer is more credible than enthusiasm.
5. **Where do you think this goes next?** — Your forward thesis. As design systems become more mature and AI tools improve, what does the design-to-dev workflow look like in two to three years?

#### Perspective to Lead With

You are not a tool enthusiast. You are someone who **created institutional knowledge** around responsible and effective AI use in design. That is a strategic practitioner perspective that very few designers can claim in 2025.

---

### Mini Piece — Loader/Spinner Standardization

**Type:** Process micro-case study (400–600 words, or a LinkedIn post)

**Do not make this a full case study.** Use it as a sidebar or a linked process note inside either the Migration or Blueprint case study. Its value is showing **the discipline to standardize even small components** and quantify the outcome (10-day sprint → 5 days).

Include it as: *"A related challenge: three spinner frameworks, one solution."* Then two to three paragraphs and the metric.

---

### Creative Range Pieces (Incridea 2022, Offsite, Video)

**Do not feature these as primary case studies.** Put them on your About page or a "More Work" section with one image and two sentences each. They serve a specific purpose: proving you have range beyond enterprise UI, that you can lead creative direction, and that you understand brand and experiential design. The $35k sponsorship number is striking — use it.

---

## Section 3 — LinkedIn Article Strategy

Write three articles. Publish over six to eight weeks. Each one should trail back to your portfolio.

---

### Article 1 — *"The Design System Is the AI's Instruction Manual"*

**Publish first. This is your most timely piece.**

**Thesis:** Design systems are not just consistency tools. They are the structured context that makes AI-generated code reliable. A poorly built design system produces inconsistent AI output. A well-built one with token coverage and Code Connect produces 80% component match in seven days.

**Structure:**

- Open with the WorkFeed POC result as a hook
- Explain what made it possible (Blueprint, tokens, Code Connect)
- Walk through what happens when AI tries to generate from a poorly structured system
- Define the new role of design systems as AI infrastructure
- Close with practical guidance: three things to do to your design system before you try AI-generated frontend

**Target audience:** Design leads, design system owners, senior UX designers

**Word count:** 1,200–1,500

**CTA:** Link to WorkFeed case study on portfolio

---

### Article 2 — *"35 Violations to Zero: What Enterprise Accessibility Actually Looks Like"*

**Publish second.**

**Thesis:** Accessibility remediation is not a design polish task. It is a compliance delivery with triage logic, regression risk, and a re-test protocol. Here is what the process actually looks like inside a live product migration.

**Structure:**

- Open with the stakes: what happens when an enterprise product fails an accessibility audit
- Walk through the triage model (Critical → Serious → Minor)
- Spotlight three specific violation categories and the patterns you standardized
- Address the systemic prevention question: how do you stop the violations from coming back?
- Close with the business case: accessibility is risk reduction, not decoration

**Target audience:** Product managers, UX designers in enterprise/finance, engineering leads

**Word count:** 1,000–1,300

**CTA:** Link to Accessibility case study on portfolio

---

### Article 3 — *"What I Learned Directing an LLM to Build a Frontend"*

**Publish third.**

**Thesis:** Using AI to generate frontend is a skill, not a shortcut. The quality of the output is determined by the quality of your direction — and the quality of the system you built for it to work from.

**Structure:**

- Open with the honest framing: AI did not build the frontend. You directed it to.
- Walk through your prompting methodology — what you gave the LLM to work with, how you iterated
- Share what broke (the 20%) and why
- Share the meta-lesson: AI fluency in design is about preparation and direction, not delegation
- Close with your prediction for where this workflow goes

**Target audience:** Designers curious about AI workflows, design leads evaluating AI tooling, tech recruiters

**Word count:** 1,200–1,500

**CTA:** Link to AI POC case study on portfolio

---

## Section 4 — Dubai/UAE Market Calibration

These are signals to amplify in how you frame your work.

**Amplify compliance awareness.** UAE's government and finance sector (DIFC, ADGM, Central Bank) increasingly mandates digital accessibility and consistent UX standards. Your WCAG 2.2 work is commercially relevant, not just design hygiene.

**Lead with business impact numbers.** Dubai hiring culture is commercially oriented. Every piece should have a number: 80% match, 35 → 0 violations, 14 → 1 CSS architecture, 10-day sprint → 5 days, 6 products adopted, 7-day turnaround. These are the sentences that get read first.

**Highlight AI fluency explicitly.** Dubai's national AI strategy and initiatives like the Dubai Centre for Artificial Intelligence and Smart Dubai make AI capability a genuine differentiator. Your One Million Prompters certification is relevant context — link it from your About page.

**Position your engineering background as an asset.** In the UAE enterprise market, designers who can read, write, and direct code are significantly more valuable than those who cannot. Use the phrase "design-to-code" deliberately and frequently.

**Keep the copy tight and direct.** UAE enterprise hiring audiences tend to scan. Use short paragraphs, clear headers, and lead every section with the outcome before the process.

---

## Section 5 — Site Copy Principles

These apply to every page.

- **Lead with outcomes, follow with process.** Every case study headline and subhead should state what happened, not what you did.
- **Write in first person, past tense, active voice.** Not "A design system was created" but "I built."
- **Every case study needs exactly one strong opening sentence** that states the problem and why it mattered. Do not open with "I was tasked with" or "My role was."
- **The About page is not a bio.** It is a positioning statement followed by the three things you are exceptionally good at, followed by a short personal paragraph. End with a clear call to action.
- **Contact page should be short.** One sentence, one email, one LinkedIn link, one line about availability and timezone.

---

## Immediate Next Steps (Sequenced)

1. Confirm this architecture works for you
2. Start writing Blueprint case study first — it is your foundation piece and the longest
3. While writing Blueprint, set up the site skeleton (routing, typography, layout system)
4. Write WorkFeed case study second — it builds directly on Blueprint
5. Draft LinkedIn Article 1 in parallel with case study writing — it shares material with WorkFeed
6. Launch with two case studies and one article minimum, not a full portfolio — get it live and indexed, then add