"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Share2, MessageCircle, Users, Heart, MapPin, Pencil } from "lucide-react";
import { userService } from "@/services/user";
import { userAccountService } from "@/services/user-account";
import { getCurrentUserId } from "@/services/profile.service";
export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Posts");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = ["Posts", "Reels", "Events", "Community"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use helper function to get current user ID
        let userId = getCurrentUserId();
        
        console.log("Fetching profile for userId:", userId);
        
        // If we have a user ID, fetch user profile
        let userData = null;
        let userRes = null;
        
        if (userId) {
          userRes = await userAccountService.getUserById(userId);
          userData = userRes?.data?.data || userRes?.data;
        } else {
          // Fallback: use getMe() which doesn't require user ID - it uses the auth token
          console.log("User ID not found, using getMe()...");
          userRes = await userService.getMe();
          userData = userRes?.data?.data || userRes?.data;
          
          // Try to get user_id from the response
          if (userData?.id) {
            userId = userData.id;
            localStorage.setItem('user_id', userId);
            console.log("Stored user_id from getMe response:", userId);
          }
        }

        // Handle different response structures
        if (!userData && userRes?.data) {
          userData = userRes.data;
        }
        
        if (!userData) {
          throw new Error("No profile data received from API");
        }

        // Transform API response to match UI expected format
        const userIdFromData = userData._id || userData.id;
        
        // Store user_id for future use if not already stored
        if (userIdFromData && !localStorage.getItem('user_id')) {
          localStorage.setItem('user_id', userIdFromData);
        }

        const transformedProfile = {
          _id: userIdFromData,
          name: userData.full_name || userData.name,
          username: userData.username || userData.email?.split('@')[0] || userData.phone || 'User',
          username: userData.username || userData.email?.split('@')[0] || userData.phone || 'User',
          email: userData.email,
          phone: userData.phone,
          bio: userData.bio || '',
          gender: userData.gender,
          dob: userData.dob,
          location: typeof userData.profile_location === 'object' 
            ? userData.profile_location?.display_text || userData.profile_location?.city || JSON.stringify(userData.profile_location)
            : userData.profile_location || userData.location,
          photo: userData.profile_picture || userData.photo || userData.avatar,
          posts: userData.posts_count || userData.posts || 0,
          followers: userData.followers_count || userData.followers || 0,
          following: userData.following_count || userData.following || 0,
          gallery: userData.gallery || [],
          // Handle interests as object with categories
          interests: Array.isArray(userData.interests) 
            ? userData.interests 
            : (userData.interests 
                ? [...(userData.interests.sports || []), ...(userData.interests.hobbies || []), ...(userData.interests.additional || []), ...(userData.interests.activities || []), ...(userData.interests.nostalgia || [])]
                : []),
          activity_intent: userData.activity_intent,
          profile_role: userData.profile_role,
          profile_details: userData.profile_details,
        };
  
        setProfile(transformedProfile);
        
        // ============ LOG USER DATA TO CONSOLE ============
        console.group("👤 USER DATA FROM CONSOLE");
        console.log("========== USER ID ==========");
        console.log("User ID:", userIdFromData);
        
        console.log("\n========== FULL USER PROFILE ==========");
        console.log(transformedProfile);
        
        console.log("\n========== USER DETAILS BREAKDOWN ==========");
        console.log("Name:", transformedProfile?.name);
        console.log("Username:", transformedProfile?.username);
        console.log("Email:", transformedProfile?.email);
        console.log("Phone:", transformedProfile?.phone);
        console.log("Gender:", transformedProfile?.gender);
        console.log("Date of Birth:", transformedProfile?.dob);
        console.log("Location:", transformedProfile?.location);
        console.log("Bio:", transformedProfile?.bio);
        console.log("Photo/Avatar:", transformedProfile?.photo);
        
        console.log("\n========== INTERESTS (FROM ONBOARDING) ==========");
        console.log("Interests Array:", transformedProfile?.interests);
        console.log("Interests Count:", transformedProfile?.interests?.length);
        
        console.log("\n========== ACTIVITY & PROFILE DETAILS ==========");
        console.log("Activity Intent:", transformedProfile?.activity_intent);
        console.log("Profile Role:", transformedProfile?.profile_role);
        console.log("Profile Details:", transformedProfile?.profile_details);
        
        console.log("\n========== SOCIAL STATS ==========");
        console.log("Posts:", transformedProfile?.posts);
        console.log("Followers:", transformedProfile?.followers);
        console.log("Following:", transformedProfile?.following);
        
        console.log("\n========== GALLERY ==========");
        console.log("Gallery Images:", transformedProfile?.gallery);
        
        console.log("\n========== RAW API RESPONSE ==========");
        console.log(userRes);
        
        console.groupEnd();
        // ===================================================
        
        // ============ FETCH ADDITIONAL ONBOARDING DATA ============
        try {
          const onboardingRes = await userService.getOnboardingStatus();
          
          console.group("📋 ONBOARDING DATA");
          console.log("Onboarding Status Response:", onboardingRes);
          
          // Extract interests from different possible locations
          const interestsFromStatus = onboardingRes?.data?.interests || onboardingRes?.data?.data?.interests;
          const interestsFromProfile = transformedProfile?.interests;
          
          console.log("\n========== ALL INTEREST SOURCES ==========");
          console.log("Interests from getOnboardingStatus():", interestsFromStatus);
          console.log("Interests from getUserById()/getMe():", interestsFromProfile);
          
          console.log("\n========== ONBOARDING DETAILS ==========");
          console.log("Onboarding State:", onboardingRes?.data?.onboarding_state);
          console.log("Next Required Step:", onboardingRes?.data?.next_required_step);
          console.log("Progress Percentage:", onboardingRes?.data?.progress_percentage);
          console.log("Profile from Status:", onboardingRes?.data?.profile);
          
          console.groupEnd();
        } catch (onboardingError) {
          console.log("Could not fetch additional onboarding data:", onboardingError);
        }
        // ===========================================================
        
      } catch (error) {
        console.log("ERROR:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
  
  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const gallery = profile.gallery || [];

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER CARD */}
        <div className="bg-black text-white rounded-xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {profile.username} <span className="text-green-500">✔</span>
            </h1>

            <div className="flex gap-3">
              <button 
                onClick={() => router.push("/home/profile/edit")}
                className="px-5 py-2 rounded-lg bg-[#252542] hover:bg-[#2d2d52] transition-colors flex items-center gap-2"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
              <button className="px-5 py-2 rounded-lg bg-[#252542] hover:bg-[#2d2d52] transition-colors flex items-center gap-2">
                <Share2 size={18} />
                Share
              </button>
              <button className="px-5 py-2 rounded-lg bg-[#252542] hover:bg-[#2d2d52] flex items-center gap-2">
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>

          {/* PROFILE SECTION */}
          <div className="flex gap-8 items-start">

            {/* PROFILE IMAGE */}
            <div>
              <div className="relative">
                <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
                  <img
                    src={profile.photo || "/loginAvatars/profile.png"}
                    alt="profile"
                    className="w-full h-full rounded-full border-4 border-[#1a1a2e] object-cover"
                  />
                </div>
              </div>
            </div>

            {/* PROFILE DETAILS */}
            <div className="flex-1">

              {/* NAME + ACTION */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{profile.name}</h2>

                <div className="flex gap-3">
                  <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 font-semibold">
                    Follow
                  </button>
                  <button className="px-6 py-2 rounded-lg border border-purple-500">
                    Team
                  </button>
                  <button className="w-11 h-11 rounded-lg border border-gray-600 flex items-center justify-center">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="flex gap-12 mt-6">
                <div>
                  <p className="text-xl font-bold">{profile.posts || 0}</p>
                  <p className="text-gray-400 text-sm">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.followers || 0}</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.following || 0}</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>

              {/* BIO */}
              <div className="mt-6 max-w-xl">
                <p className="font-semibold text-white">{profile.username}</p>

                <p className="mt-1 text-gray-300">
                  {Array.isArray(profile.interests) ? profile.interests.join(" / ") : profile.interests}
                </p>

                <p className="mt-2 text-sm text-gray-400">{profile.bio || "No bio yet"}</p>

                <p className="text-purple-400 mt-2">
                  #{Array.isArray(profile.interests) ? profile.interests.join(" #") : profile.interests}
                </p>

                <p className="mt-2 text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {profile.location || "Location not set"}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* TABS CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">

          {/* TABS */}
          <div className="flex gap-8 border-b border-gray-700 pb-4">
            {["Posts", "Reels", "Events", "Community"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-4 -mb-4 ${
                  activeTab === tab
                    ? "text-white border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* GALLERY GRID */}
          <div className="grid grid-cols-3 gap-1 mt-6">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="aspect-square bg-[#252542] overflow-hidden hover:opacity-80 transition-opacity cursor-pointer relative"
              >
                <img
                  src={img}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

