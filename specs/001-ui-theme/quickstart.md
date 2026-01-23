# Quickstart: UI Theme System Implementation

**Date**: 2025-01-27  
**Feature**: UI Theme System  
**Purpose**: Get the theme system up and running quickly

## Prerequisites

- Node.js 18+ installed
- Package manager (npm, yarn, or pnpm)
- React project initialized (or Next.js, Remix, etc.)

## Step 1: Install Dependencies

```bash
# Install ShadCN UI (if not already installed)
npx shadcn-ui@latest init

# Install theme management library
npm install next-themes
# or
yarn add next-themes
# or
pnpm add next-themes
```

## Step 2: Configure Tailwind for Dark Mode

Update `tailwind.config.js` (or `tailwind.config.ts`):

```javascript
module.exports = {
  darkMode: ["class"], // Enable class-based dark mode
  // ... rest of config
}
```

## Step 3: Set Up CSS Variables

Add to your global CSS file (e.g., `globals.css`):

```css
@layer base {
  :root {
    /* Brand colors - Light theme */
    --color-brand-purple: 262 83% 58%;
    --color-brand-orange: 24 95% 53%;
    
    /* ShadCN UI colors - Light theme */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 262 83% 58%; /* Use brand purple */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 24 95% 53%; /* Use brand orange */
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 262 83% 58%; /* Use brand purple */
  }

  .dark {
    /* Brand colors - Dark theme (lighter for contrast) */
    --color-brand-purple: 262 83% 70%;
    --color-brand-orange: 24 95% 65%;
    
    /* ShadCN UI colors - Dark theme */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 262 83% 70%; /* Use brand purple */
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 24 95% 65%; /* Use brand orange */
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 262 83% 70%; /* Use brand purple */
  }

  /* Smooth transitions */
  * {
    @apply transition-colors;
  }
}
```

**Note**: Colors use HSL format without `hsl()` wrapper (Tailwind format). Adjust lightness values to meet contrast requirements.

## Step 4: Wrap App with ThemeProvider

In your app entry point (e.g., `App.tsx`, `_app.tsx`, `root.tsx`):

```tsx
import { ThemeProvider } from 'next-themes'

export default function App({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}
```

## Step 5: Create Theme Toggle Component

Create `components/theme/ThemeToggle.tsx`:

```tsx
'use client' // If using Next.js App Router

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Step 6: Add Toggle to UI

Add the toggle component to your header/navigation:

```tsx
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <ThemeToggle />
    </header>
  )
}
```

## Step 7: Verify Implementation

1. **Test theme switching**:
   - Click the theme toggle
   - Verify all components update immediately
   - Check that colors transition smoothly

2. **Test persistence**:
   - Select a theme
   - Refresh the page
   - Verify theme is maintained

3. **Test brand colors**:
   - Verify purple and orange appear in buttons, links, accents
   - Check both light and dark themes
   - Verify contrast ratios meet WCAG AA

4. **Test system preference** (optional):
   - Set `theme="system"` in ThemeProvider
   - Change OS theme preference
   - Verify app follows system preference

## Troubleshooting

### Flash of Wrong Theme

**Problem**: Page briefly shows light theme before dark theme loads.

**Solution**: Ensure ThemeProvider applies theme class before first render. For Next.js, use `suppressHydrationWarning`:

```tsx
<html suppressHydrationWarning>
```

### Colors Not Updating

**Problem**: Theme changes but colors stay the same.

**Solution**: 
- Verify CSS variables are defined in both `:root` and `.dark`
- Check that Tailwind config has `darkMode: ["class"]`
- Ensure components use CSS variables, not hardcoded colors

### localStorage Errors

**Problem**: Errors in console about localStorage.

**Solution**: 
- Check if private browsing mode is enabled
- Verify storage quota not exceeded
- Theme provider should handle this gracefully

## Next Steps

- Customize brand color values to match exact brand guidelines
- Test contrast ratios and adjust colors if needed
- Add theme toggle to all relevant pages
- Consider adding system preference option to toggle
- Document theme usage in component library

## Resources

- [ShadCN UI Documentation](https://ui.shadcn.com)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
