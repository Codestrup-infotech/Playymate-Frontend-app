"use client"

import { ArrowLeft, CreditCard, Smartphone, Wallet, Lock, Check, Info, Coins, Gem } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('razorpay')

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/join-team/onboarding" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Payment</h1>
      </div>

      {/* Joining Fee Card */}
      <div className="relative rounded-[24px] p-[2px] mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400">
        <div className="bg-zinc-900 rounded-[22px] p-6 text-center">
          <p className="text-sm text-zinc-400 mb-1">Joining Fee</p>
          <p className="text-4xl font-bold text-white mb-1">₹499</p>
          <p className="text-sm text-zinc-500">Lorum Ipsum · Monthly</p>
        </div>
      </div>

      {/* Choose Payment Method Title */}
      <h3 className="font-medium text-lg mb-4 text-zinc-300">Choose Payment Method</h3>

      {/* Payment Options */}
      <div className="space-y-3 mb-6">
        {/* Razorpay Option */}
        <button 
          onClick={() => setSelectedMethod('razorpay')}
          className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all ${
            selectedMethod === 'razorpay' 
              ? 'bg-zinc-800 border-2 border-pink-500 shadow-lg shadow-pink-500/20' 
              : 'bg-zinc-900/80 border-2 border-transparent hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Pay via Razorpay</p>
              <p className="text-xs text-zinc-400">UPI, Cards, Net Banking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg text-zinc-400">₹499</p>
          </div>
        </button>

        {/* Gold Coins Option - Featured/Highlighted */}
        <button 
          onClick={() => setSelectedMethod('gold')}
          className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all ${
            selectedMethod === 'gold' 
              ? 'bg-zinc-800 border-2 border-pink-500 shadow-lg shadow-pink-500/30' 
              : 'bg-zinc-900/80 border-2 border-transparent hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Coins size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Pay with Gold Coins</p>
              <p className="text-xs text-orange-400">Get 20% discount</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
              399 <Coins size={16} className="text-yellow-400" />
            </p>
            <p className="text-xs text-zinc-500 line-through">₹499</p>
          </div>
        </button>

        {/* Diamonds Option */}
        <button 
          onClick={() => setSelectedMethod('diamonds')}
          className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all ${
            selectedMethod === 'diamonds' 
              ? 'bg-zinc-800 border-2 border-pink-500 shadow-lg shadow-pink-500/20' 
              : 'bg-zinc-900/80 border-2 border-transparent hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Gem size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Pay with Diamonds</p>
              <p className="text-xs text-zinc-400">Full payment with diamonds</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
              250 <Gem size={16} className="text-cyan-400" />
            </p>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-zinc-900/80 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Info size={20} className="text-zinc-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          Gold coins give you a discount on the join fee. Diamond coins can cover the entire payment. Earn coins by participating in events and inviting friends!
        </p>
      </div>

      {/* Bottom CTA Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/teams/join-team/success" className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-4 rounded-[28px] font-semibold text-white shadow-lg shadow-pink-500/30 block text-center">
          Select a Payment Method
        </Link>
      </div>
    </div>
  )
}
