# Installation Guide

This guide provides step-by-step instructions for installing and setting up the Calendar Event Notifications application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

Before installing the application, ensure you have the following installed:

1. **Node.js** (version 18.x or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - Recommended: Use Node.js 18.x LTS or newer

2. **npm** (comes with Node.js) or **yarn**
   - Verify installation: `npm --version` or `yarn --version`
   - npm version 9.x or higher recommended

3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: At least 500MB free space
- **Browser**: Modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)

## Installation Methods

### Method 1: Using Git Clone (Recommended for Development)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd calendar-event-notifications
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This will install all required packages listed in `package.json`.

3. **Verify installation**:
   ```bash
   npm run build
   ```
   If the build completes without errors, installation was successful.

### Method 2: Using npm/yarn (If Available as Package)

If the application is published as an npm package:

```bash
npm install calendar-event-notifications
# or
yarn add calendar-event-notifications
```

## Development Setup

### Initial Setup

1. **Navigate to project directory**:
   ```bash
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

4. **Open in browser**:
   - The application will be available at `http://localhost:3000`
   - The terminal will display the exact URL

### Development Scripts

The following scripts are available in `package.json`:

- **`npm run dev`**: Start development server with hot reload
- **`npm run build`**: Build the application for production
- **`npm run start`**: Start production server (requires build first)
- **`npm run lint`**: Run ESLint to check code quality
- **`npm run test`**: Run test suite with Jest
- **`npm run test:watch`**: Run tests in watch mode
- **`npm run test:coverage`**: Run tests with coverage report

### Environment Variables

Create a `.env.local` file in the project root for local development:

```env
# Example environment variables (if needed)
NODE_ENV=development
```

Currently, the application doesn't require environment variables, but you can add them for future features.

### Development Tools

The project uses:

- **Next.js 14**: React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Jest**: Testing framework
- **ESLint**: Code linting

## Production Deployment

### Building for Production

1. **Create production build**:
   ```bash
   npm run build
   ```

2. **Verify build output**:
   - Check the `.next` directory for build artifacts
   - Review build logs for any warnings or errors

3. **Start production server**:
   ```bash
   npm run start
   ```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to configure your deployment.

3. **Or use Vercel Dashboard**:
   - Connect your GitHub repository
   - Vercel will automatically detect Next.js
   - Deploy with one click

#### Option 2: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t calendar-notifications .
docker run -p 3000:3000 calendar-notifications
```

#### Option 3: Traditional Server (Node.js)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start npm --name "calendar-notifications" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 4: Static Export (Limited PWA Support)

If you need static hosting:

1. **Update `next.config.js`**:
   ```javascript
   module.exports = {
     output: 'export',
     // ... other config
   };
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Deploy `out` directory** to any static host (GitHub Pages, Netlify, etc.)

**Note**: Static export disables some Next.js features and PWA capabilities may be limited.

## Configuration

### PWA Configuration

The application uses `next-pwa` for Progressive Web App capabilities. Configuration is in `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});
```

**Key settings**:
- **`dest: 'public'`**: Service worker files are placed in the `public` directory
- **`register: true`**: Automatically registers the service worker
- **`skipWaiting: true`**: New service workers activate immediately
- **`disable: development`**: PWA is disabled in development mode

### Manifest Configuration

The PWA manifest is located at `public/manifest.json`. Customize it for your deployment:

```json
{
  "name": "Calendar Event Notifications",
  "short_name": "Calendar Notifications",
  "description": "Calendar Event Notifications PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### TypeScript Configuration

TypeScript settings are in `tsconfig.json`. Key paths:

- **`@/*`**: Maps to project root (used for imports)
- **Strict mode**: Enabled for type safety

### Tailwind CSS Configuration

Tailwind configuration is in `tailwind.config.ts`. Customize:
- Color schemes
- Breakpoints
- Font families
- Custom utilities

## Verification

### Verify Installation

1. **Check Node.js version**:
   ```bash
   node --version
   # Should be 18.x or higher
   ```

2. **Check npm version**:
   ```bash
   npm --version
   # Should be 9.x or higher
   ```

3. **Verify dependencies**:
   ```bash
   npm list --depth=0
   # Should show all packages without errors
   ```

### Verify Application

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open browser** to `http://localhost:3000`

3. **Check console** (F12 → Console) for errors

4. **Test features**:
   - Add a test event (+1 min button)
   - Navigate to Board page
   - Verify user filtering works

### Verify PWA

1. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

2. **Open in browser** (use HTTPS or localhost)

3. **Check PWA installation**:
   - Look for install prompt in address bar
   - Check `Application` tab in DevTools → `Service Workers`
   - Verify service worker is registered

4. **Test offline**:
   - Install as PWA
   - Disconnect internet
   - Verify app still loads

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

All tests should pass. Check `coverage/` directory for coverage reports.

## Troubleshooting

### Installation Issues

**Problem**: `npm install` fails with permission errors.

**Solution**:
```bash
# Use npm with sudo (not recommended)
sudo npm install

# Or better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**Problem**: Dependencies fail to install.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Problem**: Build fails with TypeScript errors.

**Solution**:
- Check `tsconfig.json` configuration
- Ensure all TypeScript dependencies are installed
- Run `npm run lint` to identify issues

### Development Server Issues

**Problem**: Port 3000 is already in use.

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process using port 3000
# On Linux/Mac:
lsof -ti:3000 | xargs kill
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Problem**: Hot reload not working.

**Solution**:
- Check file watcher limits (Linux): `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- Restart development server
- Clear `.next` directory: `rm -rf .next`

### Production Build Issues

**Problem**: Build fails with memory errors.

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Problem**: PWA not working in production.

**Solution**:
- Ensure deployment uses HTTPS (required for PWA)
- Check `next.config.js` PWA configuration
- Verify `public/manifest.json` exists
- Check browser console for service worker errors

### Browser Compatibility

**Problem**: App doesn't work in certain browsers.

**Solution**:
- Ensure browser supports ES6+ JavaScript
- Check browser console for errors
- Verify localStorage is enabled
- Test in Chrome/Firefox first (most compatible)

## Next Steps

After successful installation:

1. **Read the User Guide** (`docs/user-guide.md`) to learn how to use the application
2. **Read the Developer Guide** (`docs/developer-guide.md`) to understand the codebase
3. **Explore the code** starting with `app/page.tsx` and `app/board/page.tsx`
4. **Run tests** to verify everything works
5. **Start developing** new features!

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review browser console for errors
3. Check GitHub issues (if repository is public)
4. Consult the Developer Guide for technical details

---

**Note**: This application stores data locally in the browser's localStorage. No backend server is required for basic functionality.
