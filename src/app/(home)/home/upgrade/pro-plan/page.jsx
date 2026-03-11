"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ProPlanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") || "pro";

  // Plan data based on selected plan ID
  const getPlanData = (id) => {
    const plans = {
      free: {
        name: "Free Plan",
        price: 0,
        coins: 50,
        features: [
          { title: "Teams", value: "2" },
          { title: "Events Hosted", value: "3/month" },
          { title: "Profile", value: "Basic" },
          { title: "Coins", value: "50/month" },
        ],
        limits: [
          { title: "Teams", value: "2" },
          { title: "Events", value: "3/month" },
          { title: "Participants", value: "50" },
        ],
        passportBenefits: [
          { title: "PDF Export", value: "Limited" },
        ],
      },
      starter: {
        name: "Starter Plan",
        price: 99,
        coins: 200,
        features: [
          { title: "Teams", value: "5" },
          { title: "Events Hosted", value: "10/month" },
          { title: "Passport", value: "Lite" },
          { title: "Coins", value: "200/month" },
        ],
        limits: [
          { title: "Teams", value: "5" },
          { title: "Events", value: "10/month" },
          { title: "Participants", value: "100" },
        ],
        passportBenefits: [
          { title: "PDF Export", value: "Unlimited" },
          { title: "Physical Print", value: "Limited" },
        ],
      },
      pro: {
        name: "Pro Plan",
        price: 299,
        coins: 800,
        features: [
          { title: "Teams", value: "Unlimited" },
          { title: "Events Hosted", value: "Unlimited" },
          { title: "Passport Benefits", value: "Unlimited" },
          { title: "AI Suggestions", value: "Unlimited" },
          { title: "Ad-Free Experience", value: "Unlimited" },
        ],
        limits: [
          { title: "Teams", value: "Unlimited" },
          { title: "Events", value: "Unlimited" },
          { title: "Participants", value: "200" },
        ],
        passportBenefits: [
          { title: "PDF Export", value: "Unlimited" },
          { title: "Physical Print (1/yr)", value: "Unlimited" },
        ],
      },
      vip: {
        name: "VIP Plan",
        price: 299,
        coins: 2000,
        features: [
          { title: "Teams", value: "Unlimited" },
          { title: "Events Hosted", value: "Unlimited" },
          { title: "VIP Passport", value: "Included" },
          { title: "AI Suggestions", value: "Unlimited" },
          { title: "Priority Support", value: "Included" },
        ],
        limits: [
          { title: "Teams", value: "Unlimited" },
          { title: "Events", value: "Unlimited" },
          { title: "Participants", value: "Unlimited" },
        ],
        passportBenefits: [
          { title: "PDF Export", value: "Unlimited" },
          { title: "Physical Print", value: "Unlimited" },
        ],
      },
    };
    return plans[id] || plans.pro;
  };

  const plan = getPlanData(planId);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center px-6 py-12">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold">{plan.name}</h1>
        </div>

        {/* Pricing Card */}
        <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-pink-500 to-orange-500 mb-10">
          <div className="bg-zinc-900 rounded-3xl p-10 text-center">
            <h2 className="text-5xl font-bold mb-2">₹ {plan.price}</h2>
            <p className="text-gray-400 mb-6 text-lg">per month</p>

            <div className="text-yellow-400 text-2xl font-semibold">
              🪙 {plan.coins} coins/month
            </div>
          </div>
        </div>

        {/* Features Section */}
        <SectionTitle title="Features" />

        <div className="space-y-4 mb-10">
          {plan.features.map((item, index) => (
            <ListItem key={index} title={item.title} value={item.value} />
          ))}
        </div>

        {/* Limits Section */}
        <SectionTitle title="Limits" />

        <div className="space-y-4 mb-10">
          {plan.limits.map((item, index) => (
            <ListItem key={index} title={item.title} value={item.value} />
          ))}
        </div>

        {/* Passport Benefits */}
        <SectionTitle title="Passport Benefits" />

        <div className="space-y-4 mb-16">
          {plan.passportBenefits.map((item, index) => (
            <ListItem key={index} title={item.title} value={item.value} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button 
            onClick={() => router.push("/home/upgrade/check-out")}
            className="w-full md:w-1/2 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function ProPlanPageLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-6 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-gray-800 rounded"></div>
        <div className="h-64 w-64 bg-gray-800 rounded-3xl"></div>
      </div>
    </div>
  );
}

export default function ProPlanPage() {
  return (
    <Suspense fallback={<ProPlanPageLoading />}>
      <ProPlanPageContent />
    </Suspense>
  );
}

/* Reusable Components */

function SectionTitle({ title }) {
  return (
    <h3 className="text-gray-400 text-lg font-medium mb-4">
      {title}
    </h3>
  );
}

function ListItem({ title, value }) {
  return (
    <div className="bg-zinc-900 rounded-2xl px-6 py-5 flex justify-between items-center">
      <span className="text-lg">{title}</span>
      <span className="text-pink-400 font-medium">{value}</span>
    </div>
  );
}