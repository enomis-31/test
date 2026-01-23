# Tasks: Calendar with Appointments

**Input**: Design documents from `/specs/001-calendar-appointments/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not requested in the feature specification. Manual testing per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` at repository root
- Paths follow plan.md structure: frontend/src/components/, frontend/src/lib/, frontend/src/types/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create frontend project structure per implementation plan (frontend/src/components/calendar/, frontend/src/lib/, frontend/src/types/)
- [ ] T002 Install date-fns package: `npm install date-fns`
- [ ] T003 [P] Verify ShadCN UI is already set up (from theme feature)
- [ ] T004 [P] Verify TypeScript configuration is set up

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create TypeScript types for Appointment entity in `frontend/src/types/appointment.ts`
- [ ] T006 Create TypeScript types for Category entity in `frontend/src/types/appointment.ts`
- [ ] T007 Define DEFAULT_CATEGORIES constant with predefined categories in `frontend/src/types/appointment.ts`
- [ ] T008 Create calendar utility functions (generateTimeSlots, getHourFromTime) in `frontend/src/lib/calendar.ts` using date-fns
- [ ] T009 Create appointment service base structure (getAppointments, localStorage helpers) in `frontend/src/lib/appointments.ts`
- [ ] T010 Create CSS Grid layout structure for calendar view in `frontend/src/components/calendar/CalendarView.tsx` (empty component with grid setup)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Calendar with Hourly Time Slots (Priority: P1) 🎯 MVP

**Goal**: Users can view a calendar interface organized by hours of the day, allowing them to see the time structure for scheduling appointments

**Independent Test**: Display a calendar view with hours of the day (00:00 to 23:59) organized in a clear, readable format. Verify all 24 hours are visible and clearly labeled, and that navigation between days maintains the hourly time structure consistently.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement time slot generation logic using date-fns in `frontend/src/lib/calendar.ts` (generateTimeSlots function)
- [ ] T012 [US1] Create TimeSlot component to display individual hour slots in `frontend/src/components/calendar/TimeSlot.tsx`
- [ ] T013 [US1] Implement CalendarView component with CSS Grid layout for 24-hour time slots in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T014 [US1] Add time labels display (HH:MM format) for each hour slot in `frontend/src/components/calendar/TimeSlot.tsx`
- [ ] T015 [US1] Implement day navigation (previous/next day buttons) in `frontend/src/components/calendar/CalendarView.tsx` using date-fns
- [ ] T016 [US1] Add scrollable container for 24-hour calendar view in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T017 [US1] Display current date header with formatted date in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T018 [US1] Verify calendar displays all 24 hours (00:00 to 23:59) with clear time labels

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view the calendar with hourly time structure and navigate between days.

---

## Phase 4: User Story 2 - Create Appointments (Priority: P2)

**Goal**: Users can create appointments by selecting a time slot and providing appointment details, which are then displayed in the calendar

**Independent Test**: Create a new appointment with a time, title, and optional details, then verify it appears in the correct time slot on the calendar. Verify appointment persists after page refresh.

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement createAppointment function with validation in `frontend/src/lib/appointments.ts`
- [ ] T020 [P] [US2] Implement getAppointmentsByDate function to filter appointments by date in `frontend/src/lib/appointments.ts`
- [ ] T021 [US2] Create AppointmentForm component with title, start time, end time, and description fields in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T022 [US2] Add form validation (title required, end time after start time) in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T023 [US2] Implement time slot click handler to open appointment form with pre-filled time in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T024 [US2] Create AppointmentCard component to display appointment in time slot in `frontend/src/components/calendar/AppointmentCard.tsx`
- [ ] T025 [US2] Implement appointment display logic (filter by date, map to time slots) in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T026 [US2] Add appointment form submission handler to save to localStorage in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T027 [US2] Implement appointment persistence to localStorage in `frontend/src/lib/appointments.ts` (save after create)
- [ ] T028 [US2] Add appointment loading from localStorage on calendar view mount in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T029 [US2] Handle appointments spanning multiple hours (display across multiple time slots) in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T030 [US2] Verify appointments appear in correct time slots and persist across page refreshes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view the calendar and create appointments that are displayed and persisted.

---

## Phase 5: User Story 3 - Categorize Appointments with Types/States (Priority: P3)

**Goal**: Users can assign categories or states to appointments to distinguish different types of appointments

**Independent Test**: Create appointments and assign different categories or states, then verify that appointments are visually distinguished by their category in the calendar view.

### Implementation for User Story 3

- [ ] T031 [P] [US3] Add category selection field to AppointmentForm component in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T032 [US3] Implement category color mapping (get category color from DEFAULT_CATEGORIES) in `frontend/src/components/calendar/AppointmentCard.tsx`
- [ ] T033 [US3] Apply category colors to appointment cards (border, background, or accent) in `frontend/src/components/calendar/AppointmentCard.tsx`
- [ ] T034 [US3] Add category icons or labels to appointment display in `frontend/src/components/calendar/AppointmentCard.tsx`
- [ ] T035 [US3] Update appointment creation to include category field in `frontend/src/lib/appointments.ts`
- [ ] T036 [US3] Verify appointments with different categories are visually distinguishable in calendar view
- [ ] T037 [US3] Test category assignment and visual distinction for all default categories (meeting, personal, urgent, completed)

**Checkpoint**: All user stories should now be independently functional. Appointments can be categorized and visually distinguished.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Implement appointment edit functionality (click appointment to edit) in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T039 [P] Implement appointment delete functionality in `frontend/src/lib/appointments.ts` and `frontend/src/components/calendar/AppointmentCard.tsx`
- [ ] T040 Handle overlapping appointments display (side-by-side layout) in `frontend/src/components/calendar/TimeSlot.tsx`
- [ ] T041 Add error handling for localStorage quota exceeded in `frontend/src/lib/appointments.ts`
- [ ] T042 Add error handling for invalid appointment data (validation errors) in `frontend/src/components/calendar/AppointmentForm.tsx`
- [ ] T043 Implement graceful degradation when localStorage is unavailable (private browsing) in `frontend/src/lib/appointments.ts`
- [ ] T044 Add loading states and feedback for appointment operations in `frontend/src/components/calendar/CalendarView.tsx`
- [ ] T045 Verify calendar performance with 100+ appointments per day
- [ ] T046 [P] Add responsive design for mobile devices (calendar view adapts to screen size)
- [ ] T047 [P] Run quickstart.md validation to ensure all steps work correctly
- [ ] T048 Code cleanup and refactoring of calendar components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 calendar view but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US2 appointments with categorization, independently testable

### Within Each User Story

- Types and utilities before components
- Calendar utilities before calendar view
- Appointment service before appointment form
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- Foundational tasks T005-T007 (types) can run in parallel
- T011 and T012 can run in parallel (utilities and component structure)
- T019 and T020 can run in parallel (appointment service functions)
- T031 and T032 can run in parallel (form field and display logic)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Calendar utilities and component structure can be created in parallel:
Task: "Implement time slot generation logic in frontend/src/lib/calendar.ts"
Task: "Create TimeSlot component in frontend/src/components/calendar/TimeSlot.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Appointment service functions can be created in parallel:
Task: "Implement createAppointment function in frontend/src/lib/appointments.ts"
Task: "Implement getAppointmentsByDate function in frontend/src/lib/appointments.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Calendar View)
   - Developer B: User Story 2 (Create Appointments) - can start in parallel
   - Developer C: User Story 3 (Categories) - can start in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing per constitution (formal tests optional)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Calendar uses CSS Grid for layout (per research.md)
- Appointments stored as array in localStorage (per data-model.md)
- date-fns used for all date/time operations (per research.md)
