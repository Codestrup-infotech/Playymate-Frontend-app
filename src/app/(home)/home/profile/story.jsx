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
  MoreHorizontal
} from "lucide-react";

import { getMyStory, deleteStory } from "@/app/user/homefeed";
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

    const router = useRouter();          // 👈 add here
  const [showMenu, setShowMenu] = useState(false);  // 👈 add here
  const [isDeleting, setIsDeleting] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Progress bar duration - 5 seconds for images, video duration for videos
  const STORY_DURATION = 5000; // 5 seconds default

  // Delete story handler
  const handleDelete = async () => {
    if (!currentStory?._id) return;
    
    setIsDeleting(true);
    try {
      await deleteStory(currentStory._id);
      
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



  useEffect(() => {
    if (!isControlled && initialProfile?._id && !internalIsOpen) {
      const fetchStories = async () => {
        setIsLoading(true);

        try {
          const result = await getMyStory(initialProfile._id);

          let userStoriesArray = [];

          if (Array.isArray(result)) {
            userStoriesArray = result;
          } else if (result) {
            userStoriesArray = [result];
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
  />
)}

</div>

          {/* TOP BAR */}

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">

            <div className="flex items-center gap-3">

              <img
                src={initialProfile?.profile_picture || "/default-avatar.png"}
                className="w-8 h-8 rounded-full object-cover"
              />

              <div className="text-sm">
                <div className="font-semibold">
                  {initialProfile?.username || "Your Story"}
                </div>
                <div className="text-xs text-gray-300">
                  {currentStory.time_ago || "13m"}
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
  onClick={() => setShowMenu(true)}
  className="p-2 bg-black/40 rounded-md"
>
  <MoreHorizontal size={18} />
</button>

            </div>

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



          {/* CLOSE */}

          {/* <button
            onClick={closeStoryViewer}
            className="absolute top-4 right-4 text-white"
          >
            <X />
          </button> */}

        </div>
      </div>


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