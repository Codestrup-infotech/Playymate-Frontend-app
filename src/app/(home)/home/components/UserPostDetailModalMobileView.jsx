"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  X, Heart, MessageSquare, Share2, CheckCircle, 
  Bookmark, MoreHorizontal, ChevronLeft, Send,
  Volume2, VolumeX, Play, Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import postService from "@/app/user/post";
import { toggleLike } from "@/app/user/homefeed";
import { getPostShareCount } from "@/app/user/share";
import SharePopup from "@/app/(home)/home/components/sharepopup";
import ComposeEmojiPicker from "./Composeemojipicker";
import ThreeDotButton from "./ThreeDotButton";

// Helper function to format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return `${Math.floor(diffInSeconds / 604800)}w`;
}

export default function UserPostDetailModalMobileView({
  post,
  isLoading,
  onClose,
  currentUser,
  allPosts = [],
  currentIndex = 0,
  onNavigate,
  onNavigatePost
}) {
  const router = useRouter();
  const [postData, setPostData] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyToComment, setReplyToComment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activePostIndex, setActivePostIndex] = useState(currentIndex);
  
  const commentInputRef = useRef(null);
  const isLikedRef = useRef(false);
  const videoRef = useRef(null);
  const mainScrollRef = useRef(null);
  const mediaScrollRef = useRef(null);

  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");

  const isReel = post?.content_type === "reel" || post?.media?.[0]?.type === "video";
  const totalPosts = allPosts.length;
  const currentPost = allPosts[activePostIndex];

  useEffect(() => {
    if (currentPost) {
      setPostData(currentPost);
      isLikedRef.current = currentPost.is_liked || false;
      
      const postId = currentPost.post_id || currentPost._id || currentPost.id;
      const contentType = currentPost.content_type || "post";

      postService.getPostComments(postId, 50)
        .then((res) => {
          const comments = res?.data?.data?.comments || res?.data?.comments || res?.comments || [];
          setPostData(prev => ({
            ...prev,
            comments: Array.isArray(comments) ? comments : []
          }));
        })
        .catch(err => console.log("Comments fetch error:", err));

      getPostShareCount(postId, contentType)
        .then(countResult => {
          const count = countResult?.count ?? countResult ?? 0;
          setShareCount(typeof count === 'number' ? count : 0);
        })
        .catch(() => setShareCount(0));
    }
  }, [currentPost]);

  const handleNextPost = () => {
    if (activePostIndex < totalPosts - 1 && onNavigatePost) {
      const nextIndex = activePostIndex + 1;
      setActivePostIndex(nextIndex);
      onNavigatePost(nextIndex);
    }
  };

  const handlePrevPost = () => {
    if (activePostIndex > 0 && onNavigatePost) {
      const prevIndex = activePostIndex - 1;
      setActivePostIndex(prevIndex);
      onNavigatePost(prevIndex);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activePostIndex && newIndex >= 0 && newIndex < totalPosts && onNavigatePost) {
      setActivePostIndex(newIndex);
      onNavigatePost(newIndex);
    }
  };

  const handleLikeToggle = async (e) => {
    e?.stopPropagation();
    if (!postData || isLiking) return;

    setIsLiking(true);
    const postId = postData.post_id || postData._id;
    const currentlyLiked = isLikedRef.current;
    const newIsLiked = !currentlyLiked;

    isLikedRef.current = newIsLiked;
    setPostData(prev => ({
      ...prev,
      is_liked: newIsLiked,
      likes_count: newIsLiked
        ? (prev.likes_count || 0) + 1
        : Math.max(0, (prev.likes_count || 1) - 1)
    }));

    try {
      await toggleLike(postData.content_type || "post", postId);
    } catch (error) {
      isLikedRef.current = currentlyLiked;
      setPostData(prev => ({
        ...prev,
        is_liked: currentlyLiked,
        likes_count: currentlyLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 1) - 1)
      }));
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostComment = async () => {
    if (!postData || !commentText.trim() || isPostingComment) return;
    setIsPostingComment(true);
    
    try {
      const postId = postData.post_id || postData._id;
      if (replyToComment) {
        const commentId = replyToComment.comment_id || replyToComment.id;
        await postService.replyToComment(commentId, commentText.trim());
        // Refresh comments or optimistic update (simplified here)
        setCommentText("");
        setReplyToComment(null);
      } else {
        await postService.addComment(postId, commentText.trim());
        setCommentText("");
      }
      // Re-fetch comments
      const res = await postService.getPostComments(postId, 50);
      const comments = res?.data?.data?.comments || res?.data?.comments || res?.comments || [];
      setPostData(prev => ({ ...prev, comments }));
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!postData && isLoading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!postData) return null;

  const author = postData?.author || {};
  const media = postData?.media || [];

  const handleMediaScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== currentMediaIndex) {
      setCurrentMediaIndex(newIndex);
    }
  };

  const scrollToMedia = (direction) => {
    const container = mediaScrollRef.current;
    if (container) {
      const itemWidth = container.clientWidth;
      if (direction === 'next') {
        container.scrollBy({ left: itemWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    }
  };

  const handleMainScroll = (e) => {
  const scrollTop = e.target.scrollTop;
  const itemHeight = e.target.clientHeight;
  const newIndex = Math.round(scrollTop / itemHeight);

  // ✅ CLOSE COMMENT WHEN SCROLL
  if (showComments) {
    setShowComments(false);
  }

  if (
    newIndex !== activePostIndex &&
    newIndex >= 0 &&
    newIndex < totalPosts &&
    onNavigatePost
  ) {
    setActivePostIndex(newIndex);
    onNavigatePost(newIndex);
  }
};

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col text-white font-sans overflow-hidden">
      {/* HEADER */}
      {!isReel && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black">
          <button onClick={onClose} className="p-1">
            <ChevronLeft size={28} />
          </button>
          <span className="font-bold text-lg">{activePostIndex + 1} / {totalPosts}</span>
          <div className="w-8" />
        </div>
      )}

 <div
  className="flex-1 overflow-y-auto snap-y snap-mandatory h-[100dvh] pb-[70px]"
  ref={mainScrollRef}
  onScroll={handleMainScroll}
>
  {allPosts.map((postItem, index) => {
    const isCurrentReel =
      postItem?.content_type === "reel" ||
      postItem?.media?.[0]?.type === "video";

    const author = postItem?.author || {};
    const media = postItem?.media || [];

    return (
      <div key={postItem._id || index} className="h-[100dvh] snap-start flex flex-col">
        {isCurrentReel ? (
          /* REEL VIEW */
         <div className="h-full w-full relative bg-black">
  {media[0]?.url && (
    <video
      src={media[0].url}
      className="h-full w-full object-cover"
      autoPlay
      loop
      muted={isMuted}
      playsInline
    />
  )}

  {/* RIGHT SIDE ACTIONS */}
  <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
    <button onClick={handleLikeToggle}>
      <Heart
        size={28}
        className={
          postItem.is_liked ? "text-red-500 fill-red-500" : "text-white"
        }
      />
      <p className="text-xs">{postItem.likes_count || 0}</p>
    </button>

    <button onClick={() => setShowComments(true)}>
      <MessageSquare size={28} />
      <p className="text-xs">
        {postItem.comments_count || postItem.comments?.length || 0}
      </p>
    </button>

    <button onClick={() => setShareOpen(true)}>
      <Share2 size={28} />
      <p className="text-xs">{shareCount}</p>
    </button>

    <button>
      <Bookmark size={28} />
    </button>

    <ThreeDotButton
      targetId={postItem.post_id || postItem._id}
      targetType="post"
      userId={author._id}
    />
  </div>

  {/* BOTTOM INFO */}
  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10">
    <div className="flex items-center gap-3 mb-2">
      <img
        src={author.profile_image_url || "/loginAvatars/profile.png"}
        className="w-8 h-8 rounded-full"
      />
      <span className="font-semibold text-sm">
        {author.username}
      </span>
    </div>

    {/* CAPTION */}
    <p className="text-sm line-clamp-2">
      {postItem.content?.text}
    </p>

    {/* LOCATION */}
    {postItem.content?.location?.display_text && (
      <p className="text-xs opacity-70 mt-1">
        📍 {postItem.content.location.display_text}
      </p>
    )}
  </div>
</div>
        ) : (
          /* IMAGE POST VIEW */
          <div className="flex flex-col bg-black h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    author.profile_image_url ||
                    "/loginAvatars/profile.png"
                  }
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="text-sm font-semibold">
                    {author.username}
                  </span>

                  {postItem.content?.location?.display_text && (
                    <p className="text-[10px] opacity-70">
                      {postItem.content.location.display_text}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={media[0]?.url}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions */}
            <div className="p-3">
              <p className="text-sm font-bold">
                {postItem.likes_count || 0} likes
              </p>
              <p className="text-sm">
                <span className="font-bold mr-2">
                  {author.username}
                </span>
                {postItem.content?.text}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  })}
</div>

      {/* COMMENTS BOTTOM SHEET */}
      <AnimatePresence>
        {showComments && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-black/60 z-[70]"
            />
            
            {/* Sheet */}
          <motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}

  /* ✅ ADD THIS */
  drag="y"
  dragConstraints={{ top: 0, bottom: 200 }}
  onDragEnd={(e, info) => {
    if (info.offset.y > 100) {
      setShowComments(false);
    }
  }}

  className="fixed bottom-[70px] left-0 right-0 h-[70vh] bg-[#1a1a1a] rounded-t-2xl z-[80] flex flex-col"
>
              {/* Handle */}
             <div
  className="w-full flex justify-center p-3 cursor-pointer"
  onClick={() => setShowComments(false)}
>
  <div className="w-10 h-1 bg-white/20 rounded-full" />
</div>
              
              <div className="text-center font-bold pb-3 border-b border-white/10">
                Comments
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {postData.comments && postData.comments.length > 0 ? (
                  postData.comments.map((comment, i) => (
                    <div key={comment.id || i} className="flex gap-3">
                      <img 
                        src={comment.author?.profile_image_url || "/loginAvatars/profile.png"} 
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{comment.author?.username || "user"}</span>
                          <span className="text-[10px] opacity-50">{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                          <button onClick={() => {
                            setReplyToComment(comment);
                            commentInputRef.current?.focus();
                          }}>Reply</button>
                          <button>See translation</button>
                        </div>
                        
                        {/* Replies */}
                        {comment.replies?.map((reply, ridx) => (
                          <div key={ridx} className="flex gap-3 mt-4">
                            <img 
                              src={reply.author?.profile_image_url || "/loginAvatars/profile.png"} 
                              className="w-6 h-6 rounded-full object-cover"
                              alt=""
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs">{reply.author?.username || "user"}</span>
                                <span className="text-[10px] opacity-50">{formatRelativeTime(reply.created_at)}</span>
                              </div>
                              <p className="text-xs">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="flex flex-col items-center gap-1">
                        <Heart size={14} />
                        <span className="text-[10px]">0</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <MessageSquare size={48} className="mb-2" />
                    <p>No comments yet</p>
                  </div>
                )}
              </div>

              {/* Comment Input Area */}
              <div className="p-4 border-t border-white/10 bg-[#1a1a1a]">
                {/* Emoji shortcuts */}
                <div className="flex justify-around mb-4 text-2xl">
                  {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map(emoji => (
                    <button key={emoji} onClick={() => setCommentText(prev => prev + emoji)}>{emoji}</button>
                  ))}
                </div>

                {replyToComment && (
                  <div className="flex items-center justify-between bg-white/5 px-3 py-1 rounded mb-2 text-xs">
                    <span>Replying to @{replyToComment.author?.username}</span>
                    <button onClick={() => setReplyToComment(null)}><X size={14} /></button>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
                  <img 
                    src={currentUser?.profile_image_url || "/loginAvatars/profile.png"} 
                    className="w-8 h-8 rounded-full object-cover"
                    alt=""
                  />
                  <input 
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Add a comment for ${author.username}...`}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button 
                    onClick={handlePostComment}
                    disabled={!commentText.trim() || isPostingComment}
                    className="text-blue-400 font-bold text-sm disabled:opacity-50"
                  >
                    {isPostingComment ? "..." : "Post"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Popup */}
      <SharePopup
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        contentType={postData.content_type || "post"}
        contentId={postData.post_id || postData._id}
        thumbnail={postData.media?.[0]?.url || null}
        title={postData.content?.text || null}
        onShareSuccess={() => setShareCount(prev => prev + 1)}
      />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
