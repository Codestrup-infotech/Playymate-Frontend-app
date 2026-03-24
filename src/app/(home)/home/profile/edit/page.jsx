"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Link as LinkIcon,
  User,
  AtSign,
  Trash2,
  Upload,
  X
} from "lucide-react";
import {
  getCurrentUserId,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAvatar,
  getAllProfilePhotos,
  deleteProfilePhoto,
  setPrimaryPhoto
} from "@/services/profile.service";
import { userService } from "@/services/user";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [showProfilePhotoPopup, setShowProfilePhotoPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // profile data from backend
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    website: "",
    location: "",
    gender: "",
    dob: "",
    phone: "",
    email: ""
  });

  // fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        // Call the real API to get user profile
        const res = await userService.getMe();
        const data = res?.data?.data || res?.data;
        
        if (data) {
          // Store user ID for updates
          setUserId(data._id);
          
          // Extract profile image - prioritize profile_photos then profile_image_url
          const profileImg = data.profile_photos?.[0]?.url || data.profile_image_url || "/loginAvatars/profile.png";
          
          setProfileImage(profileImg);
          setFormData({
            username: data.username || data.full_name?.toLowerCase().replace(/\s+/g, '.') || "",
            name: data.full_name || "",
            bio: data.bio || "",
            website: data.website || "",
            location: data.profile_location?.display_text || data.profile_location?.city || "",
            gender: data.gender || "",
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
            phone: data.phone || "",
            email: data.email || ""
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    }

    fetchProfile();
  }, []);

  // change profile photo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setSelectedFile(file);
      setShowProfilePhotoPopup(false);
    }
  };

  // Handle delete profile photo
  const handleDeleteProfilePhoto = async () => {
    if (!userId) return;
    
    setIsDeleting(true);
    try {
      await deleteAvatar(userId);
      setProfileImage("/loginAvatars/profile.png");
      setSelectedFile(null);
      setShowProfilePhotoPopup(false);
    } catch (error) {
      console.error("Failed to delete profile photo:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open popup when clicking camera button
  const handleProfilePhotoClick = () => {
    setShowProfilePhotoPopup(true);
  };

  // Handle select from computer
  const handleSelectFromComputer = () => {
    fileInputRef.current?.click();
  };

  // update profile
  const handleSave = async () => {
    setIsLoading(true);

    try {
      // First, upload the profile image if a new one was selected
      if (selectedFile && userId) {
        setIsUploading(true);
        try {
          await uploadAvatar(userId, selectedFile);
          console.log("Profile image uploaded successfully");
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          // Continue with profile update even if image upload fails
        }
        setIsUploading(false);
      }

      // Update profile data
      const payload = {
        full_name: formData.name,
        bio: formData.bio,
        username: formData.username,
        profile_location: {
          display_text: formData.location,
          city: formData.location?.split(',')[0] || '',
          state: formData.location?.split(',')[1]?.trim() || ''
        }
      };

      // Call the API to update profile
      await updateUserProfile(userId, payload);

      router.push("/home/profile");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0f0f1a] dark:text-white">

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0f0f1a]/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="text-lg font-semibold">Edit Profile</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Photo */}
        <div className="rounded-xl p-6 bg-white dark:bg-[#17172b] border border-gray-200 dark:border-white/5">

          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>

          <div className="flex items-center gap-6">

            <div className="relative">
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full rounded-full border-4 border-white dark:border-[#17172b] object-cover"
                />
              </div>

              <button
                onClick={handleProfilePhotoClick}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <p className="font-semibold">{formData.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{formData.username}
              </p>
            </div>

          </div>
        </div>

        {/* Profile Photo Popup */}
        {showProfilePhotoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowProfilePhotoPopup(false)}
            />
            
            {/* Popup Content */}
            <div className="relative bg-white dark:bg-[#17172b] rounded-2xl w-[300px] mx-4 overflow-hidden shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                <h3 className="font-semibold text-lg">Profile Photo</h3>
                <button 
                  onClick={() => setShowProfilePhotoPopup(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Options */}
              <div className="py-2">
                {/* Select from Computer */}
                <button
                  onClick={handleSelectFromComputer}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                >
                  <Upload size={20} className="text-purple-600" />
                  <span className="font-medium">Select from computer</span>
                </button>
                
                {/* Delete Profile */}
                <button
                  onClick={handleDeleteProfilePhoto}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 text-left text-red-500"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={20} />
                  )}
                  <span className="font-medium">Delete profile photo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="rounded-xl p-6 space-y-4 bg-white dark:bg-[#17172b] border border-gray-200 dark:border-white/5">

          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Username */}
          <div>
            <label className="text-sm text-gray-500 flex gap-2 items-center mb-1">
              <AtSign size={15} /> Username
            </label>
            <input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#22223a] focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-gray-500 flex gap-2 items-center mb-1">
              <User size={15} /> Name
            </label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#22223a] focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#22223a] focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          {/* Website */}
          <div>
            <label className="text-sm text-gray-500 flex gap-2 items-center mb-1">
              <LinkIcon size={15} /> Website
            </label>
            <input
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#22223a] focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-gray-500 flex gap-2 items-center mb-1">
              <MapPin size={15} /> Location
            </label>
            <input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#22223a] focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

        </div>

     

      </div>
    </div>
  );
}