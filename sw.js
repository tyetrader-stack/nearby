/* nearby — service worker for web push */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }

  const title = data.title || "nearby";
  const options = {
    body: data.body || "",
    tag: data.tag || "nearby-" + Date.now(),
    data: { url: data.url || "./" },
    vibrate: [80, 40, 80],
  };

  const tasks = [self.registration.showNotification(title, options)];
  if (self.navigator && self.navigator.setAppBadge) {
    tasks.push(self.navigator.setAppBadge().catch(() => {}));
  }
  event.waitUntil(Promise.all(tasks));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
