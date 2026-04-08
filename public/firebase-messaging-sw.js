importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDmMr4B7pGQmD1euSt7p15j-wl7pkrSmtI",
  authDomain: "playymate-6f7b7.firebaseapp.com",
  projectId: "playymate-6f7b7",
  messagingSenderId: "140287703397",
  appId: "1:140287703397:web:25ce65144b49a8c531098c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("FCM: Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Playymate";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/playymate-icon.png",
    badge: "/playymate-icon.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  const urlToOpen = data?.url || "/home";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
