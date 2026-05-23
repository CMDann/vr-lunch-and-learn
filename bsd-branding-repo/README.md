# BSD XR Brand Guide

**Live:** [bitspacedevelopment.github.io/bsd-branding-repo](https://bitspacedevelopment.github.io/bsd-branding-repo/)

![BSD XR — Immersive Technology Experts](BSDXR%20Promo.png)

Interactive brand reference for Bit Space Development Ltd. (BSD XR). Single-page, zero-dependency — deploys directly to GitHub Pages or Vercel.

---

## What's Inside

| Section | Contents |
|---|---|
| Overview | Company summary, founding info, specialisations |
| Colours | Interactive swatches for both dark and light themes — click any swatch to copy the hex value |
| Typography | Space Mono type scale, letter-spacing reference, font import snippet |
| Logo | Both logo variants on correct backgrounds, usage do/don't rules |
| Icons | iOS, Android, App Store, Play Store, and favicon assets |
| Components | Live interactive buttons, inputs, filter toggles, data rows, status badges |
| Principles | All 8 non-negotiable design rules |
| Voice & Tone | Brand voice attributes with writing examples |
| For AI Agents | Downloadable brand files and instructions for AI agent workflows |

---

## Files

```
bsd-branding-repo/
├── index.html            # Self-contained SPA (HTML + CSS + JS, no build step)
├── BSDXR Promo.png       # Featured promo image
├── branding.md           # Source-of-truth brand spec in Markdown
├── brand-voice.md        # Voice and tone guide for AI agents and copywriters
├── agent-guide.md        # AI agent instructions — assets, tokens, component reference
├── theme.json            # Brand tokens in JSON (colours, typography, logos)
├── vercel.json           # Vercel routing config for SPA
├── logos/
│   ├── logo-dark.png     # White wordmark + gradient XR — use on dark backgrounds
│   └── logo-light.png    # Black wordmark + gradient XR — use on light backgrounds
├── icons/
│   ├── favicon.png       # Browser favicon
│   ├── BSDXR Icon.png    # Source icon
│   ├── appstore.png      # iOS App Store (1024x1024)
│   ├── playstore.png     # Google Play Store (512x512)
│   ├── Assets.xcassets/  # iOS / macOS / watchOS full icon set
│   └── android/          # Android mipmap density buckets (mdpi → xxxhdpi)
└── ref/
    ├── dark.png          # Reference screenshot — dark mode
    └── light.png         # Reference screenshot — light mode
```

---

## Brand Tokens

### Dark Mode (default)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0a0a0a` | Page background |
| `surface` | `#111111` | Cards, panels |
| `surface-2` | `#181818` | Elevated surfaces |
| `border` | `#222222` | Default borders |
| `border-light` | `#333333` | Hover borders |
| `text` | `#e5e5e5` | Primary text |
| `muted` | `#666666` | Labels, captions |
| `accent` | `#ffffff` | CTAs, active states |

### Light Mode

| Token | Hex | Usage |
|---|---|---|
| `background` | `#eeeeee` | Page background |
| `surface` | `#e4e4e4` | Cards, panels |
| `surface-2` | `#dadada` | Elevated surfaces |
| `border` | `#cccccc` | Default borders |
| `border-light` | `#bbbbbb` | Hover borders |
| `text` | `#111111` | Primary text |
| `muted` | `#777777` | Labels, captions |
| `accent` | `#1b4fd8` | CTAs, active states |

### Brand Gradient (XR mark only)

```
linear-gradient(90deg, #1b3d9e 0%, #00a8e8 100%)
```

This gradient is reserved exclusively for the XR mark in the logo. Never use it in UI elements.

---

## Typography

**Font:** Space Mono (Google Fonts)
**Weights:** 400, 700
**Rules:** Uppercase everywhere. Wide letter-spacing (`0.12em`–`0.25em`). Monospace at all sizes.

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
```

---

## Design Rules

1. **No rounded corners** — sharp 90° edges everywhere
2. **1px borders only** — never thicker
3. **No shadows** — no `box-shadow` or `drop-shadow`
4. **No UI gradients** — flat surfaces only; XR gradient is the sole exception
5. **Monospace everywhere** — Space Mono at all sizes
6. **Minimal colour** — accent on interactive elements only, never decorative
7. **Uppercase always** — all user-facing text
8. **Sparse layouts** — generous whitespace

---

## Theme Implementation

Themes are controlled via a `light` class on `<html>`. All colour values are CSS custom properties using space-separated RGB channels for Tailwind opacity support.

```css
:root {
  --color-background: 10 10 10;
  --color-accent:     255 255 255;
  /* ... */
}
:root.light {
  --color-background: 238 238 238;
  --color-accent:     27 79 216;
  /* ... */
}
```

```js
// Toggle
document.documentElement.classList.toggle('light');

// Persist
localStorage.setItem('bsdxr-theme', 'light' | 'dark');
```

To prevent flash-of-dark on light preference, add this inline before any scripts in `<head>`:

```html
<script>
  try {
    if (localStorage.getItem('bsdxr-theme') === 'light')
      document.documentElement.classList.add('light');
  } catch(e) {}
</script>
```

---

## For AI Agents

Three structured files are included for AI agent and LLM consumption:

| File | Purpose |
|---|---|
| [`agent-guide.md`](./agent-guide.md) | Technical reference — file structure, tokens, logo rules, component patterns, icon guide |
| [`brand-voice.md`](./brand-voice.md) | Writing guide — tone, style rules, do/don't examples, sector terminology |
| [`branding.md`](./branding.md) | Full brand specification in Markdown |
| [`theme.json`](./theme.json) | Machine-readable colour and typography tokens |

To use with an AI agent: include `agent-guide.md` in your system prompt for UI generation, or `brand-voice.md` for content generation.

---

## Deploy

### GitHub Pages

Push to the `main` branch. Enable GitHub Pages in repo settings → source: `main` / root.

```bash
git add .
git commit -m "Update brand guide"
git push origin main
```

### Vercel

```bash
npx vercel
```

No build step. `vercel.json` handles SPA routing.

---

## Logo Rules

- Never flatten the XR gradient to a single colour
- Never place the dark logo on a light background (or vice versa)
- Maintain clear space equal to the cap-height of "B" on all sides
- Never stretch, rotate, skew, or add effects
- Tagline "IMMERSIVE TECHNOLOGY EXPERTS" may appear below or be omitted — never rearranged

---

## Contact

| | |
|---|---|
| Website | [bsdxr.com](https://bsdxr.com) |
| Contact | [bsdxr.com/contact](https://bsdxr.com/contact) |
| Email | info@bsdxr.com |
| Location | Winnipeg, Manitoba, Canada |
| Founded | 2015 |
