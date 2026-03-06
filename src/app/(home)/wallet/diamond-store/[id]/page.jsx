"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { diamondPacks } from "../../data/diamondPacks";

export default function DiamondDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // 🔥 Find selected pack
  const pack = diamondPacks.find((p) => p.id === id);

  if (!pack) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Pack Not Found
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen px-6 pt-6 pb-12">

      {/* Back */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Diamond store</h1>
      </div>

      {/* Gradient Card */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 text-center mb-8">

        <div className="text-5xl mb-4">💎</div>

        <h2 className="text-4xl font-bold">
          {pack.diamonds}
        </h2>

        <p className="text-white/80 mt-1">Total Diamonds</p>

        {pack.bonus && (
          <div className="mt-3 inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
            Includes {pack.bonus}
          </div>
        )}

        <div className="mt-6 border border-white/40 rounded-2xl py-3 text-2xl font-bold">
          ₹{pack.price}
        </div>

      </div>

      {/* What can you do */}
      <h2 className="text-lg font-semibold mb-4">
        What can you do?
      </h2>

      <FeatureCard icon="🚀" title="Boost Post" subtitle="Get 10x visibility" />
      <FeatureCard icon="⭐" title="Featured Event" subtitle="Top of listings" />
      <FeatureCard icon="🎨" title="Premium Themes" subtitle="Exclusive passport styles" />

      {/* Rules */}
      <div className="bg-zinc-900 rounded-3xl p-6 my-8">
        <h3 className="font-semibold mb-3">Diamond Rules</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Diamonds are non-refundable premium currency</li>
          <li>• No cash withdrawal available</li>
          <li>• Used for boosts, themes & premium perks</li>
          <li>• Bonus diamonds expire after 90 days</li>
        </ul>
      </div>

      {/* Proceed Button */}
      <button
        onClick={() =>
          router.push(`/wallet/payment?amount=${pack.price}&diamonds=${pack.diamonds}`)
        }
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-3xl text-lg font-semibold"
      >
        Proceed to payment
      </button>

    </div>
  );
}

function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 mb-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}