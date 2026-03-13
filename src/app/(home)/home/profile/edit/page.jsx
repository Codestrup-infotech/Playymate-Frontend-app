"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Link as LinkIcon,
  User,
  AtSign
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        // replace with real API
        const profileData = {
          username: "your-name",
          name: "XYZ",
          bio: "Cricket lover",
          website: "https://playymate.com",
          location: "Pune, Maharashtra",
          gender: "Male",
          dob: "1998-08-12",
          phone: "+91 9876543210",
          email: "email@example.com",
          profileImage: "/profile.jpg"
        };

        setFormData(profileData);
        setProfileImage(profileData.profileImage);
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
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // update profile
  const handleSave = async () => {
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        name: formData.name,
        bio: formData.bio,
        website: formData.website,
        location: formData.location
      };

      // await api.updateProfile(payload)

      await new Promise((resolve) => setTimeout(resolve, 1000));

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
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700"
              >
                <Camera size={16} />
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

        {/* Additional Info (READ ONLY) */}
        <div className="rounded-xl p-6 space-y-4 bg-white dark:bg-[#17172b] border border-gray-200 dark:border-white/5">

          <h2 className="text-lg font-semibold">Additional Information</h2>

          <div>
            <label className="text-sm text-gray-500">Gender</label>
            <input
              disabled
              value={formData.gender}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-[#22223a] opacity-70"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            <input
              disabled
              value={formData.dob}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-[#22223a] opacity-70"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <input
              disabled
              value={formData.phone}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-[#22223a] opacity-70"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              disabled
              value={formData.email}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-[#22223a] opacity-70"
            />
          </div>

        </div>

      </div>
    </div>
  );
}