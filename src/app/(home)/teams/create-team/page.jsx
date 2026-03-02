"use client"

import { ArrowLeft, ArrowRight, MapPin, Users, Lock, Globe } from "lucide-react"
import Link from "next/link"

export default function CreateTeamPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm font-medium">1</div>
          <p className="text-xs mt-1 text-zinc-400">Basic Info</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-zinc-800 w-1/2"></div></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">2</div>
          <p className="text-xs mt-1 text-zinc-500">Rules</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">3</div>
          <p className="text-xs mt-1 text-zinc-500">Fee</p>
        </div>
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">4</div>
          <p className="text-xs mt-1 text-zinc-500">Preview</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Team Name</label>
          <input 
            type="text" 
            placeholder="Enter team name"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Sport Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Sport</label>
          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500">
            <option value="">Select sport</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="cricket">Cricket</option>
            <option value="tennis">Tennis</option>
            <option value="badminton">Badminton</option>
            <option value="volleyball">Volleyball</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="City or venue"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
          <textarea 
            placeholder="Tell others about your team..."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Privacy</label>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-pink-500 transition">
              <Globe size={20} />
              <span>Public</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-pink-500 transition">
              <Lock size={20} />
              <span>Private</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/create-team/rules-roles" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Continue
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}
