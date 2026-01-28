# Developer Guide

This guide provides a technical overview of the Calendar Event Notifications application, including architecture, code structure, and contribution guidelines.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Code Organization](#code-organization)
- [Key Components](#key-components)
- [Services and Utilities](#services-and-utilities)
- [Data Models](#data-models)
- [State Management](#state-management)
- [Testing](#testing)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [Code Style](#code-style)
- [Performance Considerations](#performance-considerations)
- [Future Enhancements](#future-enhancements)

## Architecture Overview

### Application Type

This is a **Progressive Web Application (PWA)** built with **Next.js 14** using the App Router. It's a client-side application that runs entirely in the browser with no backend server required.

### Key Architectural Decisions

1. **Client-Side Only**: All data is stored in browser localStorage. No API calls or backend required.
2. **Component-Based**: React components organized by feature and UI type.
3. **Service Layer**: Business logic separated into service classes.
4. **Type Safety**: Full TypeScript implementation for type safety.
5. **PWA First**: Built as Progressive Web App with offline capabilities.

### Data Flow

```
User Interaction → React Component → Service/Utility → localStorage → Component Update
```

### Application Flow

1. **Event Notifications**:
   - `EventMonitor` service polls localStorage every 60 seconds
   - Checks for events within ±5 seconds of current time
   - Triggers notification callback when event found
   - `NotificationManager` displays popup and plays sound

2. **User Filtering**:
   - User selects filter from dropdown
   - `FilterService` filters cards array
   - Filter state saved to localStorage
   - Board re-renders with filtered cards

## Project Structure

```
calendar-event-notifications/
├── app/                          # Next.js App Router directory
│   ├── board/                    # Board page route
│   │   └── page.tsx              # Board page component
│   ├── components/               # React components
│   │   ├── board/                # Board-specific components
│   │   │   ├── UserFilter.tsx
│   │   │   ├── UserStatusBadge.tsx
│   │   │   └── WorkloadIndicator.tsx
│   │   ├── notifications/        # Notification components
│   │   │   ├── EventDetailsModal.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   ├── NotificationManager.tsx
│   │   │   └── NotificationPopup.tsx
│   │   └── ui/                   # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── select.tsx
│   ├── lib/                      # Library code
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── use-notifications.tsx
│   │   │   └── use-user-filter.ts
│   │   ├── services/              # Business logic services
│   │   │   ├── event-monitor.ts
│   │   │   ├── filter-service.ts
│   │   │   ├── notification-service.ts
│   │   │   └── workload-calculator.ts
│   │   └── utils/                 # Utility functions
│   │       ├── cn.ts
│   │       ├── date-utils.ts
│   │       ├── logger.ts
│   │       └── storage.ts
│   ├── types/                     # TypeScript type definitions
│   │   ├── event.ts
│   │   └── user.ts
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout component
│   └── page.tsx                   # Home page component
├── docs/                          # Documentation
│   ├── user-guide.md
│   ├── install-guide.md
│   └── developer-guide.md
├── public/                        # Static assets
│   ├── manifest.json              # PWA manifest
│   └── sounds/                    # Notification sounds
├── specs/                         # Feature specifications
│   ├── 001-event-notifications/
│   └── 001-user-filtering/
├── .eslintrc.json                 # ESLint configuration
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Jest setup file
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## Technology Stack

### Core Framework

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript 5**: Type-safe JavaScript

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities
- **Radix UI**: Accessible component primitives

### State Management

- **React Hooks**: `useState`, `useEffect`, `useMemo`
- **Custom Hooks**: `use-notifications`, `use-user-filter`
- **localStorage**: Client-side persistence

### Testing

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: DOM matchers

### PWA

- **next-pwa**: PWA plugin for Next.js
- **Service Workers**: Offline functionality

### Development Tools

- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Core Features

### 1. Calendar Event Notifications

**Purpose**: Monitor calendar events and trigger notifications when event times arrive.

**Key Components**:
- `EventMonitor` service: Polls and checks events
- `NotificationManager` component: Manages notification UI
- `NotificationPopup` component: Displays individual notifications
- `use-notifications` hook: React integration

**Flow**:
1. `EventMonitor.startMonitoring()` begins polling every 60 seconds
2. Checks localStorage for events within ±5 seconds of current time
3. Calls notification callback for matching events
4. `NotificationManager` displays popup and plays sound
5. User can dismiss or view details

### 2. User Filtering

**Purpose**: Filter Kanban board cards by assigned user.

**Key Components**:
- `FilterService`: Filtering logic
- `use-user-filter` hook: React state management
- `UserFilter` component: UI dropdown

**Flow**:
1. User selects user from dropdown
2. `FilterService.getFilteredCards()` filters cards array
3. Filter state saved to localStorage
4. Board re-renders with filtered cards

### 3. Workload Indicators

**Purpose**: Visual indicators for user workload based on card count.

**Key Components**:
- `WorkloadCalculator` service: Calculates workloads
- `UserStatusBadge` component: Displays status (OK/Busy)
- `WorkloadIndicator` component: Shows card count badge

**Logic**:
- ≤3 cards: "OK" status (green)
- >3 cards: "Busy" status (red/orange) with indicator

## Code Organization

### Component Organization

Components are organized by feature and type:

- **Feature Components**: `app/components/board/`, `app/components/notifications/`
- **UI Components**: `app/components/ui/` (reusable, generic components)
- **Page Components**: `app/page.tsx`, `app/board/page.tsx`

### Service Layer

Services contain business logic and are framework-agnostic:

- **EventMonitor**: Event polling and notification triggering
- **FilterService**: Card filtering logic
- **WorkloadCalculator**: Workload calculation
- **NotificationService**: Notification management (if needed)

### Utility Functions

Utilities are pure functions with no side effects:

- **storage.ts**: localStorage wrappers
- **date-utils.ts**: Date manipulation and comparison
- **logger.ts**: Logging utility
- **cn.ts**: Class name utility (Tailwind)

### Custom Hooks

Hooks bridge React components with services:

- **use-notifications**: Manages notification state and EventMonitor
- **use-user-filter**: Manages filter state and FilterService

## Key Components

### EventMonitor (`app/lib/services/event-monitor.ts`)

Singleton service that monitors calendar events.

**Key Methods**:
- `startMonitoring()`: Begins polling interval
- `stopMonitoring()`: Stops polling
- `checkEventsForNotifications()`: Checks for events needing notifications
- `setNotificationCallback()`: Sets callback for notifications
- `setVisibilityCallback()`: Sets callback for tab visibility check

**Configuration**:
- Polling interval: 60 seconds
- Time window: ±5 seconds

### NotificationManager (`app/components/notifications/NotificationManager.tsx`)

Manages notification state and UI.

**Responsibilities**:
- Receives events from EventMonitor
- Creates notification state objects
- Manages notification list
- Handles dismissal and details viewing

### FilterService (`app/lib/services/filter-service.ts`)

Static service for filtering cards.

**Key Methods**:
- `getFilteredCards()`: Filters cards by user ID
- `saveFilterToStorage()`: Persists filter selection
- `loadFilterFromStorage()`: Loads saved filter
- `clearFilter()`: Removes filter

### WorkloadCalculator (`app/lib/services/workload-calculator.ts`)

Calculates user workloads from cards.

**Key Methods**:
- `calculateUserWorkloads()`: Returns workload array for all users
- Determines status (OK/Busy) based on card count

## Services and Utilities

### Storage Utilities (`app/lib/utils/storage.ts`)

**Functions**:
- `saveToStorage()`: Save any value to localStorage
- `loadFromStorage()`: Load value with default fallback
- `saveEventToStorage()`: Save calendar event
- `getEventsFromStorage()`: Get all events
- `getEventsInTimeWindow()`: Get events within time window

**Storage Keys**:
- `calendar_events`: Calendar events array
- `kanban_cards`: Kanban cards array
- `kanban_users`: Users array
- `user_filter`: Selected user filter

### Date Utilities (`app/lib/utils/date-utils.ts`)

**Functions**:
- `isEventTimeInWindow()`: Check if event time is within ±N seconds
- Date comparison and formatting helpers

### Logger (`app/lib/utils/logger.ts`)

Structured logging utility.

**Usage**:
```typescript
const logger = createLogger('ComponentName');
logger.debug('Message', { context });
logger.info('Message', { context });
logger.warn('Message', { context });
logger.error('Message', error, { context });
```

## Data Models

### CalendarEvent (`app/types/event.ts`)

```typescript
interface CalendarEvent {
  id: string;                    // Unique identifier
  title: string;                 // Event title (max 200 chars)
  startTime: string;             // ISO 8601 datetime
  description?: string;           // Optional description (max 1000 chars)
  endTime?: string;              // Optional end time
  createdAt?: string;            // Creation timestamp
  updatedAt?: string;            // Last update timestamp
}
```

### User (`app/types/user.ts`)

```typescript
interface User {
  id: string;                    // Unique identifier
  name: string;                  // Display name
}
```

### Card (`app/types/user.ts`)

```typescript
interface Card {
  id: string;                    // Unique identifier
  title: string;                 // Card title
  assignedUserId?: string | null; // Assigned user ID (single user)
  columnId?: string;             // Column ID (for board organization)
}
```

### UserWorkload (`app/types/user.ts`)

```typescript
interface UserWorkload {
  userId: string;                // User ID
  cardCount: number;              // Number of assigned cards
  status: 'OK' | 'Busy';         // Workload status
  hasIndicator: boolean;          // Should show indicator (>3 cards)
}
```

## State Management

### Component State

Components use React hooks for local state:

- **`useState`**: Component-specific state
- **`useEffect`**: Side effects (storage sync, subscriptions)
- **`useMemo`**: Computed values (filtered cards, workloads)

### Persistent State

State persisted to localStorage:

- Calendar events
- Kanban cards
- Users
- User filter selection

### Global State

No global state management library. State flows through:

1. **Props**: Parent to child
2. **Callbacks**: Child to parent
3. **localStorage**: Cross-component persistence
4. **Services**: Shared business logic

## Testing

### Test Structure

Tests are co-located with source files:

```
app/lib/hooks/__tests__/use-notifications.test.tsx
app/lib/services/__tests__/event-monitor.test.ts
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Test Utilities

- **React Testing Library**: Component testing
- **Jest**: Test runner and assertions
- **@testing-library/user-event**: User interaction simulation

### Writing Tests

**Component Test Example**:
```typescript
import { render, screen } from '@testing-library/react';
import { UserFilter } from '@/app/components/board/UserFilter';

describe('UserFilter', () => {
  it('renders user dropdown', () => {
    render(<UserFilter users={mockUsers} />);
    expect(screen.getByText('Select User')).toBeInTheDocument();
  });
});
```

**Service Test Example**:
```typescript
import { FilterService } from '@/app/lib/services/filter-service';

describe('FilterService', () => {
  it('filters cards by user ID', () => {
    const cards = [/* ... */];
    const filtered = FilterService.getFilteredCards(cards, 'user-1');
    expect(filtered).toHaveLength(2);
  });
});
```

## Development Workflow

### Setting Up Development Environment

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd calendar-event-notifications
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: `http://localhost:3000`

### Making Changes

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**:
   - Write code
   - Add tests
   - Update documentation

3. **Test locally**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Checks

Before committing:

- **Linting**: `npm run lint`
- **Tests**: `npm run test`
- **Build**: `npm run build`
- **Type checking**: `tsc --noEmit` (if available)

## Contributing

### Contribution Guidelines

1. **Follow code style**: Use ESLint configuration
2. **Write tests**: New features require tests
3. **Update documentation**: Keep docs in sync with code
4. **Write clear commits**: Use conventional commit messages
5. **Keep PRs focused**: One feature/fix per PR

### Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Example: `feat: add dark mode toggle`

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** with tests and docs
3. **Ensure tests pass** and linting is clean
4. **Create PR** with clear description
5. **Address review feedback**
6. **Merge** after approval

## Code Style

### TypeScript

- **Strict mode**: Enabled in `tsconfig.json`
- **Type everything**: Avoid `any` type
- **Interfaces over types**: Prefer interfaces for objects
- **Explicit return types**: For public functions

### React

- **Functional components**: Use function components, not classes
- **Hooks**: Use hooks for state and effects
- **Props interface**: Define props interfaces
- **Component organization**: One component per file

### Naming Conventions

- **Components**: PascalCase (`UserFilter.tsx`)
- **Files**: kebab-case for utilities (`date-utils.ts`)
- **Functions**: camelCase (`getFilteredCards`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEY_EVENTS`)
- **Types/Interfaces**: PascalCase (`CalendarEvent`)

### File Organization

- **One component per file**: Except for closely related components
- **Co-locate tests**: Tests in `__tests__` directory next to source
- **Group by feature**: Organize by feature, not by type

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use `useMemo` for expensive calculations
2. **Event Debouncing**: Debounce rapid events (if needed)
3. **Lazy Loading**: Code splitting for large components
4. **localStorage**: Efficient storage reads/writes

### Current Optimizations

- **Workload calculation**: Memoized with `useMemo`
- **Filtered cards**: Computed on-demand
- **Event polling**: 60-second interval (not too frequent)
- **Notification deduplication**: Prevents duplicate notifications

### Performance Monitoring

- Check browser DevTools Performance tab
- Monitor localStorage operations
- Watch for unnecessary re-renders (React DevTools)

## Future Enhancements

### Potential Features

1. **Backend Integration**: API for syncing events across devices
2. **User Authentication**: Multi-user support
3. **Event Recurrence**: Recurring events support
4. **Notification Preferences**: User-configurable settings
5. **Dark Mode**: Theme switching
6. **Export/Import**: Data backup and restore
7. **Calendar Integration**: Sync with Google Calendar, Outlook
8. **Mobile App**: Native mobile applications
9. **Real-time Collaboration**: WebSocket support for board
10. **Advanced Filtering**: Multiple filter criteria

### Technical Improvements

1. **State Management**: Consider Zustand or Redux for complex state
2. **API Layer**: Abstract data access for future backend
3. **Error Boundaries**: Better error handling
4. **Accessibility**: Enhanced ARIA labels and keyboard navigation
5. **Internationalization**: Multi-language support
6. **Analytics**: Usage tracking (privacy-conscious)

## Additional Resources

### Documentation

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **React Docs**: [react.dev](https://react.dev)
- **TypeScript Docs**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Project-Specific

- **Feature Specs**: `specs/` directory
- **User Guide**: `docs/user-guide.md`
- **Install Guide**: `docs/install-guide.md`

### Getting Help

1. Check this guide first
2. Review feature specifications in `specs/`
3. Check browser console for errors
4. Review test files for usage examples
5. Consult Next.js/React documentation

---

**Happy Coding!** 🚀
