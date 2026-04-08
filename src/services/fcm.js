import { requestFcmToken, onForegroundMessage } from "../lib/api/firebase";
import { registerFcmToken, deactivateFcmToken } from "../app/user/notifications";

const FCM_TOKEN_KEY = "fcm_token_registered";

export const initializeFcm = async () => {
  if (typeof window === "undefined") return;

  console.log("FCM: Starting initialization...");
  try {
    const token = await requestFcmToken();
    console.log("FCM: Token result:", token ? "Token received" : "No token");
    if (token) {
      console.log("FCM: Registering token with backend...");
      const result = await registerFcmToken(token);
      console.log("FCM: Backend registration result:", result);
      localStorage.setItem(FCM_TOKEN_KEY, token);
      console.log("FCM: Token registered with backend");
    }
  } catch (error) {
    console.error("FCM: Initialization failed:", error);
  }
};

export const setupForegroundHandler = (callback) => {
  if (typeof window === "undefined") return () => {};

  return onForegroundMessage(callback);
};

export const cleanupFcmToken = async () => {
  if (typeof window === "undefined") return;

  const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
  if (storedToken) {
    try {
      await deactivateFcmToken(storedToken);
      localStorage.removeItem(FCM_TOKEN_KEY);
      console.log("FCM: Token deactivated");
    } catch (error) {
      console.error("FCM: Deactivation failed:", error);
    }
  }
};
