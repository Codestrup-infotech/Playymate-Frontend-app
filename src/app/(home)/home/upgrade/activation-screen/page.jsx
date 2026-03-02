"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ProSuccessPage() {
  const router = useRouter();
  // ✅ MOCK DATA (Replace with API later)
  const data = {
    title: "Pro Unlocked!",
    subtitle: "Welcome to the big leagues.",
    coinsCredited: 800,
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-3xl text-center space-y-10">

        {/* Back Button */}
        <div className="flex justify-start">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-full bg-zinc-800 flex items-center justify-center text-6xl shadow-lg">
            ✓
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">
            Pro{" "}
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Unlocked!
            </span>
          </h1>

          <p className="text-gray-400 text-xl">
            {data.subtitle}
          </p>
        </div>

        {/* Coins Credited Badge */}
        <div className="flex justify-center">
          <div className="bg-zinc-900 rounded-full px-8 py-4 text-yellow-400 text-xl border border-zinc-700">
            🪙 {data.coinsCredited} gold coins Credited
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-10 space-y-6">

          {/* Explore Button */}
          <button 
            onClick={() => router.push("/home/upgrade/compare-plans")}
            className="w-full py-4 rounded-full text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition"
          >
            Explore Features
          </button>

          {/* View Wallet Button */}
          <button className="w-full py-4 rounded-full text-xl font-semibold border-2 border-transparent bg-gradient-to-r from-pink-500 to-orange-500 p-[2px]">
            <div className="bg-black rounded-full py-4">
              View Wallet
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}