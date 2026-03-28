"use client"

import { Users, Plus, Trophy, Calendar, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/lib/ThemeContext"

export default function TeamsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#12121c] border-[#2a2a45]" : "bg-white border-gray-200";
  const actBg = isDark ? "bg-[#12121c] border-[#2a2a45] hover:bg-[#1c1c2e]" : "bg-white border-gray-200 hover:bg-gray-50";
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500";

  const activities = [
    { icon: <Trophy size={20} />, title: "Thunder strikers won their match!", time: "2h ago" },
    { icon: <Users size={20} />, title: "New member joined Night Hawks", time: "5h ago" },
    { icon: <Calendar size={20} />, title: "Event weekend league starts tomorrow", time: "1d ago" },
  ];

  return (
    <div className={`min-h-screen px-5 py-6 transition-all ${pageBg}`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Create Team</h1>
      </div>

      {/* GRADIENT CARD */}
      <div className="rounded-[28px] p-6 mb-6 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 shadow-xl">
        <p className="text-xs tracking-[0.2em] text-white/80">YOUR TEAMS</p>
        
        <h2 className="text-6xl font-bold mt-2 text-white leading-none">3</h2>
        
        <p className="text-sm mt-3 text-white/90 font-medium">
          2 OWNED <span className="mx-2">•</span> 1 MEMBER
        </p>

        <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md transition px-5 py-3 rounded-xl font-medium flex items-center gap-2 text-white">
          View Teams
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">

        <Link
          href="/teams/create-team"
          className={`block rounded-2xl p-5 border transition ${actBg}`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-3 text-white shadow-md">
            <Plus size={22} />
          </div>

          <h3 className="font-semibold text-lg">Create Team</h3>
          <p className={`text-sm mt-1 ${mutedText}`}>Start New Team</p>
        </Link>

        <Link
          href="/teams/join-team"
          className={`block rounded-2xl p-5 border transition ${actBg}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? "bg-[#252542] text-gray-300" : "bg-gray-100 text-gray-700"}`}>
            <UserPlus size={22} />
          </div>

          <h3 className="font-semibold text-lg">My Team</h3>
          <p className={`text-sm mt-1 ${mutedText}`}>Manage Teams</p>
        </Link>
      </div>

      {/* RECENT ACTIVITY */}
      <h2 className="text-xl font-semibold mb-4 tracking-tight">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((act, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 flex items-center gap-4 border ${cardBg} shadow-sm`}
          >
            <div className={`opacity-80 ${mutedText}`}>
              {act.icon}
            </div>

            <div>
              <p className="font-medium text-[15px]">{act.title}</p>
              <p className={`text-sm mt-1 ${mutedText}`}>{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}