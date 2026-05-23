# BSD XR Web Coding Standards — Claude

You are working on a BSD XR web project. Bit Space Development Ltd. builds precision-built web applications. Apply these standards to all code you write or modify.

---

## FORMATTING

- Files and folders: lowercase first character. React components: `PascalCase.tsx`.
- Max 80 characters per line.
- Max 3 levels of conditional nesting. Use guard clauses.
- Descriptive identifiers only. Loop indices may be `i`, `j`, `k`.
- All public functions require doc block comments.

## CSS

- Kebab-case class names. No `!important`. No inline styles.
- Centralize font and color declarations — one source per project.
- Use `em`/`rem`/`%`/`vw`/`vh` over `px` for responsive units.
- Use Flexbox and CSS Grid for layout.
- SVG for icons and logos.

## JAVASCRIPT / TYPESCRIPT

- `const` or `let`. Never `var`. No globals.
- Arrow functions preferred: `const fn = () => {}`.
- `empty string` not `null` for strings. `[]` not `null` for arrays.
- Avoid `any`. Acceptable only for third-party package integration.
- Set up ESLint and Prettier at project start. Commit `.prettierrc.json`.
- Types start with a lowercase letter.

## REACT

- Functional components only. No class components.
- One component per file.
- Never mutate state directly.
- Remove event handlers when no longer needed.
- Ternaries: max 2 in components under 60 lines. Refactor to named methods otherwise.
- Folder structure: `/src`, `/app`, `/common`, `/features/[feature]/`.

## REDUX

- Redux Toolkit only. Not standard Redux.
- Name slices after the data they store.
- Reset and dispose state properly on component destroy.

## API CALLS

- Under 3 params: query string is acceptable.
- 3+ params: use `FormData` or request body object. Never long query strings.
- Use nouns in endpoint paths. Plural for collections (`/posts`, `/users`).
- Correct HTTP verbs: GET/POST/PUT/PATCH/DELETE.
- Use the BSD Response Object for Unity-facing APIs.

## BACKEND (C# / .NET)

- Controller naming: `[REQUEST_TYPE][Category]Controller.cs`
- Newline braces. One variable per statement.
- `lowerCamelCase` for variables. `UpperCamelCase` for classes.
- No empty `if` statements. No commented-out code.
- Use CSharpier for formatting.
- Entity Framework: no Table Per Hierarchy, no Owned Types, `Id` on every record.

## SQL

- Pascal Case identifiers. Singular table names. No repeated table names in column names.
- Join tables: `TableA_TableB`. Integer primary keys.

## BRANCHES

- `feature/description`, `bugfix/description`, `config/description`, `migration/description`
- One feature per branch. Delete on completion.

## FILE LIMITS

- Frontend files: warn at 250 lines, reject at 500.
- Backend C# scripts: target under 200 lines, hard limit 500.

---

## PROJECT — XR WORKSHOP PRESENTATION

This project is an interactive, web-based XR workshop presentation for BSD XR. 1-hour format, 5 sections, 20 slides. Built with vanilla HTML/CSS/JS + Three.js (no build step).

### Running

```bash
python3 -m http.server 8080
# Open: http://localhost:8080
```

ES modules require a local server (file:// won't work).

### Navigation

- `→` / `Space` — next slide
- `←` — previous slide
- Section dots — jump to section
- `Home` / `End` — first / last slide

### Structure

```
index.html          — All 20 slides
css/style.css       — BSD XR design system + slide layout
js/main.js          — Navigation + Three.js demo lifecycle
js/demos/
  hero.js           — Title slide scene
  vr.js             — VR visualization
  ar.js             — AR visualization
  demo1–5.js        — Progressive Three.js experience build
  ai-scene.js       — Neural network visualization
  end.js            — Closing slide scene
bsd-branding-repo/  — Brand assets (submodule)
bsdxr-ai-agent-skills/ — XR agent skills (submodule)
bsd-standards-qa/   — Coding standards (submodule)
.claude/agents/     — xr-educator.md, xr-researcher.md, xr-safety-manager.md
```

### Sections

| # | Section | Slides |
|---|---|---|
| 0 | Intro | 0–2 |
| 1 | VR / AR | 3–6 |
| 2 | Designing an Experience | 7–12 |
| 3 | Opportunity | 13–15 |
| 4 | Generative AI in XR | 16–19 |

### Adding intro images

Edit slide 1 (`data-slide="1"`) in `index.html`. Replace `.image-placeholder` divs with `<img>` tags. Place images in `assets/`.

### Three.js version

`three@0.160.0` via jsDelivr CDN with importmap. No npm, no bundler.

### Agent skills active

- `xr-educator` — workshop design, facilitation, hardware recommendations
- `xr-researcher` — XR research applications, study design
- `xr-safety-manager` — HSE/safety training design, hazard scenarios, industrial XR

---

*BSD XR — Immersive Technology Experts | bsdxr.com*
