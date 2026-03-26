"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CheckCircle, Heart, MessageSquare, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import postService from "@/app/user/post";
import { toggleLike } from "@/app/user/homefeed";
import { getPostShareCount, addBookmark, checkBookmark, getCollections, createCollection, addToCollection, removeBookmark } from "@/app/user/share";
import SharePopup from "@/app/(home)/home/components/sharepopup";

// ✅ 1. Import the emoji picker
import ComposeEmojiPicker from "./Composeemojipicker";

// Helper function to format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return "now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}W`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}M`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y`;
  }
}

export default function PostDetailModal({
  isDark,
  selectedPost,
  selectedPostLoading,
  showPostModal,
  onClose,
  onPostUpdate,
  currentUser
}) {

  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [postData, setPostData] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEditMenu, setShowEditMenu] = useState(false);

  
  

  // ✅ 2. Add emoji picker state + comment input ref
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentInputRef = useRef(null);

  // Bookmark state
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null); // Store the bookmark_id
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const menuRef = useRef(null);
  const isLikedRef = useRef(false);
  const router = useRouter();

  // Fetch like status from API when opening a post
  const fetchLikeStatus = async (contentId, contentType = "post") => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`/api/v1/${contentType}s/${contentId}/like-check`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.data?.liked ?? data.liked ?? null; // Return null if not found (don't default to false)
    } catch (error) {
      console.log("Like check failed:", error);
      return null; // Return null to indicate API failed
    }
  };

useEffect(() => {
  if (selectedPost) {
    const postId = selectedPost.post_id || selectedPost._id;
    const contentType = selectedPost.content_type || "post";

    // First, set the data with existing is_liked value (from profile page)
    // This is the initial truth - don't overwrite until API confirms
    const existingIsLiked = 
      selectedPost.is_liked === true || 
      selectedPost.is_liked === "true" ||
      selectedPost.user_action?.liked_by_you === true;

    const normalizedPost = {
      ...selectedPost,
      is_liked: existingIsLiked
    };

    setPostData(normalizedPost);
    isLikedRef.current = existingIsLiked;

    // Then check API - only update if API returns a definitive value
    if (postId) {
      fetchLikeStatus(postId, contentType).then(apiLiked => {
        // Only update if API returns a clear true/false (not null)
        if (apiLiked !== null) {
          setPostData(prev =>
            prev ? { ...prev, is_liked: !!apiLiked } : prev
          );
          isLikedRef.current = !!apiLiked;
        }
        // If API returns null (failed), keep the existing is_liked value
      });
      // Check bookmark status
      checkBookmarkStatus();
    }
  }
}, [selectedPost]);


  useEffect(() => {
    if (!showPostModal) {
      setCommentText("");
      setReplyToComment(null);
      setOpenMenuId(null);
      setEditingComment(null);
      setShowEditMenu(false);
      setShowEmojiPicker(false); // ✅ close picker when modal closes
    }
  }, [showPostModal]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
        setShowEditMenu(false);
      }
    };

    if (openMenuId || showEditMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, showEditMenu]);

  // ✅ 3. Emoji insert at cursor position
  const handleEmojiPick = (emoji) => {
    const input = commentInputRef.current;
    if (!input) {
      setCommentText((prev) => prev + emoji);
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = commentText.slice(0, start) + emoji + commentText.slice(end);
    setCommentText(newText);

    // Restore cursor right after the inserted emoji
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    });
  };

  // ----------------------------
  // Delete Comment
  // ----------------------------

  
  const handleDeleteComment = async (commentId) => {
    console.log('Delete attempt - currentUser:', currentUser);
    console.log('Delete attempt - post author:', postData?.author);
    
    try {
      await postService.deleteComment(commentId);
      
      setPostData(prev => {
        const updatedComments = (prev.comments || []).filter(c => c.comment_id !== commentId && c.id !== commentId);
        return {
          ...prev,
          comments: updatedComments,
          comments_count: Math.max(0, (prev.comments_count || 1) - 1)
        };
      });
      
      setOpenMenuId(null);
    } catch (error) {
      console.error("Delete comment error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete comment";
      alert(errorMessage);
    }
  };

  // ----------------------------
  // Update Comment
  // ----------------------------

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await postService.updateComment(commentId, editText.trim());
      
      setPostData(prev => ({
        ...prev,
        comments: (prev.comments || []).map(c => 
          (c.comment_id === commentId || c.id === commentId) 
            ? { ...c, text: editText.trim(), edited_at: new Date().toISOString() }
            : c
        )
      }));

      setEditingComment(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Update comment error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update comment";
      alert(errorMessage);
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment.comment_id || comment.id);
    setEditText(comment.text);
    setOpenMenuId(null);
  };

  // ----------------------------
  // Like / Unlike
  // ----------------------------

  const handleLikeToggle = async () => {
    if (!postData || isLiking) return;

    setIsLiking(true);

    const postId = postData.post_id;
    const currentlyLiked = isLikedRef.current;
   const newIsLiked = !Boolean(isLikedRef.current);

isLikedRef.current = newIsLiked;

setPostData(prev => ({
  ...prev,
  is_liked: newIsLiked,
  likes_count: newIsLiked
    ? (prev.likes_count || 0) + 1
    : Math.max(0, (prev.likes_count || 1) - 1)
}));

    try {
      await toggleLike("post", postId);

      if (onPostUpdate) {
        onPostUpdate({ ...postData, is_liked: newIsLiked });
      }
    } catch (error) {
      console.error("Like error:", error);
      isLikedRef.current = currentlyLiked;
      setPostData(prev => ({
        ...prev,
        is_liked: currentlyLiked,
        likes_count: currentlyLiked
          ? (prev.likes_count || 0) + 1
          : Math.max(0, (prev.likes_count || 1) - 1)
      }));
    } finally {
      setIsLiking(false);
    }
  };

  // ----------------------------
  // Reply Click
  // ----------------------------

  const handleReplyClick = (comment) => {
    setReplyToComment(comment);
    setCommentText(`@${comment.author?.username || comment.user?.username || 'user'} `);
    commentInputRef.current?.focus(); // ✅ focus input on reply
  };

  // ----------------------------
  // Post Comment
  // ----------------------------

  const handlePostComment = async () => {

    if (!postData || !commentText.trim() || isPostingComment) return;

    setIsPostingComment(true);
    setShowEmojiPicker(false); // ✅ close picker when posting

    try {

      const postId = postData.post_id;

      if (replyToComment) {
        const commentId = replyToComment.comment_id || replyToComment.id;
        
        const newReply = {
          id: Date.now().toString(),
          text: commentText.trim(),
          author: {
            full_name: currentUser?.full_name || "You",
            username: currentUser?.username || "you",
            profile_image_url: currentUser?.profile_image_url || currentUser?.profile_photos?.[0]?.url || ""
          },
          created_at: new Date().toISOString()
        };

        setPostData(prev => ({
          ...prev,
          comments: prev.comments.map(c => {
            if (c.comment_id === commentId || c.id === commentId) {
              return {
                ...c,
                replies: [newReply, ...(c.replies || [])],
                replies_count: (c.replies_count || 0) + 1
              };
            }
            return c;
          })
        }));

        try {
          await postService.replyToComment(commentId, commentText.trim());
        } catch (replyError) {
          console.error('Reply failed:', replyError);
        }
        
        setCommentText("");
        setReplyToComment(null);
      } else {
        const newComment = {
          id: Date.now().toString(),
          text: commentText.trim(),
          author: {
            full_name: currentUser?.full_name || "You",
            username: currentUser?.username || "you",
            profile_image_url: currentUser?.profile_image_url || currentUser?.profile_photos?.[0]?.url || ""
          },
          created_at: new Date().toISOString()
        };

        setPostData(prev => ({
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
          comments_count: (prev.comments_count || 0) + 1
        }));

        await postService.createComment(postId, {
          text: commentText.trim()
        });

        setCommentText("");
      }

    } catch (error) {
      console.error("Comment error:", error);
    }

    setIsPostingComment(false);
  };

  // ----------------------------
  // Share
  // ----------------------------
  const [shareOpen, setShareOpen] = useState(false);

  const handleShare = () => setShareOpen(true);

  // Update share count after successful share
  const handleShareSuccess = async () => {
    if (!postData?.post_id) return;
    try {
      const result = await getPostShareCount(postData.post_id);
      setPostData(prev => ({
        ...prev,
        shares_count: result.count
      }));
    } catch (error) {
      console.error("Failed to update share count:", error);
      // Increment locally as fallback
      setPostData(prev => ({
        ...prev,
        shares_count: (prev.shares_count || 0) + 1
      }));
    }
  };

  // ----------------------------
  // Bookmark Functions
  // ----------------------------

  const checkBookmarkStatus = async () => {
    console.log("=== CHECK BOOKMARK STATUS ===");
    const contentId = postData?.post_id || postData?._id;
    console.log("Content ID:", contentId);
    if (!contentId) return;
    try {
      console.log("Calling checkBookmark API for:", contentId, "type: post");
      const result = await checkBookmark(contentId, "post");
      console.log("Check bookmark result:", result);
      setIsBookmarked(result.bookmarked);
      setBookmarkId(result.bookmark_id); // Store the bookmark_id
      console.log("Is bookmarked set to:", result.bookmarked, "bookmark_id:", result.bookmark_id);
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  const fetchCollections = async () => {
    console.log("=== FETCH COLLECTIONS ===");
    try {
      console.log("Calling getCollections API...");
      const result = await getCollections();
      console.log("Collections API response:", result);
      setCollections(result?.collections || []);
      console.log("Collections set to state:", result?.collections || []);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      setCollections([]);
    }
  };

  const handleBookmarkClick = async () => {
    console.log("=== BOOKMARK CLICK HANDLER ===");
    const contentId = postData?.post_id || postData?._id;
    console.log("Content ID:", contentId, "Current isBookmarked:", isBookmarked, "bookmarkId:", bookmarkId);
    
    if (!contentId) {
      console.log("No content ID, returning");
      return;
    }
    
    setBookmarkLoading(true);
    try {
      if (isBookmarked && bookmarkId) {
        // Already bookmarked - remove the bookmark (toggle off)
        console.log("Removing bookmark:", bookmarkId);
        await removeBookmark(bookmarkId);
        console.log("Bookmark removed successfully");
        setIsBookmarked(false);
        setBookmarkId(null);
        setShowBookmarkModal(false);
      } else {
        // Not bookmarked - create bookmark first
        console.log("Creating new bookmark for:", contentId);
        const bookmarkResult = await addBookmark("post", contentId);
        console.log("Bookmark created:", bookmarkResult);
        
        // Store the bookmark_id and turn button black
        setIsBookmarked(true);
        setBookmarkId(bookmarkResult._id);
        console.log("Set bookmark_id:", bookmarkResult._id);
        
        // Fetch collections and show popup
        console.log("Fetching collections...");
        const collectionsResult = await getCollections();
        const fetchedCollections = collectionsResult?.collections || [];
        console.log("Collections fetched:", fetchedCollections);
        setCollections(fetchedCollections);
        
        // Open the collection modal
        console.log("Opening bookmark modal");
        setShowBookmarkModal(true);
      }
      
    } catch (error) {
      console.error("Failed to handle bookmark:", error);
      // Handle 409 ALREADY_BOOKMARKED error
      if (error.code === "ALREADY_BOOKMARKED") {
        console.log("Already bookmarked - fetching bookmark_id");
        const checkResult = await checkBookmark(contentId, "post");
        if (checkResult.bookmarked && checkResult.bookmark_id) {
          setIsBookmarked(true);
          setBookmarkId(checkResult.bookmark_id);
        }
      }
      // Handle 404 on delete - silently reset
      if (error.status === 404 && isBookmarked) {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCreateAndSave = async () => {
    console.log("=== HANDLE CREATE AND SAVE ===");
    const contentId = postData?.post_id || postData?._id;
    console.log("Content ID:", contentId);
    console.log("Collection name:", newCollectionName);
    console.log("Current bookmarkId:", bookmarkId);
    
    if (!newCollectionName.trim() || !contentId) {
      console.log("Missing required params");
      return;
    }
    try {
      // Create new collection
      console.log("Creating new collection...");
      const newCollection = await createCollection(newCollectionName.trim(), "", "private");
      console.log("Created collection:", newCollection);
      
      // Use bookmarkId from state if available, otherwise check and create
      let currentBookmarkId = bookmarkId;
      if (!currentBookmarkId) {
        console.log("No bookmarkId in state, checking...");
        const checkResult = await checkBookmark(contentId, "post");
        console.log("Check result:", checkResult);
        if (checkResult.bookmarked && checkResult.bookmark_id) {
          currentBookmarkId = checkResult.bookmark_id;
        } else {
          const bookmarkResult = await addBookmark("post", contentId);
          currentBookmarkId = bookmarkResult._id;
          setBookmarkId(currentBookmarkId);
        }
      }
      
      // Add bookmark to collection
      console.log("Adding to collection:", newCollection._id, "bookmark:", currentBookmarkId);
      await addToCollection(newCollection._id, currentBookmarkId);
      console.log("Added to collection:", newCollection._id);
      
      // Show success
      alert(`Saved to ${newCollection.collection_name}`);
      
      // Refresh collections so profile updates immediately.
      const collectionsResult = await getCollections();
      setCollections(collectionsResult?.collections || []);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("playmate:collectionsUpdated"));
      }

      setIsBookmarked(true);
      setShowCreateCollection(false);
      setNewCollectionName("");
      setShowBookmarkModal(false);
      console.log("=== CREATE AND SAVE COMPLETE ===");
    } catch (error) {
      console.error("Failed to create and save:", error);
    }
  };

  const handleSaveToCollection = async (collection) => {
    console.log("=== HANDLE SAVE TO COLLECTION ===");
    console.log("Collection:", collection);
    console.log("Collection ID:", collection._id);
    console.log("Current bookmarkId:", bookmarkId);
    
    const contentId = postData?.post_id || postData?._id;
    console.log("Content ID:", contentId);
    
    if (!contentId || !collection?._id || !bookmarkId) {
      console.log("Missing contentId, collection._id, or bookmarkId");
      return;
    }
    try {
      // Add to collection using the bookmarkId from state
      console.log("Adding to collection:", collection._id, "bookmark:", bookmarkId);
      await addToCollection(collection._id, bookmarkId);
      console.log("Successfully added to collection");
      
      // Show success
      alert(`Saved to ${collection.collection_name}`);
      
      // Refresh collections so profile updates immediately.
      const collectionsResult = await getCollections();
      setCollections(collectionsResult?.collections || []);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("playmate:collectionsUpdated"));
      }

      setShowBookmarkModal(false);
      console.log("=== SAVE COMPLETE ===");
    } catch (error) {
      console.error("Failed to save to collection:", error);
      // Handle 409 ALREADY_IN_COLLECTION
      if (error.code === "ALREADY_IN_COLLECTION") {
        alert("Already saved to this collection");
      }
    }
  };

  // ----------------------------
  // Edit Post Menu
  // ----------------------------

  const handleEditClick = () => {
    setShowEditMenu(false);
    if (onClose) {
      onClose();
    }
    const postId = postData?.post_id;
    if (postId) {
      router.push(`/home/create-post?edit=${postId}`);
    }
  };

  const handleDeletePost = async () => {
    setShowEditMenu(false);
    if (!postData) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      console.log("Deleting post with ID:", postData.post_id);
      const response = await postService.deletePost(postData.post_id);
      console.log("Delete response:", response);
      
      if (response?.data?.status === 'success') {
        if (onClose) {
          onClose();
        }
        if (onPostUpdate) {
          onPostUpdate({ ...postData, is_deleted: true });
        }
      } else {
        throw new Error(response?.data?.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error("Delete post error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete post";
      alert(errorMessage);
    }
  };

  if (!showPostModal) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

      <div className={`relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row ${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-orange-600 bg-slate-100 p-1 rounded-full "
        >
          <XCircle size={26}/>
        </button>

        {/* THREE DOT BUTTON */}
        <div className="absolute top-4 right-16 z-20" ref={menuRef}>
          <button
            onClick={() => setShowEditMenu(!showEditMenu)}
            className="text-gray-700 bg-slate-100 p-1 rounded-full hover:bg-gray-200"
          >
            <MoreHorizontal size={26}/>
          </button>

          {showEditMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30">
              <button
                onClick={handleEditClick}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                Edit
              </button>
              <button
                onClick={handleDeletePost}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {selectedPostLoading ? (

          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/>
          </div>

        ) : postData ? (

        <>

        {/* MEDIA */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
          {postData.media && postData.media.length > 0 ? (
            postData.media[0].type === "video" ?
            <video src={postData.media[0].url} controls className="max-h-full max-w-full object-contain"/>
            :
            <img src={postData.media[0].url} className="max-h-full max-w-full object-contain"/>
          ) : (
            <p className="text-gray-400">No media</p>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 flex flex-col">

          {/* AUTHOR */}
          <div className="flex items-center gap-3 p-4 border-b">
            <img
              src={postData.author?.profile_image_url || "/loginAvatars/profile.png"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {postData.author?.username || postData.author?.full_name}
              </p>
              {postData.content?.location && (
                <p className="text-xs text-gray-400">
                  {typeof postData.content.location === 'string'
                    ? postData.content.location
                    : postData.content.location?.display_text || postData.content.location?.city || ''}
                </p>
              )}
            </div>
            {postData.author?.is_verified && <CheckCircle size={16} className="text-blue-400"/>}
          </div>

          {/* COMMENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* CAPTION */}
            {postData.content?.text && (
              <div className="flex gap-2">
                <span className="font-semibold">
                  {postData.author?.username || postData.author?.full_name || 'user'}
                </span>
                <span>{postData.content.text}</span>
              </div>
            )}

            {/* COMMENTS LIST */}
            {postData.comments && postData.comments.map((comment, i) => {

              const username =
                comment.author?.username ||
                comment.user?.username ||
                comment.author?.full_name ||
                comment.user?.full_name ||
                "user";

              const userPhoto = comment.author?.profile_image_url || comment.user?.profile_image_url || "/loginAvatars/profile.png";
              const time = formatRelativeTime(comment.created_at);
              const commentId = comment.comment_id || comment.id;
              const isMenuOpen = openMenuId === commentId;
              const isEditing = editingComment === commentId;
              
              const commentAuthorId = String(comment.author?.user_id || comment.user?.user_id || '');
              const postAuthorId    = String(postData.author?.user_id || postData.author?._id || postData.author?.id || '');
              const currentUserId   = String(currentUser?._id || currentUser?.user_id || currentUser?.id || '');
              
              const isOwnComment = currentUser && (
                commentAuthorId === currentUserId ||
                postAuthorId === currentUserId ||
                comment.author?.username === currentUser?.username ||
                comment.user?.username === currentUser?.username
              );

              return (
                <div key={comment.comment_id || comment.id || i} className="flex gap-3 group">
                  <img src={userPhoto} alt={username} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>

                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={`flex-1 outline-none border rounded px-2 py-1 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        />
                        <button onClick={() => handleUpdateComment(commentId)} className="text-purple-500 font-semibold text-sm">Save</button>
                        <button onClick={() => setEditingComment(null)} className="text-gray-400 text-sm">Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold mr-2">{username}</span>
                        <span>{comment.text}</span>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 flex gap-3 mt-1 items-center">
                      <span>{time}</span>
                      <button onClick={() => handleReplyClick(comment)} className="font-semibold hover:text-purple-400">Reply</button>

                      {isOwnComment && (
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={() => setOpenMenuId(isMenuOpen ? null : commentId)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal size={16}/>
                          </button>

                          {isMenuOpen && (
                            <div className={`absolute right-0 top-6 z-10 rounded-lg shadow-lg border ${isDark ? 'bg-[#1a1a2e] border-gray-600' : 'bg-white border-gray-200'} min-w-[120px]`}>
                              <table className="w-full">
                                <tbody>
                                  <tr><td>
                                    <button onClick={() => startEditing(comment)} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'text-white' : 'text-gray-900'}`}>Update</button>
                                  </td></tr>
                                  <tr><td>
                                    <button onClick={() => handleDeleteComment(commentId)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                                  </td></tr>
                                  <tr><td>
                                    <button onClick={() => setOpenMenuId(null)} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cancel</button>
                                  </td></tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                        {comment.replies.map((reply, idx) => (
                          <div key={reply.comment_id || reply.id || idx} className="flex gap-2">
                            <img
                              src={reply.author?.profile_image_url || reply.user?.profile_image_url || "/loginAvatars/profile.png"}
                              alt={reply.author?.username || 'user'}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-sm mr-2">
                                {reply.author?.username || reply.user?.username || reply.author?.full_name || 'user'}
                              </span>
                              <span className="text-sm">{reply.text}</span>
                              <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(reply.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIONS */}
       <div className="p-4 border-t">
  {/* ICONS + COUNTS */}
  <div className="flex space-x-20 text-center">

    {/* LIKE */}
    <div className="flex flex-col items-center">
      <button onClick={handleLikeToggle}>
        <Heart
          size={24}
          fill={(postData?.likes_count > 0) ? "red" : "none"}
          className={(postData?.likes_count > 0) ? "text-red-500" : "text-black"}
          strokeWidth={2}
        />
      </button>
      <span className="text-black text-sm font-medium">
        {postData.likes_count || 0} likes
      </span>
    </div>

    {/* COMMENT */}
   {/* COMMENT */}
<div className="flex flex-col items-center">
  <button onClick={() => commentInputRef.current?.focus()}>
    <MessageSquare size={24} className="text-black" />
  </button>
  <span className="text-black text-sm font-medium mt-1">
    {postData.comments_count || postData.comments?.length || 0} comments
  </span>
</div>

    {/* SHARE */}
    <div className="flex flex-col items-center">
      <button onClick={handleShare}>
        <Share2 size={24} className="text-black" />
      </button>
      <span className="text-black text-sm font-medium">
        {postData.shares_count || postData.engagement?.shares_count || 0} shares
      </span>
    </div>

    {/* BOOKMARK */}
    <div className="flex flex-col items-center">
      <button 
        onClick={handleBookmarkClick} 
        disabled={bookmarkLoading}
        className={`p-2 rounded-full transition-colors ${bookmarkLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
      >
        <Bookmark 
          size={24} 
          className={isBookmarked ? "text-purple-500" : isDark ? "text-white" : "text-black"}
          fill={isBookmarked ? "#a855f7" : "none"}
        />
      </button>
      <span className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
        {bookmarkLoading ? "Saving..." : isBookmarked ? "Saved" : "Save"}
      </span>
    </div>

  </div>

  {/* Share Popup */}
  <SharePopup
    isOpen={shareOpen}
    onClose={() => setShareOpen(false)}
    contentType="post"
    contentId={postData.post_id || postData._id}
    thumbnail={postData.media?.[0]?.url || postData.thumbnail || null}
    title={postData.caption || postData.title || null}
    onShareSuccess={handleShareSuccess}
  />

  {/* Bookmark Collection Modal */}
  {(showBookmarkModal || showCreateCollection) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full max-w-md rounded-xl p-6 ${isDark ? "bg-[#1a1a38]" : "bg-white"}`}>
        {showCreateCollection ? (
          <>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
              Create New Collection
            </h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Enter collection name"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#12122a] border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateCollection(false);
                  setNewCollectionName("");
                }}
                className={`flex-1 py-2 rounded-lg ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAndSave}
                disabled={!newCollectionName.trim()}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                Create & Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                Save to Collection
              </h3>
              <button
                onClick={() => setShowBookmarkModal(false)}
                className={isDark ? "text-gray-400" : "text-gray-500"}
              >
                ✕
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowBookmarkModal(false);
                setShowCreateCollection(true);
              }}
              className={`w-full p-3 rounded-lg mb-3 flex items-center gap-3 ${isDark ? "bg-[#12122a]" : "bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-500 text-lg">+</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-800"}>Create New Collection</span>
            </button>

            <div className="max-h-60 overflow-y-auto">
              {collections.map((collection) => (
                <button
                  key={collection._id}
                  onClick={() => handleSaveToCollection(collection)}
                  className={`w-full p-3 rounded-lg mb-2 flex items-center gap-3 ${isDark ? "hover:bg-[#12122a]" : "hover:bg-gray-50"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                    <span className="text-purple-400">📁</span>
                  </div>
                  <div className="text-left">
                    <p className={isDark ? "text-white" : "text-gray-800"}>
                      {collection.collection_name}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {collection.bookmark_count || collection.bookmarks_count || 0} posts
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Save without collection option */}
            <button
              onClick={() => {
                console.log("Save without collection clicked");
                setShowBookmarkModal(false);
                alert("Saved!");
              }}
              className={`w-full p-3 mt-3 rounded-lg flex items-center justify-center ${isDark ? "border border-gray-600 text-gray-300" : "border border-gray-300 text-gray-600"}`}
            >
              <span>Save without collection</span>
            </button>
          </>
        )}
      </div>
    </div>
  )}
</div>

          {/* ✅ 4. COMMENT INPUT with emoji picker */}
          <div className="border-t p-3">

            {/* Reply banner */}
            {replyToComment && (
              <div className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-lg px-3 py-1.5 mb-2">
                <p className="text-xs text-pink-600 truncate">
                  ↩ Replying to <span className="font-semibold">@{replyToComment.author?.username || replyToComment.user?.username || 'user'}</span>
                </p>
                <button onClick={() => { setReplyToComment(null); setCommentText(""); }} className="ml-2 text-pink-400 hover:text-pink-600 flex-shrink-0 text-lg leading-none">×</button>
              </div>
            )}

            <div className="flex items-center gap-2 relative">

              {/* Emoji button + picker */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-colors ${
                    showEmojiPicker ? "bg-pink-100" : "hover:bg-gray-100"
                  }`}
                  title="Emoji"
                >
                  😊
                </button>

                {/* Picker opens upward so it doesn't get clipped */}
                {showEmojiPicker && (
                  <div className="absolute bottom-10 left-0">
                    <ComposeEmojiPicker
                      onPick={handleEmojiPick}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Text input */}
             <input
  ref={commentInputRef}
  value={commentText}
  onChange={(e) => setCommentText(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
  placeholder={replyToComment ? "Write a reply..." : "Add a comment..."}
  className="flex-1 outline-none bg-transparent text-sm caret-black focus:outline-none"
/>

              {/* Post button */}
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || isPostingComment}
                className="text-purple-500 font-semibold text-sm disabled:opacity-40 flex-shrink-0"
              >
                {isPostingComment ? "..." : "Post"}
              </button>
            </div>
          </div>

        </div>

        </>

        ) : (
          <div className="flex-1 flex items-center justify-center">Post not found</div>
        )}

      </div>
    </div>
  );
}