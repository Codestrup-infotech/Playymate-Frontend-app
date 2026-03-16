"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Design tokens (matched to pro-plan page) ─────────────────────────────────
const BG_PAGE    = "#FFFFFF";
const BG_SURFACE = "#F9FAFB";
const BG_BORDER  = "#E5E7EB";
const TEXT_1     = "#111827";
const TEXT_2     = "#6B7280";
const TEXT_3     = "#9CA3AF";
const GOLD       = "#D97706";
const GOLD_BG    = "#FFFBEB";
const GOLD_BDR   = "#FDE68A";
const RED        = "#DC2626";
const RED_BG     = "#FEF2F2";
const RED_BDR    = "#FECACA";

const ACCENT_PRO     = "#EC4899";
const ACCENT_VIP     = "#8B5CF6";

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

  useEffect(() => { fetchSubscription(); }, []);

  const fetchSubscription = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/subscriptions/me`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  const planName     = subscription?.plan_name || "Pro";
  const coinsFromUrl = Number(searchParams.get("coins") || 0);
  const coins        = coinsFromUrl || subscription?.coins_remaining || 0;
  const isVIP        = planKey.startsWith("vip") || planName.toLowerCase() === "vip";

  const accentColor   = isVIP ? ACCENT_VIP : ACCENT_PRO;
  const accentGradient = `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: BG_PAGE,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px",
            border: `3px solid ${BG_BORDER}`,
            borderTop: `3px solid ${accentColor}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 14px",
          }} />
          <p style={{ color: TEXT_2, fontSize: "14px" }}>Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG_PAGE,
      color: TEXT_1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>

        {/* ── Success icon — light surface with accent glow ── */}
        <div style={{
          width: "120px", height: "120px", borderRadius: "50%",
          background: `${accentColor}12`,
          border: `2px solid ${accentColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: `0 0 40px ${accentColor}20`,
          animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}>
          <CheckCircle size={56} color={accentColor} strokeWidth={1.5} />
        </div>

        {/* ── Title ── */}
        <h1 style={{
          fontSize: "32px", fontWeight: 800,
          letterSpacing: "-0.5px", marginBottom: "12px",
          lineHeight: 1.2, color: TEXT_1,
          animation: "fadeUp 0.4s 0.1s ease both",
        }}>
          {planName}{" "}
          <span style={{
            background: accentGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Unlocked!
          </span>
        </h1>

        <p style={{
          color: TEXT_2, fontSize: "16px", marginBottom: "28px",
          animation: "fadeUp 0.4s 0.15s ease both",
        }}>
          Welcome to the big leagues 🎉
        </p>

        {/* ── Coins credited pill — matches pro-plan coin badge ── */}
        {!error && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: GOLD_BG, border: `1px solid ${GOLD_BDR}`,
            borderRadius: "100px", padding: "10px 22px",
            color: GOLD, fontSize: "15px", fontWeight: 600,
            marginBottom: "48px",
            animation: "fadeUp 0.4s 0.2s ease both",
          }}>
            🪙 {coins} gold coins Credited
          </div>
        )}

        {error && (
          <div style={{
            background: RED_BG, border: `1px solid ${RED_BDR}`,
            borderRadius: "12px", padding: "12px 16px",
            color: RED, fontSize: "13px", marginBottom: "32px",
            animation: "fadeUp 0.4s 0.2s ease both",
          }}>
            {error} — but your payment went through!
          </div>
        )}

        {/* ── CTA Buttons ── */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "12px",
          animation: "fadeUp 0.4s 0.25s ease both",
        }}>

          {/* Primary — matches pro-plan "Continue to Checkout" button */}
          <button
            onClick={() => router.push("/home/subscription/compare-plans")}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px",
              border: "none", cursor: "pointer",
              fontSize: "15px", fontWeight: 700,
              background: accentGradient,
              color: "#fff", transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Explore Features
          </button>

          {/* Secondary — light surface style */}
          <button
            onClick={() => router.push("/home/wallet")}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px",
              border: `1px solid ${BG_BORDER}`, cursor: "pointer",
              fontSize: "15px", fontWeight: 600,
              background: BG_SURFACE, color: TEXT_2,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.color = TEXT_1;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = BG_BORDER;
              e.currentTarget.style.color = TEXT_2;
            }}
          >
            View Wallet
          </button>

        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return <div style={{ minHeight: "100vh", background: BG_PAGE }} />;
}

export default function ActivationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ActivationContent />
    </Suspense>
  );
}