"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { User, MoreHorizontal, Heart, Send, MessageCircle, Flag, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play, MapPin } from "lucide-react";
import { userService } from "@/services/user";
import { createConversation, sendMessage } from "@/services/messages";
import { useTheme } from "@/lib/ThemeContext";
import { Heart as HeartFilled } from "lucide-react";
import SharePopup from "@/app/(home)/home/components/sharepopup";
import { useRouter } from "next/navigation";

export default function UserStory({ userId, profile, showRing = true }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  // Filter styles for story
  const getFilterStyle = (story) => {
    if (!story) return {};
    
    // Check both story.filter and story.media.filter
    const filter = story.filter || story.media?.filter;
    const adjustments = story.adjustments || story.media?.adjustments || {};
    
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

    const b = 1 + (adjustments.Brightness || 0) / 100;
    const c = 1 + (adjustments.Contrast || 0) / 100;
    const s = 1 + (adjustments.Saturation || 0) / 100;

    // Only apply if there's a filter or adjustments
    if (!filter && Object.values(adjustments).every(v => v === 0)) {
      return {};
    }
    
    // Apply the filter style
    return { 
      filter: `brightness(${b}) contrast(${c}) saturate(${s}) ${FILTER_MAP[filter] || filter || ""}` 
    };
  };

  const [stories, setStories] = useState([]);
  const [hasStories, setHasStories] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  
  // Story viewer state
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // ✅ Popup state
  const [showOptions, setShowOptions] = useState(false);

  // ✅ Like state - persist locally for story viewer session
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [initializedLikeState, setInitializedLikeState] = useState(false);

  // ✅ Reply to story state
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySent, setReplySent] = useState(false);

  // ✅ Share story state
  const [showShare, setShowShare] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Initial fetch for showing story ring on profile
  useEffect(() => {
    const checkStories = async () => {
      if (!userId) return;
      
      try {
        const response = await userService.getUserStories(userId);
        const storiesData = response?.data?.data || response?.data;
        
        const activeStories = storiesData?.active_stories || [];
        const archivedStories = storiesData?.archived_stories || [];
        
        console.log("[UserStory] checkStories - active:", activeStories.length, "archived:", archivedStories.length);
        
        if (activeStories.length > 0 || archivedStories.length > 0) {
          setHasStories(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    checkStories();
  }, [userId]);

  // Fetch stories and open viewer
  const handleProfilePhotoClick = async () => {
    if (!userId) return;

    try {
      const response = await userService.getUserStories(userId);
      const storiesData = response?.data?.data || response?.data;

      console.log("[UserStory] Full API response:", JSON.stringify(storiesData, null, 2));

      // Check different possible API response structures
      let activeStories = [];
      let archivedStories = [];

      // Try different possible structures
      if (storiesData?.active_stories) {
        activeStories = Array.isArray(storiesData.active_stories) ? storiesData.active_stories : [storiesData.active_stories];
      }
      if (storiesData?.archived_stories) {
        archivedStories = Array.isArray(storiesData.archived_stories) ? storiesData.archived_stories : [storiesData.archived_stories];
      }
      // Also check for stories array at root level
      if (storiesData?.stories) {
        activeStories = Array.isArray(storiesData.stories) ? storiesData.stories : [storiesData.stories];
      }

      const allStories = [...activeStories, ...archivedStories];
      
      // ✅ Sort stories by creation date - newest first (first story shown first)
      const sortedStories = allStories.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateA - dateB; // Oldest first (chronological order)
      });
      
      console.log("[UserStory] Fetched stories:", { activeStories, archivedStories, allStories, sortedStories, count: sortedStories.length });
      
      if (sortedStories.length > 0) {
        setStories(sortedStories);
        setHasStories(true);
        setStoryIndex(0);
        setShowStoryViewer(true);
        setProgress(0);
        setIsPaused(false);
      } else {
        setStories([]);
        setHasStories(false);
      }
    } catch (err) {
      console.error("[UserStory] Error fetching stories:", err);
    }
  };

  // Story viewer functions
  const closeStoryViewer = useCallback(() => {
    setShowStoryViewer(false);
    setStoryIndex(0);
    setProgress(0);
  }, []);

  const goToNextStory = useCallback(() => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStoryViewer();
    }
  }, [storyIndex, stories.length, closeStoryViewer]);

  const goToPrevStory = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [storyIndex]);

  // Progress bar animation
useEffect(() => {
  if (!showStoryViewer || !stories[storyIndex]) return;

  let animationFrame;
  let startTime = null;
  let pausedAt = null;

  const currentStory = stories[storyIndex];

  const isVideo =
    (currentStory.media?.type || currentStory.media_type) === "video";

  const duration =
    (currentStory.duration ||
      currentStory.media?.duration ||
      currentStory.media_duration ||
      5) * 1000;

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;

    // ⛔ Pause handling
    if (isPaused) {
      if (!pausedAt) pausedAt = timestamp;
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    // ▶ Resume handling (IMPORTANT FIX)
    if (pausedAt) {
      startTime += timestamp - pausedAt;
      pausedAt = null;
    }

    const elapsed = timestamp - startTime;
    const percent = Math.min((elapsed / duration) * 100, 100);

    setProgress(percent);

    if (percent < 100) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      goToNextStory();
    }
  };

  if (!isVideo) {
    animationFrame = requestAnimationFrame(animate);
  }

  return () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}, [storyIndex, showStoryViewer, isPaused, goToNextStory]);

  const currentStory = stories[storyIndex] || null;

  // ✅ Sync like state with current story only on first load
  useEffect(() => {
    if (currentStory && !initializedLikeState) {
      // Only initialize from API data once per story
      const wasLiked = currentStory.is_liked || currentStory.liked || false;
      setIsLiked(wasLiked);
      setInitializedLikeState(true);
    }
  }, [storyIndex, currentStory, initializedLikeState]);

  // Reset initialization flag when opening story viewer
  useEffect(() => {
    if (showStoryViewer) {
      setInitializedLikeState(false);
    }
  }, [showStoryViewer]);

  // ✅ Handle like/unlike toggle
  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (!currentStory || likeLoading) return;

    // Get the correct story ID (story_id or _id)
    const storyId = currentStory.story_id || currentStory._id || currentStory.id;
    console.log('[UserStory] Toggle like - Story ID:', storyId, 'Current liked state:', isLiked);
    
    if (!storyId) {
      console.error('[UserStory] No story ID found');
      return;
    }

    // Optimistic update - immediately toggle the UI
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    setLikeLoading(true);
    try {
      const response = await userService.toggleStoryLike(storyId);
      const result = response?.data;
      
      console.log('[UserStory] Like toggle response:', result);
      
      if (result?.status === 'success') {
        // Confirm with API response
        const apiLiked = result.data?.liked || false;
        setIsLiked(apiLiked);
        // Update the story in the stories array to reflect the new like state
        setStories((prevStories) =>
          prevStories.map((story, idx) =>
            idx === storyIndex
              ? { ...story, is_liked: apiLiked }
              : story
          )
        );
      } else {
        // Revert on error
        setIsLiked(!newLikedState);
      }
    } catch (err) {
      console.error('[UserStory] Error toggling like:', err);
      // Revert on error
      setIsLiked(!newLikedState);
    } finally {
      setLikeLoading(false);
    }
  };

  // ✅ Handle reply to story (sends DM to story owner via messages API)
  const handleReply = async (e) => {
    e?.stopPropagation();
    
    if (!replyText.trim() || !currentStory || replyLoading) return;
    
    // The story owner is identified by the userId prop
    const storyOwnerId = userId;
    console.log('[UserStory] Reply to story - Owner ID:', storyOwnerId, 'Message:', replyText);
    
    if (!storyOwnerId) {
      console.error('[UserStory] No story owner ID found for reply');
      return;
    }

    setReplyLoading(true);
    try {
      // Step 1: Create or get existing conversation with the story owner
      console.log('[UserStory] Creating conversation with story owner:', storyOwnerId);
      const convResponse = await createConversation({ 
        participants: [storyOwnerId] 
      });
      
      console.log('[UserStory] Conversation response:', convResponse);
      
      // Extract conversation ID from response - handle different response formats
      // The messages API interceptor returns res.data.data, so we need to check both structures
      const conversationData = convResponse?.data?.conversation || 
                             convResponse?.conversation ||
                             convResponse;
      const conversationId = conversationData?._id || conversationData?.id;
                            
      if (!conversationId) {
        console.error('[UserStory] No conversation ID found in response:', convResponse);
        throw new Error('Failed to create conversation');
      }
      
      console.log('[UserStory] Conversation created:', conversationId);
      
      // Step 2: Send the reply message to the conversation
      const messageResponse = await sendMessage(conversationId, {
        message: replyText.trim()
      });
      
      console.log('[UserStory] Message sent:', messageResponse);
      
      // Clear the input and show success feedback
      setReplyText('');
      setReplySent(true);
      // Reset the sent state after 2 seconds
      setTimeout(() => setReplySent(false), 2000);
      console.log('[UserStory] Reply sent successfully! DM sent to story owner.');
    } catch (err) {
      console.error('[UserStory] Error sending reply:', err);
      // Show error feedback
      alert(err?.message || 'Failed to send reply. Please try again.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle enter key in reply input
  const handleReplyKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  // Helper to format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (!profile) return null;

  return (
    <>
      {/* PROFILE IMAGE */}
      <div className="relative">
       <div
  className={`w-20 h-20 rounded-2xl p-[2px] cursor-pointer ${
    showRing && hasStories
      ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500"
      : "bg-transparent"
  }`}
  onClick={handleProfilePhotoClick}
>
         <div className="w-full h-full rounded-2xl overflow-hidden">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <User size={40} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STORY VIEWER MODAL */}
      {showStoryViewer && currentStory && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={closeStoryViewer}
        >
          <div
            className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] h-[90vh] max-h-[90vh] w-auto max-w-[380px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Content */}
            <div className="relative w-full h-full">
              {(currentStory.media?.type || currentStory.media_type) === "video" ? (
                <video
                  ref={videoRef}
                  src={currentStory.media?.url || currentStory.media_url}
                  className="w-full h-full object-cover bg-black"
                  muted={isMuted}
                  autoPlay={!isPaused}
                  controls={false}
                  playsInline
                  onEnded={goToNextStory}
                />
              ) : (
                <img
                  src={currentStory.media?.url || currentStory.media_url}
                  style={getFilterStyle(currentStory)}
                  className="w-full h-full object-cover bg-black"
                />
              )}

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
                <div className="absolute top-16 left-4 flex items-center gap-1">
                  <MapPin size={14} className="text-white" />
                  <span className="text-white text-xs drop-shadow-lg">
                    {currentStory.location.display_text}
                  </span>
                </div>
              )}

              {/* Mention Overlays */}
              {currentStory?.overlays && currentStory.overlays.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
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
            </div>

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
              <button
                onClick={() => {
                  console.log('[UserStory] Navigate to user profile from top bar:', userId);
                  router.push(`/home/profile/${userId}`);
                }}
                className="flex items-center gap-3"
              >
                <img
                  src={profile.profile_image_url || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="font-semibold">
                    {profile.username || profile.full_name || "User"}
                  </div>
                  <div className="text-xs text-gray-300">
                    {getTimeAgo(currentStory.created_at)}
                  </div>
                </div>
              </button>

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
                  onClick={() => {
                    console.log('[UserStory] Opening options menu - pausing story');
                    setIsPaused(true);
                    setShowOptions(true);
                  }}
                  className="p-1 bg-black/40 rounded-md"
                >
                  <MoreHorizontal size={18} />
                </button>

                <button
                  onClick={closeStoryViewer}
                  className="p-1 bg-black/40 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
              {stories.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
                >
                  {idx === storyIndex && (
                    <div
                      className="h-full bg-white rounded-full will-change-width"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  {idx < storyIndex && (
                    <div className="h-full bg-white rounded-full w-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            {storyIndex > 0 && (
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

            {storyIndex < stories.length - 1 && (
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

            {/* Bottom Action Bar - Message, Like, Share */}
           {/* Bottom Action Bar - Message, Like, Share */}
{/* Bottom Action Bar */}
<div className="absolute bottom-4 left-4 right-4">

  {!replyText ? (
    // ✅ DEFAULT STATE (small + icons visible)
    <div className="flex items-center gap-3">
      
      {/* Reply Input - Only show if allow_comments is true */}
      {currentStory?.allow_comments !== false ? (
        <div className="flex items-center bg-black/40 rounded-full px-3 w-[180px]">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onFocus={() => setIsPaused(true)}
            placeholder={`Reply to ${profile.username || profile.full_name}...`}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-300 text-sm py-2"
          />
        </div>
      ) : null}

      {/* Icons */}
      <div className="flex items-center gap-3">
        <button onClick={handleLikeToggle} className="text-white">
          {isLiked ? (
            <HeartFilled size={24} className="fill-white" />
          ) : (
            <Heart size={24} />
          )}
        </button>

        {/* Share Button - Only show if allow_shares is true */}
        {currentStory?.allow_shares !== false ? (
          <button 
            onClick={() => {
              // Get the current story's ID
              const storyId = currentStory?.story_id || currentStory?._id || currentStory?.id;
              console.log('[UserStory] Share button clicked for story:', storyId);
              setIsPaused(true);
              setShowShare(true);
            }}
            className="text-white"
          >
            <Send size={24} />
          </button>
        ) : null}
      </div>
    </div>
  ) : (
    // ✅ EXPANDED STATE (full width input like your image) - Only show if allow_comments is true
    currentStory?.allow_comments !== false ? (
    <div className="flex items-center bg-black/40 rounded-full px-4 py-2 w-full border border-white/20">
      
      <input
        type="text"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        onBlur={() => setIsPaused(false)}
        onKeyDown={handleReplyKeyDown}
        className="flex-1 bg-transparent outline-none text-white text-sm"
        autoFocus
      />

      <button
        onClick={handleReply}
        disabled={!replyText.trim() || replyLoading}
        className="text-blue-400 font-medium ml-3"
      >
        {replyLoading ? "..." : "Send"}
      </button>
    </div>
    ) : null
  )}

</div>
          </div>
        </div>
      )}

      {/* ✅ SHARE STORY POPUP */}
      <SharePopup
        isOpen={showShare}
        onClose={() => {
          console.log('[UserStory] Closing share popup - resuming story');
          setShowShare(false);
          setIsPaused(false);
        }}
        contentType="story"
        contentId={currentStory?.story_id || currentStory?._id || currentStory?.id}
        thumbnail={currentStory?.media?.url || currentStory?.media_url}
        title={null}
        onShareSuccess={() => {
          setShowShare(false);
          setIsPaused(false);
          console.log('[UserStory] Story shared successfully!');
        }}
      />

      {/* ✅ STORY VIEWER MORE OPTIONS POPUP */}
      {showOptions && (
        <div className="fixed inset-0 z-[60]  flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowOptions(false);
              setIsPaused(false);
            }}
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
                console.log('[UserStory] Navigate to user profile:', userId);
                setShowOptions(false);
                setIsPaused(false);
                router.push(`/home/profile/${userId}`);
              }}
              className="flex items-center justify-center gap-2 w-full py-4 border-b"
            >
              <User size={18} />
              About this account
            </button>

            {/* Cancel */}
            <button
              onClick={() => {
                setShowOptions(false);
                setIsPaused(false);
              }}
              className="w-full py-4 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
