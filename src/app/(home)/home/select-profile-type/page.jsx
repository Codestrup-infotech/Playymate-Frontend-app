"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import { updateProfileMainType } from "@/services/profile.service";
import { useTheme } from "@/lib/ThemeContext";

// Function to capitalize and format text
function capitalize(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Function to get icon for an interest - returns default icon (no hardcoded mapping)
function getIconForInterest(interestId) {
  if (!interestId) return "⭐";
  return "⭐";
}

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

  const handleSelect = (typeId, category) => {
    console.log("Select Profile Type - User Selected:", { typeId, category });
    setSelectedType(typeId);
    setSelectedCategory(category);
  };

  // Fetch user data with interests on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userService.getMe();
        
        // Handle both nested and non-nested API response formats
        // Some APIs return { data: { data: {...} } } and others return { data: {...} }
        const profile = res?.data?.data || res?.data;
        
        // Log the full API response for debugging
        console.log("Select Profile Type - API Response:", JSON.stringify(res, null, 2));
        console.log("Select Profile Type - Profile data:", JSON.stringify(profile, null, 2));
        
        // Get interests from user data - keep them categorized
        // API response structure: profile.interests
        const interests = profile?.interests || {};
        console.log("Select Profile Type - User Interests:", interests);
        
        setUserInterests({
          sports: interests.sports || [],
          hobbies: interests.hobbies || [],
          activities: interests.activities || [],
          nostalgia: interests.nostalgia || [],
          // Also check for 'interests' (singular) field
          additional: interests.additional || interests.interests || [],
        });
        
        // Set current main type if exists
        // API response structure: profile.profile_main_type = { type: "sports", value: "badminton" }
        if (profile?.profile_main_type?.value) {
          console.log("Select Profile Type - Current Main Type:", profile.profile_main_type);
          setCurrentMainType(profile.profile_main_type.value);
          setSelectedType(profile.profile_main_type.value);
          setSelectedCategory(profile.profile_main_type.type);
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
              (userInterests.nostalgia?.length > 0) ||
              (userInterests.additional?.length > 0)) && (
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
                          {getIconForInterest(interest)} {capitalize(interest)}
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
                          {getIconForInterest(interest)} {capitalize(interest)}
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
                          {getIconForInterest(interest)} {capitalize(interest)}
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
                          {getIconForInterest(interest)} {capitalize(interest)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Interests (from 'interests' singular field) */}
                {userInterests.additional?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium mb-2" style={{ color: colors.primary }}>Other Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {userInterests.additional.map((interest) => (
                        <button
                          key={`additional-${interest}`}
                          onClick={() => handleSelect(interest, "additional")}
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
                          {getIconForInterest(interest)} {capitalize(interest)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
