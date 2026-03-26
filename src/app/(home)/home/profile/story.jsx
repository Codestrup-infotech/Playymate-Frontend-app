"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Pause,
  Play,
  MoreHorizontal,
  Eye,
  MapPin
} from "lucide-react";

import { getMyStory, deleteStory, getStoryViewers } from "@/app/user/homefeed";
import { useRouter } from "next/navigation";

/**
 * useOwnStory - Custom hook to fetch and manage own stories
 */
export function useOwnStory(profile) {
  const [stories, setStories] = useState([]);
  const [hasStories, setHasStories] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const refreshStories = async () => {
    if (!profile?._id) return;

    setIsLoading(true);
    try {
      const result = await getMyStory(profile._id);

      let userStoriesArray = [];

      if (Array.isArray(result)) {
        userStoriesArray = result;
      } else if (result) {
        userStoriesArray = [result];
      }

      // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
      // This ensures first uploaded story is shown first
      const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
      console.log("[useOwnStory] Sorted stories (ASC):", sortedStories.map(s => s.createdAt));
      
      setStories(sortedStories);
      setHasStories(sortedStories.length > 0);
    } catch (err) {
      console.log("[useOwnStory] Error:", err.message);
      setStories([]);
      setHasStories(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?._id) refreshStories();
  }, [profile?._id]);

  return { stories, hasStories, isLoading, refreshStories };
}

/**
 * OwnStoryViewerModal
 */

export default function OwnStoryViewerModal( {
   isOpen: controlledIsOpen,
  stories: controlledStories,
  currentIndex: controlledIndex,
  onClose,
  onNext,
  onPrev,
  onOpenUpload,
  initialProfile
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalStories, setInternalStories] = useState([]);
  const [internalIndex, setInternalIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState(null);

    const router = useRouter();          // 👈 add here
  const [showMenu, setShowMenu] = useState(false);  // 👈 add here
  const [isDeleting, setIsDeleting] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Seen By feature
  const [showSeenBy, setShowSeenBy] = useState(false);
  const [seenByUsers, setSeenByUsers] = useState([]);
  const [isLoadingSeenBy, setIsLoadingSeenBy] = useState(false);

  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Progress bar duration - 5 seconds for images, video duration for videos
  const STORY_DURATION = 5000; // 5 seconds default

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}s`;
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString();
  };

  // Fetch story viewers
  const fetchStoryViewers = async () => {
    const storyId = currentStory?.story_id || currentStory?._id;
    console.log("[fetchStoryViewers] Story ID:", storyId);
    if (!storyId) return;
    
    setIsLoadingSeenBy(true);
    try {
      const viewers = await getStoryViewers(storyId, 50);
      console.log("[fetchStoryViewers] Raw API response:", viewers);
      console.log("[fetchStoryViewers] Type:", typeof viewers, "IsArray:", Array.isArray(viewers));
      
      // Handle different response structures the API might return
      let viewersList = [];
      
      if (!viewers) {
        viewersList = [];
      } else if (Array.isArray(viewers)) {
        // Direct array response: [{ user_id, username, profile_picture, viewed_at }]
        viewersList = viewers;
      } else if (typeof viewers === 'object') {
        // Check various possible response formats
        if (viewers.data && Array.isArray(viewers.data)) {
          viewersList = viewers.data;
        } else if (viewers.viewers && Array.isArray(viewers.viewers)) {
          viewersList = viewers.viewers;
        } else if (viewers.users && Array.isArray(viewers.users)) {
          viewersList = viewers.users;
        } else if (viewers.results && Array.isArray(viewers.results)) {
          viewersList = viewers.results;
        } else {
          // Single viewer object
          viewersList = [viewers];
        }
      }
      
      console.log("[fetchStoryViewers] Processed viewers:", viewersList);
      setSeenByUsers(viewersList || []);
    } catch (err) {
      console.log("[fetchStoryViewers] Error:", err.message);
      setSeenByUsers([]);
    } finally {
      setIsLoadingSeenBy(false);
    }
  };

  // Handle seen by click
  const handleSeenByClick = () => {
    setShowSeenBy(true);
    if (seenByUsers.length === 0) {
      fetchStoryViewers();
    }
  };

  // Delete story handler
  const handleDelete = async () => {
    // Use story_id (with 'story_' prefix) instead of _id
    const storyIdToDelete = currentStory?.story_id || currentStory?._id;
    if (!storyIdToDelete) return;
    
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const deleteApiUrl = `${API_BASE}/stories/${storyIdToDelete}`;
    console.log("[DELETE STORY API] URL:", deleteApiUrl);
    console.log("[DELETE STORY API] Method: DELETE");
    console.log("[DELETE STORY API] Story ID:", storyIdToDelete);
    
    setIsDeleting(true);
    try {
      await deleteStory(storyIdToDelete);
      
      // Remove the deleted story from the local state
      const updatedStories = stories.filter((_, idx) => idx !== currentIndex);
      
      if (isControlled && controlledStories) {
        // Update controlled stories
        if (onClose) {
          if (updatedStories.length === 0) {
            onClose();
          } else {
            onNext(); // Move to next story after delete
          }
        }
      } else {
        setInternalStories(updatedStories);
        
        if (updatedStories.length === 0) {
          closeStoryViewer();
        } else if (currentIndex >= updatedStories.length) {
          setInternalIndex(updatedStories.length - 1);
        }
      }
      
      setShowMenu(false);
    } catch (err) {
      console.log("[handleDelete] Error:", err.message);
      alert("Failed to delete story. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const stories = isControlled ? controlledStories : internalStories;
  const currentIndex = isControlled ? controlledIndex : internalIndex;

  // Extract author from controlled stories or initialProfile
  useEffect(() => {
    if (isControlled && initialProfile?.username) {
      // Use initialProfile when passed from parent (page.jsx)
      setStoryAuthor(initialProfile);
      console.log("[OwnStoryViewerModal] Author from initialProfile:", initialProfile);
    } else if (!isControlled && initialProfile?.username) {
      // For internal mode, also use initialProfile
      setStoryAuthor(initialProfile);
    }
  }, [isControlled, initialProfile]);



  useEffect(() => {
    if (!isControlled && initialProfile?._id && !internalIsOpen) {
      const fetchStories = async () => {
        setIsLoading(true);

        try {
          const result = await getMyStory(initialProfile._id);

          let userStoriesArray = [];
          let authorData = null;

          // Handle different response structures
          if (result && result.data) {
            // Response has data object with active_stories and author
            userStoriesArray = result.data.active_stories || [];
            authorData = result.data.author || null;
          } else if (Array.isArray(result)) {
            userStoriesArray = result;
          } else if (result) {
            userStoriesArray = [result];
          }

          // Store author info
          if (authorData) {
            setStoryAuthor(authorData);
            console.log("[OwnStoryViewerModal] Author data:", authorData);
          }

          // Apply defensive sorting - oldest first (ASC) for Instagram-style viewing
          const sortedStories = sortStoriesByCreatedAtASC(userStoriesArray);
          console.log("[OwnStoryViewerModal] Sorted stories (ASC):", sortedStories.map(s => s.createdAt));
          
          setInternalStories(sortedStories);
          // Always start from index 0 (first/oldest story)
          setInternalIndex(0);
        } catch (err) {
          console.log("[OwnStoryViewerModal] Error:", err.message);
          setInternalStories([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStories();
    }
  }, [isControlled, initialProfile?._id, internalIsOpen]);

  const closeStoryViewer = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
      setInternalIndex(0);
    }
  };

 const goToNextStory = () => {

  setAnimate(true);

  setTimeout(() => {

    if (isControlled && onNext) {
      onNext();
    } else {
      if (internalIndex < stories.length - 1) {
        setInternalIndex((prev) => prev + 1);
      } else {
        closeStoryViewer();
      }
    }

    setAnimate(false);

  }, 200);

};

 const goToPrevStory = () => {

  setAnimate(true);

  setTimeout(() => {

    if (isControlled && onPrev) {
      onPrev();
    } else {
      if (internalIndex > 0) {
        setInternalIndex((prev) => prev - 1);
      }
    }

    setAnimate(false);

  }, 200);

};
  const currentStory = stories[currentIndex] || null;
  

  const getFilterStyle = (story) => {
  if (!story) return {};

  // Check both story.filter and story.media.filter
  const f = story.filter || story.media?.filter;
  const adj = story.adjustments || story.media?.adjustments || {};

  const FILTER_MAP = {
    Normal: "",
    Clarendon: "contrast(1.2) saturate(1.35)",
    Gingham: "brightness(1.05) hue-rotate(-10deg)",
    Moon: "grayscale(1) contrast(1.1) brightness(1.1)",
    Lark: "contrast(0.9) brightness(1.1) saturate(1.1)",
    Reyes: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)",
    Juno: "saturate(1.4) contrast(1.1)",
    Slumber: "saturate(0.66) brightness(1.05)"
  };

  const b = 1 + (adj.Brightness || 0) / 100;
  const c = 1 + (adj.Contrast || 0) / 100;
  const s = 1 + (adj.Saturation || 0) / 100;

  // Only apply if there's a filter or adjustments
  if (!f && Object.values(adj).every(v => v === 0)) {
    return {};
  }

  return {
    filter: `brightness(${b}) contrast(${c}) saturate(${s}) ${FILTER_MAP[f] || f || ""}`
  };
};

  // Debug: Log current story data when it changes
  console.log("[Current Story Data]", {
    story_id: currentStory?.story_id,
    _id: currentStory?._id,
    viewer_count: currentStory?.viewer_count,
    has_viewed: currentStory?.has_viewed
  });

  // Progress bar animation with auto-advance
useEffect(() => {
  if (!isOpen || !currentStory) return;

  let animationFrame;
  let startTime;

  const isVideo =
    (currentStory.media?.type || currentStory.media_type) === "video";

  const duration =
    (currentStory.duration ||
      currentStory.media?.duration ||
      currentStory.media_duration ||
      15) * 1000;

  const goNext = () => {
    cancelAnimationFrame(animationFrame);
    setProgress(0);

    if (isControlled && onNext) {
      onNext();
    } else if (internalIndex < stories.length - 1) {
      setInternalIndex((prev) => prev + 1);
    } else {
      closeStoryViewer();
    }
  };

  // ✅ VIDEO HANDLING (NO INTERVAL / NO RAF)
  if (isVideo && videoRef.current) {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnd = () => goNext();

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnd);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnd);
    };
  }

  // ✅ IMAGE HANDLING (SMOOTH RAF — NO FLICKER)
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;

    if (isPaused) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    const elapsed = timestamp - startTime;
    const percent = Math.min((elapsed / duration) * 100, 100);

    setProgress(percent);

    if (percent < 100) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      goNext();
    }
  };

  animationFrame = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(animationFrame);

}, [currentIndex, isOpen, isPaused]);




  // Reset progress when story changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  if (!isOpen || !currentStory) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        onClick={closeStoryViewer}
      >
        <div
          className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] h-[90vh] max-h-[90vh] w-auto max-w-[380px]" 
          onClick={(e) => e.stopPropagation()}
        >
         <div
  key={currentIndex}
  className="w-full h-full"
>

{(currentStory.media?.type || currentStory.media_type) === "video" ? (
  <video
    ref={videoRef}
    src={currentStory.media?.url || currentStory.media_url}
    className="w-full h-full object-cover bg-black"
    muted={isMuted}
    autoPlay={!isPaused}
    controls={false}
    playsInline
  />
) : (
  <img
    src={currentStory.media?.url || currentStory.media_url}
    alt="story"
    className="w-full h-full object-cover bg-black"
    style={getFilterStyle(currentStory)}
  />
)}

</div>

{/* Caption Overlay */}
{currentStory?.caption && (
  <div className="absolute bottom-20 left-4 right-4">
    <p className="text-white text-sm font-medium text-center drop-shadow-lg">
      {currentStory.caption}
    </p>
  </div>
)}

{/* Location Overlay */}
{currentStory?.location && (
  <div className="absolute top-12 left-12 flex items-center gap-1">
    <MapPin size={14} className="text-white" />
    <span className="text-white text-xs drop-shadow-lg">
      {currentStory.location.display_text}
    </span>
  </div>
)}

{/* Mention Overlays */}
{currentStory?.overlays && currentStory.overlays.length > 0 && (
  <div className="absolute inset-0 pointer-events-none bg-red-600">
    {currentStory.overlays.map((overlay, index) => (
      overlay.type === "mention" && (
        <div
          key={index}
          className="absolute flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full"
          style={{
            left: `${overlay.position?.x || 30}%`,
            top: `${overlay.position?.y || 50}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="text-white text-xs font-medium">
            {overlay.content}
          </span>
        </div>
      )
    ))}
  </div>
)}

          {/* TOP BAR - User Info Row */}
          <div className="absolute top-4 left-4 right-4 text-white ">
            {/* Row 1: User Photo, Username, Time (all in one row) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={storyAuthor?.profile_image_url || initialProfile?.profile_image_url || initialProfile?.profile_picture || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {storyAuthor?.username || initialProfile?.username || "Your Story"}
                  </span>
                  <span className="text-xs text-gray-300">
                    {formatTimeAgo(currentStory?.created_at) || "1m"}
                  </span>
                </div>
              </div>

              {/* Sound, Play/Pause, Three dots (same position) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 bg-black/40 rounded-md"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1 bg-black/40 rounded-md"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>

                <button
                  onClick={() => setShowMenu(true)}
                  className="p-1 bg-black/40 rounded-md"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Row 2: Location */}
            {/* {currentStory?.location?.display_text && (
              <div className="mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-xs text-gray-300">
                  {currentStory.location.display_text}
                </span>
              </div>
            )} */}

            {/* Row 3: Caption */}
            {/* {currentStory?.caption && (
              <div className="mt-1">
                <span className="text-sm text-white">
                  {currentStory.caption}
                </span>
              </div>
            )} */}
          </div>

          {/* PROGRESS BAR - Show for all stories */}

          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                {idx === currentIndex && (
                  <div
                    className="h-full bg-white rounded-full will-change-width"
                   style={{
  width: `${progress}%`,
}}
                  />
                )}
                {idx < currentIndex && (
                  <div className="h-full bg-white rounded-full w-full" />
                )}
              </div>
            ))}
          </div>

          {/* NAVIGATION */}

          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevStory();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
            >
              <ChevronLeft />
            </button>
          )}

          {currentIndex < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextStory();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
            >
              <ChevronRight />
            </button>
          )}



          {/* SEEN BY - Bottom Left */}
          <div className="absolute bottom-6 left-4">
            <button
              onClick={handleSeenByClick}
              className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full"
            >
              <Eye size={18} className="text-white" />
              <span className="text-white text-sm font-medium">
                Seen By {currentStory?.viewer_count ? `(${currentStory.viewer_count})` : ''}
              </span>
            </button>
          </div>


          {/* CLOSE */}

          {/* <button
            onClick={closeStoryViewer}
            className="absolute top-4 right-4 text-white"
          >
            <X />
          </button> */}

        </div>
      </div>


      {/* SEEN BY POPUP */}
      {showSeenBy && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
          onClick={() => setShowSeenBy(false)}
        >
          <div
            className="bg-white w-full max-w-[350px] max-h-[70vh] rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Seen By</h3>
              <button
                onClick={() => setShowSeenBy(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewers List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {isLoadingSeenBy ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : seenByUsers.length > 0 ? (
                <ul className="divide-y">
                  {seenByUsers.map((viewer, index) => (
                    <li
                      key={viewer._id || viewer.user_id || viewer.id || index}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50"
                    >
                      <div className="relative">
                        <img
                          src={viewer.profile_picture || viewer.profile_image_url || viewer.avatar || "/default-avatar.png"}
                          alt={viewer.username || viewer.full_name || viewer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                          <Eye size={10} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {viewer.username || viewer.full_name || viewer.name || "User"}
                        </p>
                        {(viewer.viewed_at || viewer.viewedAt || viewer.created_at) && (
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(viewer.viewed_at || viewer.viewedAt || viewer.created_at)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Eye size={40} className="mb-2 opacity-50" />
                  <p>No one has seen this story yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {showMenu && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
    onClick={() => setShowMenu(false)}
  >
    <div
      className="bg-white w-full max-w-[300px] rounded-3xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="w-full py-4 text-center text-red-500 font-semibold border-b"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      <button
        className="w-full py-4 text-center text-gray-800"
        onClick={() => {
          setShowMenu(false);
          router.push("/home/profile");
        }}
      >
        About this account
      </button>

      <button
        className="w-full py-4 text-center text-gray-500 border-t"
        onClick={() => setShowMenu(false)}
      >
        Cancel
      </button>

    </div>
  </div>
)}
    </>
  );
}
