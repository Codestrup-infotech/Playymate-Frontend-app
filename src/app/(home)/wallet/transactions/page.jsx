"use client";

import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

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

  const filtered = transactions
    .filter((t) =>
      activeTab === "All" ? true : t.type === activeTab
    )
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="bg-black text-white min-h-screen px-6 pt-6 pb-10">

      {/* Back + Title */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Transactions</h1>
      </div>

      {/* Search */}
      <div className="flex items-center bg-zinc-900 border border-pink-500 rounded-xl px-4 py-3 mb-6">
        <Search size={18} className="text-pink-400 mr-3" />
        <input
          placeholder="Search"
          className="bg-transparent outline-none text-sm w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      {/* Transaction Cards */}
      <div className="space-y-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{t.icon}</div>

              <div>
                <p className="font-medium">{t.title}</p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {t.date}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      t.type === "Gold Coin"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {t.type === "Gold Coin" ? "Gold" : "Diamond"}
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`font-semibold ${
                t.amount > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {t.amount > 0 ? "+" : ""}
              {t.amount}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}