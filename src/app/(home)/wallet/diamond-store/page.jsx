"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { diamondPacks } from "../data/diamondPacks";

export default function DiamondStore() {
  const router = useRouter();

  const packs = diamondPacks;

  return (
    <div className="bg-black text-white min-h-screen px-6 pt-6 pb-12">

      {/* Back */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Diamond store</h1>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💎</div>
        <h2 className="text-xl font-bold text-blue-400">
          Power Up With Diamonds
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Unlock Boosts, Themes & Premium Features
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() =>
              router.push(`/wallet/diamond-store/${pack.id}`)
            }
            className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 rounded-3xl border border-zinc-700 cursor-pointer"
          >
            {pack.popular && (
              <div className="absolute -top-3 right-3 bg-blue-600 text-xs px-3 py-1 rounded-full">
                Popular
              </div>
            )}

            <div className="text-2xl mb-3">💎</div>

            <p className="text-gray-400 text-sm">{pack.name}</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              {pack.diamonds}
            </h3>
            <p className="text-gray-500 text-sm">Diamonds</p>

            {pack.bonus && (
              <div className="mt-2 inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                {pack.bonus}
              </div>
            )}

            <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-2 rounded-xl font-semibold">
              ₹{pack.price}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}