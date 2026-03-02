"use client"

import { ArrowLeft, Shield, MoreVertical, MessageSquare, UserMinus } from "lucide-react"
import Link from "next/link"

export default function MembersPage() {
  const members = [
    { name: 'John Smith', role: 'Captain', avatar: 'JS', status: 'Active' },
    { name: 'Mike Johnson', role: 'Vice Captain', avatar: 'MJ', status: 'Active' },
    { name: 'David Wilson', role: 'Player', avatar: 'DW', status: 'Active' },
    { name: 'Chris Brown', role: 'Player', avatar: 'CB', status: 'Active' },
    { name: 'Tom Davis', role: 'Player', avatar: 'TD', status: 'Pending' },
  ]

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/manage" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Team Members</h1>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">11</p>
          <p className="text-xs text-zinc-400">Total</p>
        </div>
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">9</p>
          <p className="text-xs text-zinc-400">Active</p>
        </div>
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">2</p>
          <p className="text-xs text-zinc-400">Pending</p>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center font-semibold">
              {member.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{member.name}</p>
                {member.role === 'Captain' && <Shield size={14} className="text-yellow-500" />}
                {member.role === 'Vice Captain' && <Shield size={14} className="text-zinc-400" />}
              </div>
              <p className="text-sm text-zinc-400">{member.role}</p>
            </div>

            {/* Status */}
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {member.status}
              </span>
            </div>

            {/* Actions */}
            <button className="p-2">
              <MoreVertical size={20} className="text-zinc-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
