"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("playymate_access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function ActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planKey = searchParams.get("key") || "";
  const planId  = searchParams.get("plan") || "";

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/subscriptions/me`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();

      if (data?.status === "success") {
        setSubscription(data.data);
      } else {
        throw new Error(data?.message || "Could not fetch subscription");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // coins_credited passed via URL from purchase response (more reliable than coins_remaining)
  const planName = subscription?.plan_name || "Pro";
  const coinsFromUrl = Number(searchParams.get("coins") || 0);
  const coins = coinsFromUrl || subscription?.coins_remaining || 0;
  const isVIP = planKey.startsWith("vip") || planName.toLowerCase() === "vip";

  const accentGradient = isVIP
    ? "linear-gradient(135deg, #9333EA, #6B21A8)"
    : "linear-gradient(135deg, #FF3E87, #FF6B35)";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0D0D0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid #1E1E1E",
              borderTop: "3px solid #FF3E87",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: "14px" }}>
            Confirming your subscription...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>

        {/* Success icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "#111111",
            border: "2px solid #1E1E1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: isVIP
              ? "0 0 40px rgba(147,51,234,0.3)"
              : "0 0 40px rgba(255,62,135,0.3)",
            animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          <CheckCircle
            size={56}
            color={isVIP ? "#9333EA" : "#FF3E87"}
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: "12px",
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: "#F9FAFB" }}>{planName} </span>
          <span
            style={{
              background: accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Unlocked!
          </span>
        </h1>

        <p style={{ color: "#6B7280", fontSize: "16px", marginBottom: "28px" }}>
          Welcome to the big leagues 🎉
        </p>

        {/* Coins credited pill */}
        {!error && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#1C1A00",
              border: "1px solid #3D3A00",
              borderRadius: "100px",
              padding: "10px 22px",
              color: "#FBBF24",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "48px",
            }}
          >
            🪙 {coins} gold coins Credited
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#1A0A0A",
              border: "1px solid #7F1D1D",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "#FCA5A5",
              fontSize: "13px",
              marginBottom: "32px",
            }}
          >
            {error} — but your payment went through!
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Explore Features */}
          <button
            onClick={() => router.push("/home/subscription/compare-plans")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 700,
              background: accentGradient,
              color: "#fff",
              letterSpacing: "0.3px",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Explore Features
          </button>

          {/* View Wallet */}
          <button
            onClick={() => router.push("/home/wallet")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "1.5px solid #1E1E1E",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 700,
              background: "transparent",
              color: "#9CA3AF",
              letterSpacing: "0.3px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF3E87";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1E1E1E";
              e.currentTarget.style.color = "#9CA3AF";
            }}
          >
            View Wallet
          </button>

        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}

export default function ActivationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ActivationContent />
    </Suspense>
  );
}