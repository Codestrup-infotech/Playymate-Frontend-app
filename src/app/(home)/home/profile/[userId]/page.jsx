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
  UserMinus
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

function StatBox({ value, label, isDark, onClick }) {
  return (
    <div 
      className={`text-center ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
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
  const [currentUser, setCurrentUser] = useState(null);

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
        
        setProfile(data);
        
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
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-50 ${isDark ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-sm border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
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
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 mb-6 shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image with Story Ring */}
            <div className="flex-shrink-0">
              <UserStory 
                userId={profileData._id} 
                profile={profileData} 
                isOwnProfile={isOwnProfile}
              />
              {profileData.is_verified && (
                <div className="absolute bottom-1 right-1 bg-purple-600 rounded-full p-1">
                  <ShieldCheck size={16} className="text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-2xl font-bold font-Poppins ${isDark ? "text-white" : "text-gray-800"}`}>
                  {profileData.full_name || "Unknown User"}
                </h1>
                <VerificationBadge status={profileData.is_verified} />
              </div>
              
              <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                @{profileData.username || "username"}
              </p>

              {/* Location */}
              {location.display_text && (
                <div className={`flex items-center gap-1 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <MapPin size={14} />
                  <span className="text-sm">{location.display_text}</span>
                </div>
              )}

              {/* Bio */}
              {profileData.bio && (
                <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {profileData.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4">
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
                    <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                      {profileData.is_following ? (
                        <>
                          <UserMinus size={16} />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Follow
                        </>
                      )}
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                      <MessageCircle size={16} />
                      Message
                    </button>
                    <button className={`p-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}>
                      <Share2 size={20} className={isDark ? "text-white" : "text-gray-700"} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        {flattenedInterests.length > 0 && (
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
                  ? "text-purple-600 border-b-2 border-purple-600"
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
                  ? "text-purple-600 border-b-2 border-purple-600"
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
                  ? "text-purple-600 border-b-2 border-purple-600"
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
                  <div className="grid grid-cols-3 gap-2">
                   {posts.map((post, index) => (
  <div
    key={post?._id || `post-${index}`}
                        onClick={() => handlePostClick(post)}
                        className="aspect-square cursor-pointer overflow-hidden rounded-lg"
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
    </div>
  );
}
