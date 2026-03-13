"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Star,
  Tv2,
  Bell,
  Camera,
  Wallet,
  Trophy,
  Radio,
  GitBranch,
  BarChart2,
  FileText,
  Zap,
  Crown,
  Globe,
  Video,
  Ticket,
  Percent,
  Clock,
  Unlock,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Human-readable labels + icons per feature key
const FEATURE_META = {
  PROFILE_SETUP:         { label: "Profile Setup",           icon: <Users size={16} /> },
  VIEW_PUBLIC_LISTINGS:  { label: "View Public Listings",    icon: <Globe size={16} /> },
  BROWSE_EVENTS:         { label: "Browse Events",           icon: <Calendar size={16} /> },
  SEARCH_DISCOVERY:      { label: "Search & Discovery",      icon: <Sparkles size={16} /> },
  BASIC_NOTIFICATIONS:   { label: "Basic Notifications",     icon: <Bell size={16} /> },
  AI_PHOTO_VERIFICATION: { label: "AI Photo Verification",   icon: <Camera size={16} /> },
  AGE_GATING:            { label: "Age Gating",              icon: <ShieldCheck size={16} /> },
  BOOK_ACTIVITIES:       { label: "Book Activities",         icon: <BookOpen size={16} /> },
  WALLET_PAYMENTS:       { label: "Wallet Payments",         icon: <Wallet size={16} /> },
  BASIC_BADGES_COINS:    { label: "Basic Badges & Coins",    icon: <Star size={16} /> },
  LEADERBOARD_VIEW:      { label: "Leaderboard View",        icon: <Trophy size={16} /> },
  PUBLIC_LIVE_STREAMS:   { label: "Public Live Streams",     icon: <Tv2 size={16} /> },
  REFERRAL_PROGRAM:      { label: "Referral Program",        icon: <GitBranch size={16} /> },
  TEAM_MANAGEMENT:       { label: "Team Management",         icon: <Users size={16} /> },
  ADVANCED_ANALYTICS:    { label: "Advanced Analytics",      icon: <BarChart2 size={16} /> },
  ALL_LEADERBOARDS:      { label: "All Leaderboards",        icon: <Trophy size={16} /> },
  CREATE_POSTS_STORIES:  { label: "Create Posts & Stories",  icon: <FileText size={16} /> },
  PREMIUM_LIVE_STREAMS:  { label: "Premium Live Streams",    icon: <Radio size={16} /> },
  PRIORITY_SUPPORT:      { label: "Priority Support",        icon: <ShieldCheck size={16} /> },
  AD_FREE:               { label: "Ad-Free Experience",      icon: <Zap size={16} /> },
  VIDEO_ANALYSIS:        { label: "Video Analysis",          icon: <Video size={16} /> },
  UNLIMITED_TEAMS:       { label: "Unlimited Teams",         icon: <Users size={16} /> },
  VIP_BADGE:             { label: "VIP Badge",               icon: <Crown size={16} /> },
  PLAYMATE_PASSPORT:     { label: "Playmate Passport",       icon: <Ticket size={16} /> },
  HOST_LIVE_STREAMS:     { label: "Host Live Streams",       icon: <Tv2 size={16} /> },
  CASHBACK_BOOKINGS:     { label: "Cashback on Bookings",    icon: <Percent size={16} /> },
  VIP_DISCOUNTS:         { label: "VIP Discounts",           icon: <Percent size={16} /> },
  PRIORITY_BOOKINGS:     { label: "Priority Bookings",       icon: <Clock size={16} /> },
  EARLY_FEATURE_ACCESS:  { label: "Early Feature Access",    icon: <Unlock size={16} /> },
};

// Which features belong to "Passport Benefits" section
const PASSPORT_FEATURES = new Set([
  "PLAYMATE_PASSPORT",
]);

// Which features belong to "Limits" section (shown differently)
const LIMIT_FEATURES = new Set([
  "UNLIMITED_TEAMS",
  "TEAM_MANAGEMENT",
]);

function ValuePill({ value }) {
  const isUnlimited = value === "Unlimited" || value === null;
  return (
    <span
      style={{
        background: isUnlimited
          ? "linear-gradient(135deg, #FF3E87, #FF6B35)"
          : "#1E1E1E",
        color: isUnlimited ? "#fff" : "#9CA3AF",
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
      }}
    >
      {isUnlimited ? "Unlimited" : value}
    </span>
  );
}

function FeatureRow({ featureKey }) {
  const meta = FEATURE_META[featureKey] || {
    label: featureKey.replace(/_/g, " "),
    icon: <Zap size={16} />,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "#111111",
        borderRadius: "12px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#FF3E87" }}>{meta.icon}</span>
        <span style={{ fontSize: "14px", color: "#E5E7EB", fontWeight: 500 }}>
          {meta.label}
        </span>
      </div>
      <ValuePill value={null} />
    </div>
  );
}

function LimitRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "#111111",
        borderRadius: "12px",
        marginBottom: "8px",
      }}
    >
      <span style={{ fontSize: "14px", color: "#E5E7EB", fontWeight: 500 }}>
        {label}
      </span>
      <ValuePill value={value === null ? "Unlimited" : String(value)} />
    </div>
  );
}

function SectionLabel({ title }) {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color: "#6B7280",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        marginBottom: "12px",
        marginTop: "24px",
      }}
    >
      {title}
    </p>
  );
}

function ProPlanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId = searchParams.get("plan");
  const planKey = searchParams.get("key");

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) {
      setError("No plan selected.");
      setLoading(false);
      return;
    }
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/plans?duration=ALL`);
      const data = await res.json();
      const all = data?.data?.plans || [];
      const found = all.find((p) => p._id === planId);
      if (!found) throw new Error("Plan not found");
      setPlan(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              width: "36px",
              height: "36px",
              border: "3px solid #222",
              borderTop: "3px solid #FF3E87",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Loading plan...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0D0D0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <p>{error || "Plan not found"}</p>
      </div>
    );
  }

  const isAnnual = plan.duration?.value === 365;
  const features = plan.features || [];
  const limits = plan.limits || {};

  // Separate features into groups
  const passportFeatures = features.filter((f) => PASSPORT_FEATURES.has(f));
  const mainFeatures = features.filter((f) => !PASSPORT_FEATURES.has(f));

  // Plan styling based on key
  const isVIP = plan.key?.startsWith("vip");
  const isPro = plan.key?.startsWith("pro");
  const accentColor = isVIP ? "#9333EA" : isPro ? "#FF3E87" : "#6B7280";
  const buttonGradient = isVIP
    ? "linear-gradient(135deg, #9333EA, #6B21A8)"
    : isPro
    ? "linear-gradient(135deg, #FF3E87, #FF6B35)"
    : "#1E1E1E";
  const buttonText = isVIP
    ? "Unlock Premium"
    : isPro
    ? "Continue to Checkout"
    : plan.price === 0
    ? "Get Started Free"
    : "Continue to Checkout";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        color: "#FFFFFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: "120px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid #1A1A1A",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            padding: "4px 0",
          }}
        >
          <ArrowLeft size={18} />
          {plan.name} Plan
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 0" }}>

        {/* Price Hero Card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, #111111)`,
            border: `1.5px solid ${accentColor}55`,
            borderRadius: "20px",
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: "8px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "200px",
              height: "200px",
              background: `${accentColor}20`,
              borderRadius: "50%",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <span
              style={{
                fontSize: "42px",
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              ₹ {plan.price.amount}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#6B7280",
                marginLeft: "6px",
              }}
            >
              per {isAnnual ? "year" : "month"}
            </span>

            <div
              style={{
                marginTop: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#1C1A00",
                border: "1px solid #3D3A00",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "14px",
                color: "#FBBF24",
                fontWeight: 600,
              }}
            >
              🪙 {plan.gold_coins?.amount} coins/{isAnnual ? "year" : "month"}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <SectionLabel title="Features" />
        {mainFeatures.map((f) => (
          <FeatureRow key={f} featureKey={f} />
        ))}

        {/* Limits Section */}
        <SectionLabel title="Limits" />
        <LimitRow label="Teams" value={limits.team_size_limit} />
        <LimitRow label="Events" value={limits.live_streams_per_month} />
        <LimitRow label="Participants" value={limits.bookings_per_month} />

        {/* Passport Benefits */}
        {passportFeatures.length > 0 && (
          <>
            <SectionLabel title="Passport Benefits" />
            {passportFeatures.map((f) => (
              <FeatureRow key={f} featureKey={f} />
            ))}
            {/* PDF Export — always shown if PLAYMATE_PASSPORT included */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "#111111",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#FF3E87" }}><FileText size={16} /></span>
                <span style={{ fontSize: "14px", color: "#E5E7EB", fontWeight: 500 }}>
                  PDF Export
                </span>
              </div>
              <ValuePill value={null} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "#111111",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#FF3E87" }}><FileText size={16} /></span>
                <span style={{ fontSize: "14px", color: "#E5E7EB", fontWeight: 500 }}>
                  Physical Print (1/yr)
                </span>
              </div>
              <ValuePill value={null} />
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          background: "linear-gradient(to top, #0D0D0D 70%, transparent)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() =>
            router.push(
              `/home/subscription/checkout?plan=${planId}&key=${plan.key}`
            )
          }
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "16px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            background: plan.price === 0 ? "#1E1E1E" : buttonGradient,
            color: plan.price === 0 ? "#9CA3AF" : "#fff",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            height: "52px",
            background: "#111",
            borderRadius: "12px",
            marginBottom: "8px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default function ProPlanPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProPlanPageContent />
    </Suspense>
  );
}