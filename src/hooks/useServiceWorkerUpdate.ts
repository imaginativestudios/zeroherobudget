import { useRegisterSW } from 'virtual:pwa-register/react';

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
  useRegisterSW({
    onRegistered(registration) {
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });
}
