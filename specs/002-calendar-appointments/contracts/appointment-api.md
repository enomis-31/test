# Appointment API Contract

**Date**: 2025-01-27  
**Feature**: Calendar with Appointments  
**Type**: Component Interface Contract

## Overview

This document defines the contract between calendar components and appointment data management. Since this is a frontend-only feature with localStorage, this contract defines the programming interface for appointment operations.

## Appointment Service API

### TypeScript Interface

```typescript
interface Appointment {
  id: string
  title: string
  startTime: string  // ISO 8601
  endTime?: string   // ISO 8601
  category?: string
  description?: string
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

interface AppointmentService {
  // Create
  createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>
  
  // Read
  getAppointments(): Promise<Appointment[]>
  getAppointmentById(id: string): Promise<Appointment | null>
  getAppointmentsByDate(date: Date): Promise<Appointment[]>
  
  // Update
  updateAppointment(id: string, data: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<Appointment>
  
  // Delete
  deleteAppointment(id: string): Promise<void>
  
  // Utilities
  validateAppointment(data: Partial<Appointment>): ValidationResult
}
```

### Method Contracts

#### createAppointment

**Purpose**: Create a new appointment and persist to localStorage.

**Input**:
```typescript
{
  title: string          // Required, 1-200 chars
  startTime: string      // Required, ISO 8601
  endTime?: string       // Optional, ISO 8601, must be after startTime
  category?: string      // Optional, valid category ID
  description?: string   // Optional, max 1000 chars
}
```

**Output**: `Promise<Appointment>` - Created appointment with generated ID and timestamps

**Behavior**:
- Generates unique ID (UUID v4 or timestamp-based)
- Sets `createdAt` and `updatedAt` to current time
- Validates input data
- Adds to appointments array
- Saves to localStorage
- Returns created appointment

**Errors**:
- `ValidationError`: Invalid input data
- `StorageError`: localStorage unavailable or quota exceeded

---

#### getAppointments

**Purpose**: Retrieve all appointments from localStorage.

**Input**: None

**Output**: `Promise<Appointment[]>` - Array of all appointments

**Behavior**:
- Reads from localStorage key `"appointments"`
- Parses JSON
- Returns array (empty array if no appointments)
- Handles invalid JSON gracefully (returns empty array)

**Errors**:
- `StorageError`: localStorage unavailable (returns empty array)

---

#### getAppointmentById

**Purpose**: Retrieve a specific appointment by ID.

**Input**: `id: string` - Appointment ID

**Output**: `Promise<Appointment | null>` - Appointment if found, null otherwise

**Behavior**:
- Loads all appointments
- Finds appointment with matching ID
- Returns appointment or null if not found

---

#### getAppointmentsByDate

**Purpose**: Retrieve appointments for a specific date.

**Input**: `date: Date` - Target date

**Output**: `Promise<Appointment[]>` - Array of appointments for the date

**Behavior**:
- Loads all appointments
- Filters appointments where `startTime` falls on the target date
- Returns filtered array
- Handles timezone correctly (compares dates, not times)

---

#### updateAppointment

**Purpose**: Update an existing appointment.

**Input**:
- `id: string` - Appointment ID
- `data: Partial<Appointment>` - Fields to update (excluding id, createdAt)

**Output**: `Promise<Appointment>` - Updated appointment

**Behavior**:
- Loads all appointments
- Finds appointment by ID
- Updates specified fields
- Sets `updatedAt` to current time
- Validates updated data
- Saves to localStorage
- Returns updated appointment

**Errors**:
- `NotFoundError`: Appointment with ID not found
- `ValidationError`: Invalid update data

---

#### deleteAppointment

**Purpose**: Delete an appointment by ID.

**Input**: `id: string` - Appointment ID

**Output**: `Promise<void>`

**Behavior**:
- Loads all appointments
- Removes appointment with matching ID
- Saves updated array to localStorage
- No error if ID not found (idempotent)

---

#### validateAppointment

**Purpose**: Validate appointment data without saving.

**Input**: `data: Partial<Appointment>` - Appointment data to validate

**Output**: `ValidationResult` - Validation result with errors if any

**Behavior**:
- Validates title (required, 1-200 chars)
- Validates startTime (required, valid ISO 8601)
- Validates endTime (optional, must be after startTime if provided)
- Validates category (optional, must be valid category ID)
- Validates description (optional, max 1000 chars)
- Returns validation result with any errors

---

## Calendar Component Contract

### Props Interface

```typescript
interface CalendarViewProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (time: Date) => void
  timeRange?: { start: number; end: number }  // Hours, default 0-23
}
```

**Behavior**:
- Displays calendar view for `selectedDate`
- Shows time slots from `timeRange.start` to `timeRange.end`
- Calls `onTimeSlotClick` when user clicks a time slot
- Calls `onAppointmentClick` when user clicks an appointment
- Updates when `selectedDate` changes

---

## Appointment Form Contract

### Props Interface

```typescript
interface AppointmentFormProps {
  appointment?: Appointment  // If provided, form is in edit mode
  initialTime?: Date         // Pre-filled start time
  onSubmit: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  isOpen: boolean
}
```

**Behavior**:
- If `appointment` provided, form is in edit mode (pre-filled)
- If `initialTime` provided, start time is pre-filled
- Validates input before calling `onSubmit`
- Shows validation errors inline
- Calls `onCancel` when user cancels

---

## Category System Contract

### Category Configuration

```typescript
interface Category {
  id: string
  name: string
  color: string  // CSS color value
  icon?: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'meeting', name: 'Meeting', color: '#3b82f6', icon: 'calendar' },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: 'user' },
  { id: 'urgent', name: 'Urgent', color: '#ef4444', icon: 'alert-circle' },
  { id: 'completed', name: 'Completed', color: '#6b7280', icon: 'check-circle' }
]
```

**Behavior**:
- Categories are predefined in application code
- Appointments reference categories by ID
- Category colors/styles applied to appointment display
- Missing category ID results in default styling

---

## Error Handling Contract

### Error Types

1. **ValidationError**: Invalid input data
   - Fields: `field: string`, `message: string`
   - Example: `{ field: 'title', message: 'Title is required' }`

2. **NotFoundError**: Appointment not found
   - Fields: `id: string`
   - Example: `{ id: '550e8400-...', message: 'Appointment not found' }`

3. **StorageError**: localStorage unavailable or quota exceeded
   - Fields: `message: string`
   - Example: `{ message: 'localStorage quota exceeded' }`

### Error Handling

- All service methods return promises (can throw errors)
- Components should handle errors gracefully
- Show user-friendly error messages
- Log errors for debugging (development only)

---

## Versioning

**Current Version**: 1.0.0

**Breaking Changes**: None (initial version)

**Future Considerations**:
- May add appointment recurrence
- May add appointment reminders
- May add appointment participants
- May migrate to IndexedDB for larger datasets

---

## Testing Contract

### Test Requirements

- Appointment creation with valid data succeeds
- Appointment creation with invalid data fails validation
- Appointments persist across page reloads
- Appointments filter correctly by date
- Appointment updates modify correct appointment
- Appointment deletion removes appointment
- Overlapping appointments display correctly
- Categories apply correct colors/styles
