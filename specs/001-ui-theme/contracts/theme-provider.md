# Theme Provider Contract

**Date**: 2025-01-27  
**Feature**: UI Theme System  
**Type**: Component Interface Contract

## Overview

This document defines the contract between the theme system and consuming components. Since this is a frontend-only feature with no backend API, this contract defines the programming interface for theme management.

## Theme Provider API

### React Hook: `useTheme()`

**Purpose**: Provides theme state and controls to React components.

**Interface**:
```typescript
interface ThemeContext {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resolvedTheme: 'light' | 'dark'  // Actual theme (resolves 'system')
}
```

**Usage**:
```typescript
const { theme, setTheme, resolvedTheme } = useTheme()
```

**Behavior**:
- `theme`: Current user selection (may be `"system"`)
- `resolvedTheme`: Actual applied theme (`"light"` or `"dark"`, never `"system"`)
- `setTheme`: Updates theme and persists to localStorage

**Guarantees**:
- Theme changes apply immediately to all components
- Theme preference persists across page reloads
- System preference is detected and applied when `theme === "system"`

---

## CSS Variable Contract

### Available CSS Custom Properties

All components can use these CSS variables for theme-aware styling:

**Brand Colors**:
- `--color-brand-purple`: Primary brand color (purple)
- `--color-brand-orange`: Secondary brand color (orange)

**Semantic Colors** (ShadCN UI standard):
- `--background`: Page background color
- `--foreground`: Primary text color
- `--card`: Card background
- `--card-foreground`: Card text
- `--popover`: Popover background
- `--popover-foreground`: Popover text
- `--primary`: Primary button/action color
- `--primary-foreground`: Text on primary
- `--secondary`: Secondary button color
- `--secondary-foreground`: Text on secondary
- `--muted`: Muted background
- `--muted-foreground`: Muted text
- `--accent`: Accent color
- `--accent-foreground`: Accent text
- `--destructive`: Error/danger color
- `--destructive-foreground`: Text on destructive
- `--border`: Border color
- `--input`: Input border
- `--ring`: Focus ring color

**Usage in Components**:
```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

**Guarantees**:
- All variables are defined in both light and dark themes
- Variables update automatically when theme changes
- Brand colors maintain contrast ratios per WCAG AA

---

## Theme Toggle Component Contract

### Props Interface

```typescript
interface ThemeToggleProps {
  variant?: 'default' | 'icon-only' | 'dropdown'
  showLabel?: boolean
  className?: string
}
```

**Behavior**:
- Toggles between `"light"`, `"dark"`, and optionally `"system"`
- Updates theme via `setTheme()` from `useTheme()`
- Provides visual feedback (icon changes, active state)

---

## Document Class Contract

### HTML Class Application

**Contract**: The theme provider applies a class to the document root (`<html>` or `<body>`).

**Classes**:
- `light`: Light theme active
- `dark`: Dark theme active
- No class: Default/light theme

**Guarantee**: Class is applied before first render (prevents flash of wrong theme).

**Usage**:
```css
.dark .my-component {
  /* Dark theme styles */
}
```

---

## Storage Contract

### localStorage Schema

**Key**: `"theme"` (or library default)  
**Value**: `"light"` | `"dark"` | `"system"`  
**Format**: Plain string (not JSON)

**Guarantees**:
- Value is validated on read (invalid values reset to `"light"`)
- Write failures are handled gracefully (in-memory fallback)
- Storage is per-domain (isolated between environments)

---

## Error Handling Contract

### Failure Modes

1. **localStorage unavailable** (private browsing):
   - Fallback to in-memory state
   - Theme works for session, lost on refresh
   - No error thrown to user

2. **Invalid stored value**:
   - Reset to `"light"`
   - Overwrite invalid value in storage
   - Log warning (development only)

3. **Theme provider not mounted**:
   - Components using `useTheme()` throw error
   - Must wrap app with `<ThemeProvider>`

---

## Versioning

**Current Version**: 1.0.0

**Breaking Changes**: None (initial version)

**Future Considerations**:
- May add more theme options (e.g., high contrast)
- May add per-component theme overrides
- May migrate to different storage mechanism

---

## Testing Contract

### Test Requirements

- Theme toggle updates all components
- Theme persists across page reload
- System preference is detected correctly
- Invalid storage values are handled
- CSS variables are defined in both themes
- Brand colors meet contrast requirements
