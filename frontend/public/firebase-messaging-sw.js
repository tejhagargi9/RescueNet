// frontend/public/firebase-messaging-sw.js

// Scripts for Firebase products are imported from the CDN here.
// Make sure you are using versions compatible with your firebase.ts SDK versions
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js'); // Adjust version if needed
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'); // Adjust version if needed

// IMPORTANT: Initialize Firebase with YOUR project's config
// This config MUST match the one in your frontend/src/firebase.ts
const firebaseConfig = {
  apiKey: "YOUR_NEW_FIREBASE_API_KEY", // From your new Firebase project
  authDomain: "YOUR_NEW_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_NEW_PROJECT_ID",
  storageBucket: "YOUR_NEW_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_NEW_MESSAGING_SENDER_ID",
  appId: "YOUR_NEW_WEB_APP_ID",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New RescueNet Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new alert.',
    icon: payload.notification?.icon || '/RescueNetLogo.png', // Ensure RescueNetLogo.png is in public folder
    // data will contain the click_action if set by backend via webpush.fcm_options.link
    data: { click_action: payload.fcmOptions?.link || payload.data?.click_action || `${self.location.origin}/sos-alerts` },
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const defaultUrl = `${self.location.origin}/sos-alerts`;
  // Use the click_action from the data object set in onBackgroundMessage
  const urlToOpen = event.notification.data?.click_action || defaultUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});