"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { leaveCall } from "@/app/user/call-now";

export default function CallPage() {
  const { callId } = useParams();

  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 🔥 1. GET CALL DATA
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/calls/${callId}`,
          {
            headers: {
              Authorization: `Bearer ${
                sessionStorage.getItem("access_token") ||
                localStorage.getItem("access_token")
              }`,
            },
          }
        );

        const json = await res.json();
        const data = json?.data;

        const call = data;
        // ✅ provider_config is inside data object based on API response structure
        // Try multiple paths for provider_config based on API response formats
        let providerConfig = data?.provider_config;
        let token = data?.token;
        let providerType = call?.provider;

        // If no provider_config, try to find it in the response
        if (!providerConfig) {
          providerConfig = json?.provider_config;
        }

        // Get provider type from provider_config or fall back to call.provider
        if (providerConfig?.type) {
          providerType = providerConfig.type;
        } else if (!providerType && data?.provider) {
          providerType = data.provider;
        }

        // Get token - try multiple sources
        if (!token && json?.token) {
          token = json.token;
        }

        console.log("Call data:", data);
        console.log("Provider type:", providerType);
        console.log("Provider config:", providerConfig);
        console.log("Token:", token);

        // ✅ Try to get provider config from sessionStorage if not in API response
        if (!providerConfig && typeof window !== "undefined") {
          const storedCallData = sessionStorage.getItem(`call_${callId}`);
          if (storedCallData) {
            const parsed = JSON.parse(storedCallData);
            console.log("Stored call data:", parsed);
            if (!providerType && parsed.provider) {
              providerType = parsed.provider;
            }
            if (!providerConfig) {
              providerConfig = {
                type: parsed.provider,
                ws_url: parsed.ws_url,
                app_id: parsed.app_id,
              };
            }
            if (!token && parsed.token) {
              token = parsed.token;
            }
          }
        }

        // 🔥 FALLBACK: Get WebSocket URL from provider_meta in call data
        // The API returns provider_meta.rtc_ws_url but frontend is looking for provider_config.ws_url
        let wsUrl = providerConfig?.ws_url;
        
        if (!wsUrl && call?.provider_meta?.rtc_ws_url) {
          // Use provider_meta.rtc_ws_url from the call data
          wsUrl = call.provider_meta.rtc_ws_url;
          console.log("Using WebSocket URL from provider_meta:", wsUrl);
        }

        // ✅ Support both AGORA and WEBRTC_SELFHOSTED providers
        const supportedProviders = ["AGORA", "WEBRTC_SELFHOSTED"];
        if (!providerType || !supportedProviders.includes(providerType)) {
          throw new Error(`Unsupported provider: ${providerType || "unknown"}`);
        }

        // 🔥 Handle based on provider type
        if (providerType === "AGORA") {
          // For AGORA, we need app_id and token
          if (!providerConfig?.app_id) {
            throw new Error("Agora app_id missing");
          }
          if (!token) {
            throw new Error("Agora token missing");
          }
          // TODO: Implement Agora SDK integration here
          console.log("Agora call - app_id:", providerConfig.app_id);
          return; // Placeholder - implement Agora logic
        }

        // WEBRTC_SELFHOSTED - use existing WebRTC logic
        if (!wsUrl) {
          throw new Error("Missing WebSocket URL. Need either provider_config.ws_url or call.provider_meta.rtc_ws_url");
        }

        // 🔥 Append room ID to WebSocket URL if not already included
        const roomId = call?.room_id || call?.provider_room_id;
        let wsUrlWithRoom = wsUrl;
        if (wsUrl && roomId && !wsUrl.includes(roomId)) {
          // Remove trailing slash if present
          const baseWsUrl = wsUrl.replace(/\/$/, "");
          wsUrlWithRoom = `${baseWsUrl}/${roomId}`;
          console.log("WebSocket URL with room:", wsUrlWithRoom);
        }

        // 🔥 2. GET USER MEDIA
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        localStreamRef.current = stream;

        const localVideo = document.getElementById("local-video");
        if (localVideo) localVideo.srcObject = stream;

        // 🔥 3. CREATE PEER CONNECTION
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
          ],
        });

        pcRef.current = pc;

        // add tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // remote stream
        pc.ontrack = (event) => {
          const remoteVideo = document.getElementById("remote-video");
          if (remoteVideo) remoteVideo.srcObject = event.streams[0];
        };

        // ICE
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: "ice",
                candidate: event.candidate,
              })
            );
          }
        };

        // 🔥 4. CONNECT WEBSOCKET
        const ws = new WebSocket(wsUrlWithRoom);
        wsRef.current = ws;

        ws.onopen = async () => {
          // send join
          ws.send(
            JSON.stringify({
              type: "join",
              roomId: call.room_id,
              token,
            })
          );

          // create offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          ws.send(
            JSON.stringify({
              type: "offer",
              sdp: offer,
            })
          );
        };

        ws.onmessage = async (msg) => {
          const data = JSON.parse(msg.data);

          if (data.type === "answer") {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
          }

          if (data.type === "ice") {
            await pc.addIceCandidate(data.candidate);
          }
        };

      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    init();
  }, [callId]);

  // 🔥 CONTROLS
  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = muted;
    setMuted(!muted);
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = videoOff;
    setVideoOff(!videoOff);
  };

  const handleLeave = async () => {
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      wsRef.current?.close();

      await leaveCall(callId);
    } catch (e) {
      console.error(e);
    }

    window.close();
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col justify-between text-white">

      {/* Remote */}
      <video
        id="remote-video"
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local */}
      <video
        id="local-video"
        autoPlay
        muted
        playsInline
        className="absolute bottom-20 right-4 w-40 h-60 rounded-xl"
      />

      {/* Controls */}
      <div className="flex justify-center gap-6 p-6 z-10">

        <button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
        >
          {muted ? <MicOff /> : <Mic />}
        </button>

        <button
          onClick={toggleVideo}
          className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
        >
          {videoOff ? <VideoOff /> : <Video />}
        </button>

        <button
          onClick={handleLeave}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"
        >
          <PhoneOff />
        </button>
      </div>
    </div>
  );
}