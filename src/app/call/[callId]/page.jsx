"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, Phone } from "lucide-react";
import {
  acceptCall,
  leaveCall,
  endCall,
  getCallSession,
  clearCallSession,
} from "@/app/user/call-now";

// ─────────────────────────────────────────────────────────────────────────────
// ZegoCloud server_url from API:  "https://webliveroom1.api.zegocloud.com"
// ZegoExpressEngine needs:        "wss://webliveroom1-api.zegocloud.com/ws"
// ─────────────────────────────────────────────────────────────────────────────
function buildZegoServerUrl(serverUrl) {
  // "https://webliveroom1.api.zegocloud.com"
  //  → strip https://
  //  → replace .api.zegocloud.com with -api.zegocloud.com/ws
  //  → prefix wss://
  return serverUrl
    .replace(/^https?:\/\//, "wss://")
    .replace(".api.zegocloud.com", "-api.zegocloud.com/ws");
}

// ─────────────────────────────────────────────────────────────────────────────
// Unique stream ID per publisher (must be unique per room)
// ─────────────────────────────────────────────────────────────────────────────
function makeStreamId(roomId, userId) {
  return `${roomId}-${userId}`;
}

export default function CallPage() {
  const { callId } = useParams();
  const searchParams = useSearchParams();
  const callType = searchParams.get("type") || "video"; // "audio" | "video"

  // ── Refs ──────────────────────────────────────────────────────────────────
  const zgRef = useRef(null);               // ZegoExpressEngine instance
  const localStreamRef = useRef(null);      // local MediaStream
  const myStreamIdRef = useRef(null);       // my published stream ID
  const localVideoRef = useRef(null);       // <video> local
  const remoteVideoRef = useRef(null);      // <video> remote (1-on-1)

  // ── State ─────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState("Connecting…");   // UI status label
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [remoteCount, setRemoteCount] = useState(0);     // how many peers joined
  const [role, setRole] = useState("participant");        // "initiator" | "participant"

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // ── Step 1: Get token + provider_config ──────────────────────────
        //   Initiator: already stored in sessionStorage by CallNow.jsx
        //   Callee:    call accept API to get token + provider_config
        let token = null;
        let providerConfig = null;
        let callRole = "participant";

        const stored = getCallSession(callId);

        if (stored?.token && stored?.provider_config) {
          // ✅ Initiator path — data already here, no extra API call
          token = stored.token;
          providerConfig = stored.provider_config;
          callRole = stored.role || "initiator";
        } else {
          // ✅ Callee path — call accept to get credentials
          if (!isMounted) return;
          setStatus("Accepting call…");

          const acceptRes = await acceptCall(callId);

          // Handle idempotent case (already_joined: true means token is null)
          if (acceptRes?.data?.already_joined && !acceptRes?.data?.token) {
            throw new Error("You already joined this call in another window.");
          }

          token = acceptRes?.data?.token;
          providerConfig = acceptRes?.data?.provider_config;
          callRole = "participant";
        }

        if (!token) throw new Error("RTC token missing. Cannot join room.");
        if (!providerConfig) throw new Error("Provider config missing.");
        if (providerConfig.type !== "ZEGOCLOUD") {
          throw new Error(`Unsupported provider: ${providerConfig.type}`);
        }

        if (!isMounted) return;
        setRole(callRole);
        setStatus("Initializing ZegoCloud…");

        // ── Step 2: Parse ZegoCloud config ──────────────────────────────
        const appId = parseInt(providerConfig.app_id, 10);  // must be Number
        const roomId = providerConfig.room_id;
        const userId = providerConfig.user_id;
        const zegoServer = buildZegoServerUrl(providerConfig.server_url);

        if (!appId || isNaN(appId)) throw new Error("Invalid app_id");
        if (!roomId) throw new Error("room_id missing");
        if (!userId) throw new Error("user_id missing");

        console.log("[ZegoCloud] appId:", appId);
        console.log("[ZegoCloud] server:", zegoServer);
        console.log("[ZegoCloud] roomId:", roomId);
        console.log("[ZegoCloud] userId:", userId);

        // ── Step 3: Create ZegoExpressEngine ────────────────────────────
        // Dynamic import so it only loads in the browser
        const zegoModule = await import("zego-express-engine-webrtc");
        const ZegoExpressEngine = zegoModule.ZegoExpressEngine || zegoModule.default;

        const zg = new ZegoExpressEngine(appId, zegoServer);
        zgRef.current = zg;

        // ── Step 4: Room event listeners ─────────────────────────────────

        // Remote stream added or removed
        zg.on("roomStreamUpdate", async (rId, updateType, streamList) => {
          if (!isMounted) return;

          if (updateType === "ADD") {
            for (const stream of streamList) {
              try {
                const remoteStream = await zg.startPlayingStream(
                  stream.streamID
                );
                // For 1-on-1, attach to single remote video element
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
              } catch (playErr) {
                console.error("Failed to play remote stream:", playErr);
              }
            }
            setRemoteCount((c) => c + streamList.length);
          }

          if (updateType === "DELETE") {
            for (const stream of streamList) {
              zg.stopPlayingStream(stream.streamID);
            }
            setRemoteCount((c) => Math.max(0, c - streamList.length));
          }
        });

        // Room state changes
        zg.on("roomStateUpdate", (rId, state, errorCode, extendedData) => {
          if (!isMounted) return;
          console.log("[ZegoCloud] roomStateUpdate:", state, errorCode);

          if (state === "CONNECTED") setStatus("Connected ✓");
          if (state === "CONNECTING") setStatus("Connecting…");
          if (state === "DISCONNECTED") {
            if (errorCode !== 0) {
              setError(`Disconnected (code: ${errorCode})`);
            }
          }
        });

        // Network quality (optional)
        zg.on("publishQualityUpdate", (streamId, quality) => {
          // can be used to show network indicator
        });

        // ── Step 5: Login to room ────────────────────────────────────────
        if (!isMounted) return;
        setStatus("Joining room…");

        const loginResult = await zg.loginRoom(
          roomId,
          token,
          { userID: userId, userName: userId },
          { userUpdate: true }
        );

        console.log("[ZegoCloud] loginRoom result:", loginResult);

        if (!loginResult) {
          throw new Error("Failed to login to ZegoCloud room");
        }

        // ── Step 6: Create and publish local stream ──────────────────────
        if (!isMounted) return;
        setStatus("Starting camera/mic…");

        const streamConstraints = {
          camera: {
            audio: true,
            video: callType === "video",
          },
        };

        const localStream = await zg.createStream(streamConstraints);
        localStreamRef.current = localStream;

        // Show local video preview
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = localStream;
        }

        // Publish with a unique stream ID
        const streamId = makeStreamId(roomId, userId);
        myStreamIdRef.current = streamId;
        zg.startPublishingStream(streamId, localStream);

        if (isMounted) setStatus("Connected ✓");
      } catch (err) {
        console.error("[ZegoCloud] init error:", err);
        if (isMounted) setError(err.message);
      }
    };

    init();

    // ── Cleanup on unmount ───────────────────────────────────────────────
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [callId, callType]);

  // ── Cleanup helper ────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    const zg = zgRef.current;
    if (!zg) return;

    try {
      if (myStreamIdRef.current) {
        zg.stopPublishingStream(myStreamIdRef.current);
      }
      if (localStreamRef.current) {
        zg.destroyStream(localStreamRef.current);
      }
      zg.logoutRoom();
    } catch (e) {
      console.error("Cleanup error:", e);
    }

    zgRef.current = null;
    localStreamRef.current = null;
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    const zg = zgRef.current;
    if (!zg || !localStreamRef.current) return;

    const newMuted = !muted;
    // ZegoCloud API: mutePublishStreamAudio
    zg.mutePublishStreamAudio(localStreamRef.current, newMuted);
    setMuted(newMuted);
  }, [muted]);

  const toggleVideo = useCallback(() => {
    const zg = zgRef.current;
    if (!zg || !localStreamRef.current) return;

    const newVideoOff = !videoOff;
    // ZegoCloud API: mutePublishStreamVideo
    zg.mutePublishStreamVideo(localStreamRef.current, newVideoOff);
    setVideoOff(newVideoOff);
  }, [videoOff]);

  const handleLeave = useCallback(async () => {
    try {
      cleanup();

      // Initiator can end the whole call; others just leave
      if (role === "initiator") {
        await endCall(callId);
      } else {
        await leaveCall(callId);
      }

      clearCallSession(callId);
    } catch (e) {
      console.error("Leave error:", e);
    }

    window.close();
  }, [callId, cleanup, role]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <p className="text-red-400 text-lg font-medium">⚠ {error}</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* ── Status bar ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "Connected ✓" ? "bg-green-400" : "bg-yellow-400 animate-pulse"
          }`}
        />
        {status}
        {remoteCount > 0 && (
          <span className="flex items-center gap-1 ml-2">
            <Users className="w-3 h-3" />
            {remoteCount}
          </span>
        )}
      </div>

      {/* ── Remote video (full screen) ── */}
      <div className="flex-1 relative bg-gray-900">
        {remoteCount === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-4xl">
              👤
            </div>
            <p className="text-gray-400 text-sm">
              Waiting for the other person to join…
            </p>
          </div>
        ) : null}

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Local video (picture-in-picture) ── */}
      {callType === "video" && (
        <div className="absolute bottom-24 right-4 z-10">
          <video
            ref={localVideoRef}
            autoPlay
            muted          // always muted locally to avoid echo
            playsInline
            className={`w-36 h-52 rounded-2xl object-cover border-2 border-white/20 bg-gray-800 ${
              videoOff ? "hidden" : ""
            }`}
          />
          {videoOff && (
            <div className="w-36 h-52 rounded-2xl bg-gray-800 border-2 border-white/20 flex items-center justify-center text-white text-xs">
              Camera off
            </div>
          )}
        </div>
      )}

      {/* ── Audio-only indicator ── */}
      {callType === "audio" && (
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-3 absolute inset-0">
          <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Phone className="w-10 h-10 text-pink-400" />
          </div>
          <p className="text-gray-300">Voice call</p>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-5 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
        {/* Mute */}
        <button
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
          className={`w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            muted ? "bg-white text-gray-900" : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call */}
        <button
          onClick={handleLeave}
          title={role === "initiator" ? "End Call" : "Leave Call"}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>

        {/* Video toggle (only for video calls) */}
        {callType === "video" && (
          <button
            onClick={toggleVideo}
            title={videoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              videoOff
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {videoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Fix: Phone icon was missing and added to import