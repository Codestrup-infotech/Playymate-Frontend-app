"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function WalletPage() {
  const router = useRouter();

  const [coins] = useState(1800);
  const [diamonds] = useState(770);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Gold Coin", "Diamonds"];

  const transactions = [
    {
      id: 1,
      title: "Monthly Pro Credit",
      date: "Jan 12",
      type: "Gold Coin",
      amount: 800,
      icon: "🎁",
    },
    {
      id: 2,
      title: "Booking Discount",
      date: "Jan 15",
      type: "Gold Coin",
      amount: -120,
      icon: "🎟️",
    },
    {
      id: 3,
      title: "Pro Diamond Pack",
      date: "Jan 16",
      type: "Diamonds",
      amount: 800,
      icon: "💎",
    },
    {
      id: 4,
      title: "Event Hosting Bonus",
      date: "Jan 18",
      type: "Gold Coin",
      amount: 50,
      icon: "⚡",
    },
    {
      id: 5,
      title: "Super Boost Event",
      date: "Jan 19",
      type: "Diamonds",
      amount: -30,
      icon: "🚀",
    },
    {
      id: 6,
      title: "Team Event",
      date: "Jan 19",
      type: "Gold Coin",
      amount: -50,
      icon: "🏀",
    },
  ];

  const filtered =
    activeTab === "All"
      ? transactions
      : transactions.filter((t) => t.type === activeTab);

  return (
    <div className="bg-black text-white min-h-screen px-6 pt-6 pb-32">

      {/* Back + Title */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Wallet</h1>
      </div>

      {/* GOLD COINS CARD */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-3xl p-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🪙</div>
          <div>
            <p className="text-xs opacity-80">GOLD COINS</p>
            <h2 className="text-3xl font-bold">{coins}</h2>
            <p className="text-xs opacity-80">+800/month from pro</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/wallet/apply-coins")}
          className="bg-white/30 px-4 py-1 rounded-full text-sm"
        >
          Use
        </button>
      </div>

      {/* DIAMONDS CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-4xl">💎</div>
          <div>
            <p className="text-xs opacity-80">DIAMONDS</p>
            <h2 className="text-3xl font-bold">{diamonds}</h2>
            <p className="text-xs opacity-80">Premium currency</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/wallet/diamond-store")}
          className="bg-white/30 px-4 py-1 rounded-full text-sm"
        >
          Buy
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 rounded-full p-1 flex mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm rounded-full transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-pink-500 to-orange-500"
                : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <button
          onClick={() => router.push("/wallet/transactions")}
          className="text-pink-400 text-sm"
        >
          See All
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{t.icon}</div>
              <div>
                <p>{t.title}</p>
                <p className="text-xs text-gray-400">
                  {t.date} · {t.type}
                </p>
              </div>
            </div>

            <span
              className={`font-semibold ${
                t.amount > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {t.amount > 0 ? "+" : ""}
              {t.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-6 left-6 right-6 flex gap-4">
        <button 
        onClick={() => router.push("/wallet/apply-coins")}
        className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-2xl flex items-center justify-center gap-2">
          🪙 Use coin
        </button>

        <button
          onClick={() => router.push("/wallet/diamond-store")}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          💎 Buy Diamonds
        </button>
      </div>

    </div>
  );
}