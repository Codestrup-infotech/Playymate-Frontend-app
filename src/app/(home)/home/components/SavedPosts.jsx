"use client";

import { useState, useEffect } from "react";
import { Bookmark, FolderOpen, Image as ImageIcon, Play, Heart, MessageSquare, X, ChevronRight } from "lucide-react";
import { getCollections, getBookmarks, removeBookmark, removeFromCollection, deleteCollection } from "@/app/user/share";
import postService from "@/app/user/post";

export default function SavedPosts({ isDark }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionPosts, setCollectionPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollections();
      console.log("Collections response:", data);
      setCollections(data?.collections || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError(err.message || "Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionClick = async (collection) => {
    setSelectedCollection(collection);
    setLoadingPosts(true);
    try {
      // Get all bookmarks and filter by collection
      const bookmarksData = await getBookmarks(50, null, null);
      const bookmarks = bookmarksData?.bookmarks || [];
      
      // Filter bookmarks that belong to this collection
      const collectionBookmarks = bookmarks.filter(
        (bookmark) => bookmark.collection_id === collection._id
      );
      
      // Fetch post details for each bookmark
      const posts = [];
      for (const bookmark of collectionBookmarks) {
        try {
          if (bookmark.content_type === "post") {
            const postData = await postService.getPost(bookmark.content_id);
            posts.push({
              ...postData.data?.data?.post || postData.data?.data || postData.data,
              bookmark_id: bookmark._id,
              bookmark_notes: bookmark.notes
            });
          }
        } catch (e) {
          console.error("Error fetching post:", e);
        }
      }
      
      setCollectionPosts(posts);
    } catch (err) {
      console.error("Error fetching collection posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleRemoveFromCollection = async (bookmarkId) => {
    if (!selectedCollection) return;
    try {
      await removeFromCollection(selectedCollection._id);
      // Refresh the collection posts
      handleCollectionClick(selectedCollection);
    } catch (err) {
      console.error("Error removing from collection:", err);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    try {
      await deleteCollection(selectedCollection._id);
      setSelectedCollection(null);
      fetchCollections();
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  const handlePostClick = (post) => {
    // This would open the post detail modal - handled by parent
    console.log("Post clicked:", post);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
          <Bookmark size={28} className="text-red-400" />
        </div>
        <p className="text-red-400 text-sm font-medium">{error}</p>
        <button
          onClick={fetchCollections}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If a collection is selected, show its posts
  if (selectedCollection) {
    return (
      <div>
        {/* Back button and header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedCollection(null);
              setCollectionPosts([]);
            }}
            className={`flex items-center gap-2 text-sm font-medium ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          >
            <ChevronRight className="rotate-180" size={20} />
            Back to Collections
          </button>
          <button
            onClick={handleDeleteCollection}
            className="text-red-500 text-sm hover:text-red-600"
          >
            Delete Collection
          </button>
        </div>

        {/* Collection name */}
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            {selectedCollection.collection_name}
          </h3>
          {selectedCollection.description && (
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {selectedCollection.description}
            </p>
          )}
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collectionPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {collectionPosts.map((post) => (
              <div
                key={post.post_id || post._id}
                className="aspect-[3/4] relative bg-gray-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
                onClick={() => handlePostClick(post)}
              >
                {post.media && post.media.length > 0 ? (
                  post.media[0].type === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={24} className="text-white" />
                    </div>
                  ) : (
                    <img
                      src={post.media[0].url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <MessageSquare size={20} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1 text-white text-sm font-medium">
                    <Heart size={16} className={post.is_liked ? "text-red-500" : ""} />
                    {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1 text-white text-sm font-medium">
                    <MessageSquare size={16} /> {post.comments_count || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <ImageIcon size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No posts in this collection</p>
            <p className="text-gray-600 text-xs mt-1">Save posts to see them here</p>
          </div>
        )}
      </div>
    );
  }

  // Show collections list
  return (
    <div>
      {collections.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection._id}
              onClick={() => handleCollectionClick(collection)}
              className={`rounded-xl p-4 cursor-pointer hover:opacity-90 transition ${
                isDark ? "bg-[#12122a] border border-white/5" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isDark ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <FolderOpen size={24} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                    {collection.collection_name}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {collection.bookmarks_count || 0} posts
                  </p>
                </div>
              </div>
              {collection.description && (
                <p className={`text-sm line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {collection.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
            <Bookmark size={28} className="text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No saved posts yet</p>
          <p className="text-gray-600 text-xs mt-1">Save posts to see them here</p>
        </div>
      )}
    </div>
  );
}
