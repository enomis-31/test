# Data Model: UI Theme System

**Date**: 2025-01-27  
**Feature**: UI Theme System  
**Phase**: 1 - Design & Contracts

## Entities

### Theme Preference

**Purpose**: Stores the user's selected theme mode preference to persist across browser sessions.

**Attributes**:
- `theme`: string (required)
  - Values: `"light"` | `"dark"` | `"system"`
  - Default: `"light"` (if no preference set)
  - Description: The theme mode selected by the user. `"system"` means follow OS preference.

**Storage**:
- **Location**: Browser `localStorage`
- **Key**: `"theme-preference"` (or library default, e.g., `"theme"` if using next-themes)
- **Format**: JSON string or plain string value
- **Example**: `localStorage.setItem("theme-preference", "dark")`

**Validation Rules**:
- Must be one of: `"light"`, `"dark"`, or `"system"`
- If invalid value stored, fall back to `"light"`
- If storage unavailable (private browsing, quota exceeded), use in-memory only (session-only)

**State Transitions**:
```
[No preference] → User selects theme → [Theme saved]
[Theme saved] → User changes theme → [Theme updated]
[Theme saved] → User clears storage → [No preference]
[Theme saved] → App loads → [Theme applied from storage]
```

**Relationships**:
- None (standalone entity, no foreign keys)

**Edge Cases**:
- Storage quota exceeded: Gracefully degrade to session-only
- Invalid value in storage: Reset to default (`"light"`)
- Storage disabled: Use in-memory state (lost on refresh)
- System preference changes: If `theme === "system"`, update automatically

---

## Data Flow

### Theme Selection Flow

1. User clicks theme toggle
2. Component calls `setTheme(newTheme)` from theme provider
3. Theme provider:
   - Updates React state (immediate UI update)
   - Saves to localStorage (persistence)
   - Applies CSS class to document root
4. All components re-render with new theme classes
5. CSS transitions animate color changes

### Theme Loading Flow

1. App initializes
2. Theme provider checks:
   - localStorage for saved preference
   - System preference (if theme is `"system"`)
   - Default to `"light"` if neither available
3. Apply theme class to document before first render (prevent flash)
4. Components render with correct theme

---

## Storage Schema

### localStorage Structure

```json
{
  "theme-preference": "dark"
}
```

**Alternative** (if using next-themes default):
- Key: `"theme"`
- Value: `"light"` | `"dark"` | `"system"`

**Migration**: If switching libraries, may need to migrate key name.

---

## Data Validation

### Input Validation

- **User selection**: Must be valid theme value
- **Storage read**: Validate before applying (sanitize invalid values)
- **System preference**: Map to `"light"` or `"dark"` (never store `"system"` as final value)

### Error Handling

- **Storage write fails**: Log warning, continue with in-memory state
- **Storage read fails**: Use default theme, continue normally
- **Invalid stored value**: Reset to default, overwrite invalid value

---

## Notes

- This is a simple, single-value entity
- No relationships or complex queries needed
- Storage is client-side only (no backend)
- Data is user-specific (per browser/device)
- No data migration needed (simple string value)
