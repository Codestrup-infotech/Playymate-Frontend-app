"use client";

import { useState, useRef } from "react";
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
  Plane
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState("/profile.jpg");
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/home/profile");
    } catch (error) {
      console.error("Failed to save profile:", error);
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
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
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
            <div className="flex-1">
              <p className="font-semibold">{formData.name}</p>
              <p className="text-gray-400 text-sm">@{formData.username}</p>
              <button className="mt-3 text-purple-400 text-sm hover:text-purple-300 font-medium">
                Change Profile Photo
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
              onChange={(e) => setFormData({...formData, username: e.target.value})}
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
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
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
              onChange={(e) => setFormData({...formData, website: e.target.value})}
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
              onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  interest.selected 
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
    </div>
  );
}
