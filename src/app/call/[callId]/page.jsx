"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import AgoraRTC from "agora-rtc-sdk-ng";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { endCall } from "@/app/user/call-now";

export default function CallPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const callId = params.callId;
  const roomId = searchParams.get("room");
  const type = searchParams.get("type");

  const clientRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });

  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(type !== "video");

  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  // ⚠️ You should pass TOKEN + CHANNEL from API (currently using roomId)
  const TOKEN = null; // replace with API token
  const CHANNEL = roomId;

  useEffect(() => {
    const init = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        await client.join(APP_ID, CHANNEL, TOKEN, null);

        // Create tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        let videoTrack = null;

        if (type === "video") {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
        }

        localTracks.current = { audio: audioTrack, video: videoTrack };

        // Play local video
        if (videoTrack) {
          videoTrack.play("local-player");
        }

        // Publish tracks
        await client.publish(
          videoTrack ? [audioTrack, videoTrack] : [audioTrack]
        );

        setJoined(true);

        // Subscribe to remote users
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            const player = document.createElement("div");
            player.id = user.uid;
            player.className = "w-48 h-64 bg-gray-800 rounded-xl";
            document.getElementById("remote-container").appendChild(player);
            user.videoTrack.play(player);
          }

          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-unpublished", (user) => {
          const el = document.getElementById(user.uid);
          if (el) el.remove();
        });

      } catch (err) {
        console.error("Agora Error:", err);
      }
    };

    init();

    return () => {
      leaveCall();
    };
  }, []);

  const leaveCall = async () => {
    try {
      if (localTracks.current.audio) localTracks.current.audio.close();
      if (localTracks.current.video) localTracks.current.video.close();

      await clientRef.current?.leave();
      await endCall(callId);
    } catch (e) {
      console.error(e);
    } finally {
      window.close();
    }
  };

  const toggleMute = () => {
    const audio = localTracks.current.audio;
    if (!audio) return;

    audio.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleVideo = () => {
    const video = localTracks.current.video;
    if (!video) return;

    video.setEnabled(videoOff);
    setVideoOff(!videoOff);
  };

  return (
    <div className="h-screen bg-black flex flex-col justify-between text-white">

      {/* Remote users */}
      <div id="remote-container" className="flex flex-wrap gap-4 p-4" />

      {/* Local video */}
      <div className="flex justify-center">
        <div id="local-player" className="w-64 h-96 bg-gray-800 rounded-xl" />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 p-6">

        <button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
        >
          {muted ? <MicOff /> : <Mic />}
        </button>

        {type === "video" && (
          <button
            onClick={toggleVideo}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
          >
            {videoOff ? <VideoOff /> : <Video />}
          </button>
        )}

        <button
          onClick={leaveCall}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"
        >
          <PhoneOff />
        </button>
      </div>
    </div>
  );
}