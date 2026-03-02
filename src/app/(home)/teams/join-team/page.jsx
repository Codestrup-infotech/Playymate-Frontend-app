"use client"

import { ArrowLeft, MapPin, Users, DollarSign, Shield, Trophy, Calendar } from "lucide-react"
import Link from "next/link"

export default function JoinTeamPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Join Team</h1>
      </div>

      {/* Team Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400"></div>
        
        <div className="p-5">
          {/* Team Icon */}
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center -mt-10 mb-3 border-4 border-black">
            <Trophy size={28} />
          </div>

          <h2 className="text-2xl font-bold mb-1">Thunder Strikers</h2>
          <p className="text-zinc-400 text-sm mb-4">Football • Public Team</p>

          {/* Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-zinc-500" />
              <span className="text-zinc-300">San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users size={16} className="text-zinc-500" />
              <span className="text-zinc-300">9/11 Players</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-zinc-500" />
              <span className="text-zinc-300">$50 Joining Fee</span>
            </div>
          </div>

          <p className="text-sm text-zinc-400">
            A competitive football team looking for passionate players to join our journey. We play in local leagues and organize weekly practice sessions.
          </p>
        </div>
      </div>

      {/* Team Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Team Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Skill Level</p>
            <p className="font-medium">Intermediate</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Age Group</p>
            <p className="font-medium">18-35</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Captain</p>
            <p className="font-medium">John Smith</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Next Event</p>
            <p className="font-medium">Saturday 5pm</p>
          </div>
        </div>
      </div>

      {/* Members Preview */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Team Members (9)</h3>
        <div className="flex -space-x-2">
          {['JS', 'MJ', 'DW', 'CB', 'RD', 'LM', 'AK', 'SW', 'JH'].map((avatar, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 border-2 border-black flex items-center justify-center text-xs font-semibold">
              {avatar}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-xs text-zinc-400">
            +2
          </div>
        </div>
      </div>

      {/* Join Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/join-team/onboarding" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold block text-center">
          Join Team - $50
        </Link>
      </div>
    </div>
  )
}
