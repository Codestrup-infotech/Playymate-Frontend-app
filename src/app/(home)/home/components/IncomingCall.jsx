"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallSocket } from "@/hooks/useCallSocket";
import { acceptCall, declineCall, storeCallSession } from "@/app/user/call-now";

export default function IncomingCallHandler() {
  const [incoming, setIncoming] = useState(null);
  const timeoutRef = useRef(null);

  const handleIncomingCall = useCallback((data) => {
    console.log("[IncomingCall] Received call:", data);
    setIncoming(data);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIncoming((prev) => (prev?.call_id === data.call_id ? null : prev));
    }, 30000);
  }, []);

  const clearCallTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useCallSocket({
    onIncomingCall: handleIncomingCall,
    onCallEnded: useCallback((data) => {
      clearCallTimeout();
      setIncoming((prev) =>
        prev?.call_id === data?.call_id ? null : prev
      );
    }, [clearCallTimeout]),
  });

  useEffect(() => {
    const handleFcmCall = (e) => {
      console.log("[IncomingCall] FCM call event:", e.detail);
      handleIncomingCall(e.detail);
    };
    
    window.addEventListener("fcmIncomingCall", handleFcmCall);
    return () => {
      window.removeEventListener("fcmIncomingCall", handleFcmCall);
      clearCallTimeout();
    };
  }, [handleIncomingCall, clearCallTimeout]);

  if (!incoming) return null;

  const handleAccept = async () => {
    clearCallTimeout();
    try {
      const res = await acceptCall(incoming.call_id);
      const token = res?.data?.token || res?.data?.rtc_token || res?.data?.zego_token;
      const providerConfig = res?.data?.provider_config;
      const call = { _id: incoming.call_id, ...res?.data };

      // Store session so call page doesn't call accept again
      storeCallSession(incoming.call_id, {
        role: "participant",
        call,
        token,
        provider_config: providerConfig,
      });

      setIncoming(null);

      const callType = incoming.call_type || "video";
      window.open(
        `/call/${incoming.call_id}?type=${callType}`,
        "_blank",
        "width=900,height=700"
      );
    } catch (err) {
      alert("Failed to accept call: " + err.message);
    }
  };

  const handleDecline = async () => {
    clearCallTimeout();
    try {
      await declineCall(incoming.call_id);
    } catch (e) {
      console.error(e);
    }
    setIncoming(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-2xl shadow-2xl p-5 w-72 border border-gray-700 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
          {incoming.call_type === "video" ? (
            <Video className="w-6 h-6 text-pink-400" />
          ) : (
            <Phone className="w-6 h-6 text-pink-400" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm">{incoming.caller_name || incoming.caller_username || incoming.callerId || 'Someone'}</p>
          <p className="text-gray-400 text-xs">is calling you...</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors"
        >
          <Phone className="w-4 h-4" />
          Accept
        </button>
      </div>
    </div>
  );
}