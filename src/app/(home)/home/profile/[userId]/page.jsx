"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Film,
  ArrowLeft,
  UserPlus,
  UserMinus,
  ChevronDown,
  MoreHorizontal,
  Flag
} from "lucide-react";


import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";
import postService from "@/app/user/post";
import Activity from "../../components/Activity.jsx";
import BioPopup from "@/app/components/profileCompletion/BioPopup.jsx";
import UserPostDetailModal from "../../components/UserPostDetailModal.jsx";
import UserFollowModal from "../../components/UserFollowersFollowing.jsx";
import UserStory from "../user-story.jsx";
import Highlights from "../../components/highlights.jsx";
import UserFollowUnfollow from "../../components/UserFollowUnfollow.jsx";
import SharePopup from "../../components/sharepopup.jsx";

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
    ...(interests.interests || []),
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

// function StatBox({ value, label, isDark, onClick }) {
//   return (
//     <div 
//       className={`text-center ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
//       onClick={onClick}
//     >
//       <p className={`text-2xl font-medium font-Poppins ${isDark ? "text-white " : "text-black "}`}>{value ?? 0}</p>
//       <p className={`text-sm font-Poppins mt-1 ${isDark ? "text-white " : "text-slate-800 "}`}>{label}</p>
//     </div>
//   );
// }

function StatBox({ value, label, isDark, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-1 cursor-pointer"
    >
      <span className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>
        {value ?? 0}
      </span>
      <span className="text-gray-800">{label}</span>
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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId; // Get userId from URL params
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("Posts");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBioPopup, setShowBioPopup] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [currentUserId, setCurrentUserId] = useState(null);
  
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
  const [showFollowOptions, setShowFollowOptions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Mute/Unmute state
  const [isMuted, setIsMuted] = useState(false);
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  
  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  
  // Options popup state
  const [showOptions, setShowOptions] = useState(false);

  // Helper function to check if string is a valid MongoDB ObjectId
  const isObjectId = (str) => {
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  // Get current user ID and profile
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user?.user_id || user?._id);
    setCurrentUser(user);
  }, []);

  // Handle follow a user
  const handleFollow = async () => {
    try {
      await userService.followUser(userId);
      setProfile((prev) => ({
        ...prev,
        is_following: true,
        stats: {
          ...prev.stats,
          followers_count: (prev.stats?.followers_count || 0) + 1
        }
      }));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Handle unfollow from popup
  const handleUnfollowFromPopup = async () => {
    try {
      await userService.unfollowUser(userId);
      setProfile((prev) => ({
        ...prev,
        is_following: false,
        stats: {
          ...prev.stats,
          followers_count: Math.max((prev.stats?.followers_count || 0) - 1, 0)
        }
      }));
      // Don't close popup - keep it open so user can re-follow if needed
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // Handle mute user
  const handleMuteUser = async () => {
    try {
      await userService.muteUser(userId);
      setIsMuted(true);
      console.log("User muted successfully");
    } catch (error) {
      console.error("Error muting user:", error);
    }
  };

  // Handle unmute user
  const handleUnmuteUser = async () => {
    try {
      await userService.unmuteUser(userId);
      setIsMuted(false);
      console.log("User unmuted successfully");
    } catch (error) {
      console.error("Error unmuting user:", error);
    }
  };

  // Handle add to close friends
  const handleAddToCloseFriends = async () => {
    try {
      // Use the username from profile state or from userId if it's a username
      const username = profile?.username || userId;
      if (!username) {
        console.error("No username available to add to close friends");
        return;
      }
      await userService.addToCloseFriends(username);
      setIsCloseFriend(true);
      console.log("User added to close friends");
    } catch (error) {
      console.error("Error adding to close friends:", error);
    }
  };

  // Handle remove from close friends
  const handleRemoveFromCloseFriends = async () => {
    try {
      // Use the username from profile state or from userId if it's a username
      const username = profile?.username || userId;
      if (!username) {
        console.error("No username available to remove from close friends");
        return;
      }
      await userService.removeFromCloseFriends(username);
      setIsCloseFriend(false);
      console.log("User removed from close friends");
    } catch (error) {
      console.error("Error removing from close friends:", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch user - API handles both username and userId
        const res = await userService.getUserById(userId);
        const data = res?.data?.data || res?.data;
        if (!data) throw new Error("No profile data received from API");
        
        // Check if this is the own profile
        setIsOwnProfile(data.is_own_profile === true);
        
        // Log the image response data
        console.log("=== USER PROFILE IMAGE RESPONSE ===");
        console.log("profile_image_url:", data.profile_image_url);
        console.log("profile_photos:", data.profile_photos);
        console.log("full response:", JSON.stringify(data, null, 2));
        console.log("is_own_profile:", data.is_own_profile);
        console.log("username:", data.username);
        console.log("user_id:", data._id);
        console.log("===================================");
        
        // Log profile_main_type specifically
        console.log("=== PROFILE MAIN TYPE DEBUG ===");
        console.log("profile_main_type:", data.profile_main_type);
        console.log("profile_main_type?.value:", data.profile_main_type?.value);
        console.log("profile_main_type type:", typeof data.profile_main_type);
        console.log("profile_main_type?.type:", data.profile_main_type?.type);
        console.log("===================================");
        
        setProfile(data);
        
        // Set mute and close friend status from API response
        setIsMuted(data.is_muted === true);
        setIsCloseFriend(data.is_close_friend === true);
        
        // URL Rewrite: If user has username and current URL uses userId, update URL to show username
        if (data.username && userId !== data.username) {
          // Replace URL with username for cleaner look
          router.replace(`/home/profile/${data.username}`);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

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
          const newPosts = (response.data?.data?.posts || response.data?.data?.items || [])
            .filter(post => {
              if (!post.media || post.media.length === 0) return true;
              const mediaType = post.media[0].type?.toLowerCase();
              return mediaType !== 'video' && mediaType !== 'gif';
            });
          setPosts(newPosts);
          setPostsCursor(response.data?.data?.next_cursor);
          setHasMorePosts(response.data?.data?.has_more || false);
        } catch (error) {
          console.error("Error fetching posts:", error);
          setPosts([]);
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
          setReels([]);
        } finally {
          setReelsLoading(false);
        }
      }
    };
    loadReels();
  }, [activeTab, profile?._id]);

  const handlePostClick = async (post) => {
    setSelectedPostLoading(true);
    // Use post data directly from profile - the API might fail
    setSelectedPost(post);
    setSelectedPostLoading(false);
    setShowPostModal(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} flex flex-col items-center justify-center`}>
        <p className={`text-xl ${isDark ? "text-white" : "text-gray-800"} mb-4`}>{error}</p>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get profile data with defaults
  const profileData = profile || {};
  const stats = profileData.stats || {};
  const location = profileData.profile_location || {};
  const interests = profileData.interests || {};
  const flattenedInterests = flattenInterests(interests);

  return (
    <div className={`min-h-screen lg:py-6 py-3 xl:mr-7 ${isDark ? "bg-gray-900" : "bg-white rounded-3xl "}`}>
      {/* Top Bar */}
      {/* <div className={`sticky top-0 z-50 ${isDark ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-sm border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            <ArrowLeft size={20} className={isDark ? "text-white" : "text-gray-800"} />
          </button>
          <h1 className={`text-lg font-semibold font-Poppins ${isDark ? "text-white" : "text-gray-800"}`}>
            {profileData.full_name || "User Profile"}
          </h1>
          <div className="w-10"></div>
        </div>
      </div> */}

      <div className="max-w-5xl mx-auto px-4 py-6">

        
        {/* Profile Header */}

          
           

        <div className={`${isDark ? "bg-gray-800" : "bg-white shadow-gray-300 border "} rounded-2xl  lg:px-4 lg:py-6 p-1 py-1 mb-6 shadow-sm`}>

            {/* <button 
            onClick={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            <ArrowLeft size={20} className={isDark ? "text-white" : "text-gray-800"} />
          </button> */}


 {/* Cover Photo Section */}
          <div className="relative inset-0 h-52 w-full overflow-hidden">
            {profileData.cover_photo ? (
              <img 
                src={profileData.cover_photo} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-l from-[#FF8319] to-[#EF3AFF]" />
            )}
          </div>
          
          <div className="flex mt-5 flex-col md:flex-row gap-10">
            {/* Profile Image with Story Ring */}

            <div className="flex flex-col"> 
            <div className="flex-shrink-0">
              <UserStory 
                userId={profileData._id} 
                profile={profileData} 
                isOwnProfile={isOwnProfile}
              />
              {profileData.is_verified && (
                <div className="absolute bottom-1 right-1 bg-purple-600  rounded-full p-1">
                  <ShieldCheck size={16} className="text-white" />
                </div>
              )}
            </div>
             {/* Profile Main Type Badge */}
              {profileData.profile_main_type?.value && (
                <div className="mt-2">
                  <span className="px-6 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#EF3AFF]  to-[#FF8319] text-white ">
                    {capitalize(profileData.profile_main_type.value)}
                  </span>
                </div>
              )}
</div>
            {/* Profile Info */}
            <div className="flex-1 ">

              
              <div className="flex items-center gap-3 ">
                <h1 className={`text-2xl font-bold font-Poppins ${isDark ? "text-white" : "text-gray-800"}`}>
                  {profileData.full_name || "Unknown User"}
                </h1>
                <VerificationBadge status={profileData.is_verified} />
                <button 
                  onClick={() => setShowOptions(true)}
                  className={`p-1 rounded-full ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <MoreHorizontal size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </button>
              </div>
              
             
              
              <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                @ {profileData.username || "username"}
              </p>

             



             
              {/* Stats */}
              <div className="flex justify-start items-center gap-6 py-2">
                <StatBox value={stats?.posts_count} label="Posts" isDark={isDark} />
                <StatBox 
                  value={stats?.followers_count} 
                  label="Followers" 
                  isDark={isDark} 
                  onClick={() => {
                    setFollowModalType("followers");
                    setShowFollowModal(true);
                  }}
                />
                <StatBox 
                  value={stats?.following_count} 
                  label="Following" 
                  isDark={isDark} 
                  onClick={() => {
                    setFollowModalType("following");
                    setShowFollowModal(true);
                  }}
                />
              </div>
           


            {/* Location */}
              {location.display_text && (
                <div className={`flex items-center gap-1  mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <MapPin size={14} />
                  <span className="text-sm">{location.display_text}</span>
                </div>
              )}

              {/* Bio */} 
              {profileData.bio && (
                <p className={`mb-4 lg:pl-4  ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {profileData.bio}
                </p>
              )}




              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={() => router.push('/home/profile/edit')}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Pencil size={16} />
                      Edit Profile
                    </button>
                    <button className={`p-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}>
                      <Settings size={20} className={isDark ? "text-white" : "text-gray-700"} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => profileData.is_following ? setShowFollowOptions(true) : handleFollow()}
                      className="flex-1 max-w-56 px-4 py-2 bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] text-white rounded-lg hover:bg-gradient-to-r hover:from-[#FF8319] hover:to-[#EF3AFF] flex items-center justify-center gap-2"
                    >
                      {profileData.is_following ? (
                        <>
                          <span>Following</span>
                          <ChevronDown size={16} />
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Follow
                        </>
                      )}
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] text-white rounded-lg  hover:bg-gradient-to-r hover:from-[#FF8319] hover:to-[#EF3AFF] flex items-center justify-center gap-2">
                      <MessageCircle size={16} />
                      Message
                    </button>
                    <button 
                      onClick={() => setShowSharePopup(true)}
                      className={`p-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-200"}`}
                    >
                      <Share2 size={20} className={isDark ? "text-white" : "text-gray-700"} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Interests - Only show for own profile */}
        {isOwnProfile && flattenedInterests.length > 0 && (
          <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 mb-6 shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {flattenedInterests.slice(0, 10).map((interest) => (
                <InterestPill key={`interest-${interest}`} label={interest} />
              ))}
            </div>
          </div>
        )}

        {/* Highlights Section */}
        <Highlights userId={profileData?._id} isOwner={isOwnProfile} />

        {/* Tabs */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("Posts")}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                activeTab === "Posts"
                  ? "text-[#F142E6] border-b-2 border-[#F142E6]"
                  : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Grid size={18} />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("Reels")}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                activeTab === "Reels"
                  ? "text-[#F142E6] border-b-2 border-[#F142E6]"
                  : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Film size={18} />
              Reels
            </button>
            <button
              onClick={() => setActiveTab("Events")}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                activeTab === "Events"
                  ? "text-[#F142E6] border-b-2 border-[#F142E6]"
                  : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calendar size={18} />
              Events
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "Posts" && (
              <div>
                {postsLoading ? (
                  <div key="posts-loading" className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 mb-4">
                   {posts.map((post, index) => (
  <div
    key={post?._id || `post-${index}`}
                        onClick={() => handlePostClick(post)}
                        className="aspect-[3/4] relative bg-gray-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
                      >
                        {post.media && post.media.length > 0 ? (
                          <img
                            src={post.media[0].url}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <ImageIcon size={24} className={isDark ? "text-gray-500" : "text-gray-400"} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Reels" && (
              <div>
                {reelsLoading ? (
                  <div key="reels-loading" className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : reels.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                   {reels.map((reel, index) => (
  <div
    key={reel?._id || `reel-${index}`}
                        className="aspect-square cursor-pointer overflow-hidden rounded-lg relative group"
                      >
                        {reel.thumbnail_url || (reel.media && reel.media[0]?.thumbnail) ? (
                          <img
                            src={reel.thumbnail_url || reel.media[0].thumbnail}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <Play size={24} className={isDark ? "text-gray-500" : "text-gray-400"} />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white">
                          <Play size={14} fill="white" />
                          <span className="text-xs font-medium">{reel.view_count || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <Film size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No reels yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Events" && (
              <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No events yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {showPostModal && selectedPost && (
        <UserPostDetailModal
          post={selectedPost}
          isLoading={selectedPostLoading}
          onClose={() => {
            setShowPostModal(false);
            setSelectedPost(null);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Follow/Unfollow Options Popup */}
      <UserFollowUnfollow
        isOpen={showFollowOptions}
        onClose={() => setShowFollowOptions(false)}
        userId={userId}
        onUnfollow={handleUnfollowFromPopup}
        userName={profileData?.full_name || profileData?.username}
        userProfileImage={profileData?.profile_image_url}
        isMuted={isMuted}
        isCloseFriend={isCloseFriend}
        onMute={handleMuteUser}
        onUnmute={handleUnmuteUser}
        onAddCloseFriend={handleAddToCloseFriends}
        onRemoveCloseFriend={handleRemoveFromCloseFriends}
        username={profileData?.username}
      />

      {/* Followers/Following Modal */}
      <UserFollowModal
        type={followModalType}
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={userId}
        currentUserId={currentUserId}
        followersData={profileData?.followers}
        followingData={profileData?.following}
        mutualData={profileData?.mutual}
      />

      {/* Share Profile Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        contentType="profile"
        contentId={profileData?.username || userId}
        thumbnail={profileData?.profile_image_url}
        title={profileData?.full_name ? `@${profileData.username} - ${profileData.full_name}` : `@${profileData?.username}`}
      />

      {/* Options Popup */}
      {showOptions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowOptions(false)}
          />

          {/* Popup */}
          <div className="relative w-[280px] bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Report */}
            <button className="flex items-center justify-center gap-2 w-full py-4 text-red-500 border-b">
              <Flag size={18} />
              Report
            </button>

            {/* About this account */}
            <button 
              onClick={() => {
                setShowOptions(false);
                router.push(`/home/profile/${userId}`);
              }}
              className="flex items-center justify-center gap-2 w-full py-4 border-b"
            >
              <User size={18} />
              About this account
            </button>

            {/* Cancel */}
            <button
              onClick={() => setShowOptions(false)}
              className="w-full py-4 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
