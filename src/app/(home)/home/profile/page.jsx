"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Share2,
  MessageCircle,
  MapPin,
  Pencil,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Heart,
  MessageSquare,
  Play,
  Grid,
  Film
} from "lucide-react";


import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";
import postService from "@/app/user/post";

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
  
  // Posts and Reels data
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [postsCursor, setPostsCursor] = useState(null);
  const [reelsCursor, setReelsCursor] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreReels, setHasMoreReels] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMe();
        const data = res?.data?.data || res?.data;
        if (!data) throw new Error("No profile data received from API");
        
        // Log the image response data
        console.log("=== PROFILE IMAGE RESPONSE ===");
        console.log("profile_image_url:", data.profile_image_url);
        console.log("profile_photos:", data.profile_photos);
        console.log("full response:", JSON.stringify(data, null, 2));
        console.log("=============================");
        
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

  // Fetch posts when Posts tab is active
  useEffect(() => {
    const loadPosts = async () => {
      if (activeTab === "Posts" && profile?.user_id && !postsLoading) {
        setPostsLoading(true);
        try {
          const response = await postService.getMyPosts(20, null);
          const newPosts = response.data?.data?.posts || [];
          setPosts(newPosts);
          setPostsCursor(response.data?.data?.next_cursor);
          setHasMorePosts(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setPostsLoading(false);
        }
      }
    };
    loadPosts();
  }, [activeTab, profile?.user_id]);

  // Fetch reels when Reels tab is active
  useEffect(() => {
    const loadReels = async () => {
      if (activeTab === "Reels" && profile?.user_id && !reelsLoading) {
        setReelsLoading(true);
        try {
          const response = await postService.getMyReels(20, null);
          const newReels = response.data?.data?.reels || [];
          setReels(newReels);
          setReelsCursor(response.data?.data?.next_cursor);
          setHasMoreReels(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching reels:", error);
        } finally {
          setReelsLoading(false);
        }
      }
    };
    loadReels();
  }, [activeTab, profile?.user_id]);

  const loadMorePosts = async () => {
    if (postsCursor && hasMorePosts && !postsLoading) {
      setPostsLoading(true);
      try {
        const response = await postService.getMyPosts(20, postsCursor);
        const newPosts = response.data?.data?.posts || [];
        setPosts(prev => [...prev, ...newPosts]);
        setPostsCursor(response.data?.data?.next_cursor);
        setHasMorePosts(response.data?.data?.has_more || false);
      } catch (error) {
        console.error("Error loading more posts:", error);
      } finally {
        setPostsLoading(false);
      }
    }
  };

  const loadMoreReels = async () => {
    if (reelsCursor && hasMoreReels && !reelsLoading) {
      setReelsLoading(true);
      try {
        const response = await postService.getMyReels(20, reelsCursor);
        const newReels = response.data?.data?.reels || [];
        setReels(prev => [...prev, ...newReels]);
        setReelsCursor(response.data?.data?.next_cursor);
        setHasMoreReels(response.data?.data?.has_more || false);
      } catch (error) {
        console.error("Error loading more reels:", error);
      } finally {
        setReelsLoading(false);
      }
    }
  };

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
     {/* ── COVER HEADER ───────────────────────────────────────── */}

<div
  className={`rounded-2xl overflow-hidden ${
    isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
  }`}
>

  {/* ───── COVER PHOTO ───── */}
  <div className="relative h-60 w-full bg-gradient-to-tr from-pink-400 via-blue-500 to-orange-500">

    {/* overlay */}
    <div className="absolute inset-0 bg-black/20" />

    {/* top bar */}
    <div className="absolute top-4 left-6 right-6 flex justify-between items-start">

      {/* username */}
      <h1 className="text-white text-2xl font-bold">
        {full_name || "User"}
      </h1>

      {/* buttons */}
      {is_own_profile && (
        <div className="flex gap-2">

          <button className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm flex items-center gap-2">
      <ImageIcon size={16} />
            Edit Cover Photo
          </button>

          <button
            onClick={() => router.push("/home/profile/edit")}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Profile
          </button>

          <button className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm flex items-center gap-2">
            <Share2 size={16} />
            Share
          </button>

          <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg">
            <Settings size={18} />
          </button>

        </div>
      )}
    </div>
  </div>


  {/* ───── USER DETAILS ───── */}
  <div className="p-6 -mt-16 relative z-10">

    <div className="flex gap-6 items-start flex-wrap md:flex-nowrap">

      {/* avatar */}
      <div className="flex-shrink-0">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
          <img
            src={profile_image_url || "/loginAvatars/profile.png"}
            alt={full_name}
            className={`w-full h-full rounded-full object-cover border-4 ${
              isDark ? "border-[#12122a]" : "border-white"
            }`}
          />
        </div>

        {/* status */}
        <div className="mt-2 flex justify-center">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
              account_status === "active"
                ? "bg-green-900/40 text-green-400 border border-green-700/40"
                : "bg-red-900/40 text-red-400 border border-red-700/40"
            }`}
          >
            {account_status || "active"}
          </span>
        </div>
      </div>


      {/* DETAILS */}
      <div className="flex-1 min-w-0">

        {/* name */}
        <div className="flex flex-wrap items-center gap-2 mb-1">

          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {full_name}
          </h2>

          {verification_badge === "verified" && (
            <ShieldCheck size={18} className="text-purple-400" />
          )}

          {gender && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/40 text-purple-300 border border-purple-700/30 capitalize">
              {gender}
            </span>
          )}

          {age && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/40 text-orange-400 border border-gray-600/30">
              {age} yrs
            </span>
          )}

          {role_type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-800/30 text-orange-300 border border-orange-700/30 capitalize">
              {capitalize(role_type)}
            </span>
          )}

        </div>


        {/* contact */}
        <div className="flex flex-wrap gap-4 mt-2 mb-4">

          {email && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Mail size={12} />
              {email}
            </span>
          )}

          {phone && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Phone size={12} />
              {phone}
            </span>
          )}

          {location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={12} />
              {location}
            </span>
          )}

        </div>


        {/* stats */}
        <div
          className={`flex gap-6 py-3 px-5 rounded-xl mb-4 w-fit ${
            isDark ? "bg-[#1a1a38]" : "bg-gray-100"
          }`}
        >
          <StatBox value={stats?.posts_count} label="Posts" />
          <StatBox value={stats?.followers_count} label="Followers" />
          <StatBox value={stats?.following_count} label="Following" />
          <StatBox value={stats?.reels_count} label="Reels" />
          <StatBox value={stats?.events_count} label="Events" />
        </div>


        {/* bio */}
        {bio ? (
          <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {bio}
          </p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No bio yet · Add one in Edit Profile
          </p>
        )}


        {/* interests */}
        {allInterests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {allInterests.slice(0, 8).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-purple-800/30 text-purple-300 border border-purple-700/30"
              >
                {tag}
              </span>
            ))}

            {allInterests.length > 8 && (
              <span className="text-xs text-gray-500">
                +{allInterests.length - 8} more
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
</div>
     

      {/* ── POSTS / TABS CARD ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        {/* tabs */}
        <div className="flex gap-6 border-b border-white/90 pb-4 mb-6 overflow-x-auto">
          {["Posts", "Reels", "Events", "Community"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium pb-2 -mb-4 whitespace-nowrap transition-colors ${activeTab === tab
                  ? "text-white border-b-2 border-purple-500"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {tab === "Posts" && <Grid size={16} className="inline mr-1" />}
              {tab === "Reels" && <Film size={16} className="inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {activeTab === "Posts" && (
          <div>
            {postsLoading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {posts.map((post) => (
                    <div 
                      key={post.post_id} 
                      className="aspect-square relative bg-gray-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
                    >
                      {post.media && post.media.length > 0 ? (
                        post.media[0].type === "video" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={24} className="text-white" />
                          </div>
                        ) : (
                          <img 
                            src={post.media[0].url} 
                            alt="Post" 
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                          <MessageSquare size={20} className="text-gray-400" />
                        </div>
                      )}
                      {/* Overlay with stats */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1 text-white text-sm font-medium">
                          <Heart size={16} /> {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-white text-sm font-medium">
                          <MessageSquare size={16} /> {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMorePosts && (
                  <div className="flex justify-center py-4">
                    <button 
                      onClick={loadMorePosts}
                      disabled={postsLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                      {postsLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
                  <Grid size={28} className="text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No posts yet</p>
                <p className="text-gray-600 text-xs mt-1">Start sharing to see them here</p>
                <button
                  onClick={() => router.push("/home/create-post")}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white"
                >
                  Create Post
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reels Grid */}
        {activeTab === "Reels" && (
          <div>
            {reelsLoading && reels.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reels.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {reels.map((reel) => (
                    <div 
                      key={reel.reel_id} 
                      className="aspect-[9/16] relative bg-gray-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
                    >
                      {reel.thumbnail_url ? (
                        <img 
                          src={reel.thumbnail_url} 
                          alt="Reel" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                          <Play size={20} className="text-gray-400" />
                        </div>
                      )}
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={32} className="text-white drop-shadow-lg" />
                      </div>
                      {/* Overlay with stats */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Heart size={12} /> {reel.likes_count || 0}
                          <MessageSquare size={12} /> {reel.comments_count || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMoreReels && (
                  <div className="flex justify-center py-4">
                    <button 
                      onClick={loadMoreReels}
                      disabled={reelsLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                      {reelsLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
                  <Film size={28} className="text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No reels yet</p>
                <p className="text-gray-600 text-xs mt-1">Create your first reel to see it here</p>
                <button
                  onClick={() => router.push("/home/create-post")}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white"
                >
                  Create Reel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Events and Community tabs - empty state */}
        {(activeTab === "Events" || activeTab === "Community") && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No {activeTab.toLowerCase()} yet</p>
            <p className="text-gray-600 text-xs mt-1">Start exploring to see {activeTab.toLowerCase()} here</p>
          </div>
        )}
      </div>
    </div>
  );
}

