"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  getMyHighlights, 
  getUserHighlights, 
  createHighlight, 
  deleteHighlight,
  addStoryToHighlight,
  removeStoryFromHighlight,
  getArchivedStories,
  getMyAllStories,
  getHighlightStories,
  markHighlightViewed,
  updateHighlight,
  getStoryPreview,
  getHighlightDetails
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
  
  // Story preview state
  const [storyPreview, setStoryPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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
      
      // Add to local state - API returns the created highlight with highlight_id
      if (newHighlight && newHighlight.highlight_id) {
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
      
      // If this is a refresh request (after adding story), just refresh the list
      if (data?.refresh) {
        const updatedHighlights = await getMyHighlights();
        const highlightsData = Array.isArray(updatedHighlights) ? updatedHighlights : (updatedHighlights?.highlights || []);
        setHighlights(highlightsData);
        return;
      }
      
      await updateHighlight(highlightId, data);
      
      // Update local state
      setHighlights(prev => prev.map(h => 
        h.highlight_id === highlightId ? { ...h, ...data } : h
      ));
      setEditingHighlight(null);
      
      // Refresh the highlights list to get updated data
      const updatedHighlights = await getMyHighlights();
      const highlightsData = Array.isArray(updatedHighlights) ? updatedHighlights : (updatedHighlights?.highlights || []);
      setHighlights(highlightsData);
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

  // Handle click on highlight to show story preview
  const handleHighlightClick = async (highlight) => {
    setLoadingPreview(true);
    try {
      console.log("[Highlights] Fetching story preview for highlight:", highlight.highlight_id);
      
      // First get highlight details to get the stories
      const highlightData = await getHighlightDetails(highlight.highlight_id);
      console.log("[Highlights] Highlight details:", highlightData);
      
      const stories = highlightData?.stories || [];
      if (stories.length === 0) {
        console.log("[Highlights] No stories in highlight");
        // No stories, open the full viewer
        setViewingHighlight(highlight);
        return;
      }
      
      // Get the first story's ID
      const firstStory = stories[0];
      const storyId = firstStory.story_id || firstStory.id;
      
      if (!storyId) {
        console.log("[Highlights] No story ID found");
        setViewingHighlight(highlight);
        return;
      }
      
      // Fetch story preview
      const preview = await getStoryPreview(storyId);
      console.log("[Highlights] Story preview:", preview);
      
      setStoryPreview({
        ...preview,
        highlight, // Pass the highlight info for context
        allStories: stories, // Pass all stories for navigation
        currentIndex: 0 // Current story index
      });
    } catch (err) {
      console.error("[Highlights] Error fetching story preview:", err);
      // Fall back to opening the full highlight viewer
      setViewingHighlight(highlight);
    } finally {
      setLoadingPreview(false);
    }
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
              onClick={() => handleHighlightClick(highlight)}
              className="focus:outline-none group"
            >
              {/* Ring */}
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 group-hover:from-pink-400 group-hover:to-purple-500 transition-all">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-100">
                  {highlight.cover_image_url ? (
                    <Image
                      src={highlight.cover_image_url}
                      alt={highlight.name}
                      width={80}
                      height={80}
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
            <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:border-purple-400 group-hover:bg-purple-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:group-hover:border-purple-400 dark:group-hover:bg-purple-900/20">
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

      {/* Story Preview Modal */}
      {storyPreview && (
        <StoryPreviewModal
          story={storyPreview}
          highlight={storyPreview.highlight}
          allStories={storyPreview.allStories || []}
          currentIndex={storyPreview.currentIndex || 0}
          isOwner={isOwner}
          onClose={() => setStoryPreview(null)}
          onViewAll={() => {
            setStoryPreview(null);
            setViewingHighlight(storyPreview.highlight);
          }}
          loading={loadingPreview}
          onRemoveStory={async () => {
            console.log("[StoryPreviewModal] storyPreview:", storyPreview);
            const storyId = storyPreview?.story_id || storyPreview?._id;
            const highlightId = storyPreview?.highlight?.highlight_id;
            console.log("[StoryPreviewModal] Removing story, storyId:", storyId, "highlightId:", highlightId);
            if (storyId) {
              try {
                await removeStoryFromHighlight(storyId, highlightId);
                console.log("[StoryPreviewModal] Story removed successfully");
                setStoryPreview(null); // Just close the modal, NO setViewingHighlight()
                // Refresh the highlights row silently
                const updated = await getMyHighlights();
                const data = Array.isArray(updated) ? updated : (updated?.highlights || []);
                setHighlights(data);
              } catch (err) {
                console.error("[StoryPreviewModal] Error removing story:", err);
                alert("Failed to remove story from highlight");
              }
            } else {
              console.error("[StoryPreviewModal] No story_id found");
            }
          }}
          onEditHighlight={async () => {
            // Open edit modal for the highlight - fetch details first
            setStoryPreview(null);
            try {
              const details = await getHighlightDetails(storyPreview.highlight.highlight_id);
              const stories = details?.stories || [];
              const existingStoryIds = stories.map(s => s.story_id || s.id);
              setEditingHighlight({
                ...storyPreview.highlight,
                stories: stories,
                existingStoryIds: existingStoryIds
              });
            } catch (err) {
              console.error("[Highlights] Error fetching highlight details:", err);
              setEditingHighlight(storyPreview.highlight);
            }
          }}
          onDeleteHighlight={async () => {
            const highlightId = storyPreview?.highlight?.highlight_id;
            if (!highlightId) return;
            if (!confirm("Delete this entire highlight? This cannot be undone.")) return;
            try {
              await deleteHighlight(highlightId);
              setStoryPreview(null);
              // Remove from highlights row immediately
              setHighlights(prev => prev.filter(h => h.highlight_id !== highlightId));
            } catch (err) {
              console.error("[Highlights] Error deleting highlight:", err);
              alert("Failed to delete highlight. Please try again.");
            }
          }}
        />
      )}

      {/* Highlight Viewer Modal */}
      {viewingHighlight && (
        <HighlightViewerModal
          highlight={viewingHighlight}
          onClose={() => setViewingHighlight(null)}
          onDelete={handleDeleteHighlight}
          isOwner={isOwner}
        />
      )}

      {/* Edit Highlight Modal */}
      {editingHighlight && (
        <EditHighlightModal
          highlight={editingHighlight}
          existingStoryIds={editingHighlight.existingStoryIds || []}
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
              onClick={async () => {
                setContextMenu(null);
                // Fetch highlight details to get existing stories
                try {
                  const details = await getHighlightDetails(contextMenu.highlight.highlight_id);
                  const stories = details?.stories || [];
                  const existingStoryIds = stories.map(s => s.story_id || s.id);
                  setEditingHighlight({
                    ...contextMenu.highlight,
                    stories: stories,
                    existingStoryIds: existingStoryIds
                  });
                } catch (err) {
                  console.error("[Highlights] Error fetching highlight details:", err);
                  // Fallback: open without stories
                  setEditingHighlight(contextMenu.highlight);
                }
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
  
  // State for story preview modal in CreateHighlightModal
  const [previewStory, setPreviewStory] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  // Handle clicking on a story to preview it
  const handleStoryClick = async (story, e) => {
    e.stopPropagation(); // Prevent selecting the story
    const storyId = story.story_id || story.id;
    if (!storyId) return;
    
    setLoadingPreview(true);
    try {
      const previewData = await getStoryPreview(storyId);
      setPreviewStory(previewData);
    } catch (err) {
      console.error("[CreateHighlight] Error fetching story preview:", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewStory(null);
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
                            src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
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
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            selectedStories.includes(story.story_id || story.id)
                              ? "border-purple-500"
                              : "border-transparent"
                          }`}
                        >
                          {/* Story Image - Click to select */}
                          <div onClick={() => toggleStory(story.story_id || story.id)} className="absolute inset-0">
                            <Image
                              src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                              alt="story"
                              fill
                              className="object-cover"
                            />
                          </div>
                          {/* Preview Button */}
                          <button
                            onClick={(e) => handleStoryClick(story, e)}
                            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                            title="Preview story"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
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

  // Story Preview Modal for CreateHighlightModal
  return (
    <>
      {/* Main Create Highlight Modal */}
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
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                              selectedStories.includes(story.story_id || story.id)
                                ? "border-purple-500"
                                : "border-transparent"
                            }`}
                          >
                            {/* Story Image - Click to select */}
                            <div onClick={() => toggleStory(story.story_id || story.id)} className="absolute inset-0">
                              <Image
                                src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                                alt="story"
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Preview Button */}
                            <button
                              onClick={(e) => handleStoryClick(story, e)}
                              className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                              title="Preview story"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
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
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                              selectedStories.includes(story.story_id || story.id)
                                ? "border-purple-500"
                                : "border-transparent"
                            }`}
                          >
                            {/* Story Image - Click to select */}
                            <div onClick={() => toggleStory(story.story_id || story.id)} className="absolute inset-0">
                              <Image
                                src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                                alt="story"
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Preview Button */}
                            <button
                              onClick={(e) => handleStoryClick(story, e)}
                              className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                              title="Preview story"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
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

      {/* Story Preview Modal */}
      {(previewStory || loadingPreview) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-sm">
            {loadingPreview ? (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : previewStory ? (
              <>
                {/* Story Media */}
                <div className="relative aspect-[9/16] max-h-[85vh] rounded-lg overflow-hidden bg-black">
                  {previewStory.media?.type === "video" ? (
                    <video
                      src={previewStory.media?.url}
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      src={previewStory.media?.url || "/placeholder.jpg"}
                      alt="story preview"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                
                {/* Author Info */}
                {previewStory.author && (
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                      <Image
                        src={previewStory.author.profile_image_url || "/placeholder.jpg"}
                        alt={previewStory.author.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-medium">{previewStory.author.full_name}</p>
                      <p className="text-xs text-white/70">@{previewStory.author.username}</p>
                    </div>
                  </div>
                )}
                
                {/* Close Button */}
                <button
                  onClick={closePreview}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                >
                  ✕
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// HIGHLIGHT VIEWER MODAL (Instagram-style)
// ============================================
function HighlightViewerModal({ highlight, onClose, onDelete, isOwner = false }) {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStory, setDeletingStory] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
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
        
        // Get highlight details which includes stories
        const highlightData = await getHighlightDetails(highlight.highlight_id);
        console.log("[HighlightViewer] Highlight details:", highlightData);
        
        // Stories are returned in the highlight data
        setStories(highlightData?.stories || []);
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
      const prog = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(prog);
      
      if (prog < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Move to next story or close
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Use setTimeout to avoid updating during render
          setTimeout(() => {
            onClose();
          }, 0);
        }
        startTime = null;
        setProgress(0);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, stories.length, loading, onClose]);

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

  // Delete current story from highlight
  const handleDeleteStory = async () => {
    if (!currentStory?.story_id) {
      console.error("[HighlightViewer] No story_id found for current story");
      return;
    }
    
    if (!confirm("Remove this story from the highlight?")) return;
    
    setDeletingStory(true);
    try {
      console.log("[HighlightViewer] Deleting story:", currentStory.story_id, "highlight:", highlight.highlight_id);
      await removeStoryFromHighlight(currentStory.story_id, highlight.highlight_id);
      
      // Remove from local state
      const updatedStories = stories.filter((_, idx) => idx !== currentIndex);
      setStories(updatedStories);
      
      // Adjust current index if needed
      if (currentIndex >= updatedStories.length && updatedStories.length > 0) {
        setCurrentIndex(updatedStories.length - 1);
      } else if (updatedStories.length === 0) {
        onClose(); // No more stories, close the viewer
      }
      
      console.log("[HighlightViewer] Story removed successfully");
    } catch (err) {
      console.error("[HighlightViewer] Error deleting story:", err);
      alert("Failed to remove story from highlight");
    } finally {
      setDeletingStory(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm h-full max-h-[95vh] rounded-2xl overflow-hidden bg-black"
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
                      ? `${progress}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
            {highlight.cover_image_url ? (
              <Image
                src={highlight.cover_image_url}
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
            {/* 3 Dots Menu Button - Only show for owner */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="text-white hover:bg-white/10 rounded-full p-2 transition"
                  title="More options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                  </svg>
                </button>
                
                {/* Options Popup Menu */}
                {showOptionsMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        handleDeleteStory();
                      }}
                      disabled={deletingStory}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                      </svg>
                      Remove from highlight
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        // Edit highlight - will be implemented
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit highlight
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Delete Highlight Button - Only show for owner */}
            {isOwner && (
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
            )}
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

        {/* Visible Navigation Buttons */}
        {stories.length > 1 && (
          <>
            {/* Previous Button */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {/* Next Button */}
            {currentIndex < stories.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Story Counter Badge */}
        {stories.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-xs">
              {currentIndex + 1} / {stories.length}
            </span>
          </div>
        )}

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
function EditHighlightModal({ highlight, onClose, onSave, existingStoryIds: existingStoryIdsProp = [] }) {
  const [name, setName] = useState(highlight.name || "");
  const [description, setDescription] = useState(highlight.description || "");
  const [isVisible, setIsVisible] = useState(highlight.is_visible !== false);
  const [loading, setLoading] = useState(false);
  
  // State for loading and displaying stories
  const [activeStories, setActiveStories] = useState([]);
  const [archivedStories, setArchivedStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [addingStoryId, setAddingStoryId] = useState(null);
  const [message, setMessage] = useState(null);
  
  // State to track existing story IDs locally (for adding new stories)
  const [existingStoryIds, setExistingStoryIds] = useState(existingStoryIdsProp);

  // Load stories on mount
  useEffect(() => {
    const loadStories = async () => {
      try {
        console.log("[EditHighlight] Loading stories...");
        
        // First try to get active stories
        let active = [];
        try {
          const activeRes = await getMyAllStories(20);
          console.log("[EditHighlight] Active stories response:", activeRes);
          active = activeRes?.active_stories || [];
        } catch (e) {
          console.log("[EditHighlight] No active stories:", e.message);
        }
        setActiveStories(Array.isArray(active) ? active : []);
        
        // Then get archived stories using the correct API
        let archived = [];
        try {
          const archivedRes = await getArchivedStories(20);
          console.log("[EditHighlight] Archived stories response:", archivedRes);
          // API returns { data: { stories: [...] } }
          archived = archivedRes?.data?.stories || archivedRes?.stories || [];
        } catch (e) {
          console.log("[EditHighlight] No archived stories:", e.message);
        }
        setArchivedStories(Array.isArray(archived) ? archived : []);
        
      } catch (err) {
        console.error("[EditHighlight] Error loading stories:", err);
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
      await onSave(highlight.highlight_id, { 
        name: name.trim(),
        description: description.trim(),
        is_visible: isVisible
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a story to the highlight
  const handleAddStory = async (story) => {
    const storyId = story.story_id || story.id;
    if (!storyId) return;
    
    // Check if already in highlight
    if (existingStoryIdsProp.includes(storyId)) {
      setMessage("Story already in highlight");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    
    setAddingStoryId(storyId);
    try {
      console.log("[EditHighlight] Adding story to highlight:", highlight.highlight_id, storyId);
      await addStoryToHighlight(highlight.highlight_id, storyId);
      console.log("[EditHighlight] Story added successfully");
      setMessage("Story added to highlight!");
      setTimeout(() => setMessage(null), 2000);
      
      // Trigger parent to refresh highlights
      if (onSave) {
        await onSave(highlight.highlight_id, { refresh: true });
      }
    } catch (err) {
      console.error("[EditHighlight] Error adding story:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to add story";
      console.log("[EditHighlight] Error details:", err.response?.data);
      
      // Check for various conflict/error codes
      if (err.response?.status === 409 || 
          errorMsg?.toLowerCase().includes("already") || 
          errorMsg?.toLowerCase().includes("conflict") ||
          errorMsg?.toLowerCase().includes("duplicate")) {
        setMessage("Story already in highlight");
      } else {
        setMessage(errorMsg || "Failed to add story");
      }
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAddingStoryId(null);
    }
  };

  // Check if story is already in highlight
  const isStoryInHighlight = (story) => {
    const storyId = story.story_id || story.id;
    return existingStoryIdsProp.includes(storyId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Highlight
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Message Toast */}
          {message && (
            <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
              message.includes("already") || message.includes("Failed")
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {message}
            </div>
          )}

          {/* Highlight Details */}
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

          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-purple-400 resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="is_visible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-400"
            />
            <label htmlFor="is_visible" className="text-sm text-gray-600 dark:text-gray-400">
              Make visible to others
            </label>
          </div>

          {/* Stories to Add Section */}
          <div className="border-t dark:border-gray-700 pt-4 mt-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Add More Stories
            </label>
            
            {loadingStories ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Active Stories */}
                {activeStories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Stories (24h)</p>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {activeStories.map((story) => (
                        <div
                          key={story.story_id || story.id}
                          onClick={() => handleAddStory(story)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            isStoryInHighlight(story)
                              ? "border-green-500 opacity-60"
                              : "border-transparent hover:border-purple-400"
                          } ${addingStoryId === (story.story_id || story.id) ? "opacity-50" : ""}`}
                        >
                          <Image
                            src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                            alt="story"
                            fill
                            className="object-cover"
                          />
                          {isStoryInHighlight(story) ? (
                            <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <span className="text-white text-xs">Add +</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Archived Stories */}
                {archivedStories.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Archived Stories</p>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {archivedStories.map((story) => (
                        <div
                          key={story.story_id || story.id}
                          onClick={() => handleAddStory(story)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            isStoryInHighlight(story)
                              ? "border-green-500 opacity-60"
                              : "border-transparent hover:border-purple-400"
                          } ${addingStoryId === (story.story_id || story.id) ? "opacity-50" : ""}`}
                        >
                          <Image
                            src={story.media?.url || story.thumbnail_url || story.media_url || "/placeholder.jpg"}
                            alt="story"
                            fill
                            className="object-cover"
                          />
                          {isStoryInHighlight(story) ? (
                            <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <span className="text-white text-xs">Add +</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeStories.length === 0 && archivedStories.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No stories available to add.
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
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STORY PREVIEW MODAL
// ============================================
function StoryPreviewModal({ story, highlight, onClose, onViewAll, loading, onRemoveStory = () => {}, onEditHighlight = () => {}, onDeleteHighlight = () => {}, allStories = [], currentIndex = 0, isOwner = false }) {
  // The API response format:
  // {
  //   "story_id": "story_xxx",
  //   "media": { "url": "...", "type": "image", "duration": 5 },
  //   "author": { "_id": "...", "full_name": "...", "username": "...", "profile_image_url": "..." },
  //   "created_at": "...",
  //   "expires_at": "...",
  //   ...
  // }
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localIndex, setLocalIndex] = useState(currentIndex);
  const [currentStory, setCurrentStory] = useState(story);
  const [loadingNav, setLoadingNav] = useState(false);
  const progressRef = useRef(null);
  const animationRef = useRef(null);

  // Navigate to a specific story by index
  const navigateTo = async (index) => {
    if (index < 0 || index >= allStories.length) return;
    setLocalIndex(index);
    const target = allStories[index];
    const storyId = target?.story_id || target?.id;
    if (!storyId) return;
    setLoadingNav(true);
    try {
      const preview = await getStoryPreview(storyId);
      setCurrentStory({ ...preview, highlight });
    } catch (e) {
      console.error('[StoryPreviewModal] Nav error:', e);
    } finally {
      setLoadingNav(false);
    }
  };

  const stories = allStories.length > 0 ? allStories : (story ? [story] : []);
  const totalStories = stories.length;
  const currentStoryIndex = localIndex;

  // Progress bar animation
  useEffect(() => {
    if (totalStories <= 1) return;

    const duration = 5000; // 5 seconds per story
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const prog = Math.min((elapsed / duration) * 100, 100);
      setProgress(prog);

      if (prog < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentStoryIndex, totalStories]);

  const mediaUrl = currentStory?.media?.url || currentStory?.media_url;
  const mediaType = currentStory?.media?.type || currentStory?.media_type || "image";
  const author = currentStory?.author || {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={() => {
        setShowOptionsMenu(false);
        onClose();
      }}
    >
      <div 
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading State */}
        {loading && (
          <div className="w-full h-[580px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Progress Bar - Show when there are multiple stories */}
        {!loading && totalStories > 1 && (
          <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: idx < currentStoryIndex 
                      ? '100%' 
                      : idx === currentStoryIndex 
                        ? `${progress}%`
                        : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Story Content */}
        {!loading && story && (
          <>
            {/* Media */}
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                className="w-full h-[580px] object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="relative w-full h-[580px]">
                <Image
                  src={mediaUrl || "/placeholder.jpg"}
                  alt="story preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Header with author info */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={author.profile_image_url || "/placeholder.jpg"}
                    alt={author.full_name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {author.full_name || "User"}
                  </p>
                  <p className="text-white/70 text-xs">
                    @{author.username || "username"}
                  </p>
                </div>
              </div>
            </div>

            {/* Highlight info badge */}
            {highlight && (
              <div className="absolute top-16 left-4 right-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-white text-xs font-medium">
                    {highlight.name}
                  </span>
                  {totalStories > 1 && (
                    <span className="text-white/70 text-xs">
                      ({localIndex + 1}/{totalStories})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {totalStories > 1 && (
              <>
                {localIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo(localIndex - 1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}
                {localIndex < totalStories - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo(localIndex + 1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
              </>
            )}

            {/* 3-dot menu button - Only show for owner */}
            {isOwner && (
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptionsMenu(!showOptionsMenu);
                  }}
                  className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="6" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="18" r="2"/>
                  </svg>
                </button>
                
                {/* Options dropdown menu */}
                {showOptionsMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(false);
                        onRemoveStory();
                      }}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                      </svg>
                      Remove from highlight
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(false);
                        onEditHighlight();
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit highlight
                    </button>
                    {/* Delete highlight button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(false);
                        onDeleteHighlight();
                      }}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      Delete highlight
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
