"use client";

import { useState, useEffect } from "react";
import { X, Plus, Folder, Loader2, Bookmark } from "lucide-react";
import { getCollections, createCollection, addToCollection, getBookmarks, checkBookmark } from "@/app/user/share";

export default function CreateCollectionPopup({ 
  isOpen, 
  onClose, 
  contentId, 
  contentType,
  isDark,
  onSaveComplete 
}) {
  const [collections, setCollections] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [savingToAllBookmarks, setSavingToAllBookmarks] = useState(false);

  // Fetch collections and bookmarks when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both collections and bookmarks in parallel
      const [collectionsResult, bookmarksResult] = await Promise.all([
        getCollections(),
        getBookmarks(50, null, null)
      ]);
      
      console.log("Fetched collections:", collectionsResult);
      console.log("Fetched bookmarks:", bookmarksResult);
      
      setCollections(collectionsResult?.collections || []);
      setBookmarks(bookmarksResult?.bookmarks || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if content is already bookmarked
  const isBookmarked = bookmarks.some(
    bm => bm.content_id === contentId && bm.collections?.length === 0
  );

  const handleSaveToAllBookmarks = async () => {
    if (!contentId || !contentType) return;
    
    try {
      setSavingToAllBookmarks(true);
      
      // Check if already bookmarked
      const checkResult = await checkBookmark(contentId, contentType);
      
      if (checkResult?.bookmarked) {
        // Already bookmarked - just close
        console.log("Already bookmarked");
        onClose();
        return;
      }
      
      // Import addBookmark dynamically to avoid issues
      const { addBookmark } = await import("@/app/user/share");
      const result = await addBookmark(contentType, contentId);
      console.log("Saved to all bookmarks:", result);
      
      // Refresh bookmarks
      const bookmarksResult = await getBookmarks(50, null, null);
      setBookmarks(bookmarksResult?.bookmarks || []);
      
      // Notify parent about save completion
      if (onSaveComplete) {
        onSaveComplete(true);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save to bookmarks:", error);
    } finally {
      setSavingToAllBookmarks(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setCreating(true);
      const result = await createCollection(newCollectionName.trim(), newCollectionDescription.trim());
      console.log("Created collection:", result);
      
      // If there's a selected bookmark, add it to the new collection
      if (result && selectedBookmark) {
        try {
          await addToCollection(result._id, selectedBookmark);
          console.log("Added bookmark to new collection");
        } catch (addError) {
          console.error("Failed to add bookmark to collection:", addError);
        }
      }
      
      // Refresh collections
      const collectionsResult = await getCollections();
      setCollections(collectionsResult?.collections || []);
      
      setShowCreateForm(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setSelectedBookmark(null);
      
      // Close popup
      if (onSaveComplete) {
        onSaveComplete(true);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectCollection = async (collection) => {
    if (!selectedBookmark) {
      // No bookmark selected - need to create one first
      try {
        setSelectedCollection(collection);
        setAddingToCollection(true);
        
        // Create bookmark first
        const { addBookmark } = await import("@/app/user/share");
        const bookmarkResult = await addBookmark(contentType, contentId);
        console.log("Created bookmark:", bookmarkResult);
        
        // Add to collection
        await addToCollection(collection._id, bookmarkResult._id);
        console.log("Added to collection:", collection.collection_name);
        
        if (onSaveComplete) {
          onSaveComplete(true);
        }
        onClose();
      } catch (error) {
        console.error("Failed to add to collection:", error);
        if (error.code === "ALREADY_BOOKMARKED") {
          // If already bookmarked, just add to collection
          try {
            const { checkBookmark } = await import("@/app/user/share");
            const checkResult = await checkBookmark(contentId, contentType);
            if (checkResult?.bookmark_id) {
              await addToCollection(collection._id, checkResult.bookmark_id);
              if (onSaveComplete) {
                onSaveComplete(true);
              }
              onClose();
            }
          } catch (addError) {
            console.error("Failed to add to collection:", addError);
          }
        }
      } finally {
        setAddingToCollection(false);
        setSelectedCollection(null);
      }
      return;
    }
    
    // Add existing bookmark to collection
    try {
      setSelectedCollection(collection);
      setAddingToCollection(true);
      
      await addToCollection(collection._id, selectedBookmark);
      console.log("Added to collection:", collection.collection_name);
      
      if (onSaveComplete) {
        onSaveComplete(true);
      }
      onClose();
    } catch (error) {
      console.error("Failed to add to collection:", error);
      // If already in collection, still close
      if (error.code === "ALREADY_IN_COLLECTION") {
        onClose();
      }
    } finally {
      setAddingToCollection(false);
      setSelectedCollection(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Save
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`animate-spin ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            </div>
          ) : (
            <>
              {/* Collections Section */}
              <p className={`text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Collections
              </p>
              
              {collections.length === 0 && !showCreateForm ? (
                <div className="text-center py-4">
                  <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-2`}>
                    No collections yet
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    Create your first collection
                  </button>
                </div>
              ) : (
                <>
                  {/* Collection List */}
                  {collections.length > 0 && !showCreateForm && (
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <button
                          key={collection._id}
                          onClick={() => handleSelectCollection(collection)}
                          disabled={addingToCollection}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isDark 
                              ? "hover:bg-gray-700" 
                              : "hover:bg-gray-100"
                          } ${selectedCollection?._id === collection._id ? "bg-purple-50 dark:bg-purple-900/20" : ""}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                          }`}>
                            <Folder className={isDark ? "text-gray-400" : "text-gray-500"} size={20} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {collection.collection_name}
                            </p>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {collection.bookmark_count || 0} posts
                            </p>
                          </div>
                          {selectedCollection?._id === collection._id && addingToCollection && (
                            <Loader2 className="animate-spin text-purple-500" size={20} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Create Collection Form */}
                  {showCreateForm ? (
                    <form onSubmit={handleCreateCollection} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Collection name"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Description (optional)"
                          value={newCollectionDescription}
                          onChange={(e) => setNewCollectionDescription(e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-2 rounded-lg border resize-none ${
                            isDark 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={creating || !newCollectionName.trim()}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creating ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus size={18} />
                              Create
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewCollectionName("");
                            setNewCollectionDescription("");
                          }}
                          className={`px-4 py-2 rounded-lg ${
                            isDark 
                              ? "text-gray-400 hover:bg-gray-700" 
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Show "Create New" button when collections exist
                    collections.length > 0 && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg mt-2 ${
                          isDark 
                            ? "hover:bg-gray-700 text-purple-400" 
                            : "hover:bg-gray-100 text-purple-600"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}>
                          <Plus size={20} />
                        </div>
                        <span className="font-medium">Create New Collection</span>
                      </button>
                    )
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}