# BSD XR Branding Repo — Agent Guide

> Instructions for AI agents, LLMs, and automated systems using this repository.

---

## What this repo contains

This repository is the canonical source for all BSD XR brand assets, guidelines, and design system specifications. Use it to:

- Implement the BSD XR visual identity in any UI or application
- Generate on-brand copy and content
- Reference correct logo files, colour tokens, and typography rules
- Understand the design principles and component patterns

---

## Repository structure

```
bsd-branding-repo/
├── index.html                    ← Live brand guide (hosted reference)
├── branding.md                   ← Full brand specification in markdown
├── brand-voice.md                ← Voice and tone guide for written content
├── agent-guide.md                ← This file — instructions for AI agents
├── theme.json                    ← Machine-readable colour and type tokens
├── logos/
│   ├── logo-dark.png             ← White wordmark + gradient XR (use on dark backgrounds)
│   └── logo-light.png            ← Black wordmark + gradient XR (use on light backgrounds)
├── icons/
│   ├── favicon.png               ← Browser favicon
│   ├── appstore.png              ← iOS App Store icon (1024x1024)
│   ├── playstore.png             ← Google Play Store icon (512x512)
│   ├── Assets.xcassets/
│   │   └── AppIcon.appiconset/   ← Full iOS / macOS / watchOS icon set (all sizes)
│   └── android/
│       ├── mipmap-mdpi/          ← 48x48
│       ├── mipmap-hdpi/          ← 72x72
│       ├── mipmap-xhdpi/         ← 96x96
│       ├── mipmap-xxhdpi/        ← 144x144
│       └── mipmap-xxxhdpi/       ← 192x192
└── ref/
    ├── dark.png                  ← Reference screenshot — dark theme
    └── light.png                 ← Reference screenshot — light theme
```

---

## Colour tokens

Read from `theme.json` for machine-readable tokens. The design system uses CSS custom properties with space-separated RGB channels for Tailwind CSS opacity modifier compatibility.

### Dark mode (default)

| Token | Hex | RGB |
|---|---|---|
| `--color-background` | `#0a0a0a` | `10 10 10` |
| `--color-surface` | `#111111` | `17 17 17` |
| `--color-surface-2` | `#181818` | `24 24 24` |
| `--color-border` | `#222222` | `34 34 34` |
| `--color-border-light` | `#333333` | `51 51 51` |
| `--color-text` | `#e5e5e5` | `229 229 229` |
| `--color-muted` | `#666666` | `102 102 102` |
| `--color-accent` | `#ffffff` | `255 255 255` |

### Light mode

| Token | Hex | RGB |
|---|---|---|
| `--color-background` | `#eeeeee` | `238 238 238` |
| `--color-surface` | `#e4e4e4` | `228 228 228` |
| `--color-surface-2` | `#dadada` | `218 218 218` |
| `--color-border` | `#cccccc` | `204 204 204` |
| `--color-border-light` | `#bbbbbb` | `187 187 187` |
| `--color-text` | `#111111` | `17 17 17` |
| `--color-muted` | `#777777` | `119 119 119` |
| `--color-accent` | `#1b4fd8` | `27 79 216` |

### Brand gradient (XR mark only)

```css
linear-gradient(90deg, #1b3d9e 0%, #00a8e8 100%)
```

This gradient is reserved exclusively for the XR mark in the logo. Do not use it anywhere else.

---

## Logo selection rules

| Background | File to use |
|---|---|
| Dark (`#0a0a0a` to approx. `#333333`) | `logos/logo-dark.png` |
| Light (`#bbbbbb` to `#ffffff`) | `logos/logo-light.png` |

**Critical rules:**
- Never use `logo-dark.png` on a light background.
- Never use `logo-light.png` on a dark background.
- Never apply transforms, filters, or effects to the logo.
- Never flatten the XR gradient to a single colour.
- Maintain clear space equal to the cap-height of "B" on all sides.

---

## Typography

- **Font family:** `'Space Mono', monospace`
- **Import:** `https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap`
- **All UI text:** uppercase (`text-transform: uppercase`)
- **Letter spacing:** `0.12em` minimum; `0.2em`–`0.25em` for labels and nav
- **Weights:** 400 (regular), 700 (bold)
- **No other fonts.** Space Mono at all sizes.

---

## Design constraints (non-negotiable)

When generating any BSD XR UI:

1. `border-radius: 0` everywhere — no rounded corners.
2. `border-width: 1px` — never thicker.
3. No `box-shadow` or `drop-shadow`.
4. No gradients in UI elements (the XR gradient is logo-only).
5. All text uppercase in UI contexts.
6. Accent colour only on interactive elements (buttons, links, active states).
7. Font: Space Mono only.
8. Generous whitespace — sparse, structured layouts.

---

## Component quick reference

### Button classes (Tailwind)

```
Primary:  border border-accent text-accent px-4 py-1.5 uppercase tracking-widest text-xs
          hover:bg-accent hover:text-background

Ghost:    border border-border text-muted px-4 py-1.5 uppercase tracking-widest text-xs
          hover:border-border-light hover:text-text

Danger:   border border-red-900 text-red-500 px-4 py-1.5 uppercase tracking-widest text-xs
          hover:bg-red-950
```

### Input classes

```
bg-surface border border-border text-text font-mono text-sm px-3 py-2 outline-none
focus:border-border-light
```

### Badge classes

```
Published: border border-green-800 text-green-500 px-1.5 py-0.5 text-[10px] uppercase tracking-widest
Draft:     border border-border text-muted px-1.5 py-0.5 text-[10px] uppercase tracking-widest
```

---

## Theme implementation

```css
:root {
  --color-background: 10 10 10;
  --color-surface:    17 17 17;
  /* see theme.json for full token set */
}

:root.light {
  --color-background: 238 238 238;
  --color-surface:    228 228 228;
  /* ... */
}
```

Toggle theme by adding/removing the `light` class on `<html>`.
Persist with `localStorage.setItem('bsdxr-theme', 'light' | 'dark')`.
Initialise before render to prevent flash:

```html
<script>
  try {
    if (localStorage.getItem('bsdxr-theme') === 'light')
      document.documentElement.classList.add('light');
  } catch(e) {}
</script>
```

---

## Icon selection guide

| Use case | File |
|---|---|
| Browser favicon | `icons/favicon.png` |
| iOS home screen (iPhone @3x) | `icons/Assets.xcassets/AppIcon.appiconset/180.png` |
| iOS iPad (@2x) | `icons/Assets.xcassets/AppIcon.appiconset/152.png` |
| iOS iPad Pro (@2x) | `icons/Assets.xcassets/AppIcon.appiconset/167.png` |
| iOS App Store submission | `icons/appstore.png` (1024x1024) |
| Android launcher (mdpi) | `icons/android/mipmap-mdpi/ic_launcher.png` (48x48) |
| Android launcher (hdpi) | `icons/android/mipmap-hdpi/ic_launcher.png` (72x72) |
| Android launcher (xhdpi) | `icons/android/mipmap-xhdpi/ic_launcher.png` (96x96) |
| Android launcher (xxhdpi) | `icons/android/mipmap-xxhdpi/ic_launcher.png` (144x144) |
| Android launcher (xxxhdpi) | `icons/android/mipmap-xxxhdpi/ic_launcher.png` (192x192) |
| Google Play Store submission | `icons/playstore.png` (512x512) |
| macOS app icon | `icons/Assets.xcassets/AppIcon.appiconset/512.png` |

---

## HTML head meta tags

For web applications using BSD XR branding:

```html
<link rel="icon" href="/icons/favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/Assets.xcassets/AppIcon.appiconset/180.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/icons/Assets.xcassets/AppIcon.appiconset/167.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/Assets.xcassets/AppIcon.appiconset/152.png" />
```

---

## Brand voice summary

For full guidance see `brand-voice.md`. Key rules:

- Direct. No filler. Every word earns its place.
- Active voice. Short, declarative sentences.
- No superlatives, no buzzwords, no exclamation marks.
- All UI text uppercase.
- Technical but accessible — speak to engineers and executives simultaneously.

---

## Contact

| | |
|---|---|
| Website | https://bsdxr.com |
| Contact | https://bsdxr.com/contact |
| Email | info@bsdxr.com |
| Location | Winnipeg, Manitoba, Canada |
