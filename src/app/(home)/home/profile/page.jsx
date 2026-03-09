"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Share2, MessageCircle, Users, Heart, MapPin, Pencil } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Posts");

  const tabs = ["Posts", "Reels", "Events", "Community"];

  const gallery = [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
    "/gallery/4.jpg",
    "/gallery/5.jpg",
    "/gallery/6.jpg",
  ];

  return (
    <div className="space-y-6">

      {/* CONTAINER */}
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              your-name <span className="text-green-500">✔</span>
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
              <button className="px-5 py-2 rounded-lg bg-[#252542] hover:bg-[#2d2d52] transition-colors flex items-center gap-2">
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
                    src="/profile.jpg"
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
                <h2 className="text-2xl font-semibold">XYZ</h2>

                <div className="flex gap-3">
                  <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 font-semibold hover:opacity-90 transition-opacity">
                    Follow
                  </button>
                  <button className="px-6 py-2 rounded-lg border border-purple-500 hover:bg-purple-500/20 transition-colors">
                    Team
                  </button>
                  <button className="w-11 h-11 rounded-lg border border-gray-600 flex items-center justify-center hover:bg-[#252542] transition-colors">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="flex gap-12 mt-6">
                <div>
                  <p className="text-xl font-bold">9</p>
                  <p className="text-gray-400 text-sm">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold">120</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">23</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>

              {/* BIO */}
              <div className="mt-6 max-w-xl">
                <p className="font-semibold text-white">Username</p>
                <p className="mt-1 text-gray-300">Cricket / Genre text</p>
                <p className="mt-2 text-sm text-gray-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-purple-400 mt-2">#hashtag</p>
                <p className="mt-2 text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  Pune, Maharashtra
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* TABS CARD */}
        <div className="bg-[#1a1a2e] rounded-xl p-6">
          {/* TABS */}
          <div className="flex gap-8 border-b border-gray-700 pb-4">
            {tabs.map((tab) => (
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
