/*
 * Retires the copy of Fish Fight that used to be built into this site. Browsers that installed it
 * pick this up through their normal update check: it removes Fish Fight's caches and unregisters
 * itself, so the next visit loads index.html here, which forwards to the game's own deployment
 * (https://nafeesmansoor.github.io/fish-fight/). It never reloads an open page, so a match in
 * progress is not interrupted.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('fish-fight-v')).map((k) => caches.delete(k)));
      await self.registration.unregister();
    })(),
  );
});
