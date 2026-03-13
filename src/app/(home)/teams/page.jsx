"use client"

import { Users, Plus, Trophy, Calendar, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/lib/ThemeContext"

export default function TeamsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0f0f1a] text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#1a1a2e] border-[#2a2a45]" : "bg-white border-gray-200";
  const actBg = isDark ? "bg-[#1a1a2e] border-[#2a2a45] hover:bg-[#252542]" : "bg-white border-gray-200 hover:bg-gray-50";
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500";

  const activities = [
    { icon: <Trophy />, title: "Thunder strikers won their match!", time: "2h ago" },
    { icon: <Users />, title: "New member joined Night Hawks", time: "5h ago" },
    { icon: <Calendar />, title: "Event weekend league starts tomorrow", time: "1d ago" },
  ];

  return (
    <div className={`min-h-screen px-4 py-6 transition-colors duration-300 ${pageBg}`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold">Teams</h1>
      </div>

      {/* YOUR TEAMS CARD */}
      <div className="rounded-3xl p-6 mb-6 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
        <p className="text-sm tracking-widest text-white/80">YOUR TEAMS</p>
        <h2 className="text-6xl font-bold mt-2 text-white">3</h2>
        <p className="text-sm mt-2 text-white/90">2 OWNED • 1 MEMBER</p>
        <button className="mt-6 bg-white/20 hover:bg-white/30 transition px-5 py-3 rounded-xl font-medium flex items-center gap-2 text-white">
          View Teams
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/teams/create-team" className={`block rounded-2xl p-5 border transition cursor-pointer ${actBg}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-3 text-white">
            <Plus size={22} />
          </div>
          <h3 className="font-semibold text-lg">Create Team</h3>
          <p className={`text-sm ${mutedText}`}>Start New Team</p>
        </Link>

        <Link href="/teams/join-team" className={`block rounded-2xl p-5 border transition cursor-pointer ${actBg}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? "bg-[#252542] text-gray-300" : "bg-gray-100 text-gray-700"}`}>
            <UserPlus size={22} />
          </div>
          <h3 className="font-semibold text-lg">Join Team</h3>
          <p className={`text-sm ${mutedText}`}>Enter Invite Code</p>
        </Link>
      </div>

      {/* RECENT ACTIVITY */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((act, i) => (
          <div key={i} className={`rounded-2xl p-4 flex items-center gap-4 border ${cardBg}`}>
            <div className={mutedText}>{act.icon}</div>
            <div>
              <p className="font-medium">{act.title}</p>
              <p className={`text-sm ${mutedText}`}>{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
