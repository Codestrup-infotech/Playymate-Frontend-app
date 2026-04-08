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
  return serverUrl
    .replace(/^https?:\/\//, "wss://")
    .replace(".api.zegocloud.com", "-api.zegocloud.com/ws");
}

function makeStreamId(roomId, userId) {
  return `${roomId}-${userId}`;
}

export default function CallPage() {
  const { callId } = useParams();
  const searchParams = useSearchParams();
  const callType = searchParams.get("type") || "video";

  // ── Refs ──────────────────────────────────────────────────────────────────
  const providerRef = useRef(null);
  const providerTypeRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteUsersRef = useRef({});

  // ── State ─────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState("Connecting…");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [remoteCount, setRemoteCount] = useState(0);
  const [role, setRole] = useState("participant");
  const [providerType, setProviderType] = useState(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        let token = null;
        let providerConfig = null;
        let callRole = "participant";

        const stored = getCallSession(callId);
        console.log("[Call] Stored session:", JSON.stringify(stored, null, 2));

        if (stored?.token && stored?.provider_config) {
          token = stored.token || stored.rtc_token || stored.zego_token;
          providerConfig = stored.provider_config;
          callRole = stored.role || "initiator";
        } else if (stored?.provider_config) {
          // Support case where token might be missing but provider_config exists
          token = stored.token || stored.rtc_token || stored.zego_token;
          providerConfig = stored.provider_config;
          callRole = stored.role || "initiator";
        } else {
          if (!isMounted) return;
          setStatus("Accepting call…");

          const acceptRes = await acceptCall(callId);
          console.log("[Call] Accept response:", JSON.stringify(acceptRes, null, 2));

          if (acceptRes?.data?.already_joined && !acceptRes?.data?.token) {
            throw new Error("You already joined this call in another window.");
          }

          token = acceptRes?.data?.token || acceptRes?.data?.rtc_token || acceptRes?.data?.zego_token;
          providerConfig = acceptRes?.data?.provider_config;
          callRole = "participant";
        }

        console.log("[Call] Token after extraction:", token);
        console.log("[Call] ProviderConfig:", JSON.stringify(providerConfig, null, 2));
        
        // Allow proceeding without token for ZEGOCLOUD (it can use room_id auth)
        if (!providerConfig) throw new Error("Provider config missing.");
        if (!providerConfig.type) throw new Error("Provider type missing.");
        
        // For ZEGOCLOUD, we can proceed without token (optional for some configs)
        // For AGORA, token is required
        if (!token && providerConfig.type === "AGORA") {
          throw new Error("RTC token missing. Cannot join room.");
        }
        
        if (!token) {
          console.warn("[Call] Token is null, proceeding without token (ZEGOCLOUD room_id auth)");
        }

        if (!isMounted) return;
        setRole(callRole);
        setProviderType(providerConfig.type);
        providerTypeRef.current = providerConfig.type;

        const type = providerConfig.type;

        console.log("[Call] Switching to provider:", type);

        if (type === "AGORA") {
          console.log("[Call] Using AGORA SDK");
          await initAgora(providerConfig, token, callType, isMounted);
        } else if (type === "ZEGOCLOUD") {
          console.log("[Call] Using ZEGOCLOUD SDK");
          await initZegoCloud(providerConfig, token, callType, isMounted);
        } else if (type === "WEBRTC_SELFHOSTED") {
          throw new Error("WEBRTC_SELFHOSTED not implemented yet");
        } else {
          throw new Error(`Unsupported provider: ${type}`);
        }
      } catch (err) {
        console.error("[Call] init error:", err);
        if (isMounted) setError(err.message);
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [callId, callType]);

  // ── Agora Event Handlers Setup ────────────────────────────────────────────
  const setupAgoraEventHandlers = (client, isMounted) => {
    client.on("user-published", async (user, mediaType) => {
      if (!isMounted) return;
      console.log("[Agora] User published:", user.uid, mediaType);
      
      await client.subscribe(user, { audioTrack: true, videoTrack: true });
      
      if (mediaType === "video" && remoteVideoRef.current) {
        const videoTrack = user.videoTrack;
        if (videoTrack) {
          remoteVideoRef.current.srcObject = videoTrack.play();
        }
      }
      
      if (mediaType === "audio") {
        const audioTrack = user.audioTrack;
        if (audioTrack) {
          audioTrack.play();
        }
      }
      
      remoteUsersRef.current[user.uid] = user;
      setRemoteCount(Object.keys(remoteUsersRef.current).length);
    });

    client.on("user-unpublished", (user, mediaType) => {
      if (!isMounted) return;
      console.log("[Agora] User unpublished:", user.uid, mediaType);
    });

    client.on("user-left", (user, reason) => {
      if (!isMounted) return;
      console.log("[Agora] User left:", user.uid, reason);
      delete remoteUsersRef.current[user.uid];
      setRemoteCount(Object.keys(remoteUsersRef.current).length);
    });

    client.on("connection-state-change", (curState, prevState, reason) => {
      if (!isMounted) return;
      console.log("[Agora] connection-state-change:", curState, prevState, reason);
      
      if (curState === "CONNECTED") setStatus("Connected ✓");
      if (curState === "CONNECTING") setStatus("Connecting…");
      if (curState === "DISCONNECTED") {
        setError(`Disconnected: ${reason}`);
      }
    });
  };

  // ── Agora Initialization ────────────────────────────────────────────────
  const initAgora = async (providerConfig, token, callType, isMounted) => {
    setStatus("Initializing Agora…");

    const appId = providerConfig.app_id;
    const channelName = providerConfig.channel_name;
    const uid = providerConfig.uid;

    console.log("[Agora] ========== AGORA INIT STARTED ==========");
    console.log("[Agora] Full providerConfig:", JSON.stringify(providerConfig, null, 2));
    console.log("[Agora] appId:", appId, "type:", typeof appId);
    console.log("[Agora] channel:", channelName);
    console.log("[Agora] uid:", uid, "type:", typeof uid);
    console.log("[Agora] token:", token ? "present (" + token.substring(0, 30) + "...)" : "NULL");

    if (!appId) {
      console.error("[Agora] ERROR: app_id is missing!");
      throw new Error("AGORA app_id is missing from provider config");
    }
    if (!channelName) {
      console.error("[Agora] ERROR: channel_name is missing!");
      throw new Error("AGORA channel_name is missing from provider config");
    }
    if (!token) {
      console.error("[Agora] ERROR: token is missing!");
      throw new Error("AGORA token is missing");
    }

    // Ensure parameters are correct types
    const appIdStr = String(appId);
    const channelStr = String(channelName);
    const uidValue = uid ? String(uid) : null;

    console.log("[Agora] Joining with:", { appId: appIdStr, channel: channelStr, uid: uidValue });

    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });
    providerRef.current = client;

    // Set up event handlers BEFORE joining
    setupAgoraEventHandlers(client, isMounted);

    if (!isMounted) return;
    setStatus("Joining channel…");

    try {
      // Join with string parameters
      await client.join(appIdStr, channelStr, token, uidValue);
      console.log("[Agora] Joined channel successfully!");

      if (!isMounted) return;
      setStatus("Starting camera/mic…");

      let audioTrack = null;
      let videoTrack = null;

      audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log("[Agora] Microphone track created");
      
      if (callType === "video") {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        console.log("[Agora] Camera track created");
        
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
          console.log("[Agora] Camera playing in local video");
        }
      }

      localTracksRef.current = { audioTrack, videoTrack };

      const tracks = [audioTrack, videoTrack].filter(Boolean);
      if (tracks.length > 0) {
        await client.publish(tracks);
        console.log("[Agora] Published", tracks.length, "tracks");
      }

      if (isMounted) {
        setStatus("Connected ✓");
        console.log("[Agora] ========== AGORA CONNECTED ==========");
      }
    } catch (agoraErr) {
      console.error("[Agora] Error during initialization:", agoraErr);
      throw agoraErr;
    }
  };

  // ── ZegoCloud Initialization ─────────────────────────────────────────────
  const initZegoCloud = async (providerConfig, token, callType, isMounted) => {
    setStatus("Initializing ZegoCloud…");

    const appId = parseInt(providerConfig.app_id, 10);
    const roomId = providerConfig.room_id;
    const userId = providerConfig.user_id;
    const serverUrl = (providerConfig.server_url || "").trim();
    
    console.log("[ZegoCloud] Raw app_id from providerConfig:", providerConfig.app_id);
    console.log("[ZegoCloud] Raw server_url from providerConfig:", serverUrl);
    
    // Build WebSocket URL from server_url
    let zegoServer = serverUrl;
    if (serverUrl && !serverUrl.includes('/ws')) {
      zegoServer = buildZegoServerUrl(serverUrl);
    }

    if (!appId || isNaN(appId)) {
      console.error("[ZegoCloud] Invalid app_id:", providerConfig.app_id);
      console.error("[ZegoCloud] Full providerConfig:", JSON.stringify(providerConfig, null, 2));
      setError("ZEGOCLOUD not configured. Please contact admin to set up ZEGOCLOUD app_id and server_secret in backend.");
      return;
    }
    if (!roomId) throw new Error("room_id missing");
    if (!userId) throw new Error("user_id missing");

    console.log("[ZegoCloud] appId:", appId);
    console.log("[ZegoCloud] server:", zegoServer);
    console.log("[ZegoCloud] roomId:", roomId);
    console.log("[ZegoCloud] userId:", userId);
    console.log("[ZegoCloud] token:", token ? "present" : "NULL");

    const zegoModule = await import("zego-express-engine-webrtc");
    const ZegoExpressEngine = zegoModule.ZegoExpressEngine || zegoModule.default;

    const zg = new ZegoExpressEngine(appId, zegoServer);
    providerRef.current = zg;

    zg.on("roomStreamUpdate", async (rId, updateType, streamList) => {
      if (!isMounted) return;

      if (updateType === "ADD") {
        for (const stream of streamList) {
          try {
            const remoteStream = await zg.startPlayingStream(stream.streamID);
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

    if (!isMounted) return;
    setStatus("Joining room…");

    try {
      console.log("[ZegoCloud] Calling loginRoom with token:", token ? "YES" : "NO");
      const loginResult = await zg.loginRoom(
        roomId,
        token || "", // Pass empty string if token is null
        { userID: userId, userName: userId },
        { userUpdate: true }
      );

      console.log("[ZegoCloud] loginRoom result:", loginResult);

      if (!loginResult) {
        throw new Error("Failed to login to ZegoCloud room");
      }
    } catch (loginErr) {
      console.error("[ZegoCloud] loginRoom error:", loginErr);
      throw new Error(`ZegoCloud login failed: ${loginErr.message}`);
    }

    if (!isMounted) return;
    setStatus("Starting camera/mic…");

    const streamConstraints = {
      camera: {
        audio: true,
        video: callType === "video",
      },
    };

    const localStream = await zg.createStream(streamConstraints);
    localTracksRef.current.localStream = localStream;

    if (localVideoRef.current && callType === "video") {
      localVideoRef.current.srcObject = localStream;
    }

    const streamId = makeStreamId(roomId, userId);
    zg.startPublishingStream(streamId, localStream);

    if (isMounted) setStatus("Connected ✓");
  };

  // ── Cleanup helper ────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;

    const type = providerTypeRef.current;

    try {
      if (type === "AGORA") {
        cleanupAgora();
      } else if (type === "ZEGOCLOUD") {
        cleanupZegoCloud();
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }

    providerRef.current = null;
    localTracksRef.current = { audioTrack: null, videoTrack: null, localStream: null };
  }, []);

  const cleanupAgora = async () => {
    const client = providerRef.current;
    const tracks = localTracksRef.current;

    if (tracks.audioTrack) {
      tracks.audioTrack.stop();
      tracks.audioTrack.close();
    }
    if (tracks.videoTrack) {
      tracks.videoTrack.stop();
      tracks.videoTrack.close();
    }

    if (client) {
      await client.leave();
    }
  };

  const cleanupZegoCloud = () => {
    const zg = providerRef.current;
    const tracks = localTracksRef.current;

    if (tracks.localStream) {
      try {
        zg.stopPublishingStream(null);
        zg.destroyStream(tracks.localStream);
      } catch (e) {
        console.error("ZegoCloud cleanup error:", e);
      }
    }
    if (zg) {
      try {
        zg.logoutRoom();
      } catch (e) {
        console.error("ZegoCloud logout error:", e);
      }
    }
  };

  // ── Controls ──────────────────────────────────────────────────────────────
  const toggleMute = useCallback(async () => {
    const type = providerTypeRef.current;
    const tracks = localTracksRef.current;
    const newMuted = !muted;

    if (type === "AGORA") {
      if (tracks.audioTrack) {
        await tracks.audioTrack.setEnabled(newMuted ? false : true);
      }
    } else if (type === "ZEGOCLOUD") {
      const zg = providerRef.current;
      if (zg && tracks.localStream) {
        zg.mutePublishStreamAudio(tracks.localStream, newMuted);
      }
    }

    setMuted(newMuted);
  }, [muted]);

  const toggleVideo = useCallback(async () => {
    const type = providerTypeRef.current;
    const tracks = localTracksRef.current;
    const newVideoOff = !videoOff;

    if (type === "AGORA") {
      if (tracks.videoTrack) {
        await tracks.videoTrack.setEnabled(newVideoOff ? false : true);
      }
    } else if (type === "ZEGOCLOUD") {
      const zg = providerRef.current;
      if (zg && tracks.localStream) {
        zg.mutePublishStreamVideo(tracks.localStream, newVideoOff);
      }
    }

    setVideoOff(newVideoOff);
  }, [videoOff]);

  const handleLeave = useCallback(async () => {
    try {
      cleanup();

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
        {providerType && (
          <span className="text-xs text-gray-400 ml-2">({providerType})</span>
        )}
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
            muted
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
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
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