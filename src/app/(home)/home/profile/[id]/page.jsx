"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Settings,
  Share2,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { getUserById } from "@/lib/api/userService";

export default function ProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Posts");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = ["Posts", "Reels", "Events", "Community"];

  useEffect(() => {
    if (!id) return;

    getUserById(id)
      .then((data) => setUser(data))
      .catch((err) => console.error("User fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-white p-10">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-red-500 p-10">User not found</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {user.username}
              {user.verified && (
                <span className="text-green-500">✔</span>
              )}
            </h1>

            <div className="flex gap-3">
              <button className="px-5 py-2 rounded-lg bg-[#252542] flex items-center gap-2">
                <Share2 size={18} />
                Share
              </button>
              <button className="px-5 py-2 rounded-lg bg-[#252542] flex items-center gap-2">
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>

          {/* PROFILE SECTION */}
          <div className="flex gap-8 items-start">

            {/* PROFILE IMAGE */}
            <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-orange-500">
              <img
                src={user.profileImage || "/profile.jpg"}
                alt="profile"
                className="w-full h-full rounded-full border-4 border-[#1a1a2e] object-cover"
              />
            </div>

            {/* PROFILE DETAILS */}
            <div className="flex-1">

              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  {user.fullName}
                </h2>

                <div className="flex gap-3">
                  <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500">
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
                <Stat label="Posts" value={user.postsCount} />
                <Stat label="Followers" value={user.followersCount} />
                <Stat label="Following" value={user.followingCount} />
              </div>

              {/* BIO */}
              <div className="mt-6 max-w-xl">
                <p className="font-semibold">{user.username}</p>
                <p className="mt-2 text-sm text-gray-400">
                  {user.bio}
                </p>

                {user.location && (
                  <p className="mt-2 text-gray-400 flex items-center gap-1">
                    <MapPin size={14} />
                    {user.location}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 mt-6">
          <div className="flex gap-8 border-b border-gray-700 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-4 -mb-4 ${
                  activeTab === tab
                    ? "text-white border-b-2 border-purple-500"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Example Posts Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
            {user.posts?.map((post, i) => (
              <div
                key={i}
                className="aspect-square bg-[#252542] rounded-xl overflow-hidden"
              >
                <img
                  src={post.imageUrl}
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

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xl font-bold">{value || 0}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}