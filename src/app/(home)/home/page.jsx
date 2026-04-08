 "use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle, Heart, Send, ShoppingCart, MapPin,
  Users, Image, X, RefreshCw, Loader2, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { getMyStory, getStoryFeed, sortStoriesByCreatedAtASC, sortStoryGroupsByLatestFirst } from "@/app/user/homefeed";
import { toggleLike } from "@/app/user/homefeed";
import userService from "@/services/user";
import ProfileCompletionCard from "@/app/components/profileCompletion/ProfileCompletionCard";
import { useTheme } from "@/lib/ThemeContext";
import SuggestedUsers from "./components/SuggestedUsers";
import OwnStoryViewerModal from "./profile/story";
import UserStory from "./profile/user-story";
import UserPostDetailModal from "./components/UserPostDetailModal";
import SharePopup from "./components/sharepopup";
import useFeed from "@/hooks/useFeed";
import { Volume2 } from "lucide-react";
import { useFeedRefresh } from "@/context/FeedRefreshContext";
import { addBookmark, checkBookmark, removeBookmark, createCollection, getCollections, addToCollection } from "@/app/user/share";
import CreateCollectionPopup from "./components/CreateCollection";
import ThreeDotButton from "./components/ThreeDotButton";
// import TeamChat from "./components/TeamChat";

/* ─── Small helper components ─── */

function PostCard({ post, isDark, cardBg, mutedText, iconBtn, onCommentClick, onShareClick, onSaveClick, onUserClick, isBookmarked, onRefresh }) {
  // Initialize liked state from post data - check if user already liked this post
  const postIsLiked = post?.is_liked === true || 
                       post?.is_liked === "true" || 
                       post?.data?.is_liked === true || 
                       post?.data?.is_liked === "true" || 
                       post?.user_action?.liked_by_you === true ||
                       post?.data?.user_action?.liked_by_you === true;
  
  const [liked, setLiked] = useState(postIsLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const videoRef = useRef(null);


  const [isMuted, setIsMuted] = useState(true);



  useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (videoRef.current) {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    },
    { threshold: 0.7 }
  );

  if (videoRef.current) {
    observer.observe(videoRef.current);
  }

  return () => {
    if (videoRef.current) observer.unobserve(videoRef.current);
  };
}, []);

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
  const sharesCount = engagement?.shares_count ?? post.data?.shares_count ?? post.shares_count ?? 0;
  const savesCount = engagement?.saves_count ?? 0;
  const isLikedByYou = userAction?.liked_by_you ?? liked;
  const isSavedByYou = userAction?.saved_by_you ?? false;
  const contentType = post.data?.content_type ?? post.content_type ?? 'post';
  const postId = post?.data?.content_id || post?.data?.post_id || post?.post_id || post?._id || post?.id;

  return (
    <div className={`${cardBg} rounded-xl overflow-hidden shadow-sm transition-colors duration-300 relative`}>
      {/* Author row */}
     <div 
        className="flex  gap-3 px-4 py-3 cursor-pointer hover:opacity-80"
        onClick={() => onUserClick && onUserClick(post)}
      >
  <img
    src={author.profile_image_url}
    className="w-10 h-10 rounded-2xl object-cover"
  />
  <div>
    {/* <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
      {author.full_name}
    </h4> */}
    <h4 className={`text-sm font-semibold font-Poppins ${isDark ? "text-white" : "text-black "}`}>
      {author.username}
    </h4>


      {/* Location */}
     {content.location?.display_text && (
  <p className={`text-sm flex items-center gap-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
    <MapPin size={14} /> {content.location.display_text}
  </p>
)}


  </div>
</div>

      {/* Three Dot Button for Report */}
      <div className="absolute top-3 right-3 z-10">
        <ThreeDotButton 
          targetId={postId} 
          targetType={contentType === 'reel' ? 'reel' : 'post'}
          userId={author?.user_id || author?._id}
        />
      </div>

      {/* Media - Instagram-style: maintain original aspect ratio, no stretching */}
     {/* {media.length > 0 && (
 <div className="w-full h-[400px] px-3 py-3 flex justify-center items-center ">
    {media[0].type === "video" ? (
      <video
        src={media[0].url}
        controls
        className="w-full h-full "
      />
    ) : (
     <img
  src={media[0].url}
  alt="post media"
  className="w-a h-full  "
/>
    )}
  </div>
)} */}

{media.length > 0 && (
  <div className="relative w-full h-auto px-3 py-3 flex justify-center items-center">
    {media[0].type === "video" ? (
      <>
        <video
          ref={videoRef}
          src={media[0].url}
          className="w-auto h-[480px] rounded-xl "
          autoPlay
          loop
          muted={isMuted}
          playsInline
          controls={false}
          onClick={() => {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }}
        />

        {/* 🔊 Sound button only */}
      <button
  onClick={(e) => {
    e.stopPropagation();
    setIsMuted(m => !m);
  }}
  className="absolute bottom-3 right-5 bg-black/60 text-white p-2 rounded-full flex items-center justify-center"
>
  <div className="relative">
    
    {/* 🔊 Sound Icon */}
    <Volume2 size={18} />

    {/* 🔇 Backslash "\" when muted */}
    {isMuted && (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-[2px] h-5 bg-white rotate-[-45deg]"></span>
      </span>
    )}

  </div>
</button>
      </>
    ) : (
      <img
        src={media[0].url}
        alt="post media"
        className="w-[400px] h-[490px] object-cover  rounded-xl "
      />
    )}
  </div>
)}

    <div className="flex mb-2"> 
  {/* Text */}
     {content.text && (
  <p className={` text-[16px] px-4 font-normal font-sans ${isDark ? "text-white" : "text-gray-800 "}`}>
    {content.text}
  </p>
)}


      {/* Hashtags */}
     {content.hashtags && content.hashtags.length > 0 && (
  <p className={`px-4  text-[16px] font-sans ${isDark ? "text-blue-400" : "text-blue-500"}`}>
    {content.hashtags.map(tag => `#${tag}`).join(' ')}
  </p>
)}
</div>
      {/* Actions */}
   <div className="flex justify-between items-center px-4 pb-4 mt-auto">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-6">

    {/* ❤️ Like */}
    <button
      onClick={async () => {
        if (likeLoading) return;
        
        // Get post ID - check multiple sources
        const postId = post?.data?.content_id || post?.data?.post_id || post?.post_id || post?._id || post?.id;
        
        // Optimistic update - immediately toggle the UI
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikeLoading(true);
        
        try {
          // Call the toggle like API
          const result = await toggleLike("post", postId, "like");
          console.log("[PostCard] Like toggle result:", result);

          // Update state based on API response (if available)
          if (result && result.liked !== undefined) {
            setLiked(result.liked);
          }

          // Refresh the feed to ensure like status is updated in the data
          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error("[PostCard] Error toggling like:", error);
          // Revert on error
          setLiked(!newLikedState);
        } finally {
          setLikeLoading(false);
        }
      }}
      disabled={likeLoading}
      className={`${liked ? "text-pink-500" : isDark ? "text-white" : "text-black"} flex items-center gap-2 ${likeLoading ? 'opacity-50' : ''}`}
    >
      <Heart size={20} className={liked ? "fill-pink-500" : ""} />
      <span className="text-sm font-semibold">
        {liked ? likesCount + 1 : likesCount}
      </span>
    </button>

    {/* 💬 Comment */}
    <button 
      onClick={() => onCommentClick && onCommentClick(post)}
      className={`${isDark ? "text-white" : "text-black"} flex items-center gap-2`}
    >
      <MessageCircle size={20} />
      <span className="text-sm font-semibold">{commentsCount}</span>
    </button>

    {/* 📤 Share (moved LEFT) */}
   <button 
  onClick={() => onShareClick && onShareClick(post)}
  className={`${isDark ? "text-white" : "text-black"} flex items-center gap-2`}
>
  <Send size={20} />
  <span className="text-sm font-semibold">{sharesCount}</span>
</button>

  </div>

  {/* RIGHT SIDE */}
  
  <button 
    onClick={() => onSaveClick && onSaveClick(post)}
    className={`${isDark ? "text-white" : "text-black"}`}>
    {/* 🔖 Save */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill={isBookmarked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      className={isBookmarked ? "text-purple-500" : ""}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  </button>

</div>
    </div>
  );
}

function VenueCard({ venue, isDark, cardBg, mutedText }) {
  return (
   <div className={`${cardBg} rounded-xl shadow-sm w-[450px] h-[400px] overflow-hidden flex flex-col`}>
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

function FeedItemRenderer({ item, isDark, cardBg, mutedText, iconBtn, onCommentClick, onShareClick, onUserClick, onRefresh }) {
  if (!item) return null;
  if (item.type === "post") {
    return <PostCard post={item} isDark={isDark} cardBg={cardBg} mutedText={mutedText} iconBtn={iconBtn} onCommentClick={onCommentClick} onShareClick={onShareClick} onUserClick={onUserClick} onRefresh={onRefresh} />;
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

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userStories, setUserStories] = useState([]);
  const [storyAuthor, setStoryAuthor] = useState(null);
  const [followerStories, setFollowerStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isViewingStory, setIsViewingStory] = useState(false);
  const [userProfile, setUserProfile] = useState({});  
  const [viewingFollowerStory, setViewingFollowerStory] = useState(false);
  const [followerStoryIndex, setFollowerStoryIndex] = useState(0);
  const [selectedFollowerProfile, setSelectedFollowerProfile] = useState(null);
  const [viewedStoryUserIds, setViewedStoryUserIds] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewedStoryUserIds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [selectedPostForBookmark, setSelectedPostForBookmark] = useState(null);
  const [showCollectionPopup, setShowCollectionPopup] = useState(false);
  const [postBookmarkStatus, setPostBookmarkStatus] = useState({}); // Track bookmark status per post
  const [bookmarkId, setBookmarkId] = useState(null);
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
            let authorData = null;

            // Handle new return format: { stories: [], author: {} }
            if (result && result.stories) {
              userStoriesArray = result.stories;
              authorData = result.author || null;
            } else if (Array.isArray(result)) {
              // Handle old format (direct array)
              userStoriesArray = result;
            } else if (result) {
              userStoriesArray = [result];
            }

            // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
            const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
            console.log("[HomePage] Sorted stories (ASC):", sortedStories.map(s => s.createdAt));
            console.log("[HomePage] Author data:", authorData);
            
            // Set author data
            if (authorData) {
              setStoryAuthor(authorData);
            }
            setUserStories(sortedStories);
          }
        } catch (err) {
          console.log("[HomePage] Error refreshing story:", err.message);
        }
      };
      refreshStory();
    }
  }, [searchParams, router]);

  // Save viewed story user IDs to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && viewedStoryUserIds.length > 0) {
      localStorage.setItem('viewedStoryUserIds', JSON.stringify(viewedStoryUserIds));
    }
  }, [viewedStoryUserIds]);

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
            let authorData = null;

            // Handle new return format: { stories: [], author: {} }
            if (result && result.stories) {
              userStoriesArray = result.stories;
              authorData = result.author || null;
            } else if (Array.isArray(result)) {
              // Handle old format (direct array)
              userStoriesArray = result;
            } else if (result) {
              userStoriesArray = [result];
            }

            // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
            const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
            console.log("[HomePage] User stories loaded (sorted ASC):", sortedStories.map(s => s.createdAt));
            console.log("[HomePage] Author data:", authorData);
            setUserStories(sortedStories);
            
            // Set author data
            if (authorData) {
              setStoryAuthor(authorData);
            }
          } catch (storyErr) {
            console.log("[HomePage] Error fetching stories:", storyErr.message);
          }

          // Fetch follower/following stories
          try {
            const storyFeedResult = await getStoryFeed(20);
            console.log("[HomePage] Story feed response:", storyFeedResult);
            console.log("[HomePage] Story feed items:", storyFeedResult?.items);
            if (storyFeedResult?.items && Array.isArray(storyFeedResult.items)) {
              // Already sorted by latest first from the API
              const followerStoriesData = storyFeedResult.items;
              console.log("[HomePage] Follower stories loaded:", followerStoriesData.length);
              setFollowerStories(followerStoriesData);
            } else {
              console.log("[HomePage] No follower stories found or invalid format");
            }
          } catch (followerStoryErr) {
            console.log("[HomePage] Error fetching follower stories:", followerStoryErr.message);
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

  // Listen for feed refresh triggers from Sidebar
  const { refreshTrigger } = useFeedRefresh();

  // Trigger feed refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("[HomePage] Feed refresh triggered");
      refresh();
    }
  }, [refreshTrigger, refresh]);

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



  // Close follower story viewer
  const closeFollowerStoryViewer = () => {
    if (selectedFollowerProfile?._id && !viewedStoryUserIds.includes(selectedFollowerProfile._id)) {
      setViewedStoryUserIds(prev => [...prev, selectedFollowerProfile._id]);
      console.log('[HomePage] User story viewed successfully:', selectedFollowerProfile._id, 'Username:', selectedFollowerProfile.username);
    }
    setViewingFollowerStory(false);
    setFollowerStoryIndex(0);
  };

  // Navigate to next follower story
  const goToNextFollowerStory = () => {
    const currentUserStories = followerStories[followerStoryIndex]?.stories || [];
    // For now, just close the viewer - can be enhanced to view all stories in sequence
    closeFollowerStoryViewer();
  };

  // Navigate to previous follower story
  const goToPrevFollowerStory = () => {
    if (followerStoryIndex > 0) {
      setFollowerStoryIndex(followerStoryIndex - 1);
    }
  };

  // Handle opening post detail modal on comment click
  const handleCommentClick = (post) => {
    console.log("Opening post detail for comment:", post);
    
    // Transform post data to match UserPostDetailModal expected format
    const transformedPost = {
      post_id: post?.data?.content_id || post?.data?.post_id || post?.post_id || post?._id || post?.id,
      content_type: post?.data?.content_type || post?.content_type || 'post',
      author: post?.data?.author || post?.author || {},
      content: post?.data?.content || post?.content || {},
      media: post?.data?.media || post?.media || [],
      engagement: post?.data?.engagement || post?.engagement || {},
      likes_count: post?.data?.engagement?.likes_count || post?.data?.likes_count || post?.likes_count || 0,
      comments_count: post?.data?.engagement?.comments_count || post?.data?.comments_count || post?.comments_count || 0,
      comments: post?.data?.comments || post?.comments || [],
      is_liked: post?.data?.user_action?.liked_by_you || post?.is_liked || false,
      created_at: post?.data?.created_at || post?.created_at,
    };
    
    setSelectedPost(transformedPost);
    setIsPostDetailOpen(true);
  };

  // Close post detail modal
  const closePostDetail = () => {
    setIsPostDetailOpen(false);
    setSelectedPost(null);
  };

  // Handle opening share popup
  const handleShareClick = (post) => {
    console.log("Opening share for post:", post);
    const postId = post?.data?.content_id || post?.data?.post_id || post?.post_id || post?._id || post?.id;
    setSharePost({
      contentId: postId,
      contentType: post?.data?.content_type || post?.content_type || 'post',
      thumbnail: post?.data?.media?.[0]?.url || post?.media?.[0]?.url || null,
      title: post?.data?.content?.text || post?.content?.text || null,
    });
    // Get share count from engagement
    const count = post?.data?.engagement?.shares_count || post?.shares_count || 0;
    setShareCount(count);
    setIsShareOpen(true);
  };

  // Handle share success
  const handleShareSuccess = () => {
    setShareCount(prev => prev + 1);
  };

  // Handle save/bookmark click
  const handleSaveClick = async (post) => {
    console.log("Save clicked for post:", post);
    try {
      const contentId = post?.data?.content_id || post?.data?.post_id || post?.post_id || post?._id || post?.id;
      const contentType = post?.data?.content_type || post?.content_type || 'post';
      
      // Check current status
      const currentStatus = postBookmarkStatus[contentId] || false;
      
      if (currentStatus) {
        // Already bookmarked - remove from bookmarks
        const { removeBookmark, checkBookmark } = await import("@/app/user/share");
        const checkResult = await checkBookmark(contentId, contentType);
        if (checkResult?.bookmark_id) {
          await removeBookmark(checkResult.bookmark_id);
          setPostBookmarkStatus(prev => ({ ...prev, [contentId]: false }));
        }
      } else {
        // Not bookmarked - save to All Bookmarks AND show popup for collection
        const { addBookmark, checkBookmark } = await import("@/app/user/share");
        
        // Check if already bookmarked
        const checkResult = await checkBookmark(contentId, contentType);
        if (checkResult?.bookmarked) {
          // Already bookmarked - just update status and show popup
          setPostBookmarkStatus(prev => ({ ...prev, [contentId]: true }));
          setSelectedPostForBookmark(post);
          setShowCollectionPopup(true);
          return;
        }
        
        // Create new bookmark
        const bookmarkResult = await addBookmark(contentType, contentId);
        console.log("Saved to bookmarks:", bookmarkResult);
        setPostBookmarkStatus(prev => ({ ...prev, [contentId]: true }));
        
        // Show popup to optionally add to collection
        setSelectedPostForBookmark(post);
        setShowCollectionPopup(true);
      }
    } catch (error) {
      console.error("Failed to handle save:", error);
    }
  };

  // Check if post is bookmarked (for initial load)
  const checkPostBookmarkStatus = async (contentId, contentType) => {
    try {
      const { checkBookmark } = await import("@/app/user/share");
      const result = await checkBookmark(contentId, contentType);
      return result?.bookmarked || false;
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
      return false;
    }
  };

  // Close share popup
  const closeSharePopup = () => {
    setIsShareOpen(false);
    setSharePost(null);
  };

  // Handle user click - navigate to profile
  const handleUserClick = (post) => {
    const userId = post?.data?.author?.user_id || post?.data?.author?._id || post?.author?.user_id || post?.author?._id;
    if (userId) {
      router.push(`/home/profile/${userId}`);
    }
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
    <div className="flex items-start gap-8 lg:px-14 px-3 max-w-[1000px] mx-auto w-full">

        {/* ── Feed Column ── */}
        <div className="flex-1 max-w-[470px] space-y-6">

          {/* Stories row */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Your Story */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-2xl p-[2px] cursor-pointer hover:opacity-80 transition-opacity ${
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
                  <div className={`w-full h-full rounded-2xl overflow-hidden flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
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

     

{followerStories.slice(0, 5).map((storyGroup, index) => (
  <div key={storyGroup.user?.user_id || index} className="flex flex-col items-center shrink-0">
    
    <UserStory
      userId={storyGroup.user?.user_id}
      profile={{
        _id: storyGroup.user?.user_id,
        full_name: storyGroup.user?.full_name,
        username: storyGroup.user?.username,
        profile_image_url: storyGroup.user?.profile_image_url
      }}
      ringColor="bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500"
      viewedStoryIds={viewedStoryUserIds}
      storyVisibility={storyGroup.user?.story_visibility || "public"}
      onStoryView={(viewedUserId) => {
        if (!viewedStoryUserIds.includes(viewedUserId)) {
          setViewedStoryUserIds(prev => [...prev, viewedUserId]);
        }
      }}
    />

    <p className="text-xs mt-1">{storyGroup.user?.full_name}</p>
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
            initialProfile={storyAuthor}
          />

          {/* Follower Story Viewer - Using UserStory Component */}
          {viewingFollowerStory && selectedFollowerProfile && (
            <UserStory 
              userId={selectedFollowerProfile._id} 
              profile={selectedFollowerProfile}
              showRing={true}
              ringColor="bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500"
              viewedStoryIds={viewedStoryUserIds}
              storyVisibility={selectedFollowerProfile?.story_visibility || "public"}
              onStoryView={(viewedUserId) => {
                console.log('[HomePage] User story viewed successfully:', viewedUserId);
                if (!viewedStoryUserIds.includes(viewedUserId)) {
                  setViewedStoryUserIds(prev => [...prev, viewedUserId]);
                }
              }}
            />
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
          {/* <div className="flex justify-end">
            <button
              onClick={refresh}
              disabled={loading}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${isDark ? "bg-[#1a1a2e] hover:bg-[#252542] text-gray-300" : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"}`}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Feed
            </button>
          </div> */}

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
                  onCommentClick={handleCommentClick}
                  onShareClick={handleShareClick}
                  onSaveClick={handleSaveClick}
                  onUserClick={handleUserClick}
                  isBookmarked={postBookmarkStatus[item?.data?.content_id || item?.data?.post_id] || false}
                  onRefresh={refresh}
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
                  onCommentClick={handleCommentClick}
                  onShareClick={handleShareClick}
                  onUserClick={handleUserClick}
                  onRefresh={refresh}
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
        <div className="hidden lg:flex flex-col w-[320px] shrink-0">
          <div className="sticky top-6 space-y-6">

            {/* Suggested follows from feed API */}
            {suggestedFollows.length > 0 && (
              <div className={`${cardBg} rounded-xl p-4`}>
                <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Suggested for you
                </h3>
                <div className="space-y-3">
                  {suggestedFollows.slice(0, 6).map((u, index) => (
                    <div key={u.user_id || `suggested-${index}`} className="flex items-center gap-3">
                      {u.profile_image_url ? (
                        <img src={u.profile_image_url} alt={u.full_name} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500" />
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

      {/* User Post Detail Modal */}
      {isPostDetailOpen && selectedPost && (
        <UserPostDetailModal
          post={selectedPost}
          isLoading={false}
          onClose={closePostDetail}
          currentUser={userProfile}
        />
      )}

      {/* Share Popup */}
      <SharePopup
        isOpen={isShareOpen}
        onClose={closeSharePopup}
        contentType={sharePost?.contentType || "post"}
        contentId={sharePost?.contentId}
        thumbnail={sharePost?.thumbnail}
        title={sharePost?.title}
        onShareSuccess={handleShareSuccess}
      />

      {/* Create Collection Popup */}
      <CreateCollectionPopup
        isOpen={showCollectionPopup}
        onClose={() => {
          setShowCollectionPopup(false);
          setSelectedPostForBookmark(null);
          setBookmarkId(null);
        }}
        contentId={selectedPostForBookmark?.data?.content_id || selectedPostForBookmark?.data?.post_id || selectedPostForBookmark?.post_id || selectedPostForBookmark?._id || selectedPostForBookmark?.id}
        contentType={selectedPostForBookmark?.data?.content_type || selectedPostForBookmark?.content_type || 'post'}
        isDark={isDark}
        onSaveComplete={(saved) => {
          const contentId = selectedPostForBookmark?.data?.content_id || selectedPostForBookmark?.data?.post_id || selectedPostForBookmark?.post_id || selectedPostForBookmark?._id || selectedPostForBookmark?.id;
          if (saved && contentId) {
            setPostBookmarkStatus(prev => ({ ...prev, [contentId]: true }));
          }
        }}
      />

      {/* Team Chat */}
  
    </>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
