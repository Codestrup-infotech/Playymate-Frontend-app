"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, MessageSquare, Share2, CheckCircle, Bookmark } from "lucide-react";
import postService from "@/app/user/post";
import { toggleLike } from "@/app/user/homefeed";
import { getPostShareCount, addBookmark, checkBookmark, getCollections, createCollection, addToCollection } from "@/app/user/share";
import SharePopup from "@/app/(home)/home/components/sharepopup";
import ComposeEmojiPicker from "./Composeemojipicker";
import { MoreHorizontal } from "lucide-react";
import ThreeDotButton from "./ThreeDotButton";

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

export default function UserPostDetailModal({
  post,
  isLoading,
  onClose,
  currentUser
}) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [postData, setPostData] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  
  const commentInputRef = useRef(null);
  const isLikedRef = useRef(false);

  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch like status from API
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
      return data.data?.liked ?? data.liked ?? null;
    } catch (error) {
      console.log("Like check failed:", error);
      return null;
    }
  };

  useEffect(() => {
    if (post) {
       setCurrentIndex(0); // ✅ ADD THIS
      const postId = post.post_id || post._id || post.id;
      const contentType = post.content_type || "post";

      console.log("UserPostDetailModal - post:", post, "postId:", postId);

      if (!postId) {
        console.error("No post ID found in post object:", post);
        return;
      }

      // Set initial data
      setPostData(post);
      isLikedRef.current = post.is_liked || false;

      // Fetch like status
      fetchLikeStatus(postId, contentType).then(liked => {
        if (liked !== null) {
          isLikedRef.current = liked;
          setPostData(prev => ({ ...prev, is_liked: liked }));
        }
      }).catch(err => console.log("Like status fetch error:", err));

      // Fetch share count - wrap in try/catch
      try {
        getPostShareCount(postId, contentType).then(countResult => {
          // Handle different response formats
          const count = countResult?.count ?? countResult ?? 0;
          setShareCount(typeof count === 'number' ? count : 0);
        }).catch(err => {
          console.log("Share count fetch error:", err);
          setShareCount(0);
        });
      } catch (err) {
        console.log("Share count error:", err);
        setShareCount(0);
      }

      // Fetch comments from API
    postService.getPostComments(postId, 50)
  .then((res) => {
    console.log("RAW COMMENTS API:", res);

    const comments =
      res?.data?.data?.comments ||   // axios wrapped
      res?.data?.comments ||         // direct
      res?.comments ||               // fallback
      [];

    setPostData(prev => ({
      ...prev,
      comments: Array.isArray(comments) ? comments : []
    }));
  })
  .catch(err => {
    console.log("Comments fetch error:", err);
  });
    }
  }, [post]);

  // Handle like/unlike
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

  // Handle emoji pick
  const handleEmojiPick = (emoji) => {
    setCommentText(prev => prev + emoji);
  };

  // Handle reply click
  const handleReplyClick = (comment) => {
    setReplyToComment(comment);
    setCommentText(`@${comment.author?.username || comment.user?.username || 'user'} `);
    commentInputRef.current?.focus();
  };

  // Handle post comment
  const handlePostComment = async () => {
    if (!postData || !commentText.trim() || isPostingComment) return;

    setIsPostingComment(true);
    setShowEmojiPicker(false);

    try {
      const postId = postData.post_id;

      if (replyToComment) {
        const commentId = replyToComment.comment_id || replyToComment.id;
        
        const newReply = {
          id: Date.now().toString(),
          text: commentText.trim(),
          author: {
            user_id: currentUser?._id,
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
            user_id: currentUser?._id,
            full_name: currentUser?.full_name || "You",
            username: currentUser?.username || "you",
            profile_image_url: currentUser?.profile_image_url || currentUser?.profile_photos?.[0]?.url || ""
          },
          created_at: new Date().toISOString()
        };

        setPostData(prev => ({
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
          comments_count: (prev.comments_count || prev.comments?.length || 0) + 1
        }));

        try {
          await postService.addComment(postId, commentText.trim());
        } catch (commentError) {
          console.error('Comment failed:', commentError);
        }

        setCommentText("");
      }
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
  try {
    await postService.deleteComment(commentId);

    setPostData(prev => ({
      ...prev,
      comments: prev.comments.filter(
        c => (c.comment_id || c.id) !== commentId
      ),
      comments_count: Math.max(0, (prev.comments_count || 1) - 1)
    }));

    setActiveCommentMenu(null);
  } catch (err) {
    console.log("Delete failed:", err);
  }
};

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
    setActiveCommentMenu(null);
  } catch (err) {
    console.log("Update failed:", err);
    
    // Get error message from response
    let errorMessage = "Failed to update comment";
    const responseData = err.response?.data;
    
    if (responseData) {
      if (responseData.error_code === "EDIT_WINDOW_CLOSED") {
        errorMessage = "Edit window has closed. You can only edit comments within 5 minutes of posting.";
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(errorMessage);
  }
};

const handleDeleteReply = async (commentId, replyId) => {
  console.log('DeleteReply - commentId:', commentId, 'replyId:', replyId);
  try {
    await postService.deleteComment(replyId);

    setPostData(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if ((c.comment_id || c.id) === commentId) {
          return {
            ...c,
            replies: c.replies.filter(r => (r.id || r.comment_id) !== replyId),
            replies_count: Math.max(0, (c.replies_count || 1) - 1)
          };
        }
        return c;
      })
    }));
  } catch (err) {
    console.log("Reply delete failed:", err);
  }
};

const handleUpdateReply = async (commentId, replyId) => {
  if (!editText.trim()) return;

  try {
    await postService.updateComment(replyId, editText.trim());

    setPostData(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if ((c.comment_id || c.id) === commentId) {
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === replyId
                ? { ...r, text: editText.trim(), edited_at: new Date().toISOString() }
                : r
            )
          };
        }
        return c;
      })
    }));

    setEditingComment(null);
    setActiveCommentMenu(null);
  } catch (err) {
    console.log("Reply update failed:", err);
  }
};

// Handle share
  const handleShare = () => {
    setShareOpen(true);
  };

  const handleShareSuccess = () => {
    setShareCount(prev => prev + 1);
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
        >
          <X size={28} />
        </button>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : postData ? (
          <>
            {/* MEDIA */}
           <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">

  {postData.media && postData.media.length > 0 ? (
    <>
      {/* CURRENT MEDIA */}
      {postData.media[currentIndex].type === "video" ? (
        <video
          src={postData.media[currentIndex].url}
          controls
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <img
          src={postData.media[currentIndex].url}
          className="max-h-full max-w-full object-contain"
          alt="Post media"
        />
      )}

      {/* LEFT ARROW */}
      {postData.media.length > 1 && currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="absolute flex justify-center items-center left-3 top-1/2 -translate-y-1/2 h-8 w-8 text-4xl  bg-[#cacaca]/30 text-white p-2 rounded-full"
        >
          ‹
        </button>
      )}

      {/* RIGHT ARROW */}
      {postData.media.length > 1 && currentIndex < postData.media.length - 1 && (
        <button
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="absolute flex justify-center items-center right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-4xl bg-black/50 text-white p-2 rounded-full"
        >
          ›
        </button>
      )}

      {/* DOT INDICATOR (ONLY IF MULTIPLE) */}
      {postData.media.length > 1 && (
        <div className="absolute bottom-3 flex gap-2">
          {postData.media.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </>
  ) : (
    <p className="text-gray-400">No media</p>
  )}
</div>

            {/* RIGHT PANEL */}
            <div className="w-full md:w-1/2 flex flex-col">

              {/* AUTHOR */}
              {/* Debug: log author data */}
              {console.log('[Modal] postData.author:', postData.author) || console.log('[Modal] post.author:', post.author) || null}
              {/* Use post prop as fallback for author fields in case API overwrites them */}
              {(() => {
                const authorId = postData.author?._id || post.author?._id || postData.author?.user_id || post.author?.user_id;
                const handleAuthorClick = () => {
                  if (authorId) {
                    router.push(`/home/profile/${authorId}`);
                  }
                };
                return (
                <div className="flex items-center justify-between p-4 border-b">
                  {/* Author Info - Clickable */}
                  <div className="flex items-center gap-3 cursor-pointer" onClick={handleAuthorClick}>
                    <img
                      src={postData.author?.profile_image_url || post.author?.profile_image_url || "/loginAvatars/profile.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Author"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {(postData.author?.username || postData.author?.full_name || post.author?.username || post.author?.full_name) || 'Unknown User'}
                      </p>
                      {(postData.content?.location || post.content?.location) && (
                        <p className="text-xs text-gray-400">
                          {typeof (postData.content?.location || post.content?.location) === 'string'
                            ? (postData.content?.location || post.content?.location)
                            : (postData.content?.location?.display_text || post.content?.location?.display_text || postData.content?.location?.city || post.content?.location?.city || '')}
                        </p>
                      )}
                    </div>
                    {(postData.author?.is_verified || post.author?.is_verified) && <CheckCircle size={16} className="text-blue-400"/>}
                  </div>
                  {/* Three Dot Button for Report - Separate click area */}
                  <ThreeDotButton 
                    targetId={postData.post_id || postData._id || post?.post_id || post?._id} 
                    targetType={postData.content_type || post?.content_type || 'post'}
                    userId={authorId}
                  />
                </div>
                )})()}

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
                {console.log("Rendering comments:", postData.comments) || null}
                {postData.comments && postData.comments.map((comment, i) => {
                  const username =
                    comment.author?.username ||
                    comment.user?.username ||
                    comment.author?.full_name ||
                    comment.user?.full_name ||
                    "user";

                  const userPhoto = comment.author?.profile_image_url || comment.user?.profile_image_url || "/loginAvatars/profile.png";
                  // Handle time display - show seconds instead of "now" for recently posted comments
  const getTimeDisplay = (comment) => {
    const timeStr = comment.created_at;
    const time = formatRelativeTime(timeStr);
    const isJustNow = time === "now";
    
    if (isJustNow) {
      // Show actual seconds instead of "now" for newly posted comments
      const commentDate = new Date(timeStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now - commentDate) / 1000);
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
      }
      return time;
    }
    
    return time;
  };

                  const commentAuthorId = String(comment.author?.user_id || comment.author?._id || comment.user?.user_id || comment.user?._id || '');
                  const currentUserId = String(currentUser?.user_id || currentUser?._id || currentUser?.id || '');
                  // Check if current user owns this comment
                  const isOwnComment = commentAuthorId === currentUserId;

                 return (
 <div
  key={comment.comment_id || comment.id || i}
  className="flex gap-3 relative group w-full hover:bg-gray-50 px-2 py-1 rounded"
>
    
    <img
      src={userPhoto}
      alt={username}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
    />

<div className="flex-1">

  {/* TOP ROW */}
  <div className="flex justify-between items-start w-full group">

    {/* LEFT SIDE */}
    <div>
      <span className="font-semibold mr-2">{username}</span>
      <span>{comment.text}</span>
    </div>

    {/* RIGHT SIDE (3 DOT) - Show on hover */}
    {isOwnComment ? (
      <div className="relative ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() =>
            setActiveCommentMenu(prev =>
              prev === (comment.comment_id || comment.id)
                ? null
                : (comment.comment_id || comment.id)
            )
          }
          className="p-1 rounded hover:bg-gray-200 text-black"
        >
          <MoreHorizontal size={16} />
        </button>

        {activeCommentMenu === (comment.comment_id || comment.id) && (
          <div className="absolute right-0 top-6 z-10 rounded-lg shadow-lg border bg-white border-gray-200 min-w-[120px]">
            <button
              onClick={() => {
                setEditingComment(comment.comment_id || comment.id);
                setEditText(comment.text);
                setActiveCommentMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-900"
            >
              Update
            </button>
            <button
              onClick={() =>
                handleDeleteComment(comment.comment_id || comment.id)
              }
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
            >
              Delete
            </button>
            <button
              onClick={() => setActiveCommentMenu(null)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ThreeDotButton
          targetId={comment.comment_id || comment.id}
          targetType="comment"
          userId={commentAuthorId}
        />
      </div>
    )}
  </div>

  {/* TIME + REPLY */}
  <div className="text-xs text-gray-400 flex justify-between items-center mt-1">

    {/* LEFT */}
    <div className="flex gap-3 items-center">
      <span>{getTimeDisplay(comment)}</span>
      <button
        onClick={() => handleReplyClick(comment)}
        className="font-semibold hover:text-purple-400"
      >
        Reply
      </button>
    </div>

    {/* RIGHT (3 DOT ALSO HERE FOR PERFECT ALIGN) */}
    {isOwnComment && (
      <div className="relative group">
        <button
          onClick={() =>
            setActiveCommentMenu(prev =>
              prev === (comment.comment_id || comment.id)
                ? null
                : (comment.comment_id || comment.id)
            )
          }
          className="p-1 rounded hover:bg-gray-200"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    )}
  </div>

  {/* EDIT COMMENT */}
  {editingComment === (comment.comment_id || comment.id) && (
    <div className="flex gap-2 mt-2">
      <input
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="flex-1 outline-none border rounded px-2 py-1 bg-gray-100 border-gray-300"
      />
      <button
        onClick={() => handleUpdateComment(comment.comment_id || comment.id)}
        className="text-purple-500 font-semibold text-sm"
      >
        Save
      </button>
      <button
        onClick={() => setEditingComment(null)}
        className="text-gray-400 text-sm"
      >
        Cancel
      </button>
    </div>
  )}

  {/* REPLIES */}
  {comment.replies && comment.replies.length > 0 && (
    <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
      {comment.replies.map((reply, idx) => {
        console.log('UserPostDetailModal - Reply:', reply);
        const replyId = reply.id || reply.comment_id || reply._id;
        console.log('UserPostDetailModal - replyId:', replyId);
        const replyAuthorId = String(reply.author?.user_id || reply.author?._id || reply.user?.user_id || reply.user?._id || '');
        const currentUserId = String(currentUser?.user_id || currentUser?._id || currentUser?.id || '');
        // Check if current user owns this reply
        const isOwnReply = replyAuthorId === currentUserId;
        return (
        <div key={idx} className="flex justify-between items-start">

          <div className="flex gap-2">
            <img
              src={reply.author?.profile_image_url || "/loginAvatars/profile.png"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-sm mr-1">
                {reply.author?.username || reply.author?.full_name || "user"}
              </span>
              <span className="text-sm">{reply.text}</span>
            </div>
          </div>

          {isOwnReply ? (
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  setActiveCommentMenu(prev =>
                    prev === `${comment.comment_id || comment.id}-${reply.id}`
                      ? null
                      : `${comment.comment_id || comment.id}-${reply.id}`
                  )
                }
                className="p-1 rounded hover:bg-gray-200"
              >
                <MoreHorizontal size={14} />
              </button>

              {activeCommentMenu === `${comment.comment_id || comment.id}-${reply.id}` && (
                <div className="absolute right-0 top-6 z-10 rounded-lg shadow-lg border bg-white border-gray-200 min-w-[100px]">
                  <button
                    onClick={() => {
                      setEditingComment(reply.id);
                      setEditText(reply.text);
                      setActiveCommentMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-900"
                  >
                    Update
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteReply(
                        comment.comment_id || comment.id,
                        replyId
                      )
                    }
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setActiveCommentMenu(null)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ThreeDotButton
                targetId={replyId}
                targetType="reply"
                userId={replyAuthorId}
              />
            </div>
          )}
        </div>
      )})}
    </div>
  )}
</div>


  </div>
);
                })}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-around p-4 border-t">
                {/* LIKE */}
                <div className="flex flex-col items-center">
                  <button onClick={handleLikeToggle} disabled={isLiking}>
                    <Heart 
                      size={24} 
                      className={postData.is_liked ? "fill-red-500 text-red-500" : "text-black"} 
                    />
                  </button>
                  <span className="text-black text-sm font-medium mt-1">
                    {postData.likes_count || 0} likes
                  </span>
                </div>

                {/* COMMENT */}
                <div className="flex flex-col items-center">
                  <button>
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
                    {shareCount} shares
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

              {/* COMMENT INPUT */}
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
