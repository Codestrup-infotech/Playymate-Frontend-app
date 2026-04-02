"use client";

import { useRouter } from "next/navigation";
import { Users, Trophy, Calendar } from "lucide-react";

export default function TeamInvitationCard({ team }) {
  const router = useRouter();

  const handleAccept = () => {
    // you can call API here before redirect if needed
    router.push(`/teams/join-team/${team?.id}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6">
      <div className="rounded-3xl overflow-hidden shadow-xl bg-white">
        
        {/* Top Gradient */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400">
          
          {/* Tag */}
          <div className="absolute right-3 top-3">
            <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
              WATER_RAFTING
            </span>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 -bottom-10 -translate-x-1/2">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-2xl font-bold text-pink-500">
                {team?.name?.charAt(0) || "W"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-6 px-4 sm:px-6 text-center bg-gray-50 rounded-b-3xl">
          
          {/* Title */}
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {team?.name}
          </h2>

          {/* Sub text */}
          <p className="text-xs sm:text-sm mt-1 text-gray-500">
            <span className="text-pink-500 font-medium">
              @{team?.username}
            </span>{" "}
            • Global
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5">
            
            {/* Members */}
            <div className="bg-gray-100 rounded-xl py-3">
              <Users className="mx-auto text-pink-500" size={18} />
              <p className="font-bold text-gray-800 mt-1">
                {team?.members}
              </p>
              <p className="text-[10px] text-gray-500">MEMBERS</p>
            </div>

            {/* Skill */}
            <div className="bg-gray-100 rounded-xl py-3">
              <Trophy className="mx-auto text-orange-500" size={18} />
              <p className="font-bold text-gray-800 mt-1">
                {team?.skill}
              </p>
              <p className="text-[10px] text-gray-500">SKILL</p>
            </div>

            {/* Capacity */}
            <div className="bg-gray-100 rounded-xl py-3">
              <Calendar className="mx-auto text-purple-500" size={18} />
              <p className="font-bold text-gray-800 mt-1">
                {team?.capacity}
              </p>
              <p className="text-[10px] text-gray-500">CAPACITY</p>
            </div>
          </div>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition"
          >
            Accept Invitation
          </button>
        </div>
      </div>
    </div>
  );
}