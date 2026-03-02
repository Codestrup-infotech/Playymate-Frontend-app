"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApplyCoins() {
  const router = useRouter();

  const billAmount = 1500;
  const maxCoins = 300; // example max
  const maxDiscountPercent = 20;

  const [coinsUsed, setCoinsUsed] = useState(150);

  const discount = coinsUsed; // 1 coin = ₹1 (example)
  const remaining = billAmount - discount;

  return (
    <div className="bg-black text-white min-h-screen px-6 pt-6 pb-10">

      {/* Back + Title */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Apply Coins</h1>
      </div>

      {/* Bill Amount Card */}
      <div className="bg-zinc-900 rounded-3xl p-6 text-center mb-8">
        <p className="text-xs text-gray-400 mb-2">BILL AMOUNT</p>
        <h2 className="text-4xl font-bold">₹{billAmount.toLocaleString()}</h2>
      </div>

      {/* Apply Gold Coins Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <p className="text-lg">Apply Gold Coins</p>
        </div>
        <span className="text-sm text-gray-400">
          Max {maxDiscountPercent}% Off
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max={maxCoins}
        value={coinsUsed}
        onChange={(e) => setCoinsUsed(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer
        bg-gradient-to-r from-pink-500 to-orange-500"
      />

      {/* Slider Labels */}
      <div className="flex justify-between text-xs mt-2 text-gray-400">
        <span>0 Coins</span>
        <span className="text-yellow-400 font-semibold">
          {coinsUsed} Coins
        </span>
        <span>{maxCoins} Coins</span>
      </div>

      {/* Summary Card */}
      <div className="bg-zinc-900 rounded-3xl p-6 mt-8 space-y-3">
        <div className="flex justify-between text-gray-400">
          <span>Bill Amount</span>
          <span>₹{billAmount}</span>
        </div>

        <div className="flex justify-between text-green-400">
          <span>Coins Discount</span>
          <span>-₹{discount}</span>
        </div>

        <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
          <span className="text-lg font-semibold">Remaining</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            ₹{remaining}
          </span>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Coins = Real Discounts. Let’s go!
      </p>

      {/* Apply Button */}
      <button className="mt-8 w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-3xl text-lg font-semibold">
        Apply {coinsUsed} Coins
      </button>

    </div>
  );
}