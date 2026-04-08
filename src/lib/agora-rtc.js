const clientRef = { current: null };
const localTracksRef = { current: { audioTrack: null, videoTrack: null } };
const remoteUsersRef = { current: {} };

export async function createAgoraClient(appId) {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  const client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });
  clientRef.current = client;
  return client;
}

export async function joinChannel(client, channelName, token, uid) {
  await client.join(channelName, token, uid);
}

export async function createMicrophoneAudioTrack() {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localTracksRef.current.audioTrack = audioTrack;
  return audioTrack;
}

export async function createCameraVideoTrack() {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  const videoTrack = await AgoraRTC.createCameraVideoTrack();
  localTracksRef.current.videoTrack = videoTrack;
  return videoTrack;
}

export async function publishLocalTracks(audioTrack, videoTrack) {
  const client = clientRef.current;
  if (!client) throw new Error("Client not initialized");
  
  const tracks = [audioTrack, videoTrack].filter(Boolean);
  await client.publish(tracks);
}

export async function subscribeToUser(user) {
  const client = clientRef.current;
  if (!client) return;

  const subscribeOpts = {
    audioTrack: true,
    videoTrack: true,
  };

  await client.subscribe(user, subscribeOpts);
}

export function setupEventHandlers(client, options = {}) {
  const {
    onUserJoined,
    onUserLeft,
    onUserPublished,
    onUserUnpublished,
    onConnectionStateChanged,
  } = options;

  client.on("user-published", async (user, mediaType) => {
    console.log("[Agora] User published:", user.uid, mediaType);
    await subscribeToUser(user);
    onUserPublished?.(user, mediaType);
  });

  client.on("user-unpublished", (user, mediaType) => {
    console.log("[Agora] User unpublished:", user.uid, mediaType);
    onUserUnpublished?.(user, mediaType);
  });

  client.on("user-joined", (user) => {
    console.log("[Agora] User joined:", user.uid);
    onUserJoined?.(user);
  });

  client.on("user-left", (user, reason) => {
    console.log("[Agora] User left:", user.uid, reason);
    delete remoteUsersRef.current[user.uid];
    onUserLeft?.(user, reason);
  });

  client.on("connection-state-change", (curState, prevState, reason) => {
    console.log("[Agora] Connection state:", curState, prevState, reason);
    onConnectionStateChanged?.(curState, prevState, reason);
  });
}

export function getRemoteUsers() {
  return remoteUsersRef.current;
}

export async function leaveChannel() {
  const client = clientRef.current;
  const localTracks = localTracksRef.current;

  if (localTracks.audioTrack) {
    localTracks.audioTrack.stop();
    localTracks.audioTrack.close();
  }
  if (localTracks.videoTrack) {
    localTracks.videoTrack.stop();
    localTracks.videoTrack.close();
  }

  localTracksRef.current = { audioTrack: null, videoTrack: null };

  if (client) {
    await client.leave();
    clientRef.current = null;
  }
}

export function getLocalTracks() {
  return localTracksRef.current;
}

export function getClient() {
  return clientRef.current;
}

export async function muteAudio(muted) {
  const audioTrack = localTracksRef.current.audioTrack;
  if (audioTrack) {
    await audioTrack.setEnabled(!muted);
  }
}

export async function muteVideo(muted) {
  const videoTrack = localTracksRef.current.videoTrack;
  if (videoTrack) {
    await videoTrack.setEnabled(!muted);
  }
}