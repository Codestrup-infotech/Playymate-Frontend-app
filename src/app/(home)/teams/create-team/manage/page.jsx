"use client"

import { ArrowLeft, Users, DollarSign, Settings, UserPlus, MessageSquare, Calendar, MoreVertical } from "lucide-react"
import Link from "next/link"

export default function ManageTeamPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Thunder Strikers</h1>
        <button className="ml-auto">
          <MoreVertical size={24} className="text-zinc-400" />
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <Users className="mx-auto mb-2 text-pink-500" size={24} />
          <p className="text-2xl font-bold">11</p>
          <p className="text-xs text-zinc-400">Members</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <DollarSign className="mx-auto mb-2 text-green-500" size={24} />
          <p className="text-2xl font-bold">$450</p>
          <p className="text-xs text-zinc-400">Revenue</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <Calendar className="mx-auto mb-2 text-orange-500" size={24} />
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-zinc-400">Events</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/teams/create-team/invite" className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
            <UserPlus size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium">Invite</p>
            <p className="text-xs text-zinc-400">Add players</p>
          </div>
        </Link>
        <button className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium">Message</p>
            <p className="text-xs text-zinc-400">Team chat</p>
          </div>
        </button>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        <Link href="/teams/create-team/members" className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-zinc-400" />
            <span>Members</span>
          </div>
          <span className="text-zinc-500">→</span>
        </Link>
        
        <Link href="/teams/create-team/payments" className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-zinc-400" />
            <span>Payments</span>
          </div>
          <span className="text-zinc-500">→</span>
        </Link>
        
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-zinc-400" />
            <span>Events</span>
          </div>
          <span className="text-zinc-500">→</span>
        </button>
        
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-zinc-400" />
            <span>Settings</span>
          </div>
          <span className="text-zinc-500">→</span>
        </button>
      </div>
    </div>
  )
}
