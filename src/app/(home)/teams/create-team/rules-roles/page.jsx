"use client"

import { ArrowLeft, ArrowRight, Users, Shield, Target } from "lucide-react"
import Link from "next/link"

export default function RulesRolesPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Rules & Roles</h1>
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
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-zinc-800 w-1/2"></div></div>
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
        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Team Size</label>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">-</button>
            <input 
              type="number" 
              defaultValue={11}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-center text-xl focus:outline-none focus:border-pink-500"
            />
            <button className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">+</button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Maximum number of players in the team</p>
        </div>

        {/* Skill Level */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Skill Level</label>
          <div className="grid grid-cols-3 gap-3">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button 
                key={level}
                className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-pink-500 transition text-sm"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
                          
        {/* Age Group */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Age Group</label>
          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500">
            <option value="">Select age group</option>
            <option value="any">All Ages</option>
            <option value="u18">Under 18</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46+">46+</option>
          </select>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Team Roles</label>
          <div className="space-y-3">
            {[
              { icon: Shield, label: 'Captain', count: 1 },
              { icon: Target, label: 'Vice Captain', count: 1 },
              { icon: Users, label: 'Player', count: 9 }
            ].map((role) => (
              <div key={role.label} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <role.icon size={20} className="text-zinc-400" />
                  <span>{role.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">-</button>
                  <span className="w-8 text-center">{role.count}</span>
                  <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/create-team/joining-fee" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Continue
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}
