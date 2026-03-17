"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || localStorage.getItem("access_token") || null;
};

const formatLabel = (str) =>
  (str || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const iconForSource = (source) => {
  const map = { SUBSCRIPTION: "🎁", ADJUSTMENT: "⚙️", BOOKING: "🎟️", PURCHASE: "💎", REFERRAL: "🤝", BONUS: "⚡" };
  return map[source] || "🪙";
};

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [coinHistory, setCoinHistory] = useState([]);
  const [diamondHistory, setDiamondHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [coinTotal, setCoinTotal] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetchHistory(token, page);
  }, [page]);

  const fetchHistory = async (token, pg) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [coinRes, diaRes] = await Promise.all([
        fetch(`${API_BASE}/coins/history?page=${pg}&limit=20&type=ALL`, { headers }),
        fetch(`${API_BASE}/diamonds/history?page=${pg}&limit=20`, { headers }),
      ]);
      const [coinData, diaData] = await Promise.all([coinRes.json(), diaRes.json()]);
      if (coinData?.status === "success") {
        const txns = coinData.data?.transactions || [];
        setCoinHistory(pg === 1 ? txns.map((t) => ({ ...t, coinType: "GOLD" })) :
          (prev) => [...prev, ...txns.map((t) => ({ ...t, coinType: "GOLD" }))]);
        setCoinTotal(coinData.data?.pagination?.total || 0);
      }
      if (diaData?.status === "success") {
        const txns = diaData.data?.transactions || [];
        setDiamondHistory(pg === 1 ? txns.map((t) => ({ ...t, coinType: "DIAMOND" })) :
          (prev) => [...prev, ...txns.map((t) => ({ ...t, coinType: "DIAMOND" }))]);
      }
    } catch (err) {
      console.error("Transaction fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const allTransactions = [...coinHistory, ...diamondHistory].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const filtered = allTransactions
    .filter((t) => {
      if (activeTab === "Gold Coin") return t.coinType === "GOLD";
      if (activeTab === "Diamonds") return t.coinType === "DIAMOND";
      return true;
    })
    .filter((t) =>
      formatLabel(t.source_reference || t.source || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 pb-10 font-sans">
      {/* Header */}
      <div className=" px-5 pb-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold">Transactions</h1>
      </div>

      {/* Search */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 gap-3 shadow-sm">
          <Search size={16} className="text-pink-400 shrink-0" />
          <input
            placeholder="Search transactions..."
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-5">
        <div className="bg-gray-200/60 rounded-full p-1 flex">
          {["All", "Gold Coin", "Diamonds"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {loading && page === 1 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
                  {iconForSource(t.source)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatLabel(t.source_reference || t.source)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      t.coinType === "GOLD" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-500"
                    }`}>
                      {t.coinType === "GOLD" ? "Gold" : "Diamond"}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-base font-bold shrink-0 ml-3 ${
                t.type === "CREDIT" ? "text-green-500" : "text-red-400"
              }`}>
                {t.type === "CREDIT" ? "+" : "-"}{t.amount}
              </span>
            </div>
          ))
        )}

        {!loading && coinTotal > coinHistory.length && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-500 text-sm font-medium shadow-sm"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}