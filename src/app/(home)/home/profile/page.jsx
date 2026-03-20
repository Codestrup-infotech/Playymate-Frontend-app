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
import Activity from "../components/Activity.jsx";
import BioPopup from "@/app/components/profileCompletion/BioPopup.jsx";
import PostDetailModal from "../components/PostDetailModal.jsx";

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

function StatBox({ value, label, isDark }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-medium font-Poppins ${isDark ? "text-white " : "text-black "}`}>{value ?? 0}</p>
      <p className={`text-sm font-Poppins mt-1 ${isDark ? "text-white " : "text-slate-800 "}`}>{label}</p>
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
  const [showBioPopup, setShowBioPopup] = useState(false);

  // Posts and Reels data
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [postsCursor, setPostsCursor] = useState(null);
  const [reelsCursor, setReelsCursor] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreReels, setHasMoreReels] = useState(true);

  // Selected post for modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostLoading, setSelectedPostLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMe();
        const data = res?.data?.data || res?.data;
        if (!data) throw new Error("No profile data received from API");

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

  // Handle bio save from popup
  const handleBioSave = (newBio) => {
    setProfile((prev) => ({ ...prev, bio: newBio }));
    setShowBioPopup(false);
  };

  // Fetch posts when Posts tab is active
  useEffect(() => {
    const loadPosts = async () => {
      if (activeTab === "Posts" && profile?._id && !postsLoading) {
        setPostsLoading(true);
        try {
          const response = await postService.getUserPosts(profile._id, 20, null);
          console.log("Posts API response:", response);
          const newPosts = (response.data?.data?.posts || response.data?.data?.items || [])
            .filter((post) => {
              if (!post.media || post.media.length === 0) return true;
              const mediaType = post.media[0].type?.toLowerCase();
              return mediaType !== "video" && mediaType !== "gif";
            });
          setPosts(newPosts);
          setPostsCursor(response.data?.data?.next_cursor);
          setHasMorePosts(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching posts:", error?.response?.data || error.message);
          // Try alternate endpoint
          try {
            const altResponse = await postService.getMyPosts(20, null);
            console.log("Alternate Posts API response:", altResponse);
            const newPosts = (altResponse.data?.data?.posts || altResponse.data?.data?.items || [])
              .filter((post) => {
                if (!post.media || post.media.length === 0) return true;
                const mediaType = post.media[0].type?.toLowerCase();
                return mediaType !== "video" && mediaType !== "gif";
              });
            setPosts(newPosts);
            setPostsCursor(altResponse.data?.data?.next_cursor);
            setHasMorePosts(altResponse.data?.data?.has_more || false);
          } catch (altError) {
            console.error("Error fetching posts (alternate):", altError?.response?.data || altError.message);
            setPosts([]);
          }
        } finally {
          setPostsLoading(false);
        }
      }
    };
    loadPosts();
  }, [activeTab, profile?._id]);

  // Fetch reels when Reels tab is active
  useEffect(() => {
    const loadReels = async () => {
      if (activeTab === "Reels" && profile?._id && !reelsLoading) {
        setReelsLoading(true);
        try {
          const response = await postService.getUserPosts(profile._id, 50, null);
          console.log("Reels from posts API response:", response);
          const allPosts = response.data?.data?.posts || response.data?.data?.items || [];
          const newReels = allPosts.filter((post) => {
            if (!post.media || post.media.length === 0) return false;
            const mediaType = post.media[0].type?.toLowerCase();
            return mediaType === "video" || mediaType === "gif";
          });
          console.log("Filtered videos/GIFs for reels:", newReels);
          setReels(newReels);
          setReelsCursor(response.data?.data?.next_cursor);
          setHasMoreReels(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching reels:", error?.response?.data || error.message);
          try {
            const altResponse = await postService.getMyPosts(50, null);
            const allPosts = altResponse.data?.data?.posts || altResponse.data?.data?.items || [];
            const newReels = allPosts.filter((post) => {
              if (!post.media || post.media.length === 0) return false;
              const mediaType = post.media[0].type?.toLowerCase();
              return mediaType === "video" || mediaType === "gif";
            });
            setReels(newReels);
            setReelsCursor(altResponse.data?.data?.next_cursor);
            setHasMoreReels(altResponse.data?.data?.has_more || false);
          } catch (altError) {
            console.error("Error fetching reels (alternate):", altError?.response?.data || altError.message);
            setReels([]);
          }
        } finally {
          setReelsLoading(false);
        }
      }
    };
    loadReels();
  }, [activeTab, profile?._id]);

  const loadMorePosts = async () => {
    if (postsCursor && hasMorePosts && !postsLoading && profile?._id) {
      setPostsLoading(true);
      try {
        const response = await postService.getUserPosts(profile._id, 20, postsCursor);
        const newPosts = (response.data?.data?.posts || response.data?.data?.items || [])
          .filter((post) => {
            if (!post.media || post.media.length === 0) return true;
            const mediaType = post.media[0].type?.toLowerCase();
            return mediaType !== "video" && mediaType !== "gif";
          });
        setPosts((prev) => [...prev, ...newPosts]);
        setPostsCursor(response.data?.data?.next_cursor);
        setHasMorePosts(response.data?.data?.has_more || false);
      } catch (error) {
        console.error("Error loading more posts:", error?.response?.data || error.message);
      } finally {
        setPostsLoading(false);
      }
    }
  };

  const loadMoreReels = async () => {
    if (reelsCursor && hasMoreReels && !reelsLoading && profile?._id) {
      setReelsLoading(true);
      try {
        const response = await postService.getUserPosts(profile._id, 50, reelsCursor);
        const allPosts = response.data?.data?.posts || response.data?.data?.items || [];
        const newReels = allPosts.filter((post) => {
          if (!post.media || post.media.length === 0) return false;
          const mediaType = post.media[0].type?.toLowerCase();
          return mediaType === "video" || mediaType === "gif";
        });
        setReels((prev) => [...prev, ...newReels]);
        setReelsCursor(response.data?.data?.next_cursor);
        setHasMoreReels(response.data?.data?.has_more || false);
      } catch (error) {
        console.error("Error loading more reels:", error?.response?.data || error.message);
      } finally {
        setReelsLoading(false);
      }
    }
  };

  // ── Handle post click — fetch full post details ────────────────────────────
  const handlePostClick = async (post) => {
    setSelectedPost(post);   // show modal instantly with existing data
    setShowPostModal(true);
    setSelectedPostLoading(true);
    try {
      // Fetch post details
      const response = await postService.getPost(post.post_id);
      console.log('Post details response:', response);
      
      // Get the post data - handle different response structures
      let postData = response.data?.data?.post || response.data?.data || response.data || post;
      
      // Preserve the is_liked from original post if not in API response
      if (postData && post.is_liked !== undefined) {
        postData.is_liked = post.is_liked;
      }
      
      // If comments aren't in the post, fetch them separately
      if (!postData.comments || postData.comments.length === 0) {
        try {
          const commentsResponse = await postService.getPostComments(post.post_id, 50, null, 'recent');
          console.log('Comments response:', commentsResponse);
          // Handle different response structures
          const commentsData = commentsResponse.data?.data?.comments 
            || commentsResponse.data?.comments 
            || commentsResponse.data?.data 
            || [];
          postData.comments = Array.isArray(commentsData) ? commentsData : [];
          postData.comments_count = commentsResponse.data?.data?.count 
            || commentsResponse.data?.count 
            || postData.comments.length
            || 0;
        } catch (commentError) {
          console.error("Error fetching comments:", commentError);
          postData.comments = [];
        }
      }
      
      setSelectedPost(postData);
    } catch (error) {
      console.error("Error fetching post details:", error?.response?.data || error.message);
      // Keep showing the basic post data already set above
    } finally {
      setSelectedPostLoading(false);
    }
  };

  // ── Handle reel click ─────────────────────────────────────────────────────
  //
  //  Root cause of the original bug:
  //    1. postService.getReel() didn't exist  →  runtime error, .response is undefined
  //    2. The old axios interceptor stripped res.data, hiding the real error body
  //    3. Both issues produced console.error("REEL ERROR:", {})
  //
  //  Fix:
  //    • Reels ARE posts (video media). Use postService.getPost() instead.
  //    • Show modal immediately with the existing reel object so the user
  //      sees content right away, even if the detail fetch fails.
  //    • Use optional chaining on error so we always log something useful.
  // ─────────────────────────────────────────────────────────────────────────
  const handleReelClick = async (reel) => {
    console.log("Reel clicked:", reel);

    // Normalise ID — API may return any of these field names
    const reelId = reel?.post_id || reel?.reel_id || reel?._id;

    if (!reelId) {
      console.error("Invalid reel — no ID found:", reel);
      return;
    }

    // ✅  Open modal immediately so the user isn't staring at nothing
    setSelectedPost(reel);
    setShowPostModal(true);
    setSelectedPostLoading(true);

    try {
      // These "reels" are actually posts (videos/GIFs), so use post_id instead of reel_id
      const postId = reel.reel_id || reel.post_id;
      if (!postId) {
        console.error('No valid post ID found for reel:', reel);
        setSelectedPostLoading(false);
        return;
      }
      
      // Use getPost for posts (video/GIF) or getReel for actual reels
      let response;
      if (reel.reel_id) {
        response = await postService.getReel(reel.reel_id);
        // Handle different response structures
        let postData = response.data?.data || response.data || reel;
        // Preserve is_liked from original reel if not in API response
        if (postData && reel.is_liked !== undefined) {
          postData.is_liked = reel.is_liked;
        }
        setSelectedPost(postData.media ? postData : reel);
      } else {
        response = await postService.getPost(reel.post_id);
        // Handle different response structures - getPost returns full axios response
        let postData = response.data?.data || response.data || reel;
        // Preserve is_liked from original reel if not in API response
        if (postData && reel.is_liked !== undefined) {
          postData.is_liked = reel.is_liked;
        }
        // Only update if we get valid media data, otherwise keep original
        setSelectedPost(postData.media ? postData : reel);
      }
      console.log('Reel/Post details response:', response);
    } catch (error) {
      console.error("Error fetching reel details:", error);
      // Keep showing the basic reel data if API fails - already set above
    } finally {
      setSelectedPostLoading(false);
    }
  };

  // Handle modal close - update posts grid with new data
  const handlePostUpdate = (updatedPost) => {
    if (updatedPost) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === updatedPost.post_id 
            ? { 
                ...post, 
                likes_count: updatedPost.likes_count ?? post.likes_count,
                comments_count: updatedPost.comments_count ?? post.comments_count,
                is_liked: updatedPost.is_liked ?? post.is_liked
              }
            : post
        )
      );
    }
    setShowPostModal(false);
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
    _id,
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

  // ✅ Safely extract a string — profile_location may be a nested object
  const location = typeof profile_location === "string"
    ? profile_location
    : profile_location?.display_text ||
      profile_location?.city ||
      profile_location?.state ||
      null;

  const roleSpecific = profile_details?.role_specific || {};
  const commonFields = profile_details?.common_fields || {};

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
        className={`rounded-2xl overflow-hidden ${
          isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
        }`}
      >

  {/* ───── COVER PHOTO ───── */}
  <div className="relative h-52 w-full bg-gradient-to-l from-[#FF8319] to-[#EF3AFF]  ">

    {/* overlay */}
    <div className="absolute inset-0 bg-black/20" />

          <div className="absolute top-4 left-6 right-6 flex justify-between items-start">
            <h1 className="text-white text-2xl font-bold">
              {full_name || "User"}
            </h1>

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
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-[30px] p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
                <img
                  src={profile_photos?.[0]?.url || profile_image_url || "/loginAvatars/profile.png"}
                  alt={full_name}
                  className={`w-full h-full rounded-3xl object-cover border-4 ${
                    isDark ? "border-[#12122a]" : "border-white"
                  }`}
                />
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex-1 min-w-0 mt-12">

              <div className="flex flex-wrap items-center gap-2 mb-1 space-x-4">
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {full_name}
                </h2>

                {verification_badge === "verified" && (
                  <ShieldCheck size={18} className="text-purple-500" />
                )}

        </div>


      


              {/* stats */}
              <div
                className={`flex gap-6 py-2.5 mt-4 px-5 rounded-xl mb-4 w-fit border border-slate-100 shadow-md text-blue-900 ${
                  isDark ? "bg-[#1a1a38]" : "bg-gray-200"
                }`}
              >
                <StatBox value={stats?.posts_count} label="Posts" isDark={isDark} />
                <StatBox value={stats?.followers_count} label="Followers" isDark={isDark} />
                <StatBox value={stats?.following_count} label="Following" isDark={isDark} />
              </div>

              {/* bio */}
              {bio ? (
                <div
                  onClick={() => is_own_profile && setShowBioPopup(true)}
                  className={`text-sm leading-relaxed cursor-pointer hover:opacity-80 ${isDark ? "text-gray-300" : "text-gray-600"} ${is_own_profile ? "border-dashed w-80 border border-gray-500/30 p-2 rounded-xl" : ""}`}
                >
                  {bio}
                </div>
              ) : is_own_profile ? (
                <button
                  onClick={() => setShowBioPopup(true)}
                  className={`text-sm text-gray-500 italic bg-transparent border-none outline-none w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition`}
                >
                  No bio yet · Click to add one
                </button>
              ) : (
                <p className="text-sm text-gray-500 italic">No bio yet</p>
              )}

              <p className="text-sm text-gray-500 italic mt-2 flex items-center text-center rounded-md shadow-2xl">
                <MapPin size={14} className="text-slate-500 flex-shrink-0" />
                <span className="ml-2">
                  {location || "No location added"}
                </span>
              </p>

              <div className="border border-orange-300 w-96 mt-3 py-3 flex justify-center items-center text-center rounded-md">
                My Teams
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO CARDS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-Poppins">
        {/* Placeholder - Activity moved to Activity tab */}
      </div>

      {/* ── POSTS / TABS CARD ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 ${
          isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
        }`}
      >
        {/* tabs */}
        <div className="flex gap-6 border-b border-white/90 pb-4 mb-6 overflow-x-auto">
          {["Posts", "Reels", "Events", "Activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium pb-2 -mb-4 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? isDark
                    ? "text-white border-b-2 border-white"
                    : "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "Posts" && <Grid size={16} className="inline mr-1" />}
              {tab === "Reels" && <Film size={16} className="inline mr-1" />}
              {tab === "Activity" && <Briefcase size={16} className="inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>

        {/* ── Posts Grid ── */}
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
                      className="aspect-[3/4] relative bg-gray-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
                      onClick={() => handlePostClick(post)}
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

        {/* ── Reels Grid ── */}
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
      key={reel.reel_id || reel.post_id}
      className="aspect-[9/16] relative rounded overflow-hidden cursor-pointer"
      onClick={() => handleReelClick(reel)}
    >
      {reel.media && reel.media[0]?.url ? (
        <>
          <video
            src={reel.media[0].url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={40} className="text-white drop-shadow-md" />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <Play size={36} className="text-gray-600" />
        </div>
      )}
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

        {/* ── Events tab — empty state ── */}
        {activeTab === "Events" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No events yet</p>
            <p className="text-gray-600 text-xs mt-1">Start exploring to see events here</p>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === "Activity" && (
          <Activity profile={profile} isDark={isDark} />
        )}
      </div>

      {/* Bio Popup */}
      {showBioPopup && (
        <BioPopup
          onClose={() => setShowBioPopup(false)}
          onSave={handleBioSave}
          initialBio={bio}
        />
      )}

      {/* Post Detail Modal - Instagram Style Split View */}
      <PostDetailModal
        isDark={isDark}
        selectedPost={selectedPost}
        selectedPostLoading={selectedPostLoading}
        showPostModal={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostUpdate={handlePostUpdate}
        currentUser={profile}
      />


    </div>
  );
}

