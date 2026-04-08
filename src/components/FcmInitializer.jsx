"use client";

import { useEffect, useRef, useState } from "react";
import { initializeFcm, setupForegroundHandler } from "@/services/fcm";

export default function FcmInitializer() {
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      console.log("FCM: User logged in, initializing FCM...");
      initializeFcm();
      setIsReady(true);
    } else {
      console.log("FCM: User not logged in, skipping FCM initialization");
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const cleanup = setupForegroundHandler((payload) => {
      console.log("FCM: Foreground handler received:", payload);
      
      const notificationType = payload.data?.notification_type;
      console.log("FCM: Notification type:", notificationType);
      
      if (notificationType === "incoming_call") {
        const callData = {
          call_id: payload.data?.content_id,
          call_type: payload.data?.call_type || "video",
          caller_name: payload.notification?.title?.replace(" is calling you", ""),
          caller_username: payload.data?.caller_username,
          callerId: payload.data?.actor_id,
        };
        console.log("FCM: Dispatching call event:", callData);
        window.dispatchEvent(new CustomEvent("fcmIncomingCall", { detail: callData }));
      }
    });

    return cleanup;
  }, [isReady]);

  return null;
}
