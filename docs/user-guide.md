# User Guide

Welcome to the Calendar Event Notifications application! This guide will help you understand how to use the application from an end-user perspective.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Calendar Event Notifications](#calendar-event-notifications)
- [Kanban Board](#kanban-board)
- [User Filtering](#user-filtering)
- [Workload Indicators](#workload-indicators)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Troubleshooting](#troubleshooting)

## Overview

This application provides two main features:

1. **Calendar Event Notifications**: Receive timely notifications when your scheduled calendar events are about to start or have started.
2. **Kanban Board**: Manage tasks and work items with user filtering and workload monitoring capabilities.

The application works entirely in your web browser and can be installed as a Progressive Web App (PWA) on your mobile device or desktop.

## Getting Started

### First Launch

1. Open the application in your web browser.
2. The home page displays the Calendar Notifications interface.
3. Navigate to the Board page using the navigation menu to access the Kanban board.

### Browser Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support (available in all modern browsers)

## Calendar Event Notifications

### Understanding Notifications

The application monitors your calendar events and displays notifications when an event's scheduled time arrives. Notifications only appear when:
- The application is open in your browser
- The browser tab is active (visible)
- An event's start time falls within ±5 seconds of the current time

### Adding Test Events

On the home page, you can quickly add test events to see how notifications work:

1. Click one of the quick-add buttons:
   - **+1 min**: Creates an event 1 minute from now
   - **+2 min**: Creates an event 2 minutes from now
   - **+5 min**: Creates an event 5 minutes from now
   - **+10 min**: Creates an event 10 minutes from now

2. The event will appear in the "Upcoming Events" list below.

3. Keep the app open and wait for the scheduled time. You'll receive:
   - A popup notification showing the event title and time
   - An audible sound alert (can be muted per notification)

### Viewing Upcoming Events

The home page displays all your scheduled events in chronological order:

- **Event Title**: The name of your event
- **Event Time**: When the event is scheduled
- **Past Events**: Events that have already passed are shown with reduced opacity

### Managing Events

- **Refresh List**: Click the "Refresh List" button to reload events from storage
- **Clear All**: Click the "Clear" button (trash icon) to remove all events

### Notification Behavior

- **Notification Timing**: The system checks for events every 60 seconds and triggers notifications within ±5 seconds of the event's scheduled time
- **Multiple Events**: If multiple events are scheduled for the same time, you'll receive a notification for each one
- **Dismissing Notifications**: Click the close button (×) on any notification popup to dismiss it
- **Viewing Details**: Click on a notification popup (not the close button) to view full event details including description

### Sound Notifications

- Sound plays automatically when a notification appears
- You can mute the sound for individual notifications using the mute button
- Sound preferences are not saved between sessions (each notification can be muted independently)

## Kanban Board

### Accessing the Board

Navigate to the Board page from the main navigation menu. The board displays all your cards (tasks/work items) in a grid layout.

### Understanding Cards

Each card represents a task or work item and displays:
- **Card Title**: The name of the task
- **Assigned User**: The person responsible for the task (or "Unassigned" if no one is assigned)

### Default Users

The board comes with three default users:
- Alice
- Bob
- Charlie

These users are automatically available for card assignment and filtering.

## User Filtering

### Filtering by User

To focus on a specific user's workload:

1. Use the **User Filter** dropdown at the top of the board
2. Select a user from the list
3. The board will immediately update to show only cards assigned to that user
4. The header will display: "Showing cards assigned to [User Name]"

### Clearing the Filter

- Click the **Clear Filter** button (or select "All Users" from the dropdown) to show all cards again
- The header will update to: "Showing all cards"

### Filter Persistence

Your filter selection is automatically saved and will be restored when you reload the page.

## Workload Indicators

### Understanding Workload Status

The application automatically monitors each user's workload based on the number of cards assigned to them:

- **OK Status** (Green): User has 3 or fewer cards assigned
- **Busy Status** (Red/Orange): User has more than 3 cards assigned

### Visual Indicators

When viewing a filtered board for a user with more than 3 cards:

1. **Status Badge**: The user's status badge changes from "OK" to "Busy"
2. **Card Count Badge**: A badge showing the total number of cards appears next to the user's name
3. **Color Highlight**: Visual highlighting draws attention to the overloaded status

### Real-Time Updates

Workload indicators update automatically when:
- Cards are assigned to a user
- Cards are reassigned to a different user
- Cards are removed or completed

The status changes immediately without requiring a page refresh.

## Progressive Web App (PWA)

### Installing the App

You can install this application on your device for easier access:

#### On Mobile (iOS/Android):

1. Open the application in your mobile browser
2. Look for the "Add to Home Screen" prompt, or:
   - **iOS Safari**: Tap the Share button → "Add to Home Screen"
   - **Android Chrome**: Tap the menu (⋮) → "Add to Home Screen" or "Install App"
3. The app icon will appear on your home screen
4. Tap the icon to launch the app in full-screen mode

#### On Desktop:

1. Look for the install icon in your browser's address bar
2. Click "Install" when prompted
3. The app will open in its own window

### Offline Capabilities

- The application works offline once installed as a PWA
- Your events and cards are stored locally in your browser
- Notifications continue to work when the app is open, even offline

### Benefits of PWA Installation

- Faster access (no need to open browser and navigate)
- App-like experience (full-screen, no browser UI)
- Offline functionality
- Home screen icon for quick access

## Troubleshooting

### Notifications Not Appearing

**Problem**: Events are scheduled but notifications don't appear.

**Solutions**:
- Ensure the browser tab is active (not minimized or in background)
- Check that the event time is in the future (not past)
- Wait up to 60 seconds for the next check cycle
- Verify the app is open and not closed

### Events Not Saving

**Problem**: Events disappear after adding them.

**Solutions**:
- Check that your browser supports localStorage
- Ensure you're not using private/incognito mode (which may restrict storage)
- Try refreshing the page

### Filter Not Working

**Problem**: User filter doesn't show expected cards.

**Solutions**:
- Verify cards are actually assigned to the selected user
- Check that the card's `assignedUserId` matches the user's ID
- Try clearing the filter and reapplying it
- Refresh the page

### Sound Not Playing

**Problem**: Notification appears but no sound plays.

**Solutions**:
- Check your device's volume settings
- Ensure your browser allows audio playback (some browsers block autoplay)
- Check if the notification was muted (look for mute icon)
- Verify browser permissions for audio

### PWA Installation Issues

**Problem**: Can't install the app as PWA.

**Solutions**:
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check that you're accessing the app over HTTPS (or localhost for development)
- Try clearing browser cache and cookies
- Ensure the browser supports PWA installation

### Performance Issues

**Problem**: App feels slow or unresponsive.

**Solutions**:
- Close unnecessary browser tabs
- Clear browser cache
- Ensure you have a stable internet connection (for initial load)
- Check browser console for errors (F12 → Console tab)

## Best Practices

### For Event Notifications

- Keep the app open in a tab when expecting notifications
- Add test events with short timeframes (1-2 minutes) to verify notifications work
- Use descriptive event titles to quickly identify notifications
- Dismiss notifications promptly to keep the interface clean

### For Kanban Board

- Regularly review workload indicators to balance team assignments
- Use filtering to focus on specific users when needed
- Keep card titles clear and descriptive
- Assign cards to users promptly to maintain accurate workload tracking

### General Tips

- Install as PWA for the best experience
- Keep the app updated by refreshing periodically
- Use the refresh buttons if data seems out of sync
- Clear old events periodically to maintain performance

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages (F12 → Console)
2. Verify your browser version is up to date
3. Try clearing browser cache and localStorage
4. Consult the Developer Guide for technical details

---

**Note**: This is a test application. Data is stored locally in your browser and will be cleared if you clear browser data or use private browsing mode.
