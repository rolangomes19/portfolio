# Blueprint Design System — structural edit findings

Working file only, not linked from the site. Supersedes the earlier draft
in this file, which took the wrong approach: rewriting every paragraph's
wording in place. Per feedback, that's the wrong unit of work — most of
this document is dense *because* it's documenting distinct technical
decisions (typography, tokens, spacing, color, elevation, each component),
not because it's padded. Line-editing already-necessary sentences doesn't
make the piece easier to read; it just makes each paragraph slightly
shorter while leaving the same shape.

The right edit is structural: read the whole piece and find what's
**actually repeated across sections** — the same explanation given twice —
and cut or merge that. Everything else stays as-is, including the
"subatomic layer" / protons-and-electrons explanation of how Foundations
relates to Atoms — that's flagged as essential, not dramatics: it's the
concrete mechanism that makes an otherwise abstract distinction click.

## What's actually redundant

Reading the article end to end (not paragraph by paragraph) surfaced two
real duplications — the same explanation stated fully twice in different
sections:

### 1. The Foundations transition is stated twice, almost verbatim

At the end of **Composition model: Atomic Design**, right before the
`<h2>Foundations</h2>` heading:

> Foundations, covered next, is the subatomic layer: the raw material
> every atom in the system is built from.

Then the very next paragraph, immediately after that heading:

> This is the subatomic layer: the raw material every atom in the
> component kit is built from. None of it is directly usable in a UI on
> its own; a font-weight primitive or a shadow value only becomes
> something a user interacts with once it's assembled into an atom like
> Button or Input.

Same claim, back to back, across a single section break. **Fix:** cut the
first one (`case.hub.foundationsBridge` → `case.bds.foundationsBridge`)
entirely. The heading itself is the transition; the second paragraph
already does the explaining. No information is lost — it's a literal
repeat, not two different points.

### 2. The icon-only-button accessibility mechanism is explained fully twice

In **Atom: Button** (p4):

> An icon-only button has no visible text, so it needs help on two fronts
> at once: an `aria-label` for screen readers, and a visible tooltip for
> anyone navigating by keyboard who can see the screen but has no text
> label to read. I didn't want that to depend on someone remembering to
> add both, so the TypeScript types won't even compile without them, and
> the component wraps itself in a Tooltip automatically whenever
> `iconOnly` is true. Nobody has to remember the pattern; it's just how
> the component works.

Then in **Molecule: Icon-only Button + Tooltip** (p2), a few paragraphs
later:

> The pairing isn't optional or left to whoever's building the screen to
> remember. The component's TypeScript types won't compile for an
> icon-only button unless both `aria-label` and `tooltip` are supplied,
> and the component wraps itself in the Tooltip atom automatically
> whenever `iconOnly` is `true`. The molecule is enforced at the type
> level, not just documented in prose.

Same mechanism (type-level enforcement of `aria-label` + `tooltip`),
explained in full a second time. **Fix:** keep Button p4 exactly as it
is — that's its natural home, first mention. Shorten Molecule p2 to point
back to it instead of re-deriving the mechanism:

**Proposed replacement for Molecule p2:**
> That pairing isn't optional or left to memory: as covered in the Button
> section, the component's types won't compile without both `aria-label`
> and `tooltip`, and it wraps itself in the Tooltip atom automatically.
> The molecule is enforced at the type level, not just documented in
> prose.

## What I checked and left alone

I looked for other cross-section repeats and didn't find genuine ones —
these looked similar on the surface but each pair is doing different
work, so I'm not touching them:

- **Facts-bar Team list vs. the pull-quote** about Nabarun/Satvik's roles
  — the list states *who*, the quote explains *how authority was split*.
  Complementary, not repeated.
- **Status callout's 80% LLM stat vs. Outcomes' 80% stat vs. Alignment
  section's 80% mention** — the same number recurs three times, but each
  use makes a different argument (adoption status, measured outcome,
  evidence for a naming-alignment claim). That's normal reuse of one fact,
  not restating the same explanation.
- **"Two phases" narrative vs. the status callout's Phase 1/Phase 2
  lines** — the callout gives what/when, the prose explains why the pivot
  happened. Different content, same facts.
- **Templates/Table sections restating "below Pages, above Organisms" /
  "foundations before atoms before molecules"** — these apply the
  Atomic Design ordering (established once, up top) to a specific new
  component. Expected reinforcement, not duplicate explanation.

## Net effect

Two paragraphs actually change: one gets cut (`foundationsBridge`), one
gets shortened to a cross-reference (`molecule.p2`). Everything else in
the case study — including the subatomic/atoms metaphor — stays exactly
as it is, because it's each documenting something distinct and doesn't
repeat elsewhere.

Ready to apply these two changes to
[work/blueprint-design-system.html](../../work/blueprint-design-system.html)
and the matching keys in [js/main.js](../../js/main.js) on your go-ahead.
