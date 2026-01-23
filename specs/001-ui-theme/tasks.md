# Tasks: UI Theme System

**Input**: Design documents from `/specs/001-ui-theme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not requested in the feature specification. Manual testing per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` at repository root
- Paths follow plan.md structure: frontend/src/components/, frontend/src/lib/, frontend/src/styles/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create frontend project structure per implementation plan
- [ ] T002 Initialize React project with TypeScript and required dependencies
- [ ] T003 [P] Install and configure ShadCN UI with `npx shadcn-ui@latest init`
- [ ] T004 [P] Install next-themes package: `npm install next-themes`
- [ ] T005 [P] Configure Tailwind CSS with dark mode class strategy in `frontend/tailwind.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Configure CSS custom properties structure in `frontend/src/styles/globals.css` with :root and .dark selectors
- [ ] T007 Define ShadCN UI semantic color variables (background, foreground, card, etc.) in `frontend/src/styles/globals.css`
- [ ] T008 Add CSS transitions for smooth theme switching in `frontend/src/styles/globals.css` with reduced-motion support
- [ ] T009 Wrap application root with ThemeProvider from next-themes in `frontend/src/app/` (or equivalent entry point)
- [ ] T010 Create theme utility file `frontend/src/lib/theme.ts` for theme-related helper functions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Theme Selection (Priority: P1) 🎯 MVP

**Goal**: Users can switch between light and dark theme modes with immediate visual feedback

**Independent Test**: Provide a theme toggle control and verify that switching between light and dark modes immediately updates the entire application interface. Theme changes should complete in under 1 second with smooth transitions.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create ThemeToggle component in `frontend/src/components/theme/ThemeToggle.tsx` using useTheme hook
- [ ] T012 [US1] Add theme toggle button with icon (Sun/Moon) and click handler in `frontend/src/components/theme/ThemeToggle.tsx`
- [ ] T013 [US1] Implement theme switching logic using setTheme() from useTheme hook in `frontend/src/components/theme/ThemeToggle.tsx`
- [ ] T014 [US1] Add ThemeToggle component to application header/navigation in main layout file
- [ ] T015 [US1] Verify theme class is applied to document root (html/body) when theme changes
- [ ] T016 [US1] Test theme switching works immediately across all visible components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can toggle between light and dark themes with immediate visual feedback.

---

## Phase 4: User Story 2 - Brand Color Consistency (Priority: P2)

**Goal**: Users see consistent brand colors (purple and orange) throughout the application interface in both light and dark themes

**Independent Test**: Verify that purple and orange brand colors appear consistently across all UI components (buttons, links, highlights, accents) and maintain appropriate contrast and readability in both light and dark themes. 100% of UI components should correctly display brand colors.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Define brand purple color variables (light and dark variants) in `frontend/src/styles/globals.css` using HSL format
- [ ] T018 [P] [US2] Define brand orange color variables (light and dark variants) in `frontend/src/styles/globals.css` using HSL format
- [ ] T019 [US2] Map brand purple to ShadCN UI primary color variable in `frontend/src/styles/globals.css`
- [ ] T020 [US2] Map brand orange to ShadCN UI accent color variable in `frontend/src/styles/globals.css`
- [ ] T021 [US2] Update ShadCN UI button components to use brand colors for primary and accent variants
- [ ] T022 [US2] Apply brand colors to interactive elements (links, focus rings, hover states) in component styles
- [ ] T023 [US2] Verify brand colors maintain WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text) in both themes
- [ ] T024 [US2] Adjust color lightness values if needed to meet contrast requirements in `frontend/src/styles/globals.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Brand colors are visible and consistent across all components in both themes.

---

## Phase 5: User Story 3 - Theme Preference Persistence (Priority: P3)

**Goal**: Users' theme preference is remembered across browser sessions and page navigations

**Independent Test**: Select a theme, close the application, reopen it, and verify that the previously selected theme is automatically applied. Theme preference should persist correctly for 100% of users.

### Implementation for User Story 3

- [ ] T025 [US3] Verify next-themes automatically persists theme to localStorage (default behavior)
- [ ] T026 [US3] Implement theme loading on app initialization in ThemeProvider configuration
- [ ] T027 [US3] Add error handling for localStorage unavailability (private browsing) with graceful fallback
- [ ] T028 [US3] Add validation for stored theme values (reset to 'light' if invalid) in theme utility
- [ ] T029 [US3] Test theme persistence across page refreshes and browser sessions
- [ ] T030 [US3] Verify default theme ('light') is applied when no preference is stored
- [ ] T031 [US3] Test system preference detection if 'system' theme option is implemented

**Checkpoint**: All user stories should now be independently functional. Theme preference persists correctly across sessions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] Verify theme consistency across all pages and views (kanban board, calendar, settings, etc.)
- [ ] T033 [P] Test theme transitions on slow network connections and low-performance devices
- [ ] T034 Test theme switching during active user interactions (e.g., while filling a form)
- [ ] T035 Verify no layout shifts occur during theme transitions
- [ ] T036 [P] Update documentation with theme usage guidelines in project README or docs/
- [ ] T037 Run quickstart.md validation to ensure all steps work correctly
- [ ] T038 Code cleanup and refactoring of theme-related components
- [ ] T039 Verify accessibility: all interactive elements meet contrast requirements in both themes

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 theme system but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 with persistence, independently testable

### Within Each User Story

- CSS variables and styles before components
- Theme infrastructure before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Brand color definitions (T017, T018) can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# ThemeToggle component can be created independently:
Task: "Create ThemeToggle component in frontend/src/components/theme/ThemeToggle.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Brand color definitions can be created in parallel:
Task: "Define brand purple color variables in frontend/src/styles/globals.css"
Task: "Define brand orange color variables in frontend/src/styles/globals.css"
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
   - Developer A: User Story 1 (Theme Selection)
   - Developer B: User Story 2 (Brand Colors) - can start in parallel
   - Developer C: User Story 3 (Persistence) - can start in parallel
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
- Theme system uses CSS variables for global theming (no component-level theme props needed)
- next-themes handles localStorage persistence automatically (minimal custom code needed)
