# Research: UI Theme System

**Date**: 2025-01-27  
**Feature**: UI Theme System  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. ShadCN UI Setup and Theming

**Decision**: Use ShadCN UI with Tailwind CSS for component library and styling system.

**Rationale**: 
- ShadCN UI is explicitly specified in requirements
- Built on Radix UI primitives (accessible, unstyled)
- Uses Tailwind CSS for styling (aligns with constitution's "maintainable CSS")
- Copy-paste component model (no npm dependency bloat)
- Excellent TypeScript support
- Built-in dark mode support via Tailwind

**Alternatives considered**:
- Material-UI: More opinionated, larger bundle size
- Chakra UI: Good but ShadCN specified
- Custom components: Violates simplicity principle

**Implementation notes**:
- Initialize with `npx shadcn-ui@latest init`
- Configure Tailwind with dark mode: `class` strategy
- Use CSS variables for theme colors (works with Tailwind)

---

### 2. Theme Switching Library

**Decision**: Use `next-themes` library for theme management.

**Rationale**:
- Lightweight (~1KB gzipped)
- Framework-agnostic (works with React, Next.js, Remix, etc.)
- Built-in system preference detection
- localStorage persistence out of the box
- SSR-safe (no flash of wrong theme)
- Simple API: `<ThemeProvider>` + `useTheme()` hook

**Alternatives considered**:
- Custom React Context: More code, need to handle SSR, system preference
- `react-theme-switcher`: Less maintained, fewer features
- `use-dark-mode`: Simpler but less flexible

**Implementation notes**:
- Wrap app with `<ThemeProvider attribute="class">`
- Use `useTheme()` hook for theme toggle component
- Supports `system` theme (follows OS preference)

---

### 3. Brand Color System (Purple & Orange)

**Decision**: Define brand colors using HSL values with CSS custom properties, adapting lightness for light/dark themes.

**Rationale**:
- HSL allows easy theme adaptation (adjust L for light/dark)
- CSS custom properties enable dynamic theming
- Tailwind can consume CSS variables
- Maintains color relationships (hue, saturation) across themes

**Color definitions**:
- **Purple**: Primary brand color
  - Light theme: `hsl(262, 83%, 58%)` (vibrant purple)
  - Dark theme: `hsl(262, 83%, 70%)` (lighter for contrast)
- **Orange**: Secondary brand color
  - Light theme: `hsl(24, 95%, 53%)` (vibrant orange)
  - Dark theme: `hsl(24, 95%, 65%)` (lighter for contrast)

**Alternatives considered**:
- Fixed hex values: Doesn't adapt to theme, poor contrast in one mode
- RGB: Less intuitive for theme adjustments
- Predefined palette libraries: Less control over brand identity

**Accessibility considerations**:
- Test contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Use color contrast checker tools
- May need to adjust lightness values after testing

---

### 4. CSS Custom Properties Architecture

**Decision**: Use CSS custom properties (CSS variables) for all theme values, organized by semantic purpose.

**Rationale**:
- Native browser support (no runtime overhead)
- Works seamlessly with Tailwind CSS
- Easy to override per-component if needed
- Enables smooth theme transitions
- Type-safe with TypeScript (via Tailwind config)

**Structure**:
```css
:root {
  /* Brand colors */
  --color-brand-purple: hsl(262, 83%, 58%);
  --color-brand-orange: hsl(24, 95%, 53%);
  
  /* Semantic colors */
  --color-background: white;
  --color-foreground: black;
  --color-muted: gray;
  /* ... */
}

.dark {
  --color-brand-purple: hsl(262, 83%, 70%);
  --color-brand-orange: hsl(24, 95%, 65%);
  --color-background: black;
  --color-foreground: white;
  /* ... */
}
```

**Alternatives considered**:
- JavaScript theme objects: Runtime overhead, harder to use in CSS
- SCSS variables: Requires build step, less flexible
- Inline styles: Not maintainable, violates component architecture

---

### 5. Theme Transition Strategy

**Decision**: Use CSS transitions on color properties for smooth theme switching.

**Rationale**:
- Native browser performance (GPU-accelerated)
- No JavaScript animation overhead
- Works for all elements automatically
- Can be disabled for users who prefer reduced motion

**Implementation**:
```css
* {
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

**Alternatives considered**:
- JavaScript animations: More complex, potential performance issues
- No transitions: Jarring user experience
- Fade in/out: Too slow, breaks user flow

---

### 6. Accessibility and Contrast Ratios

**Decision**: Validate all color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Rationale**:
- Required by success criteria (SC-004)
- Legal compliance in many jurisdictions
- Better user experience for all users
- Brand colors must work in both themes

**Tools and process**:
- Use WebAIM Contrast Checker or similar tools
- Test brand colors against background in both themes
- Adjust lightness values if needed
- Document final color values in design system

**Fallback strategy**:
- If brand colors don't meet contrast, use darker/lighter variants for text
- Maintain brand colors for accents, backgrounds, borders
- Ensure interactive elements (buttons, links) always meet contrast

---

## Technical Decisions Summary

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| Component Library | ShadCN UI | Specified requirement, accessible, maintainable |
| Styling | Tailwind CSS | ShadCN dependency, maintainable CSS per constitution |
| Theme Management | next-themes | Lightweight, SSR-safe, system preference support |
| Color System | HSL + CSS Variables | Theme-adaptive, maintainable, Tailwind-compatible |
| Persistence | localStorage | Simple, no backend needed, per constitution |
| Transitions | CSS transitions | Native performance, respects user preferences |

## Open Questions Resolved

- ✅ Framework choice: React (ShadCN UI standard)
- ✅ Theme library: next-themes (best fit for requirements)
- ✅ Color format: HSL with CSS variables (theme-adaptive)
- ✅ Transition strategy: CSS transitions (performance)
- ✅ Accessibility: WCAG AA standards (required by spec)

## Next Steps

1. Set up ShadCN UI with Tailwind CSS
2. Configure CSS custom properties for brand colors
3. Implement ThemeProvider with next-themes
4. Create ThemeToggle component
5. Test contrast ratios and adjust colors if needed
6. Apply theme to all ShadCN UI components
