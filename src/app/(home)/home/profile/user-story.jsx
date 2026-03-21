"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { User, MoreHorizontal, Heart, Send, MessageCircle, Flag, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { userService } from "@/services/user";
import { useTheme } from "@/lib/ThemeContext";
import { Heart as HeartFilled } from "lucide-react";

export default function UserStory({ userId, profile }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      
      console.log("[UserStory] Fetched stories:", { activeStories, archivedStories, allStories, count: allStories.length });
      
      if (allStories.length > 0) {
        setStories(allStories);
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
    let startTime;
    const currentStory = stories[storyIndex];
    
    const isVideo = (currentStory.media?.type || currentStory.media_type) === "video";
    const duration = (currentStory.duration || currentStory.media?.duration || currentStory.media_duration || 5) * 1000;

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
      {/* 3 DOT BUTTON */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setShowOptions(true)}>
          <MoreHorizontal className="text-white" size={24} />
        </button>
      </div>

      {/* PROFILE IMAGE */}
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full p-[3px] ${
            hasStories
              ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500"
              : "bg-gray-100"
          }`}
          onClick={handleProfilePhotoClick}
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
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
                alt="story"
                className="w-full h-full object-cover bg-black"
              />
            )}

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
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
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-black/40 rounded-md"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 bg-black/40 rounded-md"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>

                <button
                  onClick={() => setShowOptions(true)}
                  className="p-2 bg-black/40 rounded-md"
                >
                  <MoreHorizontal size={18} />
                </button>

                <button
                  onClick={closeStoryViewer}
                  className="p-2 bg-black/40 rounded-md"
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
            <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-around text-white">
              <button className="flex flex-col items-center gap-1">
                <MessageCircle size={24} />
                <span className="text-xs">Message</span>
              </button>
              <button 
                className={`flex flex-col items-center gap-1 ${isLiked ? 'text-red-500' : 'text-white'}`}
                onClick={handleLikeToggle}
                disabled={likeLoading}
              >
                {isLiked ? (
                  <HeartFilled size={24} className="animate-pulse" />
                ) : (
                  <Heart size={24} />
                )}
                <span className="text-xs">{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Send size={24} />
                <span className="text-xs">Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ STORY VIEWER MORE OPTIONS POPUP */}
      {showOptions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowOptions(false)}
          />

          {/* Popup */}
          <div className="relative w-full max-w-md bg-white rounded-t-2xl overflow-hidden">
            {/* Report */}
            <button className="flex items-center justify-center gap-2 w-full py-4 text-red-500 border-b">
              <Flag size={18} />
              Report
            </button>

            {/* About this account */}
            <button className="flex items-center justify-center gap-2 w-full py-4 border-b">
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
    </>
  );
}
