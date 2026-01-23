# Data Model: Calendar with Appointments

**Date**: 2025-01-27  
**Feature**: Calendar with Appointments  
**Phase**: 1 - Design & Contracts

## Entities

### Appointment

**Purpose**: Represents a scheduled event in the calendar with time, title, and optional categorization.

**Attributes**:
- `id`: string (required, unique)
  - Format: UUID v4 or timestamp-based unique identifier
  - Description: Unique identifier for the appointment
  - Example: `"550e8400-e29b-41d4-a716-446655440000"`

- `title`: string (required)
  - Min length: 1 character
  - Max length: 200 characters (reasonable limit)
  - Description: The appointment title/name displayed in the calendar
  - Example: `"Team Meeting"`

- `startTime`: string (required)
  - Format: ISO 8601 date-time string
  - Description: Start time of the appointment
  - Example: `"2025-01-27T14:00:00.000Z"`

- `endTime`: string (optional)
  - Format: ISO 8601 date-time string
  - Description: End time of the appointment. If not provided, appointment spans 1 hour by default
  - Must be after `startTime` if provided
  - Example: `"2025-01-27T15:30:00.000Z"`

- `category`: string (optional)
  - Values: `"meeting"` | `"personal"` | `"urgent"` | `"completed"` | custom category ID
  - Description: Category/state identifier for visual distinction
  - Default: `undefined` (no category)
  - Example: `"meeting"`

- `description`: string (optional)
  - Max length: 1000 characters
  - Description: Additional details about the appointment
  - Example: `"Quarterly planning discussion"`

- `createdAt`: string (required, auto-generated)
  - Format: ISO 8601 date-time string
  - Description: Timestamp when appointment was created
  - Example: `"2025-01-27T10:00:00.000Z"`

- `updatedAt`: string (required, auto-generated)
  - Format: ISO 8601 date-time string
  - Description: Timestamp when appointment was last modified
  - Example: `"2025-01-27T10:05:00.000Z"`

**Storage**:
- **Location**: Browser `localStorage`
- **Key**: `"appointments"`
- **Format**: JSON array of appointment objects
- **Example**: 
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Meeting",
    "startTime": "2025-01-27T14:00:00.000Z",
    "endTime": "2025-01-27T15:30:00.000Z",
    "category": "meeting",
    "description": "Quarterly planning",
    "createdAt": "2025-01-27T10:00:00.000Z",
    "updatedAt": "2025-01-27T10:00:00.000Z"
  }
]
```

**Validation Rules**:
- `title` must not be empty or whitespace-only
- `startTime` must be valid ISO 8601 date-time
- `endTime` (if provided) must be after `startTime`
- `category` must be one of predefined values or valid custom category
- `description` length must not exceed 1000 characters
- `id` must be unique across all appointments

**State Transitions**:
```
[No appointment] → User creates → [Appointment created]
[Appointment created] → User edits → [Appointment updated]
[Appointment created] → User deletes → [Appointment removed]
[Appointment] → Time passes → [Appointment in past] (visual state change)
```

**Relationships**:
- Belongs to a specific day (derived from `startTime`)
- May have a category (optional relationship)
- No foreign keys (standalone entity)

**Edge Cases**:
- Appointment in the past: Allowed, displayed normally
- Overlapping appointments: Allowed, displayed side-by-side
- Appointment spanning multiple days: Handled by showing in each day's view
- Missing endTime: Defaults to 1-hour duration
- Invalid time format: Validation error, appointment not saved
- Very long title: Truncated in display, full title in details

---

### Category/State

**Purpose**: Represents a classification for appointments to enable visual distinction and organization.

**Attributes**:
- `id`: string (required, unique)
  - Values: `"meeting"` | `"personal"` | `"urgent"` | `"completed"`
  - Description: Category identifier

- `name`: string (required)
  - Description: Human-readable category name
  - Examples: `"Meeting"`, `"Personal"`, `"Urgent"`, `"Completed"`

- `color`: string (required)
  - Format: CSS color value (hex, rgb, or CSS variable)
  - Description: Color used for visual distinction
  - Examples: `"#3b82f6"` (blue for meeting), `"#10b981"` (green for personal)

- `icon`: string (optional)
  - Description: Icon identifier for visual representation
  - Example: `"calendar"`, `"user"`, `"alert-circle"`

**Storage**:
- **Location**: Application configuration (not in localStorage, hardcoded or config file)
- **Format**: Array of category objects in application code
- **Default categories**:
```json
[
  { "id": "meeting", "name": "Meeting", "color": "#3b82f6", "icon": "calendar" },
  { "id": "personal", "name": "Personal", "color": "#10b981", "icon": "user" },
  { "id": "urgent", "name": "Urgent", "color": "#ef4444", "icon": "alert-circle" },
  { "id": "completed", "name": "Completed", "color": "#6b7280", "icon": "check-circle" }
]
```

**Validation Rules**:
- `id` must be unique
- `name` must not be empty
- `color` must be valid CSS color value

**Relationships**:
- Referenced by appointments via `category` field (optional foreign key)

---

### Time Slot

**Purpose**: Represents an hour or time period in the calendar view where appointments can be scheduled.

**Attributes**:
- `hour`: number (required)
  - Range: 0-23
  - Description: Hour of the day (0 = midnight, 23 = 11 PM)

- `displayLabel`: string (required)
  - Format: "HH:MM" (e.g., "14:00", "09:00")
  - Description: Human-readable time label

- `startTime`: Date (computed)
  - Description: Start of the time slot for the current day

- `endTime`: Date (computed)
  - Description: End of the time slot (start + 1 hour)

**Storage**:
- **Location**: Computed/derived, not stored
- **Format**: Generated dynamically based on current day and time range

**Validation Rules**:
- `hour` must be between 0 and 23
- Time slots are non-overlapping and consecutive

**Relationships**:
- Contains appointments (appointments displayed within time slot)
- Belongs to a specific day (derived from calendar view date)

---

## Data Flow

### Appointment Creation Flow

1. User clicks on time slot
2. Appointment form opens with pre-filled start time
3. User enters title (required) and optional details
4. User selects category (optional)
5. System validates input
6. System generates unique ID and timestamps
7. Appointment object created
8. Appointment added to appointments array
9. Array serialized to JSON and saved to localStorage
10. Calendar view updates to show new appointment

### Appointment Display Flow

1. User navigates to calendar day view
2. System loads appointments from localStorage
3. System filters appointments for current day (based on startTime)
4. System calculates which time slots contain appointments
5. System groups overlapping appointments
6. System renders appointments in correct time slots
7. System applies category colors/styles

### Appointment Edit Flow

1. User clicks on existing appointment
2. Appointment form opens with current values
3. User modifies fields
4. System validates changes
5. System updates `updatedAt` timestamp
6. System finds appointment by ID in array
7. System updates appointment object
8. Array serialized and saved to localStorage
9. Calendar view updates

---

## Storage Schema

### localStorage Structure

```json
{
  "appointments": [
    {
      "id": "string",
      "title": "string",
      "startTime": "ISO 8601 string",
      "endTime": "ISO 8601 string (optional)",
      "category": "string (optional)",
      "description": "string (optional)",
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    }
  ]
}
```

**Migration**: If schema changes in future, add migration logic to transform old format to new format.

---

## Data Validation

### Input Validation

- **Title**: Must be non-empty string, max 200 characters
- **Start time**: Must be valid ISO 8601 date-time string
- **End time**: Must be valid ISO 8601 date-time string, must be after start time
- **Category**: Must be valid category ID or undefined
- **Description**: Must be string, max 1000 characters

### Error Handling

- **Invalid time format**: Show error message, prevent save
- **End time before start time**: Show error message, prevent save
- **Empty title**: Show error message, prevent save
- **localStorage quota exceeded**: Show warning, suggest cleanup, degrade gracefully
- **Invalid JSON in storage**: Reset to empty array, log error

---

## Notes

- Appointments are stored in a flat array structure for simplicity
- Filtering by date is done in-memory when displaying calendar
- No indexing needed for MVP (can optimize later if performance issues)
- Categories are predefined but can be extended
- Time slots are computed, not stored
- All times stored in ISO 8601 format for timezone consistency
