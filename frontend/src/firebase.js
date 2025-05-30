// frontend/src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


// IMPORTANT: Replace with YOUR project's config from the Firebase console
const firebaseConfig = {
  apiKey: "YOUR_NEW_FIREBASE_API_KEY",
  authDomain: "YOUR_NEW_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_NEW_PROJECT_ID",
  storageBucket: "YOUR_NEW_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_NEW_MESSAGING_SENDER_ID",
  appId: "YOUR_NEW_WEB_APP_ID",
  // measurementId: "G-XXXXXXXXXX" // Optional
};

let app = null;
let messaging = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);

  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground. ', payload);
    // Customize notification handling for foreground messages
    // For example, show a custom toast notification
    // Or use the Notification API directly if desired
    if (payload.notification) {
      new Notification(payload.notification.title || 'New Notification', {
        body: payload.notification.body,
        icon: payload.notification.icon,
      });
    }
  });
}

export { messaging, app };

export const requestNotificationPermissionAndGetToken = async () => {
  if (!messaging) {
    console.log('Firebase Messaging is not initialized.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // IMPORTANT: Replace with YOUR VAPID key from Firebase Project Settings > Cloud Messaging > Web Push certificates
      const currentToken = await getToken(messaging, {
        vapidKey: "YOUR_NEW_VAPID_KEY_FROM_FIREBASE_CONSOLE",
      });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};