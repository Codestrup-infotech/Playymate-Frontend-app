"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CheckCircle, Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import postService from "@/app/user/post";
import { toggleLike } from "@/app/user/homefeed";
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

  const menuRef = useRef(null);
  const isLikedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedPost) {
      setPostData(selectedPost);
      isLikedRef.current = selectedPost.is_liked === true;
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
    const newIsLiked = !currentlyLiked;
    
    isLikedRef.current = newIsLiked;

    setPostData(prev => ({
      ...prev,
      is_liked: newIsLiked,
      likes_count: currentlyLiked
        ? Math.max(0, (prev.likes_count || 1) - 1)
        : (prev.likes_count || 0) + 1
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
  <div className="flex gap-6 mb-2">
    <button onClick={handleLikeToggle}>
      <Heart size={24} className={postData.is_liked ? "text-red-500 fill-red-500" : ""} />
    </button>
    <MessageSquare size={24} />
    <button onClick={handleShare}>
      <Share2 size={24} />
    </button>
  </div>
  <p className="font-semibold">{postData.likes_count || 0} likes</p>
  {(postData.comments_count > 0 || postData.comments?.length > 0) && (
    <p className="text-sm text-gray-400 mt-1">
      {postData.comments_count || postData.comments?.length || 0} comments
    </p>
  )}

  {/* Share Popup */}
  <SharePopup
    isOpen={shareOpen}
    onClose={() => setShareOpen(false)}
    contentType="post"
    contentId={postData.post_id || postData._id}
    thumbnail={postData.media?.[0]?.url || postData.thumbnail || null}
    title={postData.caption || postData.title || null}
  />
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
                className="flex-1 outline-none bg-transparent text-sm"
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