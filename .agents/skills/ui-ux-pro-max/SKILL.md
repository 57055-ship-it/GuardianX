---
name: ui-ux-pro-max
description: AI design intelligence skill for generating industry-level UI/UX designs, typography, color systems, icon replaces, glassmorphic themes, and skeleton loaders.
---

# UI/UX Pro Max Design Intelligence System

This skill guides AI coding assistants to build modern, high-end, industry-grade user interfaces across Web, Mobile, and SaaS applications.

## Design Principles

### 1. Typography & Hierarchy
- **Primary Web Font**: `Plus Jakarta Sans`, `Inter`, or `Outfit` via Google Fonts.
- **Weights**: 400 (Regular body), 500 (Medium controls), 600 (Semibold UI labels), 700 (Bold headings), 800/900 (Extra Bold hero/brand metrics).
- **Line Height & Letter Spacing**: Tight tracking (`tracking-tight`) for headings, comfortable line heights (`leading-relaxed`) for copy.

### 2. Glassmorphism & Color Palettes
- **Backgrounds**: Deep dark canvas (`#030712`, `#090d16`, `slate-950`). Subtle ambient lighting mesh gradients (`radial-gradient`).
- **Cards & Containers**: Translucent dark surfaces (`bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl`). Hover glow transitions.
- **Accents**:
  - Indigo / Violet (`#6366f1` to `#8b5cf6`) for Primary Parent Web.
  - Amber / Orange (`#f59e0b` to `#f97316`) for Super Admin SaaS Control Plane.
  - Emerald (`#10b981`) for Active/Success status.
  - Rose (`#f43f5e`) for Critical/SOS/Alert states.

### 3. Icons over Emojis
- **Never use raw text emojis** (e.g. 🛡️, 🚨, 📱, 📍) in user interfaces.
- Always use vector icons:
  - **React/Vite**: `lucide-react` or inline SVG icons.
  - **Flutter Mobile**: `Icons.*`, `CupertinoIcons.*`, or SVG assets.

### 4. Minimal Skeleton Loading
- Replace abrupt loading spinners or plain text with smooth pulse/shimmer skeleton loaders.
- Skeleton components mimic the exact layout of the target content (stat cards, list items, table rows, avatars).
