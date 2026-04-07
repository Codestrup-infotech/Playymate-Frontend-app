"use client";

import { useState, useCallback } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallSocket } from "@/hooks/useCallSocket";
import { acceptCall, declineCall, storeCallSession } from "@/app/user/call-now";

/**
 * Drop this anywhere in your layout (e.g. in the root layout or chat layout).
 * It listens via the useCallSocket hook and shows a popup on incoming call.
 * 
 * Usage:
 *   <IncomingCallHandler />
 */
export default function IncomingCallHandler() {
  const [incoming, setIncoming] = useState(null);

  useCallSocket({
    onIncomingCall: useCallback((data) => {
      setIncoming(data);
    }, []),
    onCallEnded: useCallback((data) => {
      // If the incoming popup is for this call, dismiss it
      setIncoming((prev) =>
        prev?.call_id === data?.call_id ? null : prev
      );
    }, []),
  });

  if (!incoming) return null;

  const handleAccept = async () => {
    try {
      const res = await acceptCall(incoming.call_id);
      const token = res?.data?.token;
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
          <p className="font-semibold text-sm">Incoming Call</p>
          <p className="text-gray-400 text-xs capitalize">
            {incoming.call_type || "video"} call
          </p>
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