"use client"

import { ArrowLeft, ArrowRight, Check, Trophy, Calendar, Users, MessageSquare, DollarSign } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/join-team" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Join Thunder Strikers</h1>
      </div>

      {/* Team Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
            <Trophy size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Thunder Strikers</h3>
            <p className="text-sm text-zinc-400">Football • San Francisco, CA</p>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <h3 className="font-semibold text-lg mb-4">What You Get</h3>
      
      <div className="space-y-3 mb-6">
        {[
          { icon: Users, title: 'Team Membership', desc: 'Full access to team events and activities' },
          { icon: Calendar, title: 'Event Access', desc: 'Join matches, tournaments, and practice sessions' },
          { icon: MessageSquare, title: 'Team Chat', desc: 'Connect with teammates and coordinate' },
          { icon: Trophy, title: 'League Play', desc: 'Participate in competitive leagues' }
        ].map((item, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <item.icon size={20} className="text-pink-500" />
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fee Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-zinc-400">Joining Fee</span>
          <span className="font-semibold">$50.00</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <span className="font-medium">Total</span>
          <span className="font-bold text-xl">$50.00</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-6">
        <p className="text-sm text-orange-400">
          By joining, you agree to follow team rules and attend scheduled events. Your fee helps cover team expenses.
        </p>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/join-team/payment" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Continue to Payment
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}
