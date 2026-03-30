# Simple Time Tracking (Admin + Kiosk)

Multi-language (English/German) PWA time tracking app for tablets:
- **Kiosk mode**: tap on name for entry/exit/return
- **Admin mode**: manage employees + view hours and events + manual time editing

## Quick Start

1. **Development**: `npx serve .` → open http://localhost:3000
2. **Vercel Deploy**: Connect GitHub repo → auto-deploy
3. **Install as App**: Open in browser → Install prompt → Works offline

## Features

### Multi-language
- 🇺🇸 English (default)
- 🇩🇪 German (Deutsch)
- Auto-detects browser language, persists user choice

### PWA (Progressive Web App)
- ✅ Downloadable from website
- ✅ Works offline
- ✅ App-like experience
- ✅ Tablet optimized

### Admin Features
- Add/remove employees
- Manual time entry/editing
- Delete/modify sessions
- Real-time status overview
- Event history

## Default Login

- Username: `admin`
- Password: `admin123`

## Project Structure

```
src/
├── app.js              # Main app router
├── state/store.js      # localStorage + time logic
├── utils/
│   ├── time.js         # Date/time utilities
│   └── i18n.js         # Multi-language support
└── pages/
    ├── login/page.js   # Login screen
    ├── kiosk/page.js   # Employee check-in
    └── admin/page.js   # Management interface

manifest.json           # PWA configuration
sw.js                  # Service worker (offline)
icons/                 # App icons (all sizes)
```

## Deployment

Ready for instant Vercel deployment - just connect your Git repo!
