"use client"

import { Users, Plus, Trophy, Calendar, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button className="text-white text-xl">←</button>
        <h1 className="text-xl font-semibold">Teams</h1>
      </div>

      {/* YOUR TEAMS CARD */}
      <div className="rounded-3xl p-6 mb-6 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
        
        <p className="text-sm tracking-widest text-white/80">YOUR TEAMS</p>

        <h2 className="text-6xl font-bold mt-2">3</h2>

        <p className="text-sm mt-2 text-white/90">
          2 OWNED • 1 MEMBER
        </p>

        <button className="mt-6 bg-white/20 hover:bg-white/30 transition px-5 py-3 rounded-xl font-medium flex items-center gap-2">
          View Teams
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        
        {/* Create Team */}
        <Link href="/teams/create-team" className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 transition cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-3">
            <Plus size={22} />
          </div>

          <h3 className="font-semibold text-lg">Create Team</h3>
          <p className="text-sm text-zinc-400">Start New Team</p>
        </Link>

        {/* Join Team */}
        <Link href="/teams/join-team" className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 transition cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center mb-3">
            <UserPlus size={22} />
          </div>

          <h3 className="font-semibold text-lg">Join Team</h3>
          <p className="text-sm text-zinc-400">Enter Invite Code</p>
        </Link>
      </div>

      {/* RECENT ACTIVITY */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-4">

        {/* Activity Item */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <Trophy className="text-zinc-300" />
          <div>
            <p className="font-medium">Thunder strikers won their match!</p>
            <p className="text-sm text-zinc-400">2h ago</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <Users className="text-zinc-300" />
          <div>
            <p className="font-medium">New member joined Night Hawks</p>
            <p className="text-sm text-zinc-400">5h ago</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <Calendar className="text-zinc-300" />
          <div>
            <p className="font-medium">
              Event weekend league starts tomorrow
            </p>
            <p className="text-sm text-zinc-400">1d ago</p>
          </div>
        </div>

      </div>
    </div>
  )
}
