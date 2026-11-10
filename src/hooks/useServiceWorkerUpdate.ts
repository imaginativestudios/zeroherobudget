/// <reference types="vite-plugin-pwa/client" />
import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Keeps the installed app and the website on the newest publish.
 *
 * The service worker is registered here and re-checked every hour, so a new
 * publish is picked up without the user doing anything. The PWA is configured
 * with `registerType: 'autoUpdate'` (plus `skipWaiting`, `clientsClaim` and
 * `cleanupOutdatedCaches`), so once a new version is found it installs, takes
 * over the page and reloads it once onto itself. No banner or user action is
 * needed, and the plugin's own "activated" handling is what reloads the page,
 * so nothing here should add another reload listener.
 */
export function useServiceWorkerUpdate() {
  useEffect(() => {
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    let lastCheck = -Infinity;
    const check = () => {
      if (!registration || Date.now() - lastCheck < 60_000) return;
      lastCheck = Date.now();
      void registration.update().catch(() => { /* Offline: retry at the next check. */ });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    const hostname = window.location.hostname.toLowerCase();
    const platformDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(hostname);
    const preview = window.self !== window.top ||
      (platformDomain && /^(?:(?:id-preview|preview)(?:-[a-z0-9]+)?--.+|project--.+-dev)$/.test(hostname.split('.')[0])) ||
      /(^|\.)(lovableproject\.com|lovableproject-dev\.com|beta\.lovable\.dev)$/.test(hostname);
    if (!import.meta.env.PROD || preview || new URLSearchParams(window.location.search).get('sw') === 'off') {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(item => {
            const worker = item.active ?? item.waiting ?? item.installing;
            if (worker && new URL(worker.scriptURL).pathname === '/sw.js') void item.unregister();
          });
        });
      }
      return;
    }
    registerSW({
      immediate: true,
      onRegisteredSW(_url, value) {
        if (disposed || !value) return;
        registration = value;
        interval = setInterval(check, 60 * 60 * 1000);
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', check);
      },
    });
    return () => {
      disposed = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
    };
  }, []);
}
