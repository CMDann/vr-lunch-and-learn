# PAINT THE VOID — BSD XR Workshop Presentation

**Live demo:** [cmdann.github.io/vr-lunch-and-learn](https://cmdann.github.io/vr-lunch-and-learn/)

An interactive, browser-based XR workshop presentation by Bit Space Development Ltd. (BSD XR). Covers the full XR spectrum from foundational concepts through hands-on VR art creation with OpenBrush.

**Format:** 1 hour / 2 parts / 36 slides

---

## Quick Start

```bash
python3 -m http.server 8080
# Open: http://localhost:8080
```

ES modules require a local server — `file://` will not work.

---

## Navigation

| Input | Action |
|---|---|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| Section dots | Jump to section |
| `Home` / `End` | First / last slide |
| `◑` button | Toggle light / dark mode |

---

## Structure

```
index.html                    — All 36 slides, single-file
css/style.css                 — BSD XR design system + slide layout
js/main.js                    — Navigation, theme toggle, demo lifecycle
js/demos/
  hero.js                     — Title slide: animated star field + shapes
  vr.js                       — VR slide: immersive wireframe room interior
  ar.js                       — AR slide: holographic objects on grid
  demo1.js                    — Stage 1: empty Three.js scene
  demo2.js                    — Stage 2: geometry (wireframe shapes)
  demo3.js                    — Stage 3: lighting + PBR materials
  demo4.js                    — Stage 4: raycasting interaction
  demo5.js                    — Stage 5: full experience (fog, particles)
  assets.js                   — Solid vs wireframe asset comparison
  ai-scene.js                 — Neural network visualization
  andy.js                     — OpenBrush GLB export viewer
  end.js                      — Closing slide scene
assets/                       — Images, GLB files, QR code
bsd-branding-repo/            — Brand assets (git submodule)
bsdxr-ai-agent-skills/        — XR agent skills (git submodule)
bsd-standards-qa/             — Coding standards (git submodule)
.claude/agents/               — xr-educator.md, xr-researcher.md, xr-safety-manager.md
docs/                         — Presentation content as markdown
```

---

## Sections

| # | Section | Slides | Topic |
|---|---|---|---|
| 0 | Intro | 0–2 | BSD XR + presenter intro |
| 1 | VR / AR | 3–6 | The XR spectrum, VR, AR, presence science |
| 2 | Designing an Experience | 7–15 | Design principles, interaction, live Three.js build |
| 3 | Opportunity | 16–18 | Careers, Manitoba ecosystem, what you can build |
| 4 | Generative AI in XR | 19–23 | AI convergence, live AI demo, closing |
| 5 | Hands-On Session | 24–35 | Meta Quest + OpenBrush activities |

---

## Tech Stack

- **Three.js** `0.160.0` via jsDelivr CDN — no bundler, no npm
- **ES modules** via `<script type="importmap">`
- **Vanilla HTML/CSS/JS** — no framework
- **GLTFLoader + OrbitControls** from Three.js addons
- **Space Mono** typeface (Google Fonts)

---

## Light / Dark Mode

The `◑` button in the nav bar toggles between dark and light themes. It dispatches a `CustomEvent('themechange', { detail: { light } })` that all active Three.js demos listen for and respond to — background, fog, materials, grid colours, and overlay gradients all adapt.

The Andy slide (OpenBrush GLB viewer) is intentionally locked to dark mode because OpenBrush brush materials use additive blending optimised for dark backgrounds.

---

## 3D Assets

Assets live in `assets/`. The following GLB files are used:

| File | Description | Used in |
|---|---|---|
| `Andy.glb.bytes` | OpenBrush export — figure | Slide 34 |
| `G_VikingSword.glb` | Viking sword prop | Slide 13 |
| `G_VikingShield_Knot1_Yellow-Black.glb` | Viking shield prop | Slide 13 |
| `SM_EagleFeather_GLB_1.glb` | Eagle feather prop | Slide 13 |

---

## Agent Skills

Three custom Claude agent skills are active in `.claude/agents/`:

- **xr-educator** — workshop design, facilitation, hardware recommendations
- **xr-researcher** — XR research applications, study design
- **xr-safety-manager** — HSE/safety training, hazard scenarios, industrial XR

---

## BSD XR Open Source

BSD XR maintains free public resources used in this project:

- **[bsdxr-ai-agent-skills](https://github.com/BitSpaceDevelopment/bsdxr-ai-agent-skills)** — Claude agent skill definitions for XR education, research, and safety
- **[bsd-branding-repo](https://github.com/BitSpaceDevelopment/bsd-branding-repo)** — BSD XR brand assets: logos, icons, colour tokens

---

## Docs

Presentation content is documented in [`/docs`](docs/):

- [Workshop Overview](docs/overview.md)
- [Section 0 — Introduction](docs/section-00-intro.md)
- [Section 1 — VR & AR](docs/section-01-vr-ar.md)
- [Section 2 — Designing an Experience](docs/section-02-designing.md)
- [Section 3 — Opportunity](docs/section-03-opportunity.md)
- [Section 4 — Generative AI in XR](docs/section-04-ai-in-xr.md)
- [Section 5 — Hands-On Session](docs/section-05-hands-on.md)

---

## Standards

Built to [BSD XR coding standards](CLAUDE.md). Key constraints:

- No build step — ES modules, CDN only
- `const`/`let` only, no globals
- Max 80 chars per line
- All Three.js demos respond to `themechange` events
- 72 FPS minimum target

---

*BSD XR — Immersive Technology Experts | [bsdxr.com](https://bsdxr.com)*
