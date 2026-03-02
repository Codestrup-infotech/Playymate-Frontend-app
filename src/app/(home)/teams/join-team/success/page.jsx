"use client"

import { Check, Trophy, Users, Calendar, MessageSquare, Home } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Success Animation */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={40} className="text-black" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">You are in</h1>
        <p className="text-zinc-400 text-center mb-8">
          Welcome to Thunder Strikers
        </p>
      </div>

      {/* Team Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-6">
        <div className="h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400"></div>
        
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Thunder Strikers</h3>
              <p className="text-sm text-zinc-400">Football • 10 Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <h3 className="font-semibold text-lg mb-4">What is Next</h3>
      
      <div className="space-y-3 mb-6">
        {[
          { icon: MessageSquare, title: 'Join Team Chat', desc: 'Introduce yourself to teammates' },
          { icon: Calendar, title: 'View Upcoming Events', desc: 'Check the next practice or match' },
          { icon: Users, title: 'Meet the Team', desc: 'Connect with your teammates' }
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <item.icon size={20} className="text-pink-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Home Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/home" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Home size={20} />
          Go to Home
        </Link>
      </div>
    </div>
  )
}
