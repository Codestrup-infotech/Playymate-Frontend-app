"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Share2, MessageCircle, MapPin, Pencil,
  ShieldCheck, Mail, Phone, GraduationCap, Briefcase,
  Calendar, User, CheckCircle, XCircle,
} from "lucide-react";
import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function flattenInterests(interests) {
  if (!interests) return [];
  if (Array.isArray(interests)) return interests;
  return [
    ...(interests.sports || []),
    ...(interests.hobbies || []),
    ...(interests.activities || []),
    ...(interests.nostalgia || []),
    ...(interests.additional || []),
  ];
}

function capitalize(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── sub-components ─────────────────────────────────────────────────────────

function VerificationBadge({ status }) {
  if (status === true)
    return <CheckCircle size={14} className="text-green-400 inline ml-1" />;
  return <XCircle size={14} className="text-gray-500 inline ml-1" />;
}

function StatBox({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-white">{value ?? 0}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function InterestPill({ label }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-700/40">
      {capitalize(label)}
    </span>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("Posts");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMe();
        const data = res?.data?.data || res?.data;
        if (!data) throw new Error("No profile data received from API");
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── states ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <p className="text-red-400 text-sm">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── destructure API fields ────────────────────────────────────────────────
  const {
    full_name,
    email,
    phone,
    bio,
    profile_image_url,
    profile_photos = [],
    profile_location = {},
    interests = {},
    gender,
    dob,
    role_type,
    activity_intent,
    profile_details = {},
    verification = {},
    stats = {},
    is_own_profile,
    account_status,
    verification_badge,
  } = profile;

  const allInterests = flattenInterests(interests);
  const age = formatAge(dob);
  const location =
    profile_location?.display_text ||
    profile_location?.city ||
    profile_location?.state ||
    null;

  const roleSpecific = profile_details?.role_specific || {};
  const commonFields = profile_details?.common_fields || {};

  // categorised interests for display
  const interestCategories = [
    { label: "Sports", items: interests?.sports || [] },
    { label: "Hobbies", items: interests?.hobbies || [] },
    { label: "Activities", items: interests?.activities || [] },
    { label: "Nostalgia", items: interests?.nostalgia || [] },
  ].filter((c) => c.items.length > 0);

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-4 pb-10">

      {/* ── HEADER CARD ─────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-6 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        {/* top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {full_name || "My Profile"}
            </h1>
            {verification_badge === "verified" && (
              <ShieldCheck size={18} className="text-purple-400" />
            )}
          </div>

          {is_own_profile && (
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/home/profile/edit")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isDark
                    ? "bg-[#1e1e3a] hover:bg-[#262650] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
              >
                <Pencil size={15} /> Edit Profile
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isDark
                    ? "bg-[#1e1e3a] hover:bg-[#262650] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
              >
                <Share2 size={15} /> Share
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${isDark
                    ? "bg-[#1e1e3a] hover:bg-[#262650] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
              >
                <Settings size={18} />
              </button>
            </div>
          )}
        </div>

        {/* profile body */}
        <div className="flex gap-6 items-start flex-wrap md:flex-nowrap">

          {/* avatar */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
              <img
                src={profile_image_url || "/loginAvatars/profile.png"}
                alt={full_name}
                className={`w-full h-full rounded-full object-cover border-4 ${isDark ? "border-[#12122a]" : "border-white"
                  }`}
              />
            </div>

            {/* account status pill */}
            <div className="mt-2 flex justify-center">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${account_status === "active"
                    ? "bg-green-900/40 text-green-400 border border-green-700/40"
                    : "bg-red-900/40 text-red-400 border border-red-700/40"
                  }`}
              >
                {account_status || "active"}
              </span>
            </div>
          </div>

          {/* details */}
          <div className="flex-1 min-w-0">

            {/* name + meta */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {full_name}
              </h2>
              {gender && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/40 text-purple-300 border border-purple-700/30 capitalize">
                  {gender}
                </span>
              )}
              {age && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/40 text-gray-400 border border-gray-600/30">
                  {age} yrs
                </span>
              )}
              {role_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-800/30 text-orange-300 border border-orange-700/30 capitalize">
                  {capitalize(role_type)}
                </span>
              )}
            </div>

            {/* contact row */}
            <div className="flex flex-wrap gap-4 mt-2 mb-4">
              {email && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Mail size={12} />
                  {email}
                  <VerificationBadge status={verification?.email?.status} />
                </span>
              )}
              {phone && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone size={12} />
                  {phone}
                  <VerificationBadge status={verification?.phone?.status} />
                </span>
              )}
              {location && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {location}
                </span>
              )}
            </div>

            {/* stats */}
            <div
              className={`flex gap-6 py-3 px-5 rounded-xl mb-4 w-fit ${isDark ? "bg-[#1a1a38]" : "bg-gray-100"
                }`}
            >
              <StatBox value={stats.posts_count} label="Posts" />
              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
              <StatBox value={stats.followers_count} label="Followers" />
              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
              <StatBox value={stats.following_count} label="Following" />
              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
              <StatBox value={stats.reels_count} label="Reels" />
              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
              <StatBox value={stats.events_count} label="Events" />
            </div>

            {/* bio */}
            {bio ? (
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {bio}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No bio yet · Add one in Edit Profile</p>
            )}

            {/* top interests pills */}
            {allInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {allInterests.slice(0, 8).map((tag) => (
                  <InterestPill key={tag} label={tag} />
                ))}
                {allInterests.length > 8 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{allInterests.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── INFO CARDS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Activity Intent + Role Details */}
        <div
          className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
            <Briefcase size={16} className="text-purple-400" /> Activity & Role
          </h3>

          {activity_intent?.type && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Activity Intent</p>
              <span className="text-sm font-medium text-orange-300 capitalize">
                {capitalize(activity_intent.type)}
              </span>
              {activity_intent.details && (
                <p className="text-xs text-gray-400 mt-0.5">{activity_intent.details}</p>
              )}
            </div>
          )}

          {/* role specific fields */}
          {Object.keys(roleSpecific).length > 0 && (
            <div className="space-y-2 mt-3">
              {roleSpecific.college_name && (
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">College</p>
                    <p className="text-sm text-gray-200">{roleSpecific.college_name}</p>
                  </div>
                </div>
              )}
              {roleSpecific.course && (
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">Course</p>
                    <p className="text-sm text-gray-200">{roleSpecific.course}</p>
                  </div>
                </div>
              )}
              {roleSpecific.year_of_study && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">Year of Study</p>
                    <p className="text-sm text-gray-200">{capitalize(roleSpecific.year_of_study)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* common fields */}
          {(commonFields.current_city || commonFields.hometown || commonFields.qualification) && (
            <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
              {commonFields.current_city && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">Current City</p>
                    <p className="text-sm text-gray-200 capitalize">{commonFields.current_city}</p>
                  </div>
                </div>
              )}
              {commonFields.hometown && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">Hometown</p>
                    <p className="text-sm text-gray-200 capitalize">{commonFields.hometown}</p>
                  </div>
                </div>
              )}
              {commonFields.qualification && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">Qualification</p>
                    <p className="text-sm text-gray-200">{commonFields.qualification}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interests by Category */}
        <div
          className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
            🎯 Interests
          </h3>

          {interestCategories.length > 0 ? (
            <div className="space-y-4">
              {interestCategories.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <InterestPill key={item} label={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No interests added yet</p>
          )}
        </div>
      </div>

      {/* ── VERIFICATION CARD ───────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          <ShieldCheck size={16} className="text-green-400" /> Verification Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Email", status: verification?.email?.status, date: verification?.email?.verified_at },
            { label: "Phone", status: verification?.phone?.status, date: verification?.phone?.verified_at },
            { label: "Aadhaar", status: verification?.aadhaar?.status, date: verification?.aadhaar?.verified_at },
            { label: "Face", status: verification?.face?.status, date: verification?.face?.verified_at },
          ].map((v) => (
            <div
              key={v.label}
              className={`rounded-xl p-3 flex flex-col gap-1 ${v.status
                  ? isDark ? "bg-green-900/20 border border-green-700/30" : "bg-green-50 border border-green-200"
                  : isDark ? "bg-gray-800/40 border border-white/5" : "bg-gray-50 border border-gray-200"
                }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{v.label}</p>
                {v.status
                  ? <CheckCircle size={14} className="text-green-400" />
                  : <XCircle size={14} className="text-gray-500" />}
              </div>
              <p className={`text-[10px] ${v.status ? "text-green-400" : "text-gray-500"}`}>
                {v.status ? "Verified" : "Not Verified"}
              </p>
              {v.date && (
                <p className="text-[9px] text-gray-500">
                  {new Date(v.date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── POSTS / TABS CARD ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        {/* tabs */}
        <div className="flex gap-6 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
          {["Posts", "Reels", "Events", "Community"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium pb-2 -mb-4 whitespace-nowrap transition-colors ${activeTab === tab
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* empty state */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No {activeTab.toLowerCase()} yet</p>
          <p className="text-gray-600 text-xs mt-1">Start sharing to see them here</p>
        </div>
      </div>

    </div>
  );
}
