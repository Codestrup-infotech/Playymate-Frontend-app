"use client"

import { ArrowLeft, ArrowRight, DollarSign, CreditCard, Smartphone, Wallet } from "lucide-react"
import Link from "next/link"

export default function JoiningFeePage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/rules-roles" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Joining Fee</h1>
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
        <div className="flex-1 h-0.5 bg-zinc-800 mx-2"><div className="h-full bg-zinc-800 w-1/2"></div></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">4</div>
          <p className="text-xs mt-1 text-zinc-500">Preview</p>
        </div>
      </div>

      {/* Enable Fee Toggle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Enable Joining Fee</h3>
            <p className="text-sm text-zinc-400">Charge players to join your team</p>
          </div>
          <button className="w-14 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 p-1">
            <div className="w-6 h-6 rounded-full bg-white"></div>
          </button>
        </div>
      </div>

      {/* Fee Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">Fee Amount</label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="number" 
            placeholder="0.00"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Accepted Payment Methods</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CreditCard, label: 'Card' },
            { icon: Smartphone, label: 'UPI' },
            { icon: Wallet, label: 'Wallet' }
          ].map((method) => (
            <button 
              key={method.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-pink-500 transition"
            >
              <method.icon size={24} className="text-zinc-300" />
              <span className="text-sm">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <p className="text-sm text-zinc-400">
          <span className="text-orange-400 font-medium">Note:</span> Payment processing fees may apply. Players will pay the fee to join your team.
        </p>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/create-team/preview" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Continue
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}
