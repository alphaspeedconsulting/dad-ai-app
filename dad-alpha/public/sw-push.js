self.addEventListener("push", function (event) {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: "Dad.alpha", body: event.data.text() }; }

  const title = data.title || "Dad.alpha";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: data.tag || "dad-alpha-notification",
    renotify: true,
    data: { url: data.url || "/dashboard", action_type: data.action_type, action_payload: data.action_payload },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  if (event.action === "sign_slip") { event.waitUntil(clients.openWindow("/chat/school_event_hub")); return; }
  if (event.action === "view_calendar") { event.waitUntil(clients.openWindow("/chat/calendar_whiz")); return; }
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) { client.navigate(url); return client.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
