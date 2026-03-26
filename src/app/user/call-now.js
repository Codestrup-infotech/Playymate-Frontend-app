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

// ── INITIATE CALL ─────────────────────────────
export async function initiateCall(payload) {
  const res = await fetch(`${BASE_URL}/calls/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
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
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
}

// ── DECLINE CALL ─────────────────────────────
export async function declineCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/decline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
}

// ── END CALL ─────────────────────────────
export async function endCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/end`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
}

// ── LEAVE CALL ─────────────────────────────
export async function leaveCall(callId) {
  const res = await fetch(`${BASE_URL}/calls/${callId}/leave`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
}

// ── GET ACTIVE CALL ─────────────────────────
export async function getActiveCall() {
  const res = await fetch(`${BASE_URL}/calls/active`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
}