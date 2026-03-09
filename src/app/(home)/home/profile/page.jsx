"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Share2, MessageCircle, Users, Heart, MapPin, Pencil } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Posts");
  const [profile, setProfile] = useState(null);

  const tabs = ["Posts", "Reels", "Events", "Community"];

  const userId = 1;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First, try to get user_id from localStorage (stored during onboarding/login)
        let userId = localStorage.getItem('user_id');
        let storedUser = null;
        
        // Also try to get from 'user' localStorage (some parts of the app use this)
        try {
          storedUser = JSON.parse(localStorage.getItem("user"));
        } catch (e) {
          // Ignore parse errors
        }
        
        // If user_id not found in localStorage, try stored user object
        if (!userId && storedUser?.id) {
          userId = storedUser.id;
        }
        
        // If we have a user ID, fetch user profile
        let userData = null;
        let userRes = null;
        
        if (userId) {
          userRes = await userAccountService.getUserById(userId);
          userData = userRes?.data?.data || userRes?.data;
        } else {
          // Fallback: use getMe() which doesn't require user ID - it uses the auth token
          console.log("User ID not found in localStorage, using getMe()...");
          userRes = await userService.getMe();
          userData = userRes?.data?.data || userRes?.data;
          
          // Try to get user_id from the response
          if (userRes?.data?.id) {
            userId = userRes.data.id;
            localStorage.setItem('user_id', userId);
            console.log("Stored user_id from getMe response:", userId);
          }
        }
  
        setProfile(userData);
        
        // ============ LOG USER DATA TO CONSOLE ============
        console.group("👤 USER DATA FROM CONSOLE");
        console.log("========== USER ID ==========");
        console.log("User ID:", userId);
        console.log("Stored User Object:", storedUser);
        
        console.log("\n========== FULL USER PROFILE ==========");
        console.log(userData);
        
        console.log("\n========== USER DETAILS BREAKDOWN ==========");
        console.log("Name:", userData?.name);
        console.log("Username:", userData?.username);
        console.log("Email:", userData?.email);
        console.log("Phone:", userData?.phone);
        console.log("Gender:", userData?.gender);
        console.log("Date of Birth:", userData?.dob);
        console.log("Location:", userData?.location);
        console.log("Bio:", userData?.bio);
        console.log("Photo/Avatar:", userData?.photo);
        
        console.log("\n========== INTERESTS (FROM ONBOARDING) ==========");
        console.log("Interests Array:", userData?.interests);
        console.log("Interests Count:", userData?.interests?.length);
        
        console.log("\n========== ACTIVITY & PROFILE DETAILS ==========");
        console.log("Activity Intent:", userData?.activity_intent);
        console.log("Profile Role:", userData?.profile_role);
        console.log("Profile Details:", userData?.profile_details);
        
        console.log("\n========== SOCIAL STATS ==========");
        console.log("Posts:", userData?.posts);
        console.log("Followers:", userData?.followers);
        console.log("Following:", userData?.following);
        
        console.log("\n========== GALLERY ==========");
        console.log("Gallery Images:", userData?.gallery);
        
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
          const interestsFromProfile = userData?.interests;
          
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
      }
    };
  
    fetchProfile();
  }, []);
  
  if (!profile) {
    return (
      <div className="text-white text-center py-20">
        Loading profile...
      </div>
    );
  }

  const gallery = profile.gallery || [];

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">

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
                    src={profile.photo}
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
                  <p className="text-xl font-bold">{profile.posts}</p>
                  <p className="text-gray-400 text-sm">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.followers}</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.following}</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>

              {/* BIO */}
              <div className="mt-6 max-w-xl">
                <p className="font-semibold text-white">{profile.username}</p>

                <p className="mt-1 text-gray-300">
                  {profile.interests?.join(" / ")}
                </p>

                <p className="mt-2 text-sm text-gray-400">{profile.bio}</p>

                <p className="text-purple-400 mt-2">
                  #{profile.interests?.join(" #")}
                </p>

                <p className="mt-2 text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {profile.location}
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

