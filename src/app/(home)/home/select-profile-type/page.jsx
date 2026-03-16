"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ArrowLeft, Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import { updateProfileMainType } from "@/services/profile.service";
import { useTheme } from "@/lib/ThemeContext";

export default function SelectProfileTypePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInterests, setUserInterests] = useState({
    sports: [],
    hobbies: [],
    activities: [],
    nostalgia: [],
    additional: []
  });
  const [currentMainType, setCurrentMainType] = useState(null);
  
  // Theme colors
  const colors = {
    bgPrimary: theme === "dark" ? "#0f1021" : "#ffffff",
    bgSecondary: theme === "dark" ? "#1b1d3a" : "#f3f4f6",
    bgCard: theme === "dark" ? "#1b1d3a" : "#ffffff",
    bgInput: theme === "dark" ? "#1b1d3a" : "#f9fafb",
    textPrimary: theme === "dark" ? "#ffffff" : "#111827",
    textSecondary: theme === "dark" ? "#9ca3af" : "#6b7280",
    textMuted: theme === "dark" ? "#6b7280" : "#9ca3af",
    border: theme === "dark" ? "rgba(139, 92, 246, 0.3)" : "#e5e7eb",
    borderActive: theme === "dark" ? "rgba(139, 92, 246, 0.5)" : "#8b5cf6",
  };

  const categories = {
    sports: [
      { id: "cricket", name: "Cricket", icon: "🏏" },
      { id: "football", name: "Football", icon: "⚽" },
      { id: "badminton", name: "Badminton", icon: "🏸" },
      { id: "volleyball", name: "Volleyball", icon: "🏐" },
      { id: "basketball", name: "Basketball", icon: "🏀" },
      { id: "tennis", name: "Tennis", icon: "🎾" },
      { id: "pickleball", name: "Pickleball", icon: "🏓" },
      { id: "hockey", name: "Hockey", icon: "🏑" },
      { id: "table_tennis", name: "Table Tennis", icon: "🏓" },
    ],
    hobbies: [
      { id: "swimming", name: "Swimming", icon: "🏊" },
      { id: "travelling", name: "Travelling", icon: "✈️" },
      { id: "zumba", name: "Zumba", icon: "💃" },
      { id: "cycling", name: "Cycling", icon: "🚴" },
      { id: "gym", name: "Gym", icon: "🏋️" },
      { id: "running", name: "Running", icon: "🏃" },
      { id: "karate", name: "Karate", icon: "🥋" },
      { id: "judo", name: "Judo", icon: "🥋" },
      { id: "yoga", name: "Yoga", icon: "🧘" },
      { id: "dancing", name: "Dancing", icon: "💃" },
      { id: "photography", name: "Photography", icon: "📷" },
      { id: "music", name: "Music", icon: "🎵" },
    ],
    activities: [
      { id: "karaoke", name: "Karaoke", icon: "🎤" },
      { id: "gigs", name: "Gigs", icon: "🎸" },
      { id: "night_clubs", name: "Night Clubs", icon: "🎉" },
      { id: "concerts", name: "Concerts", icon: "🎫" },
      { id: "movie", name: "Movies", icon: "🎬" },
      { id: "gaming", name: "Gaming", icon: "🎮" },
      { id: "cooking", name: "Cooking", icon: "🍳" },
      { id: "reading", name: "Reading", icon: "📚" },
    ],
    nostalgia: [
      { id: "dog_and_bowl", name: "Dog & Bowl", icon: "🐕" },
      { id: "antakshari", name: "Antakshari", icon: "🎶" },
      { id: "lagori", name: "Lagori", icon: "🥎" },
      { id: "hide_and_seek", name: "Hide & Seek", icon: "🙈" },
      { id: "carrom", name: "Carrom", icon: "🎱" },
      { id: "ludo", name: "Ludo", icon: "🎲" },
    ],
  };

  // Get icon for an interest based on its ID
  const getIconForInterest = (interestId) => {
    const allCategories = [
      ...categories.sports,
      ...categories.hobbies,
      ...categories.activities,
      ...categories.nostalgia,
    ];
    const found = allCategories.find((item) => item.id === interestId);
    return found ? found.icon : "⭐";
  };

  // Get name for an interest based on its ID
  const getNameForInterest = (interestId) => {
    const allCategories = [
      ...categories.sports,
      ...categories.hobbies,
      ...categories.activities,
      ...categories.nostalgia,
    ];
    const found = allCategories.find((item) => item.id === interestId);
    return found ? found.name : interestId;
  };

  const handleSelect = (typeId, category) => {
    console.log("Select Profile Type - User Selected:", { typeId, category });
    setSelectedType(typeId);
    setSelectedCategory(category);
  };

  // Fetch user data with interests on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getMe();
        
        // Log the full API response
        console.log("Select Profile Type - API Response:", JSON.stringify(userData, null, 2));
        console.log("Select Profile Type - Full User Data:", userData?.data);
        
        // Get interests from user data - keep them categorized
        const interests = userData?.data?.interests || {};
        console.log("Select Profile Type - User Interests:", interests);
        
        setUserInterests({
          sports: interests.sports || [],
          hobbies: interests.hobbies || [],
          activities: interests.activities || [],
          nostalgia: interests.nostalgia || [],
          additional: interests.additional || [],
        });
        
        // Set current main type if exists
        if (userData?.data?.profile_main_type) {
          console.log("Select Profile Type - Current Main Type:", userData.data.profile_main_type);
          setCurrentMainType(userData.data.profile_main_type);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (selectedType && selectedCategory) {
      setSaving(true);
      try {
        console.log("Select Profile Type - Saving:", { selectedType, selectedCategory });
        
        // Save profile main type to API
        const response = await updateProfileMainType(selectedType, selectedCategory);
        
        console.log("Select Profile Type - Save Response:", response);
        router.push("/home");
      } catch (err) {
        console.error("Failed to save profile main type:", err);
        // Still navigate to home even if save fails
        router.push("/home");
      }
    }
  };

  const handleSkip = () => {
    router.push("/home");
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: colors.bgPrimary }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleSkip}
            className="flex items-center gap-2 hover:text-white"
            style={{ color: colors.textMuted }}
          >
            <ArrowLeft size={20} />
            <span>Skip</span>
          </button>
          <h1 
            className="text-xl font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Select Profile Type
          </h1>
          <div className="w-16"></div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p 
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            Choose the activity that best represents your profile. This helps Playymate show better player matches, relevant posts, and sports communities.
          </p>
        </div>

        {/* User's Interests Section - Display by Category (Only show categories user has) */}
        {((userInterests.sports?.length > 0) || 
          (userInterests.hobbies?.length > 0) || 
          (userInterests.activities?.length > 0) || 
          (userInterests.nostalgia?.length > 0)) && (
          <div className="mb-8">
            <h3 
              className="text-sm font-medium mb-4"
              style={{ color: colors.textSecondary }}
            >
              Select from your interests
            </h3>
            
            {/* Sports Interests */}
            {userInterests.sports?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium mb-2" style={{ color: colors.primary }}>Sports</h4>
                <div className="flex flex-wrap gap-2">
                  {userInterests.sports.map((interest) => (
                    <button
                      key={`sports-${interest}`}
                      onClick={() => handleSelect(interest, "sports")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedType === interest
                          ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                          : "hover:bg-purple-500/30 border"
                      }`}
                      style={{
                        backgroundColor: selectedType === interest ? undefined : colors.bgCard,
                        color: selectedType === interest ? "white" : colors.textSecondary,
                        borderColor: colors.border
                      }}
                    >
                      {getIconForInterest(interest)} {getNameForInterest(interest)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hobbies Interests */}
            {userInterests.hobbies?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium mb-2" style={{ color: colors.primary }}>Hobbies</h4>
                <div className="flex flex-wrap gap-2">
                  {userInterests.hobbies.map((interest) => (
                    <button
                      key={`hobbies-${interest}`}
                      onClick={() => handleSelect(interest, "hobbies")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedType === interest
                          ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                          : "hover:bg-purple-500/30 border"
                      }`}
                      style={{
                        backgroundColor: selectedType === interest ? undefined : colors.bgCard,
                        color: selectedType === interest ? "white" : colors.textSecondary,
                        borderColor: colors.border
                      }}
                    >
                      {getIconForInterest(interest)} {getNameForInterest(interest)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Activities Interests */}
            {userInterests.activities?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium mb-2" style={{ color: colors.primary }}>Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {userInterests.activities.map((interest) => (
                    <button
                      key={`activities-${interest}`}
                      onClick={() => handleSelect(interest, "activities")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedType === interest
                          ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                          : "hover:bg-purple-500/30 border"
                      }`}
                      style={{
                        backgroundColor: selectedType === interest ? undefined : colors.bgCard,
                        color: selectedType === interest ? "white" : colors.textSecondary,
                        borderColor: colors.border
                      }}
                    >
                      {getIconForInterest(interest)} {getNameForInterest(interest)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Nostalgia Interests */}
            {userInterests.nostalgia?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium mb-2" style={{ color: colors.primary }}>Nostalgia</h4>
                <div className="flex flex-wrap gap-2">
                  {userInterests.nostalgia.map((interest) => (
                    <button
                      key={`nostalgia-${interest}`}
                      onClick={() => handleSelect(interest, "nostalgia")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedType === interest
                          ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                          : "hover:bg-purple-500/30 border"
                      }`}
                      style={{
                        backgroundColor: selectedType === interest ? undefined : colors.bgCard,
                        color: selectedType === interest ? "white" : colors.textSecondary,
                        borderColor: colors.border
                      }}
                    >
                      {getIconForInterest(interest)} {getNameForInterest(interest)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show predefined categories only if user has no interests */}
        {((!userInterests.sports?.length) && 
          (!userInterests.hobbies?.length) && 
          (!userInterests.activities?.length) && 
          (!userInterests.nostalgia?.length)) && (
          <>
        {/* Sports Category */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>Sports</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => handleSelect(sport.id, "sports")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === sport.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "hover:bg-purple-500/30"
                }`}
                style={{
                  backgroundColor: selectedType === sport.id ? undefined : colors.bgCard,
                  color: selectedType === sport.id ? "white" : colors.textSecondary
                }}
              >
                <span className="text-xl mb-1 block">{sport.icon}</span>
                <span className="text-xs font-medium">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hobbies Category */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>Hobbies</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.hobbies.map((hobby) => (
              <button
                key={hobby.id}
                onClick={() => handleSelect(hobby.id, "hobbies")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === hobby.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "hover:bg-purple-500/30"
                }`}
                style={{
                  backgroundColor: selectedType === hobby.id ? undefined : colors.bgCard,
                  color: selectedType === hobby.id ? "white" : colors.textSecondary
                }}
              >
                <span className="text-xl mb-1 block">{hobby.icon}</span>
                <span className="text-xs font-medium">{hobby.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities Category */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>Activities</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleSelect(activity.id, "activities")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === activity.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "hover:bg-purple-500/30"
                }`}
                style={{
                  backgroundColor: selectedType === activity.id ? undefined : colors.bgCard,
                  color: selectedType === activity.id ? "white" : colors.textSecondary
                }}
              >
                <span className="text-xl mb-1 block">{activity.icon}</span>
                <span className="text-xs font-medium">{activity.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nostalgia Category */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>Nostalgia</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.nostalgia.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id, "nostalgia")}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedType === item.id
                    ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    : "hover:bg-purple-500/30"
                }`}
                style={{
                  backgroundColor: selectedType === item.id ? undefined : colors.bgCard,
                  color: selectedType === item.id ? "white" : colors.textSecondary
                }}
              >
                <span className="text-xl mb-1 block">{item.icon}</span>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
          </>
        )}

        {/* Info Box */}
        <div 
          className="border rounded-xl p-4 mb-8"
          style={{ 
            backgroundColor: theme === "dark" ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.1)",
            borderColor: colors.borderActive
          }}
        >
          <p 
            className="text-sm"
            style={{ color: theme === "dark" ? "#c4b5fd" : "#7c3aed" }}
          >
            This helps Playymate show better player matches, relevant posts, sports communities, and suggested follows.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!selectedType || saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Check size={20} />
              Save Profile Type
            </>
          )}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
