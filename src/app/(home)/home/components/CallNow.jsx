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

      // ✅ correct parsing
      const apiData = res?.data;
      const call = apiData?.call || apiData;
      const providerConfig = apiData?.provider_config;
      const token = apiData?.token;

      // Get provider type - could be in providerConfig.type or call.provider
      let providerType = providerConfig?.type;
      if (!providerType && call?.provider) {
        providerType = call.provider;
      }

      const callId = call?._id;

      // ✅ validations
      if (!callId) throw new Error("Call ID missing");
      if (!providerType) throw new Error("Provider missing");

      // ✅ Support both providers
      const supportedProviders = ["AGORA", "WEBRTC_SELFHOSTED"];
      if (!supportedProviders.includes(providerType)) {
        alert(`Unsupported provider: ${providerType}`);
        return;
      }

      // ❌ Agora check (keep existing validation for Agora)
      if (providerType === "AGORA") {
        if (!providerConfig?.app_id) {
          alert("Agora not configured on backend");
          return;
        }

        if (!call?.room_id) {
          alert("Room ID missing");
          return;
        }

        if (!token) {
          alert("Call token missing");
          return;
        }
      }

      // ✅ For WEBRTC_SELFHOSTED, we just need the call ID and proceed
      // Store provider config in sessionStorage for the call page to use
      if (providerType === "WEBRTC_SELFHOSTED") {
        const callData = {
          provider: providerType,
          ws_url: providerConfig?.ws_url,
          token: token,
          room_id: call?.room_id,
          app_id: providerConfig?.app_id,
        };
        sessionStorage.setItem(`call_${callId}`, JSON.stringify(callData));
      }

      // ✅ correct URL
      const url = `/call/${callId}?type=${type}`;

      window.open(url, "_blank");

    } catch (err) {
      console.error("Call error:", err);
      alert(err.message || "Failed to start call");
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