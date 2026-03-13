"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Crown } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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

function formatAmount(amount) {
  return `₹ ${amount ?? 0}`;
}

export default function MySubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [coins, setCoins]               = useState(null);
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to view your subscription.");
      setLoading(false);
      return;
    }
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

  const isMonthly     = subscription?.billing_cycle?.value === 30;
  const isVIP         = subscription?.plan_name?.toLowerCase() === "vip";
  const isPro         = subscription?.plan_name?.toLowerCase() === "pro";
  const accentColor   = isVIP ? "#9333EA" : "#FF3E87";
  const planGradient  = isVIP
    ? "linear-gradient(135deg,#9333EA,#6B21A8)"
    : isPro
    ? "linear-gradient(135deg,#3B82F6,#6366F1)"
    : "linear-gradient(135deg,#374151,#1F2937)";

  // ── loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #222", borderTop: "3px solid #FF3E87", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Loading subscription...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── error / no subscription ────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#fff", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1A1A1A" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
            <ArrowLeft size={18} /> My Subscription
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", gap: "16px" }}>
          <div style={{ fontSize: "48px" }}>📭</div>
          <p style={{ color: "#9CA3AF", fontSize: "15px" }}>{error}</p>
          <button
            onClick={() => router.push("/home/subscription")}
            style={{ padding: "12px 32px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#FF3E87,#FF6B35)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", paddingBottom: "120px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1A1A1A" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> My Subscription
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 0" }}>

        {/* ── Plan Card ── */}
        <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "18px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Plan icon */}
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: planGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                {isVIP ? "👑" : isPro ? "⭐" : "🎮"}
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#F9FAFB", marginBottom: "4px" }}>
                  {subscription.plan_name} Plan
                </p>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#22C55E", background: "#052E16", border: "1px solid #166534", borderRadius: "20px", padding: "2px 10px" }}>
                  {subscription.status}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#F9FAFB" }}>₹ {subscription.price}</span>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>/{isMonthly ? "month" : "year"}</span>
            </div>
          </div>

          {/* Next billing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B7280", fontSize: "13px", borderTop: "1px solid #1A1A1A", paddingTop: "14px" }}>
            <Calendar size={14} />
            <span>Next billing: <span style={{ color: "#D1D5DB", fontWeight: 500 }}>{formatDate(subscription.next_renewal)}</span></span>
          </div>
        </div>

        {/* ── Switch to Yearly + Monthly Coins row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>

          {/* Switch to Yearly — only show if currently monthly */}
          {isMonthly ? (
            <div
              onClick={() => router.push("/home/subscription")}
              style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "14px", padding: "16px", cursor: "pointer" }}
            >
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#F9FAFB", marginBottom: "4px" }}>Switch to Yearly</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: accentColor }}>Save 30% →</p>
            </div>
          ) : (
            <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "14px", padding: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#F9FAFB", marginBottom: "4px" }}>Yearly Plan</p>
              <p style={{ fontSize: "12px", color: "#22C55E", fontWeight: 600 }}>Best Value ✓</p>
            </div>
          )}

          {/* Monthly Coins */}
          <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "14px", padding: "16px" }}>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px" }}>
              {isMonthly ? "Monthly" : "Yearly"} Coins
            </p>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#FBBF24" }}>
              🪙 {coins?.balance ?? subscription.coins_remaining ?? 0} Coins
            </p>
          </div>
        </div>

        {/* ── Payment / Coin History ── */}
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "12px" }}>
          Coin History
        </p>

        <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
          {history.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#6B7280", fontSize: "13px" }}>
              No transactions yet
            </div>
          ) : (
            history.map((tx, i) => (
              <div key={tx._id} style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
                borderBottom: i < history.length - 1 ? "1px solid #1A1A1A" : "none"
              }}>
                {/* Status badge */}
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", flexShrink: 0,
                  background: tx.status === "ACTIVE" ? "#052E16" : "#1A1A1A",
                  color: tx.status === "ACTIVE" ? "#22C55E" : "#6B7280",
                  border: `1px solid ${tx.status === "ACTIVE" ? "#166534" : "#374151"}`,
                }}>
                  {tx.type === "CREDIT" ? "Credited" : "Debit"}
                </span>
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#E5E7EB", marginBottom: "2px" }}>
                    {formatDate(tx.created_at)}
                  </p>
                  <p style={{ fontSize: "11px", color: "#6B7280" }}>
                    {tx.source_reference?.replace(/_/g, " ") || tx.source}
                  </p>
                </div>
                {/* Amount */}
                <p style={{ fontSize: "13px", fontWeight: 700, color: tx.type === "CREDIT" ? "#22C55E" : "#EF4444", flexShrink: 0 }}>
                  {tx.type === "CREDIT" ? "+" : "-"}{tx.amount} 🪙
                </p>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── Fixed Bottom CTAs ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 24px", background: "linear-gradient(to top,#0D0D0D 80%,transparent)" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Change Plan */}
          <button
            onClick={() => router.push("/home/subscription")}
            style={{
              width: "100%", padding: "16px", borderRadius: "14px", border: "none",
              cursor: "pointer", fontSize: "15px", fontWeight: 700,
              background: "linear-gradient(135deg,#FF3E87,#FF6B35)", color: "#fff",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Change Plan
          </button>

          {/* Cancel Subscription */}
          <button
            disabled={cancelling}
            onClick={async () => {
              if (!confirm("Are you sure you want to cancel your subscription?")) return;
              setCancelling(true);
              // Cancel API not in tested endpoints — route to support for now
              router.push("/home/support");
            }}
            style={{
              width: "100%", padding: "12px", background: "transparent", border: "none",
              cursor: cancelling ? "not-allowed" : "pointer",
              fontSize: "14px", fontWeight: 600, color: "#EF4444",
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