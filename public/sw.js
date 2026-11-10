/* AKUA Service : réception des notifications push de l'espace administrateur. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "AKUA Service", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "AKUA Service";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/akua-192.png",
      badge: "/icons/akua-badge-96.png",
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || "/spaceakua" },
      lang: "fr",
    }),
  );
});

// toucher la notification : ouvre (ou ramène au premier plan) la bonne page de l'espace
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/spaceakua", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if (c.url.startsWith(self.location.origin + "/spaceakua")) {
          await c.focus();
          if ("navigate" in c) return c.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
