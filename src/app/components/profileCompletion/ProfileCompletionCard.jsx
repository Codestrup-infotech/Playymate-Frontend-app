"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, List, FileText, X, Loader2, Check } from "lucide-react";
import UsernamePopup from "./UsernamePopup";
import BioPopup from "./BioPopup";

export default function ProfileCompletionCard({ profileCard, userData, onRefresh }) {
  const router = useRouter();
  
  // Debug logging
  console.log("[ProfileCompletionCard] Received props:", {
    profileCard: JSON.stringify(profileCard),
    userData: JSON.stringify(userData),
    hasEnabled: profileCard?.enabled,
    hasTasks: !!profileCard?.tasks
  });
  
  // Get tasks from profileCard prop (from Feed API) or use default
  const tasks = profileCard?.tasks || {
    username: true,
    profile_main_type: true,
    bio: true,
  };
  
  console.log("[ProfileCompletionCard] Tasks object:", tasks);
  
  const [showUsernamePopup, setShowUsernamePopup] = useState(false);
  const [showBioPopup, setShowBioPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Task completion status - true means task is PENDING (not completed)
  // false means task is COMPLETED
  const isUsernamePending = tasks?.username !== false;
  const isProfileTypePending = tasks?.profile_main_type !== false;
  const isBioPending = tasks?.bio !== false;

  // Handle username save from popup
  const handleUsernameSave = async (username) => {
    setShowUsernamePopup(false);
    // Refresh profile data to update UI
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Handle bio save from popup
  const handleBioSave = async (bio) => {
    setShowBioPopup(false);
    // Refresh profile data to update UI
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Navigate to profile type selection
  const handleProfileTypeSelect = () => {
    router.push("/home/select-profile-type");
  };

  // Determine display values based on task status
  // If task is completed (status=false), show the user's data
  // If task is pending (status=true), show "Add" or "Select"
  const displayUsername = !isUsernamePending && userData?.username 
    ? userData.username 
    : null;
    
  const displayProfileType = !isProfileTypePending && userData?.profile_main_type 
    ? userData.profile_main_type 
    : null;
    
  const displayBio = !isBioPending && userData?.bio 
    ? userData.bio 
    : null;

  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-black font-semibold text-lg">Complete Your Profile</h3>
          <p className="text-gray-400 text-sm">
            Finish setting up your profile so friends can find you and connect easily.
          </p>
        </div>

        {/* Three Tiles Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Tile 1 - Create Username */}
          <button
            onClick={() => setShowUsernamePopup(true)}
            className={`rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[120px] ${
              !isUsernamePending && userData?.username
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-gradient-to-tr from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${!isUsernamePending && userData?.username ? "bg-green-500/30" : "bg-purple-500/20"}`}>
              {!isUsernamePending && userData?.username ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <UserPlus className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <span className="text-black font-medium text-sm">Create Username</span>
            {displayUsername ? (
              <span className="text-green-400 text-xs mt-1">@{displayUsername}</span>
            ) : (
              <span className="text-black-500 text-xs mt-1">Add</span>
            )}
          </button>

          {/* Tile 2 - Select Profile Type */}
          <button
            onClick={handleProfileTypeSelect}
            className={`rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[120px] ${
              !isProfileTypePending && userData?.profile_main_type
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-gradient-to-tr from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${!isProfileTypePending && userData?.profile_main_type ? "bg-green-500/30" : "bg-orange-500/20"}`}>
              {!isProfileTypePending && userData?.profile_main_type ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <List className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <span className="text-black font-medium text-sm">Select Main Profile Type</span>
            {displayProfileType ? (
              <span className="text-green-400 text-xs mt-1 capitalize">{displayProfileType}</span>
            ) : (
              <span className="text-black-500 text-xs mt-1">Select</span>
            )}
          </button>

          {/* Tile 3 - Add Bio */}
          <button
            onClick={() => setShowBioPopup(true)}
            className={`rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[120px] ${
              !isBioPending && userData?.bio
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-gradient-to-tr from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${!isBioPending && userData?.bio ? "bg-green-500/30" : "bg-blue-500/20"}`}>
              {!isBioPending && userData?.bio ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <span className="text-white font-medium text-sm">Add Bio</span>
            {displayBio ? (
              <span className="text-green-400 text-xs mt-1 truncate w-full">Added</span>
            ) : (
              <span className="text-gray-500 text-xs mt-1">Write Bio</span>
            )}
          </button>
        </div>
      </div>


      {/* Popups */}
      {showUsernamePopup && (
        <UsernamePopup
          onClose={() => setShowUsernamePopup(false)}
          onSave={handleUsernameSave}
          initialUsername={userData?.username}
        />
      )}

      {showBioPopup && (
        <BioPopup
          onClose={() => setShowBioPopup(false)}
          onSave={handleBioSave}
          initialBio={userData?.bio}
        />
      )}
    </>
  );
}
