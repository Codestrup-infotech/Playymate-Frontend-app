"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageSquare, Share2, CheckCircle } from "lucide-react";
import postService from "@/app/user/post";
import { toggleLike } from "@/app/user/homefeed";
import { getPostShareCount } from "@/app/user/share";
import SharePopup from "@/app/(home)/home/components/sharepopup";
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

export default function UserPostDetailModal({
  post,
  isLoading,
  onClose,
  currentUser
}) {
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
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
              {postData.media && postData.media.length > 0 ? (
                postData.media[0].type === "video" ?
                <video src={postData.media[0].url} controls className="max-h-full max-w-full object-contain"/>
                :
                <img src={postData.media[0].url} className="max-h-full max-w-full object-contain" alt="Post media"/>
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
                  alt="Author"
                />
                <div>
                  <p className="font-semibold text-gray-900">
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

                  return (
                    <div key={comment.comment_id || comment.id || i} className="flex gap-3">
                      <img src={userPhoto} alt={username} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>

                      <div className="flex-1">
                        <div>
                          <span className="font-semibold mr-2">{username}</span>
                          <span>{comment.text}</span>
                        </div>

                        <div className="text-xs text-gray-400 flex gap-3 mt-1 items-center">
                          <span>{time}</span>
                          <button onClick={() => handleReplyClick(comment)} className="font-semibold hover:text-purple-400">Reply</button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                            {comment.replies.map((reply, idx) => (
                              <div key={idx} className="flex gap-2">
                                <img 
                                  src={reply.author?.profile_image_url || "/loginAvatars/profile.png"} 
                                  alt="" 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div>
                                  <span className="font-semibold text-sm mr-1">
                                    {reply.author?.username || reply.author?.full_name || 'user'}
                                  </span>
                                  <span className="text-sm">{reply.text}</span>
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
