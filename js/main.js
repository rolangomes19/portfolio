/* main.js — theme toggle, direction/language toggle, motion-safe reveals.
   No dependencies. Runs after DOM parse (script tag uses `defer`). */

(() => {
  "use strict";

  const root = document.documentElement;

  /* Reassigned by section 6 (only when the page has zoomable images) so
     section 2's language toggle can keep the lightbox's per-image labels
     in sync without section 2 needing to know section 6 exists. */
  let refreshLightboxLabels = () => {};

  /* Populated by section 4 the first time the mat colour is anything other
     than each theme's own plain default (i.e. a swatch was picked, a custom
     colour was typed, or a saved one was restored on load) — {light, dark}
     accent sets for whatever the mat currently is. Read by setTheme() below
     so a theme toggle re-applies the CORRECT half of an already-customised
     mat's accent pair instantly, with no recomputation. Left null in the
     plain-default case: --color-accent's own per-theme values in tokens.css
     already track each theme's own default mat with no JS involved, so
     there is nothing for a toggle to do. */
  let currentMatAccentSets = null;

  /* ------------------------------------------------------------------
     1. Theme toggle
     Order of truth: saved choice > OS preference > light.
     (An inline script in <head> applies the saved theme before paint
     to avoid a flash — this section only wires the button.)
  ------------------------------------------------------------------ */
  const themeBtn = document.querySelector("[data-theme-toggle]");
  // Mobile's full-width "Light mode / Dark mode" segmented bar (see
  // .mobile-controls in styles.css) — a two-option stand-in for the
  // circular icon toggle, which hides at that width instead of doubling
  // up. Both drive the same setTheme() and stay in sync automatically.
  const themeOptionBtns = Array.prototype.slice.call(
    document.querySelectorAll("[data-theme-option]")
  );

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    }
    themeOptionBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.themeOption === theme));
    });
    // The mat itself doesn't change with the theme, so if it's currently
    // driving a non-default accent, that accent needs to be re-solved for
    // the theme just switched TO — a hue that clears 4.5:1 on light parchment
    // is not the same lightness that clears 4.5:1 on dark paper.
    if (currentMatAccentSets) applyAccentSets(currentMatAccentSets);
  };

  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    themeBtn.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }
  themeOptionBtns.forEach((btn) => {
    const current = root.dataset.theme === "dark" ? "dark" : "light";
    btn.setAttribute("aria-pressed", String(btn.dataset.themeOption === current));
    btn.addEventListener("click", () => setTheme(btn.dataset.themeOption));
  });

  /* ------------------------------------------------------------------
     2. Content mode toggle: en (original) / en-simple (Simplified
     Technical English draft) / ar (Arabic).
     `lang` reflects the actual content language — "en" for BOTH English
     modes, "ar" only for Arabic. `dir` flips to rtl only for Arabic.
     Layout mirrors automatically because the CSS uses logical
     properties. Only index.html plus the Blueprint DS, Hub Platform, and
     Healthcare SaaS Redesign case studies have en-simple/ar content wired up via
     data-i18n keys below — every other page keeps this same 3-way
     toggle for its (already bilingual) nav/footer chrome only, and its
     body content stays as-is in every mode. See docs/CONTENT-GUIDE.md.
  ------------------------------------------------------------------ */
  const STRINGS = {
    en: {
      skip: "Skip to main content",
      "brand.name": "Rolan Gomes",
      "nav.work": "Works",
      "nav.about": "About",
      "nav.writing": "Writing",
      "nav.morework": "More work",
      "nav.contact": "Contact",
      "nav.toggle": "Menu",
      "toggle.theme": "Toggle dark mode",
      "actions.work": "View my work",
      "actions.cv": "Download my Resume",
      "footer.contact": "Contact",
      "footer.explore": "Explore",
      "footer.elsewhere": "Elsewhere",
      "lightbox.expand": "View full-screen",
      "lightbox.close": "Close",

      "meta.title": "Rolan Gomes - UX Designer · Visual/UI Design, Design Systems & Accessibility",
      "meta.description": "Rolan Gomes is a UX Designer specializing in Visual/UI Design, Design Systems, and WCAG 2.2 Accessibility — closing the gap between Figma and production. Bengaluru → Dubai.",

      "hero.title": "UX Designer working across brand, product, and design systems, backed by both <span class=\"concept-design\">design</span> and <span class=\"concept-engineering\">engineering</span>.",
      "hero.sub": "I'm a UX Designer with an engineer's ability to build, working across brand, product, and design systems. At a top-20 US accounting and consulting firm, I built the Blueprint Design System end to end and directed an LLM to generate a working frontend from it, an 80% component match rate in 7 days.",

      "highlight.bds.number": "6-product rollout planned",
      "highlight.bds.label": "Blueprint Design System adoption",
      "highlight.poc.number": "80% match · 7 days",
      "highlight.poc.label": "AI-generated frontend POC",
      "highlight.wcag.number": "35 → 0",
      "highlight.wcag.label": "WCAG 2.2 violations remediated",
      "highlight.css.number": "14 → 1",
      "highlight.css.label": "CSS files consolidated",
      "highlight.incridea.number": "$35k",
      "highlight.incridea.label": "Sponsorship driven, Incridea 2022",

      "work.title": "My Featured Works",
      "work.bds.desc": "Built a Design System for a top-20 US accounting and consulting firm. Led the Design and owned the decision making.",
      "work.speery.desc": "Rebuilt an AI-generated healthcare SaaS prototype into a systematic, trustworthy interface for enterprise buyers, solo, design to handoff, in two weeks.",
      "work.poc.status": "Case study documentation in progress",
      "work.poc.desc": "Using the Design System components, we directed and built a functioning frontend POC of a task management feature. Achieved 80% component match rate while converting Design to code.",
      "work.incridea.status": "Full case study on Behance",
      "work.incridea.desc": "Led the Design team for Incridea 2022. I was in charge of the Branding, creative direction and the execution of the fest theme on the digital, social media and physical media.",
      "work.hub.desc": "Led the front-end work across five connected efforts on one platform upgrade. Bootstrap 3→5 rebuild, WCAG 2.4.3 remediation, Azure AD B2C styling, and loading-state standardization. All shipped to production.",

      "about.eyebrow": "ABOUT ME",
      "about.title": "Hey there, I'm Rolan!",
      "about.p1": "I'm a UX Designer who thinks in systems. I work at the intersection of Design and Engineering, and focus on solutions that make good business. I love bringing making sense of messes, and figuring how to make it work. My mentor, Nabarun always says that “The space of ambiguity is a designer's best friend, as anything and everything is possible!”",
      "about.p2": "I've been designing since 2019. In the beginning, it was all about creating logos, crafting brand identities, social media, posters, etc. Alongside freelancing as a Graphic Designer and running a business and leading the design team of the college fest, I was pursuing my Bachelors Degree in Mechanical Engineering. So building CAD models in college and then designing posters, both felt right at home to me. One thing about me, is that I don't restrict myself inside a box, and I don't shy away from a challenge. You might realize that when you see my academic and career history.",
      "about.p3": "In my final year of Engineering, I was intrigued by the field of UX Design, learning about user experience, accessibility, usability, and all the other concepts. I could relate it to my experience with brand design, but realized that this is something very interesting and was also the best of both my worlds, Design and Engineering. Since then, I never really looked back. I started as a UI and Visual Designer, and quickly progressed to learning more and more about the experience side of things. I also picked up basic front-end development (brushing aside my code-phobia) and all these experiences only added to my understanding of design.",
      "about.p4": "I love working with people. My journey as a designer has taught me firsthand that good people make good impact. I believe in being a force multiplier in teams that I'm a part of, and by bringing out the best in everyone and collaborating, teams can deliver beyond the sum of their parts.",
      "about.p5": "From starting out in the small temple town of Udupi, to dreaming big in Bengaluru. I'm now dreaming bigger and bringing my expertise to Dubai and the United Arab Emirates. I'm looking forward to add value to your team and grow in my career.",
      "about.p6": "I guess that's enough about me. Before we talk, here's a quick look at what I actually build with day to day, and the credentials behind it. Then let's talk about how I can help you.",

      "skills.title": "Here's my toolbox!",
      "skills.eyebrow": "DRAG THE SKILL STICKERS AROUND OR CLICK THEM TO READ MORE ON HOW I USE THEM. ENJOY!!!",
      "skills.figma": "I have used Figma to build pixel perfect designs for web and mobile applications. I build responsive layouts and create interactive prototypes and also a Design System, if you have somehow missed that information so far :p",
      "skills.illustrator": "I have used Adobe Illustrator to create vector graphics and illustrations for various projects. My tool of choice for creating scalable graphics and logos.",
      "skills.photoshop": "Photoshop is where the retouching and digital artwork happens.",
      "skills.paper": "I have used Paper to sketch out ideas and create rough drafts for various projects. I like Paper for it's HTML based design, which makes it easy to build with AI tools like Claude Code, and it's OKLCH native color support.",
      "skills.tailwind": "I have used Tailwind CSS to build responsive and maintainable user interfaces. I leverage its utility-first approach to create consistent designs quickly.",
      "skills.html": "I have used HTML to structure web pages and create the foundation for web applications.",
      "skills.css": "I have used CSS to style web pages and create visually appealing user interfaces.",
      "skills.a11y": "Accessibility has been a concept close to me from the time I started learning web development. I strive to create inclusive experiences for all users. But I really internalized the importance of accessible design when I had to use devices and get my work done with a broken right hand for the entirety of two months, so you know that this is not just a checkbox for me.",
      "skills.claude": "I have used Claude to assist with writing and editing code, as well as brainstorming ideas and solving complex problems. This whole website was created with Claude's help. If Claude was a human, he'd be the best man at my wedding.",
      "skills.copilot": "I have used GitHub Copilot to assist with writing code and generating ideas. It's like having a helpful assistant by your side. The Design System was built with Copilot's assistance, helped me to undertsand React JS much better and to create a more accessible user interface.",
      "skills.midjourney": "I have used Midjourney to generate visual content for my projects, including illustrations and concept art. It's an engineer-turned designer's dream come to life to create images with specifications and parameters and not just words. But what I love (and hate) about it is the ambiguity and unpredictability of the results. Makes you to think and explore instead of being focused on your first idea.",
      "skills.vscode": "VS Code is the playground for my coding adventures. Combined with Github Copilot, it's my go-to environment for development. I'm also guilty of spending too much time in it chasing the right theme, instead of focusing on the code.",
      "skills.github": "Relatively new to Github as a tool, but finding it useful for version control and collaboration. I'm hosting this portfolio on Github and using it for code management.",
      "skills.devops": "Tool of choice for managing development workflows, enterprise projects, and team collaboration.",
      "skills.premiere": "Relatively new to Adobe Premiere Pro, but finding it useful for video editing and post-production tasks.",
      "skills.msoffice": "Well, MS Office is a staple in my productivity toolkit, used for document creation, data analysis, and communication. What else can you even say about it? It's indispensable.",
      "skills.notion": "I use Notion to organize my thoughts, manage tasks, and collaborate with others. I love the clean and intuitive interface, and it's accessibility with multiple devices. Not to miss, the good integration with other tools and availability of templates to use.",
      "skills.powerpages": "I have experience using Power Pages to create custom web applications and forms for various projects while working on the Hub platform project. We pushed Power Pages to its limits with custom integrations to build dynamic web experiences.",

      "certs.title": "Continuous learning.",

      "contact.title": "Get in touch and we'll talk business!",
      "contact.meta": "Already based in the UAE, looking for opportunities in Dubai, Abu Dhabi, Sharjah, or anywhere in the UAE.",
      "contact.email": "EMAIL",
      "contact.phone": "PHONE",
      "contact.linkedin": "LINKEDIN",
      "contact.behance": "BEHANCE",
      "contact.instagram": "INSTAGRAM",
      "contact.resume": "RESUME",

      "footer.colophon": "© 2026 Rolan Gomes. Built with loads of imagination, love and Claude Code.",

      "meta.bds.title": "Blueprint Design System - Rolan Gomes",
      "meta.bds.description": "Case study: building the Blueprint Design System from the ground up for the Hub platform. A three-tier OKLCH token model, a brand color corrected for AA contrast, an elevation model built on shadow rather than tint, and the Code Connect links that made an 80% LLM design-to-code conversion rate possible.",

      "meta.hub.title": "Hub Platform Modernization - Rolan Gomes",
      "meta.hub.description": "Case study: five projects on one platform over 16 months. A Power Pages migration forced a Bootstrap 3 to 5 rebuild, which surfaced WCAG 2.4.3 accessibility work. Azure AD B2C restyling and spinner standardization followed during the same visual system upgrade. All of it shipped to production.",
      "case.hub.summary": "Five projects on one platform over about a year and a half, none of them planned as a single initiative. A Power Pages data-model migration was required to unlock Bootstrap 5, which triggered a front-end rebuild and surfaced accessibility debt. In parallel, the Azure AD B2C sign-up and sign-in flows still didn’t match the new visual system, and a long-standing spinner inconsistency needed fixing. I worked on every part of it.",
      "case.hub.why.p1": "Power Pages ran on Bootstrap 3 from 2014 until Microsoft added Bootstrap 5 support in 2023, available only on the platform’s enhanced data model. Bootstrap 5 could not run on the older standard data model. That meant the Hub platform’s Bootstrap upgrade, which touched every page and component, could not begin until the data model was migrated. The accessibility work that followed traces directly to that dependency. The Azure AD B2C flows and the spinner cleanup do not: they happened on the same platform around the same time, but neither was blocked by the data-model migration.",
      "case.hub.why.p2": "The Power Pages migration itself was not my work. It moves site configuration from custom Dataverse tables into Microsoft’s standard solution tables, giving faster provisioning and removing the need for manual package updates. It’s included here because the four sections that follow depend on it.",
      "case.hub.bootstrap.p1": "Microsoft provides a migration tool for the Bootstrap 4-to-5 jump. It handles the known breaking changes, mainly renaming data attributes across interactive components. It does not account for custom code built on top of those classes. Running the tool broke pages: years of styling had accumulated across global CSS, page-level CSS, and inline styles with no consistent pattern, so the tool converted each case differently and left some components structurally broken.",
      "case.hub.bootstrap.p2": "We decided to rebuild the front end from scratch rather than fix what the tool produced. The visual design stayed close to the existing product; we cleaned it up and used space more efficiently without redesigning it. Every line of HTML and CSS was rewritten rather than patched. The main risk was the JavaScript and Dynamics 365 backend wired into that markup: a missed class name or element ID could silently break a working feature behind a page that still looked correct. We kept the old codebase as a reference and verified every wired connection against it manually. Two of us carried this out, neither a professional developer, on a live D365-backed platform, in 2024, before AI coding assistants were part of standard workflow.",
      "case.hub.bootstrap.p3": "There were no visual regressions, because nothing remained to regress to. We removed fourteen of roughly twenty page-level CSS files and consolidated what remained into a single global stylesheet built on CSS variables. A color or type change that previously required searching a dozen files now takes editing one token.",
      "case.hub.bootstrap.p4": "This rebuild is also where <a href=\"blueprint-design-system.html\">Blueprint Design System</a> originated. The same button appeared in four different visual forms across the platform, because components had inconsistent HTML structures and pulled styling from inline, page-level, and global sources at once. We resolved this one component at a time, and that process became the basis for Blueprint’s token-based system. That case study covers where the system went from there.",
      "case.hub.a11y.p1": "Testing the rebuilt front end with Deque Axe identified 35 Critical and Serious violations: 8 Critical, 27 Serious. The task was not only to close each flagged issue, but to identify the underlying pattern so the same mistake would not recur.",
      "case.hub.a11y.p2": "The hardest category was focus order, controlled by tabindex. The straightforward fix, assigning an explicit numeric value to every focusable element, is also the most fragile: it locks in a fixed sequence, and any later change, such as a new component or a reordered section, risks breaking that sequence or skipping a required element. WCAG 2.4.3 exists to address exactly this. The more durable solution follows the DOM’s natural order instead of overriding it. It takes more effort upfront but is far less likely to break silently later.",
      "case.hub.a11y.p3": "We tested the fixes ourselves first, then ran a formal QA pass with Axe, signed off by the QA accessibility tester. The longer-term change was that aria labels, alt text, and related accessibility work were built in from the start on everything developed afterward, so QA now catches regressions before release rather than after.",
      "case.hub.b2c.p1": "Eleven flows in total: registration, sign-in, forgot password, MFA verification and its variants, email and password changes, terms acceptance, and feedback and issue reporting. These pages already ran on Bootstrap 5, so the issue was not a version gap. It was years of inline styling: the same component styled inconsistently across flows, broken layouts, and branding that no longer matched the rest of the platform.",
      "case.hub.b2c.p2": "The core constraint is architectural. Azure AD B2C renders these pages by merging custom hosted HTML with its own injected form controls, the actual input fields, buttons, and validation logic, at runtime in the user’s browser. The source file contains only a shell and a placeholder div; the interactive elements that need styling don’t exist in any file that can be opened and read. The only way to determine their structure is to render the page, inspect the live DOM, and write CSS and JavaScript based on what’s found. Microsoft’s documentation notes that any JavaScript hooked to these elements requires pinning a specific page layout version, since Microsoft can otherwise change the injected markup without notice.",
      "case.hub.b2c.p3": "This was a harder problem than a standard styling pass, and it was also my first fully solo build, covering design and code from start to finish. It took two weeks. Pairing with QA during development, rather than waiting for a full QA cycle, kept the later testing pass short. Some of the accessibility issues from the previous section also appeared here and were fixed the same way.",
      "case.hub.spinner.p1": "Three different spinners had accumulated with no coordination: FontAwesome’s, bundled with Power Pages by default; Fluent UI’s, introduced through Microsoft D365 integrations and iframes; and a custom spinner built by a developer for one specific feature. No one had defined what a loading state should look like or behave like on the platform.",
      "case.hub.spinner.p2": "I documented every instance’s markup and styling, then used GitHub Copilot to trace each spinner back to where and how it was called before deciding on a replacement plan. Bootstrap’s own spinner became the target, since it was already the most compatible option with the rebuilt front end. Execution differed by origin: FontAwesome’s spinners required a small JavaScript swap to Bootstrap’s classes, the custom spinner was replaced outright, and Fluent UI’s required its own JavaScript replacement since no equivalent class-based swap existed. The consolidation reduced an estimated 10-day standardization effort to 5 days.",
      "case.hub.spinner.p3": "This should have shipped with the original Bootstrap rebuild. It didn’t, for the same reason most of these efforts were spread out: there wasn’t enough time or in-house expertise to take it on alongside everything else at once. It landed over a year later, on its own, but remains part of the same upgrade.",
      "case.hub.outcomes.p1": "Everything covered here shipped to production, with no exceptions.",
      "case.hub.reflect.p1": "Document the work while it’s still fresh. This write-up came more than a year after some of the work happened, which meant reconstructing decisions and constraints from memory rather than notes. The most useful details, the ones that explain a decision rather than just describe it, are also the first to be forgotten.",
      "case.hub.reflect.p2": "This project marked the shift from being seen as a visual designer to being able to work and communicate like a developer. That shift is reflected across every section above.",

      "case.speery.title": "Healthcare SaaS Redesign",
      "meta.speery.title": "Healthcare SaaS Redesign - Rolan Gomes",
      "meta.speery.description": "Case study: rebuilding an AI-generated healthcare SaaS prototype into a systematic, trustworthy interface for enterprise buyers — a three-axis semantic tagging system, an information-architecture rebuild, and a Figma handoff, solo, in two weeks.",
      "case.speery.summary": "This healthcare startup (name and identifying details modified for NDA) builds an AI-powered platform for pharma companies to capture and analyze HCP feedback. Their first version was vibe-coded: functional, fast to build, and structurally empty, colors that meant nothing, no hierarchy, nothing in the interface a healthcare enterprise buyer could trust. I rebuilt it alone, in two weeks, as a system built for two readers, a person scanning it and, eventually, an LLM reasoning over it, then handed the file to the client's own engineering team to build.",
      "case.speery.explore.p1": "This is the actual file, not a recording of it. Click through it the way a stakeholder review would, every transition is real Smart Animate, including the hover states on cards and the filter toolbar, not static frames stitched together.",
      "case.speery.context.p1": "The client had a working, AI-generated prototype and wanted to bring it to healthcare enterprise buyers as professional software, not as an AI demo. It worked. It just didn't hold together. The same red or blue showed up on a metric, a chart, and a status tag with no shared logic tying any of it together, and nothing about the interface signaled that this system could be trusted with a hospital's or a pharma company's data.",
      "case.speery.context.p2": "An AI agent can generate a functionally complete interface fast. It can't originate a system, a color that always means the same thing, a tag hierarchy that still works past the tenth card, an accessibility decision made on purpose. That gap, between functionally complete and actually systematic, is what two weeks went toward closing.",
      "case.speery.colorlogic.p1": "The vibe-coded UI used a lot of color, applied inconsistently, meaning nothing from one screen to the next. The fix started with a rule, not a palette: every status a user needs to read at a glance gets a color and an icon and a label, always in that same combination, everywhere in the product. Every insight card carries three of these independently, type (Observation, Insight, Actionable, Impact), priority (High, Medium, Low), and sentiment (Positive, Neutral, Negative), so a card can be high-priority and negative at once and still read clearly, something a single flat color code can't do.",
      "case.speery.colorlogic.p2": "That rule serves two readers at once. A pharma professional scanning fifty cards needs to tell severity apart without stopping to think, and a colorblind user needs the same information without relying on color at all. The client's own brief made the second reader explicit too: templates and components that scale into an enterprise product, built on a semantic system specific enough that its logic could eventually be extrapolated by an AI or LLM system downstream, not just read by a person.",
      "case.speery.screens.dashboard": "<strong>Dashboard.</strong> Same underlying data as the vibe-coded version, restructured into named, scannable sections, AI-Generated Weekly Summary split into Top Risks vs. Top Opportunities, Activity Overview, Quality &amp; Efficiency Metrics, Strategic Intelligence, Network &amp; Geography, Departmental Deep Dives. This is the clearest single artifact for information re-architecture over visual polish.",
      "case.speery.screens.manage": "<strong>Manage Insights.</strong> Card view, a selection mode for bulk actions, and a table view for power users who want the same data dense and sortable. The tagging system above carries through identically across all three.",
      "case.speery.screens.sidebar": "<strong>Collapsed sidebar.</strong> For a user who lives in this tool all day, the sidebar collapses to icons with sub-navigation on hover, trading a persistent label for screen space given back to the data.",
      "case.speery.screens.hcp": "<strong>HCP Profile.</strong> A doctor's record: identity, an engagement timeline, tabbed content for Publications, Clinical Trials, and Speaking &amp; Social. The AI Recommendations panel sits visually apart, a distinct violet accent and a confidence percentage on every suggestion, so the model's opinion is never mistaken for a fact in the record.",
      "case.speery.readtwice.p1": "Most of my systems work starts before the AI touches anything. This project starts after it, reading AI output critically and rebuilding the logic underneath it without a rewrite from scratch. An AI agent can generate a functionally complete interface in minutes. It can't decide what a color should always mean, or notice a tag hierarchy stopping working past the tenth card.",
      "case.speery.readtwice.p2": "The brief asked for a system specific enough to be read by an AI downstream, not just a person, the same instinct behind Blueprint's token structure being built for both a human developer and an LLM from day one, arrived at independently on a completely different project. That's a pattern in how I work, not a one-off claim, see <a href=\"blueprint-design-system.html\">Blueprint Design System</a>.",
      "case.speery.motion.p1": "Screen transitions run at 300ms with an ease-in-and-out curve, Smart Animate genuinely morphing shared layers like the sidebar and header rather than cutting between screens. Card and filter-toolbar hovers sit at 100ms, fast enough to read as instant. Nothing bounces. This is a professional healthcare dashboard whose literal brief was to build trust, and a playful interface would have undercut that. Explore the actual timing in the embed above rather than a description of it.",
      "case.speery.outcomes.p1": "Design delivered and handed off to the client's engineering team within a two-week freelance engagement: a full information-architecture rebuild, a three-axis tagging system, and a reusable navigation pattern, solo, start to handoff. This case study documents the design decisions and system architecture behind that delivery.",

      // Blueprint Design System case study. "en" values here are the exact
      // original technical copy — needed so switching back to "en" from
      // en-simple/ar actually restores it, not just "leaves whatever's on
      // screen" (data-i18n only ever WRITES a value it actually has).
      "case.bds.summary": "The Hub platform had five squads shipping the same button five different ways, and no bridge between Figma and code besides screenshots and goodwill. I led design on the system that fixed both, working alongside a UX Lead Architect and a frontend engineer: an Atomic Design component hierarchy sitting on top of a three-tier OKLCH token architecture, and the Code Connect links that turned out to be exactly what an LLM needed too.",
      "case.bds.context.p1": "The brand system at a top-20 US accounting and consulting firm was built for print and editorial. Nobody had thought much about product. Into that gap, engineering teams filled in their own interpretations, on whatever stack they were already on, with nothing to check their work against.",
      "case.bds.context.p2": "I saw the trigger up close. Inside a single project, the same button showed up four different ways, built by four different developers who'd each made their own reasonable call. No shared framework, no single source of truth. Teams that should have been building the same thing were quietly building four different things instead.",
      "case.bds.context.p3": "That's when it stopped being a nice-to-have and turned into a real problem worth fixing. I took it to the firm's internal IT Director and pitched building a design system. The pitch got approved, not as a funded line item with set hours, but as permission to work on it whenever sprint commitments left room. Meeting the deadlines the team set for itself meant putting in time outside working hours; that's what actually got Phase 1 built.",
      "case.bds.styleguide.p1": "Multiple versions of the same component meant nobody had unified control over how it looked or worked. A single bug fix meant hunting down every page it touched and fixing it there too, one at a time. Simple problems turned tedious fast.",
      "case.bds.styleguide.p2": "Documentation alone wouldn't have fixed that. Documentation describes drift, it doesn't stop it. What the team actually needed was something structural: one source every team could point to by intent, and a way to push updates without asking anyone to rewrite their code.",
      "case.bds.phases.p1": "Phase 1 was Figma and documentation, nothing else. The task was to audit the most heavily used components inside the Hub platform, then rebuild them from scratch as a proper component kit, starting underneath the components entirely: color, typography, spacing, elevation, iconography, all the atomic pieces, before a single component got touched.",
      "case.bds.phases.p2": "The pivot to Phase 2 happened partway through, almost by accident. It became clear that a well-documented design system doesn't just keep Figma tidy. It makes a design-to-code workflow possible. Once I saw that, Phase 2 more or less defined itself. Satvik Nayak, a frontend engineer with real depth in React, Base UI, Radix UI, and Tailwind CSS, joined the team partway through Phase 1, and his technical depth is what made Phase 2 possible in the first place; we planned it together once he was on board. It wasn't a random hire either: upcoming projects, and pieces of the ones already running, were headed toward React anyway. So the plan became simple: move fast, get components into real code, and prove it out on the task management work inside the Hub platform first.",
      "case.bds.quote": "This was never a one-person job. I reported to Nabarun, our UX Lead Architect, who had final say. Within that, I had the liberty to decide color, typography, elevation, and iconography based on research and judgment, brought to him for review and sign-off. With Satvik on Phase 2, it worked differently again: he owned how everything came together in code, Code Connect included, with just as much say in his half as I had in mine.",
      "case.bds.atomic.p1": "Everything under Foundations and everything in the component kit follows Brad Frost's Atomic Design methodology: atoms, molecules, organisms, templates, and pages, each level built from the one below it. I didn't bolt this on after the fact; it's the reason Phase 1 was sequenced the way it was. Foundations got built first, and a single component wasn't touched until color, typography, spacing, elevation, and iconography were locked. That's Atomic Design's own build order, applied without ever naming it in the earlier drafts of this case study, an omission worth correcting since it's the methodology the whole system runs on.",
      "case.bds.atomic.p2": "One distinction matters here, because it's easy to get wrong: the token tiers (Primitive → Semantic → Component, covered in the next section) and the Atomic Design tiers (atoms → molecules → organisms) are two different hierarchies, not the same one under two names. Token tiers describe how a <em>value</em> resolves: how a raw color becomes a semantic token becomes the background of a solid button. Atomic Design describes how a <em>component</em> gets composed: how a Button and a Tooltip combine into an icon-only button, and how that combines with others into a toolbar. Foundations sit underneath atoms, supplying the values every atom is built from, the same way protons and electrons sit underneath a chemical atom without being atoms themselves.",
      "case.bds.foundationsIntro": "This is the subatomic layer: the raw material every atom in the component kit is built from. None of it is directly usable in a UI on its own; a font-weight primitive or a shadow value only becomes something a user interacts with once it's assembled into an atom like Button or Input.",
      "case.bds.typography.p1": "Phase 1 launched with the brand's own editorial fonts: Anton, Montserrat, Lora. On a product screen, none of them held up. Anton is all caps with thick strokes, built for huge display sizes, and it turns into a mess at title scale in a real interface. Montserrat's characters run wide, so anything data-dense started to feel cramped.",
      "case.bds.typography.p2": "The fix was <strong>Inter Tight</strong> for display and headings, the condensed cut specifically, since it stays legible at large sizes without losing authority, <strong>Roboto Flex</strong> for body text, a variable font built for dense data, and <strong>Roboto Mono</strong> for IDs, code, and anything meant to be read by a machine as much as a person.",
      "case.bds.typography.p3": "One more typeface is worth calling out on its own, because it's a real accessibility feature rather than a legibility fix. <strong>Atkinson Hyperlegible Next</strong> sits in the system as a user-facing preference: turn it on, and it swaps the body font across every text style in the product, with nothing else changing. Not scale, not size, not line-height.",
      "case.bds.typography.p4": "That swap works cleanly because of a decision made one layer down. Font family and weight live only in the primitive layer, never touched directly by a text style. Change one primitive and every text style that depends on it follows automatically. It's the same idea the token system uses at Tier 2: keep the thing most likely to change isolated, so changing it doesn't mean touching fifty other things by hand.",
      "case.bds.iconography.p1": "This one had the same shape as the typography problem. Brand hadn't specified anything, because icons weren't really part of how the firm's identity showed up anywhere. But the visual identity itself is sharp, no soft curves in it at all, and whatever icon set I picked needed to carry that same character: legible, paired cleanly with the new type system, and sourced from something open and well-built rather than custom I'd have to maintain forever.",
      "case.bds.iconography.p2": "<strong>Material Symbols</strong>, in the Outline style, checked every box. I locked the variable axes into the spec so the family can't quietly drift as different people pull icons into their files.",
      "case.bds.iconography.p3": "Icon sizing pairs to <em>line-height</em>, not font size. An icon lives inside the text's vertical rhythm, so matching its bounding frame to that line-height is what makes it sit flush instead of looking stapled on. Interactive icons always get a 44 × 44 px hit area, built with padding, never by inflating the icon itself; decorative icons sitting next to a label don't need that treatment.",
      "case.bds.tokens.p1": "Blueprint runs on a three-tier token model. Primitive values sit at the bottom. Semantic tokens, named for what they mean rather than what they look like, sit in the middle. Component tokens sit on top, and those are what a React component actually reads. Everything flows one direction, primitive to semantic to component. A component never reaches down and grabs a primitive directly.",
      "case.bds.tokens.p2": "Blue was the first color decision in the design system, and every other hue was built downstream of it. The anchor blue was chosen to hold up against black as much as against white, since blue elements are frequently paired with black text and used directly on black backgrounds in banners, buttons, and marketing graphics. That decision anchored blue-500 in OKLCH, and every other hue in the system (red, green, yellow, the tinted greys) was then built by holding lightness constant against that same blue-500 anchor and adjusting hue and chroma. That's also why the one deliberate break from the pattern (yellow's anchor moving to 600 instead of 500) reads as a considered exception rather than an inconsistency.",
      "case.bds.spacing.p1": "Spacing follows the same three-tier discipline as everything else. The primitive layer is a flat numeric scale, Space/0 through Space/16, where every step is a multiple of a single 4 px base unit. 4 px was the deliberate choice over an 8 px grid: it divides cleanly across common screen densities (1x, 1.5x, 2x, 3x) and lands on a whole pixel at every step, so nothing in the system ever needs to round.",
      "case.bds.spacing.p2": "Components never read that primitive scale directly. A semantic layer sits between the raw numbers and the components, split into two purpose-specific tiers. Component spacing handles padding and gaps inside a single component. Layout spacing handles the distance between components and sections. The two tiers deliberately overlap at 16 px: that's not a naming accident. It's the seam where component-level density hands off to layout-level structure.",
      "case.bds.spacing.p3": "The rule that keeps the scale from eroding is simple and absolute: no raw pixel values inside a layout, ever, only a named token. A component's internal padding reaches for a Component token; the margin around that component reaches for a Layout token. Nesting follows the same logic outward: an outer block steps down to an inner one, never the reverse. And the scale doesn't flex at a breakpoint: spacing tokens keep the same value across screen sizes, because re-tuning a layout's rhythm per breakpoint is exactly the kind of per-developer judgment call this system exists to remove.",
      "case.bds.color.p1": "The order I built these in matters. It's really the whole story. I started with the brand's blue, converted it to OKLCH, and stretched it into an 11-stop ramp. Then, holding lightness constant at every stop, I built red, green, and yellow off that same structure, so all four families would behave the same way moving from light to dark. For slate, I took a desaturated version of the brand blue and grew it into a full grey scale, using Adobe Spectrum as a reference rather than guessing.",
      "case.bds.color.p2": "Yellow broke the pattern. Holding lightness constant, the way I had for every other color, gave me a yellow that looked muddy and dark, nothing like a warning color should look. So I didn't force it: I moved yellow's anchor up to the 600 stop instead, while blue, red, and green kept theirs at 500. Every color, from its anchor stop down to the darkest step, is AA-marked for white backgrounds. One method, used everywhere, broken on purpose in the one place it stopped working, with the reason written down next to it.",
      "case.bds.color.p3": "Every color in the system means something specific. Blue is action, brand, anything in-process. Green is success. Yellow is warning. Red I named <strong>Critical</strong>, and that word choice was deliberate: not \"destructive,\" not \"danger.\" Red in this system isn't only for destructive actions; it's for anything that needs a user's immediate attention, and destructive is just one flavor of that. Critical says the whole truth; the other two words only say part of it.",
      "case.bds.color.p4": "Info never got its own hue. It's folded into blue on purpose, because when a brand's main color is already blue, people read blue as informational anyway. I wrote that reasoning straight into the token descriptions, so it reads as a decision, not something that just happened to work out that way.",
      "case.bds.elevation.p1": "Every shadow in this system stacks three layers into a single box-shadow declaration. A 1px ring, zero blur and zero offset, stands in for the border: it stays sharp at any corner radius and transitions smoothly in a way a solid border never could. A tight contact shadow, offset a few pixels and pulled in with a negative spread, anchors the surface to whatever sits beneath it. A wider, softer ambient shadow, with a larger offset and blur, does the actual work of suggesting lift. All three layers are built from the brand's own navy, <code>rgba(8,16,48)</code>, rather than a generic grey, so a shadow reads as the material's own tone in shadow rather than a mismatched filter laid over it.",
      "case.bds.elevation.p2": "Five tokens carry that structure through the interface: shadow-xs (ring only, no lift, used for chips, tags, and dividers), shadow-sm (cards and rows), shadow-md (panels and drawers), shadow-lg (dropdowns and tooltips), and shadow-xl (modals and dialogs). Offset and blur exactly double at every step, so the jump from one level to the next is a derivable curve, not a guess.",
      "case.bds.elevation.p3": "Depth is carried entirely by shadow, never by tinting a surface darker. A lighter, closer-feeling fill reads correctly as lifted; a surface that sinks into a darker fill reads as heavier and further away, the wrong signal for something like a dropdown or a modal that's meant to float above everything else. Every elevated surface stays white or near-white for exactly that reason, and the shadow alone tells the eye how high it's sitting.",
      "case.bds.elevation.p4": "That structure earns its complexity. One box-shadow property carries ring, contact, and ambient together, so all three animate on a single transition instead of two properties drifting out of sync. Because the ring is a shadow rather than a stroke, it renders the same over any background, an image, a gradient, a differently tinted panel, without a color chosen against what's behind it. And since elevation never touches the border property, border stays completely free for actual meaning: an invalid field, a selected row, with no override battle against a structural border underneath it.",
      "case.bds.button.p1": "The Button is the component that started all of this. Four different implementations in one project were what got the whole pitch approved in the first place. It's also the clearest place to see the token layers actually working together, since every variant is just a combination of choices across a few independent dimensions.",
      "case.bds.button.p2": "Most design systems handle icon padding with a table: one row for leading-icon-only, one for trailing, one for both, one for neither. I skipped the table; the rule here is simpler. The label's own horizontal padding always matches the button's overall padding at that size, half a rem at Medium, a quarter rem at Small, on both sides, no matter which icon slots are filled. Run the math and it lands on the same numbers a four-row table would give you. It's one rule instead of four.",
      "case.bds.button.p3": "Disabling a button while it's mid-action sounds right, but it isn't. It pulls the button out of the tab order and tells a screen reader the button is unavailable, when really it's just busy. So the loading state sets <code>aria-busy=\"true\"</code> instead, and blocks interaction through <code>pointer-events</code> and a guarded click handler. The button stays focusable, and screen readers announce it correctly as busy, not gone. The spinner takes over the leading icon's spot, and the label can change to something like \"Saving…\" if it needs to, though it doesn't have to.",
      "case.bds.button.p4": "An icon-only button has no visible text, so it needs help on two fronts at once: an <code>aria-label</code> for screen readers, and a visible tooltip for anyone navigating by keyboard who can see the screen but has no text label to read. I didn't want that to depend on someone remembering to add both, so the TypeScript types won't even compile without them, and the component wraps itself in a Tooltip automatically whenever <code>iconOnly</code> is true. Nobody has to remember the pattern; it's just how the component works.",
      "case.bds.button.p5": "Button is the atom everything else in the component kit builds on. It doesn't combine with anything else to become useful. It already is. But it's also the piece that molecules like the icon-only button's Tooltip wrapper, the Split Button, and the Connected Button Group all start from, which is why getting its states, sizing, and accessibility contract right mattered more than any other single component in the system.",
      "case.bds.molecule.p1": "The clearest molecule in the system is small on purpose. An icon-only button is an Atom (Button) that, alone, fails a basic usability requirement: it has no visible text, so a screen reader user and a keyboard user who can see the screen but has no label to read both lose information a labelled button gives away for free. Pairing it with a Tooltip atom fixes that. Together, the two atoms take on a property neither one has by itself: an icon-only control that's fully identifiable no matter how someone is navigating the interface. That's the molecule test from Atomic Design: a group of atoms that, combined, does something none of them does alone.",
      "case.bds.molecule.p2": "That pairing isn't optional or left to memory: as covered in the Button section, the component's types won't compile without both <code>aria-label</code> and <code>tooltip</code>, and it wraps itself in the Tooltip atom automatically. The molecule is enforced at the type level, not just documented in prose.",
      "case.bds.molecule.p3": "Split Button and Connected Button Group are the same molecule pattern applied one level up, both compositions of the Button atom, both fully designed and documented in the Docsite as designed-but-not-built. A Split Button pairs a primary action with a secondary dropdown trigger, sharing a single visual container; a Connected Button Group takes a row of Button atoms and removes the spacing and corner radius between them so the row reads as one control instead of several. Neither needed a new foundational decision. Like the icon-only button, both are Button, recombined.",
      "case.bds.table.p1": "The data table is the clearest proof that the hierarchy compounds. Every piece of it already exists somewhere earlier in this case study. The table itself introduces almost nothing new. What it does introduce is composition at scale: the same small set of atoms and molecules, repeated and combined differently across dozens of rows, each row still behaving predictably because every cell type resolves back to a component that was already defined once.",
      "case.bds.table.p2": "A table row is a Molecule: a fixed set of cell-level atoms and molecules arranged in a line, functioning as a unit. The table itself, with its header row, its body of repeated row molecules, and pagination or bulk-action controls where present, is the Organism: a distinct, complex section of the interface built entirely from pieces defined once, upstream, and never redefined here. Nothing in the table needed a new color, a new spacing value, or a new interaction pattern. That's the payoff of building foundations before atoms and atoms before molecules: by the time you need something as complex as a data table, you're assembling, not designing from scratch.",
      "case.bds.templates.p1": "Two templates carry the system from components into layout.",
      "case.bds.templates.p2": "<strong>Page Frame</strong> attaches a Header and a Footer to a blank canvas, and every new page created in the Hub platform starts from it. Neither the header nor the footer gets rebuilt or re-attached per page. The template handles that once, the same way Microsoft's Power Pages configures page layout in Dynamics 365: a base template every new page inherits from, not a convention every page author has to remember to follow. That's the actual value of a template in Atomic Design terms: it's not a design decision, it's the removal of a decision a page author would otherwise have to make (and could get wrong) every single time.",
      "case.bds.templates.p3": "<strong>Modal/Drawer Frame</strong> pairs a background scrim with a container, and the same template serves two different placements: a centered modal and a right-side drawer. The scrim and the container are the constant. Position, entry animation, and width are what change between the two. Building this as one template instead of two means a scrim-behavior fix only has to happen once and both placements inherit it.",
      "case.bds.templates.p4": "Both templates sit exactly where Atomic Design says they should: below Pages, above Organisms. Neither one is a component, and neither one has final content in it. They're the layout skeleton a Page (like the task management proof of concept) gets poured into.",
      "case.bds.governance.p1": "When a team wants a new component added, it doesn't just get built. Design sits down with dev and whoever's asking for it and we work through three questions together: does something like this already exist? How often would it really get used? Is this a one-project need, or something other teams will want too? That conversation is what decides whether it gets built at all.",
      "case.bds.governance.p2": "Part of \"does something like this already exist\" is a tier question, not just a naming one: is what's being requested actually a new atom, or is it a molecule that can be assembled from atoms already in the kit? A lot of requests that sound like new components turn out to be a new combination of existing ones. That changes the scope of the work from \"design and build something new\" to \"document a new composition,\" a much smaller lift.",
      "case.bds.governance.p3": "If the answer's yes, it gets designed against the foundational layer already in place, broken down into its smallest parts, and scoped properly before anyone opens a design file. Then it gets built in code and documented the same way everything else is: anatomy, usage, behavior, accessibility. Only after all of that does it become an official part of the system.",
      "case.bds.governance.p4": "If the answer's no, the team asking gets a real reason, not a brush-off, and a path to make a stronger case later if they still think it belongs. A design system that can say no, and mean it, is a system. Without that, it's just a pile of components nobody's willing to push back on.",
      "case.bds.versioning.token": "Tokens and CSS publish on their own, separate from the React component packages. If a team only needs an updated color or a spacing tweak, they bump the token package alone, with no risk of accidentally pulling in a React behavior change they never asked for. Teams not using React (plain HTML and CSS, vanilla JS, mobile eventually) get the same primitives too, without carrying any framework weight. Style Dictionary handles the pipeline from raw JSON tokens to whatever gets distributed.",
      "case.bds.versioning.figma": "Version bumps in code tie directly to what happens in Figma. A designer publishes a library update, a webhook fires, and a CI/CD workflow through GitHub Actions picks it up. It pulls the new tokens through the Figma API, opens a pull request, and cuts a beta package a developer can test right away. That's what stops design and code from quietly drifting apart. When someone says \"we're on Buttons v2.1,\" it means the exact same thing whether they're a designer or a developer.",
      "case.bds.docs.p1": "Documentation lives in a custom Docsite, built on the firm's internal DevOps wiki. Every component page follows the exact same structure: definitions, anatomy, properties, a code snippet in both React and plain HTML and CSS, accessibility notes. Read one page, and you already know where to find anything on any other page. The Docsite's navigation follows the same hierarchy: Foundations first, then Atoms, then Molecules, then Organisms. Browsing the sidebar top to bottom is, itself, a walkthrough of how the system composes, without anyone having to read an explanation of the methodology first.",
      "case.bds.docs.p2": "There's a small discipline in there worth pointing out. The docs separate what's actually built from what's only planned: a split button and a connected button group are both fully designed and written up in the docsite right now, and both are labeled plainly as not yet built. It's the same honesty I used for the Phase 1 and Phase 2 status up top, just applied one level deeper.",
      "case.bds.alignment.p1": "Token naming isn't something we negotiated case by case. It's mechanical. CSS files map directly onto Figma's variable collections, flowing from Primitives to Semantics to Components. Component styles get written into <code>index.css</code> through Tailwind v4's <code>@theme</code> directive, so a raw token like <code>color.blue.900</code> turns into <code>--color-blue-900</code> in CSS without anyone having to think about it twice.",
      "case.bds.alignment.p2": "Design and engineering barely disagreed on naming, and there's a real reason for that: the structure was built for two readers from day one: human developers, and, as it turned out, LLMs too. That's not something bolted on later. It's a big part of why the design-to-code proof of concept hit 80% conversion accuracy. The token structure was never retrofitted for AI; it was built to work for both from the start, alongside the human developer experience, not instead of it.",
      "case.bds.outcomes.p1": "None of this has shipped to end users yet. What follows is what I can actually measure so far, kept honest about which number is which, since it's easy to blur two different kinds of progress into one impressive-sounding stat.",
      "case.bds.reflection.p1": "The lesson that cost me the most wasn't technical. I built Phase 1 mostly outside my sprint commitments (real hours, real learning), but I sat on submitting it for review far longer than I should have, convinced it wasn't ready yet. I was young in my career and wanted to prove myself, and that zeal for perfection didn't make the work better. It just delayed a genuinely solid system from getting the scrutiny and momentum it needed. Perfection is the enemy of done, and I learned that the hard way instead of early. Understanding it sooner wouldn't have meant cutting corners. It would have meant moving the same good work forward faster.",
    },
    "en-simple": {
      "meta.title": "Rolan Gomes - UX Designer",
      "meta.description": "Rolan Gomes is a UX Designer. He works on Visual and UI Design, Design Systems, and WCAG 2.2 Accessibility. He connects Figma designs to real production code. He is moving from Bengaluru to Dubai.",

      "hero.title": "I am a UX Designer. I work on brand, product, and design systems. I have <span class=\"concept-design\">design</span> skills and <span class=\"concept-engineering\">engineering</span> skills.",
      "hero.sub": "I am a UX Designer. I can also build software, like an engineer. I work on brand, product, and design systems. I built the Blueprint Design System for a top-20 US accounting and consulting firm. I built the full system myself. I then used an AI tool to build a working frontend from the system. The AI matched 80% of the components correctly. This took 7 days.",

      "work.title": "My Featured Work",
      "work.bds.desc": "I built a Design System for a top-20 US accounting and consulting firm. I led the design work. I made the key decisions.",
      "work.speery.desc": "I rebuilt an AI-generated healthcare software prototype. I made it systematic and trustworthy for enterprise buyers. I worked alone, from design to handoff. This took two weeks.",
      "work.poc.status": "The case study write-up is not ready yet.",
      "work.poc.desc": "We used the Design System components. We directed an AI tool to build a working frontend proof-of-concept. The feature was task management. The AI matched 80% of the components correctly when it converted the design to code.",
      "work.incridea.status": "See the full case study on Behance.",
      "work.incridea.desc": "I led the design team for Incridea 2022. I was in charge of the branding and creative direction. I made sure the festival theme worked across digital media, social media, and physical media.",
      "work.hub.desc": "I led the front-end work for one platform upgrade. The upgrade had five connected parts: a Bootstrap 3 to 5 rebuild, WCAG 2.4.3 accessibility fixes, Azure AD B2C styling, and standard loading states. All five parts shipped to production.",

      "about.p1": "I am a UX Designer. I think in systems. I work between Design and Engineering. I focus on solutions that are good for business. I like to make sense of messy problems. I like to find out how to make them work. My mentor, Nabarun, has a saying: “Ambiguity is a designer's best friend. In ambiguity, anything is possible.”",
      "about.p2": "I have been a designer since 2019. At first, I made logos, brand identities, social media posts, and posters. At the same time, I worked as a freelance Graphic Designer. I also ran a small business. I led the design team for my college festival. During this time, I was also studying for a Bachelor's Degree in Mechanical Engineering. I built CAD models in class. I designed posters after class. Both felt natural to me. I do not limit myself to one type of work. I do not avoid a challenge. My academic and career history shows this.",
      "about.p3": "In my final year of Engineering, I became interested in UX Design. I learned about user experience, accessibility, and usability. I could connect these ideas to my experience in brand design. I realized UX Design combined both of my worlds: Design and Engineering. I have not looked back since then. I started as a UI and Visual Designer. I quickly learned more about the experience side of design. I also learned basic front-end development, even though I was afraid of code at first. All of this added to my understanding of design.",
      "about.p4": "I like to work with people. My journey as a designer proves one thing: good people create a good impact. Good people can help you reach new heights. I try to be a force multiplier on my teams. I try to bring out the best in each person. When a team collaborates well, it can deliver more than the sum of its parts.",
      "about.p5": "I started in the small temple town of Udupi. I moved to the busy city of Bengaluru with big dreams. Now I have bigger dreams. I am bringing my skills to Dubai and the United Arab Emirates. I want to add value to your team. I want to grow my career.",
      "about.p6": "That is enough about me. Next, here is a quick look at the tools I use every day, and my credentials. After that, let's talk about how I can help you.",

      "skills.title": "Here are my tools.",
      "skills.eyebrow": "DRAG THE STICKERS. CLICK A STICKER TO READ MORE.",
      "skills.figma": "I use Figma to design for web and mobile. I build responsive layouts. I make interactive prototypes. I also built a Design System in Figma.",
      "skills.illustrator": "I use Adobe Illustrator to make vector graphics and illustrations. It is my tool for scalable graphics and logos.",
      "skills.photoshop": "I use Photoshop to retouch photos and create digital art.",
      "skills.paper": "I use Paper to sketch ideas and make rough drafts. Paper uses HTML for its design. This makes it easy to build with AI tools like Claude Code. Paper also supports OKLCH colors natively.",
      "skills.tailwind": "I use Tailwind CSS to build responsive interfaces. I use its utility classes to design quickly and keep the design consistent.",
      "skills.html": "I use HTML to structure web pages. HTML is the foundation of every web application I build.",
      "skills.css": "I use CSS to style web pages. CSS helps me build interfaces that look good.",
      "skills.a11y": "Accessibility has mattered to me since I started web development. I try to build inclusive experiences for all users. I broke my right hand once. For two months, I had to use devices one-handed. This showed me that accessibility is not just a checkbox.",
      "skills.claude": "I use Claude to help write and edit code. Claude also helps me brainstorm ideas and solve hard problems. Claude helped build this whole website. If Claude were a person, he would be the best man at my wedding.",
      "skills.copilot": "I use GitHub Copilot to help write code and generate ideas. It works like a helpful assistant. Copilot helped me build the Design System. It helped me understand React JS better. It also helped me build a more accessible interface.",
      "skills.midjourney": "I use Midjourney to create visual content, like illustrations and concept art. It helps me turn creative ideas into images. As an engineer-turned-designer, I like that I can set specific parameters, not just words. I also like the surprise in the results. It makes me think and explore more.",
      "skills.vscode": "VS Code is where I write my code. I use it together with GitHub Copilot. I also spend too much time picking the right theme instead of writing code.",
      "skills.github": "I am new to GitHub. I find it useful for version control and working with others. I host this portfolio on GitHub.",
      "skills.devops": "I use DevOps tools to manage development workflows. I use them for enterprise projects and team collaboration.",
      "skills.premiere": "I am new to Adobe Premiere Pro. I find it useful for video editing.",
      "skills.msoffice": "Microsoft Office is a key part of my daily work. I use it for documents, data analysis, and communication. It is hard to work without it.",
      "skills.notion": "I use Notion to organize my thoughts and manage tasks. I like its clean interface. I can use it on many devices. It also connects well with other tools, and it has many templates.",
      "skills.powerpages": "I used Power Pages to build custom web applications and forms. I used it on the Hub platform project. We pushed Power Pages to its limits with custom integrations.",

      "certs.title": "I keep learning.",

      "contact.title": "Contact me. Let's talk business.",
      "contact.meta": "I live in the UAE now. I am looking for jobs in Dubai, Abu Dhabi, Sharjah, or anywhere in the UAE.",


      "meta.bds.title": "Blueprint Design System - Rolan Gomes",
      "meta.bds.description": "A case study on building the Blueprint Design System for the Hub platform. It covers a three-tier OKLCH token model, an accessible brand color, a shadow-based elevation model, and the Code Connect links that led to an 80% LLM design-to-code match rate.",

      "meta.hub.title": "Hub Platform Modernization - Rolan Gomes",
      "meta.hub.description": "A case study on five projects on one platform over 16 months: a Power Pages migration, a Bootstrap 3 to 5 rebuild, WCAG 2.4.3 accessibility fixes, Azure AD B2C restyling, and spinner standardization. All of it shipped to production.",
      "case.hub.summary": "Five projects, over a year and a half, happened on one platform. A Power Pages data-model change was needed to unlock Bootstrap 5. That led to a front-end rebuild. The rebuild uncovered accessibility problems. At the same time, the Azure AD B2C sign-up and sign-in pages did not match the new visual system. A spinner problem also needed fixing. Nobody planned this as one project. I helped fix every part of it.",
      "case.hub.why.p1": "Power Pages ran on Bootstrap 3 from 2014 until Microsoft added Bootstrap 5 support in 2023. That support only works on Power Pages' newer data model. You cannot run a Bootstrap 5 site on the older data model. So the Hub platform's Bootstrap upgrade could not start until the data model changed first. The accessibility work came directly from that rebuild. The Azure AD B2C flows and the spinner cleanup are separate. They share the same platform and time period, but the data-model migration did not block them.",
      "case.hub.why.p2": "The Power Pages migration itself was not my work. It moves site settings from custom tables into Microsoft's standard tables. This means faster setup and no manual updates. I include it here because the next four sections could not happen without it.",
      "case.hub.bootstrap.p1": "Microsoft ships a migration tool for this exact upgrade. It fixes the known breaking changes between Bootstrap 4 and 5, mostly by renaming data attributes. It does not fix your own custom code built on top of those classes. We ran the tool. It broke pages. Years of styling were spread across global CSS, page-level CSS, and inline styles, with no consistent pattern. The tool converted each case differently, and some components came out broken.",
      "case.hub.bootstrap.p2": "We decided to rebuild the front end from scratch instead of fixing what the tool produced. The visual design stayed close to the existing product; we cleaned it up but did not reinvent it. We rewrote every line of HTML and CSS instead of patching it. The real risk was the JavaScript and the Dynamics 365 backend connected to that markup. A missed class name or element ID could quietly break a working feature. We kept the old codebase as a reference and checked every connection by hand. Two of us did this, neither a professional developer, on a live platform, in 2024, before AI coding tools were part of daily work.",
      "case.hub.bootstrap.p3": "There were no visual regressions, because there was nothing left to regress to. We removed fourteen of about twenty page-level CSS files. What remained went into one global stylesheet built on CSS variables. A color or type change that once meant searching a dozen files now means editing one token.",
      "case.hub.bootstrap.p4": "This is also where the <a href=\"blueprint-design-system.html\">Blueprint Design System</a> starts. The same button showed up four different ways during this rebuild. Components across the platform had different HTML structures and pulled styling from different places at once. We fixed this one component at a time, and that is where the token-based system on the Blueprint page began.",
      "case.hub.a11y.p1": "Testing the rebuilt front end with Deque Axe found 35 Critical and Serious violations: 8 Critical and 27 Serious. My job was not only to fix each flagged issue. It was to find the pattern behind them, so the same mistake did not come back later.",
      "case.hub.a11y.p2": "The hardest category was focus order, or tabindex. The easy fix is a fixed number on every focusable element, but that is also fragile. It locks in one sequence. Any future change, like a new component or a reordered section, risks breaking the sequence. WCAG 2.4.3 exists for this reason. The more durable fix follows the page's natural order instead of overriding it. This is more work up front, but far less likely to break later.",
      "case.hub.a11y.p3": "We tested it ourselves first, then ran a formal QA pass with Axe, signed off by the QA accessibility tester. The change that mattered longer-term: aria labels, alt text, and other accessibility work went in from the start on everything built afterward. QA now catches a regression before it ships, not after.",
      "case.hub.b2c.p1": "Registration, sign-in, forgot password, MFA verification, email and password changes, terms acceptance, and issue reporting: eleven flows in total. These pages already ran on Bootstrap 5, so the problem was not a version gap. It was years of inline styling: the same component styled differently across flows, broken layouts, and branding that no longer matched the platform.",
      "case.hub.b2c.p2": "The real limit here is architectural. Azure AD B2C builds these pages by merging your own HTML with its own form controls at runtime, in the user's browser. Those controls are the real input fields, buttons, and validation logic. Your source file only has a shell and one placeholder. You cannot open and read the interactive elements you need to style. The only way to know their structure is to render the page and inspect it live, then write CSS and JavaScript backward from what you find. Microsoft's own docs warn about this: if you hook JavaScript to these elements, you must pin a specific page layout version, or Microsoft can change the markup without warning.",
      "case.hub.b2c.p3": "This was a harder problem than a normal styling pass. It was also my first fully solo build, design and code, start to finish. It took two weeks. I worked with QA during development instead of waiting for a full QA cycle, which kept the later testing short. Some accessibility issues from the previous section showed up here too, and got fixed the same way.",
      "case.hub.spinner.p1": "Three different spinners had built up with no coordination. FontAwesome's came bundled with Power Pages by default. Fluent UI's arrived through Microsoft D365 integrations. A custom spinner had been built for one specific feature. Nobody had decided what a loading state should look like on this platform.",
      "case.hub.spinner.p2": "First, I documented every spinner's markup and styling. Then I used GitHub Copilot to trace each spinner back to where it was used, before deciding on a replacement plan. Bootstrap's own spinner became the target, since it fit best with the rebuilt front end. FontAwesome's spinners got a small JavaScript swap to Bootstrap's classes. The custom spinner was replaced outright. Fluent UI's needed its own JavaScript replacement. Altogether, this cut an estimated 10-day standardization task down to 5 days.",
      "case.hub.spinner.p3": "This should have shipped with the original Bootstrap rebuild. It did not, for the same reason most of these threads got spread out: there was not enough time or in-house skill to take it on alongside everything else at once. It landed over a year later, on its own, but it is still part of the same upgrade.",
      "case.hub.outcomes.p1": "Everything on this page shipped to production. No exceptions.",
      "case.hub.reflect.p1": "Document the work while it is still fresh. I wrote this up more than a year after some of it happened, so I had to reconstruct decisions from memory instead of notes. The sharpest details, the ones that explain a decision instead of just describing it, fade first.",
      "case.hub.reflect.p2": "One more note: this project is what moved me from being seen as a visual designer to someone who can work and speak like a developer. That shift runs through every section above.",

      "case.speery.title": "Healthcare SaaS Redesign",
      "meta.speery.title": "Healthcare SaaS Redesign - Rolan Gomes",
      "meta.speery.description": "A case study on rebuilding an AI-generated healthcare software prototype into a systematic, trustworthy interface for enterprise buyers: a three-part tagging system, an information-structure rebuild, and a Figma handoff, done solo in two weeks.",
      "case.speery.summary": "This healthcare startup (name and identifying details changed for NDA) builds an AI platform for pharma companies. It captures and analyzes feedback from healthcare professionals. Their first version was built quickly with AI, or \"vibe-coded.\" It worked, but it had no structure: colors meant nothing, there was no hierarchy, and nothing in the interface would build trust with a healthcare enterprise buyer. I rebuilt it alone, in two weeks. I built it as a system for two readers: a person scanning it, and later, an AI reasoning over it. Then I handed the file to the client's own engineering team to build.",
      "case.speery.explore.p1": "This is the actual file, not a recording. Click through it the way a stakeholder review would. Every transition is real Smart Animate, including the hover states on cards and the filter toolbar. It is not static frames stitched together.",
      "case.speery.context.p1": "The client had a working, AI-generated prototype. They wanted to bring it to healthcare enterprise buyers as real software, not as an AI demo. It worked, but it did not hold together. The same red or blue showed up on a metric, a chart, and a status tag, with no shared logic between them. Nothing in the interface signaled that this system could be trusted with a hospital's or a pharma company's data.",
      "case.speery.context.p2": "An AI agent can generate a functionally complete interface fast. It cannot create a system: a color that always means the same thing, a tag hierarchy that still works past the tenth card, an accessibility decision made on purpose. Closing that gap, between functionally complete and actually systematic, is what the two weeks went toward.",
      "case.speery.colorlogic.p1": "The AI-built interface used a lot of color, applied inconsistently, meaning nothing from one screen to the next. The fix started with a rule, not a palette: every status a user needs to read at a glance gets a color, an icon, and a label, always together, everywhere in the product. Every insight card carries three of these independently: type (Observation, Insight, Actionable, Impact), priority (High, Medium, Low), and sentiment (Positive, Neutral, Negative). A card can be high-priority and negative at the same time and still read clearly. A single flat color code cannot do that.",
      "case.speery.colorlogic.p2": "That rule serves two readers at once. A pharma professional scanning fifty cards needs to tell severity apart without stopping to think. A colorblind user needs the same information without relying on color at all. The client's brief made a third reader explicit too: templates and components built on a semantic system specific enough that an AI system could eventually read its logic too, not just a person.",
      "case.speery.screens.dashboard": "<strong>Dashboard.</strong> Same underlying data as the AI-built version, restructured into named, scannable sections: an AI-Generated Weekly Summary split into Top Risks and Top Opportunities, Activity Overview, Quality and Efficiency Metrics, Strategic Intelligence, Network and Geography, and Departmental Deep Dives. This is the clearest example of restructuring information over just improving visuals.",
      "case.speery.screens.manage": "<strong>Manage Insights.</strong> A card view, a selection mode for bulk actions, and a table view for power users who want the same data dense and sortable. The tagging system carries through identically across all three.",
      "case.speery.screens.sidebar": "<strong>Collapsed sidebar.</strong> For a user who lives in this tool all day, the sidebar collapses to icons with sub-navigation on hover. This trades a visible label for more screen space for the data.",
      "case.speery.screens.hcp": "<strong>HCP Profile.</strong> A doctor's record: identity, an engagement timeline, and tabbed content for Publications, Clinical Trials, and Speaking and Social. The AI Recommendations panel sits visually apart, with a distinct violet accent and a confidence percentage on every suggestion. This way, the model's opinion is never mistaken for a fact in the record.",
      "case.speery.readtwice.p1": "Most of my systems work starts before AI touches anything. This project starts after it: reading AI output critically and rebuilding the logic underneath it, without rewriting it from scratch. An AI agent can generate a functionally complete interface in minutes. It cannot decide what a color should always mean, or notice a tag hierarchy breaking down past the tenth card.",
      "case.speery.readtwice.p2": "The brief asked for a system specific enough for an AI to read later, not just a person. This is the same idea behind Blueprint's token structure, built for both a human developer and an LLM from day one, on a completely different project. That is a pattern in how I work, not a one-time claim. See the <a href=\"blueprint-design-system.html\">Blueprint Design System</a> case study.",
      "case.speery.readtwice.p3": "One place execution did not fully meet that brief, worth saying plainly: a system meant to be machine-readable depends on naming discipline everywhere, not just in the color logic. Several interactive layers in the file still carry Figma's auto-generated names. This is invisible to a person clicking through, but it is exactly the kind of thing that breaks a model trying to read the file's structure later.",
      "case.speery.motion.p1": "Screen transitions run at 300 milliseconds with an ease-in-and-out curve. Smart Animate genuinely morphs shared layers, like the sidebar and header, instead of cutting between screens. Card and filter-toolbar hovers run at 100 milliseconds, fast enough to feel instant. Nothing bounces. This is a professional healthcare dashboard meant to build trust, and a playful interface would work against that.",
      "case.speery.outcomes.p1": "Design was delivered and handed off to the client's engineering team within a two-week freelance project. As an outside contributor, I have no visibility into post-launch numbers. This case study documents the design decisions and system structure, not measured production results.",

      // Blueprint Design System — Simplified Technical English draft.
      "case.bds.summary": "The Hub platform had five teams. Each team built the same button in a different way. There was no link between Figma and code, only screenshots. I led the design work on the system that fixed this. I worked with a UX Lead Architect and a frontend engineer. We built an Atomic Design component hierarchy. It sits on a three-tier OKLCH token system. We also built Code Connect links. These links helped an LLM write code too.",
      "case.bds.context.p1": "The firm's brand system was built for print and editorial work. Nobody had planned for digital products. Engineering teams filled the gap themselves. Each team used its own stack. Nothing checked their work.",
      "case.bds.context.p2": "I saw the problem up close. One project had the same button built four different ways. Four developers each made their own choice. There was no shared framework and no single source of truth. Teams that should build the same thing built four different things instead.",
      "case.bds.context.p3": "This became a real problem, not just an annoyance. I pitched a design system to the firm's IT Director. The pitch was approved, but it had no dedicated budget or hours. I could only work on it between sprint tasks. To meet our own deadlines, I worked outside normal hours. That is how Phase 1 got built.",
      "case.bds.styleguide.p1": "Multiple versions of one component meant no one controlled how it looked or worked. One bug fix meant finding every page that used it. Simple problems became slow and tedious.",
      "case.bds.styleguide.p2": "Documentation alone would not fix this. Documentation describes the problem. It does not stop it. The team needed something structural: one system every team could use, with a way to push updates without asking anyone to rewrite code.",
      "case.bds.phases.p1": "Phase 1 was Figma and documentation only. We audited the most-used components on the Hub platform. Then we rebuilt them as a real component kit. We started at the foundation: color, typography, spacing, elevation, and icons. We built all of this before touching a single component.",
      "case.bds.phases.p2": "The move to Phase 2 happened partway through Phase 1. We saw that a well-documented design system does more than keep Figma tidy. It also makes a design-to-code workflow possible. Satvik Nayak, a frontend engineer, joined the team during Phase 1. He knew React, Base UI, Radix UI, and Tailwind CSS well. His skills made Phase 2 possible. We planned Phase 2 together once he joined. Future projects were moving to React anyway. So the plan was simple: move fast, turn components into real code, and test it on the Hub platform's task management feature first.",
      "case.bds.quote": "This was never a one-person job. I reported to Nabarun, our UX Lead Architect, who had final say. I had freedom to decide color, typography, elevation, and icons, based on research. I brought these decisions to him for review. With Satvik on Phase 2, the split was different. He owned how everything worked in code, including Code Connect. He had as much say in his half as I had in mine.",
      "case.bds.atomic.p1": "Everything in Foundations and the component kit follows Brad Frost's Atomic Design method: atoms, molecules, organisms, templates, and pages. Each level is built from the level below it. This is why Phase 1 was built in this order. We built Foundations first. We did not touch a single component until color, typography, spacing, elevation, and icons were locked.",
      "case.bds.atomic.p2": "One distinction matters here. Token tiers (Primitive, Semantic, Component) and Atomic Design tiers (atoms, molecules, organisms) are two different systems. Token tiers describe how a value resolves, like how a color code becomes a button's background. Atomic Design describes how a component is built, like how a Button and a Tooltip combine into one control. Foundations sit under atoms. They supply the raw values every atom uses.",
      "case.bds.foundationsBridge": "Foundations, covered next, is the base layer. It is the raw material every atom in the system is built from.",
      "case.bds.foundationsIntro": "This is the base layer. It is the raw material every atom in the component kit is built from. None of it works alone in a real interface. A font-weight value or a shadow value only becomes useful once it is built into an atom, like Button or Input.",
      "case.bds.typography.p1": "Phase 1 started with the brand's own fonts: Anton, Montserrat, and Lora. None of them worked well on a product screen. Anton is all caps with thick strokes, made for very large text. At title size in a real interface, it looked messy. Montserrat's letters are wide, so dense data felt cramped.",
      "case.bds.typography.p2": "The fix: Inter Tight (condensed) for display and headings, Roboto Flex for body text, and Roboto Mono for IDs and code.",
      "case.bds.typography.p3": "One more font deserves its own mention, because it is a real accessibility feature. Atkinson Hyperlegible Next is a user preference. Turn it on, and it replaces the body font everywhere. Nothing else changes: not scale, not size, not line-height.",
      "case.bds.typography.p4": "This works cleanly because of one decision. Font family and weight live only in the primitive layer. A text style never sets them directly. Change one primitive, and every text style that depends on it updates automatically. This is the same idea used in Tier 2 of the token system: keep the thing most likely to change in one place.",
      "case.bds.iconography.p1": "This had the same problem as typography. The brand had not specified any icon style, because icons were not part of the firm's visual identity. But the identity itself is sharp, with no soft curves. Any icon set I picked needed the same character: clear, matched to the new type system, and from an open, well-built source, not something custom I would need to maintain forever.",
      "case.bds.iconography.p2": "Material Symbols, in the Outline style, met every requirement. I locked the variable settings in the spec, so the icon family cannot drift as different people use it.",
      "case.bds.iconography.p3": "Icon size is matched to line-height, not font size. An icon sits inside the text's vertical rhythm. Matching its size to that line-height makes it sit flush, not stapled on. Interactive icons always get a 44 by 44 pixel hit area, made with padding, never by making the icon itself bigger. Decorative icons next to a label do not need this.",
      "case.bds.tokens.p1": "Blueprint uses a three-tier token model. Primitive values sit at the bottom. Semantic tokens, named for meaning, sit in the middle. Component tokens sit on top. A React component reads only component tokens. Values flow one way: primitive to semantic to component. A component never reads a primitive directly.",
      "case.bds.tokens.p2": "Blue was the first color decision. Every other color was built from it. The anchor blue was chosen to work against both black and white, because blue elements often sit on black backgrounds in banners and marketing graphics. Every other color (red, green, yellow, and grey) was built by keeping the same lightness as this blue and changing only hue and saturation. This is also why yellow's anchor point is different from the others. It is a deliberate exception, not a mistake.",
      "case.bds.spacing.p1": "Spacing follows the same three-tier system as everything else. The primitive layer is a flat number scale, from Space/0 to Space/16. Every step is a multiple of a 4-pixel base unit. We chose 4 pixels over 8 pixels because it divides evenly across common screen densities. Every step lands on a whole pixel, so nothing needs rounding.",
      "case.bds.spacing.p2": "Components never read the primitive scale directly. A semantic layer sits between the raw numbers and the components. It has two parts. Component spacing handles padding and gaps inside one component. Layout spacing handles the distance between components and sections. The two tiers overlap on purpose at 16 pixels. This is the point where component-level spacing hands off to layout-level spacing.",
      "case.bds.spacing.p3": "The rule that keeps this scale working is simple: no raw pixel values in a layout, ever. Only a named token. A component's padding uses a Component token. The space around it uses a Layout token. Nesting works outward, from outer to inner, never the reverse. Spacing tokens also do not change at different screen sizes. Adjusting spacing per screen size is exactly the kind of per-developer choice this system is meant to remove.",
      "case.bds.color.p1": "The build order matters here. I started with the brand's blue, converted it to OKLCH, and built an 11-stop color ramp. Then, keeping the same lightness at every stop, I built red, green, and yellow the same way. All four colors behave the same way from light to dark. For grey, I took a low-saturation version of the brand blue and grew it into a full grey scale, using Adobe Spectrum as a reference.",
      "case.bds.color.p2": "Yellow broke the pattern. Keeping the same lightness as the other colors made yellow look muddy and dark, not like a warning color. So I moved yellow's anchor point higher, while blue, red, and green kept theirs the same. Every color, from its anchor point to its darkest step, passes AA contrast on white backgrounds. One method, used everywhere, broken on purpose in the one place it did not work, with the reason written down.",
      "case.bds.color.p3": "Every color in the system has a specific meaning. Blue means action, brand, or in-progress. Green means success. Yellow means warning. I named red Critical, not \"destructive\" or \"danger.\" Red is for anything that needs a user's immediate attention. A destructive action is only one type of that. \"Critical\" says the whole truth.",
      "case.bds.color.p4": "Info did not get its own color. It uses blue on purpose. When a brand's main color is blue, people already read blue as informational. I wrote this reasoning directly into the token descriptions, so it reads as a decision, not an accident.",
      "case.bds.elevation.p1": "Every shadow in this system stacks three layers into one box-shadow value. A 1-pixel ring, with no blur, stands in for a border. It stays sharp at any corner radius. A small, tight shadow anchors the surface to what is under it. A larger, softer shadow suggests lift. All three layers use the brand's navy color, not plain grey, so a shadow looks like the material's own tone.",
      "case.bds.elevation.p2": "Five tokens carry this structure: shadow-xs (ring only, for chips and dividers), shadow-sm (cards and rows), shadow-md (panels and drawers), shadow-lg (dropdowns and tooltips), and shadow-xl (modals and dialogs). The offset and blur double at every step, so the jump between levels is predictable.",
      "case.bds.elevation.p3": "Depth comes only from shadow, never from a darker fill. A lighter, closer surface reads as lifted. A darker surface reads as heavier and further away. This is the wrong signal for something like a dropdown or modal that should float above everything. Every elevated surface stays white or near-white. The shadow alone tells the eye how high it sits.",
      "case.bds.elevation.p4": "This structure is worth its complexity. One box-shadow property carries the ring, contact shadow, and ambient shadow together, so they animate as one instead of drifting apart. Because the ring is a shadow, not a border, it looks correct over any background. And since elevation never touches the border property, border stays free for real meaning, like an invalid field or a selected row.",
      "case.bds.button.p1": "The Button is the component that started all of this. Four different versions in one project got the whole design system approved. It is also the clearest place to see the token layers work together. Every variant is just a combination of a few independent choices.",
      "case.bds.button.p2": "Most design systems handle icon padding with a table of rules. I skipped the table. The rule here is simple: the label's own padding always matches the button's overall padding at that size, no matter which icon slots are filled. Run the math, and it gives the same result a table would. One rule instead of four.",
      "case.bds.button.p3": "Disabling a button during an action sounds right, but it is wrong. It removes the button from the tab order and tells a screen reader the button is unavailable, when it is really just busy. So the loading state uses aria-busy=\"true\" instead, and blocks clicks through other means. The button stays focusable, and screen readers announce it correctly as busy, not gone.",
      "case.bds.button.p4": "An icon-only button has no visible text. It needs help in two ways: an aria-label for screen readers, and a visible tooltip for keyboard users who can see the screen but have no label to read. The code will not compile without both. The component wraps itself in a Tooltip automatically whenever it is icon-only. No one has to remember this rule.",
      "case.bds.button.p5": "Button is the atom everything else in the kit builds on. It does not need to combine with anything else to be useful. But other pieces, like the icon-only button's Tooltip, the Split Button, and the Connected Button Group, all start from Button. Getting its states, sizing, and accessibility right mattered more than any other single component.",
      "case.bds.molecule.p1": "The clearest molecule in the system is small on purpose. An icon-only button is a Button atom that, alone, fails a basic usability rule: it has no visible text. A screen reader user and a keyboard user both lose information a labelled button gives for free. Pairing it with a Tooltip atom fixes that. Together, the two atoms gain a property neither has alone: an icon-only control that is fully identifiable no matter how someone navigates. That is the molecule test from Atomic Design: a group of atoms that, combined, does something none of them does alone.",
      "case.bds.molecule.p2": "This pairing is not optional. The component's code will not compile for an icon-only button unless both aria-label and tooltip are set. The component wraps itself in the Tooltip atom automatically. The molecule is enforced in the code, not just written down.",
      "case.bds.molecule.p3": "Split Button and Connected Button Group use the same molecule pattern, one level up. Both are built from the Button atom. Both are fully designed and documented, but not yet built in code. A Split Button pairs a main action with a dropdown trigger in one container. A Connected Button Group takes a row of Button atoms and removes the space between them, so the row reads as one control. Neither needed a new foundational decision. Both are just Button, recombined.",
      "case.bds.table.p1": "The data table proves that the system compounds. Every piece of it already exists earlier in this case study. The table itself adds almost nothing new. What it adds is composition at scale: the same small set of atoms and molecules, repeated across many rows, each row behaving predictably because every cell type resolves back to a component defined once.",
      "case.bds.table.p2": "A table row is a Molecule: a fixed set of cell-level atoms and molecules in a line, working as one unit. The table itself, with its header row, body of repeated rows, and any pagination controls, is the Organism. Nothing in the table needed a new color, spacing value, or interaction pattern. That is the payoff of building foundations before atoms, and atoms before molecules: by the time you need something as complex as a data table, you are assembling it, not designing it from scratch.",
      "case.bds.templates.p1": "Two templates carry the system from components into layout.",
      "case.bds.templates.p2": "<strong>Page Frame</strong> attaches a Header and a Footer to a blank canvas. Every new page on the Hub platform starts from it. Neither the header nor the footer is rebuilt per page. The template handles that once, the same way Microsoft Power Pages configures page layout. This is the real value of a template: it removes a decision a page author would otherwise have to make, and could get wrong, every time.",
      "case.bds.templates.p3": "<strong>Modal/Drawer Frame</strong> pairs a background scrim with a container. The same template serves two placements: a centered modal and a right-side drawer. The scrim and container stay the same. Position, entry animation, and width change between the two. Building this as one template means a scrim fix only needs to happen once, and both placements get it.",
      "case.bds.templates.p4": "Both templates sit exactly where Atomic Design says they should: below Pages, above Organisms. Neither is a component, and neither has final content. They are the layout skeleton a Page, like the task management proof of concept, gets built into.",
      "case.bds.governance.p1": "When a team wants a new component, it does not just get built. Design sits with the developer and whoever is asking for it, and we work through three questions: does something like this already exist? How often would it really get used? Is this a one-project need, or something other teams will want too? That conversation decides if it gets built at all.",
      "case.bds.governance.p2": "Part of the first question is about the tier, not just the name: is this a new atom, or a molecule made from atoms already in the kit? Many requests that sound like new components turn out to be a new combination of existing ones. That changes the work from \"design something new\" to \"document a new combination,\" which is much less work.",
      "case.bds.governance.p3": "If the answer is yes, we design it against the existing foundation, break it into its smallest parts, and scope it properly before opening a design file. Then it gets built in code and documented like everything else: anatomy, usage, behavior, accessibility. Only then does it become an official part of the system.",
      "case.bds.governance.p4": "If the answer is no, the team gets a real reason, not a brush-off, and a path to make a stronger case later. A design system that can say no, and mean it, is a real system. Without that, it is just a pile of components nobody pushes back on.",
      "case.bds.versioning.token": "Tokens and CSS publish on their own, separate from the React component packages. If a team only needs an updated color or spacing value, they update the token package alone, with no risk of a React behavior change they did not ask for. Teams not using React (plain HTML and CSS, vanilla JS, mobile later) get the same base values too, without any framework weight. Style Dictionary handles the pipeline from raw tokens to whatever gets shipped.",
      "case.bds.versioning.figma": "Version updates in code tie directly to Figma. A designer publishes a library update, a webhook fires, and a CI/CD workflow through GitHub Actions picks it up. It pulls the new tokens through the Figma API, opens a pull request, and builds a test package a developer can try right away. This is what stops design and code from drifting apart. When someone says \"we are on Buttons version 2.1,\" it means the same thing for a designer and a developer.",
      "case.bds.docs.p1": "Documentation lives on a custom Docsite, built on the firm's internal wiki. Every component page follows the same structure: definitions, anatomy, properties, a code example in React and in plain HTML and CSS, and accessibility notes. Read one page, and you know where to find anything on any other page. The Docsite's navigation follows the same order: Foundations, then Atoms, then Molecules, then Organisms.",
      "case.bds.docs.p2": "One detail is worth noting. The docs separate what is actually built from what is only planned. A split button and a connected button group are fully designed and written up right now, but both are clearly marked as not yet built. It is the same honesty used for the Phase 1 and Phase 2 status, just applied one level deeper.",
      "case.bds.alignment.p1": "Token naming is not something we negotiated case by case. It is mechanical. CSS files map directly onto Figma's variable collections, from Primitives to Semantics to Components. Component styles are written into a stylesheet through Tailwind v4, so a raw token turns into a CSS variable automatically.",
      "case.bds.alignment.p2": "Design and engineering barely disagreed on naming, for a real reason: the structure was built for two readers from day one, human developers and, it turned out, LLMs too. This is a big part of why the design-to-code proof of concept hit 80% accuracy. The token structure was built to work for both from the start.",
      "case.bds.outcomes.p1": "None of this has shipped to end users yet. What follows is what I can actually measure so far, kept honest about which number means what.",
      "case.bds.reflection.p1": "The biggest lesson was not technical. I built Phase 1 mostly outside my normal work hours, real hours and real learning, but I waited far too long to submit it for review. I was young in my career, wanted to prove myself, and that need for perfection did not make the work better. It only delayed a solid system from getting the attention it needed. Perfect is the enemy of done, and I learned that the hard way. Learning it sooner would not have meant cutting corners. It would have meant moving the same good work forward faster.",
    },
    ar: {
      skip: "تخطَّ إلى المحتوى الرئيسي",
      "brand.name": "رولان غوميس",
      "nav.work": "الأعمال",
      "nav.about": "نبذة عني",
      "nav.writing": "الكتابة",
      "nav.morework": "أعمال أخرى",
      "nav.contact": "تواصل",
      "nav.toggle": "القائمة",
      "toggle.theme": "تبديل الوضع الداكن",
      "actions.work": "عرض أعمالي",
      "actions.cv": "تحميل سيرتي الذاتية",
      "footer.contact": "تواصل",
      "footer.explore": "استكشف",
      "footer.elsewhere": "أماكن أخرى",
      "lightbox.expand": "عرض بملء الشاشة",
      "lightbox.close": "إغلاق",

      // Phase 2 — Arabic, translated from the approved en-simple (STE)
      // draft per docs/AR-GLOSSARY.md. Digits use Eastern Arabic-Indic
      // numerals (deliberate sitewide policy — see the plan). Tool/platform
      // proper nouns (Figma, GitHub, React, WCAG, etc.) stay in Latin
      // script; "Rolan Gomes" is transliterated (رولان غوميس) everywhere
      // except the footer copyright line, which is identical text in all
      // three modes on purpose.
      "meta.title": "رولان غوميس - مصمم تجربة المستخدم",
      "meta.description": "رولان غوميس مصمم تجربة مستخدم (UX). يعمل على تصميم الواجهات المرئية، وأنظمة التصميم، وإمكانية الوصول وفق معيار WCAG 2.2. يربط بين تصاميم Figma والكود الفعلي في الإنتاج. ينتقل من بنغالورو إلى دبي.",

      "hero.title": "أنا مصمم UX. أعمل على الهوية التجارية، والمنتجات، وأنظمة التصميم. أمتلك مهارات في <span class=\"concept-design\">التصميم</span> و<span class=\"concept-engineering\">الهندسة</span>.",
      "hero.sub": "أنا مصمم UX أستطيع أيضًا بناء البرمجيات، مثل المهندس. أعمل على الهوية التجارية، والمنتجات، وأنظمة التصميم. بنيت نظام Blueprint Design System لشركة أمريكية كبرى في المحاسبة والاستشارات ضمن أفضل ٢٠ شركة. بنيت النظام بالكامل بنفسي. ثم استخدمت أداة ذكاء اصطناعي لبناء واجهة أمامية فعلية من هذا النظام. طابقت الأداة ٨٠٪ من المكوّنات بدقة. استغرق ذلك ٧ أيام.",

      "highlight.bds.number": "خطة تعميم على ٦ منتجات",
      "highlight.bds.label": "تبني نظام Blueprint Design System",
      "highlight.poc.number": "تطابق ٨٠٪ · ٧ أيام",
      "highlight.poc.label": "نموذج أولي لواجهة أمامية بالذكاء الاصطناعي",
      "highlight.wcag.number": "٣٥ ← ٠",
      "highlight.wcag.label": "معالجة مخالفات WCAG 2.2",
      "highlight.css.number": "١٤ ← ١",
      "highlight.css.label": "دمج ملفات CSS",
      "highlight.incridea.number": "٣٥ ألف دولار",
      "highlight.incridea.label": "رعاية مالية لفعالية Incridea ٢٠٢٢",

      "work.title": "أبرز أعمالي",
      "work.bds.desc": "بنيت نظام تصميم لشركة أمريكية كبرى في المحاسبة والاستشارات ضمن أفضل ٢٠ شركة. قدت العمل التصميمي واتخذت القرارات الأساسية.",
      "work.speery.desc": "أعدت بناء نموذج أولي لبرمجية رعاية صحية تم توليده بالذكاء الاصطناعي. جعلته منظمًا وموثوقًا للمشترين المؤسسيين. عملت بمفردي، من التصميم حتى التسليم. استغرق ذلك أسبوعين.",
      "work.poc.status": "توثيق دراسة الحالة لم يكتمل بعد.",
      "work.poc.desc": "استخدمنا مكوّنات نظام التصميم. وجّهنا أداة ذكاء اصطناعي لبناء نموذج أولي فعلي لواجهة أمامية. الميزة كانت إدارة المهام. طابقت الأداة ٨٠٪ من المكوّنات بدقة عند تحويل التصميم إلى كود.",
      "work.incridea.status": "شاهد دراسة الحالة الكاملة على Behance.",
      "work.incridea.desc": "قدت فريق التصميم لفعالية Incridea لعام ٢٠٢٢. كنت مسؤولًا عن الهوية البصرية والتوجيه الإبداعي. تأكدت من أن ثيمة الفعالية تعمل عبر الإعلام الرقمي، ووسائل التواصل الاجتماعي، والوسائط المادية.",
      "work.hub.desc": "قدت العمل الأمامي (front-end) لترقية منصة واحدة. تضمنت الترقية خمسة أجزاء مترابطة: إعادة بناء بمعيار Bootstrap من الإصدار ٣ إلى ٥، وإصلاحات إمكانية الوصول وفق WCAG 2.4.3، وإعادة تصميم Azure AD B2C، وتوحيد حالات التحميل. أُطلقت جميع الأجزاء الخمسة في الإنتاج.",

      "about.eyebrow": "نبذة عني",
      "about.title": "السلام عليكم، مرحبًا، أنا رولان!",
      "about.p1": "أنا مصمم UX. أفكر بمنطق الأنظمة. أعمل بين التصميم والهندسة. أركّز على حلول تخدم الأعمال. أحب فهم المشكلات المعقدة. أحب اكتشاف كيفية جعلها تعمل. مرشدي، نبرون، له مقولة: «الغموض هو أفضل صديق للمصمم. ففي الغموض، كل شيء ممكن».",
      "about.p2": "أعمل في التصميم منذ عام ٢٠١٩. في البداية، صممت الشعارات، والهويات التجارية، ومنشورات التواصل الاجتماعي، والملصقات. في الوقت نفسه، عملت كمصمم جرافيك مستقل. كما أدرت عملًا صغيرًا. قدت فريق التصميم لمهرجان كليتي. خلال هذه الفترة، كنت أدرس أيضًا لنيل درجة البكالوريوس في الهندسة الميكانيكية. بنيت نماذج CAD في الصف. صممت الملصقات بعد الدوام. شعرت أن كليهما طبيعي بالنسبة لي. لا أحصر نفسي في نوع واحد من العمل. لا أتجنب التحدي. يُظهر تاريخي الأكاديمي والمهني ذلك.",
      "about.p3": "في سنتي الأخيرة في الهندسة، أصبحت مهتمًا بتصميم UX. تعلمت عن تجربة المستخدم، وإمكانية الوصول، وسهولة الاستخدام. استطعت ربط هذه الأفكار بخبرتي في تصميم الهوية التجارية. أدركت أن تصميم UX يجمع بين عالميّ: التصميم والهندسة. لم أنظر إلى الوراء منذ ذلك الحين. بدأت كمصمم واجهات ومصمم بصري. تعلمت بسرعة المزيد عن جانب التجربة في التصميم. تعلمت أيضًا أساسيات تطوير الواجهة الأمامية، رغم خوفي من الكود في البداية. كل هذا أضاف إلى فهمي للتصميم.",
      "about.p4": "أحب العمل مع الناس. تثبت رحلتي كمصمم أمرًا واحدًا: الأشخاص الجيدون يصنعون أثرًا جيدًا. يمكن للأشخاص الجيدين مساعدتك على الوصول إلى آفاق جديدة. أحاول أن أكون عامل مضاعفة في فرقي. أحاول إبراز أفضل ما لدى كل شخص. عندما يتعاون الفريق جيدًا، يمكنه تقديم أكثر من مجموع أجزائه.",
      "about.p5": "بدأت في بلدة أودوبي الصغيرة ذات المعابد. انتقلت إلى مدينة بنغالورو الصاخبة بأحلام كبيرة. الآن لديّ أحلام أكبر. أجلب مهاراتي إلى دبي والإمارات العربية المتحدة. أريد أن أضيف قيمة لفريقكم. أريد أن أُنمّي مسيرتي المهنية.",
      "about.p6": "هذا يكفي عني. بعد ذلك، إليكم لمحة سريعة عن الأدوات التي أستخدمها يوميًا، وشهاداتي. ثم لنتحدث عن كيف يمكنني مساعدتكم.",

      "skills.title": "أدواتي",
      "skills.eyebrow": "اسحب الملصقات. اضغط على أي ملصق لقراءة المزيد.",
      "skills.figma": "أستخدم Figma لتصميم واجهات الويب والجوال. أبني تخطيطات متجاوبة. أصنع نماذج أولية تفاعلية. كما بنيت نظام تصميم في Figma.",
      "skills.illustrator": "أستخدم Adobe Illustrator لصنع رسومات متجهة وتوضيحات. إنها أداتي المفضلة للرسومات القابلة للتكبير والشعارات.",
      "skills.photoshop": "أستخدم Photoshop لتعديل الصور وصنع الأعمال الفنية الرقمية.",
      "skills.paper": "أستخدم Paper لرسم الأفكار وعمل المسودات الأولية. يعتمد Paper على HTML في تصميمه. هذا يسهّل البناء باستخدام أدوات الذكاء الاصطناعي مثل Claude Code. كما يدعم Paper ألوان OKLCH بشكل أصلي.",
      "skills.tailwind": "أستخدم Tailwind CSS لبناء واجهات متجاوبة. أستخدم فئاته الجاهزة للتصميم بسرعة والحفاظ على الاتساق.",
      "skills.html": "أستخدم HTML لبناء هيكل صفحات الويب. HTML هو الأساس لكل تطبيق ويب أبنيه.",
      "skills.css": "أستخدم CSS لتنسيق صفحات الويب. يساعدني CSS في بناء واجهات ذات مظهر جيد.",
      "skills.a11y": "إمكانية الوصول مهمة بالنسبة لي منذ أن بدأت في تطوير الويب. أحاول بناء تجارب شاملة لجميع المستخدمين. كسرت يدي اليمنى مرة. لمدة شهرين، اضطررت لاستخدام الأجهزة بيد واحدة. هذا أظهر لي أن إمكانية الوصول ليست مجرد بند في قائمة تدقيق.",
      "skills.claude": "أستخدم Claude للمساعدة في كتابة الكود وتحريره. يساعدني Claude أيضًا في توليد الأفكار وحل المشكلات الصعبة. ساعد Claude في بناء هذا الموقع بالكامل. لو كان Claude شخصًا، لكان إشبيني في زفافي.",
      "skills.copilot": "أستخدم GitHub Copilot للمساعدة في كتابة الكود وتوليد الأفكار. يعمل مثل مساعد مفيد. ساعدني Copilot في بناء نظام التصميم. ساعدني على فهم React JS بشكل أفضل. كما ساعدني في بناء واجهة أكثر إمكانية للوصول.",
      "skills.midjourney": "أستخدم Midjourney لإنشاء محتوى بصري، مثل الرسوم التوضيحية وفن المفاهيم. يساعدني على تحويل الأفكار الإبداعية إلى صور. بصفتي مهندسًا تحوّل إلى مصمم، يعجبني أنني أستطيع تحديد معايير دقيقة، وليس فقط كلمات. كما يعجبني عنصر المفاجأة في النتائج. هذا يجعلني أفكر وأستكشف أكثر.",
      "skills.vscode": "VS Code هو المكان الذي أكتب فيه الكود. أستخدمه مع GitHub Copilot. كما أقضي وقتًا طويلًا في اختيار الثيم المناسب بدلًا من كتابة الكود.",
      "skills.github": "أنا جديد نسبيًا على GitHub. أجده مفيدًا للتحكم بالإصدارات والعمل مع الآخرين. أستضيف هذا الموقع على GitHub.",
      "skills.devops": "أستخدم أدوات DevOps لإدارة مسارات التطوير. أستخدمها للمشاريع المؤسسية والعمل الجماعي.",
      "skills.premiere": "أنا جديد نسبيًا على Adobe Premiere Pro. أجده مفيدًا لتحرير الفيديو.",
      "skills.msoffice": "يُعد Microsoft Office جزءًا أساسيًا من عملي اليومي. أستخدمه للمستندات وتحليل البيانات والتواصل. من الصعب العمل بدونه.",
      "skills.notion": "أستخدم Notion لتنظيم أفكاري وإدارة المهام. أحب واجهته النظيفة. يمكنني استخدامه على أجهزة متعددة. كما يتكامل جيدًا مع أدوات أخرى، ويحتوي على قوالب كثيرة.",
      "skills.powerpages": "استخدمت Power Pages لبناء تطبيقات ويب ونماذج مخصصة. استخدمته في مشروع منصة Hub. دفعنا Power Pages إلى أقصى حدوده بتكاملات مخصصة.",

      "certs.title": "أواصل التعلّم.",

      "contact.title": "تواصل معي. لنتحدث في العمل.",
      "contact.meta": "أعيش الآن في الإمارات العربية المتحدة. أبحث عن فرص عمل في دبي، أو أبوظبي، أو الشارقة، أو أي مكان في الإمارات.",
      "contact.email": "البريد الإلكتروني",
      "contact.phone": "الهاتف",
      "contact.resume": "السيرة الذاتية",

      "footer.colophon": "© ٢٠٢٦ رولان غوميس. صُنع بكثير من الخيال والحب، وبمساعدة Claude Code.",


      // Blueprint Design System — Arabic.
      "meta.bds.title": "نظام Blueprint Design System - رولان غوميس",
      "meta.bds.description": "دراسة حالة عن بناء نظام Blueprint Design System لمنصة Hub. يغطي نموذج رموز تصميم (design tokens) بثلاث طبقات باستخدام OKLCH، ولونًا للعلامة التجارية معدَّلًا لتحقيق تباين AA، ونموذج ارتفاع (elevation) مبني على الظل، وروابط Code Connect التي أدت إلى نسبة تطابق ٨٠٪ بين تصميم الذكاء الاصطناعي والكود.",
      "case.bds.summary": "كانت منصة Hub تضم خمسة فرق. كل فريق بنى نفس الزر بطريقة مختلفة. لم يكن هناك رابط بين Figma والكود، سوى لقطات الشاشة. قدت العمل التصميمي على النظام الذي أصلح هذا. عملت مع مهندس معماري رئيسي لتجربة المستخدم ومهندس واجهة أمامية. بنينا تسلسلًا هرميًا للمكوّنات وفق منهجية Atomic Design. يعتمد هذا التسلسل على نظام رموز تصميم (design tokens) بثلاث طبقات باستخدام OKLCH. كما بنينا روابط Code Connect. ساعدت هذه الروابط نموذج LLM على كتابة الكود أيضًا.",
      "case.bds.context.p1": "بُني نظام الهوية التجارية للشركة لأغراض الطباعة والتحرير. لم يخطط أحد للمنتجات الرقمية. سدّت فرق الهندسة الفجوة بأنفسها. استخدم كل فريق تقنياته الخاصة. لم يراجع أحد عملهم.",
      "case.bds.context.p2": "رأيت المشكلة عن قرب. مشروع واحد كان يحتوي على نفس الزر مبنيًا بأربع طرق مختلفة. اختار كل من المطورين الأربعة طريقته الخاصة. لم يكن هناك إطار عمل مشترك ولا مصدر واحد للحقيقة. الفرق التي كان يجب أن تبني الشيء نفسه، بنت أربعة أشياء مختلفة بدلًا من ذلك.",
      "case.bds.context.p3": "أصبحت هذه مشكلة حقيقية، وليست مجرد إزعاج. اقترحت على مدير تقنية المعلومات في الشركة بناء نظام تصميم. تمت الموافقة على الاقتراح، لكن دون ميزانية أو ساعات عمل مخصصة. لم أستطع العمل عليه إلا بين مهام السباق (sprint). للوفاء بمواعيدنا النهائية، عملت خارج ساعات العمل المعتادة. هكذا بُنيت المرحلة الأولى.",
      "case.bds.styleguide.p1": "تعدد نسخ المكوّن نفسه يعني عدم وجود تحكم موحد في شكله أو عمله. إصلاح خطأ واحد يعني البحث عن كل صفحة تستخدمه. أصبحت المشكلات البسيطة بطيئة ومملة.",
      "case.bds.styleguide.p2": "التوثيق وحده لن يصلح هذا. التوثيق يصف المشكلة. لا يوقفها. احتاج الفريق إلى شيء بنيوي: نظام واحد يستخدمه كل فريق، مع طريقة لدفع التحديثات دون أن يطلب من أحد إعادة كتابة الكود.",
      "case.bds.phases.p1": "كانت المرحلة الأولى تقتصر على Figma والتوثيق فقط. دققنا في المكوّنات الأكثر استخدامًا على منصة Hub. ثم أعدنا بناءها كطقم مكوّنات حقيقي. بدأنا من الأساس: الألوان، والطباعة، والمسافات، والارتفاع (elevation)، والأيقونات. بنينا كل هذا قبل لمس أي مكوّن.",
      "case.bds.phases.p2": "حدث الانتقال إلى المرحلة الثانية في منتصف المرحلة الأولى. رأينا أن نظام التصميم الموثّق جيدًا يفعل أكثر من مجرد تنظيم Figma. إنه يجعل سير عمل من التصميم إلى الكود ممكنًا. انضم ساتفيك نايك، مهندس واجهة أمامية، إلى الفريق خلال المرحلة الأولى. كان يجيد React وBase UI وRadix UI وTailwind CSS. جعلت مهاراته المرحلة الثانية ممكنة. خططنا للمرحلة الثانية معًا بعد انضمامه. كانت المشاريع القادمة متجهة نحو React أصلًا. لذا كانت الخطة بسيطة: التحرك بسرعة، وتحويل المكوّنات إلى كود حقيقي، واختبار ذلك على ميزة إدارة المهام في منصة Hub أولًا.",
      "case.bds.quote": "لم يكن هذا عمل شخص واحد أبدًا. كنت أتبع نبرون، مهندسنا المعماري الرئيسي لتجربة المستخدم، وله القرار الأخير. كانت لديّ حرية اتخاذ القرار في الألوان، والطباعة، والارتفاع، والأيقونات، بناءً على البحث. أعرض هذه القرارات عليه للمراجعة. مع ساتفيك في المرحلة الثانية، كان التقسيم مختلفًا. كان يملك القرار في كيفية عمل كل شيء في الكود، بما في ذلك Code Connect. كان له نفس القدر من القرار في نصفه الذي كان لي في نصفي.",
      "case.bds.atomic.p1": "كل ما في قسم الأساسات (Foundations) وطقم المكوّنات يتبع منهجية Atomic Design لبراد فروست: atoms وmolecules وorganisms وtemplates وpages. كل مستوى مبني من المستوى الذي تحته. لهذا بُنيت المرحلة الأولى بهذا الترتيب. بنينا الأساسات أولًا. لم نلمس أي مكوّن قبل أن تُقفل الألوان، والطباعة، والمسافات، والارتفاع، والأيقونات.",
      "case.bds.atomic.p2": "يهم تمييز واحد هنا. طبقات الرموز التصميمية (Primitive وSemantic وComponent) وطبقات Atomic Design (atoms وmolecules وorganisms) نظامان مختلفان. تصف طبقات الرموز كيف تتحول <em>القيمة</em>، مثل كيف يصبح كود لون خامًا خلفيةً لزر. يصف Atomic Design كيف يُبنى <em>المكوّن</em>، مثل كيف يتحد Button وTooltip في عنصر تحكم واحد. تقع الأساسات تحت مستوى atoms. توفّر القيم الخام التي تستخدمها كل atom.",
      "case.bds.foundationsBridge": "الأساسات، التي نتناولها لاحقًا، هي الطبقة الأساسية. وهي المادة الخام التي تُبنى منها كل atom في النظام.",
      "case.bds.foundationsIntro": "هذه هي الطبقة الأساسية. وهي المادة الخام التي تُبنى منها كل atom في طقم المكوّنات. لا شيء منها يعمل بمفرده في واجهة حقيقية. قيمة وزن الخط أو قيمة الظل تصبح مفيدة فقط عندما تُبنى داخل atom مثل Button أو Input.",
      "case.bds.typography.p1": "بدأت المرحلة الأولى بخطوط الشركة الخاصة: Anton وMontserrat وLora. لم يعمل أي منها جيدًا على شاشة منتج. خط Anton بأحرف كبيرة وخطوط سميكة، مصمم للنصوص الكبيرة جدًا. بحجم العنوان في واجهة حقيقية، بدا فوضويًا. أحرف Montserrat عريضة، فشعرت البيانات الكثيفة بالازدحام.",
      "case.bds.typography.p2": "الحل: خط <strong>Inter Tight</strong> (المكثف) للعرض والعناوين، وخط <strong>Roboto Flex</strong> للنص الأساسي، وخط <strong>Roboto Mono</strong> للمعرّفات والكود.",
      "case.bds.typography.p3": "يستحق خط آخر الذكر بمفرده، لأنه ميزة حقيقية لإمكانية الوصول. خط <strong>Atkinson Hyperlegible Next</strong> هو تفضيل يتحكم فيه المستخدم. عند تفعيله، يستبدل خط النص الأساسي في كل مكان. لا شيء آخر يتغير: لا الحجم، ولا التباعد بين الأسطر.",
      "case.bds.typography.p4": "يعمل هذا الاستبدال بسلاسة بسبب قرار واحد. عائلة الخط ووزنه يعيشان فقط في الطبقة الأساسية (primitive). لا يحدد نمط النص هذه القيم مباشرة أبدًا. غيّر عنصرًا أساسيًا واحدًا، وسيتبعه كل نمط نص يعتمد عليه تلقائيًا. هذه هي نفس الفكرة المستخدمة في الطبقة الثانية من نظام الرموز: أبقِ الشيء الأكثر عرضة للتغيير في مكان واحد.",
      "case.bds.iconography.p1": "واجهت هذه المشكلة نفس شكل مشكلة الطباعة. لم تحدد الهوية التجارية أي نمط للأيقونات، لأن الأيقونات لم تكن جزءًا من هوية الشركة. لكن الهوية البصرية نفسها حادة، دون منحنيات ناعمة. أي مجموعة أيقونات أختارها تحتاج نفس الطابع: واضحة، ومتناسقة مع نظام الخطوط الجديد، ومن مصدر مفتوح جيد البناء لا أحتاج لصيانته بنفسي إلى الأبد.",
      "case.bds.iconography.p2": "استوفت <strong>Material Symbols</strong>، بنمط Outline، كل المتطلبات. قفلت الإعدادات المتغيرة في المواصفات، حتى لا تنحرف العائلة مع استخدام أشخاص مختلفين لها.",
      "case.bds.iconography.p3": "حجم الأيقونة يتطابق مع <em>ارتفاع السطر</em>، وليس حجم الخط. تجلس الأيقونة داخل الإيقاع الرأسي للنص. مطابقة حجمها مع ارتفاع السطر يجعلها تجلس بانسجام، لا وكأنها مُلصقة. تحصل الأيقونات التفاعلية دائمًا على مساحة لمس ٤٤ في ٤٤ بكسل، عبر الحشو (padding)، لا عبر تكبير الأيقونة نفسها. الأيقونات الزخرفية بجانب تسمية لا تحتاج هذه المعاملة.",
      "case.bds.tokens.p1": "يستخدم Blueprint نموذج رموز تصميمية (design tokens) بثلاث طبقات. تقع القيم الأساسية (Primitive) في الأسفل. تقع الرموز الدلالية (Semantic)، المسمّاة حسب المعنى، في الوسط. تقع رموز المكوّنات (Component) في الأعلى. يقرأ مكوّن React رموز المكوّنات فقط. تتدفق القيم في اتجاه واحد: من الأساسية إلى الدلالية إلى المكوّن. لا يقرأ المكوّن قيمة أساسية مباشرة أبدًا.",
      "case.bds.tokens.p2": "كان الأزرق أول قرار لوني. بُني كل لون آخر منه. اختير اللون الأزرق المرساة ليعمل مع الأسود والأبيض معًا، لأن عناصر الأزرق غالبًا ما تظهر على خلفيات سوداء في الإعلانات وموادّ التسويق. بُني كل لون آخر (الأحمر، والأخضر، والأصفر، والرمادي) بالحفاظ على نفس درجة الإضاءة لهذا الأزرق وتغيير درجة اللون والتشبع فقط. هذا أيضًا سبب اختلاف نقطة مرساة الأصفر عن البقية. إنه استثناء متعمّد، وليس خطأً.",
      "case.bds.spacing.p1": "تتبع المسافات نفس نظام الطبقات الثلاث. الطبقة الأساسية مقياس رقمي مسطّح، من Space/0 إلى Space/16. كل خطوة مضاعف لوحدة أساس مقدارها ٤ بكسل. اخترنا ٤ بكسل بدلًا من ٨ لأنها تقسم بالتساوي على كثافات الشاشة الشائعة. تقع كل خطوة على بكسل كامل، فلا حاجة للتقريب.",
      "case.bds.spacing.p2": "لا تقرأ المكوّنات المقياس الأساسي مباشرة أبدًا. تجلس طبقة دلالية بين الأرقام الخام والمكوّنات، مقسّمة إلى جزأين. تتعامل مسافات المكوّن (Component) مع الحشو والفراغات داخل مكوّن واحد. تتعامل مسافات التخطيط (Layout) مع المسافة بين المكوّنات والأقسام. تتداخل الطبقتان عمدًا عند ١٦ بكسل. هذه هي النقطة التي تسلّم فيها كثافة المكوّن إلى بنية التخطيط.",
      "case.bds.spacing.p3": "القاعدة التي تحافظ على هذا المقياس بسيطة: لا قيم بكسل خام في التخطيط أبدًا، فقط رمز مُسمّى. يستخدم حشو المكوّن رمز Component. تستخدم المساحة حوله رمز Layout. يعمل التداخل من الخارج إلى الداخل، لا العكس أبدًا. كما لا تتغير رموز المسافات عند أحجام شاشة مختلفة. تعديل المسافات لكل حجم شاشة هو بالضبط نوع القرار الفردي الذي صُمم هذا النظام لإزالته.",
      "case.bds.color.p1": "يهم ترتيب البناء هنا. بدأت بأزرق العلامة التجارية، حوّلته إلى OKLCH، وبنيت منه سلمًا من ١١ درجة. ثم، مع الحفاظ على نفس درجة الإضاءة عند كل درجة، بنيت الأحمر والأخضر والأصفر بالطريقة نفسها. تتصرف كل الألوان الأربعة بنفس الطريقة من الفاتح إلى الغامق. أما الرمادي، فأخذت نسخة منخفضة التشبع من الأزرق وبنيت منها سلّمًا رماديًا كاملًا، مستخدمًا Adobe Spectrum كمرجع.",
      "case.bds.color.p2": "كسر الأصفر النمط. الحفاظ على نفس الإضاءة كالألوان الأخرى جعل الأصفر يبدو معتمًا وداكنًا، لا يشبه لون تحذير. لذا رفعت نقطة مرساة الأصفر، بينما أبقيت الأزرق والأحمر والأخضر على نقاطهم نفسها. كل لون، من نقطة مرساته إلى أغمق درجاته، يجتاز تباين AA على خلفية بيضاء. طريقة واحدة، مستخدمة في كل مكان، كُسرت عمدًا في المكان الوحيد الذي لم تنجح فيه، مع كتابة السبب.",
      "case.bds.color.p3": "لكل لون في النظام معنى محدد. الأزرق يعني الإجراء، والعلامة التجارية، وأي شيء قيد التنفيذ. الأخضر يعني النجاح. الأصفر يعني التحذير. سمّيت الأحمر <strong>Critical</strong> (حرج)، وليس «مدمّر» أو «خطر». الأحمر في هذا النظام ليس فقط للإجراءات المدمّرة؛ إنه لأي شيء يحتاج انتباه المستخدم الفوري، والإجراء المدمّر مجرد نوع واحد من ذلك. «Critical» تقول الحقيقة كاملة.",
      "case.bds.color.p4": "لم يحصل الإعلام (Info) على لون خاص به. أُدمج في الأزرق عمدًا، لأنه عندما يكون اللون الرئيسي للعلامة التجارية أزرق، يقرأ الناس الأزرق كإعلام على أي حال. كتبت هذا السبب مباشرة في وصف الرموز، حتى يُقرأ كقرار، لا كصدفة.",
      "case.bds.elevation.p1": "يجمع كل ظل في هذا النظام ثلاث طبقات في قيمة box-shadow واحدة. حلقة بسمك بكسل واحد، دون تمويه، تحل محل الحدّ (border). تبقى حادة عند أي نصف قطر للزاوية. ظل تماسّي صغير ومحكم يثبّت السطح على ما تحته. ظل محيطي أوسع وأنعم يوحي بالارتفاع. تستخدم الطبقات الثلاث لون كحلي العلامة التجارية، لا رماديًا عاديًا، فيبدو الظل جزءًا من مادة السطح نفسها.",
      "case.bds.elevation.p2": "تحمل خمسة رموز هذا البناء: shadow-xs (حلقة فقط، للشرائح والفواصل)، وshadow-sm (البطاقات والصفوف)، وshadow-md (اللوحات والأدراج)، وshadow-lg (القوائم المنسدلة والتلميحات)، وshadow-xl (النوافذ المنبثقة والحوارات). يتضاعف الإزاحة والتمويه عند كل خطوة، فالانتقال بين المستويات متوقّع.",
      "case.bds.elevation.p3": "يأتي العمق من الظل فقط، لا من تعتيم السطح. سطح أفتح وأقرب يُقرأ كمرتفع. سطح أغمق يُقرأ كأثقل وأبعد. هذه إشارة خاطئة لعنصر كقائمة منسدلة أو نافذة منبثقة يجب أن تطفو فوق كل شيء. يبقى كل سطح مرتفع أبيض أو شبه أبيض. الظل وحده يخبر العين بارتفاعه.",
      "case.bds.elevation.p4": "تستحق هذه البنية تعقيدها. خاصية box-shadow واحدة تحمل الحلقة والظل التماسّي والظل المحيطي معًا، فتتحرك كوحدة واحدة بدلًا من أن تنفصل. ولأن الحلقة ظل وليست حدًا، تبدو صحيحة فوق أي خلفية. وبما أن الارتفاع لا يلمس خاصية border أبدًا، يبقى border حرًا لمعنى حقيقي، مثل حقل غير صالح أو صفّ محدد.",
      "case.bds.button.p1": "الزر (Button) هو المكوّن الذي بدأ كل هذا. أربع نسخ مختلفة في مشروع واحد هي ما جعل نظام التصميم كله يُعتمد. كما أنه أوضح مكان لرؤية طبقات الرموز تعمل معًا. كل متغيّر مجرد مزيج من خيارات قليلة مستقلة.",
      "case.bds.button.p2": "تتعامل أغلب أنظمة التصميم مع حشو الأيقونة بجدول قواعد. تجاوزت الجدول. القاعدة هنا بسيطة: حشو التسمية يطابق دائمًا حشو الزر الكلي بذلك الحجم، بغض النظر عن أي فتحات أيقونة مملوءة. احسب الرياضيات، وستحصل على نفس نتيجة الجدول. قاعدة واحدة بدلًا من أربع.",
      "case.bds.button.p3": "تعطيل الزر أثناء تنفيذ إجراء يبدو صحيحًا، لكنه خطأ. فهو يخرج الزر من ترتيب التنقل بلوحة المفاتيح ويخبر قارئ الشاشة أن الزر غير متاح، بينما هو في الحقيقة مشغول فقط. لذا تستخدم حالة التحميل <code>aria-busy=\"true\"</code> بدلًا من ذلك، وتمنع النقر بوسائل أخرى. يبقى الزر قابلًا للتركيز، وتعلن قارئات الشاشة عنه بشكل صحيح كمشغول، لا كمختفٍ.",
      "case.bds.button.p4": "الزر الذي يحمل أيقونة فقط بلا نص مرئي يحتاج مساعدة بطريقتين: <code>aria-label</code> لقارئات الشاشة، وتلميح مرئي لمستخدمي لوحة المفاتيح الذين يرون الشاشة لكن لا يجدون تسمية يقرؤونها. لن يُصرَّف الكود دون كليهما. يلفّ المكوّن نفسه تلقائيًا بمكوّن Tooltip كلما كان <code>iconOnly</code> صحيحًا. لا أحد يحتاج لتذكّر هذه القاعدة.",
      "case.bds.button.p5": "الزر هو عنصر atom الذي يُبنى عليه كل شيء آخر في الطقم. لا يحتاج للاندماج مع شيء آخر ليكون مفيدًا. لكن قطعًا أخرى، مثل Tooltip الخاص بالزر ذي الأيقونة فقط، وSplit Button، وConnected Button Group، تبدأ كلها من الزر. لهذا كان ضبط حالاته وأحجامه وإمكانية الوصول فيه أهم من أي مكوّن واحد آخر.",
      "case.bds.molecule.p1": "أوضح molecule في النظام صغير عمدًا. الزر ذو الأيقونة فقط هو atom (Button) يفشل بمفرده في متطلب أساسي لسهولة الاستخدام: لا نص مرئي له. يفقد مستخدم قارئ الشاشة ومستخدم لوحة المفاتيح كلاهما معلومة يوفّرها الزر المُسمّى مجانًا. إقران هذا الزر مع atom من نوع Tooltip يصلح ذلك. معًا، يكتسب هذان العنصران (atoms) خاصية لا يملكها أيّ منهما بمفرده: عنصر تحكم بأيقونة فقط قابل للتعرّف الكامل مهما كانت طريقة التنقل. هذا هو اختبار مفهوم molecule في Atomic Design: مجموعة atoms تفعل معًا ما لا يفعله أيّ منها بمفرده.",
      "case.bds.molecule.p2": "هذا الإقران ليس اختياريًا. لن يُصرَّف كود الزر ذي الأيقونة فقط إلا إذا تم توفير <code>aria-label</code> و<code>tooltip</code> معًا، ويلفّ المكوّن نفسه تلقائيًا بعنصر atom من نوع Tooltip. يُفرض مفهوم molecule في الكود نفسه، لا في التوثيق فقط.",
      "case.bds.molecule.p3": "يستخدم Split Button وConnected Button Group نفس نمط molecule بمستوى أعلى. كلاهما مبني من atom الزر. كلاهما مصمم وموثّق بالكامل، لكن لم يُبنَ في الكود بعد. يقرن Split Button إجراءً رئيسيًا بمشغّل قائمة منسدلة ثانوي في حاوية واحدة. يأخذ Connected Button Group صفًا من atoms الزر ويزيل المسافة بينها، فيبدو الصف عنصر تحكم واحدًا. لم يحتج أيٌّ منهما قرارًا تأسيسيًا جديدًا. كلاهما، مثل الزر ذي الأيقونة فقط، مجرد زر أُعيد تركيبه.",
      "case.bds.table.p1": "جدول البيانات هو أوضح دليل على أن التسلسل الهرمي يتراكم. كل جزء منه موجود سابقًا في هذه الدراسة. لا يقدّم الجدول نفسه أي جديد تقريبًا. ما يقدّمه هو التركيب على نطاق واسع: نفس المجموعة الصغيرة من عناصر atoms وmolecules، مكررة ومركّبة بطرق مختلفة عبر عشرات الصفوف، وكل صف يتصرف بشكل متوقّع لأن كل نوع خلية يعود إلى مكوّن عُرّف مرة واحدة.",
      "case.bds.table.p2": "صف الجدول هو molecule: مجموعة ثابتة من atoms وmolecules على مستوى الخلية مرتبة في خط، تعمل كوحدة واحدة. الجدول نفسه، بصفّ رأسه، وجسده من صفوف متكررة، وأدوات الترقيم أو الإجراءات الجماعية عند وجودها، هو organism. لم يحتج الجدول لون جديد، أو قيمة مسافة جديدة، أو نمط تفاعل جديد. هذه هي مكافأة بناء الأساسات قبل atoms، وatoms قبل molecules: عندما تحتاج شيئًا معقدًا كجدول بيانات، أنت تجمّع، لا تصمم من الصفر.",
      "case.bds.templates.p1": "يحمل نموذجان (templates) النظام من المكوّنات إلى التخطيط.",
      "case.bds.templates.p2": "يربط <strong>Page Frame</strong> رأسًا (Header) وتذييلًا (Footer) بلوحة فارغة. تبدأ كل صفحة جديدة في منصة Hub منه. لا يُعاد بناء الرأس أو التذييل لكل صفحة. يتولى النموذج ذلك مرة واحدة، بنفس طريقة إعداد Microsoft Power Pages لتخطيط الصفحة. هذه هي القيمة الحقيقية للنموذج: يزيل قرارًا كان على مؤلف الصفحة اتخاذه، وربما يخطئ فيه، في كل مرة.",
      "case.bds.templates.p3": "يقرن <strong>Modal/Drawer Frame</strong> ستارة خلفية بحاوية. يخدم النموذج نفسه وضعين: نافذة منبثقة في المنتصف ودرج جانبي. الستارة والحاوية ثابتتان. الموضع، وحركة الدخول، والعرض هي ما يتغيّر بين الاثنين. بناء هذا كنموذج واحد بدلًا من اثنين يعني أن إصلاح سلوك الستارة يحدث مرة واحدة فقط ويرثه الوضعان.",
      "case.bds.templates.p4": "يقع النموذجان بالضبط حيث يقول Atomic Design: تحت pages، وفوق organisms. ليس أيٌّ منهما مكوّنًا، ولا يحتوي أيٌّ منهما محتوى نهائيًا. هما الهيكل الذي تُبنى فيه صفحة، مثل النموذج الأولي لإدارة المهام.",
      "case.bds.governance.p1": "عندما يريد فريق مكوّنًا جديدًا، لا يُبنى مباشرة. يجلس التصميم مع المطوّر ومن يطلبه، ونعمل معًا على ثلاثة أسئلة: هل يوجد شيء مشابه بالفعل؟ كم مرة سيُستخدم فعليًا؟ هل هذه حاجة مشروع واحد، أم شيء ستريده فرق أخرى أيضًا؟ هذا النقاش يقرر إن كان سيُبنى أصلًا.",
      "case.bds.governance.p2": "جزء من السؤال الأول يخص المستوى، لا الاسم فقط: هل هذا atom جديد، أم molecule يمكن تجميعه من atoms موجودة بالفعل في الطقم؟ كثير من الطلبات التي تبدو مكوّنات جديدة تتحوّل إلى تركيبة جديدة من مكوّنات موجودة. هذا يغيّر العمل من «تصميم شيء جديد» إلى «توثيق تركيبة جديدة»، وهو عمل أقل بكثير.",
      "case.bds.governance.p3": "إذا كانت الإجابة نعم، نصممه وفق الأساس الموجود، ونقسّمه إلى أصغر أجزائه، ونحدد نطاقه بشكل صحيح قبل فتح ملف تصميم. ثم يُبنى في الكود ويُوثَّق مثل كل شيء آخر: التركيب، والاستخدام، والسلوك، وإمكانية الوصول. فقط بعد كل ذلك يصبح جزءًا رسميًا من النظام.",
      "case.bds.governance.p4": "إذا كانت الإجابة لا، يحصل الفريق على سبب حقيقي، لا رفض عابر، وطريقة لتقديم حجة أقوى لاحقًا. نظام تصميم يستطيع أن يقول لا، ويعنيه، هو نظام حقيقي. بدون ذلك، هو مجرد كومة مكوّنات لا يجرؤ أحد على الاعتراض عليها.",
      "case.bds.versioning.token": "تُنشر الرموز وCSS بشكل مستقل، منفصلة عن حزم مكوّنات React. إذا احتاج فريق لون محدّث أو تعديل مسافة فقط، يرفع إصدار حزمة الرموز وحدها، دون خطر جلب تغيير سلوك React لم يطلبه. تحصل الفرق التي لا تستخدم React (HTML وCSS البسيطة، JavaScript الخام، الجوال لاحقًا) على نفس القيم الأساسية أيضًا، دون أي عبء إطار عمل. يتولى Style Dictionary خط الأنابيب من الرموز الخام إلى ما يُوزَّع في النهاية.",
      "case.bds.versioning.figma": "ترتبط تحديثات الإصدار في الكود مباشرة بما يحدث في Figma. ينشر المصمم تحديثًا للمكتبة، فيُطلق webhook، ويلتقطه سير عمل CI/CD عبر GitHub Actions. يسحب الرموز الجديدة عبر Figma API، ويفتح pull request، ويبني حزمة تجريبية يمكن للمطوّر اختبارها فورًا. هذا ما يمنع التصميم والكود من الانحراف بهدوء عن بعضهما. عندما يقول أحدهم «نحن على Buttons الإصدار ٢.١»، يعني الشيء نفسه للمصمم والمطوّر.",
      "case.bds.docs.p1": "يعيش التوثيق في Docsite مخصص، مبني على ويكي الشركة الداخلي. تتبع كل صفحة مكوّن نفس البنية: التعريفات، والتركيب، والخصائص، ومثال كود بلغة React وHTML/CSS البسيطة، وملاحظات إمكانية الوصول. اقرأ صفحة واحدة، وستعرف أين تجد أي شيء في أي صفحة أخرى. يتبع تصفّح Docsite نفس الترتيب: الأساسات، ثم atoms، ثم molecules، ثم organisms.",
      "case.bds.docs.p2": "يستحق تفصيل صغير الذكر. يفصل التوثيق ما بُني فعليًا عمّا هو مخطَّط له فقط. Split Button وConnected Button Group مصممان وموثقان بالكامل الآن، لكن كلاهما موسوم بوضوح بأنه لم يُبنَ بعد. هذه نفس الصراحة المستخدمة لحالة المرحلتين الأولى والثانية أعلاه، مطبّقة بمستوى أعمق فقط.",
      "case.bds.alignment.p1": "تسمية الرموز ليست شيئًا تفاوضنا عليه حالة بحالة. إنها آلية. تتطابق ملفات CSS مباشرة مع مجموعات متغيرات Figma، من Primitives إلى Semantics إلى Components. تُكتب أنماط المكوّنات في ورقة الأنماط عبر توجيه Tailwind v4، فيتحول الرمز الخام إلى متغيّر CSS تلقائيًا.",
      "case.bds.alignment.p2": "بالكاد اختلف التصميم والهندسة على التسمية، لسبب حقيقي: بُنيت البنية لقارئين منذ اليوم الأول، المطورون البشر، وكما تبين لاحقًا، نماذج LLM أيضًا. هذا جزء كبير من سبب وصول النموذج الأولي لتحويل التصميم إلى كود لدقة ٨٠٪. بُنيت بنية الرموز لتعمل لكليهما منذ البداية.",
      "case.bds.outcomes.p1": "لم يصل أي من هذا إلى المستخدمين النهائيين بعد. ما يلي هو ما أستطيع قياسه فعليًا حتى الآن، مع الصدق حول معنى كل رقم.",
      "case.bds.reflection.p1": "لم يكن أكبر درس تقنيًا. بنيت المرحلة الأولى في الغالب خارج ساعات عملي المعتادة، ساعات حقيقية وتعلّم حقيقي، لكنني انتظرت طويلًا جدًا قبل تقديمها للمراجعة. كنت صغيرًا في مسيرتي المهنية، وأردت إثبات نفسي، وهذه الرغبة في الكمال لم تحسّن العمل. أخّرت فقط نظامًا قويًا عن الحصول على الاهتمام الذي يستحقه. الكمال عدو الإنجاز، وتعلمت ذلك بالطريقة الصعبة. تعلّم ذلك أبكر لم يكن يعني اختصار الطريق. كان يعني تقديم العمل الجيد نفسه بسرعة أكبر.",

      // Hub Platform Modernization — Arabic.
      "meta.hub.title": "تحديث منصة Hub - رولان غوميس",
      "meta.hub.description": "دراسة حالة عن خمسة مشاريع على منصة واحدة خلال ١٦ شهرًا: ترحيل Power Pages، وإعادة بناء بمعيار Bootstrap من الإصدار ٣ إلى ٥، وإصلاحات إمكانية الوصول وفق WCAG 2.4.3، وإعادة تصميم Azure AD B2C، وتوحيد مؤشرات التحميل. أُطلق كل ذلك في الإنتاج.",
      "case.hub.summary": "حدثت خمسة مشاريع، على مدى عام ونصف، على منصة واحدة. كان تغيير نموذج بيانات Power Pages ضروريًا لفتح Bootstrap 5. أدى ذلك إلى إعادة بناء الواجهة الأمامية. كشفت إعادة البناء عن مشكلات في إمكانية الوصول. في الوقت نفسه، لم تطابق صفحات التسجيل والدخول في Azure AD B2C النظام البصري الجديد. احتاجت مشكلة في مؤشر التحميل إصلاحًا أيضًا. لم يخطط أحد لهذا كمشروع واحد. ساعدت في إصلاح كل جزء منه.",
      "case.hub.why.p1": "عملت Power Pages على Bootstrap 3 منذ عام ٢٠١٤ حتى أضافت Microsoft دعم Bootstrap 5 في عام ٢٠٢٣. يعمل هذا الدعم فقط على نموذج بيانات Power Pages الأحدث. لا يمكن تشغيل موقع Bootstrap 5 على نموذج البيانات القديم. لذا لم تستطع ترقية Bootstrap لمنصة Hub أن تبدأ قبل تغيير نموذج البيانات أولًا. جاء عمل إمكانية الوصول مباشرة من إعادة البناء هذه. تدفقات Azure AD B2C وتنظيف مؤشر التحميل منفصلة. تشترك في نفس المنصة والفترة الزمنية، لكن ترحيل نموذج البيانات لم يعطّلها.",
      "case.hub.why.p2": "لم يكن ترحيل Power Pages نفسه من عملي. إنه ينقل إعدادات الموقع من جداول مخصصة إلى جداول Microsoft القياسية. هذا يعني إعدادًا أسرع وبلا تحديثات يدوية. أذكره هنا لأن الأقسام الأربعة التالية ما كانت لتحدث بدونه.",
      "case.hub.bootstrap.p1": "توفر Microsoft أداة ترحيل لهذه الترقية بالضبط. تصلح الأداة التغييرات المعروفة الكاسرة بين Bootstrap 4 وBootstrap 5، غالبًا بإعادة تسمية سمات البيانات. لا تصلح الأداة كودك المخصص المبني فوق تلك الفئات. شغّلنا الأداة. كسرت صفحات. انتشر التنسيق عبر سنوات في CSS عام، وCSS على مستوى الصفحة، وأنماط مضمّنة، دون نمط ثابت. حوّلت الأداة كل حالة بشكل مختلف، وخرجت بعض المكوّنات مكسورة.",
      "case.hub.bootstrap.p2": "قررنا إعادة بناء الواجهة الأمامية من الصفر بدلًا من إصلاح ما أنتجته الأداة. بقي التصميم البصري قريبًا من المنتج الحالي؛ نظّفناه لكن لم نُعِد ابتكاره. أعدنا كتابة كل سطر HTML وCSS بدلًا من ترقيعه. كان الخطر الحقيقي هو JavaScript وخلفية Dynamics 365 المرتبطة بذلك الترميز. اسم فئة أو معرّف عنصر مفقود قد يكسر بهدوء ميزة تعمل. أبقينا الكود القديم كمرجع وتحققنا من كل رابط يدويًا. قام اثنان منّا بهذا، ولا أحد منّا مطوّر محترف، على منصة حية، في عام ٢٠٢٤، قبل أن تصبح أدوات الذكاء الاصطناعي جزءًا من العمل اليومي.",
      "case.hub.bootstrap.p3": "لم تكن هناك انتكاسات بصرية، لأنه لم يبقَ شيء يمكن أن يتراجع إليه. أزلنا أربعة عشر من نحو عشرين ملف CSS على مستوى الصفحة. ذهب ما تبقى إلى ورقة أنماط عامة واحدة مبنية على متغيرات CSS. تغيير لون أو خط كان يعني البحث في عشرات الملفات، أصبح الآن يعني تعديل رمز واحد.",
      "case.hub.bootstrap.p4": "هنا أيضًا يبدأ <a href=\"blueprint-design-system.html\">Blueprint Design System</a>. ظهر الزر نفسه بأربع طرق مختلفة خلال إعادة البناء هذه. كانت للمكوّنات عبر المنصة بنيات HTML مختلفة، وتسحب تنسيقها من أماكن مختلفة في وقت واحد. أصلحنا هذا مكوّنًا تلو الآخر، ومن هناك بدأ النظام القائم على الرموز في صفحة Blueprint.",
      "case.hub.a11y.p1": "كشف اختبار الواجهة الأمامية المعاد بناؤها باستخدام Deque Axe عن ٣٥ مخالفة حرجة وجسيمة: ٨ حرجة و٢٧ جسيمة. لم تكن مهمتي فقط إغلاق كل ما تشير إليه الأداة. كانت إيجاد النمط وراءها، حتى لا يتكرر الخطأ نفسه لاحقًا.",
      "case.hub.a11y.p2": "كانت أصعب فئة هي ترتيب التركيز، أو tabindex. الحل السهل هو رقم ثابت لكل عنصر قابل للتركيز، لكن هذا أيضًا هو الحل الهش. يثبّت تسلسلًا واحدًا. أي تغيير مستقبلي، كمكوّن جديد أو قسم أُعيد ترتيبه، يخاطر بكسر التسلسل. يوجد معيار WCAG 2.4.3 لهذا السبب بالضبط. الحل الأكثر ثباتًا يتبع الترتيب الطبيعي للصفحة بدلًا من تجاوزه. هذا عمل أكثر مسبقًا، لكنه أقل عرضة للانكسار لاحقًا.",
      "case.hub.a11y.p3": "اختبرنا ذلك بأنفسنا أولًا، ثم أجرينا اختبار ضمان جودة رسميًا باستخدام Axe، وافقت عليه مختبرة إمكانية الوصول. التغيير الذي أهم على المدى الطويل: أُدرجت تسميات aria، والنص البديل، وبقية عناصر إمكانية الوصول منذ البداية في كل ما بُني بعد ذلك. يكتشف ضمان الجودة الآن أي انحدار قبل الإطلاق، لا بعده.",
      "case.hub.b2c.p1": "التسجيل، وتسجيل الدخول، ونسيان كلمة المرور، والتحقق بخطوتين، وتغيير البريد وكلمة المرور، وقبول الشروط، والإبلاغ عن المشكلات: أحد عشر تدفقًا في المجموع. كانت هذه الصفحات تعمل على Bootstrap 5 بالفعل، فلم تكن المشكلة فجوة إصدار. كانت سنوات من التنسيق المضمّن: نفس المكوّن مصمم بطرق مختلفة عبر التدفقات، وتخطيطات مكسورة، وهوية بصرية لم تعد تطابق المنصة.",
      "case.hub.b2c.p2": "القيد الحقيقي هنا بنيوي. يبني Azure AD B2C هذه الصفحات بدمج HTML الخاص بك مع عناصر تحكم النماذج الخاصة به وقت التشغيل، في متصفح المستخدم. تلك العناصر هي حقول الإدخال والأزرار ومنطق التحقق الفعلية. يحتوي ملفك المصدري فقط على هيكل وعنصر نائب واحد. لا يمكنك فتح وقراءة العناصر التفاعلية التي تحتاج تنسيقها. الطريقة الوحيدة لمعرفة بنيتها هي عرض الصفحة وفحصها مباشرة، ثم كتابة CSS وJavaScript بالعكس انطلاقًا مما تجده. تحذّر وثائق Microsoft نفسها من هذا: إذا ربطت JavaScript بتلك العناصر، عليك تثبيت إصدار تخطيط صفحة محدد، وإلا فقد تغيّر Microsoft الترميز المُدرج دون تحذير.",
      "case.hub.b2c.p3": "كانت هذه مشكلة أصعب من تنسيق عادي. كانت أيضًا أول بناء أقوم به بمفردي بالكامل، تصميمًا وكودًا، من البداية للنهاية. استغرق ذلك أسبوعين. عملت مع ضمان الجودة أثناء التطوير بدلًا من انتظار دورة اختبار كاملة، ما جعل الاختبار اللاحق قصيرًا. ظهرت بعض مشكلات إمكانية الوصول من القسم السابق هنا أيضًا، وأُصلحت بالطريقة نفسها.",
      "case.hub.spinner.p1": "تراكمت ثلاثة مؤشرات تحميل مختلفة دون تنسيق. جاء مؤشر FontAwesome مدمجًا مع Power Pages افتراضيًا. وصل مؤشر Fluent UI عبر تكاملات Microsoft D365. بُني مؤشر مخصص لميزة واحدة محددة. لم يقرر أحد كيف يجب أن تبدو حالة التحميل على هذه المنصة.",
      "case.hub.spinner.p2": "أولًا، وثّقت ترميز وتنسيق كل مؤشر. ثم استخدمت GitHub Copilot لتتبع كل مؤشر إلى مكان استخدامه، قبل اتخاذ قرار خطة الاستبدال. أصبح مؤشر Bootstrap الخاص الهدف، لأنه كان الأنسب للواجهة المعاد بناؤها. حصلت مؤشرات FontAwesome على استبدال JavaScript صغير إلى فئات Bootstrap. استُبدل المؤشر المخصص بالكامل. احتاج مؤشر Fluent UI استبدال JavaScript خاصًا به. إجمالًا، اختصر هذا مهمة توحيد كانت تقدَّر بعشرة أيام إلى خمسة أيام.",
      "case.hub.spinner.p3": "كان يجب أن يُطلق هذا مع إعادة بناء Bootstrap الأصلية. لم يحدث ذلك، لنفس السبب الذي جعل معظم هذه الخيوط متباعدة: لم يكن هناك وقت أو خبرة داخلية كافية لتولّي هذا مع كل شيء آخر دفعة واحدة. وصل بعد أكثر من عام، بمفرده، لكنه لا يزال جزءًا من الترقية نفسها.",
      "case.hub.outcomes.p1": "كل شيء في هذه الصفحة أُطلق في الإنتاج. بلا استثناءات.",
      "case.hub.reflect.p1": "وثّق العمل وهو لا يزال حديثًا. كتبت هذا بعد أكثر من عام من حدوث بعضه، فاضطررت لإعادة بناء القرارات من الذاكرة بدلًا من الملاحظات. أدق التفاصيل، تلك التي تشرح القرار بدلًا من مجرد وصفه، هي أول ما يتلاشى.",
      "case.hub.reflect.p2": "ملاحظة أخيرة: هذا المشروع هو ما نقلني من كوني يُنظر إليّ كمصمم بصري إلى شخص يستطيع العمل والحديث كمطوّر. يمتد هذا التحوّل عبر كل قسم أعلاه.",

      // Healthcare SaaS Redesign (Speery Health, NDA) — Arabic.
      "case.speery.title": "إعادة تصميم برمجية رعاية صحية",
      "meta.speery.title": "إعادة تصميم برمجية رعاية صحية - رولان غوميس",
      "meta.speery.description": "دراسة حالة عن إعادة بناء نموذج أولي لبرمجية رعاية صحية تم توليده بالذكاء الاصطناعي إلى واجهة منظمة وموثوقة للمشترين المؤسسيين: نظام وسم ثلاثي المحاور، وإعادة بناء بنية المعلومات، وتسليم عبر Figma، تم بمفردي خلال أسبوعين.",
      "case.speery.summary": "تبني هذه الشركة الناشئة في الرعاية الصحية (تغيّر الاسم والتفاصيل المعرِّفة بسبب اتفاقية عدم إفصاح) منصة تعمل بالذكاء الاصطناعي لشركات الأدوية. تلتقط المنصة وتحلل ملاحظات المتخصصين الصحيين. بُنيت نسختهم الأولى بسرعة بواسطة الذكاء الاصطناعي، أو ما يُعرف بـ«vibe-coding». كانت تعمل، لكن بلا بنية: الألوان لا تعني شيئًا، لا يوجد تسلسل هرمي، ولا شيء في الواجهة يبني الثقة مع مشترٍ مؤسسي في الرعاية الصحية. أعدت بناءها بمفردي، خلال أسبوعين. بنيتها كنظام لقارئين: شخص يتصفحها، ولاحقًا، ذكاء اصطناعي يحلل منطقها. ثم سلّمت الملف لفريق هندسة العميل ليبنيه.",
      "case.speery.explore.p1": "هذا هو الملف الفعلي، لا تسجيل له. تصفّحه كما تفعل مراجعة أصحاب المصلحة. كل انتقال هو Smart Animate حقيقي، بما في ذلك حالات التحويم على البطاقات وشريط الفلاتر. ليست إطارات ثابتة مركّبة معًا.",
      "case.speery.context.p1": "كان لدى العميل نموذج أولي يعمل، تم توليده بالذكاء الاصطناعي. أرادوا تقديمه لمشتري الرعاية الصحية المؤسسيين كبرمجية حقيقية، لا كعرض ذكاء اصطناعي. كان يعمل، لكنه لم يكن متماسكًا. ظهر نفس الأحمر أو الأزرق على مقياس، ورسم بياني، وعلامة حالة، دون منطق مشترك بينها. لم يكن في الواجهة ما يشير إلى أن هذا النظام يستحق الثقة ببيانات مستشفى أو شركة أدوية.",
      "case.speery.context.p2": "يستطيع وكيل ذكاء اصطناعي توليد واجهة كاملة وظيفيًا بسرعة. لا يستطيع ابتكار نظام: لونًا يعني الشيء نفسه دائمًا، وتسلسل وسوم يظل يعمل بعد البطاقة العاشرة، وقرار إمكانية وصول متعمّد. سدّ هذه الفجوة، بين الكمال الوظيفي والنظام الحقيقي، هو ما استغرق الأسبوعين.",
      "case.speery.colorlogic.p1": "استخدمت الواجهة المبنية بالذكاء الاصطناعي الكثير من الألوان، بشكل غير متسق، لا تعني شيئًا من شاشة لأخرى. بدأ الحل بقاعدة، لا لوحة ألوان: كل حالة يحتاج المستخدم لقراءتها بلمحة تحصل على لون وأيقونة وتسمية، معًا دائمًا، في كل مكان بالمنتج. تحمل كل بطاقة استبصار ثلاثة من هذه بشكل مستقل: النوع (ملاحظة، استبصار، إجراء، أثر)، والأولوية (عالية، متوسطة، منخفضة)، والمشاعر (إيجابية، محايدة، سلبية). يمكن أن تكون بطاقة عالية الأولوية وسلبية في آن واحد وتبقى واضحة. لا يستطيع رمز لوني مسطّح واحد فعل ذلك.",
      "case.speery.colorlogic.p2": "تخدم هذه القاعدة قارئين في آن واحد. يحتاج متخصص الأدوية الذي يتصفح خمسين بطاقة تمييز درجة الخطورة دون توقف للتفكير. يحتاج المستخدم الذي يعاني عمى الألوان نفس المعلومة دون الاعتماد على اللون إطلاقًا. جعل مختصر العميل قارئًا ثالثًا صريحًا أيضًا: قوالب ومكوّنات مبنية على نظام دلالي محدد بما يكفي ليتمكن نظام ذكاء اصطناعي من قراءة منطقه لاحقًا، لا شخص فقط.",
      "case.speery.screens.dashboard": "<strong>لوحة التحكم.</strong> نفس البيانات الأساسية من النسخة المبنية بالذكاء الاصطناعي، أُعيد تنظيمها في أقسام مسمّاة يسهل تصفحها: ملخص أسبوعي بالذكاء الاصطناعي مقسّم إلى أهم المخاطر وأهم الفرص، ونظرة عامة على النشاط، ومقاييس الجودة والكفاءة، والذكاء الاستراتيجي، والشبكة والجغرافيا، وتفاصيل الأقسام. هذا أوضح مثال على إعادة هيكلة المعلومات لا مجرد تحسين المظهر.",
      "case.speery.screens.manage": "<strong>إدارة الاستبصارات.</strong> عرض بطاقات، ووضع تحديد للإجراءات الجماعية، وعرض جدول لمستخدمي الطاقة الذين يريدون البيانات نفسها كثيفة وقابلة للفرز. يمتد نظام الوسم عبر الثلاثة جميعًا بالتطابق نفسه.",
      "case.speery.screens.sidebar": "<strong>الشريط الجانبي المطوي.</strong> بالنسبة لمستخدم يعيش داخل هذه الأداة طوال اليوم، يُطوى الشريط الجانبي إلى أيقونات مع تنقل فرعي عند التحويم. هذا يستبدل تسمية دائمة بمساحة شاشة إضافية للبيانات.",
      "case.speery.screens.hcp": "<strong>ملف المتخصص الصحي.</strong> سجل طبيب: الهوية، وجدول زمني للتفاعل، ومحتوى بعلامات تبويب للمنشورات، والتجارب السريرية، والتحدث والتواصل الاجتماعي. تجلس لوحة توصيات الذكاء الاصطناعي منفصلة بصريًا، بلون بنفسجي مميز ونسبة ثقة مع كل اقتراح، حتى لا يُخلط رأي النموذج بحقيقة في السجل أبدًا.",
      "case.speery.readtwice.p1": "يبدأ معظم عملي في الأنظمة قبل أن يلمس الذكاء الاصطناعي أي شيء. يبدأ هذا المشروع بعده: قراءة مخرجات الذكاء الاصطناعي بعين نقدية وإعادة بناء المنطق تحتها، دون إعادة كتابة من الصفر. يستطيع وكيل ذكاء اصطناعي توليد واجهة كاملة وظيفيًا خلال دقائق. لا يستطيع تقرير ما يجب أن يعنيه لون دائمًا، أو ملاحظة تسلسل وسوم ينهار بعد البطاقة العاشرة.",
      "case.speery.readtwice.p2": "طلب المختصر نظامًا محددًا بما يكفي ليقرأه ذكاء اصطناعي لاحقًا، لا شخص فقط. هذه نفس الفكرة وراء بنية رموز Blueprint، المبنية لكل من المطوّر البشري ونموذج LLM منذ اليوم الأول، في مشروع مختلف تمامًا. هذا نمط في طريقة عملي، لا ادعاءً لمرة واحدة. راجع دراسة حالة <a href=\"blueprint-design-system.html\">Blueprint Design System</a>.",
      "case.speery.readtwice.p3": "مكان واحد لم يفِ التنفيذ فيه بذلك المختصر بالكامل، يستحق قوله بوضوح: نظام يُراد له أن يكون مقروءًا آليًا يعتمد على انضباط التسمية في كل مكان، لا في منطق الألوان فقط. لا تزال عدة طبقات تفاعلية في الملف تحمل أسماء Figma المولّدة تلقائيًا. هذا غير مرئي لشخص يتصفح الملف، لكنه بالضبط نوع الشيء الذي يكسر نموذجًا يحاول قراءة بنية الملف لاحقًا.",
      "case.speery.motion.p1": "تعمل انتقالات الشاشة عند ٣٠٠ مللي ثانية بمنحنى تسريع وتباطؤ. يحوّل Smart Animate الطبقات المشتركة فعليًا، مثل الشريط الجانبي والرأس، بدلًا من القطع بين الشاشات. تعمل حالات التحويم على البطاقات وشريط الفلاتر عند ١٠٠ مللي ثانية، سريعة بما يكفي لتبدو فورية. لا شيء يرتد. هذه لوحة تحكم صحية احترافية هدفها بناء الثقة، وكانت واجهة مرحة ستعمل ضد ذلك.",
      "case.speery.outcomes.p1": "سُلِّم التصميم لفريق هندسة العميل ضمن مشروع مستقل لمدة أسبوعين. بصفتي متعاونًا خارجيًا، لا رؤية لي على أرقام ما بعد الإطلاق. توثّق دراسة الحالة هذه قرارات التصميم وبنية النظام، لا نتائج إنتاج مقاسة.",
    },
  };

  const MODE_LABELS = { en: "English", "en-simple": "Simple English", ar: "عربي" };

  /* Desktop mode-select popover — trigger/panel/outside-click/Escape all
     mirror the surface picker (§4) and mobile nav (§12) open/close
     mechanics already established elsewhere in this file, so there's one
     disclosure pattern instead of three slightly different ones. Declared
     before applyMode() below (which calls closeModeSelect() on every mode
     change, including the immediate call a saved ar/en-simple preference
     triggers on load) so there's no temporal-dead-zone risk from calling
     it before these consts exist. A no-op when the page has no
     .mode-select (there isn't one in the mobile-only markup path) since
     querySelector then returns null and every call below is guarded on
     that. */
  const modeSelectTrigger = document.querySelector(".mode-select-trigger");
  const modeSelectPanel = document.querySelector(".mode-select-panel");
  function closeModeSelect() {
    if (!modeSelectTrigger || !modeSelectPanel) return;
    modeSelectPanel.hidden = true;
    modeSelectTrigger.setAttribute("aria-expanded", "false");
  }
  if (modeSelectTrigger && modeSelectPanel) {
    modeSelectTrigger.addEventListener("click", () => {
      const isOpen = !modeSelectPanel.hidden;
      if (isOpen) {
        closeModeSelect();
      } else {
        modeSelectPanel.hidden = false;
        modeSelectTrigger.setAttribute("aria-expanded", "true");
      }
    });
    // Any click while open closes it — an option click already closes via
    // applyMode()'s own closeModeSelect() call, so this is what also
    // catches blank space inside the panel (padding, gaps between
    // options), not just genuinely outside clicks. Only the trigger itself
    // is excluded, so its own click handler's open/close toggle above is
    // the sole thing deciding what a trigger click does.
    document.addEventListener("click", (e) => {
      if (!modeSelectPanel.hidden && !modeSelectTrigger.contains(e.target)) {
        closeModeSelect();
      }
    });
    modeSelectPanel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModeSelect();
        modeSelectTrigger.focus();
      }
    });
  }

  const modeButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-mode-option]")
  );

  const applyMode = (mode) => {
    root.dataset.mode = mode;
    root.lang = mode === "ar" ? "ar" : "en";
    root.dir = mode === "ar" ? "rtl" : "ltr";
    localStorage.setItem("mode", mode);

    const dict = STRINGS[mode] || {};
    const fallback = STRINGS.en;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const value = dict[key] || fallback[key];
      // innerHTML, not textContent: several case-study paragraphs carry
      // inline <strong>/<code>/<em> emphasis (e.g. "Inter Tight", an
      // aria-label mention) that textContent would flatten into literal
      // angle-bracket text on every mode switch. Every value here is
      // authored site copy, never user input, so this carries no
      // injection risk.
      if (value) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      const key = el.dataset.i18nLabel;
      const value = dict[key] || fallback[key];
      if (value) el.setAttribute("aria-label", value);
    });
    // Tool-sticker popover bodies (js/main.js §11 reads data-description live
    // at open-time), so swapping the attribute here is enough — no need to
    // also touch whatever popover markup may or may not be open right now.
    document.querySelectorAll("[data-i18n-desc]").forEach((el) => {
      const key = el.dataset.i18nDesc;
      const value = dict[key] || fallback[key];
      if (value) el.setAttribute("data-description", value);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      const value = dict[key] || fallback[key];
      if (value) document.title = value;
    });
    document.querySelectorAll("[data-i18n-meta-description]").forEach((el) => {
      const key = el.dataset.i18nMetaDescription;
      const value = dict[key] || fallback[key];
      if (value) el.setAttribute("content", value);
    });

    modeButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.modeOption === mode));
    });
    // The desktop trigger always names ITS OWN current selection (English /
    // Simple English / عربي) — a fixed label per option, not translated
    // content, same reasoning nav labels don't need a fourth "trigger"
    // variant: it's naming a mode, not displaying page copy.
    document.querySelectorAll("[data-mode-select-label]").forEach((el) => {
      el.textContent = MODE_LABELS[mode] || MODE_LABELS.en;
    });
    closeModeSelect();
  };

  const savedMode = localStorage.getItem("mode");
  if (savedMode === "ar" || savedMode === "en-simple") applyMode(savedMode);

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyMode(btn.dataset.modeOption);
      refreshLightboxLabels();
    });
  });

  /* ------------------------------------------------------------------
     3. Scroll reveal — motion-safe.
     Elements with [data-reveal] fade/rise once. If the user prefers
     reduced motion, we never add the class, so nothing moves. Nothing is
     hidden by CSS alone, so with JS off all content is visible.

     Siblings that reveal together are staggered by --reveal-stagger, so a
     row of cards arrives as a sequence rather than a single block. The
     stagger is capped so a long list never leaves the last item waiting.
  ------------------------------------------------------------------ */
  const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");

  /* [data-reveal-children] is shorthand: it opts every direct child in, so a
     card grid or a long article body can stagger without tagging each node in
     the markup. Expand it before collecting, so the two are indistinguishable
     from here on. */
  document.querySelectorAll("[data-reveal-children]").forEach((parent) => {
    Array.prototype.forEach.call(parent.children, (child) =>
      child.setAttribute("data-reveal", "")
    );
  });

  const revealEls = document.querySelectorAll("[data-reveal]");

  const MAX_STAGGER_STEPS = 5;

  /* Position among the siblings that also reveal — the visual row/list the
     element belongs to, which is what the eye reads as a sequence. */
  function staggerIndex(el) {
    if (!el.parentElement) return 0;
    const peers = Array.prototype.filter.call(
      el.parentElement.children,
      (child) => child.hasAttribute("data-reveal")
    );
    return Math.min(peers.indexOf(el), MAX_STAGGER_STEPS);
  }

  function show(el) {
    el.style.setProperty(
      "--reveal-delay",
      `calc(var(--reveal-stagger) * ${staggerIndex(el)})`
    );
    el.classList.add("is-visible");
  }

  if (motionQuery.matches && "IntersectionObserver" in window && revealEls.length) {
    revealEls.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      /* The negative block-end margin holds the reveal until the element is a
         little way onto the page, so it eases in rather than popping at the
         very edge of the viewport. */
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* The hero's load choreography (DESIGN-GUIDELINES §8) is deliberately NOT
     handled here. Above-the-fold content must never depend on JS running to
     become visible, so it is a pure CSS animation on [data-reveal-intro].
     Driving it from JS meant a backgrounded tab — where rAF is paused — could
     leave the hero at opacity 0. */

  /* If the user turns reduced motion ON mid-session, stop hiding anything. */
  motionQuery.addEventListener("change", (e) => {
    if (!e.matches) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("is-visible"));
    }
  });

  /* ------------------------------------------------------------------
     4. Surface picker — recolor the cutting mat.
     The default mat (per theme) is pure CSS — see tokens.css, including
     the fixed --mat-texture grain this script never touches — so it
     renders correctly with this script absent. Everything below only
     overrides --mat-image/--color-mat when a visitor actually customizes
     the mat's color.

     The SVG template here is byte-for-byte the same shape as the one baked
     into tokens.css: a single ruled-mat panel — 50x25-unit grid at 24px
     pitch, axis numbers along the top and right edges, a corner protractor
     anchored bottom-left — parameterized only by the base color. It is
     rendered once per page (`background-repeat: no-repeat`) and scaled to
     cover the viewport (`background-size: cover`, `background-position:
     left bottom`, see styles.css), not tiled, so the protractor's origin
     always sits at the actual bottom-left corner of the screen regardless
     of viewport size. color-mix() inside the SVG's own stroke/fill values
     resolves at paint time in the image itself, so no CSS custom-property
     inheritance is needed for it to work inside a data URI.

     The anti-FOUC <head> script on every page (see index.html:17-27 and its
     counterparts) only sets --color-mat, not the full --mat-image — that
     rebuild happens here instead. Duplicating this generator's loops/trig in
     13 pre-paint <head> scripts wasn't worth it for a background layer: the
     flat mat color is already correct instantly (no wrong-color flash), and
     this deferred script fills in the detailed grid moments later.
  ------------------------------------------------------------------ */
  const MAT_UNIT = 24;
  const MAT_MAJOR_EVERY = 5;
  const MAT_MARGIN = 40;
  const MAT_UNITS_W = 50;
  const MAT_UNITS_H = 25;
  const MAT_GRID_W = MAT_UNITS_W * MAT_UNIT;
  const MAT_GRID_H = MAT_UNITS_H * MAT_UNIT;
  const MAT_GX0 = MAT_MARGIN;
  const MAT_GY0 = MAT_MARGIN;
  const MAT_GX1 = MAT_GX0 + MAT_GRID_W;
  const MAT_GY1 = MAT_GY0 + MAT_GRID_H;
  const MAT_CANVAS_W = MAT_GRID_W + 2 * MAT_MARGIN;
  const MAT_CANVAS_H = MAT_GRID_H + 2 * MAT_MARGIN;

  function matSvg(base) {
    const minor = `color-mix(in oklch, ${base} 100%, white 16%)`;
    const major = `color-mix(in oklch, ${base} 100%, white 32%)`;
    const guide = `color-mix(in oklch, ${base} 100%, white 48%)`;
    const FONT = "font-size='15' font-family='ui-monospace,monospace'";

    let s = `<svg xmlns='http://www.w3.org/2000/svg' width='${MAT_CANVAS_W}' height='${MAT_CANVAS_H}' viewBox='0 0 ${MAT_CANVAS_W} ${MAT_CANVAS_H}'>`;
    s += `<rect width='${MAT_CANVAS_W}' height='${MAT_CANVAS_H}' fill='${base}'/>`;
    s += `<defs><clipPath id='g'><rect x='${MAT_GX0}' y='${MAT_GY0}' width='${MAT_GRID_W}' height='${MAT_GRID_H}'/></clipPath></defs>`;

    // grid, clipped to the ruled area
    s += `<g clip-path='url(#g)'>`;
    for (let i = 0; i <= MAT_UNITS_W; i++) {
      const x = MAT_GX0 + i * MAT_UNIT;
      const isMajor = i % MAT_MAJOR_EVERY === 0;
      s += `<line x1='${x}' y1='${MAT_GY0}' x2='${x}' y2='${MAT_GY1}' stroke='${isMajor ? major : minor}' stroke-width='${isMajor ? 1 : 0.5}'/>`;
    }
    for (let j = 0; j <= MAT_UNITS_H; j++) {
      const y = MAT_GY0 + j * MAT_UNIT;
      const isMajor = j % MAT_MAJOR_EVERY === 0;
      s += `<line x1='${MAT_GX0}' y1='${y}' x2='${MAT_GX1}' y2='${y}' stroke='${isMajor ? major : minor}' stroke-width='${isMajor ? 1 : 0.5}'/>`;
    }
    s += `</g>`;

    // rulers: major ticks + numbers only (the grid already shows the fine
    // subdivisions, so per-unit ticks would just be redundant clutter).
    // Numbers run along the top edge and down the right edge only — the
    // left edge and bottom edge keep their tick marks (they still read as
    // "this is a ruled mat") but drop the digits, which just duplicated
    // the top/right numbers at this single-instance, cover-scaled size.
    const tickLen = 8;
    for (let i = 0; i <= MAT_UNITS_W; i += MAT_MAJOR_EVERY) {
      const x = MAT_GX0 + i * MAT_UNIT;
      s += `<line x1='${x}' y1='${MAT_GY0 - tickLen}' x2='${x}' y2='${MAT_GY0}' stroke='${guide}' stroke-width='1'/>`;
      s += `<line x1='${x}' y1='${MAT_GY1}' x2='${x}' y2='${MAT_GY1 + tickLen}' stroke='${guide}' stroke-width='1'/>`;
      s += `<text x='${x}' y='${MAT_GY0 - tickLen - 4}' text-anchor='middle' ${FONT} fill='${guide}'>${i}</text>`;
    }
    for (let j = 0; j <= MAT_UNITS_H; j += MAT_MAJOR_EVERY) {
      const y = MAT_GY0 + j * MAT_UNIT;
      const label = MAT_UNITS_H - j; // 25 at top -> 0 at bottom, matches the reference mat
      s += `<line x1='${MAT_GX0 - tickLen}' y1='${y}' x2='${MAT_GX0}' y2='${y}' stroke='${guide}' stroke-width='1'/>`;
      s += `<line x1='${MAT_GX1}' y1='${y}' x2='${MAT_GX1 + tickLen}' y2='${y}' stroke='${guide}' stroke-width='1'/>`;
      s += `<text x='${MAT_GX1 + tickLen + 6}' y='${y + 5}' text-anchor='start' ${FONT} fill='${guide}'>${label}</text>`;
    }

    // protractor: quarter-circle fanning from the grid's bottom-left origin
    const ox = MAT_GX0;
    const oy = MAT_GY1;
    s += `<path d='M ${ox} ${oy - 70} A 70 70 0 0 1 ${ox + 70} ${oy}' fill='none' stroke='${major}' stroke-width='1'/>`;
    s += `<path d='M ${ox} ${oy - 140} A 140 140 0 0 1 ${ox + 140} ${oy}' fill='none' stroke='${minor}' stroke-width='1'/>`;

    const shortLen = 220;
    const longLen = { 15: 900, 45: 620 };
    const labelR = 170;
    [15, 30, 45, 60].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const cx = Math.cos(rad);
      const cy = Math.sin(rad);
      const ex = ox + shortLen * cx;
      const ey = oy - shortLen * cy;
      s += `<line x1='${ox}' y1='${oy}' x2='${ex.toFixed(1)}' y2='${ey.toFixed(1)}' stroke='${guide}' stroke-width='1' stroke-dasharray='5 4'/>`;
      if (longLen[deg]) {
        const L = longLen[deg];
        const lx = Math.min(ox + L * cx, MAT_CANVAS_W + 40);
        const ly = oy - ((lx - ox) / cx) * cy;
        s += `<line x1='${ex.toFixed(1)}' y1='${ey.toFixed(1)}' x2='${lx.toFixed(1)}' y2='${ly.toFixed(1)}' stroke='${guide}' stroke-width='0.75' stroke-dasharray='5 4'/>`;
      }
      const lx2 = ox + labelR * cx;
      const ly2 = oy - labelR * cy;
      s += `<text x='${lx2.toFixed(1)}' y='${ly2.toFixed(1)}' ${FONT} fill='${guide}'>${deg}°</text>`;
    });

    s += `</svg>`;
    return s;
  }

  const matImageValue = (hex) =>
    `url("data:image/svg+xml,${encodeURIComponent(matSvg(hex))}")`;

  const colorSwatches = Array.prototype.slice.call(
    document.querySelectorAll(".surface-picker-swatch[data-color]")
  );

  /* ------------------------------------------------------------------
     4b. Mat-driven accent.
     "Let the cutting mat colour dictate the main accent — green mat gets
     green accent, blue gets blue." Every token this derives (--color-accent,
     --color-accent-hover, --color-on-accent, --color-tint-brand) is a plain
     CSS custom property, and --color-concept / --color-tag-bg / --color-focus
     (light theme) are declared in tokens.css as `var(--color-accent)` /
     `var(--color-tint-brand)` aliases — so overriding these four here is
     enough to re-theme the underlines, work-card tag pills, cert/writing
     status chips, the ghost-button hover fill, and inline code, all at once,
     with no per-component JS.

     Two paths produce a set:
     - MAT_ACCENT_TABLE: the picker's 11 built-in swatches, pre-solved and
       contrast-verified offline (see docs/DESIGN-GUIDELINES.md for the
       worked numbers) — used whenever the mat colour matches one exactly.
     - deriveAccentSet(): the SAME solve, run live, for a custom colour typed
       into the native <input type="color">. It binary-searches lightness at
       the picked hue for the lightness that clears 4.5:1 against every
       background that colour of text can land on — including the worst
       single pixel the paper's own grain can produce — the identical method
       used to solve the fixed palette by hand in earlier passes.

     A mat with no real hue (the grayscale swatches, or a near-neutral custom
     pick — saturation under 15%) has nothing to derive a colour FROM, and
     falls back to the site's own ink-blue identity pair.
  ------------------------------------------------------------------ */
  const PARCHMENT = "#f5f4ed";
  const WARM_SAND = "#e8e6dc";
  const DARK_PAPER = "#26231e";
  const DARK_SUBTLE = "#302c26";
  const LIGHT_TEX_ALPHA = 0.20; // must track --paper-texture's light alpha
  const DARK_TEX_ALPHA = 0.04; //  "        "        "      dark alpha
  const DEFAULT_LIGHT = { accent: "#1B365D", hover: "#12253F", on: "#faf9f5", tint: "#EEF2F7" };
  // Amber/bronze, not ink-blue — see the matching comment in tokens.css for
  // why: a cool blue was the one thing breaking this palette's warm
  // monochromatic logic on a genuinely hueless (black/grey) mat. Solved with
  // the exact same binary-search method every mat-derived accent uses below,
  // just fixed at an amber hue (36deg) instead of a mat's own, since a
  // neutral mat has no hue to derive one from.
  const DEFAULT_DARK = { accent: "#c48c39", hover: "#dab57e", on: "#141413", tint: "#362e21" };

  // Pre-solved, contrast-verified light+dark accent pairs for every built-in
  // swatch (see docs/DESIGN-GUIDELINES.md "Mat-driven accent" for the numbers
  // behind each one). Keyed by lowercase hex so lookup is a simple match.
  const MAT_ACCENT_TABLE = {
    "#095848": { // Green (default light mat)
      light: { accent: "#116151", hover: "#0c4338", on: "#faf9f5", tint: "#e0e7df" },
      dark: { accent: "#1eaa8d", hover: "#25d2af", on: "#141413", tint: "#25332b" },
    },
    "#141414": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Charcoal — neutral
    "#0b3556": { // Navy
      light: { accent: "#19598c", hover: "#113e60", on: "#faf9f5", tint: "#e1e6e4" },
      dark: { accent: "#489ddf", hover: "#8bc1eb", on: "#141413", tint: "#2a3033" },
    },
    "#7a3418": { // Rust
      light: { accent: "#8f3d1c", hover: "#632a14", on: "#faf9f5", tint: "#ece4da" },
      dark: { accent: "#de7d56", hover: "#eaad94", on: "#141413", tint: "#3a2d24" },
    },
    "#4a2545": { // Plum
      light: { accent: "#85397a", hover: "#5c2755", on: "#faf9f5", tint: "#ebe3e3" },
      dark: { accent: "#c87ebe", hover: "#dcacd5", on: "#141413", tint: "#382d30" },
    },
    "#0d4f4a": { // Teal
      light: { accent: "#11605a", hover: "#0c423e", on: "#faf9f5", tint: "#e0e7e0" },
      dark: { accent: "#1ea89e", hover: "#25d0c3", on: "#141413", tint: "#25322c" },
    },
    "#1b365d": { // Ink blue
      light: { accent: "#2b5694", hover: "#1e3b66", on: "#faf9f5", tint: "#e3e6e5" },
      dark: { accent: "#6f99d5", hover: "#a1bde4", on: "#141413", tint: "#2e3032" },
    },
    "#30302e": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Graphite — neutral
    "#3d3d3a": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Slate — neutral
    "#504e49": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Olive — neutral
    "#6b6a64": { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }, // Smoke grey — neutral
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function hexToHsl(hex) {
    let [r, g, b] = hexToRgb(hex).map((c) => c / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  function hueToRgbChannel(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToHex(h, s, l) {
    if (s === 0) {
      const v = l * 255;
      return rgbToHex([v, v, v]);
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return rgbToHex([
      hueToRgbChannel(p, q, h + 1 / 3) * 255,
      hueToRgbChannel(p, q, h) * 255,
      hueToRgbChannel(p, q, h - 1 / 3) * 255,
    ]);
  }

  function srgbToLin(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function relLum(hex) {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
  }

  function contrastRatio(a, b) {
    const la = relLum(a);
    const lb = relLum(b);
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  function mixHex(a, b, t) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex(ca.map((c, i) => c + (cb[i] - c) * t));
  }

  // CSS `background-blend-mode: normal` compositing --paper-texture's own
  // per-pixel alpha over bg — same mechanism in both themes now (see the
  // tokens.css comment on --paper-texture for why normal replaced the old
  // multiply/screen split). A lit-relief texture has a bright peak AND a
  // dark valley in the same image, unlike the old flat grain, so there are
  // two worst cases instead of one — this returns both, and callers add
  // both to the background set findLDown/findLUp must clear. LIT_MIN/MAX
  // are --paper-texture's actual measured output range (sampled from a
  // live canvas render of the real filter at these settings, not
  // estimated) and are shared by both themes since it's the identical
  // feTurbulence/feDiffuseLighting recipe in each — only the alpha differs.
  const LIT_MIN = 155;
  const LIT_MAX = 255;
  function litWorstPair(bgHex, alpha) {
    const bg = hexToRgb(bgHex);
    const mix = (v) => rgbToHex(bg.map((c) => c * (1 - alpha) + v * alpha));
    return [mix(LIT_MAX), mix(LIT_MIN)];
  }

  // Largest L (walking up from 0) at which hsl(h,s,L) still clears `target`
  // contrast against every background in bgs — i.e. the lightest colour that
  // is still dark enough to read on a light surface. Returns null only if
  // even pure black (L=0) can't clear the target against these backgrounds.
  function findLDown(h, s, bgs, target) {
    const ok = (l) => bgs.every((bg) => contrastRatio(hslToHex(h, s, l), bg) >= target);
    if (!ok(0)) return null;
    let lo = 0, hi = 1, best = 0;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) { best = mid; lo = mid; } else { hi = mid; }
    }
    return best;
  }

  // Smallest L (walking down from 1) that still clears `target` — the
  // darkest colour still light enough to read on a dark surface.
  function findLUp(h, s, bgs, target) {
    const ok = (l) => bgs.every((bg) => contrastRatio(hslToHex(h, s, l), bg) >= target);
    if (!ok(1)) return null;
    let lo = 0, hi = 1, best = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) { best = mid; hi = mid; } else { lo = mid; }
    }
    return best;
  }

  function chooseOn(accent) {
    const ivory = "#faf9f5";
    const nearBlack = "#141413";
    return contrastRatio(accent, ivory) >= contrastRatio(accent, nearBlack) ? ivory : nearBlack;
  }

  // kami wants tints barely-there ("lightest solid wins most of the time"),
  // so start from a fixed cosmetic mix ratio rather than the strongest tint
  // contrast would allow, and only back off toward the paper (never toward
  // the accent) if that cosmetic ratio doesn't clear 4.5:1.
  function deriveTint(accent, paperHex, cosmeticT) {
    let t = cosmeticT;
    while (t > 0) {
      const tint = mixHex(paperHex, accent, t);
      if (contrastRatio(accent, tint) >= 4.5) return tint;
      t -= 0.01;
    }
    return paperHex;
  }

  function deriveAccentSet(hex, theme) {
    const [h, s] = hexToHsl(hex);
    if (s < 0.15) return theme === "dark" ? DEFAULT_DARK : DEFAULT_LIGHT;
    const sWork = clamp(s, 0.4, 0.7);

    if (theme === "dark") {
      const bgs = [DARK_PAPER, DARK_SUBTLE, ...litWorstPair(DARK_PAPER, DARK_TEX_ALPHA)];
      const lAccent = findLUp(h, sWork, bgs, 4.6);
      if (lAccent === null) return DEFAULT_DARK;
      const accent = hslToHex(h, sWork, lAccent);
      let lHover = findLUp(h, sWork, bgs, 7.0);
      if (lHover === null || lHover < lAccent) lHover = Math.min(1, lAccent + 0.1);
      const hover = hslToHex(h, sWork, lHover);
      return { accent, hover, on: chooseOn(accent), tint: deriveTint(accent, DARK_PAPER, 0.16) };
    }

    const bgs = [PARCHMENT, WARM_SAND, ...litWorstPair(PARCHMENT, LIGHT_TEX_ALPHA)];
    const lAccent = findLDown(h, sWork, bgs, 4.6);
    if (lAccent === null) return DEFAULT_LIGHT;
    const accent = hslToHex(h, sWork, lAccent);
    let lHover = findLDown(h, sWork, bgs, 7.0);
    if (lHover === null || lHover > lAccent) lHover = Math.max(0, lAccent - 0.1);
    const hover = hslToHex(h, sWork, lHover);
    return { accent, hover, on: chooseOn(accent), tint: deriveTint(accent, PARCHMENT, 0.09) };
  }

  function computeAccentSets(matHex) {
    const known = MAT_ACCENT_TABLE[matHex.toLowerCase()];
    if (known) return known;
    return { light: deriveAccentSet(matHex, "light"), dark: deriveAccentSet(matHex, "dark") };
  }

  // Declared with `function` (hoisted) so setTheme(), defined earlier in the
  // file, can reference it safely — by the time either can actually run
  // (a click), every top-level declaration in this IIFE has already executed.
  function applyAccentSets(sets) {
    const theme = root.dataset.theme === "dark" ? "dark" : "light";
    const set = sets[theme];
    root.style.setProperty("--color-accent", set.accent);
    root.style.setProperty("--color-accent-hover", set.hover);
    root.style.setProperty("--color-on-accent", set.on);
    root.style.setProperty("--color-tint-brand", set.tint);
  }

  function applyMatColor(hex, { persist = true } = {}) {
    root.style.setProperty("--color-mat", hex);
    root.style.setProperty("--mat-image", matImageValue(hex));

    const sets = computeAccentSets(hex);
    currentMatAccentSets = sets;
    applyAccentSets(sets);

    if (persist) {
      localStorage.setItem("matColor", hex);
      localStorage.setItem("accentTokens", JSON.stringify(sets));
    }
  }

  function resetMat() {
    root.style.removeProperty("--color-mat");
    root.style.removeProperty("--mat-image");
    root.style.removeProperty("--color-accent");
    root.style.removeProperty("--color-accent-hover");
    root.style.removeProperty("--color-on-accent");
    root.style.removeProperty("--color-tint-brand");
    currentMatAccentSets = null;
    localStorage.removeItem("matColor");
    localStorage.removeItem("accentTokens");
  }

  /* The anti-FOUC <head> script already set --color-mat AND (when a visitor
     has customised it before) the four accent tokens, straight from the
     cached accentTokens blob — so there's no wrong-colour flash on repeat
     visits. It didn't build the full --mat-image (the textured grid) though
     — that's this deferred script's job. Re-deriving and re-persisting the
     accent set here too (not just trusting the head script's cache) is
     deliberate self-healing: a visitor whose last visit predates this
     feature has a matColor but no accentTokens yet. */
  const savedMatColor = localStorage.getItem("matColor");
  if (savedMatColor) applyMatColor(savedMatColor, { persist: true });

  const picker = document.querySelector(".surface-picker");
  if (picker) {
    const trigger = picker.querySelector(".surface-picker-trigger");
    const panel = picker.querySelector(".surface-picker-panel");
    const colorInput = picker.querySelector('input[type="color"]');
    const resetBtn = picker.querySelector("[data-surface-reset]");

    const currentMat = () =>
      getComputedStyle(root).getPropertyValue("--color-mat").trim();

    /* Reflect the active selection across the swatch radiogroup and the
       native color input, without touching --mat-image (used on init, and
       after every change). */
    function syncPickerUI(selection) {
      let colorMatched = false;
      colorSwatches.forEach((sw) => {
        const isMatch =
          selection.mode === "color" &&
          sw.dataset.color.toLowerCase() === selection.value.toLowerCase();
        sw.setAttribute("aria-checked", String(isMatch));
        sw.tabIndex = isMatch ? 0 : -1;
        if (isMatch) colorMatched = true;
      });
      if (!colorMatched && colorSwatches.length) colorSwatches[0].tabIndex = 0;

      if (colorInput && selection.mode === "color") colorInput.value = selection.value;
    }

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const target = colorSwatches.find((sw) => sw.getAttribute("aria-checked") === "true");
      (target || colorSwatches[0]).focus();
    }

    function closePanel({ returnFocus = true } = {}) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener("click", () => {
      if (panel.hidden) openPanel();
      else closePanel({ returnFocus: false });
    });

    document.addEventListener("click", (e) => {
      if (!panel.hidden && !picker.contains(e.target)) closePanel({ returnFocus: false });
    });

    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
      }
    });

    // Roving-tabindex radiogroup: arrow keys move focus AND select,
    // matching native <input type="radio"> behavior.
    colorSwatches.forEach((sw, i) => {
      sw.addEventListener("click", () => {
        applyMatColor(sw.dataset.color);
        syncPickerUI({ mode: "color", value: sw.dataset.color });
      });
      sw.addEventListener("keydown", (e) => {
        const dirs = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let nextIndex = null;
        if (e.key in dirs) nextIndex = (i + dirs[e.key] + colorSwatches.length) % colorSwatches.length;
        else if (e.key === "Home") nextIndex = 0;
        else if (e.key === "End") nextIndex = colorSwatches.length - 1;
        if (nextIndex === null) return;
        e.preventDefault();
        const next = colorSwatches[nextIndex];
        applyMatColor(next.dataset.color);
        syncPickerUI({ mode: "color", value: next.dataset.color });
        next.focus();
      });
    });

    if (colorInput) {
      colorInput.addEventListener("input", () => {
        applyMatColor(colorInput.value);
        syncPickerUI({ mode: "color", value: colorInput.value });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetMat();
        syncPickerUI({ mode: "color", value: currentMat() });
        closePanel();
      });
    }

    syncPickerUI({ mode: "color", value: currentMat() });
  }

  /* ------------------------------------------------------------------
     6. Case-study image lightbox
     Every image inside a case study's prose body (`.prose figure img`)
     becomes a zoom trigger, opening a single shared <dialog> full-screen
     over a scrim. Native <dialog>.showModal() supplies focus trapping,
     Escape-to-close, and top-layer stacking for free, so there's no
     hand-rolled focus trap here — just the open/close wiring and the
     bilingual labels. This is purely additive: with this script absent
     (or before it runs), the images render exactly as they always have,
     inline at full size, so the base reading experience never depends
     on it — nothing is hidden by CSS alone.
  ------------------------------------------------------------------ */
  const zoomImages = Array.prototype.slice.call(
    document.querySelectorAll(".prose figure img")
  );

  if (zoomImages.length && "HTMLDialogElement" in window) {
    const lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";

    const figure = document.createElement("figure");
    figure.className = "lightbox-figure";
    const lbImg = document.createElement("img");
    lbImg.className = "lightbox-image";
    const caption = document.createElement("figcaption");
    caption.className = "lightbox-caption";
    figure.append(lbImg, caption);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "lightbox-close";
    // Decorative X — the button's accessible name comes from aria-label
    // (set/refreshed below), not from this icon.
    closeBtn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 2 L16 16 M16 2 L2 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    lightbox.append(figure, closeBtn);
    document.body.appendChild(lightbox);

    let trigger = null; // the .figure-zoom button that opened the dialog

    function currentLang() {
      return root.lang === "ar" ? "ar" : "en";
    }

    function openLightbox(btn, img) {
      trigger = btn;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      const sourceFigcaption = img.closest("figure").querySelector("figcaption");
      caption.textContent = sourceFigcaption ? sourceFigcaption.textContent : "";
      // The image's own (English, per docs/CONTENT-GUIDE.md) alt text is a
      // fine dialog name as-is — it doesn't need the "view full-screen"
      // framing that the trigger button's label carries.
      lightbox.setAttribute("aria-label", img.alt);
      lightbox.showModal();
      closeBtn.focus();
    }

    function handleDialogClosed() {
      lbImg.src = "";
      if (trigger) trigger.focus();
    }

    // The single explicit-close path (close button, scrim click, our own
    // Escape handler below) — always cleans up immediately rather than
    // waiting on the dialog's "close" event, which not every environment
    // fires promptly for every closure method. Idempotent, so it's safe
    // if "close" *also* fires afterward (see the listener right below).
    function closeLightbox() {
      if (lightbox.hasAttribute("open")) lightbox.close();
      handleDialogClosed();
    }

    // Belt-and-braces alongside <dialog>'s native Escape handling: showModal()
    // is supposed to close on Escape on its own, but that shouldn't be the
    // *only* path — matches the surface picker's own manual Escape handler
    // a few sections up for the same "don't solely trust the platform"
    // reason.
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });

    // Covers any native closure path that doesn't go through
    // closeLightbox() above (i.e. <dialog>'s own Escape/cancel handling,
    // where it fires promptly).
    lightbox.addEventListener("close", handleDialogClosed);

    // A click lands on the dialog element itself only when it isn't on a
    // descendant (the figure or close button) — i.e. the scrim.
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);

    const zoomButtons = [];
    zoomImages.forEach((img) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "figure-zoom";
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(btn, img));
      zoomButtons.push({ btn, img });
    });

    refreshLightboxLabels = () => {
      const lang = currentLang();
      closeBtn.setAttribute("aria-label", STRINGS[lang]["lightbox.close"]);
      const expandLabel = STRINGS[lang]["lightbox.expand"];
      zoomButtons.forEach(({ btn, img }) => {
        btn.setAttribute("aria-label", `${expandLabel}: ${img.alt}`);
      });
    };
    refreshLightboxLabels();
  }

  /* ------------------------------------------------------------------
     8. Sticky header — hides on scroll-down, reveals on scroll-up.
     Pinned via CSS `position: sticky`; this section only toggles two
     classes plus `inert`, driven by scroll direction. Above one viewport
     height ("the first fold") the header just stays put — no hide/show
     jitter from small scroll adjustments near the top of the page. Past
     that point, ANY upward scroll reveals it immediately (no distance
     threshold — an upward scroll reads as "take me back to nav"), and
     continued downward scroll hides it.
  ------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  if (header) {
    const supportsInert = "inert" in HTMLElement.prototype;
    let lastY = window.scrollY;
    let ticking = false;

    function setHidden(hidden) {
      header.classList.toggle("is-header-hidden", hidden);
      // A visually off-screen header must not still be in the tab order —
      // otherwise a keyboard user tabbing through mid-page content can land
      // on controls they can't see. Mirrors this codebase's existing
      // dialog/modal focus-containment convention.
      if (supportsInert) header.inert = hidden;
    }

    function updateHeader() {
      const y = window.scrollY;
      const fold = window.innerHeight;

      header.classList.toggle("is-header-stuck", y > 0);

      if (y <= fold) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    }

    // Correct state immediately on load — a visitor arriving via an anchor
    // link or a restored scroll position shouldn't need to scroll first.
    updateHeader();

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
     9. Drag-anywhere — About photos + Tools stickers.
     Pointer Events (not HTML5 drag-and-drop, which is built for
     reorder/dropzone patterns and fights free-form dragging).

     .about-photo stays purely decorative — dragging it is mouse/touch/pen
     only, nothing added to the tab order, exactly as before. .tool-sticker
     is different: it's a real <button> (index.html) that opens the tool
     info popover (§11) on click/tap/Enter/Space, so IT needs the standard
     "was this a click or a drag" threshold every drag-and-drop library
     uses — a plain tap has to keep working as a click and reach keyboard
     users too, while an actual drag must not also pop the popover open.
     makeDraggable(el, { onClick }) takes an optional callback for this;
     .about-photo's call site passes none and is completely unaffected.

     `position: absolute` against the initial containing block, NOT
     `position: fixed` — deliberately. None of .about-photo's or
     .tool-sticker's ancestors are themselves positioned (see the
     "Draggable objects" comment in styles.css), so an absolutely
     positioned one resolves against the same viewport-sized initial
     containing block a fixed element would — which is what still lets a
     dropped item bleed past the paper onto the mat — but, unlike fixed,
     it SCROLLS WITH THE PAGE instead of staying glued to the viewport.
     Fixed positioning was tried first and was wrong: a dropped item
     stayed pinned to wherever it was on SCREEN as the page scrolled
     underneath it, so it looked like it had vanished the moment you
     scrolled away from where you dropped it.

     Pickup converts the current rendered position to `left`/`top` (a
     fresh getBoundingClientRect() at that instant, converted from
     viewport-relative to document-relative by adding the current
     scroll offset — captured once per drag, since touch-action: none
     and preventDefault() keep the page from scrolling mid-drag) and then
     moves purely via the --dx/--dy custom properties that feed each
     component's own `transform` (see "Draggable objects" in styles.css)
     — never by rewriting left/top every frame, which would be layout
     work instead of a compositor-only transform update. The viewport
     clamp (below) still reasons in viewport space, since that's what's
     actually meant to stay on screen during the gesture; it's the same
     math either way, just measured against the position at drag start
     rather than an ever-moving document offset.

     `.is-dragging` (transition: none, set in the SAME synchronous update
     as the position/--dx/--dy reset) is what keeps pickup instant with no
     animated jump; removing it afterward is safe precisely because nothing
     else changes in that same moment, so no transition fires
     retroactively. There is no "bake into left/top on drop" step: the next
     pickup just reads a fresh rect again, which already accounts for
     whatever --dx/--dy currently is.

     pointermove/pointerup listen on `document`, not `el` — even with
     pointer capture requested below, relying on it alone left a real gap:
     once the element leaves its own (now tiny, now-elsewhere) bounds,
     events could stop reaching an el-scoped listener, and the drag would
     visibly lag behind the cursor/finger until they crossed back over it.
     Document-level listeners always receive the event regardless of
     where the pointer physically is, filtered by pointerId so multiple
     simultaneous drags (two-finger touch) don't cross-talk.

     Click vs. drag: pointerdown alone no longer starts a drag — it only
     records the start position. The actual pickup (measure, reparent,
     detach) runs lazily, the first time pointermove crosses
     DRAG_THRESHOLD px, so a plain tap never touches the DOM at all and
     the browser's own `click` fires normally afterward (this is also how
     a keyboard Enter/Space activates onClick: no pointer events are
     involved in that path at all, so none of this logic is even in play).
     If the threshold WAS crossed, `justDragged` flags the next `click`
     event to be swallowed — browsers still fire one right after a real
     drag's pointerup, and onClick must not fire for that.

     Positions are never persisted (no localStorage) — a refresh is the
     reset, by design.
  ------------------------------------------------------------------ */
  if ("PointerEvent" in window) {
    const DRAG_THRESHOLD = 8; // px of movement before a pointerdown counts as a drag, not a click

    function makeDraggable(el, options) {
      const onClick = options && options.onClick;
      el.classList.add("draggable");
      el.setAttribute("draggable", "false"); // no native image drag-ghost fighting pointer capture

      let baseViewportLeft = 0;
      let baseViewportTop = 0;
      let elWidth = 0;
      let elHeight = 0;
      let padX = 0;
      let padY = 0;
      let startX = 0;
      let startY = 0;
      let dragScrollX = 0;
      let dragScrollY = 0;
      let activePointerId = null;
      let isDragging = false; // true only once DRAG_THRESHOLD has been crossed this gesture
      let justDragged = false; // consumed by the very next `click` to suppress it

      // The actual pickup — everything pointerdown used to do unconditionally,
      // now deferred until movement proves this is a drag, not a click.
      function beginDrag(e) {
        isDragging = true;

        const rect = el.getBoundingClientRect();
        elWidth = el.offsetWidth;
        elHeight = el.offsetHeight;
        // Anchor from the rendered box's CENTER, not its top-left.
        // getBoundingClientRect() on a rotated element returns the rotated
        // bounding box — rotation happens around the element's own center
        // (the default transform-origin), so the center is the only point
        // that stays put; reconstructing left/top from the bbox corner
        // instead would re-apply the same rotation around a shifted point
        // and visibly jump on pickup.
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        baseViewportLeft = centerX - elWidth / 2;
        baseViewportTop = centerY - elHeight / 2;
        // Half the extra width/height the RENDERED (rotated) box has over
        // the unrotated one (0 for an unrotated element) — the viewport
        // clamp needs this on top of elWidth/elHeight or a tilted element
        // could clamp a few px past the edge, since the clamp constrains
        // what's actually painted, not the smaller unrotated box.
        padX = (rect.width - elWidth) / 2;
        padY = (rect.height - elHeight) / 2;
        dragScrollX = window.scrollX;
        dragScrollY = window.scrollY;

        // Reparent to <body> — AFTER measuring, BEFORE repositioning, so
        // nothing visually jumps. .tool-sticker's own parent (.sticker-board)
        // is `position: relative` (it has to be, for the base scatter
        // layout's percentage left/top), which would make it — not the
        // document — the containing block for `position: absolute` below.
        // <body> itself is unpositioned, so reparenting there guarantees
        // the same document-relative containing block for every draggable
        // regardless of where it started, without special-casing stickers.
        if (el.parentElement !== document.body) {
          document.body.appendChild(el);
        }

        el.classList.add("is-dragging", "is-detached");
        // Freeze the measured width before leaving flow — the About photos
        // get their width from flex-stretching inside .about-photos, so
        // without this they'd collapse to a shrink-to-fit sliver the
        // instant `position: absolute` pulls them out of that layout.
        el.style.inlineSize = elWidth + "px";
        el.style.position = "absolute";
        el.style.margin = "0";
        el.style.left = baseViewportLeft + dragScrollX + "px";
        el.style.top = baseViewportTop + dragScrollY + "px";
        el.style.setProperty("--dx", "0px");
        el.style.setProperty("--dy", "0px");

        // Best-effort: capture is a secondary aid alongside the
        // document-level listeners above, not a requirement for them —
        // don't let a rare capture failure (already-released pointer, OS
        // quirk) throw past preventDefault().
        try {
          el.setPointerCapture(e.pointerId);
        } catch (err) {}
      }

      function onPointerMove(e) {
        if (e.pointerId !== activePointerId) return;

        if (!isDragging) {
          const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
          if (moved < DRAG_THRESHOLD) return;
          beginDrag(e);
        }

        e.preventDefault();
        const dx = clamp(e.clientX - startX, -baseViewportLeft + padX, window.innerWidth - elWidth - baseViewportLeft - padX);
        const dy = clamp(e.clientY - startY, -baseViewportTop + padY, window.innerHeight - elHeight - baseViewportTop - padY);
        el.style.setProperty("--dx", dx + "px");
        el.style.setProperty("--dy", dy + "px");
      }

      function onPointerUp(e) {
        if (e.pointerId !== activePointerId) return;
        activePointerId = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        if (el.hasPointerCapture(e.pointerId)) {
          try {
            el.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
        if (isDragging) {
          el.classList.remove("is-dragging");
          justDragged = true;
        }
        isDragging = false;
      }

      el.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (activePointerId !== null) return; // already mid-drag from another pointer

        startX = e.clientX;
        startY = e.clientY;
        activePointerId = e.pointerId;

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
      });

      // The single source of truth for "open the popover": fires naturally
      // for a real click/tap AND for keyboard Enter/Space (which produces a
      // click with no pointer events at all), so there's nothing keyboard-
      // specific to wire up separately. The one thing it has to filter out
      // is the trailing click a browser still fires right after a real
      // drag's pointerup.
      if (onClick) {
        el.addEventListener("click", (e) => {
          if (justDragged) {
            justDragged = false;
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick(el);
        });
      }
    }

    /* Scatter the tool stickers on load: a loose N-cell grid sized to the
       sticker count, jittered so it doesn't look like a grid — cheap
       collision-avoidance without real physics. Cell assignment is
       shuffled so the DOM's category order doesn't leak into a
       left-to-right visual order. Re-run fresh on every load (see the
       no-persistence note above), so this needs no seed.

       Placement accounts for each sticker's OWN rendered footprint
       (wPct/hPct below), not just its cell — at the 2x size pass this
       stopped being optional: a sticker placed near a cell's far edge
       with no regard for its own width could render partly outside
       .sticker-board, which below 48em means partly clipped by body's
       overflow: clip (measured: a sticker's right edge landing 66px past
       a 375px viewport, invisibly cut off, with no scrollbar to reveal
       it).

       That footprint also has to account for the random ±12deg rotation
       (--base-rot, set below) each sticker gets: a rotated box's bounding
       box is bigger than the unrotated one — the same "rendered vs
       unrotated size" distinction the drag engine's own padX/padY handles
       (see the "Draggable objects" pickup comment) — so growthX/growthY
       here is the worst case at a full 12deg, split evenly since rotation
       grows the box symmetrically around its own center. The final
       clamp() is a hard backstop regardless of the cell math, so a
       sticker's rendered edge can never exceed the board's. */
    function scatterStickers(board) {
      const stickers = Array.prototype.slice.call(board.querySelectorAll(".tool-sticker"));
      const count = stickers.length;
      if (!count) return;

      const boardWidth = board.offsetWidth;
      const boardHeight = board.offsetHeight;

      const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.6)));
      const rows = Math.ceil(count / cols);
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) cells.push({ c, r });
      }
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = cells[i];
        cells[i] = cells[j];
        cells[j] = tmp;
      }

      const cellW = 100 / cols;
      const cellH = 100 / rows;
      const pad = 0.15; // small margin off the cell's own edge, when there's room to spare
      const MAX_ROT = (12 * Math.PI) / 180;
      const cosMax = Math.cos(MAX_ROT);
      const sinMax = Math.sin(MAX_ROT);

      stickers.forEach((el, i) => {
        const cell = cells[i];
        const wPx = el.offsetWidth;
        const hPx = el.offsetHeight;
        const wPct = (wPx / boardWidth) * 100;
        const hPct = (hPx / boardHeight) * 100;
        // Half the worst-case bounding-box growth from rotation, per axis
        // — computed in PIXELS first (wPx/hPx share one scale; wPct/hPct
        // don't, since one's relative to boardWidth and the other to
        // boardHeight, and this board is rarely square) and only
        // converted to each axis's own percentage at the end.
        const growthX = (Math.max(0, wPx * cosMax + hPx * sinMax - wPx) / 2 / boardWidth) * 100;
        const growthY = (Math.max(0, hPx * cosMax + wPx * sinMax - hPx) / 2 / boardHeight) * 100;
        const cellLeft = cell.c * cellW;
        const cellTop = cell.r * cellH;
        // Room left in the cell once the sticker's own (rotation-grown)
        // footprint is reserved — floors at 0 rather than going negative
        // if the sticker is bigger than its cell (only possible at very
        // cramped widths).
        const roomX = Math.max(0, cellW - wPct - 2 * growthX);
        const roomY = Math.max(0, cellH - hPct - 2 * growthY);
        const x = clamp(cellLeft + growthX + roomX * (pad + Math.random() * (1 - 2 * pad)), growthX, 100 - wPct - growthX);
        const y = clamp(cellTop + growthY + roomY * (pad + Math.random() * (1 - 2 * pad)), growthY, 100 - hPct - growthY);
        el.style.left = x + "%";
        el.style.top = y + "%";
        el.style.setProperty("--base-rot", (Math.random() * 24 - 12).toFixed(1) + "deg");
      });
    }

    document.querySelectorAll(".about-photo").forEach((el) => makeDraggable(el));

    // Work-card photo frames: not draggable, just a fixed per-card tilt so
    // each thumbnail reads as a loosely-placed physical photo rather than a
    // straight rectangle. Randomized fresh on every load (no persistence),
    // same "re-run, don't remember" choice the sticker scatter makes above.
    document.querySelectorAll(".work-card-media").forEach((el) => {
      const deg = (Math.random() * 14 - 7).toFixed(1);
      el.style.setProperty("--base-rot", deg + "deg");
    });

    const stickerBoard = document.querySelector(".sticker-board");
    if (stickerBoard) {
      // Below 48em (matching styles.css's own breakpoint for this
      // component), the scatter grid's own math no longer guarantees
      // non-overlapping cells, so the CSS falls back to a plain grid
      // instead and scattering is skipped entirely rather than fighting
      // that layout with inline left/top percentages. Click-to-open-popover
      // still gets wired up either way — only the scatter/rotation is
      // viewport-gated, not the sticker's actual functionality.
      const isMobileViewport = !window.matchMedia("(min-width: 48em)").matches;
      if (!isMobileViewport) {
        scatterStickers(stickerBoard);
      }
      // openToolPopover is declared later, in §11 — safe to reference here
      // because `function` declarations hoist, and this callback only
      // ever actually RUNS later, from a click, by which point §11's
      // setup has already finished (everything in this file runs
      // synchronously, top to bottom, well before any user interaction).
      // Below 48em, skip makeDraggable's drag machinery entirely — a plain
      // click listener still opens the popover (and still answers keyboard
      // Enter/Space, same as any button), but there's no pointerdown-driven
      // drag to fight a touch scroll on a phone.
      stickerBoard.querySelectorAll(".tool-sticker").forEach((el) => {
        if (isMobileViewport) {
          el.addEventListener("click", () => openToolPopover(el));
        } else {
          makeDraggable(el, { onClick: openToolPopover });
        }
      });
    }

    // A viewport resize/rotation shouldn't be able to strand a dropped item
    // off-screen — nudge left/top (not --dx/--dy, which is session-local to
    // an active drag) back inside bounds for anything currently detached.
    let resizeQueued = false;
    function reclampDetached() {
      document.querySelectorAll(".is-detached").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const clampedLeft = clamp(rect.left, 0, window.innerWidth - rect.width);
        const clampedTop = clamp(rect.top, 0, window.innerHeight - rect.height);
        if (clampedLeft !== rect.left) {
          el.style.left = (parseFloat(el.style.left) || 0) + (clampedLeft - rect.left) + "px";
        }
        if (clampedTop !== rect.top) {
          el.style.top = (parseFloat(el.style.top) || 0) + (clampedTop - rect.top) + "px";
        }
      });
      resizeQueued = false;
    }
    window.addEventListener("resize", () => {
      if (!resizeQueued) {
        resizeQueued = true;
        requestAnimationFrame(reclampDetached);
      }
    });
  }

  /* ------------------------------------------------------------------
     10. Play hint (sticky-note--tip)
     One-time dismissible tip introducing §9's drag-anywhere feature and
     the surface picker (section 4) — a contextual note sitting right
     before the sticker board (normal document flow, not position: fixed,
     not appended to <body>), so it needs its OWN IntersectionObserver
     watching the sticker board itself rather than reusing §3's reveal
     machinery — the note exists in the DOM from the moment it's built
     (inserted ahead of the board it's about to explain), so watching
     itself would just fire immediately rather than waiting for the
     visitor to actually scroll to the stickers.

     Unlike a decorative reveal, "hidden until the sticker board is
     reached" is this component's actual function, not an animation
     nicety — so styles.css hides it (opacity/visibility) unconditionally,
     not gated behind reduced-motion, and only the FADE transition itself
     is motion-gated. A reduced-motion visitor still only sees it appear
     at the right scroll position, just without the fade.

     Purely additive chrome either way: with this script absent, or once
     already dismissed, there's simply no tip — nothing else depends on it.
  ------------------------------------------------------------------ */
  if (!localStorage.getItem("hintDismissed") && "IntersectionObserver" in window) {
    const stickerBoardEl = document.querySelector("#skills .sticker-board");
    if (stickerBoardEl) {
      const hint = document.createElement("div");
      hint.className = "sticky-note sticky-note--tip";

      const text = document.createElement("p");
      text.textContent =
        "Photos and tool stickers can be dragged anywhere on the page, even past the paper, onto the mat. The mat's own color is yours to change too, from the swatch in the bottom corner.";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "sticky-note--tip-close";
      closeBtn.setAttribute("aria-label", "Dismiss tip");
      closeBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      closeBtn.addEventListener("click", () => {
        localStorage.setItem("hintDismissed", "1");
        hint.remove();
      });

      hint.append(text, closeBtn);
      stickerBoardEl.before(hint);

      const hintIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              hint.classList.add("is-visible");
              hintIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      hintIo.observe(stickerBoardEl);
    }
  }

  /* ------------------------------------------------------------------
     11. Tool info popover
     One shared <dialog> (built lazily, on first use, and appended to
     <body> — same "purely additive, no build cost if never opened"
     shape as the case-study lightbox in §6, whose open/close mechanics
     this copies one-for-one: showModal(), a manual Escape handler
     alongside the native one, backdrop-click-to-close, focus returned to
     the trigger button on close). Declared as plain top-level functions
     (not nested inside an `if`) specifically so `openToolPopover` stays
     accessible from §9's sticker wiring above, which runs earlier in the
     file but only actually CALLS it later, from a click.
  ------------------------------------------------------------------ */
  let toolPopoverEl = null;
  let toolPopoverTrigger = null;
  let toolPopoverParts = null;

  function buildToolPopover() {
    if (toolPopoverEl || !("HTMLDialogElement" in window)) return;

    const popover = document.createElement("dialog");
    popover.className = "tool-popover";

    const card = document.createElement("div");
    card.className = "tool-popover-card";

    // Decorative repeat of the sticker's own image — the heading right
    // below it already carries the tool's name as real text, so a screen
    // reader doesn't need this image announced too.
    const icon = document.createElement("img");
    icon.className = "tool-popover-icon";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");

    const name = document.createElement("h3");
    name.className = "tool-popover-name";
    name.id = "tool-popover-name";

    // Reuses .tag-pill as-is (styles.css "Concept tags") — the same
    // shape/fill every other badge on this site uses, not a new component.
    const proficiency = document.createElement("span");
    proficiency.className = "tool-popover-proficiency tag-pill";

    const description = document.createElement("p");
    description.className = "tool-popover-description";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tool-popover-close";
    closeBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

    card.append(icon, name, proficiency, description);
    popover.append(card, closeBtn);
    document.body.appendChild(popover);

    // aria-labelledby, not aria-label — the dialog already has a visible
    // heading (the tool name), so the accessible name should point at it
    // rather than duplicate its text in an attribute (WAI-ARIA APG's
    // recommended pattern for a dialog with a visible title).
    popover.setAttribute("aria-labelledby", "tool-popover-name");

    function handleClosed() {
      if (toolPopoverTrigger) toolPopoverTrigger.focus();
    }
    // Single explicit-close path (close button, backdrop click, the
    // Escape handler below) — same reasoning as the lightbox's
    // closeLightbox(): don't wait on the dialog's own "close" event,
    // which isn't guaranteed to fire promptly for every closure method
    // in every environment. Idempotent, so it's safe if "close" also
    // fires afterward.
    function closePopover() {
      if (popover.hasAttribute("open")) popover.close();
      handleClosed();
    }
    popover.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopover();
    });
    popover.addEventListener("close", handleClosed);
    // A click lands on the dialog element itself only when it isn't on a
    // descendant (the card or close button) — i.e. the backdrop.
    popover.addEventListener("click", (e) => {
      if (e.target === popover) closePopover();
    });
    closeBtn.addEventListener("click", closePopover);

    toolPopoverEl = popover;
    toolPopoverParts = { icon, name, proficiency, description, closeBtn };
  }

  function openToolPopover(sticker) {
    buildToolPopover();
    if (!toolPopoverEl) return; // no <dialog> support — degrades silently, same as the lightbox

    toolPopoverTrigger = sticker;
    const img = sticker.querySelector(".tool-sticker-img");
    toolPopoverParts.icon.src = img.src;
    toolPopoverParts.name.textContent = img.alt;
    toolPopoverParts.proficiency.textContent = sticker.dataset.proficiency || "";
    toolPopoverParts.description.textContent = sticker.dataset.description || "";
    toolPopoverParts.closeBtn.setAttribute(
      "aria-label",
      STRINGS[root.lang === "ar" ? "ar" : "en"]["lightbox.close"]
    );
    toolPopoverEl.showModal();
    toolPopoverParts.closeBtn.focus();
  }

  /* ------------------------------------------------------------------
     12. Mobile/tablet nav toggle
     Purely additive — see the long comment on .nav-toggle/.site-nav-panel
     in styles.css for the full "why": without this, .site-nav-panel's
     `display: contents` default means the header behaves exactly as it
     always has at every width. Only once this runs does .site-header
     gain .nav-js-ready, which is what actually turns the hamburger
     button on and the panel into a toggleable dropdown below 64em (both
     gated behind that class in CSS). Open/close mechanics mirror the
     surface picker (§4) — roving trigger/panel, outside-click and
     Escape both close it, aria-expanded is the single source of truth
     the icon's hamburger→X animation reads too, so there's nothing to
     keep in sync separately.
  ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.getElementById("site-nav-panel");
  const siteHeaderEl = document.querySelector(".site-header");
  if (navToggle && navPanel && siteHeaderEl) {
    navPanel.hidden = true;
    siteHeaderEl.classList.add("nav-js-ready");

    function openNav() {
      navPanel.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    }
    function closeNav({ returnFocus = false } = {}) {
      navPanel.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
      if (returnFocus) navToggle.focus();
    }

    navToggle.addEventListener("click", () => {
      if (navPanel.hidden) openNav();
      else closeNav();
    });

    document.addEventListener("click", (e) => {
      if (!navPanel.hidden && !siteHeaderEl.contains(e.target)) closeNav();
    });

    navPanel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeNav({ returnFocus: true });
      }
    });

    // Anchor links inside the panel scroll the page to a section — leaving
    // the panel open over the destination would just be in the way. The
    // same applies to .mobile-controls' mode/theme segmented bars: picking
    // an option is a complete action, so it closes the panel too, same as
    // a nav link. Harmless at desktop widths, where this panel isn't a
    // collapsible overlay in the first place (closeNav() there just sets
    // an attribute CSS already ignores via the min-width: 64em rule).
    navPanel.querySelectorAll("a, .mobile-controls [data-mode-option], .mobile-controls [data-theme-option]").forEach((el) => {
      el.addEventListener("click", () => closeNav());
    });

    // A resize that crosses into desktop width must never strand the
    // panel open (or aria-expanded stuck true) — CSS already forces the
    // nav visible there regardless (see the min-width: 64em rule in
    // styles.css), but the trigger's own state should still reflect
    // reality if the visitor resizes back down again later.
    const desktopQuery = window.matchMedia("(min-width: 64em)");
    // Reads the live desktopQuery.matches rather than the change event's
    // own .matches — real browsers populate that on a MediaQueryListEvent,
    // but reading the list itself is correct regardless of how the event
    // was constructed, and doesn't depend on that detail holding.
    desktopQuery.addEventListener("change", () => {
      if (desktopQuery.matches) closeNav();
    });
  }
})();
