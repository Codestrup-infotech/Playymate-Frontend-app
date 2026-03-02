"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function MySubscriptionPage() {
  const router = useRouter();
  // ✅ MOCK DATA (Replace with API later)
  const subscription = {
    planName: "Pro Plan",
    price: 299,
    status: "Active",
    nextBilling: "March 1, 2026",
    monthlyCoins: 800,
  };

  const paymentHistory = [
    {
      id: 1,
      status: "Paid",
      title: "Feb 1, 2026",
      amount: 299,
    },
    {
      id: 2,
      status: "Paid",
      title: "Team Chat Access",
      amount: 299,
    },
    {
      id: 3,
      status: "Paid",
      title: "Team Chat Access",
      amount: 299,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-5xl space-y-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold">My Subscription</h1>
        </div>

        {/* Subscription Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl">
              👑
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {subscription.planName}
              </h2>

              <span className="inline-block mt-2 px-4 py-1 text-sm rounded-full bg-green-900 text-green-400 border border-green-600">
                {subscription.status}
              </span>

              <p className="text-gray-400 mt-4 text-sm">
                📅 Next billing: {subscription.nextBilling}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold">
              ₹ {subscription.price}
              <span className="text-gray-400 text-lg font-normal">
                {" "}
                /month
              </span>
            </p>
          </div>
        </div>

        {/* Two Cards Section */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Switch to Yearly */}
          <div className="bg-zinc-900 rounded-3xl p-6 space-y-3 hover:border hover:border-pink-500 transition">
            <h3 className="text-xl font-semibold">
              Switch to Yearly
            </h3>
            <p className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-medium">
              Save 30% →
            </p>
          </div>

          {/* Monthly Coins */}
          <div className="bg-zinc-900 rounded-3xl p-6 space-y-3">
            <h3 className="text-gray-400 flex items-center gap-2">
              🪙 Monthly Coins
            </h3>
            <p className="text-2xl font-semibold text-yellow-400">
              {subscription.monthlyCoins} Coins
            </p>
          </div>

        </div>

        {/* Payment History */}
        <div>
          <h2 className="text-xl text-gray-400 mb-6">
            Payment History
          </h2>

          <div className="bg-zinc-900 rounded-3xl divide-y divide-zinc-800">
            {paymentHistory.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1 text-sm rounded-full bg-green-900 text-green-400 border border-green-600">
                    {item.status}
                  </span>
                  <div>
                    <p className="text-lg">{item.title}</p>
                    <p className="text-gray-400 text-sm">
                      ₹ {item.amount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 space-y-6">

          {/* Change Plan */}
          <button className="w-full py-4 rounded-full text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition">
            Change Plan
          </button>

          {/* Cancel Subscription */}
          <div className="text-center">
            <button className="text-red-500 text-lg hover:underline">
              Cancel Subscription
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}