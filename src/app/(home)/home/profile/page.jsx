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

function StatBox({ value, label ,isDark}) {
  return (
    <div className="text-center">
      <p  className={`text-2xl font-medium font-Poppins ${isDark ? "text-white " : "text-black "}`}>{value ?? 0}</p>
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
          console.log('Posts API response:', response);
          const newPosts = response.data?.data?.posts || response.data?.data?.items || [];
          setPosts(newPosts);
          setPostsCursor(response.data?.data?.next_cursor);
          setHasMorePosts(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching posts:", error);
          // Try alternate endpoint
          try {
            const altResponse = await postService.getMyPosts(20, null);
            console.log('Alternate Posts API response:', altResponse);
            const newPosts = altResponse.data?.data?.posts || altResponse.data?.data?.items || [];
            setPosts(newPosts);
            setPostsCursor(altResponse.data?.data?.next_cursor);
            setHasMorePosts(altResponse.data?.data?.has_more || false);
          } catch (altError) {
            console.error("Error fetching posts (alternate):", altError);
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
          const response = await postService.getUserReels(profile._id, 20, null);
          console.log('Reels API response:', response);
          const newReels = response.data?.data?.reels || response.data?.data?.items || [];
          setReels(newReels);
          setReelsCursor(response.data?.data?.next_cursor);
          setHasMoreReels(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching reels:", error);
          // Try alternate endpoint
          try {
            const altResponse = await postService.getMyReels(20, null);
            console.log('Alternate Reels API response:', altResponse);
            const newReels = altResponse.data?.data?.reels || altResponse.data?.data?.items || [];
            setReels(newReels);
            setReelsCursor(altResponse.data?.data?.next_cursor);
            setHasMoreReels(altResponse.data?.data?.has_more || false);
          } catch (altError) {
            console.error("Error fetching reels (alternate):", altError);
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
        const newPosts = response.data?.data?.posts || response.data?.data?.items || [];
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
    if (reelsCursor && hasMoreReels && !reelsLoading && profile?._id) {
      setReelsLoading(true);
      try {
        const response = await postService.getUserReels(profile._id, 20, reelsCursor);
        const newReels = response.data?.data?.reels || response.data?.data?.items || [];
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

  // Handle post click - fetch full post details
  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
    setSelectedPostLoading(true);
    try {
      const response = await postService.getPost(post.post_id);
      console.log('Post details response:', response);
      setSelectedPost(response.data?.data?.post || post);
    } catch (error) {
      console.error("Error fetching post details:", error);
      // Keep showing the basic post data if API fails
    } finally {
      setSelectedPostLoading(false);
    }
  };

  // Handle reel click - fetch full reel details
  const handleReelClick = async (reel) => {
    console.log('Reel clicked:', reel);
    setSelectedPost(reel);
    setShowPostModal(true);
    setSelectedPostLoading(true);
    try {
      const response = await postService.getReel(reel.reel_id);
      console.log('Reel details response:', response);
      setSelectedPost(response.data?.data || reel);
    } catch (error) {
      console.error("Error fetching reel details:", error);
      // Keep showing the basic reel data if API fails
    } finally {
      setSelectedPostLoading(false);
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
  <div className="relative h-52 w-full bg-gradient-to-tl from-[#FF8319] via-[#FF8319] to-[#EF3AFF] ">

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

        {/* name */}
        <div className="flex flex-wrap items-center gap-2 mb-1 space-x-4  ">

          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {full_name}
          </h2>

          {verification_badge === "verified" && (
            <ShieldCheck size={18} className="text-purple-500  " />
          )}

          {gender && (
            <span className="text-[14px] px-2 py-0.5 rounded-full bg-[#6913A7] text-purple-300 border border-purple-700/30 capitalize">
              {gender}
            </span>
          )}

          {age && (
            <span className="text-[14px] px-2 py-0.5 rounded-full bg-[#6913A7] text-purple-300 border border-gray-600/30">
              {age} yrs
            </span>
          )}

          {role_type && (
            <span className="text-[14px] px-2 py-0.5 rounded-full bg-[#6913A7] text-purple-300 border border-orange-700/30 capitalize">
              {capitalize(role_type)}
            </span>
          )}

        </div>


      


        {/* stats */}
        <div
          className={`flex gap-6 py-2.5 mt-4 px-5 rounded-xl mb-4 w-fit border  border-slate-100 shadow-md  text-blue-900 ${
            isDark ? "bg-[#1a1a38]" : " bg-gray-200 "
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
            className={`text-sm leading-relaxed cursor-pointer hover:opacity-80 ${isDark ? "text-gray-300" : "text-gray-600"} ${is_own_profile ? 'border-dashed w-80 border border-gray-500/30 p-2 rounded-xl  ' : ''}`}
          >
            {bio}
          </div>
        ) : is_own_profile ? (
          <button
            onClick={() => setShowBioPopup(true)}
            className={`text-sm text-gray-500 italic bg-transparent border-none outline-none w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition ${isDark ? "placeholder-gray-500" : "placeholder-gray-400"}`}
          >
            No bio yet · Click to add one
          </button>
        ) : (
          <p className={`text-sm text-gray-500 italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            No bio yet
          </p>
        )}


 <p className="text-sm text-gray-500 italic  mt-2 flex  items-center text-center  rounded-md shadow-2xl ">
        
         <MapPin size={14} className="text-slate-500 flex-shrink-0 " />  
         
         <span  className="ml-2"> 
            {profile_location?.display_text || profile_location?.city || profile_location?.state || "No location added"}</span>
          </p>
          
          
          <div className="border border-orange-300 w-96 mt-3 py-3 flex justify-center items-center text-center rounded-md "> My Teams</div>
      
      </div>
    </div>
  </div>
</div>
      {/* ── INFO CARDS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-Poppins ">

        {/* Placeholder - Activity moved to Activity tab */}
      </div>

    

      {/* ── POSTS / TABS CARD ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 ${isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
          }`}
      >
        {/* tabs */}
        <div className="flex gap-6 border-b border-white/90 pb-4 mb-6 overflow-x-auto">
          {["Posts", "Reels", "Events", "Activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium pb-2 -mb-4 whitespace-nowrap transition-colors ${activeTab === tab
                  ? isDark ? "text-white border-b-2 border-white" : "text-pink-500 border-b-2 border-pink-500"
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
                      onClick={() => handleReelClick(reel)}
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

        {/* Events and  tabs - empty state */}
        {(activeTab === "Events") && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No {activeTab.toLowerCase()} yet</p>
            <p className="text-gray-600 text-xs mt-1">Start exploring to see {activeTab.toLowerCase()} here</p>
          </div>
        )}

        {/* Activity Tab */}
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

      {/* Post Detail Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} ${!isDark && 'shadow-2xl'}`}>
            {/* Close button */}
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <XCircle size={24} />
            </button>

            {selectedPostLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedPost ? (
              <div className="flex flex-col">
                {/* Author Info */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <img
                    src={selectedPost.author?.profile_image_url || selectedPost.author?.profile_image_url || "/loginAvatars/profile.png"}
                    alt={selectedPost.author?.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPost.author?.full_name || 'User'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      @{selectedPost.author?.username || 'username'}
                    </p>
                  </div>
                  {selectedPost.author?.is_verified && (
                    <CheckCircle size={16} className="text-blue-400" />
                  )}
                </div>

                {/* Media */}
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="relative bg-black">
                    {selectedPost.media[0].type === 'video' ? (
                      <video
                        src={selectedPost.media[0].url}
                        controls
                        className="w-full max-h-[50vh] object-contain"
                      />
                    ) : (
                      <img
                        src={selectedPost.media[0].url}
                        alt="Post media"
                        className="w-full max-h-[50vh] object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Heart size={20} className={selectedPost.is_liked ? "text-red-500 fill-red-500" : ""} />
                      {selectedPost.likes_count || 0}
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <MessageSquare size={20} />
                      {selectedPost.comments_count || 0}
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Share2 size={20} />
                      {selectedPost.shares_count || 0}
                    </span>
                  </div>

                  {/* Caption */}
                  {selectedPost.content?.text && (
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap`}>
                      {selectedPost.content.text}
                    </p>
                  )}

                  {/* Hashtags */}
                  {selectedPost.content?.hashtags && selectedPost.content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedPost.content.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-purple-400 text-sm">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  {selectedPost.content?.location && (
                    <div className={`flex items-center gap-1 mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin size={14} />
                      {selectedPost.content.location}
                    </div>
                  )}

                  {/* Created at */}
                  <p className={`text-sm mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {selectedPost.created_at && new Date(selectedPost.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-400">Post not found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

