"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle, Heart, Send, ShoppingCart, MapPin,
  Users, Image, X, RefreshCw, Loader2, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { getMyStory, getStoryFeed } from "@/app/user/homefeed";
import { getUserProfile } from "@/services/profile.service";
import userService from "@/services/user";
import ProfileCompletionCard from "@/app/components/profileCompletion/ProfileCompletionCard";
import { useTheme } from "@/lib/ThemeContext";
import SuggestedUsers from "./components/SuggestedUsers";
import useFeed from "@/hooks/useFeed";

/* ─── Small helper components ─── */

function PostCard({ post, isDark, cardBg, mutedText, iconBtn }) {
  const [liked, setLiked] = useState(false);
  const author = post.author ?? {};
  const content = post.data?.content ?? post.content ?? {};
  const media = post.data?.media ?? post.media ?? [];
  const likesCount = post.data?.likes_count ?? post.likes_count ?? 0;
  const commentsCount = post.data?.comments_count ?? post.comments_count ?? 0;

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
      </div>

      {/* Media */}
      {media.length > 0 && (
        <div className="relative aspect-video">
          {media[0].type === "video" ? (
            <video src={media[0].url} controls className="w-full h-full object-cover" />
          ) : (
            <img src={media[0].url} alt="post media" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Text */}
      {content.text && (
        <p className={`px-4 py-3 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {content.text}
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
            className={`flex items-center gap-1.5 transition-colors ${liked ? "text-pink-500" : iconBtn}`}
          >
            <Heart size={18} className={liked ? "fill-pink-500" : ""} />
            <span>{liked ? likesCount + 1 : likesCount}</span>
          </button>
          <button className={`flex items-center gap-1.5 transition-colors ${iconBtn}`}>
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
          </button>
        </div>
        <button className={`flex items-center gap-1.5 transition-colors ${iconBtn}`}>
          <Send size={18} />
        </button>
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
      // Remove the query param without refreshing
      router.replace("/home");
      
      // Refresh user data and stories
      const refreshStory = async () => {
        try {
          const res = await userService.getMe();
          const profile = res?.data?.data || res?.data;
          if (profile?._id) {
            // Only use /stories/me endpoint
            const result = await getMyStory(profile._id);
            
            // Handle both single story and array
            let userStoriesArray = [];
            if (Array.isArray(result)) {
              userStoriesArray = result;
            } else if (result) {
              userStoriesArray = [result];
            }
            
            console.log("[HomePage] Stories refreshed:", userStoriesArray);
            setUserStories(userStoriesArray);
          }
        } catch (err) {
          console.log("[HomePage] Error refreshing story:", err.message);
        }
      };
      refreshStory();
    }
  }, [searchParams, router]);

  const {
    feedItems,
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

  // Fetch user's story and profile on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile using getMe (same as profile page)
        try {
          const res = await userService.getMe();
          const profile = res?.data?.data || res?.data;
          console.log("[HomePage] User profile loaded:", profile);
          console.log("[HomePage] profile._id:", profile?._id);
          console.log("[HomePage] profile_photos:", profile?.profile_photos);
          console.log("[HomePage] profile_image_url:", profile?.profile_image_url);
          
          // Update userProfile state with profile info
          if (profile) {
            setUserProfile({
              _id: profile._id,
              profile_image_url: profile.profile_image_url,
              profile_photos: profile.profile_photos,
              full_name: profile.full_name,
              username: profile.username
            });
            
            // Fetch user's stories using profile._id directly
            const userId = profile._id;
            console.log("[HomePage] Fetching stories with userId:", userId);
            
            try {
              // Use getMyStory - it may return single story or array
              const result = await getMyStory(userId);
              
              // Handle both single story and array of stories
              let userStoriesArray = [];
              if (Array.isArray(result)) {
                userStoriesArray = result;
              } else if (result) {
                userStoriesArray = [result];
              }
              
              console.log("[HomePage] User stories loaded:", userStoriesArray);
              setUserStories(userStoriesArray);
            } catch (storyErr) {
              console.log("[HomePage] Error fetching stories:", storyErr.message);
              setUserStories([]);
            }
          }
        } catch (profileErr) {
          console.log("[HomePage] Profile fetch error:", profileErr.message);
        }
      } catch (err) {
        console.log("[HomePage] Error fetching user data:", err.message);
        setUserStories([]);
      }
    };
    fetchUserData();
  }, []);

  // Handle viewing own story
  const handleViewOwnStory = () => {
    if (userStories.length > 0) {
      setCurrentStoryIndex(0);
      setIsViewingStory(true);
    } else {
      // If no story, open upload modal
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
      // If at last story, close viewer
      closeStoryViewer();
    }
  };

  // Navigate to previous story
  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
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
                      handleViewOwnStory(); // view story
                    } else {
                      openUploadModal(); // upload story
                    }
                  }}
                >
                  <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                    {userStories.length > 0 && userStories[0]?.media?.url || userStories[0]?.media_url ? (
                      <img 
                        src={userStories[0].media?.url || userStories[0].media_url} 
                        alt="Your Story" 
                        className="w-full h-full object-cover" 
                      />
                    ) : userProfile?.profile_photos?.[0]?.url || userProfile?.profile_image_url ? (
                      <img 
                        src={userProfile.profile_photos?.[0]?.url || userProfile.profile_image_url} 
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
          {isViewingStory && currentStory && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeStoryViewer}>
              <div 
                className="relative rounded-2xl overflow-hidden max-w-[500px] w-full mx-4" 
                onClick={(e) => e.stopPropagation()}
              >
                {/* Story Image/Video - Handle both API formats */}
                {(currentStory.media?.type || currentStory.media_type) === "video" ? (
                  <video 
                    src={currentStory.media?.url || currentStory.media_url} 
                    controls 
                    className="w-full h-[550px]s object-contain bg-black py-8  "
                  />
                ) : (
                  <img 
                    src={currentStory.media?.url || currentStory.media_url} 
                    alt="Your Story" 
                    className="w-full h-[550px] object-contain bg-black py-8 px-14 "
                  />
                )}
                
                {/* Close button */}
                <button 
                  onClick={closeStoryViewer}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                >
                  <X size={20} />
                </button>
                
                {/* Left Arrow - Previous Story */}
                {currentStoryIndex > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                
                {/* Right Arrow - Next Story */}
                {currentStoryIndex < userStories.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
                
                {/* Story Progress Indicator */}
                {userStories.length > 1 && (
                  <div className="absolute top-4 left-4 right-4 flex gap-1">
                    {userStories.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          idx < currentStoryIndex 
                            ? "bg-white" 
                            : idx === currentStoryIndex 
                              ? "bg-white" 
                              : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Story info */}
                {currentStory.caption && (
                  <div className="absolute bottom-16 left-0 right-0 text-center px-4">
                    <p className="text-white text-sm bg-black/50 rounded-md py-2 px-4 inline-block">
                      {currentStory.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Real feed items */}
          {!loading && feedItems.length > 0 && (
            <div className="space-y-6">
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
          {!loading && feedItems.length === 0 && !error && (
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
