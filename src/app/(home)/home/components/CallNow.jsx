"use client";

import { FaPhone, FaVideo } from "react-icons/fa";
import { initiateCall, storeCallSession } from "@/app/user/call-now";

export default function CallNow({ selectedConv, myId }) {
  if (!selectedConv) return null;

  // Collect all participant IDs except yourself
  const recipients = (selectedConv.participants || [])
    .map((p) => p.user_id?._id || p.user_id)
    .filter((id) => id && id !== myId);

  const handleCall = async (callType) => {
    try {
      // 1. Initiate the call via API
      const res = await initiateCall({
        call_type: callType,
        recipient_ids: recipients,
        is_group_call: recipients.length > 1,
      });

      // 2. Parse the API response
      const apiData = res?.data;
      if (!apiData) throw new Error("No data in response");

      const call = apiData.call;
      const token = apiData.token || apiData.rtc_token || apiData.zego_token;
      const providerConfig = apiData.provider_config;

      if (!call?._id) throw new Error("Call ID missing from response");
      if (!providerConfig) throw new Error("Provider config missing");
      
      // Log for debugging
      console.log("[CallNow] Provider type:", providerConfig?.type);
      console.log("[CallNow] Token:", token ? "present" : "NULL");
      console.log("[CallNow] app_id:", providerConfig?.app_id);

      // 3. Store in sessionStorage so the call page can use it immediately
      //    (avoids needing to call accept API for the initiator)
      storeCallSession(call._id, {
        role: "initiator",
        call,
        token,
        provider_config: providerConfig,
      });

      // 4. Open call page in a new window
      const url = `/call/${call._id}?type=${callType}`;
      window.open(url, "_blank", "width=900,height=700");
    } catch (err) {
      console.error("Call initiation error:", err);
      alert(err.message || "Failed to start call");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleCall("audio")}
        title="Voice Call"
        className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
      >
        <FaPhone className="w-4 h-4 text-pink-500" />
      </button>

      <button
        onClick={() => handleCall("video")}
        title="Video Call"
        className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
      >
        <FaVideo className="w-4 h-4 text-pink-500" />
      </button>
    </div>
  );
}