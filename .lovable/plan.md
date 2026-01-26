

# PWA Enhancements Plan

## Overview

Add three enhancements to improve the Progressive Web App experience:
1. **Offline Indicator Banner** - Visual feedback when internet connection is lost
2. **iOS Splash Screen Images** - Polished launch experience on Apple devices
3. **Service Worker Update Notification** - Prompt users to refresh for new versions

---

## 1. Offline Indicator Banner

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useOnlineStatus.ts` | Hook to detect online/offline state changes |
| `src/components/OfflineBanner.tsx` | Top banner showing offline status |

### Hook: useOnlineStatus.ts

```text
- Track navigator.onLine state
- Listen to 'online' and 'offline' window events
- Return { isOnline, isOffline } booleans
- Auto-dismiss visual when connection restores
```

### Component: OfflineBanner.tsx

```text
┌─────────────────────────────────────────────────────────┐
│ ⚠️ WifiOff  You're offline · Changes saved locally      │
└─────────────────────────────────────────────────────────┘
```

**Design:**
- Fixed position at top of screen (above other content)
- Yellow/amber warning color scheme (`bg-amber-500 text-white`)
- Animated slide-in from top (`animate-in slide-in-from-top`)
- Auto-hides when connection restores
- Shows reassuring message about local data persistence

### Integration

Add to `App.tsx` alongside `InstallPromptBanner`:
```text
<OfflineBanner />
<InstallPromptBanner />
```

---

## 2. iOS Splash Screen Images

### Required Assets

iOS requires specific splash screen sizes for different devices. Create these images in `public/`:

| Filename | Size | Devices |
|----------|------|---------|
| `apple-splash-1125x2436.png` | 1125×2436 | iPhone X/XS/11 Pro |
| `apple-splash-1242x2688.png` | 1242×2688 | iPhone XS Max/11 Pro Max |
| `apple-splash-1170x2532.png` | 1170×2532 | iPhone 12/13 Pro |
| `apple-splash-1284x2778.png` | 1284×2778 | iPhone 12/13 Pro Max |
| `apple-splash-2048x2732.png` | 2048×2732 | iPad Pro 12.9" |
| `apple-splash-1668x2388.png` | 1668×2388 | iPad Pro 11" |

**Design Spec:**
- Teal background (#0D7377) matching theme-color
- Centered Zero Hero logo (from `/assets/zero-hero-logo.svg`)
- White logo on teal background

### HTML Meta Tags

Add to `index.html` `<head>`:
```text
<!-- iOS Splash Screens -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-1125x2436.png"
      media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
<!-- ... additional sizes ... -->

<!-- iOS Status Bar Style -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Zero Hero">
```

---

## 3. Service Worker Update Notification

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useServiceWorkerUpdate.ts` | Detect SW updates from vite-plugin-pwa |
| `src/components/UpdateAvailableBanner.tsx` | Prompt user to refresh |

### Hook: useServiceWorkerUpdate.ts

```text
- Use virtual:pwa-register API from vite-plugin-pwa
- Detect when new SW waiting to activate
- Expose { needRefresh, updateServiceWorker } 
- Handle skipWaiting and reload
```

### Component: UpdateAvailableBanner.tsx

```text
┌─────────────────────────────────────────────────────────┐
│ ✨ SparklesIcon  New version available    [Refresh Now] │
└─────────────────────────────────────────────────────────┘
```

**Design:**
- Fixed position at bottom (above InstallPromptBanner if both shown)
- Primary gradient background (matching install banner style)
- "Refresh Now" button triggers `updateServiceWorker(true)`
- Dismiss button to ignore this update

### Vite Config Update

Modify `vite.config.ts` to change `registerType` from `'autoUpdate'` to `'prompt'`:

```text
VitePWA({
  registerType: 'prompt',  // Changed from 'autoUpdate'
  // ... rest stays same
})
```

This allows the app to show a prompt before applying updates instead of auto-updating.

### Integration

Add to `App.tsx`:
```text
<UpdateAvailableBanner />
<OfflineBanner />
<InstallPromptBanner />
```

---

## Technical Details

### useOnlineStatus.ts Structure

```text
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}
```

### useServiceWorkerUpdate.ts Structure

```text
import { useRegisterSW } from 'virtual:pwa-register/react';

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const dismissUpdate = () => setNeedRefresh(false);
  
  return {
    needRefresh,
    updateServiceWorker: () => updateServiceWorker(true),
    dismissUpdate
  };
}
```

### TypeScript Declaration

Add `src/vite-pwa.d.ts`:
```text
declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: { ... }): { ... };
}
```

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useOnlineStatus.ts` | Online/offline detection |
| `src/hooks/useServiceWorkerUpdate.ts` | SW update detection |
| `src/components/OfflineBanner.tsx` | Offline status banner |
| `src/components/UpdateAvailableBanner.tsx` | Update prompt banner |
| `src/vite-pwa.d.ts` | TypeScript declarations for PWA virtual module |
| `public/apple-splash-*.png` | iOS splash screen images (6 files) |

### Modified Files

| File | Change |
|------|--------|
| `index.html` | Add iOS splash screen meta tags and apple-mobile-web-app tags |
| `vite.config.ts` | Change registerType to 'prompt' |
| `src/App.tsx` | Add OfflineBanner and UpdateAvailableBanner components |

---

## Implementation Order

1. Create `useOnlineStatus` hook
2. Create `OfflineBanner` component
3. Create `useServiceWorkerUpdate` hook and TypeScript declaration
4. Create `UpdateAvailableBanner` component
5. Update `vite.config.ts` to use prompt registration
6. Update `App.tsx` to include new banners
7. Add iOS splash screen meta tags to `index.html`
8. Generate iOS splash screen images (placeholder PNGs with correct dimensions)

---

## Visual Priority (Bottom of Screen)

When multiple banners could show:
```text
┌────────────────────────────────────────────┐
│ Main App Content                           │
│                                            │
├────────────────────────────────────────────┤
│ [Update Available Banner - z-51]           │
├────────────────────────────────────────────┤
│ [Install Prompt Banner - z-50]             │
└────────────────────────────────────────────┘
```

The offline banner appears at the **top** of the screen since it's a status indicator, not an action prompt.

