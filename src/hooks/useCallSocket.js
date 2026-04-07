"use client";

import { useEffect, useRef } from "react";
import { getToken } from "@/app/user/call-now";

/**
 * Hook to listen for incoming calls via Socket.io.
 * 
 * Usage:
 *   useCallSocket({ onIncomingCall: (data) => showPopup(data) })
 */
export function useCallSocket({ onIncomingCall, onCallEnded } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    let isConnected = false;

    const connect = async () => {
      const token = getToken();
      if (!token || isConnected) return;

      try {
        const { io } = await import("socket.io-client");

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.playymate.com", {
          path: "/socket.io/",
          transports: ["websocket", "polling"],
          auth: { token },
        });

        socket.on("connect", () => {
          console.log("[Socket] Connected to main namespace");
          
          const callsSocket = io("/calls", {
            path: "/socket.io/",
            transports: ["websocket", "polling"],
            auth: { token },
          });

          callsSocket.on("connect", () => {
            console.log("[Socket] Connected to /calls namespace");
            
            callsSocket.on("call:incoming", (data) => {
              console.log("[Socket] Incoming call:", data);
              onIncomingCall?.(data);
            });

            callsSocket.on("call:ended", (data) => {
              console.log("[Socket] Call ended:", data);
              onCallEnded?.(data);
            });

            socketRef.current = callsSocket;
            isConnected = true;
          });
        });
      } catch (err) {
        console.error("[Socket] Connection error:", err);
      }
    };

    connect();

    return () => {
      socketRef.current?.disconnect?.();
    };
  }, [onIncomingCall, onCallEnded]);

  return socketRef;
}