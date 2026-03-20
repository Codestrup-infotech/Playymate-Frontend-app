 "use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle, Heart, Send, ShoppingCart, MapPin,
  Users, Image, X, RefreshCw, Loader2, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { getMyStory, getStoryFeed, sortStoriesByCreatedAtASC } from "@/app/user/homefeed";
import userService from "@/services/user";
import ProfileCompletionCard from "@/app/components/profileCompletion/ProfileCompletionCard";
import { useTheme } from "@/lib/ThemeContext";
import SuggestedUsers from "./components/SuggestedUsers";
import OwnStoryViewerModal from "./profile/story";
import useFeed from "@/hooks/useFeed";

/* ─── Small helper components ─── */

function PostCard({ post, isDark, cardBg, mutedText, iconBtn }) {
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);

  // Handle video end - pause and reset to start (Instagram-style)
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  // Support both old format (post.data) and new format (transformed feed item with type: "post")
  // The transformed followingFeedItems have: { type: "post", data: { author, content, media, engagement, ... } }
  const author = post.data?.author ?? post.author ?? {};
  const content = post.data?.content ?? post.content ?? {};
  const media = post.data?.media ?? post.media ?? [];
  const engagement = post.data?.engagement ?? post.engagement ?? {};
  const userAction = post.data?.user_action ?? post.user_action ?? {};
  const likesCount = engagement?.likes_count ?? post.data?.likes_count ?? post.likes_count ?? 0;
  const commentsCount = engagement?.comments_count ?? post.data?.comments_count ?? post.comments_count ?? 0;
  const sharesCount = engagement?.shares_count ?? 0;
  const savesCount = engagement?.saves_count ?? 0;
  const isLikedByYou = userAction?.liked_by_you ?? liked;
  const isSavedByYou = userAction?.saved_by_you ?? false;
  const contentType = post.data?.content_type ?? post.content_type ?? 'post';

  return (
    <div className={`${cardBg} rounded-xl overflow-hidden shadow-sm transition-colors duration-300`}>
      {/* Author row */}
      <div className="flex items-center gap-3 p-4">
        {author.profile_image_url ? (
          <img src={author.profile_image_url} alt={author.full_name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
        )}
        <div>
          <h4 className="font-semibold text-sm">{author.full_name || "Unknown"}</h4>
          {author.username && <p className={`text-xs ${mutedText}`}>@{author.username}</p>}
        </div>
        {contentType === 'reel' && (
          <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Reel</span>
        )}
      </div>

      {/* Media - Instagram-style: maintain original aspect ratio, no stretching */}
      {media.length > 0 && (
        <div className="w-full bg-black flex items-center justify-center">
          {media[0].type === "video" ? (
            <video 
              src={media[0].url} 
              controls 
              className="w-full h-auto max-h-[80vh] object-contain"
              playsInline
            />
          ) : (
            <img 
              src={media[0].url} 
              alt="post media" 
              className="w-full h-auto object-contain"
            />
          )}
        </div>
      )}

      {/* Text */}
      {content.text && (
        <p className={`px-4 py-3 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {content.text}
        </p>
      )}

      {/* Hashtags */}
      {content.hashtags && content.hashtags.length > 0 && (
        <p className={`px-4 pb-2 text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          {content.hashtags.map(tag => `#${tag}`).join(' ')}
        </p>
      )}

      {/* Location */}
      {content.location?.display_text && (
        <p className={`px-4 pb-2 text-xs flex items-center gap-1 ${mutedText}`}>
          <MapPin size={12} /> {content.location.display_text}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center px-4 pb-4 text-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setLiked(l => !l)}
            className={`flex items-center gap-1.5 transition-colors ${isLikedByYou ? "text-pink-500" : iconBtn}`}
          >
            <Heart size={18} className={isLikedByYou ? "fill-pink-500" : ""} />
            <span>{isLikedByYou ? likesCount + 1 : likesCount}</span>
          </button>
          <button className={`flex items-center gap-1.5 transition-colors ${iconBtn}`}>
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {savesCount > 0 && (
            <span className={`text-xs ${mutedText}`}>Save: {savesCount}</span>
          )}
          <button className={`flex items-center gap-1.5 transition-colors ${iconBtn}`}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function VenueCard({ venue, isDark, cardBg, mutedText }) {
  return (
    <div className={`${cardBg} rounded-xl overflow-hidden shadow-sm transition-colors duration-300`}>
      {venue.image_url && (
        <img src={venue.image_url} alt={venue.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{venue.name}</h4>
        {venue.address && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${mutedText}`}>
            <MapPin size={12} /> {venue.address}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          {venue.distance_km && (
            <span className={`text-xs ${mutedText}`}>{venue.distance_km} km away</span>
          )}
          {venue.rating && (
            <span className="text-xs text-yellow-400">★ {venue.rating}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FriendActivityCard({ item, isDark, cardBg, mutedText }) {
  const data = item.data ?? {};
  return (
    <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors duration-300 flex items-center gap-3`}>
      {data.profile_image_url ? (
        <img src={data.profile_image_url} className="w-10 h-10 rounded-full object-cover" alt={data.full_name} />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center">
          <Users size={16} className="text-white" />
        </div>
      )}
      <div>
        <p className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          <span className="font-semibold">{data.full_name || "Someone"}</span>
          {data.activity && ` ${data.activity}`}
        </p>
        {data.time && <p className={`text-xs mt-0.5 ${mutedText}`}>{data.time}</p>}
      </div>
    </div>
  );
}

function FeedItemRenderer({ item, isDark, cardBg, mutedText, iconBtn }) {
  if (!item) return null;
  if (item.type === "post") {
    return <PostCard post={item} isDark={isDark} cardBg={cardBg} mutedText={mutedText} iconBtn={iconBtn} />;
  }
  if (item.type === "venue") {
    const venue = item.data ?? item;
    return <VenueCard venue={venue} isDark={isDark} cardBg={cardBg} mutedText={mutedText} />;
  }
  if (item.type === "friend_activity") {
    return <FriendActivityCard item={item} isDark={isDark} cardBg={cardBg} mutedText={mutedText} />;
  }
  // Generic event card
  if (item.type === "event") {
    const data = item.data ?? {};
    return (
      <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors duration-300`}>
        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Event</span>
        <h4 className={`font-semibold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>{data.name || "Event"}</h4>
        {data.location && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${mutedText}`}>
            <MapPin size={12} /> {data.location}
          </p>
        )}
      </div>
    );
  }
  return null;
}

/* ─── Main Page ─── */

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userStories, setUserStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isViewingStory, setIsViewingStory] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const fileInputRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Get current story based on index
  const currentStory = userStories[currentStoryIndex] || null;

  // Refresh story when returning from story upload
  useEffect(() => {
    const storyUploaded = searchParams.get("storyUploaded");
    if (storyUploaded === "true") {
      console.log("[HomePage] Story uploaded, refreshing...");
      router.replace("/home");
      
      // Refresh user data and stories
      const refreshStory = async () => {
        try {
          const res = await userService.getMe();
          const profile = res?.data?.data || res?.data;
          if (profile?._id) {
            const result = await getMyStory(profile._id);
            let userStoriesArray = [];
            if (Array.isArray(result)) {
              userStoriesArray = result;
            } else if (result) {
              userStoriesArray = [result];
            }
            // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
            const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
            console.log("[HomePage] Sorted stories (ASC):", sortedStories.map(s => s.createdAt));
            setUserStories(sortedStories);
          }
        } catch (err) {
          console.log("[HomePage] Error refreshing story:", err.message);
        }
      };
      refreshStory();
    }
  }, [searchParams, router]);

  // Fetch user profile and stories on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userService.getMe();
        const profile = res?.data?.data || res?.data;
        console.log("[HomePage] User profile loaded:", profile);
        
        if (profile) {
          setUserProfile({
            _id: profile._id,
            profile_image_url: profile.profile_image_url,
            profile_photos: profile.profile_photos,
            full_name: profile.full_name,
            username: profile.username
          });
          
          // Fetch user's stories
          try {
            const result = await getMyStory(profile._id);
            let userStoriesArray = [];
            if (Array.isArray(result)) {
              userStoriesArray = result;
            } else if (result) {
              userStoriesArray = [result];
            }
            // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
            const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
            console.log("[HomePage] User stories loaded (sorted ASC):", sortedStories.map(s => s.createdAt));
            setUserStories(sortedStories);
          } catch (storyErr) {
            console.log("[HomePage] Error fetching stories:", storyErr.message);
          }
        }
      } catch (err) {
        console.log("[HomePage] Error fetching user data:", err.message);
      }
    };
    fetchUserData();
  }, []);

  const {
    feedItems,
    followingFeedItems,
    suggestedFollows,
    nearbyVenues,
    profileCard,
    userData,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    fetchUserProfile,
  } = useFeed();

  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";
  const iconBtn = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";

  const openUploadModal = () => {
    // Navigate to the dedicated create-story page
    router.push("/home/create-story");
  };
  const closeUploadModal = () => setIsUploadModalOpen(false);

  // Handle viewing own story
  const handleViewOwnStory = () => {
    if (userStories.length > 0) {
      // Always start from index 0 (first/oldest story) - Instagram-style
      setCurrentStoryIndex(0);
      setIsViewingStory(true);
    } else {
      openUploadModal();
    }
  };

  // Close story viewer
  const closeStoryViewer = () => {
    setIsViewingStory(false);
    setCurrentStoryIndex(0);
  };

  // Navigate to next story
  const goToNextStory = () => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Already at the last story, close the viewer
      closeStoryViewer();
    }
  };

  // Navigate to previous story
  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
    // If already at index 0, do nothing (stay on first story)
  };

  const handleSelectFromComputer = () => fileInputRef?.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { console.log("Selected file:", file); closeUploadModal(); }
  };

  return (
    <>
      <div className=" flex  space-x-10 ">

        {/* ── Feed Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stories row */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Your Story */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full p-[2px] cursor-pointer hover:opacity-80 transition-opacity ${
                    (userStories.length > 0)
                      ? "bg-gradient-to-tr from-purple-500 to-orange-500"
                      : "bg-gray-300"
                  }`}
                  onClick={() => {
                    if (userStories.length > 0) {
                      handleViewOwnStory();
                    } else {
                      openUploadModal();
                    }
                  }}
                >
                  <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                    {/* Show user profile photo by default - not story */}
                    {userProfile?.profile_photos?.[0]?.url || userProfile?.profile_image_url ? (
                      <img 
                        src={userProfile.profile_photos?.[0]?.url || userProfile.profile_image_url || "/loginAvatars/profile.png"} 
                        alt={userProfile.full_name || "Profile"} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Image size={24} className={mutedText} />
                    )}
                  </div>
                </div>
                {/* Plus Icon - Opens Upload Modal for creating story */}
                <div 
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    openUploadModal();
                  }}
                  title="Add Story"
                >
                  <Plus size={16} className="text-black" />
                </div>
              </div>
              <span className={`text-xs mt-2 ${mutedText}`}>Your Story</span>
            </div>

     

{suggestedFollows.slice(0, 5).map((u, index) => (
  <div key={u.user_id || index} className="flex flex-col items-center shrink-0">
    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 p-[2px]">
      {u.profile_image_url ? (
        <img
          src={u.profile_image_url}
          alt={u.full_name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
          {u.full_name?.charAt(0)}
        </div>
      )}
    </div>
    <p className="text-xs mt-1">{u.full_name}</p>
  </div>
))}

          </div>

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeUploadModal}>
              <div className="bg-white rounded-xl p-8 w-[400px] text-center relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeUploadModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 hover:border-purple-500 transition-colors cursor-pointer">
                  <Image size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Drag photos and videos here</p>
                </div>
                <button onClick={handleSelectFromComputer} className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full">
                  Select from computer
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          )}

          {/* Own Story Viewer Modal */}
          <OwnStoryViewerModal
            isOpen={isViewingStory}
            stories={userStories}
            currentIndex={currentStoryIndex}
            onClose={closeStoryViewer}
            onNext={goToNextStory}
            onPrev={goToPrevStory}
          />

          {/* Profile Completion Card - from Feed API */}
          {profileCard?.enabled && (
            <ProfileCompletionCard 
              profileCard={profileCard} 
              userData={userData}
              onRefresh={async () => {
                await fetchUserProfile();
                await refresh();
              }}
            />
          )}

          {/* Refresh button */}
          <div className="flex justify-end">
            <button
              onClick={refresh}
              disabled={loading}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${isDark ? "bg-[#1a1a2e] hover:bg-[#252542] text-gray-300" : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"}`}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Feed
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className={`rounded-xl p-4 border text-sm ${isDark ? "bg-red-900/20 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
              ⚠️ {error} —{" "}
              <button className="underline" onClick={refresh}>Try again</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`rounded-xl p-4 animate-pulse ${cardBg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-3 rounded w-32 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                      <div className={`h-2 rounded w-20 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                    </div>
                  </div>
                  <div className={`h-48 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                </div>
              ))}
            </div>
          )}

          {/* Real feed items - Following Feed (new API) */}
          {!loading && followingFeedItems.length > 0 && (
            <div className="max-w-[470px] mx-auto space-y-6">
              {followingFeedItems.map((item, idx) => (
                <PostCard
                  key={item?.data?.content_id || item?.data?.post_id || idx}
                  post={item}
                  isDark={isDark}
                  cardBg={cardBg}
                  mutedText={mutedText}
                  iconBtn={iconBtn}
                />
              ))}
            </div>
          )}

          {/* Real feed items - Original feed */}
          {!loading && feedItems.length > 0 && (
            <div className="max-w-[470px] mx-auto space-y-6">
              {feedItems.map((item, idx) => (
                <FeedItemRenderer
                  key={item?.data?.post_id || item?.data?.venue_id || idx}
                  item={item}
                  isDark={isDark}
                  cardBg={cardBg}
                  mutedText={mutedText}
                  iconBtn={iconBtn}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && feedItems.length === 0 && followingFeedItems.length === 0 && !error && (
            <div className={`rounded-xl p-10 text-center ${cardBg}`}>
              <div className="text-5xl mb-4">🏃</div>
              <h3 className={`font-semibold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                Your feed is empty
              </h3>
              <p className={`text-sm ${mutedText}`}>Follow players to see their activity here</p>
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border font-medium text-sm transition-colors flex items-center justify-center gap-2
                disabled:opacity-60
                bg-gradient-to-r from-purple-600/10 to-orange-500/10
                hover:from-purple-600/20 hover:to-orange-500/20
                border-purple-500/30 text-purple-500"
            >
              {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : "Load more"}
            </button>
          )}

          {/* Nearby Venues section (from feed API) */}
          {nearbyVenues.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Nearby Venues
              </h3>
              <div className="space-y-4">
                {nearbyVenues.slice(0, 3).map((venue, i) => (
                  <VenueCard key={venue.venue_id || i} venue={venue} isDark={isDark} cardBg={cardBg} mutedText={mutedText} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Right Panel ── */}
        <div className="hidden lg:block ">
          <div className="sticky top-0 h-[calc(100vh-9rem)] overflow-y-auto pr-1 custom-scrollbar space-y-6">

            {/* Suggested follows from feed API */}
            {suggestedFollows.length > 0 && (
              <div className={`${cardBg} rounded-xl p-4`}>
                <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Suggested for you
                </h3>
                <div className="space-y-3">
                  {suggestedFollows.slice(0, 6).map((u) => (
                    <div key={u.user_id} className="flex items-center gap-3">
                      {u.profile_image_url ? (
                        <img src={u.profile_image_url} alt={u.full_name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {u.full_name}
                        </p>
                        {u.username && (
                          <p className={`text-xs truncate ${mutedText}`}>@{u.username}</p>
                        )}
                        {u.mutual_connections > 0 && (
                          <p className={`text-xs ${mutedText}`}>{u.mutual_connections} mutual</p>
                        )}
                      </div>
                      <button className="text-xs font-semibold text-purple-500 hover:text-purple-400 shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to existing SuggestedUsers if API returned nothing */}
            {suggestedFollows.length === 0 && <SuggestedUsers />}

          </div>
        </div>

      </div>
    </>
  );
}
