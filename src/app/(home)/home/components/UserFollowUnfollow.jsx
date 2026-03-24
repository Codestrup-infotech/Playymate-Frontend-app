import { X, Star } from "lucide-react";

export default function UserFollowUnfollow({
  isOpen,
  onClose,
  userId,
  onUnfollow,
  userName,
  userProfileImage,
  isMuted = false,
  isCloseFriend = false,
  onMute,
  onUnmute,
  onAddCloseFriend,
  onRemoveCloseFriend,
  username
}) {
  if (!isOpen) return null;

  const handleMuteClick = async () => {
    if (isMuted) {
      if (onUnmute) {
        await onUnmute();
      }
    } else {
      if (onMute) {
        await onMute();
      }
    }
  };

  const handleCloseFriendClick = async () => {
    if (isCloseFriend) {
      if (onRemoveCloseFriend) {
        await onRemoveCloseFriend();
      }
    } else {
      if (onAddCloseFriend) {
        await onAddCloseFriend();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 w-[90%] max-w-md rounded-2xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <div className="flex flex-col items-center w-full">
            <img
              src={userProfileImage || "/default.png"}
              alt="profile"
              className="w-14 h-14 rounded-full object-cover"
            />
            <p className="text-sm font-semibold mt-2 text-gray-900 dark:text-white">
              {userName || "User"}
            </p>
          </div>

          <button onClick={onClose} className="absolute right-5 top-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {/* Close Friends */}
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
            onClick={handleCloseFriendClick}
          >
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {isCloseFriend ? "Remove from close friends" : "Add to close friends list"}
            </p>
            <Star 
              size={20} 
              className={isCloseFriend ? "fill-red-500 text-red-500" : "text-gray-400"} 
            />
          </div>

          {/* Mute/Unmute */}
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
            onClick={handleMuteClick}
          >
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {isMuted ? "Unmute" : "Mute"}
            </p>
            <span className="text-gray-400">
              {isMuted ? "✓" : "›"}
            </span>
          </div>

          {/* Unfollow */}
          <div 
            className="flex justify-between items-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-lg transition-colors"
            onClick={() => {
              if (onUnfollow) {
                onUnfollow();
              }
            }}
          >
            <p className="text-sm text-red-500 font-medium">Unfollow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
