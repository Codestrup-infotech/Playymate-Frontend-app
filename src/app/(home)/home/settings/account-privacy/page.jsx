"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, Globe, Users, Lock } from "lucide-react";
import { userService } from "@/services/user";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe, description: "Anyone can see" },
  { value: "friends_only", label: "Friends Only", icon: Users, description: "Only followers can see" },
  { value: "private", label: "Private", icon: Lock, description: "Only you can see" },
];

export default function AccountPrivacyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "public",
    performance_visibility: "public",
    social_visibility: "public",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [savingField, setSavingField] = useState(null);

  // Fetch current user and privacy settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const meRes = await userService.getMe();
        console.log('=== GET /users/me RESPONSE ===');
        console.log('Full response:', meRes);
        console.log('Response data:', meRes?.data);
        const userData = meRes?.data?.data || meRes?.data;
        console.log('User data:', userData);
        
        if (userData && userData._id) {
          setCurrentUserId(userData._id);
          console.log('Current user ID:', userData._id);
          
          // Get privacy settings
          try {
            console.log('=== GET /users/{userId}/privacy REQUEST ===');
            console.log('Request URL:', `/users/${userData._id}/privacy`);
            const privacyRes = await userService.getPrivacy(userData._id);
            console.log('=== GET /users/{userId}/privacy RESPONSE ===');
            console.log('Full privacy response:', privacyRes);
            console.log('Privacy response data:', privacyRes?.data);
            console.log('Privacy response data data:', privacyRes?.data?.data);
            const privacyData = privacyRes?.data?.data || privacyRes?.data;
            console.log('Privacy data:', privacyData);
            console.log('Privacy data object:', privacyData);
            console.log('Privacy inner object:', privacyData.privacy);
            const innerPrivacy = privacyData.privacy || privacyData;
            
            if (innerPrivacy) {
              setPrivacySettings({
                profile_visibility: innerPrivacy.profile_visibility || "public",
                performance_visibility: innerPrivacy.performance_visibility || "public",
                social_visibility: innerPrivacy.social_visibility || "public",
              });
            }
          } catch (privacyErr) {
            console.log('Privacy settings not found, using defaults');
            console.log('Privacy error:', privacyErr);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-save on visibility change
  const handleVisibilityChange = async (field, value) => {
    if (!currentUserId || saving) return;

    // Optimistic update
    const oldValue = privacySettings[field];
    setPrivacySettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaving(true);
    setSavingField(field);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        profile_visibility: field === 'profile_visibility' ? value : privacySettings.profile_visibility,
        performance_visibility: field === 'performance_visibility' ? value : privacySettings.performance_visibility,
        social_visibility: field === 'social_visibility' ? value : privacySettings.social_visibility,
      };

      console.log('=== PATCH /users/{userId}/privacy REQUEST ===');
      console.log('Request URL:', `/users/${currentUserId}/privacy`);
      console.log('Request payload:', payload);
      console.log('Payload stringified:', JSON.stringify(payload));

      const updateRes = await userService.updatePrivacy(currentUserId, payload);

      console.log('=== PATCH /users/{userId}/privacy RESPONSE ===');
      console.log('Full response:', updateRes);
      console.log('Response status:', updateRes?.status);
      console.log('Response data:', updateRes?.data);
      console.log('Updated privacy:', updateRes?.data?.data?.privacy);

      setMessage({ type: "success", text: `${getFieldLabel(field)} updated successfully!` });
      
      // Clear message after 2 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 2000);
    } catch (err) {
      console.error('=== ERROR UPDATING PRIVACY ===');
      console.error('Error:', err);
      console.error('Error response:', err?.response);
      console.error('Error status:', err?.response?.status);
      console.error('Error data:', err?.response?.data);
      
      // Revert on error
      setPrivacySettings((prev) => ({
        ...prev,
        [field]: oldValue,
      }));
      setMessage({ type: "error", text: `Failed to update ${getFieldLabel(field).toLowerCase()}` });
    } finally {
      setSaving(false);
      setSavingField(null);
    }
  };

  // Helper to get field label
  const getFieldLabel = (field) => {
    switch(field) {
      case 'profile_visibility': return 'Profile Visibility';
      case 'performance_visibility': return 'Performance Visibility';
      case 'social_visibility': return 'Social Visibility';
      default: return field;
    }
  };

  // Render visibility option button
  const renderOptionButton = (field, option) => {
    const isSelected = privacySettings[field] === option.value;
    const isSaving = savingField === field;
    const Icon = option.icon;

    return (
      <button
        key={option.value}
        onClick={() => handleVisibilityChange(field, option.value)}
        disabled={saving}
        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
          isSelected
            ? "border-orange-500 bg-orange-50"
            : "border-gray-200 hover:border-gray-300"
        } ${saving ? "opacity-50" : ""}`}
      >
        <div className="flex flex-col items-center gap-1">
          {isSaving ? (
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          ) : (
            <Icon
              className={`w-5 h-5 ${isSelected ? "text-orange-500" : "text-gray-400"}`}
            />
          )}
          <span
            className={`text-sm font-medium ${
              isSelected ? "text-orange-600" : "text-gray-600"
            }`}
          >
            {option.label}
          </span>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-6">Account privacy</h1>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" && <Check className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Profile Visibility Section */}
      <div className="border border-gray-300 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Profile Visibility</h2>
            <p className="text-sm text-gray-500 mt-1">
              Control who can see your profile information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((option) =>
            renderOptionButton("profile_visibility", option)
          )}
        </div>
      </div>

      {/* Performance Visibility Section */}
      <div className="border border-gray-300 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Performance Visibility</h2>
            <p className="text-sm text-gray-500 mt-1">
              Control who can see your performance stats and achievements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((option) =>
            renderOptionButton("performance_visibility", option)
          )}
        </div>
      </div>

      {/* Social Visibility Section */}
      <div className="border border-gray-300 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Social Visibility</h2>
            <p className="text-sm text-gray-500 mt-1">
              Control who can see your social connections and activity
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((option) =>
            renderOptionButton("social_visibility", option)
          )}
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-500 space-y-4 leading-relaxed">
        <p>
          <strong>Public:</strong> Your content is visible to everyone, including
          people who don't follow you.
        </p>
        <p>
          <strong>Friends Only:</strong> Your content is only visible to your
          followers.
        </p>
        <p>
          <strong>Private:</strong> Your content is only visible to you.
        </p>
      </div>
    </div>
  );
}