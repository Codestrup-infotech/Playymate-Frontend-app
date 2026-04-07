"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

const BG_PAGE    = "#FFFFFF";
const BG_SURFACE = "#F9FAFB";
const BG_BORDER  = "#E5E7EB";
const TEXT_1     = "#111827";
const TEXT_2     = "#6B7280";
const GOLD       = "#D97706";
const GOLD_BG    = "#FFFBEB";
const GOLD_BDR   = "#FDE68A";
const RED        = "#DC2626";
const RED_BG     = "#FEF2F2";
const RED_BDR    = "#FECACA";

const ACCENT_PRO = "#EC4899";
const ACCENT_VIP = "#8B5CF6";

// ─── FIXED: using access_token ────────────────────────────────────────────────
function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

function ActivationContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const planKey = searchParams.get("key")   || "";
  const planId  = searchParams.get("plan")  || "";

  const [subscription, setSubscription] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => { fetchSubscription(); }, []);

  const fetchSubscription = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res  = await fetch(`${API_BASE}/subscriptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json?.status === "success" && json?.data) {
        setSubscription(json.data);
      } else {
        throw new Error(json?.message || "Could not fetch subscription");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const planName = subscription?.plan_name || planKey || "Pro";
  const status   = subscription?.status    || "ACTIVE";

  const coinsFromUrl = Number(searchParams.get("coins") || 0);
  const coins        = coinsFromUrl || subscription?.coins_remaining || 0;

  const isVIP = planKey.toLowerCase().startsWith("vip") ||
                planName.toLowerCase() === "vip";

  const accentColor    = isVIP ? ACCENT_VIP : ACCENT_PRO;
  const accentGradient = `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`;

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const endDate  = formatDate(subscription?.end_date);
  const price    = subscription?.price;
  const features = subscription?.features || [];

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
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes popIn  { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>

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

        {!error && coins > 0 && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: GOLD_BG, border: `1px solid ${GOLD_BDR}`,
            borderRadius: "100px", padding: "10px 22px",
            color: GOLD, fontSize: "15px", fontWeight: 600,
            marginBottom: "20px",
            animation: "fadeUp 0.4s 0.2s ease both",
          }}>
            🪙 {coins.toLocaleString("en-IN")} gold coins credited
          </div>
        )}

        {subscription && !error && (
          <div style={{
            background: BG_SURFACE,
            border: `1px solid ${BG_BORDER}`,
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "28px",
            textAlign: "left",
            animation: "fadeUp 0.4s 0.22s ease both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", color: TEXT_2 }}>Plan</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: TEXT_1 }}>{planName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", color: TEXT_2 }}>Status</span>
              <span style={{
                fontSize: "12px", fontWeight: 600,
                background: "#D1FAE5", color: "#065F46",
                padding: "2px 10px", borderRadius: "100px",
              }}>
                {status}
              </span>
            </div>
            {price != null && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: TEXT_2 }}>Amount Paid</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: TEXT_1 }}>
                  ₹{Number(price).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {endDate && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: TEXT_2 }}>Valid Until</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT_1 }}>{endDate}</span>
              </div>
            )}
            {features.length > 0 && (
              <div style={{
                marginTop: "12px", paddingTop: "12px",
                borderTop: `1px solid ${BG_BORDER}`,
                fontSize: "12px", color: TEXT_2,
              }}>
                ✓ {features.length} features included
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            background: RED_BG, border: `1px solid ${RED_BDR}`,
            borderRadius: "12px", padding: "12px 16px",
            color: RED, fontSize: "13px", marginBottom: "28px",
            animation: "fadeUp 0.4s 0.2s ease both",
          }}>
            ⚠️ {error} — but your payment went through!
          </div>
        )}

        <div style={{
          display: "flex", flexDirection: "column", gap: "12px",
          animation: "fadeUp 0.4s 0.28s ease both",
        }}>
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