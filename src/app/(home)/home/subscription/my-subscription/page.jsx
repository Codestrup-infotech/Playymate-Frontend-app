"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
const GREEN      = "#059669";
const GREEN_BG   = "#ECFDF5";
const GREEN_BDR  = "#A7F3D0";
const RED        = "#DC2626";

const ACCENT_PRO     = "#EC4899";
const ACCENT_VIP     = "#8B5CF6";
const ACCENT_STARTER = "#3B82F6";
const ACCENT_FREE    = "#6B7280";

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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function MySubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [coins,        setCoins]        = useState(null);
  const [history,      setHistory]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [cancelling,   setCancelling]   = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) { setError("Please log in to view your subscription."); setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [subRes, coinsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/subscriptions/me`, { headers }),
        fetch(`${API_BASE}/coins/balance`,    { headers }),
        fetch(`${API_BASE}/coins/history?page=1&limit=10&type=ALL`, { headers }),
      ]);

      const subData     = await subRes.json();
      const coinsData   = await coinsRes.json();
      const historyData = await historyRes.json();

      if (subData?.status === "success")     setSubscription(subData.data);
      else throw new Error(subData?.message || "No active subscription found");

      if (coinsData?.status === "success")   setCoins(coinsData.data?.gold_coins);
      if (historyData?.status === "success") setHistory(historyData.data?.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isMonthly  = subscription?.billing_cycle?.value === 30;
  const isVIP      = subscription?.plan_name?.toLowerCase() === "vip";
  const isPro      = subscription?.plan_name?.toLowerCase() === "pro";
  const isStarter  = subscription?.plan_name?.toLowerCase() === "starter";

  const accentColor  = isVIP ? ACCENT_VIP : isPro ? ACCENT_PRO : isStarter ? ACCENT_STARTER : ACCENT_FREE;
  const planGradient = `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG_PAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: `3px solid ${BG_BORDER}`, borderTop: `3px solid ${ACCENT_PRO}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: TEXT_2, fontSize: "13px" }}>Loading subscription...</p>
        </div>
      </div>
    );
  }

  // ── Error / no subscription ───────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}` }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
            <ArrowLeft size={18} /> My Subscription
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", gap: "16px" }}>
          <div style={{ fontSize: "48px" }}>📭</div>
          <p style={{ color: TEXT_2, fontSize: "15px" }}>{error}</p>
          <button
            onClick={() => router.push("/home/subscription")}
            style={{ padding: "12px 32px", borderRadius: "12px", border: "none", background: `linear-gradient(135deg, ${ACCENT_PRO}, ${ACCENT_PRO}CC)`, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, paddingBottom: "120px" }}>
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Nav — matches pro-plan page ── */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}`, background: BG_PAGE, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> My Subscription
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 0" }}>

        {/* ── Plan Card — matches pro-plan hero card ── */}
        <div style={{
          background: `linear-gradient(135deg, ${accentColor}22, #F9FAFB)`,
          border: `1px solid ${accentColor}40`,
          borderRadius: "20px", padding: "20px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: planGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                {isVIP ? "👑" : isPro ? "⭐" : "🎮"}
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: TEXT_1, marginBottom: "6px" }}>
                  {subscription.plan_name} Plan
                </p>
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: GREEN,
                  background: GREEN_BG, border: `1px solid ${GREEN_BDR}`,
                  borderRadius: "20px", padding: "2px 10px",
                }}>
                  {subscription.status}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: accentColor }}>₹ {subscription.price}</span>
              <span style={{ fontSize: "12px", color: TEXT_2 }}>/{isMonthly ? "month" : "year"}</span>
            </div>
          </div>

          {/* Next billing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: TEXT_2, fontSize: "13px", borderTop: `1px solid ${BG_BORDER}`, paddingTop: "14px" }}>
            <Calendar size={14} />
            <span>Next billing: <span style={{ color: TEXT_1, fontWeight: 500 }}>{formatDate(subscription.next_renewal)}</span></span>
          </div>
        </div>

        {/* ── Switch to Yearly + Coins row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>

          {isMonthly ? (
            <div
              onClick={() => router.push("/home/subscription")}
              style={{ background: BG_SURFACE, border: `1px solid ${accentColor}40`, borderRadius: "14px", padding: "16px", cursor: "pointer" }}
            >
              <p style={{ fontSize: "14px", fontWeight: 700, color: TEXT_1, marginBottom: "4px" }}>Switch to Yearly</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: accentColor }}>Save 30% →</p>
            </div>
          ) : (
            <div style={{ background: BG_SURFACE, border: `1px solid ${BG_BORDER}`, borderRadius: "14px", padding: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: TEXT_1, marginBottom: "4px" }}>Yearly Plan</p>
              <p style={{ fontSize: "12px", color: GREEN, fontWeight: 600 }}>Best Value ✓</p>
            </div>
          )}

          {/* Coins — matches pro-plan coin badge */}
          <div style={{ background: GOLD_BG, border: `1px solid ${GOLD_BDR}`, borderRadius: "14px", padding: "16px" }}>
            <p style={{ fontSize: "12px", color: TEXT_2, marginBottom: "6px" }}>
              {isMonthly ? "Monthly" : "Yearly"} Coins
            </p>
            <p style={{ fontSize: "16px", fontWeight: 700, color: GOLD }}>
              🪙 {coins?.balance ?? subscription.coins_remaining ?? 0} Coins
            </p>
          </div>
        </div>

        {/* ── Coin History — section label matches pro-plan ── */}
        <p style={{ fontSize: "13px", fontWeight: 600, color: accentColor, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "12px" }}>
          Coin History
        </p>

        <div style={{ background: BG_SURFACE, border: `1px solid ${accentColor}30`, borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
          {history.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: TEXT_3, fontSize: "13px" }}>
              No transactions yet
            </div>
          ) : (
            history.map((tx, i) => (
              <div key={tx._id} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px",
                borderBottom: i < history.length - 1 ? `1px solid ${BG_BORDER}` : "none",
                background: BG_PAGE,
              }}>
                {/* Type badge */}
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "3px 10px",
                  borderRadius: "20px", flexShrink: 0,
                  background: tx.type === "CREDIT" ? GREEN_BG : "#FEF2F2",
                  color: tx.type === "CREDIT" ? GREEN : RED,
                  border: `1px solid ${tx.type === "CREDIT" ? GREEN_BDR : "#FECACA"}`,
                }}>
                  {tx.type === "CREDIT" ? "Credited" : "Debit"}
                </span>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: TEXT_1, marginBottom: "2px" }}>
                    {formatDate(tx.created_at)}
                  </p>
                  <p style={{ fontSize: "11px", color: TEXT_3 }}>
                    {tx.source_reference?.replace(/_/g, " ") || tx.source}
                  </p>
                </div>

                {/* Amount */}
                <p style={{ fontSize: "13px", fontWeight: 700, color: tx.type === "CREDIT" ? GREEN : RED, flexShrink: 0 }}>
                  {tx.type === "CREDIT" ? "+" : "-"}{tx.amount} 🪙
                </p>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── Fixed Bottom CTAs — matches pro-plan button style ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px 24px",
        background: "linear-gradient(to top,#FFFFFF 80%,transparent)",
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>

          <button
            onClick={() => router.push("/home/subscription")}
            style={{
              width: "100%",maxWidth:"440px",marginLeft:"100px", padding: "15px", borderRadius: "14px", border: "none",
              cursor: "pointer", fontSize: "15px", fontWeight: 700,
              background: planGradient, color: "#fff", transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Change Plan
          </button>

          <button
            disabled={cancelling}
            onClick={async () => {
              if (!confirm("Are you sure you want to cancel your subscription?")) return;
              setCancelling(true);
              router.push("/home/support");
            }}
            style={{
              width: "100%", padding: "12px", background: "transparent", border: "none",
              cursor: cancelling ? "not-allowed" : "pointer",marginLeft:"80px",
              fontSize: "14px", fontWeight: 600, color: RED,
              transition: "opacity 0.2s", opacity: cancelling ? 0.5 : 1,
            }}
          >
            {cancelling ? "Processing..." : "Cancel Subscription"}
          </button>

        </div>
      </div>

    </div>
  );
}