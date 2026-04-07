"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

const BG_BASE    = "#FFFFFF";
const BG_SURFACE = "#F9FAFB";
const BG_BORDER  = "#E5E7EB";
const BG_MUTED   = "#F3F4F6";

const TEXT_1     = "#111827";
const TEXT_2     = "#6B7280";
const TEXT_3     = "#9CA3AF";

const GRAD_PINK  = "linear-gradient(135deg,#EC4899,#F97316)";
const GRAD_VIP   = "linear-gradient(135deg,#8B5CF6,#7C3AED)";

const GOLD       = "#F59E0B";
const GOLD_BG    = "#FFFBEB";
const GOLD_BDR   = "#FDE68A";

const GREEN      = "#22C55E";

const FEATURE_LABELS = {
  PROFILE_SETUP: "Profile Setup",
  VIEW_PUBLIC_LISTINGS: "View Public Listings",
  BROWSE_EVENTS: "Browse Events",
  SEARCH_DISCOVERY: "Search & Discovery",
  BASIC_NOTIFICATIONS: "Basic Notifications",
  AI_PHOTO_VERIFICATION: "AI Photo Verification",
  AGE_GATING: "Age Gating",
  BOOK_ACTIVITIES: "Book Activities",
  WALLET_PAYMENTS: "Wallet Payments",
  BASIC_BADGES_COINS: "Basic Badges & Coins",
  LEADERBOARD_VIEW: "Leaderboard View",
  PUBLIC_LIVE_STREAMS: "Public Live Streams",
  REFERRAL_PROGRAM: "Referral Program",
  TEAM_MANAGEMENT: "Team Management",
  ADVANCED_ANALYTICS: "Advanced Analytics",
  ALL_LEADERBOARDS: "All Leaderboards",
  CREATE_POSTS_STORIES: "Create Posts & Stories",
  PREMIUM_LIVE_STREAMS: "Premium Live Streams",
  PRIORITY_SUPPORT: "Priority Support",
  AD_FREE: "Ad-Free Experience",
  VIDEO_ANALYSIS: "Video Analysis",
  UNLIMITED_TEAMS: "Unlimited Teams",
  VIP_BADGE: "VIP Badge",
  PLAYMATE_PASSPORT: "Playmate Passport",
  HOST_LIVE_STREAMS: "Host Live Streams",
  CASHBACK_BOOKINGS: "Cashback on Bookings",
  VIP_DISCOUNTS: "VIP Discounts",
  PRIORITY_BOOKINGS: "Priority Bookings",
  EARLY_FEATURE_ACCESS: "Early Feature Access",
};

const PLAN_CONFIG = {
  free: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Free",
    buttonStyle: "dark",
    borderColor: BG_BORDER,
    glow: false,
  },
  starter_monthly: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Starter",
    buttonStyle: "dark",
    borderColor: "rgba(34,211,238,0.35)",
    glow: false,
  },
  starter_yearly: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Starter",
    buttonStyle: "dark",
    borderColor: "rgba(34,211,238,0.35)",
    glow: false,
  },
  pro_monthly: {
    showBadge: true,
    badgeText: "⭐ Popular",
    badgeBg: GRAD_PINK,
    badgeTextColor: "#fff",
    buttonText: "Go Pro",
    buttonStyle: "pink",
    borderColor: "#FF3E87",
    glow: true,
    glowColor: "rgba(255,62,135,0.22)",
  },
  pro_yearly: {
    showBadge: true,
    badgeText: "⭐ Popular",
    badgeBg: GRAD_PINK,
    badgeTextColor: "#fff",
    buttonText: "Go Pro",
    buttonStyle: "pink",
    borderColor: "#FF3E87",
    glow: true,
    glowColor: "rgba(255,62,135,0.22)",
  },
  vip_monthly: {
    showBadge: true,
    badgeText: "👑 VIP",
    badgeBg: GRAD_VIP,
    badgeTextColor: "#fff",
    buttonText: "Unlock Premium",
    buttonStyle: "purple",
    borderColor: "#9333EA",
    glow: true,
    glowColor: "rgba(147,51,234,0.22)",
  },
  vip_yearly: {
    showBadge: true,
    badgeText: "👑 VIP",
    badgeBg: GRAD_VIP,
    badgeTextColor: "#fff",
    buttonText: "Unlock Premium",
    buttonStyle: "purple",
    borderColor: "#9333EA",
    glow: true,
    glowColor: "rgba(147,51,234,0.22)",
  },
};

function PlanCard({ plan, config, isAnnual, onSelect }) {
  const isFree = plan.price === 0;

  const btnBg =
    config.buttonStyle === "pink"
      ? GRAD_PINK
      : config.buttonStyle === "purple"
      ? GRAD_VIP
      : BG_MUTED;

  const btnColor =
    config.buttonStyle === "dark" ? TEXT_2 : "#fff";

  return (
    <div
      onClick={() => onSelect(plan.id, plan.key)}
      style={{
        background: BG_SURFACE,
        border: `1.5px solid ${config.borderColor}`,
        borderRadius: "18px",
        padding: "20px 18px",
        cursor: "pointer",
        position: "relative",
        boxShadow: config.glow ? `0 0 28px ${config.glowColor}` : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        marginBottom: "14px",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        if (config.glow) e.currentTarget.style.boxShadow = `0 0 36px ${config.glowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = config.glow ? `0 0 28px ${config.glowColor}` : "none";
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: config.buttonStyle !== "dark"
          ? (config.buttonStyle === "purple" ? GRAD_VIP : GRAD_PINK)
          : `linear-gradient(90deg,transparent,${BG_BORDER},transparent)`,
        opacity: 0.8,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        {config.showBadge ? (
          <span style={{
            background: config.badgeBg,
            color: config.badgeTextColor,
            fontSize: "11px", fontWeight: 700,
            padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.3px",
          }}>
            {config.badgeText}
          </span>
        ) : (
          <span style={{ color: TEXT_2, fontSize: "13px", fontWeight: 600 }}>
            {isFree ? "Free" : config.label}
          </span>
        )}

        <div style={{
          width: "20px", height: "20px", borderRadius: "50%",
          border: `2px solid ${config.borderColor}`,
          background: "transparent", flexShrink: 0,
        }} />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "30px", fontWeight: 800, color: TEXT_1, letterSpacing: "-0.5px" }}>
          ₹{plan.price}
        </span>
        <span style={{ fontSize: "13px", color: TEXT_3, marginLeft: "5px" }}>
          /{isAnnual ? "yr" : "month"}
        </span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
        {plan.features.slice(0, 6).map((f, i) => (
          <li key={i} style={{
            display: "flex", alignItems: "center", gap: "9px",
            fontSize: "12px", color: TEXT_2, marginBottom: "7px",
          }}>
            <Check size={11} color={GREEN} strokeWidth={3} />
            {FEATURE_LABELS[f] || f.replace(/_/g, " ")}
          </li>
        ))}
        {plan.features.length > 6 && (
          <li style={{ fontSize: "11px", color: TEXT_3, marginTop: "4px" }}>
            +{plan.features.length - 6} more features
          </li>
        )}
      </ul>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <span style={{
          background: GOLD_BG, border: `1px solid ${GOLD_BDR}`,
          borderRadius: "20px", padding: "4px 12px",
          fontSize: "11px", color: GOLD,
          display: "flex", alignItems: "center", gap: "4px", fontWeight: 600,
        }}>
          🪙 {plan.coins} coins/mo
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(plan.id, plan.key); }}
        style={{
          width: "100%", padding: "13px", borderRadius: "12px",
          border: "none", cursor: "pointer",
          fontSize: "14px", fontWeight: 700, letterSpacing: "0.3px",
          background: btnBg, color: btnColor,
          transition: "opacity 0.2s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {config.buttonText}
      </button>
    </div>
  );
}

export default function UpgradePage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const [plansRes, configRes] = await Promise.all([
        fetch(`${API_BASE}/subscriptions/plans?duration=ALL`),
        fetch(`${API_BASE}/subscriptions/page-config`),
      ]);
      const data = await plansRes.json();
      const configData = await configRes.json();
      if (configData?.status === "success") setPageConfig(configData.data.config);
      const formatted = data?.data?.plans.map((p) => ({
        id: p._id,
        key: p.key,
        name: p.name,
        price: p.price?.amount,
        coins: p.gold_coins?.amount,
        features: p.features || [],
        popular: p.is_popular,
        badge: p.badge_text,
        duration: p.duration?.value,
        tier: p.plan_tier,
      }));
      formatted.sort((a, b) => a.tier - b.tier);
      setPlans(formatted);
    } catch (error) {
      console.error("Plan fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId, planKey) => {
    router.push(`/home/subscription/pro-plan?plan=${planId}&key=${planKey}`);
  };

  const filteredPlans = plans.filter((plan) => {
    if (plan.key === "free") return !isAnnual;
    return isAnnual ? plan.duration === 365 : plan.duration === 30;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: BG_BASE, color: TEXT_1,
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "38px", height: "38px",
            border: `3px solid ${BG_BORDER}`, borderTop: "3px solid #FF3E87",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
            margin: "0 auto 14px",
          }} />
          <p style={{ color: TEXT_2, fontSize: "14px" }}>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG_BASE,
      color: TEXT_1,
      fontFamily: "'DM Sans',sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box}`}</style>

      <div style={{
        position: "fixed", top: -120, left: "50%", transform: "translateX(-50%)",
        width: "560px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(255,62,135,0.09) 0%,transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        <div style={{ paddingTop: "48px", paddingBottom: "24px", textAlign: "center", padding: "48px 20px 24px" }}>

          {pageConfig?.hero_image_url ? (
            <img
              src={pageConfig.hero_image_url}
              alt="hero"
              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline-flex"; }}
              style={{ width: "72px", height: "72px", borderRadius: "20px", objectFit: "cover", marginBottom: "24px", display: "block", margin: "0 auto 24px" }}
            />
          ) : null}

          <div style={{
            display: pageConfig?.hero_image_url ? "none" : "inline-flex",
            alignItems: "center", justifyContent: "center",
            width: "72px", height: "72px", borderRadius: "20px",
            background: GRAD_PINK,
            marginBottom: "24px", fontSize: "32px",
            boxShadow: "0 8px 32px rgba(255,62,135,0.28)",
          }}>
            🏆
          </div>

          <h1 style={{
            fontSize: "clamp(26px,5vw,34px)", fontWeight: 800,
            lineHeight: 1.2, marginBottom: "8px", letterSpacing: "-0.03em",
            color: TEXT_1,
          }}>
            {pageConfig?.hero_heading ? (
              pageConfig.hero_heading
            ) : (
              <>
                Upgrade your<br />
                <span style={{ background: GRAD_PINK, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Playymate Experience
                </span>
              </>
            )}
          </h1>

          <p style={{ color: "#60A5FA", fontSize: "14px", fontWeight: 500, marginTop: "12px" }}>
            {pageConfig?.hero_subtext || "Enjoy 30 days of free access"}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px", padding: "0 20px" }}>
          <div style={{
            background: BG_SURFACE,
            border: `1px solid ${BG_BORDER}`,
            borderRadius: "100px", padding: "5px",
            display: "flex", gap: "4px",
          }}>
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: "8px 24px", borderRadius: "100px", border: "none",
                cursor: "pointer", fontSize: "14px", fontWeight: 600,
                fontFamily: "inherit",
                background: !isAnnual ? GRAD_PINK : "transparent",
                color: !isAnnual ? "#fff" : TEXT_2,
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: "8px 24px", borderRadius: "100px", border: "none",
                cursor: "pointer", fontSize: "14px", fontWeight: 600,
                fontFamily: "inherit",
                background: isAnnual ? GRAD_PINK : "transparent",
                color: isAnnual ? "#fff" : TEXT_2,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              Yearly
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 20px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {filteredPlans.map((plan) => {
            const config = PLAN_CONFIG[plan.key] || {
              showBadge: false, badgeText: "", badgeBg: "", badgeTextColor: "",
              buttonText: "Choose Plan", buttonStyle: "dark",
              borderColor: BG_BORDER, glow: false,
            };
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                config={config}
                isAnnual={isAnnual}
                onSelect={handlePlanSelect}
              />
            );
          })}

          <button
            onClick={() => router.push("/home/subscription/compare-plans")}
            style={{
              width: "100%", padding: "14px", marginTop: "4px",
              background: "transparent", border: `1px solid ${BG_BORDER}`,
              borderRadius: "14px", color: TEXT_2,
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              gridColumn: "1 / -1",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF3E87"; e.currentTarget.style.color = TEXT_1; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BG_BORDER; e.currentTarget.style.color = TEXT_2; }}
          >
            Compare all plans →
          </button>
        </div>
      </div>
    </div>
  );
}