---
name: Pristine Service Logic
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#404752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#707783'
  outline-variant: '#c0c7d4'
  surface-tint: '#0060a8'
  primary: '#005ea4'
  on-primary: '#ffffff'
  primary-container: '#0077ce'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a2c9ff'
  secondary: '#006e1c'
  on-secondary: '#ffffff'
  secondary-container: '#98f994'
  on-secondary-container: '#0c7521'
  tertiary: '#8f4a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b35e00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#98f994'
  secondary-fixed-dim: '#7ddc7a'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005313'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
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
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  lg: 48px
  xl: 80px
  gutter: 20px
  margin-mobile: 16px
  container-max: 1200px
---

## Brand & Style

The design system is engineered to project unwavering professionalism, reliability, and the refreshing clarity of a well-maintained home. Targeting busy urban professionals and families, the UI must feel efficient yet approachable, removing the friction from domestic management.

The aesthetic follows a **Modern Corporate** direction with a focus on high-clarity information density. It prioritizes functional minimalism, utilizing generous white space to evoke a sense of cleanliness. Visual interest is generated through precise geometry, subtle tonal shifts, and high-quality photography, rather than decorative elements. The emotional goal is to move the user from the "chaos" of a messy home to the "order" of a confirmed service reservation.

## Colors

The palette is anchored by **Trust Blue** (#1E88E5), chosen for its association with professional competence and institutional reliability. **Service Green** (#43A047) is utilized as a secondary functional color for success states and "cleanliness" indicators. **Warm Gold** (#FFA000) is reserved exclusively for high-intent actions, ratings, and urgent notifications, providing a high-contrast focal point against the cooler primary tones.

Backgrounds utilize a layered neutral strategy:
- **Surface**: Pure White (#FFFFFF) for primary content cards and input fields.
- **Background**: Soft Gray-Blue (#F5F7F9) to provide a gentle contrast that reduces eye strain compared to pure white.
- **Stroke**: Light silver (#E0E6ED) for subtle containment.

## Typography

This design system utilizes **Inter** for all Latin characters and **PingFang SC** for Chinese script integration, ensuring a seamless, modern, and highly legible experience. 

The typographic scale emphasizes hierarchy to allow quick scanning of service details. Headings are set with tighter letter spacing and heavier weights to anchor sections. Body text maintains a generous line height (1.5x - 1.6x) to ensure readability during long-form service descriptions or terms of service. Labels use a slightly heavier weight (Medium 500) to distinguish metadata from descriptive content.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing logic is strictly based on an 8px scale (with a 4px "half-step" for tight UI elements).

- **Desktop**: 12 columns, 24px gutters, and 48px side margins. Content is capped at a 1200px max-width container.
- **Mobile**: 4 columns, 16px gutters, and 16px side margins. 

Vertical rhythm is maintained through standardized stack spacing: 16px between related elements (image and text), 24px between components in a group (list items), and 48px between major page sections.

## Elevation & Depth

To maintain a "clean" feel, depth is created through **Tonal Layers** and **Ambient Shadows**. 

The background sits at the lowest elevation (Level 0). Cards and primary surfaces sit at Level 1, using a 1px neutral stroke (#E0E6ED) rather than a shadow to define their boundaries. For interactive elements like hover states or floating action buttons, an ultra-soft, diffused shadow is used (Y: 4px, Blur: 12px, Opacity: 6% Black) to suggest lift without creating visual clutter. 

Modals and overlays utilize a Level 3 elevation with a more pronounced shadow and a 60% opacity backdrop blur to maintain focus on the task at hand.

## Shapes

The design system adopts a **Rounded** (Level 2) shape language. Standard components (buttons, input fields, small cards) utilize an 8px (0.5rem) radius. Larger containers, such as service category hero cards or promotional banners, use 16px (1rem) to feel more inviting. 

Avatars and status indicators (chips) use a full pill-shape (circular) radius to contrast against the structured grid and highlight human elements within the platform.

## Components

### Buttons
Primary buttons use the Primary Blue background with white text. CTAs for "Book Now" or "Checkout" utilize the Warm Gold to drive conversion. Buttons feature a minimum height of 48px for touch-friendliness, with 8px corner radius.

### Cards
Service cards are the primary vessel for information. They must include a 1px stroke, 16px internal padding, and an 8px corner radius. On hover, cards transition to a subtle ambient shadow and a 1px Primary Blue stroke.

### Input Fields
Inputs are defined by a light-gray background (#F5F7F9) and an 8px radius. The active state is signaled by a 2px Primary Blue border and a white background fill to provide a "cleared for entry" visual cue.

### Chips & Badges
Used for service tags (e.g., "Deep Cleaning," "Verified"). These are pill-shaped with 12px font size. Verified badges use the Secondary Green with a small check icon.

### Service Providers List
List items feature a horizontal layout on mobile and grid on desktop. They emphasize the provider's rating (Warm Gold) and years of experience (Neutral Gray) to build immediate trust.