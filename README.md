# Rolan Gomes — Portfolio

Design Systems · Accessibility · AI-assisted design-to-code. Plain HTML/CSS/JS,
zero build step, WCAG 2.2 AA, RTL-ready.

## Run locally

No install needed. Either:

```bash
npx serve .          # then open the printed URL
```

or use the VS Code **Live Server** extension. (Opening `index.html` directly
also works, but a local server behaves closer to production.)

## Working with Claude Code

1. Open a terminal in this folder and run `claude`.
2. Claude Code reads `CLAUDE.md` automatically — it contains all the rules
   (tokens, logical properties, accessibility, RTL, security).
3. Install the agent skills once:

```bash
npx skills add jakubkrehel/skills
npx skills add emilkowalski/skills
```

### Good first prompts

- "Review index.html against docs/ACCESSIBILITY-RTL-CHECKLIST.md sections A, C,
  and E, and fix anything that fails."
- "Duplicate the case study template into work/wcag-remediation.html using the
  WCAG project details from my resume, and wire up the tile + prev/next links."
- "Use the better-typography skill to review the type scale on index.html."
- "Add a privacy-friendly contact section to the footer per CLAUDE.md rule 5."

### Rules of thumb

- One change per request; review the diff before accepting.
- Ask Claude to state which checklist items it verified.
- Replace every `<!-- PLACEHOLDER -->` before deploying — search the repo for it.

## Deploy

Any static host works. Simplest path: push to GitHub → enable GitHub Pages
(Settings → Pages → deploy from `main`). Vercel/Netlify: import the repo,
framework preset "Other", no build command, output directory `.`.

## Docs

- `CLAUDE.md` — rules Claude Code must follow
- `docs/DESIGN-GUIDELINES.md` — visual spec (tokens, type, grid, motion)
- `docs/ACCESSIBILITY-RTL-CHECKLIST.md` — pre-release testing
- `docs/CONTENT-GUIDE.md` — adding case studies, image specs, tone
