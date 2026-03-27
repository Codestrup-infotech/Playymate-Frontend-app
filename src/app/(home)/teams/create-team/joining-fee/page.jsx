"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function JoiningFeePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-5 py-6 pb-28">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/rules-roles" className="text-gray-900">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </div>

      {/* STEP BAR */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-pink-500 font-medium">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </div>

      {/* ENABLE JOINING FEE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm mb-6">
        <div>
          <h3 className="font-semibold text-lg">Enable Joining Fee</h3>
          <p className="text-sm text-gray-500">Charge players to join your team</p>
        </div>

        {/* TOGGLE UI */}
        <div className="w-14 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center p-1">
          <div className="w-6 h-6 bg-white rounded-full ml-auto shadow"></div>
        </div>
      </div>

      {/* FEE AMOUNT */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">FEE AMOUNT (₹)</p>
        <input
          type="number"
          defaultValue="500"
          className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm"
        />
      </div>

      {/* PAYMENT METHOD */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">PAYMENT METHOD</p>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium bg-gradient-to-r from-pink-500 to-orange-400 shadow-md">
            Razorpay
          </button>

          <button className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-gray-300 bg-white text-gray-700">
            Coins
          </button>
        </div>
      </div>

      {/* GOLD COIN DISCOUNT */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="font-semibold mb-1">Gold Coin Discount</h3>
        <p className="text-sm text-gray-500 mb-4">Allow Discount Via Gold Coins</p>

        <input
          type="range"
          min="0"
          max="50"
          defaultValue="5"
          className="w-full accent-pink-500"
        />

        <p className="text-center text-pink-500 font-medium mt-3">5% Discount</p>
      </div>

      {/* DIAMOND PAYMENT */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm mb-6">
        <div>
          <h3 className="font-semibold">Diamond Coin Payment</h3>
          <p className="text-sm text-gray-500">Full Payment Via Diamond Coins</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
            PREMIUM
          </span>

          <div className="w-14 h-8 rounded-full bg-gray-300 flex items-center p-1">
            <div className="w-6 h-6 bg-white rounded-full shadow"></div>
          </div>
        </div>
      </div>

      {/* HOST EARNINGS */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">HOST EARNINGS</p>

        <div className="flex gap-3">
          {["Wallet", "Coins", "Split"].map((item, i) => (
            <button
              key={i}
              className={`px-6 py-2.5 rounded-full text-sm font-medium ${
                i === 0
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* CONTINUE BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams/create-team/preview"
          className="px-10 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-semibold text-white flex items-center justify-center shadow-lg"
        >
          Continue
        </Link>
      </div>
    </div>
  )
}