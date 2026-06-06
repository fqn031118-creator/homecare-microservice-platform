---
name: Resilient Home & Service System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built on the pillars of **reliability, transparency, and technical precision**. It serves a multi-sided marketplace where homeowners seek trust, service professionals seek efficiency, and admins require total visibility. 

The visual style is **Corporate Modern with a "Utility-Plus" edge**. It utilizes high-quality whitespace and a structured grid to manage the complexity of microservices, while softening the interface with approachable radii to maintain a "human-in-the-loop" feel for home services.

- **Consumer Experience:** Focuses on clarity and warmth, reducing "decision fatigue" through open layouts and inviting imagery.
- **Provider Experience:** Focuses on ergonomics and high-contrast touch targets for staff on the move.
- **Admin Experience:** Focuses on information density and system status awareness, utilizing a more compact version of the layout rules.

## Colors

The palette is anchored by **Home Care Blue (#2563EB)**, a color that signals institutional stability and technical competence. It is balanced by **Clean Green (#10B981)**, used primarily for success states, confirmations, and "available" status indicators.

- **Primary (Blue):** Used for main actions, navigation icons, and brand-defining moments.
- **Secondary (Green):** Used for "Book Now" buttons, verified badges, and positive growth metrics.
- **Backgrounds:** Use a tiered gray scale. `#F8FAFC` for the base canvas and `White` for card surfaces to create a clear "layering" effect.
- **Functional Colors:** 
    - Warning: `#F59E0B` (Amber) for pending appointments.
    - Danger: `#EF4444` (Red) for system alerts or cancellations.

## Typography

The design system uses **Inter** exclusively to ensure maximum legibility for data-heavy service logs and address information. 

- **Weight Strategy:** Use *Semi-Bold (600)* for interactive elements like buttons and tabs. Use *Regular (400)* for all long-form reading and descriptions.
- **Scalability:** On mobile, headline sizes are reduced by one tier (e.g., Desktop `headline-lg` becomes Mobile `headline-md`) to ensure critical info stays above the fold.
- **Admin Specifics:** For the Admin dashboard, use `label-md` for table headers and `code-sm` for technical service ID strings to distinguish them from human-readable text.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **single-column vertical stack** for mobile. 

- **Rhythm:** An 8px linear scale (referenced as `base * n`) governs all padding and margins.
- **Consumer View:** Uses wider margins (`lg`) and increased vertical breathing room to feel "premium."
- **Staff View:** Uses tighter spacing (`sm`) to fit more appointment details on a single screen without scrolling.
- **Admin View:** Leverages a "Compact Mode" with `xs` gutters, prioritizing data density and monitoring throughput.

## Elevation & Depth

To reflect the microservices architecture—where modularity is key—the design system uses **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (Canvas):** `#F8FAFC` - The foundational background.
2.  **Level 1 (Cards/Surface):** `White` - Used for primary content containers. Features a subtle 1px border (`#E2E8F0`) and a very soft, diffused shadow (10% opacity, 4px blur).
3.  **Level 2 (Modals/Popovers):** `White` - Used for active task flows (e.g., "Confirm Booking"). Features a more pronounced shadow (15% opacity, 12px blur) to pull the element forward.
4.  **Interactive States:** Hovering over a service card should subtly increase the shadow depth and slightly shift the border color to `Home Care Blue`.

## Shapes

The shape language is **Rounded**, using a consistent 8px (`rounded-md`) radius for most components. This creates a friendly atmosphere while remaining structured.

- **Standard Elements:** 8px for Buttons, Input fields, and Cards.
- **Large Elements:** 16px (`rounded-lg`) for main dashboard containers or promotional banners in the consumer view.
- **Staff/Mobile Elements:** Buttons on the staff mobile app may use 12px corners to increase the perceived "tap area" and visual comfort.

## Components

### Buttons
- **Primary:** Solid `Home Care Blue` with white text. High-contrast and prominent.
- **Secondary:** White background with `Home Care Blue` border and text. Used for secondary actions like "View Details."
- **Success:** Solid `Clean Green` used exclusively for "Complete Task" or "Confirm Payment."

### Cards
- **Service Card:** Includes a header image (for consumers) or a status badge (for staff), followed by 16px padded content and a bottom-aligned action bar.
- **Metric Card:** (Admin only) Minimalist with a large `headline-lg` number and a small `label-md` trend indicator.

### Input Fields
- Use a 1px border (`#CBD5E1`). On focus, the border thickens to 2px and changes to `Home Care Blue` with a soft blue outer glow.
- Labels must always be visible above the field in `label-md` style.

### Chips/Status Badges
- Small, rounded-pill shapes with low-opacity backgrounds (e.g., Light Green background with Dark Green text for "Confirmed").

### Lists
- Use horizontal dividers (`#F1F5F9`) with 16px of vertical padding between items. In staff views, items should include a "chevron-right" icon to indicate drill-down capability.