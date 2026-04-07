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

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const FEATURE_META = {
  PROFILE_SETUP: { label: "Profile Setup", icon: <Users size={16} /> },
  VIEW_PUBLIC_LISTINGS: { label: "View Public Listings", icon: <Globe size={16} /> },
  BROWSE_EVENTS: { label: "Browse Events", icon: <Calendar size={16} /> },
  SEARCH_DISCOVERY: { label: "Search & Discovery", icon: <Sparkles size={16} /> },
  BASIC_NOTIFICATIONS: { label: "Basic Notifications", icon: <Bell size={16} /> },
  AI_PHOTO_VERIFICATION: { label: "AI Photo Verification", icon: <Camera size={16} /> },
  AGE_GATING: { label: "Age Gating", icon: <ShieldCheck size={16} /> },
  BOOK_ACTIVITIES: { label: "Book Activities", icon: <BookOpen size={16} /> },
  WALLET_PAYMENTS: { label: "Wallet Payments", icon: <Wallet size={16} /> },
  BASIC_BADGES_COINS: { label: "Basic Badges & Coins", icon: <Star size={16} /> },
  LEADERBOARD_VIEW: { label: "Leaderboard View", icon: <Trophy size={16} /> },
  PUBLIC_LIVE_STREAMS: { label: "Public Live Streams", icon: <Tv2 size={16} /> },
  REFERRAL_PROGRAM: { label: "Referral Program", icon: <GitBranch size={16} /> },
  TEAM_MANAGEMENT: { label: "Team Management", icon: <Users size={16} /> },
  ADVANCED_ANALYTICS: { label: "Advanced Analytics", icon: <BarChart2 size={16} /> },
  ALL_LEADERBOARDS: { label: "All Leaderboards", icon: <Trophy size={16} /> },
  CREATE_POSTS_STORIES: { label: "Create Posts & Stories", icon: <FileText size={16} /> },
  PREMIUM_LIVE_STREAMS: { label: "Premium Live Streams", icon: <Radio size={16} /> },
  PRIORITY_SUPPORT: { label: "Priority Support", icon: <ShieldCheck size={16} /> },
  AD_FREE: { label: "Ad-Free Experience", icon: <Zap size={16} /> },
  VIDEO_ANALYSIS: { label: "Video Analysis", icon: <Video size={16} /> },
  UNLIMITED_TEAMS: { label: "Unlimited Teams", icon: <Users size={16} /> },
  VIP_BADGE: { label: "VIP Badge", icon: <Crown size={16} /> },
  PLAYMATE_PASSPORT: { label: "Playmate Passport", icon: <Ticket size={16} /> },
  HOST_LIVE_STREAMS: { label: "Host Live Streams", icon: <Tv2 size={16} /> },
  CASHBACK_BOOKINGS: { label: "Cashback on Bookings", icon: <Percent size={16} /> },
  VIP_DISCOUNTS: { label: "VIP Discounts", icon: <Percent size={16} /> },
  PRIORITY_BOOKINGS: { label: "Priority Bookings", icon: <Clock size={16} /> },
  EARLY_FEATURE_ACCESS: { label: "Early Feature Access", icon: <Unlock size={16} /> },
};

const PASSPORT_FEATURES = new Set(["PLAYMATE_PASSPORT"]);

function ValuePill({ value, accentColor }) {
  const isUnlimited = value === "Unlimited" || value === null;

  return (
    <span
      style={{
        background: isUnlimited
          ? `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)`
          : "#F3F4F6",
        color: isUnlimited ? "#fff" : "#6B7280",
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "20px",
      }}
    >
      {isUnlimited ? "Unlimited" : value}
    </span>
  );
}

function FeatureRow({ featureKey, accentColor }) {
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
        background: "#F9FAFB",
        border: `1px solid ${accentColor}30`,
        borderRadius: "12px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: accentColor }}>{meta.icon}</span>
        <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
          {meta.label}
        </span>
      </div>

      <ValuePill value={null} accentColor={accentColor} />
    </div>
  );
}

function LimitRow({ label, value, accentColor }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "#F9FAFB",
        border: `1px solid ${accentColor}30`,
        borderRadius: "12px",
        marginBottom: "8px",
      }}
    >
      <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
        {label}
      </span>

      <ValuePill
        value={value === null ? "Unlimited" : String(value)}
        accentColor={accentColor}
      />
    </div>
  );
}

function SectionLabel({ title, accentColor }) {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color: accentColor,
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

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    const res = await fetch(`${API_BASE}/subscriptions/plans?duration=ALL`);
    const data = await res.json();
    const all = data?.data?.plans || [];
    const found = all.find((p) => p._id === planId);
    setPlan(found);
    setLoading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading plan...
      </div>
    );
  }

  const isAnnual = plan.duration?.value === 365;
  const features = plan.features || [];
  const limits = plan.limits || {};

  const passportFeatures = features.filter((f) => PASSPORT_FEATURES.has(f));
  const mainFeatures = features.filter((f) => !PASSPORT_FEATURES.has(f));

  const isVIP = plan.key?.startsWith("vip");
  const isPro = plan.key?.startsWith("pro");
  const isStarter = plan.key?.startsWith("starter");

  const accentColor =
    isVIP
      ? "#8B5CF6"
      : isPro
      ? "#EC4899"
      : isStarter
      ? "#3B82F6"
      : "#6B7280";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: "#111827",
        paddingBottom: "120px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#6B7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ArrowLeft size={18} />
          {plan.name} Plan
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${accentColor}22,#F9FAFB)`,
            border: `1px solid ${accentColor}40`,
            borderRadius: "20px",
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "42px", fontWeight: 800 }}>
            ₹ {plan.price.amount}
          </span>

          <span style={{ fontSize: "14px", color: "#6B7280", marginLeft: "6px" }}>
            per {isAnnual ? "year" : "month"}
          </span>

          <div
            style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "14px",
              color: "#D97706",
              fontWeight: 600,
            }}
          >
            🪙 {plan.gold_coins?.amount} coins/{isAnnual ? "year" : "month"}
          </div>
        </div>

        <SectionLabel title="Features" accentColor={accentColor} />

        {mainFeatures.map((f) => (
          <FeatureRow key={f} featureKey={f} accentColor={accentColor} />
        ))}

        <SectionLabel title="Limits" accentColor={accentColor} />

        <LimitRow
          label="Teams"
          value={limits.team_size_limit}
          accentColor={accentColor}
        />
        <LimitRow
          label="Events"
          value={limits.live_streams_per_month}
          accentColor={accentColor}
        />
        <LimitRow
          label="Participants"
          value={limits.bookings_per_month}
          accentColor={accentColor}
        />

        {passportFeatures.length > 0 && (
          <>
            <SectionLabel title="Passport Benefits" accentColor={accentColor} />
            {passportFeatures.map((f) => (
              <FeatureRow key={f} featureKey={f} accentColor={accentColor} />
            ))}
          </>
        )}
      </div>

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
            router.push(`/home/subscription/checkout?plan=${planId}&key=${plan.key}`)
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
          Continue to Checkout
        </button>
      </div>
    </div>
  );
}

export default function ProPlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProPlanPageContent />
    </Suspense>
  );
}