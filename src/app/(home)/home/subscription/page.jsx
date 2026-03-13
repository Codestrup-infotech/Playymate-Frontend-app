"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Human-readable feature labels
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

// Per-plan display config
// Only visual/styling config per plan key — NO hardcoded features
const PLAN_CONFIG = {
  free: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Free",
    buttonStyle: "dark",
    borderColor: "#1E1E1E",
    glow: false,
  },
  starter_monthly: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Starter",
    buttonStyle: "dark",
    borderColor: "#1E1E1E",
    glow: false,
  },
  starter_yearly: {
    showBadge: false,
    badgeText: "",
    badgeBg: "",
    badgeTextColor: "",
    buttonText: "Choose Starter",
    buttonStyle: "dark",
    borderColor: "#1E1E1E",
    glow: false,
  },
  pro_monthly: {
    showBadge: true,
    badgeText: "⭐ Popular",
    badgeBg: "linear-gradient(135deg, #FF3E87, #FF6B35)",
    badgeTextColor: "#fff",
    buttonText: "Go Pro",
    buttonStyle: "pink",
    borderColor: "#FF3E87",
    glow: true,
    glowColor: "rgba(255,62,135,0.25)",
  },
  pro_yearly: {
    showBadge: true,
    badgeText: "⭐ Popular",
    badgeBg: "linear-gradient(135deg, #FF3E87, #FF6B35)",
    badgeTextColor: "#fff",
    buttonText: "Go Pro",
    buttonStyle: "pink",
    borderColor: "#FF3E87",
    glow: true,
    glowColor: "rgba(255,62,135,0.25)",
  },
  vip_monthly: {
    showBadge: true,
    badgeText: "👑 VIP",
    badgeBg: "linear-gradient(135deg, #9333EA, #6B21A8)",
    badgeTextColor: "#fff",
    buttonText: "Unlock Premium",
    buttonStyle: "purple",
    borderColor: "#7C3AED",
    glow: true,
    glowColor: "rgba(124,58,237,0.25)",
  },
  vip_yearly: {
    showBadge: true,
    badgeText: "👑 VIP",
    badgeBg: "linear-gradient(135deg, #9333EA, #6B21A8)",
    badgeTextColor: "#fff",
    buttonText: "Unlock Premium",
    buttonStyle: "purple",
    borderColor: "#7C3AED",
    glow: true,
    glowColor: "rgba(124,58,237,0.25)",
  },
};

function PlanCard({ plan, config, isAnnual, onSelect }) {
  const isFree = plan.price === 0;

  return (
    <div
      onClick={() => onSelect(plan.id, plan.key)}
      style={{
        background: "#111111",
        border: `1px solid ${config.borderColor}`,
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        position: "relative",
        boxShadow: config.glow
          ? `0 0 24px ${config.glowColor}`
          : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        marginBottom: "16px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row: badge label + radio */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        {config.showBadge ? (
          <span
            style={{
              background: config.badgeBg,
              color: config.badgeTextColor,
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "20px",
              letterSpacing: "0.3px",
            }}
          >
            {config.badgeText}
          </span>
        ) : (
          <span
            style={{
              color: "#9CA3AF",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {isFree ? "Free" : config.label}
          </span>
        )}

        {/* Radio circle */}
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `2px solid ${config.borderColor}`,
            background: "transparent",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Price */}
      <div style={{ marginBottom: "14px" }}>
        <span style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF" }}>
          ₹{plan.price}
        </span>
        <span style={{ fontSize: "13px", color: "#6B7280", marginLeft: "4px" }}>
          /{isAnnual ? "yr" : "month"}
        </span>
      </div>

      {/* Features — from API, translated via FEATURE_LABELS, show first 6 */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px 0" }}>
        {plan.features.slice(0, 6).map((f, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#D1D5DB",
              marginBottom: "6px",
            }}
          >
            <Check size={12} color="#22C55E" strokeWidth={3} />
            {FEATURE_LABELS[f] || f.replace(/_/g, " ")}
          </li>
        ))}
        {plan.features.length > 6 && (
          <li style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            +{plan.features.length - 6} more features
          </li>
        )}
      </ul>

      {/* Coins pill */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <span
          style={{
            background: "#1C1A00",
            border: "1px solid #3D3A00",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "11px",
            color: "#FBBF24",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 600,
          }}
        >
          🪙 {plan.coins} coins/mo
        </span>
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(plan.id, plan.key); }}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          background:
            config.buttonStyle === "pink"
              ? "linear-gradient(135deg, #FF3E87, #FF6B35)"
              : config.buttonStyle === "purple"
              ? "linear-gradient(135deg, #9333EA, #6B21A8)"
              : "#1E1E1E",
          color:
            config.buttonStyle === "dark" ? "#9CA3AF" : "#FFFFFF",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
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
      // Sort: Free first, then by tier ascending
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

  // Filter: Free plan always shown; monthly/yearly filtered by duration
  const filteredPlans = plans.filter((plan) => {
    if (plan.price === 0) return true; // Free always shown
    return isAnnual ? plan.duration === 365 : plan.duration === 30;
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D0D",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #333",
              borderTop: "3px solid #FF3E87",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: "14px" }}>Loading plans...</p>
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
        color: "#FFFFFF",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          paddingTop: "48px",
          paddingBottom: "24px",
          textAlign: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {/* Hero image from API — fallback to icon */}
        {pageConfig?.hero_image_url ? (
          <img
            src={pageConfig.hero_image_url}
            alt="hero"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline-flex"; }}
            style={{ width: "72px", height: "72px", borderRadius: "20px", objectFit: "cover", marginBottom: "24px", display: "block", margin: "0 auto 24px" }}
          />
        ) : null}
        {/* Fallback icon — always rendered, hidden if image loads */}
        <div
          style={{
            display: pageConfig?.hero_image_url ? "none" : "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            marginBottom: "24px",
            fontSize: "32px",
          }}
        >
          🛒
        </div>

        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          {pageConfig?.hero_heading ? (
            pageConfig.hero_heading
          ) : (
            <>
              Upgrade your
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FF3E87, #FF6B35)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Playymate Experience
              </span>
            </>
          )}
        </h1>

        <p
          style={{
            color: "#60A5FA",
            fontSize: "14px",
            fontWeight: 500,
            marginTop: "12px",
          }}
        >
          {pageConfig?.hero_subtext || "Enjoy 30 days of free access"}
        </p>
      </div>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "32px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#1A1A1A",
            borderRadius: "100px",
            padding: "5px",
            display: "flex",
            gap: "4px",
          }}
        >
          <button
            onClick={() => setIsAnnual(false)}
            style={{
              padding: "8px 24px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              background: !isAnnual
                ? "linear-gradient(135deg, #FF3E87, #FF6B35)"
                : "transparent",
              color: !isAnnual ? "#fff" : "#6B7280",
              transition: "all 0.2s",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            style={{
              padding: "8px 24px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              background: isAnnual
                ? "linear-gradient(135deg, #FF3E87, #FF6B35)"
                : "transparent",
              color: isAnnual ? "#fff" : "#6B7280",
              transition: "all 0.2s",
            }}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plan Cards - vertical list matching mobile Figma */}
      <div
        style={{
          maxWidth: "420px",
          margin: "0 auto",
          padding: "0 20px 40px",
        }}
      >
        {filteredPlans.map((plan) => {
          const config = PLAN_CONFIG[plan.key] || {
            showBadge: false,
            badgeText: "",
            badgeBg: "",
            badgeTextColor: "",
            buttonText: "Choose Plan",
            buttonStyle: "dark",
            borderColor: "#1E1E1E",
            glow: false,
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
      </div>
    </div>
  );
}