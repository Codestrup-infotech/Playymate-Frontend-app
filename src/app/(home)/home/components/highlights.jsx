"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  getMyHighlights, 
  getUserHighlights, 
  createHighlight, 
  deleteHighlight,
  addStoryToHighlight,
  getArchivedStories,
  getMyAllStories,
  getHighlightStories,
  markHighlightViewed,
  updateHighlight
} from "@/app/user/homefeed";

/**
 * Highlights Component - Instagram-style highlights like stories
 * 
 * Props:
 * - userId: string | undefined - If provided, shows another user's highlights
 * - isOwner: boolean - If true, shows "New" button & edit/delete options
 */
export default function Highlights({ userId, isOwner = false }) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingHighlight, setViewingHighlight] = useState(null);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Fetch highlights on mount
  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("[Highlights] Fetching highlights for userId:", userId);
        
        let highlightsData;
        if (!userId || userId === "me") {
          highlightsData = await getMyHighlights();
        } else {
          highlightsData = await getUserHighlights(userId);
        }
        
        console.log("[Highlights] API Response:", highlightsData);
        
        // Handle array response or object with highlights array
        const data = Array.isArray(highlightsData) ? highlightsData : (highlightsData?.highlights || []);
        console.log("[Highlights] Parsed highlights:", data);
        setHighlights(data);
      } catch (err) {
        console.error("[Highlights] Error fetching highlights:", err);
        console.error("[Highlights] Error details:", err.response?.data || err.message);
        setError("Failed to load highlights");
        // Even on error, allow owner to create highlights
        setHighlights(isOwner ? [] : []);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [userId]);

  // Handle create new highlight
  const handleCreateHighlight = async (name, selectedStories) => {
    try {
      console.log("[Highlights] Creating highlight:", { name, stories: selectedStories });
      const newHighlight = await createHighlight(name, selectedStories);
      console.log("[Highlights] Created highlight:", newHighlight);
      
      // Add to local state
      if (newHighlight) {
        setHighlights(prev => [newHighlight, ...prev]);
      }
      setShowCreateModal(false);
    } catch (err) {
      console.error("[Highlights] Error creating highlight:", err);
      alert("Failed to create highlight. Please try again.");
    }
  };

  // Handle delete highlight
  const handleDeleteHighlight = async (highlightId) => {
    if (!confirm("Are you sure you want to delete this highlight?")) return;
    
    try {
      console.log("[Highlights] Deleting highlight:", highlightId);
      await deleteHighlight(highlightId);
      setHighlights(prev => prev.filter(h => h.highlight_id !== highlightId));
      setContextMenu(null);
    } catch (err) {
      console.error("[Highlights] Error deleting highlight:", err);
      alert("Failed to delete highlight. Please try again.");
    }
  };

  // Handle edit highlight
  const handleEditHighlight = async (highlightId, data) => {
    try {
      console.log("[Highlights] Updating highlight:", highlightId, data);
      await updateHighlight(highlightId, data);
      
      // Update local state
      setHighlights(prev => prev.map(h => 
        h.highlight_id === highlightId ? { ...h, ...data } : h
      ));
      setEditingHighlight(null);
    } catch (err) {
      console.error("[Highlights] Error updating highlight:", err);
      alert("Failed to update highlight. Please try again.");
    }
  };

  // Handle long press for context menu (owner only)
  const handleLongPress = (e, highlight) => {
    if (!isOwner) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      highlight,
      x: Math.min(rect.left, window.innerWidth - 180),
      y: rect.bottom + 8,
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex items-end gap-4 px-4 py-3 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-[70px] h-[70px] rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />
            <div className="w-12 h-2.5 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  // For owners, don't show error - allow them to create highlights
  // For non-owners, show error only if there's an actual error (not just empty)
  if (error && !isOwner && highlights.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-red-500">{error}</div>
    );
  }

  // Empty state - show just the New button for owners, nothing for others
  if (!highlights.length && !isOwner) {
    return null;
  }

  return (
    <>
      {/* Highlights Row */}
      <div className="flex items-end gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
        {/* Existing Highlights */}
        {highlights.map((highlight) => (
          <div
            key={highlight.highlight_id}
            onContextMenu={(e) => handleLongPress(e, highlight)}
            onTouchStart={(e) => {
              const timer = setTimeout(() => handleLongPress(e, highlight), 500);
              e.currentTarget._lp = timer;
            }}
            onTouchEnd={(e) => {
              if (e.currentTarget._lp) clearTimeout(e.currentTarget._lp);
            }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <button
              onClick={() => setViewingHighlight(highlight)}
              className="focus:outline-none group"
            >
              {/* Ring */}
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 group-hover:from-pink-400 group-hover:to-purple-500 transition-all">
                <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-100">
                  {highlight.cover_image ? (
                    <Image
                      src={highlight.cover_image}
                      alt={highlight.name}
                      width={66}
                      height={66}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-purple-200 text-purple-600 text-xl font-bold dark:from-purple-900 dark:to-indigo-900 dark:text-purple-200">
                      {highlight.name?.[0]?.toUpperCase() || "H"}
                    </div>
                  )}
                </div>
              </div>
            </button>
            
            {/* Label */}
            <span className="text-[11px] text-gray-600 text-center leading-tight max-w-[70px] truncate dark:text-gray-400">
              {highlight.name}
            </span>
          </div>
        ))}

        {/* New Highlight Button (Owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none group"
          >
            <div className="w-[70px] h-[70px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:border-purple-400 group-hover:bg-purple-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:group-hover:border-purple-400 dark:group-hover:bg-purple-900/20">
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-purple-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">New</span>
          </button>
        )}
      </div>

      {/* Create Highlight Modal */}
      {showCreateModal && (
        <CreateHighlightModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHighlight}
        />
      )}

      {/* Highlight Viewer Modal */}
      {viewingHighlight && (
        <HighlightViewerModal
          highlight={viewingHighlight}
          onClose={() => setViewingHighlight(null)}
          onDelete={handleDeleteHighlight}
        />
      )}

      {/* Edit Highlight Modal */}
      {editingHighlight && (
        <EditHighlightModal
          highlight={editingHighlight}
          onClose={() => setEditingHighlight(null)}
          onSave={handleEditHighlight}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)} 
          />
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-44"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                setEditingHighlight(contextMenu.highlight);
                setContextMenu(null);
              }}
              className="w-full px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDeleteHighlight(contextMenu.highlight.highlight_id)}
              className="w-full px-4 py-3 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ============================================
// CREATE HIGHLIGHT MODAL
// ============================================
function CreateHighlightModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStories, setActiveStories] = useState([]);
  const [archivedStories, setArchivedStories] = useState([]);
  const [selectedStories, setSelectedStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);

  // Load both active and archived stories in one call
  useEffect(() => {
    const loadStories = async () => {
      try {
        console.log("[CreateHighlight] Loading stories...");
        
        // Load all stories (active + archived) in one call
        const allStories = await getMyAllStories(20);
        console.log("[CreateHighlight] All stories response:", allStories);
        
        // Extract active stories
        const active = allStories?.active_stories || [];
        setActiveStories(Array.isArray(active) ? active : []);
        console.log("[CreateHighlight] Active stories:", active);
        
        // Extract archived stories
        const archived = allStories?.archived_stories || [];
        setArchivedStories(Array.isArray(archived) ? archived : []);
        console.log("[CreateHighlight] Archived stories:", archived);
        
      } catch (err) {
        console.error("[CreateHighlight] Error loading stories:", err);
        // Fallback: try loading archived stories separately
        try {
          const archived = await getArchivedStories(20);
          setArchivedStories(Array.isArray(archived) ? archived : []);
        } catch (e) {
          console.log("[CreateHighlight] No archived stories:", e.message);
        }
      } finally {
        setLoadingStories(false);
      }
    };
    loadStories();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a highlight name");
      return;
    }

    setLoading(true);
    try {
      await onCreate(name.trim(), selectedStories);
    } finally {
      setLoading(false);
    }
  };

  const toggleStory = (storyId) => {
    setSelectedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">New Highlight</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Highlight Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Matches 2025"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-purple-400"
              maxLength={50}
            />
          </div>

          {/* Stories Selection */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Select Stories ({selectedStories.length} selected)
            </label>
            
            {loadingStories ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Active Stories Section */}
                {activeStories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Stories (24h)</p>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {activeStories.map((story) => (
                        <div
                          key={story.story_id || story.id}
                          onClick={() => toggleStory(story.story_id || story.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            selectedStories.includes(story.story_id || story.id)
                              ? "border-purple-500"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                            alt="story"
                            fill
                            className="object-cover"
                          />
                          {selectedStories.includes(story.story_id || story.id) && (
                            <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Archived Stories Section */}
                {archivedStories.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Archived Stories</p>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {archivedStories.map((story) => (
                        <div
                          key={story.story_id || story.id}
                          onClick={() => toggleStory(story.story_id || story.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            selectedStories.includes(story.story_id || story.id)
                              ? "border-purple-500"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                            alt="story"
                            fill
                            className="object-cover"
                          />
                          {selectedStories.includes(story.story_id || story.id) && (
                            <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeStories.length === 0 && archivedStories.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No stories available. You can create a highlight without selecting stories.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HIGHLIGHT VIEWER MODAL (Instagram-style)
// ============================================
function HighlightViewerModal({ highlight, onClose, onDelete }) {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const progressRef = useRef(null);
  const animationRef = useRef(null);

  // Load highlight stories
  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("[HighlightViewer] Loading stories for:", highlight.highlight_id);
        
        // Mark as viewed
        try {
          await markHighlightViewed(highlight.highlight_id);
        } catch (e) {
          console.log("[HighlightViewer] View tracking error (non-fatal):", e);
        }
        
        // Get stories
        const storiesData = await getHighlightStories(highlight.highlight_id);
        console.log("[HighlightViewer] Stories:", storiesData);
        setStories(storiesData);
      } catch (err) {
        console.error("[HighlightViewer] Error:", err);
        setError("Failed to load stories");
      } finally {
        setLoading(false);
      }
    };
    
    loadStories();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [highlight.highlight_id]);

  // Progress bar animation
  useEffect(() => {
    if (!stories.length || loading) return;

    const duration = 5000; // 5 seconds per story
    let startTime;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      setCurrentIndex(prev => {
        // Use functional update to get current index
        return prev;
      });
      
      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Move to next story
        setCurrentIndex(prev => {
          if (prev < stories.length - 1) {
            return prev + 1;
          } else {
            onClose();
            return prev;
          }
        });
        startTime = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, stories.length, loading]);

  // Reset progress when story changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [highlight.highlight_id]);

  const currentStory = stories[currentIndex];

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm h-full max-h-[90vh] rounded-2xl overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: idx < currentIndex 
                    ? '100%' 
                    : idx === currentIndex 
                      ? `${((Date.now() % 5000) / 5000) * 100}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
            {highlight.cover_image ? (
              <Image
                src={highlight.cover_image}
                alt={highlight.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {highlight.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{highlight.name}</p>
            {highlight.view_count && (
              <p className="text-white/60 text-xs">{highlight.view_count} views</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-white hover:bg-red-500/20 rounded-full p-2 transition"
              title="Delete highlight"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Story Content */}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/60">{error}</p>
          </div>
        ) : currentStory ? (
          <>
            {currentStory.media_type === "video" ? (
              <video
                src={currentStory.media_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Image
                src={currentStory.media_url || currentStory.thumbnail_url || "/placeholder.jpg"}
                alt="story"
                fill
                className="object-cover"
              />
            )}
            
            {/* Story content text */}
            {currentStory.content && (
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-center text-sm drop-shadow-lg">
                  {currentStory.content}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/60">No stories in this highlight</p>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 cursor-pointer" onClick={goToPrev} />
          <div className="flex-1 cursor-pointer" onClick={goToNext} />
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-xs mx-4">
              <p className="text-gray-800 dark:text-white text-center mb-4">
                Delete this highlight?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(highlight.highlight_id);
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EDIT HIGHLIGHT MODAL
// ============================================
function EditHighlightModal({ highlight, onClose, onSave }) {
  const [name, setName] = useState(highlight.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a highlight name");
      return;
    }

    setLoading(true);
    try {
      await onSave(highlight.highlight_id, { name: name.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Edit Highlight
        </h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Highlight Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-purple-400"
            maxLength={50}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
