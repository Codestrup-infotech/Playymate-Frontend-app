"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function DiamondDetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const params = useSearchParams();

  const price = params.get("price");
  const diamonds = params.get("diamonds");
  const bonusPercent = Number(params.get("bonus") || 0);
  const bonusAmount =
    bonusPercent > 0 ? Math.round((Number(diamonds) * bonusPercent) / (100 + bonusPercent)) : 0;

  if (!price || !diamonds) {
    return (
      <div className="bg-[#F5F6FA] min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-5xl mb-3">💎</p>
          <p className="text-sm">Pack not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-gray-900 lg:pb-12 pb-9 font-Poppins lg:px-32 md:px-2 ">
      {/* Header */}
      <div className=" px-5 lg:pb-4 pt-2 flex items-center ">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold hidden lg:block md:block ">Diamond Store</h1>
      </div>

      {/* Main Card */}
      <div className="px-4 lg:mt-5 md:mt-4 mt-2">
        <div
          className="rounded-3xl p-8 text-center relative overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-5xl font-black text-white">{Number(diamonds).toLocaleString()}</h2>
          <p className="text-white/60 mt-2 text-sm">Total Diamonds</p>

          {bonusPercent > 0 && (
            <div className="mt-4 inline-block bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-white">
              +{bonusAmount.toLocaleString()} bonus diamonds ({bonusPercent}% extra)
            </div>
          )}

          <div className="mt-6 bg-white/15 backdrop-blur border border-white/30 rounded-2xl py-4">
            <p className="text-3xl font-black text-white">₹{Number(price).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* What can you do */}
      <div className="px-4 mt-7">
        <h2 className="text-base font-bold text-gray-700 mb-4">What can you do?</h2>
        {[
          { icon: "🚀", title: "Boost Post", sub: "Get 10× visibility" },
          { icon: "⭐", title: "Featured Event", sub: "Top of listings" },
          { icon: "🎨", title: "Premium Themes", sub: "Exclusive passport styles" },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-400">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3">💎 Diamond Rules</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Diamonds are non-refundable premium currency</li>
            <li>• No cash withdrawal available</li>
            <li>• Used for boosts, themes & premium perks</li>
            <li>• Bonus diamonds expire after 90 days</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-6">
        <button
          onClick={() => router.push(`/wallet/payment?amount=${price}&diamonds=${diamonds}&pack=${id}`)}
          className="w-full py-4 rounded-3xl text-base font-bold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
        >
          Proceed to payment
        </button>
      </div>
    </div>
  );
}

export default function DiamondDetailPage() {
  return (
    <Suspense fallback={<div className="bg-[#F5F6FA] min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <DiamondDetailContent />
    </Suspense>
  );
}