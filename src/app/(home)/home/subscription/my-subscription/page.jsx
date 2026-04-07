"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
const RED_BG     = "#FEF2F2";
const ACCENT_PRO     = "#EC4899";
const ACCENT_VIP     = "#8B5CF6";
const ACCENT_STARTER = "#3B82F6";
const ACCENT_FREE    = "#6B7280";

// ─── FIXED: using access_token ────────────────────────────────────────────────
function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function daysLeft(endDate) {
  if (!endDate) return null;
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000));
}
function featureLabel(key) {
  return key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function MySubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [coins,        setCoins]        = useState(null);
  const [diamonds,     setDiamonds]     = useState(null);
  const [coinHistory,  setCoinHistory]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [noSub,        setNoSub]        = useState(false);
  const [cancelling,   setCancelling]   = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to view your subscription.");
      setLoading(false);
      return;
    }
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [s, c, d, hist] = await Promise.all([
        fetch(`${API_BASE}/subscriptions/me`,                        { headers: h }),
        fetch(`${API_BASE}/coins/balance`,                           { headers: h }),
        fetch(`${API_BASE}/diamonds/balance`,                        { headers: h }),
        fetch(`${API_BASE}/coins/history?page=1&limit=20&type=ALL`, { headers: h }),
      ]);
      const sj = await s.json();
      const cj = await c.json();
      const dj = await d.json();
      const hj = await hist.json();

      // FIXED: handle SUBSCRIPTION_NOT_FOUND gracefully instead of throwing
      if (sj?.status === "success" && sj?.data) {
        setSubscription(sj.data);
      } else if (sj?.error_code === "SUBSCRIPTION_NOT_FOUND") {
        setNoSub(true);
      } else {
        throw new Error(sj?.message || "Failed to load subscription.");
      }

      if (cj?.status === "success") setCoins(cj.data?.gold_coins || null);
      if (dj?.status === "success") setDiamonds(dj.data || null);
      if (hj?.status === "success") setCoinHistory(hj.data?.transactions || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const billingValue = subscription?.billing_cycle?.value;
  const isMonthly    = billingValue === 30;
  const planLower    = (subscription?.plan_name || "").toLowerCase();
  const isVIP        = planLower === "vip";
  const isPro        = planLower === "pro";
  const isStarter    = planLower === "starter";
  const accentColor  = isVIP ? ACCENT_VIP : isPro ? ACCENT_PRO : isStarter ? ACCENT_STARTER : ACCENT_FREE;
  const planGradient = `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`;
  const remaining    = daysLeft(subscription?.end_date);
  const coinBalance  = coins?.balance ?? subscription?.coins_remaining ?? 0;
  const diaBalance   = diamonds?.balance ?? 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "36px", height: "36px", border: `3px solid ${BG_BORDER}`, borderTop: `3px solid ${ACCENT_PRO}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: TEXT_2, fontSize: "13px" }}>Loading subscription...</p>
      </div>
    </div>
  );

  // FIXED: show upsell screen instead of error when no subscription exists
  if (noSub) return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}` }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> My Subscription
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", gap: "16px" }}>
        <div style={{ fontSize: "48px" }}>🎯</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: TEXT_1 }}>No Active Plan</h2>
        <p style={{ color: TEXT_2, fontSize: "14px", maxWidth: "280px", lineHeight: 1.6 }}>
          You don't have an active subscription yet. Pick a plan to unlock all features.
        </p>
        <button
          onClick={() => router.push("/home/subscription")}
          style={{ padding: "13px 32px", borderRadius: "12px", border: "none", background: `linear-gradient(135deg,${ACCENT_PRO},${ACCENT_PRO}CC)`, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
        >
          View Plans
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}` }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> My Subscription
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", gap: "16px" }}>
        <div style={{ fontSize: "48px" }}>📭</div>
        <p style={{ color: TEXT_2, fontSize: "15px" }}>{error}</p>
        <button onClick={() => router.push("/home/subscription")}
          style={{ padding: "12px 32px", borderRadius: "12px", border: "none", background: `linear-gradient(135deg,${ACCENT_PRO},${ACCENT_PRO}CC)`, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
          View Plans
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, paddingBottom: "160px" }}>
      <style>{`* { box-sizing:border-box; } @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}`, background: BG_PAGE, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> My Subscription
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 0" }}>

        {/* Plan Hero */}
        <div style={{ background: `linear-gradient(135deg,${accentColor}18,${BG_SURFACE})`, border: `1.5px solid ${accentColor}40`, borderRadius: "20px", padding: "20px", marginBottom: "16px", animation: "fadeUp 0.35s ease both" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: planGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                {isVIP ? "👑" : isPro ? "⭐" : isStarter ? "🌱" : "🆓"}
              </div>
              <div>
                <p style={{ fontSize: "17px", fontWeight: 800, color: TEXT_1, marginBottom: "6px" }}>{subscription.plan_name} Plan</p>
                <span style={{ fontSize: "11px", fontWeight: 700, color: GREEN, background: GREEN_BG, border: `1px solid ${GREEN_BDR}`, borderRadius: "20px", padding: "2px 10px" }}>
                  ● {subscription.status}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "24px", fontWeight: 800, color: accentColor, lineHeight: 1 }}>₹{subscription.price}</p>
              <p style={{ fontSize: "12px", color: TEXT_2, marginTop: "2px" }}>/{isMonthly ? "month" : "year"}</p>
            </div>
          </div>

          {remaining !== null && billingValue && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "11px", color: TEXT_2 }}>Days remaining</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: remaining < 7 ? RED : accentColor }}>{remaining} days</span>
              </div>
              <div style={{ height: "5px", background: BG_BORDER, borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (remaining / billingValue) * 100)}%`, background: remaining < 7 ? RED : planGradient, borderRadius: "99px" }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${BG_BORDER}`, paddingTop: "12px", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: TEXT_2 }}>
              <Calendar size={11} style={{ display: "inline", marginRight: "3px" }} />
              Started: <strong style={{ color: TEXT_1 }}>{formatDate(subscription.start_date)}</strong>
            </span>
            <span style={{ fontSize: "12px", color: TEXT_2, textAlign: "right" }}>
              <Calendar size={11} style={{ display: "inline", marginRight: "3px" }} />
              Renews: <strong style={{ color: TEXT_1 }}>{formatDate(subscription.next_renewal)}</strong>
            </span>
          </div>
        </div>

        {/* Coins + Diamonds */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", animation: "fadeUp 0.35s 0.05s ease both" }}>
          <div style={{ background: GOLD_BG, border: `1px solid ${GOLD_BDR}`, borderRadius: "16px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: TEXT_2, marginBottom: "8px", fontWeight: 600, letterSpacing: "0.5px" }}>GOLD COINS</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: GOLD }}>🪙 {coinBalance.toLocaleString("en-IN")}</p>
            {coins?.expires_at && <p style={{ fontSize: "10px", color: TEXT_3, marginTop: "5px" }}>Expires {formatDate(coins.expires_at)}</p>}
            {coins?.days_remaining != null && <p style={{ fontSize: "10px", color: GOLD, marginTop: "3px", fontWeight: 600 }}>{coins.days_remaining} days left</p>}
          </div>
          <div style={{ background: `${ACCENT_VIP}10`, border: `1px solid ${ACCENT_VIP}30`, borderRadius: "16px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: TEXT_2, marginBottom: "8px", fontWeight: 600, letterSpacing: "0.5px" }}>DIAMONDS</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: ACCENT_VIP }}>💎 {diaBalance.toLocaleString("en-IN")}</p>
            {diamonds?.status && <p style={{ fontSize: "10px", color: TEXT_3, marginTop: "5px" }}>{diamonds.status}</p>}
          </div>
        </div>

        {/* Switch to Yearly */}
        {isMonthly && (
          <div onClick={() => router.push("/home/subscription")}
            style={{ background: `${accentColor}10`, border: `1.5px dashed ${accentColor}50`, borderRadius: "14px", padding: "14px 16px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeUp 0.35s 0.08s ease both" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: TEXT_1, marginBottom: "2px" }}>💡 Switch to Yearly</p>
              <p style={{ fontSize: "12px", color: TEXT_2 }}>Save up to 30% on your plan</p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: accentColor }}>Save →</span>
          </div>
        )}

        {/* Coin History */}
        <div style={{ animation: "fadeUp 0.35s 0.1s ease both" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: accentColor, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
            Coin History
          </p>
          <div style={{ background: BG_SURFACE, border: `1px solid ${BG_BORDER}`, borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
            {coinHistory.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: TEXT_3, fontSize: "13px" }}>No coin transactions yet</div>
            ) : coinHistory.map((tx, i) => (
              <div key={tx._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: i < coinHistory.length - 1 ? `1px solid ${BG_BORDER}` : "none", background: BG_PAGE }}>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", flexShrink: 0, background: tx.type === "CREDIT" ? GREEN_BG : RED_BG, color: tx.type === "CREDIT" ? GREEN : RED, border: `1px solid ${tx.type === "CREDIT" ? GREEN_BDR : "#FECACA"}` }}>
                  {tx.type === "CREDIT" ? "Credited" : "Debited"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: TEXT_1, marginBottom: "2px" }}>
                    {tx.source_reference ? tx.source_reference.replace(/_/g, " ").toUpperCase() : tx.source}
                  </p>
                  <p style={{ fontSize: "11px", color: TEXT_3 }}>{formatDateTime(tx.created_at)}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: tx.type === "CREDIT" ? GREEN : RED }}>
                    {tx.type === "CREDIT" ? "+" : "−"}{tx.amount} 🪙
                  </p>
                  <p style={{ fontSize: "10px", color: TEXT_3, marginTop: "2px" }}>Bal: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        {subscription?.features?.length > 0 && (
          <div style={{ animation: "fadeUp 0.35s 0.12s ease both" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: accentColor, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
              Features ({subscription.features.length})
            </p>
            <div style={{ background: BG_SURFACE, border: `1px solid ${BG_BORDER}`, borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
              {subscription.features.map((f, i) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", borderBottom: i < subscription.features.length - 1 ? `1px solid ${BG_BORDER}` : "none", background: BG_PAGE }}>
                  <span style={{ color: GREEN, fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "13px", color: TEXT_1 }}>{featureLabel(f)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Details */}
        <div style={{ background: BG_SURFACE, border: `1px solid ${BG_BORDER}`, borderRadius: "14px", padding: "16px", marginBottom: "20px", animation: "fadeUp 0.35s 0.14s ease both" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: TEXT_3, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "12px" }}>Plan Details</p>
          {[
            ["Subscription ID", subscription.subscription_id || "—", true],
            ["Billing Cycle",   isMonthly ? "Monthly (30 days)" : "Yearly (365 days)", false],
            ["Valid From",      formatDate(subscription.start_date), false],
            ["Valid Until",     formatDate(subscription.end_date), false],
            ["Next Renewal",    formatDate(subscription.next_renewal), false],
          ].map(([label, value, mono]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: TEXT_2, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: TEXT_1, textAlign: "right", wordBreak: "break-all", fontFamily: mono ? "monospace" : "inherit" }}>{value}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Fixed Bottom CTAs
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "linear-gradient(to top,#FFFFFF 80%,transparent)" }}>
        <div style={{ maxWidth: "440px", marginLeft: "", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => router.push("/home/subscription")}
            style={{ width: "100%", padding: "15px", borderRadius: "14px", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, background: planGradient, color: "#fff", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Change Plan
          </button>
          <button disabled={cancelling}
            onClick={() => { if (!confirm("Cancel subscription?")) return; setCancelling(true); router.push("/home/support"); }}
            style={{ width: "100%", padding: "12px", background: "transparent", border: "none", cursor: cancelling ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600, color: RED, opacity: cancelling ? 0.5 : 1 }}>
            {cancelling ? "Processing..." : "Cancel Subscription"}
          </button>
        </div>
      </div> */}

<div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          background: "linear-gradient(to top,#FFFFFF 70%,transparent)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() =>
            router.push("/home/subscription")
          }
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "15px",
            marginLeft: "160px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 700,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            color: "#fff",
          }}
        >
          Done
        </button>
        
      </div>
    </div>
  );
}