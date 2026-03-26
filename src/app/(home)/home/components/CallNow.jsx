"use client";

import { Phone, Video } from "lucide-react";
import { initiateCall } from "@/app/user/call-now";

export default function CallNow({ selectedConv, myId }) {
  if (!selectedConv) return null;

  const participants = (selectedConv.participants || [])
    .map((p) => p.user_id?._id || p.user_id)
    .filter((id) => id && id !== myId);

  const handleCall = async (type) => {
    try {
      const res = await initiateCall({
        call_type: type,
        recipient_ids: participants,
        is_group_call: participants.length > 1,
      });

      const callId = res?.data?.call?._id;
      const roomId = res?.data?.call?.room_id;

      if (callId) {
        const url = `/call/${callId}?room=${roomId}&type=${type}`;
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Call error:", err);
      alert("Failed to start call");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice Call */}
      <button
        onClick={() => handleCall("audio")}
        className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center"
      >
        <Phone className="w-4 h-4 text-pink-500" />
      </button>

      {/* Video Call */}
      <button
        onClick={() => handleCall("video")}
        className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center"
      >
        <Video className="w-4 h-4 text-pink-500" />
      </button>
    </div>
  );
}