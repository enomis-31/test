# Research: Calendar with Appointments

**Date**: 2025-01-27  
**Feature**: Calendar with Appointments  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Date/Time Handling Library

**Decision**: Use `date-fns` library for date and time manipulation.

**Rationale**: 
- Lightweight and modular (import only what you need)
- Excellent TypeScript support
- Tree-shakeable (better bundle size)
- Simple API for common operations (format, parse, add hours, compare dates)
- Timezone support when needed
- No dependencies (unlike moment.js)
- Active maintenance and good documentation

**Alternatives considered**:
- **dayjs**: Similar to date-fns but slightly smaller. Good alternative, but date-fns has better TypeScript support.
- **moment.js**: Too large, deprecated in favor of alternatives
- **Luxon**: More features than needed, larger bundle size
- **Native Date API**: Too verbose, lacks many utilities needed for calendar operations

**Implementation notes**:
- Use `format` for displaying times (e.g., "14:00")
- Use `addHours`, `startOfDay`, `endOfDay` for time slot calculations
- Use `isSameDay`, `isBefore`, `isAfter` for date comparisons
- Use `parse` for user input if needed

---

### 2. Calendar View Layout Strategy

**Decision**: Use CSS Grid for calendar layout with fixed time slots.

**Rationale**:
- CSS Grid provides natural alignment for time slots
- Easy to handle appointments spanning multiple hours
- Responsive design with grid-template-rows
- Better performance than absolute positioning
- Works well with scrollable container for 24-hour view
- Aligns with component-based architecture (grid container as component)

**Alternatives considered**:
- **Absolute positioning**: More complex calculations, harder to maintain
- **Flexbox**: Less suitable for time-based grid layout
- **Table layout**: Less flexible, harder to style
- **Third-party calendar library**: Overkill for simple day view, violates simplicity principle

**Implementation notes**:
- Grid with 24 rows (one per hour) or configurable time range
- Each row represents one hour
- Appointments positioned using grid-row-start and grid-row-end
- Scrollable container for long day view

---

### 3. Appointment Data Structure

**Decision**: Store appointments as array of objects with unique IDs, using ISO date strings for times.

**Rationale**:
- Simple, straightforward structure
- Easy to serialize to JSON for localStorage
- ISO date strings are standard and timezone-aware
- Unique IDs enable efficient updates and deletions
- Supports appointments spanning multiple hours via start/end times

**Structure**:
```typescript
{
  id: string (UUID or timestamp-based)
  title: string (required)
  startTime: string (ISO 8601 format)
  endTime?: string (ISO 8601 format, optional)
  category?: string (category ID or name)
  description?: string (optional)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

**Alternatives considered**:
- **Nested structure by date**: More complex queries, harder to filter
- **Indexed by time slot**: Doesn't handle multi-hour appointments well
- **Relational structure**: Overkill for localStorage, violates simplicity

---

### 4. Category/State System

**Decision**: Use predefined categories with color coding and optional icons.

**Rationale**:
- Simple to implement and understand
- Visual distinction through colors (aligns with brand color system from theme feature)
- Can be extended later if needed
- No complex state machine required
- Categories are user-facing labels, not technical states

**Default categories**:
- **Meeting**: Blue color, business/professional appointments
- **Personal**: Green color, personal events
- **Urgent**: Red/Orange color, time-sensitive items
- **Completed**: Gray color, past or finished appointments

**Alternatives considered**:
- **User-defined categories**: More flexible but adds complexity (YAGNI violation)
- **State machine**: Over-engineered for simple categorization
- **Tags system**: More flexible but unnecessary for MVP

**Implementation notes**:
- Categories stored as simple string identifiers
- Color mapping in component or configuration
- Can be extended to support custom colors per category later

---

### 5. Appointment Overlap Handling

**Decision**: Allow overlapping appointments but display them side-by-side when in same time slot.

**Rationale**:
- Simpler than preventing overlaps (no validation complexity)
- Users may intentionally schedule overlapping items
- Side-by-side display is common in calendar UIs
- Can add overlap prevention later if needed (progressive enhancement)

**Display strategy**:
- When appointments overlap, divide time slot width proportionally
- Stack appointments vertically if too many in one slot
- Show visual indicator (border, background) for overlapping items

**Alternatives considered**:
- **Prevent overlaps**: Requires validation, error messages, more complex UX
- **Auto-adjust times**: Could confuse users, violates user control
- **Warn but allow**: Good middle ground, can add later

---

### 6. localStorage Data Organization

**Decision**: Store all appointments in single array, filter by date when displaying.

**Rationale**:
- Simple structure (single key in localStorage)
- Easy to query and filter
- Efficient for small to medium datasets (<1000 appointments)
- Aligns with constitution's "straightforward data structure"
- Can optimize later if needed (index by date)

**Storage key**: `"appointments"`  
**Format**: JSON array of appointment objects

**Alternatives considered**:
- **Indexed by date**: More complex, premature optimization
- **Separate keys per date**: Too many keys, harder to manage
- **IndexedDB**: Overkill for simple persistence needs

---

### 7. Time Slot Interaction

**Decision**: Click on time slot opens appointment creation form with pre-filled time.

**Rationale**:
- Intuitive user interaction
- Reduces user input (time already selected)
- Common pattern in calendar applications
- Aligns with FR-002 (create by selecting time slot)

**Alternatives considered**:
- **Double-click to create**: Less discoverable
- **Drag to create**: More complex, can add later
- **Separate "New Appointment" button**: Less intuitive, requires time input

---

## Technical Decisions Summary

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| Date Handling | date-fns | Lightweight, TypeScript-friendly, modular |
| Layout | CSS Grid | Natural fit for time-based grid, performant |
| Data Structure | Array of objects | Simple, JSON-serializable, easy to query |
| Categories | Predefined with colors | Simple, visual distinction, extensible |
| Overlap Handling | Allow with side-by-side display | Simple, user-friendly, can enhance later |
| Storage | Single array in localStorage | Straightforward, efficient for MVP |
| Interaction | Click time slot to create | Intuitive, reduces input |

## Open Questions Resolved

- ✅ Date library: date-fns (best balance of features and size)
- ✅ Calendar layout: CSS Grid (natural fit for time slots)
- ✅ Appointment structure: Simple object with ISO dates
- ✅ Categories: Predefined with color coding
- ✅ Overlaps: Allow with side-by-side display
- ✅ Storage: Single array in localStorage

## Next Steps

1. Set up date-fns for time calculations
2. Create CSS Grid layout for calendar view
3. Implement appointment data model with TypeScript types
4. Build appointment creation form component
5. Implement category system with color mapping
6. Add localStorage persistence layer
7. Create appointment display components
