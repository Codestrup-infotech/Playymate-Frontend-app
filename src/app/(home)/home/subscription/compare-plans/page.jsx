"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ComparePlansPage() {
  const router = useRouter();
  // ✅ MOCK DATA (Replace later with API)
  const plans = ["Free", "Starter", "Pro", "Premium"];

  const features = [
    {
      name: "Teams",
      values: ["2", "2", "∞", "∞"],
    },
    {
      name: "Events Hosted",
      values: ["3/mo", "10/mo", "∞", "∞"],
    },
    {
      name: "Participants",
      values: ["20", "50", "200", "∞"],
    },
    {
      name: "Boost Posts",
      values: ["✖", "✖", "✔", "✔"],
    },
    {
      name: "Passport PDF",
      values: ["✖", "✔", "✔", "✔"],
    },
    {
      name: "Physical Passport",
      values: ["✖", "✖", "✔", "✔"],
    },
    {
      name: "Gold Coins/mo",
      values: ["50", "200", "800", "2000"],
    },
    {
      name: "AI Suggestion",
      values: ["✖", "Basic", "Advanced", "Priority"],
    },
    {
      name: "Ad-Free",
      values: ["✖", "✖", "✔", "✔"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-6xl space-y-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-semibold mb-3">
              Compare Plans
            </h1>
            <p className="text-gray-400 text-lg">
              Find the perfect plan for your game. 🎯
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-3xl border border-zinc-800 overflow-hidden">

          {/* Plan Header Row */}
          <div className="grid grid-cols-5 bg-zinc-900 text-center py-5 font-semibold text-gray-300">
            <div></div>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`${
                  plan === "Pro" || plan === "Premium"
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
                    : ""
                }`}
              >
                {plan.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {features.map((feature, i) => (
            <div
              key={i}
              className="grid grid-cols-5 border-t border-zinc-800 text-center items-center py-6"
            >
              {/* Feature Name */}
              <div className="text-left pl-6 font-medium text-gray-300">
                {feature.name}
              </div>

              {feature.values.map((value, index) => {
                const isProOrPremium = index >= 2;

                return (
                  <div
                    key={index}
                    className={`${
                      isProOrPremium
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        <div className="flex justify-center pt-8">
          
          <button 
            onClick={() => router.push("/home/subscription/my-subscription")}
            className="w-full md:w-1/2 py-4 rounded-full text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}