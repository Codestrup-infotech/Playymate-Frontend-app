"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function DiamondSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();

  const diamondsAdded = Number(params.get("diamonds")) || 0;
  const newBalance = Number(params.get("newBalance")) || diamondsAdded;

  return (
    <div className="   text-gray-900 flex flex-col justify-between  lg:px-32 px-4 font-Poppins ">
      {/* Top */}
      <div className="text-center ">
        <div
          className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, #3B82F6, #06b6d4)" }}
        >
          💎
        </div>

        <h1 className="text-4xl font-semibold text-gray-800">
          {diamondsAdded.toLocaleString()} Diamonds Added!
        </h1>
        <p className="text-gray-400 mt-2 text-sm">You're Ready To Boost Your Game 🚀</p>

        {/* Balance Card */}
        <div className="mt-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-md">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">New Balance</p>
          <h2
            className="text-5xl font-black mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
          >
            {newBalance.toLocaleString()}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-gray-400 text-sm">💎 Diamonds</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className=" mb-4 mt-10  flex gap-3">
        <button
          onClick={() => router.push("/home")}
          className="w-full py-4 rounded-3xl text-base font-semibold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
        >
          Boost Now
        </button>
        <button
          onClick={() => router.push("/wallet")}
          className="w-full bg-white border border-gray-200 py-4 rounded-3xl text-base font-semibold text-gray-700 shadow-sm"
        >
          Go to wallet
        </button>
      </div>
    </div>
  );
}


export default function DiamondSuccessPage() {
  return (
    <Suspense fallback={<div className="bg-[#F5F6FA] min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <DiamondSuccessContent />
    </Suspense>
  );
}