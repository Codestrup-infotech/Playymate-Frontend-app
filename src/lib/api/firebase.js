import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let messaging = null;
let auth = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
auth = getAuth(app);

const isSupported = () => {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
};

const initMessaging = async () => {
  if (!isSupported()) {
    console.log("FCM: Browser doesn't support Push API");
    return null;
  }
  
  const { getMessaging, getToken, onMessage } = await import("firebase/messaging");
  messaging = getMessaging(app);
  
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("FCM: Service worker registered:", registration);
    } catch (error) {
      console.error("FCM: Service worker registration failed:", error);
    }
  }
  
  return { getToken, onMessage };
};

export const requestFcmToken = async () => {
  if (!isSupported()) {
    console.log("FCM: Not supported in this environment");
    return null;
  }
  
  try {
    const { getToken } = await initMessaging();
    if (!getToken || !messaging) {
      console.log("FCM: Messaging not initialized");
      return null;
    }
    
    console.log("FCM: Requesting permission...");
    const permission = await Notification.requestPermission();
    console.log("FCM: Permission status:", permission);
    if (permission !== "granted") {
      console.log("FCM: Notification permission denied");
      return null;
    }

    console.log("FCM: Getting token with vapidKey:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.substring(0, 20) + "...");
    const fcmToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    console.log("FCM: Token obtained:", fcmToken);
    return fcmToken;
  } catch (error) {
    console.error("FCM: Error getting token:", error);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  if (!messaging) {
    return () => {};
  }
  
  return import("firebase/messaging").then(({ onMessage }) => {
    return onMessage(messaging, (payload) => {
      console.log("FCM: Foreground message received:", payload);
      callback(payload);
    });
  });
};

export { auth };
