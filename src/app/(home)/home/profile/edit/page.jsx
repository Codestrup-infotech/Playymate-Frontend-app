"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Link as LinkIcon,
  User,
  AtSign,
  Globe,
  Heart,
  Music,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Utensils,
  Coffee,
  Plane,
  Trash2,
  Check,
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

  const [profileImage, setProfileImage] = useState("/profile.jpg");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [showPhotoManager, setShowPhotoManager] = useState(false);

  const [formData, setFormData] = useState({
    username: "your-name",
    name: "XYZ",
    bio: "Cricket / Genre text\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    website: "https://playymate.com",
    location: "Pune, Maharashtra",
    interests: ["Cricket", "Music", "Gaming"],
  });

  const [selectedInterests, setSelectedInterests] = useState([
    { name: "Sports", icon: Dumbbell, selected: true },
    { name: "Music", icon: Music, selected: true },
    { name: "Gaming", icon: Gamepad2, selected: true },
    { name: "Reading", icon: BookOpen, selected: false },
    { name: "Food", icon: Utensils, selected: false },
    { name: "Travel", icon: Plane, selected: false },
    { name: "Fitness", icon: Heart, selected: false },
    { name: "Coffee", icon: Coffee, selected: false },
  ]);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Use userService.getMe() to get current user data
        const res = await userService.getMe();
        const profile = res?.data?.data || res?.data;
        
        console.log("Edit page - Current user profile:", profile);
        
        if (profile && profile._id) {
          setUserId(profile._id);
          console.log("Edit page - User ID set:", profile._id);
          
          // Update form data with user profile
          setFormData({
            username: profile.username || "",
            name: profile.full_name || "",
            bio: profile.bio || "",
            website: profile.website || "",
            location: profile.profile_location?.display_text || "",
            interests: [],
          });

          // Set profile image
          if (profile.profile_image_url) {
            setProfileImage(profile.profile_image_url);
            console.log("Edit page - Profile image set:", profile.profile_image_url);
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, []);

  // Load profile photos
  const loadProfilePhotos = async () => {
    try {
      const response = await getAllProfilePhotos();
      if (response.status === "success") {
        setProfilePhotos(response.data?.photos || []);
      }
    } catch (error) {
      console.error("Failed to load profile photos:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("========== AVATAR UPLOAD STARTED ==========");
    console.log("File selected:", file.name);
    console.log("File size:", (file.size / 1024).toFixed(2), "KB");
    console.log("File type:", file.type);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Show preview immediately while uploading
    const imageUrl = URL.createObjectURL(file);
    console.log("Local preview created:", imageUrl);
    setProfileImage(imageUrl);
    setIsUploading(true);

    try {
      if (userId) {
        console.log("User ID:", userId);
        console.log("Starting avatar upload to Wasabi...");
        
        // Upload using the API (presigned URL flow to Wasabi)
        const result = await uploadAvatar(userId, file);
        
        console.log("Upload API response received!");
        console.log("Full result:", result);
        
        if (result.status === "success") {
          // Get the CDN URL from Wasabi/CloudFront
          const cdnUrl = result.data?.profile_image_url;
          console.log("CDN URL (Wasabi):", cdnUrl);
          
          if (cdnUrl) {
            setProfileImage(cdnUrl);
            console.log("Profile photo updated with CDN URL!");
          } else {
            console.warn("No CDN URL in response, keeping local preview");
          }
          alert("Profile photo updated successfully!");
        }
      } else {
        // Fallback for when userId is not available
        console.log("User ID not available, using local preview only");
        alert("User ID not found. Please refresh the page and try again.");
      }
    } catch (error) {
      console.error("========== AVATAR UPLOAD FAILED ==========");
      console.error("Failed to upload avatar:", error);
      
      // Show more detailed error message
      if (error.response) {
        console.error("API Error:", error.response.data);
        alert(`Failed to upload profile photo: ${error.response.data?.message || "Server error"}`);
      } else if (error.request) {
        alert("Failed to upload profile photo. Network error - please check your connection.");
      } else {
        alert("Failed to upload profile photo. Please try again.");
      }
      
      // Don't revert - keep the local preview as fallback
      // The user can try again if needed
    } finally {
      setIsUploading(false);
      console.log("========== AVATAR UPLOAD COMPLETE ==========\n");
    }
  };

  const handleDeleteAvatar = async () => {
    if (!userId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your profile photo?");
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteAvatar(userId);
      if (result.status === "success") {
        setProfileImage("/profile.jpg");
        alert("Profile photo deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      alert("Failed to delete profile photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPhotoManager = async () => {
    await loadProfilePhotos();
    setShowPhotoManager(true);
  };

  const handleDeleteProfilePhoto = async (photoIndex) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;

    try {
      const result = await deleteProfilePhoto(photoIndex);
      if (result.status === "success") {
        await loadProfilePhotos();
        alert("Photo deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const handleSetPrimaryPhoto = async (photoIndex) => {
    try {
      const result = await setPrimaryPhoto(photoIndex);
      if (result.status === "success") {
        await loadProfilePhotos();
        alert("Primary photo updated successfully!");
      }
    } catch (error) {
      console.error("Failed to set primary photo:", error);
      alert("Failed to set primary photo. Please try again.");
    }
  };

  const toggleInterest = (index) => {
    const updated = [...selectedInterests];
    updated[index].selected = !updated[index].selected;
    setSelectedInterests(updated);

    const selectedNames = updated
      .filter(item => item.selected)
      .map(item => item.name);
    setFormData({ ...formData, interests: selectedNames });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (userId) {
        // Update user profile via API
        await updateUserProfile(userId, {
          full_name: formData.name,
          bio: formData.bio,
          username: formData.username,
          profile_location: {
            display_text: formData.location,
            city: formData.location.split(",")[0]?.trim() || "",
            state: formData.location.split(",")[1]?.trim() || ""
          }
        });
      }
      // Force full page reload to ensure fresh data is fetched
      window.location.href = "/home/profile";
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Edit Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Photo Section */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full rounded-full border-4 border-[#1a1a2e] object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            <div className="flex-1">
              <p className="font-semibold">{formData.name}</p>
              <p className="text-gray-400 text-sm">@{formData.username}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-400 text-sm hover:text-purple-300 font-medium"
                >
                  Change Profile Photo
                </button>
                {profileImage && profileImage !== "/profile.jpg" && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="text-red-400 text-sm hover:text-red-300 font-medium"
                  >
                    Delete Photo
                  </button>
                )}
              </div>
              <button
                onClick={handleOpenPhotoManager}
                className="mt-2 text-blue-400 text-sm hover:text-blue-300 font-medium"
              >
                Manage Photos
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <AtSign size={16} />
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <User size={16} />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <User size={16} />
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-gray-500 text-right">{formData.bio.length}/150</p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <LinkIcon size={16} />
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart size={20} className="text-pink-500" />
            Interests
          </h2>
          <p className="text-gray-400 text-sm mb-4">Select your interests to personalize your feed</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedInterests.map((interest, index) => (
              <button
                key={interest.name}
                onClick={() => toggleInterest(index)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${interest.selected
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-700 hover:border-gray-600 bg-[#252542]"
                  }`}
              >
                <interest.icon
                  size={24}
                  className={interest.selected ? "text-purple-400" : "text-gray-400"}
                />
                <span className={`text-sm font-medium ${interest.selected ? "text-white" : "text-gray-400"}`}>
                  {interest.name}
                </span>
                {interest.selected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Additional Information</h2>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Gender</label>
            <select className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Date of Birth</label>
            <input
              type="date"
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full bg-[#252542] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-red-900/50">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <button className="w-full py-3 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors">
            Delete Account
          </button>
        </div>

      </div>

      {/* Profile Photo Manager Modal */}
      {showPhotoManager && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manage Profile Photos</h3>
              <button
                onClick={() => setShowPhotoManager(false)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {profilePhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profilePhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={photo.url || photo}
                        alt={`Profile photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.is_primary && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-xs px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!photo.is_primary && (
                          <button
                            onClick={() => handleSetPrimaryPhoto(index)}
                            className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                            title="Set as primary"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProfilePhoto(index)}
                          className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">
                  No additional profile photos. Upload more from your gallery.
                </p>
              )}
              
              <button
                onClick={() => {
                  setShowPhotoManager(false);
                  fileInputRef.current?.click();
                }}
                className="w-full py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Add More Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
