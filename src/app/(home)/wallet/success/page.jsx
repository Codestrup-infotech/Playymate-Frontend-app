"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function DiamondSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();

  const diamondsAdded = Number(params.get("diamonds")) || 0;

  // Example previous balance (later replace with global state/backend)
  const previousBalance = 770;

  const newBalance = previousBalance + diamondsAdded;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-between px-6 py-12">

      {/* Top Section */}
      <div className="text-center mt-10">

        <div className="text-7xl mb-6">💎</div>

        <h1 className="text-3xl font-bold text-blue-400">
          {diamondsAdded} Diamonds Added!
        </h1>

        <p className="text-gray-400 mt-2">
          You Ready To Boost Your Game 🚀
        </p>

        {/* New Balance Card */}
        <div className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-6">

          <p className="text-gray-400 text-xs tracking-widest">
            NEW BALANCE
          </p>

          <h2 className="text-4xl font-bold text-cyan-400 mt-2">
            {newBalance.toLocaleString()}
          </h2>

          <p className="text-gray-400 mt-1 text-sm">
            💎 Diamonds
          </p>

        </div>

      </div>

      {/* Bottom Buttons */}
      <div className="space-y-4 mb-8">

        <button
          onClick={() => router.push("/home")}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-3xl text-lg font-semibold"
        >
          Boost Now
        </button>

        <button
          onClick={() => router.push("/wallet")}
          className="w-full bg-zinc-900 border border-zinc-700 py-4 rounded-3xl text-lg"
        >
          Go to wallet
        </button>

      </div>

    </div>
  );
}

export default function DiamondSuccessPage() {
  return (
    <Suspense fallback={<div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiamondSuccessContent />
    </Suspense>
  );
}