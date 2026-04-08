const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.playymate.com/api/v1";

// ─────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────
export function getToken() {
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

// ─────────────────────────────────────────────
// Session storage helpers
// ─────────────────────────────────────────────

/**
 * Save call data to sessionStorage so the call page can use it
 * without needing to call accept (for the initiator)
 */
export function storeCallSession(callId, payload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`call_${callId}`, JSON.stringify(payload));
}

export function getCallSession(callId) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`call_${callId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCallSession(callId) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`call_${callId}`);
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

export async function initiateCall(payload) {
  const res = await fetch(`${BASE_URL}/calls/initiate`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("[call-now.js] initiateCall response:", JSON.stringify(data, null, 2));
  if (!res.ok) throw new Error(data.message || "Failed to initiate call");
  return data;
}

export async function acceptCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/accept`, {
    method: "POST",
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to accept call");
  return data;
}

export async function declineCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/decline`, {
    method: "POST",
    headers: getHeaders(),
  });
  return res.json();
}

export async function leaveCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/leave`, {
    method: "POST",
    headers: getHeaders(),
  });
  return res.json();
}

export async function endCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/end`, {
    method: "POST",
    headers: getHeaders(),
  });
  return res.json();
}

export async function addParticipant(callId, userId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/add`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

export async function getCallHistory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/calls/history?${query}`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function getActiveCall() {
  const res = await fetch(`${BASE_URL}/calls/active`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function getCallById(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}`, {
    headers: getHeaders(),
  });
  return res.json();
}