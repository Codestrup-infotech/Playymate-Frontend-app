"use client"

import { ArrowLeft, Check, Users, MapPin, DollarSign, Lock, Globe, Trophy } from "lucide-react"
import Link from "next/link"

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/joining-fee" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Preview Team</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-medium">1</div>
          <p className="text-xs mt-1 text-zinc-400">Basic Info</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-full"></div></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-medium">2</div>
          <p className="text-xs mt-1 text-zinc-400">Rules</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-full"></div></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-medium">3</div>
          <p className="text-xs mt-1 text-zinc-400">Fee</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-full"></div></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-medium">4</div>
          <p className="text-xs mt-1 text-zinc-400">Preview</p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-6">
        {/* Cover Image Placeholder */}
        <div className="h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400"></div>
        
        <div className="p-5">
          {/* Team Icon */}
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center -mt-12 mb-4 border-4 border-black">
            <Trophy size={32} />
          </div>

          <h2 className="text-2xl font-bold mb-1">Thunder Strikers</h2>
          <p className="text-zinc-400 text-sm mb-4">Football • Public Team</p>

          {/* Info Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-zinc-500" />
              <span className="text-zinc-300">San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users size={16} className="text-zinc-500" />
              <span className="text-zinc-300">11 Players • Intermediate</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-zinc-500" />
              <span className="text-zinc-300">$50 Joining Fee</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-400">
            A competitive football team looking for passionate players to join our journey.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Team Summary</h3>
        
        <div className="space-y-3">
          {[
            { label: 'Sport', value: 'Football' },
            { label: 'Team Size', value: '11 players' },
            { label: 'Skill Level', value: 'Intermediate' },
            { label: 'Age Group', value: '18-35' },
            { label: 'Privacy', value: 'Public' },
            { label: 'Joining Fee', value: '$50' }
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-zinc-400">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/create-team/invite" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Check size={20} />
          Create Team
        </Link>
      </div>
    </div>
  )
}
