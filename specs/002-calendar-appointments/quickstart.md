# Quickstart: Calendar with Appointments Implementation

**Date**: 2025-01-27  
**Feature**: Calendar with Appointments  
**Purpose**: Get the calendar feature up and running quickly

## Prerequisites

- Node.js 18+ installed
- Package manager (npm, yarn, or pnpm)
- React project initialized with TypeScript
- ShadCN UI already set up (from theme feature)

## Step 1: Install Dependencies

```bash
# Install date handling library
npm install date-fns
# or
yarn add date-fns
# or
pnpm add date-fns
```

## Step 2: Create TypeScript Types

Create `frontend/src/types/appointment.ts`:

```typescript
export interface Appointment {
  id: string
  title: string
  startTime: string  // ISO 8601
  endTime?: string   // ISO 8601
  category?: string
  description?: string
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'meeting', name: 'Meeting', color: '#3b82f6', icon: 'calendar' },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: 'user' },
  { id: 'urgent', name: 'Urgent', color: '#ef4444', icon: 'alert-circle' },
  { id: 'completed', name: 'Completed', color: '#6b7280', icon: 'check-circle' }
]
```

## Step 3: Create Appointment Service

Create `frontend/src/lib/appointments.ts`:

```typescript
import { Appointment } from '@/types/appointment'
import { format, parseISO, isSameDay, startOfDay } from 'date-fns'

const STORAGE_KEY = 'appointments'

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading appointments:', error)
    return []
  }
}

export async function getAppointmentsByDate(date: Date): Promise<Appointment[]> {
  const appointments = await getAppointments()
  const targetDate = startOfDay(date)
  
  return appointments.filter(apt => {
    const aptDate = startOfDay(parseISO(apt.startTime))
    return isSameDay(aptDate, targetDate)
  })
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Appointment> {
  const appointment: Appointment = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const appointments = await getAppointments()
  appointments.push(appointment)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
  } catch (error) {
    throw new Error('Failed to save appointment: ' + error)
  }
  
  return appointment
}

export async function updateAppointment(
  id: string,
  data: Partial<Omit<Appointment, 'id' | 'createdAt'>>
): Promise<Appointment> {
  const appointments = await getAppointments()
  const index = appointments.findIndex(apt => apt.id === id)
  
  if (index === -1) {
    throw new Error('Appointment not found')
  }
  
  appointments[index] = {
    ...appointments[index],
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
  return appointments[index]
}

export async function deleteAppointment(id: string): Promise<void> {
  const appointments = await getAppointments()
  const filtered = appointments.filter(apt => apt.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
```

## Step 4: Create Calendar Utilities

Create `frontend/src/lib/calendar.ts`:

```typescript
import { format, addHours, startOfDay } from 'date-fns'

export interface TimeSlot {
  hour: number
  displayLabel: string
  startTime: Date
  endTime: Date
}

export function generateTimeSlots(date: Date, startHour: number = 0, endHour: number = 23): TimeSlot[] {
  const dayStart = startOfDay(date)
  const slots: TimeSlot[] = []
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const startTime = addHours(dayStart, hour)
    const endTime = addHours(startTime, 1)
    
    slots.push({
      hour,
      displayLabel: format(startTime, 'HH:mm'),
      startTime,
      endTime
    })
  }
  
  return slots
}

export function getHourFromTime(time: Date): number {
  return time.getHours()
}
```

## Step 5: Create Calendar View Component

Create `frontend/src/components/calendar/CalendarView.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { Appointment } from '@/types/appointment'
import { getAppointmentsByDate } from '@/lib/appointments'
import { generateTimeSlots } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { TimeSlot } from './TimeSlot'
import { AppointmentCard } from './AppointmentCard'

interface CalendarViewProps {
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function CalendarView({ selectedDate, onDateChange }: CalendarViewProps) {
  const [date, setDate] = useState(selectedDate || new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const timeSlots = generateTimeSlots(date)

  useEffect(() => {
    loadAppointments()
  }, [date])

  async function loadAppointments() {
    const apts = await getAppointmentsByDate(date)
    setAppointments(apts)
  }

  function handlePreviousDay() {
    const newDate = subDays(date, 1)
    setDate(newDate)
    onDateChange?.(newDate)
  }

  function handleNextDay() {
    const newDate = addDays(date, 1)
    setDate(newDate)
    onDateChange?.(newDate)
  }

  function getAppointmentsForSlot(slotHour: number): Appointment[] {
    return appointments.filter(apt => {
      const aptHour = new Date(apt.startTime).getHours()
      return aptHour === slotHour
    })
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <Button onClick={handlePreviousDay}>Previous</Button>
        <h2>{format(date, 'EEEE, MMMM d, yyyy')}</h2>
        <Button onClick={handleNextDay}>Next</Button>
      </div>
      
      <div className="calendar-grid">
        {timeSlots.map(slot => (
          <TimeSlot
            key={slot.hour}
            slot={slot}
            appointments={getAppointmentsForSlot(slot.hour)}
          />
        ))}
      </div>
    </div>
  )
}
```

## Step 6: Create Time Slot Component

Create `frontend/src/components/calendar/TimeSlot.tsx`:

```typescript
'use client'

import { Appointment } from '@/types/appointment'
import { AppointmentCard } from './AppointmentCard'

interface TimeSlotProps {
  slot: { hour: number; displayLabel: string; startTime: Date; endTime: Date }
  appointments: Appointment[]
  onSlotClick?: (time: Date) => void
}

export function TimeSlot({ slot, appointments, onSlotClick }: TimeSlotProps) {
  return (
    <div className="time-slot" onClick={() => onSlotClick?.(slot.startTime)}>
      <div className="time-label">{slot.displayLabel}</div>
      <div className="appointments-container">
        {appointments.map(apt => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>
    </div>
  )
}
```

## Step 7: Create Appointment Card Component

Create `frontend/src/components/calendar/AppointmentCard.tsx`:

```typescript
'use client'

import { Appointment } from '@/types/appointment'
import { DEFAULT_CATEGORIES } from '@/types/appointment'
import { format } from 'date-fns'

interface AppointmentCardProps {
  appointment: Appointment
  onClick?: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === appointment.category)
  const categoryColor = category?.color || '#6b7280'

  return (
    <div
      className="appointment-card"
      style={{ borderLeftColor: categoryColor }}
      onClick={() => onClick?.(appointment)}
    >
      <div className="appointment-title">{appointment.title}</div>
      {appointment.endTime && (
        <div className="appointment-time">
          {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
        </div>
      )}
    </div>
  )
}
```

## Step 8: Create Appointment Form Component

Create `frontend/src/components/calendar/AppointmentForm.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/types/appointment'
import { DEFAULT_CATEGORIES } from '@/types/appointment'
import { format } from 'date-fns'
import { createAppointment, updateAppointment } from '@/lib/appointments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AppointmentFormProps {
  appointment?: Appointment
  initialTime?: Date
  onSubmit: () => void
  onCancel: () => void
  isOpen: boolean
}

export function AppointmentForm({
  appointment,
  initialTime,
  onSubmit,
  onCancel,
  isOpen
}: AppointmentFormProps) {
  const [title, setTitle] = useState(appointment?.title || '')
  const [startTime, setStartTime] = useState(
    appointment?.startTime 
      ? format(new Date(appointment.startTime), "yyyy-MM-dd'T'HH:mm")
      : initialTime 
        ? format(initialTime, "yyyy-MM-dd'T'HH:mm")
        : ''
  )
  const [endTime, setEndTime] = useState(
    appointment?.endTime ? format(new Date(appointment.endTime), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [category, setCategory] = useState(appointment?.category || '')
  const [description, setDescription] = useState(appointment?.description || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    const data = {
      title: title.trim(),
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      category: category || undefined,
      description: description.trim() || undefined
    }

    try {
      if (appointment) {
        await updateAppointment(appointment.id, data)
      } else {
        await createAppointment(data)
      }
      onSubmit()
    } catch (error) {
      alert('Failed to save appointment: ' + error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="appointment-form-overlay">
      <form onSubmit={handleSubmit} className="appointment-form">
        <h2>{appointment ? 'Edit Appointment' : 'New Appointment'}</h2>
        
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Label htmlFor="startTime">Start Time *</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {DEFAULT_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="form-actions">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
```

## Step 9: Add Calendar Styles

Add to your global CSS or component styles:

```css
.calendar-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0;
  overflow-y: auto;
  flex: 1;
}

.time-slot {
  display: grid;
  grid-template-columns: 100px 1fr;
  min-height: 60px;
  border-bottom: 1px solid var(--border);
}

.time-label {
  padding: 0.5rem;
  font-weight: 500;
  border-right: 1px solid var(--border);
}

.appointments-container {
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.appointment-card {
  padding: 0.5rem;
  border-left: 3px solid;
  background: var(--card);
  border-radius: 4px;
  cursor: pointer;
}

.appointment-title {
  font-weight: 500;
}

.appointment-time {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.appointment-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.appointment-form {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
```

## Step 10: Integrate Calendar into App

Add CalendarView to your main app component:

```typescript
import { CalendarView } from '@/components/calendar/CalendarView'
import { AppointmentForm } from '@/components/calendar/AppointmentForm'
import { useState } from 'react'

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<Date | undefined>()

  return (
    <div>
      <CalendarView
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onTimeSlotClick={(time) => {
          setSelectedTime(time)
          setFormOpen(true)
        }}
      />
      <AppointmentForm
        initialTime={selectedTime}
        isOpen={formOpen}
        onSubmit={() => {
          setFormOpen(false)
          setSelectedTime(undefined)
        }}
        onCancel={() => {
          setFormOpen(false)
          setSelectedTime(undefined)
        }}
      />
    </div>
  )
}
```

## Step 11: Verify Implementation

1. **Test calendar display**:
   - Verify time slots display correctly (00:00 to 23:59)
   - Check day navigation works
   - Verify time labels are clear

2. **Test appointment creation**:
   - Click on a time slot
   - Fill in appointment form
   - Verify appointment appears in correct time slot
   - Check appointment persists after page refresh

3. **Test categories**:
   - Create appointments with different categories
   - Verify visual distinction (colors)
   - Check category selection works

4. **Test appointment editing**:
   - Click on existing appointment
   - Modify details
   - Verify changes are saved

## Troubleshooting

### Appointments not displaying

- Check localStorage contains data: `localStorage.getItem('appointments')`
- Verify date filtering logic (timezone issues)
- Check appointment startTime format (must be ISO 8601)

### Form not opening

- Verify `onTimeSlotClick` is passed to CalendarView
- Check form `isOpen` state management
- Verify click handlers are properly bound

### Categories not showing colors

- Verify category IDs match DEFAULT_CATEGORIES
- Check CSS custom properties for colors
- Verify AppointmentCard receives category color

## Next Steps

- Add appointment deletion functionality
- Implement appointment drag-and-drop (if needed)
- Add appointment search/filter
- Enhance overlap handling (side-by-side display)
- Add appointment reminders (future enhancement)

## Resources

- [date-fns Documentation](https://date-fns.org/)
- [ShadCN UI Components](https://ui.shadcn.com)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
