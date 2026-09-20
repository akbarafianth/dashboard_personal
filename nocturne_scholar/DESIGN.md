---
name: Nocturne Scholar
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-3xs: 0.125rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 2.5rem
---

## Brand & Style

This design system establishes a high-performance, focused environment for modern academic study, research, and syllabus management. Engineered for deep cognitive work, late-night study sessions, and intensive scheduling, the aesthetic balances the precision of an IDE with the editorial clarity of modern academic journals.

The emotional signature is calm mastery, intellectual clarity, and reduced cognitive strain. By avoiding stark pure-black canvases and abrasive neon contrasts, the interface leverages rich obsidian and charcoal surfaces paired with luminous, jewel-toned semantic markers. Translucent glass containers, micro-borders, and tactile surface hierarchies keep dense course material structured, legible, and visually engaging.

## Colors

The palette is engineered around deep obsidian architecture, high-contrast typography, and purposeful semantic subject accents.

### Foundation & Surfaces
- **Canvas Base (`#0B0F17`):** Primary viewport backdrop; minimizes blue-light eye strain during extended night reading.
- **Surface Elevation 1 (`#131B2E`):** Navigational shells, module headers, and primary card backgrounds.
- **Surface Elevation 2 (`#1E293B`):** Modals, dropdown popovers, active study trays, and elevated widgets.
- **Translucent Overlays:** Semi-opaque white channels (`rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.08)`) used for frosted glass cards.

### Accents & Subject Categorization
- **Indigo (`#6366F1`):** Primary focus; used for active navigation, core actions, and system confirmations.
- **Violet (`#8B5CF6`):** Secondary highlight; assigned to humanities, creative fields, and revision stages.
- **Cyan (`#06B6D4`):** Tertiary indicator; STEM subjects, laboratory modules, and active timers.
- **Emerald (`#10B981`):** Progress completion, submission success, and GPA metrics.
- **Amber (`#F59E0B`):** Pending deliverables, examination warnings, and high-priority tags.

### Borders & Dividers
- **Glass Border Subtle:** `rgba(255, 255, 255, 0.08)` for standard structural containment.
- **Glass Border Active:** `rgba(99, 102, 241, 0.35)` for focused containers, active lecture slots, or input states.

## Typography

The typography couples the structural geometry of **Plus Jakarta Sans** for dashboards, headlines, and data widgets with the reading comfort of **Inter** for sustained study sessions, lecture transcripts, and markdown notes.

### Hierarchy & Legibility Rules
- **Course Titles & Module Displays:** Rendered in `Plus Jakarta Sans` bold/semibold with slight negative letter tracking to retain crispness against dark backdrops.
- **Study Notes & Reader Mode:** Rendered in `Inter` regular (`body-lg` or `body-md`) with relaxed line heights (1.6x) and maximum line lengths of 68-75 characters to prevent reading fatigue.
- **Metadata, Badges & Timestamps:** Use uppercase or title case in `Plus Jakarta Sans` (`label-sm`) with expanded tracking (+0.04em) to maintain clarity at diminutive scales.
- **Math & Syntax Insets:** Rendered in `JetBrains Mono` inline or in bordered code blocks for formulas, logic expressions, and code snippets.

## Layout & Spacing

The dashboard relies on an adaptable 12-column grid balanced by an 8pt architectural rhythm, with a dedicated 4pt sub-grid for dense study metrics, grade tables, and calendar blocks.

### Breakpoints & Fluid Columns
- **Desktop (1280px+):** 12-column system, 32px gutters, 40px outer padding. Layout supports a fixed 260px collapsible command navigation rail, a flexible 2-to-3 column analytical dashboard, and a persistent 360px schedule/takeaway drawer.
- **Tablet (768px – 1279px):** 8-column system, 24px gutters, 32px margins. Secondary schedule drawer collapses into an on-demand slide-over tray.
- **Mobile (320px – 767px):** 4-column system, 16px gutters, 16px margins. Bottom navigation bar replaces side rails. Calendar switches from weekly time-blocks to sequential agenda cards.

### Layout Rhythm
- Group logically related metadata (e.g., credit count, instructor avatar, due date) using `space-xs` (8px) and `space-sm` (12px).
- Separate dashboard widget blocks and syllabus modules using `space-xl` (32px) to prevent sensory overload in dark interfaces.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows, which muddy dark canvases. Instead, depth is constructed via **tonal layering**, **glassmorphism**, and **directional edge illumination**.

### Surface Hierarchy
1. **Level 0 (Canvas):** Solid `#0B0F17`. The deepest sink for outer page gutters.
2. **Level 1 (Panels & Shells):** Solid `#131B2E` or frosted `rgba(19, 27, 46, 0.75)` with `backdrop-filter: blur(16px)`. Defines sidebars, sticky headers, and base module containers.
3. **Level 2 (Cards & Tiles):** `rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(12px)` and a continuous micro-border `1px solid rgba(255, 255, 255, 0.07)`.
4. **Level 3 (Interactive Modals & Focus Trays):** `#1E293B` elevated with a directional specular rim: `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`.

### Accent Lighting
Interactive components like active assignment cards or live lecture items receive an ambient accent bloom: a diffuse, low-opacity glow (`box-shadow: 0 0 24px -4px rgba(99, 102, 241, 0.25)`).

## Shapes

The design system incorporates structured, contemporary curves (`roundedness: 2`) that soften the precision of data-heavy tables without appearing childish.

### Corner Radii Guidelines
- **Micro UI (`rounded-sm` / 4px):** Checkboxes, status dots, inline code snippets.
- **Interactive Triggers (`rounded-md` / 8px):** Buttons, segmented controls, text inputs, badge pills.
- **Card Containers (`rounded-lg` / 16px):** Course overview modules, timetable slots, takeaway callout boxes.
- **Modals & Overlays (`rounded-xl` / 24px):** Quick-study dialogue panels, lecture media players.

## Components

### Buttons & Actions
- **Primary:** Gradient-filled background (`linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)`), pure white text, subtle top inset border `rgba(255, 255, 255, 0.2)`. On hover, subtle elevation with indigo glow.
- **Secondary / Glass:** Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#F8FAFC`. On hover, background shifts to `rgba(255, 255, 255, 0.09)`.
- **Destructive / Urgent:** Dark crimson tint `rgba(239, 68, 68, 0.12)` with border `rgba(239, 68, 68, 0.3)` and text `#F87171`.

### Chips & Subject Badges
- **Structure:** Pill-shaped tags with micro padding (`4px 10px`).
- **Styling:** Dynamic color pairing based on subject or priority. Amber (Due Soon): `background: rgba(245, 158, 11, 0.12)`, `border: 1px solid rgba(245, 158, 11, 0.25)`, `color: #FBBF24`. Cyan (CS / Lab): `background: rgba(6, 182, 212, 0.12)`, `border: 1px solid rgba(6, 182, 212, 0.25)`, `color: #22D3EE`.

### Cards & Modules
- **Glassmorphic Study Card:** Rendered in `rgba(19, 27, 46, 0.7)` with `backdrop-filter: blur(14px)`, `border: 1px solid rgba(255, 255, 255, 0.07)`.
- **Top Inset Line:** Course cards feature a 2px top border color-coded to the course discipline (e.g., `#8B5CF6` for Literature).

### Form Inputs & Search
- **Input Fields:** Recessed dark background (`#0B0F17`) with `border: 1px solid rgba(255, 255, 255, 0.1)`. Placeholder text in `#64748B`.
- **Active / Focus:** Transitions to border color `#6366F1` with an outer glow `0 0 0 3px rgba(99, 102, 241, 0.2)`.

### Selection Controls
- **Checkboxes (Study Tasks):** Custom 18px rounded squares (`rounded-sm`). Unchecked: `border: 1px solid rgba(255, 255, 255, 0.2)`, background `transparent`. Checked: background `#10B981`, checkmark `#0B0F17`, dynamic line-through strike applied to associated label text.

### Key Takeaway Callout Boxes
- High-contrast editorial container for synthesized summaries within notes.
- Visual style: `rgba(99, 102, 241, 0.06)` background fill, vertical 3px border-left `#6366F1`, rounded right edges (8px), paired with an icon header and `Inter` medium text.

### Schedule & Timetable Blocks
- Time-grid slots with translucent backgrounds indicating course category.
- Current live event highlighted with an animated pulsing indicator (`#10B981`) and a 1px border `rgba(16, 185, 129, 0.4)`.