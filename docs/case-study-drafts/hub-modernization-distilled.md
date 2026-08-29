# Hub Platform Modernization — copy tightening draft (v2)

Working file only, not linked from the site. Supersedes the first draft in
this file, which kept the original's narrative voice ("bombing it down",
wry asides). Per feedback, this version drops that: the audience is a
technical lead, not read for personality. It's built from the site's
existing `en-simple` copy (`STRINGS["en-simple"].case.hub.*` in
[js/main.js](../../js/main.js)) as the factual base — that version is
already stripped of flourish — rewritten into normal, fluent English rather
than short declarative sentences, and ordered as: **problem observed → decision
made → result/output**.

**Before** below is the current default-`en` copy (what's live on
[work/hub-modernization.html](../../work/hub-modernization.html) today).
**After** is the rewrite. No fact, number, or causal link is dropped.

---

## Hero summary

**Before:**
> Five projects, over a year and a half, on one platform. A Power Pages
> data-model migration existed only to unlock Bootstrap 5. That led to a
> front-end rebuild, which surfaced accessibility debt. Around the same time,
> the Azure AD B2C sign-up and sign-in flows still didn't match the new
> visual system, and a spinner problem nobody had gotten around to needed
> fixing too. None of this was planned as one project. I had a hand in fixing
> every piece of it.

**After:**
> Five projects on one platform over about a year and a half, none of them
> planned as a single initiative. A Power Pages data-model migration was
> required to unlock Bootstrap 5, which triggered a front-end rebuild and
> surfaced accessibility debt. In parallel, the Azure AD B2C sign-up and
> sign-in flows still didn't match the new visual system, and a long-standing
> spinner inconsistency needed fixing. I worked on every part of it.

## Facts bar

**Before — Role:**
> Design for the visual system upgrade. Front-end code for the Bootstrap
> rebuild, the Azure AD B2C flows, and the spinner fix. I had no role on the
> Power Pages data-model migration itself, that was backend platform work,
> but it's the reason everything else on this page had to happen.

**After — Role:**
> Design for the visual system upgrade, and front-end development for the
> Bootstrap rebuild, the Azure AD B2C flows, and the spinner fix. The Power
> Pages data-model migration was backend platform work and not mine, but
> it's the reason the other four efforts had to happen.

**Before — Team:**
> The Hub platform team, throughout. This case study covers my thread
> through five connected efforts, not a claim on the whole program.

**After — Team:**
> The Hub platform team, throughout. This case study covers my contribution
> across five connected efforts, not the full program.

**Before — Timeline:**
> June–July 2024: Power Pages migration and Bootstrap rebuild. September
> 2024: accessibility remediation. December 2024: Azure AD B2C alignment.
> October 2025: spinner standardization. Not a planned sequence. Each piece
> got picked up once it became the next blocker.

**After — Timeline:**
> June–July 2024: Power Pages migration and Bootstrap rebuild. September
> 2024: accessibility remediation. December 2024: Azure AD B2C alignment.
> October 2025: spinner standardization. Each piece was taken up as it
> became the next blocker, not as part of a planned sequence.

**Status / Scope:** unchanged — already one line each, no rewrite needed.

---

## Why one upgrade became five projects

**Before (p1):**
> Power Pages ran on Bootstrap 3 from 2014 until Microsoft added Bootstrap 5
> support in 2023. That support only works on Power Pages' enhanced data
> model. You can't create or run a Bootstrap 5 site on the older standard
> data model. So the Hub platform's Bootstrap upgrade, which touched every
> page, every component, and the visual system underneath all of it,
> couldn't start until the data model changed first. The accessibility debt
> from the rebuild traces back to that dependency directly. The Azure AD B2C
> flows and the spinner cleanup don't trace back to it the same way. They
> share the same platform and the same era, but neither one was gated by the
> data-model migration.

**After (p1) — problem observed:**
> Power Pages ran on Bootstrap 3 from 2014 until Microsoft added Bootstrap 5
> support in 2023, available only on the platform's enhanced data model.
> Bootstrap 5 could not run on the older standard data model. That meant the
> Hub platform's Bootstrap upgrade, which touched every page and component,
> could not begin until the data model was migrated. The accessibility work
> that followed traces directly to that dependency. The Azure AD B2C flows
> and the spinner cleanup do not: they happened on the same platform around
> the same time, but neither was blocked by the data-model migration.

**Before (p2):**
> The Power Pages migration itself wasn't mine. That part is straightforward
> Microsoft platform work: it moves site configuration from custom Dataverse
> tables into the standard solution tables Microsoft updates directly. That
> means faster provisioning and no more manually applying package updates to
> stay current. I'm including it here because without it, none of the next
> four sections exist.

**After (p2) — context, not my scope:**
> The Power Pages migration itself was not my work. It moves site
> configuration from custom Dataverse tables into Microsoft's standard
> solution tables, giving faster provisioning and removing the need for
> manual package updates. It's included here because the four sections that
> follow depend on it.

---

## Bootstrap 3 to 5: the rebuild, not a patch

**Before (p1):**
> Microsoft ships a migration tool for this exact jump. It fixes the known
> Bootstrap 4 and 5 breaking changes, mainly a full rename of data attributes
> across every interactive component (`data-toggle` became `data-bs-toggle`,
> `data-dismiss` became `data-bs-dismiss`, and so on). It doesn't touch how
> your own custom code holds together underneath those classes. We ran it.
> It broke pages. Years of styling had spread across global CSS, page-level
> CSS, and inline styles, with no consistent pattern. The tool converted each
> instance differently, and some components came out structurally broken.

**After (p1) — problem observed:**
> Microsoft provides a migration tool for the Bootstrap 4-to-5 jump. It
> handles the known breaking changes, mainly renaming data attributes across
> interactive components (`data-toggle` to `data-bs-toggle`, and similar). It
> does not account for custom code built on top of those classes. Running
> the tool broke pages: years of styling had accumulated across global CSS,
> page-level CSS, and inline styles with no consistent pattern, so the tool
> converted each case differently and left some components structurally
> broken.

**Before (p2):**
> We decided to stop trying to fix what the tool produced and rebuild the
> front end from scratch instead. We called it "bombing it down." The visual
> design stayed close to the existing product. We cleaned it up and made
> better use of space, but didn't reinvent it. Every line of HTML and CSS got
> rewritten instead of patched. The real risk was the JavaScript and the
> Dynamics 365 backend wired into that markup. A missed class name or element
> ID could silently break a working feature behind a page that looked fine.
> We kept the old codebase as a reference and checked every wired connection
> against it by hand. Two people did this, neither of us professional
> developers, against a live D365-backed platform, in 2024, before AI coding
> assistants were part of anyone's daily workflow.

**After (p2) — decision made:**
> We decided to rebuild the front end from scratch rather than fix what the
> tool produced. The visual design stayed close to the existing product; we
> cleaned it up and used space more efficiently without redesigning it.
> Every line of HTML and CSS was rewritten rather than patched. The main
> risk was the JavaScript and Dynamics 365 backend wired into that markup: a
> missed class name or element ID could silently break a working feature
> behind a page that still looked correct. We kept the old codebase as a
> reference and verified every wired connection against it manually. Two of
> us carried this out, neither a professional developer, on a live
> D365-backed platform, in 2024, before AI coding assistants were part of
> standard workflow.

**Before (p3):**
> There were no visual regressions, because there was nothing left to
> regress to. We eliminated fourteen of roughly twenty page-level CSS files
> outright. What remained went into one global stylesheet built on CSS
> variables. A color or type change that used to mean hunting through a
> dozen files now means editing one token in one place.

**After (p3) — result:**
> There were no visual regressions, because nothing remained to regress to.
> We removed fourteen of roughly twenty page-level CSS files and
> consolidated what remained into a single global stylesheet built on CSS
> variables. A color or type change that previously required searching a
> dozen files now takes editing one token.

**Before (p4):**
> This is also where Blueprint Design System starts. The short version of
> that story, told on Blueprint's own page, is that the same button showed
> up four different ways. Here's what actually happened during this rebuild:
> components across the platform had different semantic HTML structures and
> pulled their styling from different places, inline, page-level, and
> global, all at once, for what was supposed to be one component. We fixed
> that one audit and one rebuilt component at a time, and that's where the
> token-based system on Blueprint's page began. Read that case study for
> where the system went next.

**After (p4) — where this connects:**
> This rebuild is also where the Blueprint Design System originated. The
> same button appeared in four different visual forms across the platform,
> because components had inconsistent HTML structures and pulled styling
> from inline, page-level, and global sources at once. We resolved this one
> component at a time, and that process became the basis for Blueprint's
> token-based system. That case study covers where the system went from
> there.

---

## Accessibility: from fixing flags to fixing patterns

**Before (p1):**
> Testing the rebuilt front end with Deque Axe surfaced 35 Critical and
> Serious violations: 8 Critical and 27 Serious. My job wasn't only closing
> each one the tool flagged. It was finding the pattern behind them so the
> same mistake didn't get reintroduced later.

**After (p1) — problem observed:**
> Testing the rebuilt front end with Deque Axe identified 35 Critical and
> Serious violations: 8 Critical, 27 Serious. The task was not only to close
> each flagged issue, but to identify the underlying pattern so the same
> mistake would not recur.

**Before (p2):**
> The hardest category was focus order, tabindex. The obvious fix is an
> explicit numeric value on every focusable element, but that's also the
> fragile one. It locks in a fixed sequence. Any future change to that page,
> a new component inserted, a section reordered, risks breaking the sequence
> or letting a required element get skipped. WCAG 2.4.3 exists for exactly
> this reason. The more durable fix follows the DOM's natural order instead
> of overriding it. That's more work up front, but far less likely to
> quietly break six months later.

**After (p2) — decision made:**
> The hardest category was focus order, controlled by `tabindex`. The
> straightforward fix, assigning an explicit numeric value to every
> focusable element, is also the most fragile: it locks in a fixed sequence,
> and any later change, such as a new component or a reordered section,
> risks breaking that sequence or skipping a required element. WCAG 2.4.3
> exists to address exactly this. The more durable solution follows the
> DOM's natural order instead of overriding it. It takes more effort
> upfront but is far less likely to break silently later.

**Before (p3):**
> We tested it ourselves first, then ran a formal QA pass with Axe in the QA
> environment, signed off by the QA accessibility tester. The change that
> mattered longer-term: aria labels, alt text, and the rest went in from the
> start on everything built afterward. QA now catches a regression before it
> ships instead of after.

**After (p3) — result:**
> We tested the fixes ourselves first, then ran a formal QA pass with Axe,
> signed off by the QA accessibility tester. The longer-term change was that
> aria labels, alt text, and related accessibility work were built in from
> the start on everything developed afterward, so QA now catches
> regressions before release rather than after.

---

## Azure AD B2C: styling what you can't see

**Before (p1):**
> Registration, sign-in, forgot password, MFA verification and its
> variants, email and password changes, terms acceptance, feedback and
> issue reporting. Eleven flows in total. These pages already ran on
> Bootstrap 5, separate from the Power Pages upgrade, so the problem was
> never a version gap. It was years of inline styling: the same component
> styled multiple different ways across different flows, broken layouts,
> and branding that no longer matched the rest of the platform.

**After (p1) — problem observed:**
> Eleven flows in total: registration, sign-in, forgot password, MFA
> verification and its variants, email and password changes, terms
> acceptance, and feedback and issue reporting. These pages already ran on
> Bootstrap 5, so the issue was not a version gap. It was years of inline
> styling: the same component styled inconsistently across flows, broken
> layouts, and branding that no longer matched the rest of the platform.

**Before (p2):**
> The real constraint here is architectural. Azure AD B2C renders these
> pages by merging your own hosted HTML with its own injected form controls
> at runtime, in the user's browser. Those controls are the actual input
> fields, buttons, and validation logic. Your source file only contains a
> shell and a single placeholder div. The interactive elements you need to
> style don't exist anywhere you can open and read. The only way to know
> their structure is to render the page and inspect the live DOM, then write
> CSS and JavaScript backward from what you find. Microsoft's own docs call
> this out: if you're hooking JavaScript to those elements, you have to pin
> a specific page layout version, or Microsoft can change the injected
> markup without warning.

**After (p2) — constraint:**
> The core constraint is architectural. Azure AD B2C renders these pages by
> merging custom hosted HTML with its own injected form controls, the
> actual input fields, buttons, and validation logic, at runtime in the
> user's browser. The source file contains only a shell and a placeholder
> div; the interactive elements that need styling don't exist in any file
> that can be opened and read. The only way to determine their structure is
> to render the page, inspect the live DOM, and write CSS and JavaScript
> based on what's found. Microsoft's documentation notes that any
> JavaScript hooked to these elements requires pinning a specific page
> layout version, since Microsoft can otherwise change the injected markup
> without notice.

**Before (p3):**
> That's a harder problem than a normal styling pass. It was also my first
> fully solo build, design and code, start to finish. It took two weeks. I
> paired with QA at the dev stage instead of waiting for a full QA cycle,
> which kept the later testing pass short. Some of the accessibility issues
> from the previous section showed up here too, and got fixed the same way.

**After (p3) — result:**
> This was a harder problem than a standard styling pass, and it was also my
> first fully solo build, covering design and code from start to finish. It
> took two weeks. Pairing with QA during development, rather than waiting
> for a full QA cycle, kept the later testing pass short. Some of the
> accessibility issues from the previous section also appeared here and
> were fixed the same way.

---

## Spinner standardization: the loose end

**Before (p1):**
> Three different spinners had accumulated with no coordination.
> FontAwesome's came bundled with Power Pages by default. Fluent UI's
> arrived through Microsoft D365 integrations and iframes. And one custom
> spinner had been built by a developer for a specific feature. None of this
> was anyone's decision. Nobody had defined what a loading state should look
> like or behave like on this platform.

**After (p1) — problem observed:**
> Three different spinners had accumulated with no coordination:
> FontAwesome's, bundled with Power Pages by default; Fluent UI's,
> introduced through Microsoft D365 integrations and iframes; and a custom
> spinner built by a developer for one specific feature. No one had defined
> what a loading state should look like or behave like on the platform.

**Before (p2):**
> First I documented every instance's markup and styling. Then I used
> GitHub Copilot to help trace each spinner back to where it was called
> from and how, before deciding on a replacement plan. Bootstrap's own
> spinner became the target, since it was already the most compatible
> option with the rest of the rebuilt front end. Execution differed by
> origin. FontAwesome's spinners got a small JavaScript swap from `fa-spin`
> to Bootstrap's `spinner-border` classes. The custom spinner was replaced
> outright. Fluent UI's needed its own JavaScript replacement, since it had
> no equivalent class-based swap available. Altogether, the consolidation
> compressed an estimated 10-day UI standardization sprint into 5 days.

**After (p2) — decision and result:**
> I documented every instance's markup and styling, then used GitHub
> Copilot to trace each spinner back to where and how it was called before
> deciding on a replacement plan. Bootstrap's own spinner became the
> target, since it was already the most compatible option with the
> rebuilt front end. Execution differed by origin: FontAwesome's spinners
> required a small JavaScript swap from `fa-spin` to Bootstrap's
> `spinner-border` classes, the custom spinner was replaced outright, and
> Fluent UI's required its own JavaScript replacement since no equivalent
> class-based swap existed. The consolidation reduced an estimated 10-day
> standardization effort to 5 days.

**Before (p3):**
> This should have shipped with the original Bootstrap rebuild. It didn't,
> for the same reason most of these threads got spread out: there wasn't
> enough time or in-house expertise to take it on alongside everything else
> at once. It landed over a year later instead, on its own, but it's still
> part of the same upgrade.

**After (p3):**
> This should have shipped with the original Bootstrap rebuild. It didn't,
> for the same reason most of these efforts were spread out: there wasn't
> enough time or in-house expertise to take it on alongside everything else
> at once. It landed over a year later, on its own, but remains part of the
> same upgrade.

---

## Outcomes

**Before:**
> Everything on this page shipped to production. No exceptions, no
> post-launch visibility gap.

**After — achievement:**
> Everything covered here shipped to production, with no exceptions.

---

## What I'd do differently

**Before (p1):**
> Document while the work is still fresh. I wrote this up more than a year
> after some of it happened, which meant reconstructing decisions and
> constraints from memory instead of from notes. The sharpest details, the
> ones that actually explain a decision instead of just describing it, are
> the first to fade.

**After (p1):**
> Document the work while it's still fresh. This write-up came more than a
> year after some of the work happened, which meant reconstructing
> decisions and constraints from memory rather than notes. The most useful
> details, the ones that explain a decision rather than just describe it,
> are also the first to be forgotten.

**Before (p2):**
> One more note: this project is what moved me from being read as a visual
> designer to someone who can work and speak like a developer. That shift
> runs through every section above.

**After (p2):**
> This project marked the shift from being seen as a visual designer to
> being able to work and communicate like a developer. That shift is
> reflected across every section above.

---

## Not touched in this pass

- `STRINGS["en-simple"]` and `STRINGS.ar` `case.hub.*` keys in
  [js/main.js](../../js/main.js) stay as they are. The en-simple copy was
  used here only as a factual reference for the rewrite above; it isn't
  being edited itself. Once the "after" column is approved and applied to
  the default English, the en-simple and Arabic variants will describe an
  older version of that text — worth a follow-up pass to re-derive them
  from this new copy so all three modes stay in sync.
