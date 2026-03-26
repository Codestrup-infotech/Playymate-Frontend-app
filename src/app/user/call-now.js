const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.playymate.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function getHeaders(json = false) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...(json && { "Content-Type": "application/json" }),
  };
}

// ── INITIATE CALL ─────────────────────────────
export async function initiateCall(payload) {
  const res = await fetch(`${BASE_URL}/calls/initiate`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Call failed");
  return data;
}

// ── ACCEPT CALL ─────────────────────────────
export async function acceptCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/accept`, {
    method: "POST",
    headers: getHeaders(),
  });

  return res.json();
}

// ── DECLINE CALL ─────────────────────────────
export async function declineCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/decline`, {
    method: "POST",
    headers: getHeaders(),
  });

  return res.json();
}

// ── LEAVE CALL ─────────────────────────────
export async function leaveCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/leave`, {
    method: "POST",
    headers: getHeaders(),
  });

  return res.json();
}

// ── END CALL (HOST ONLY) ─────────────────────
export async function endCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/end`, {
    method: "POST",
    headers: getHeaders(),
  });

  return res.json();
}

// ── ADD PARTICIPANT (GROUP CALL) ─────────────
export async function addParticipant(callId, userId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/add`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ user_id: userId }),
  });

  return res.json();
}

// ── GET CALL HISTORY ─────────────────────────
export async function getCallHistory(params = {}) {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${BASE_URL}/calls/history?${query}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return res.json();
}

// ── GET ACTIVE CALL ─────────────────────────
export async function getActiveCall() {
  const res = await fetch(`${BASE_URL}/calls/active`, {
    method: "GET",
    headers: getHeaders(),
  });

  return res.json();
}

// ── GET CALL BY ID ─────────────────────────
export async function getCallById(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return res.json();
}