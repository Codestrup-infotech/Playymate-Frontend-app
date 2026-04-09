"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

export default function WalletPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(null);
  const [diamonds, setDiamonds] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetchAll(token);
  }, []);

  const fetchAll = async (token) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [coinsRes, diaRes, histRes, walletRes] = await Promise.all([
        fetch(`${API_BASE}/coins/balance`, { headers }),
        fetch(`${API_BASE}/diamonds/balance`, { headers }),
        fetch(`${API_BASE}/coins/history?page=1&limit=20&type=ALL`, { headers }),
        fetch(`${API_BASE}/wallet/balance`, { headers }),
      ]);
      const [coinsData, diaData, histData, walletData] = await Promise.all([
        coinsRes.json(), diaRes.json(), histRes.json(), walletRes.json(),
      ]);
      if (coinsData?.status === "success") setCoins(coinsData.data?.gold_coins || {});
      if (diaData?.status === "success") setDiamonds(diaData.data || {});
      if (histData?.status === "success") setHistory(histData.data?.transactions || []);
      if (walletData?.status === "success") setWalletBalance(walletData.data || {});
    } catch (err) {
      console.error("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory =
    tab === "ALL" ? history :
    tab === "Gold" ? history.filter((i) => i.coin_type === "GOLD") :
    history.filter((i) => i.coin_type === "DIAMOND");

  return (
    <div className="min-h-screen  lg:px-32 md:px-4 text-gray-900 lg:pb-14 md:pb-20  font-Poppins">
      {/* Header */}
      <div className=" px-5 lg:pb-4  flex items-center justify-between ">
        <h1 className="lg:text-3xl text-2xl font-semibold  ">Wallet</h1>
       
      </div>

      <div className="px-4 mt-5 space-y-3">
        {/* Gold Coins Card */}
        <div className="rounded-3xl p-5 relative overflow-hidden shadow-md"
          style={{ background: "linear-gradient(135deg, #FBBF24 0%, #FDE68A 55%, #F59E0B 100%)" }}>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/20" />
          <p className="text-xs font-bold tracking-widest text-amber-900/60 uppercase mb-2">Gold Coins</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🪙</span>
              <span className="text-4xl font-black text-amber-900">
                {loading ? "—" : (coins?.balance ?? 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => router.push("/wallet/apply-coins")}
              className="bg-amber-900/15 border border-amber-900/20 px-5 py-2 rounded-full text-sm font-bold text-amber-900"
            >
              Use
            </button>
          </div>
          {coins?.expires_at && (
            <p className="text-xs mt-2 text-amber-900/50">
              Expires {new Date(coins.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {coins.days_remaining != null && ` · ${coins.days_remaining} days left`}
            </p>
          )}
          {!coins?.expires_at && !loading && (
            <p className="text-xs mt-2 text-amber-900/50">Gold Coins</p>
          )}
        </div>

        {/* Diamonds Card */}
        <div className="rounded-3xl p-5 relative overflow-hidden shadow-md"
          style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2dd4bf 60%, #06b6d4 100%)" }}>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/20" />
          <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">Diamonds</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">💎</span>
              <span className="text-4xl font-black text-white">
                {loading ? "—" : (diamonds?.balance ?? 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => router.push("/wallet/diamond-store")}
              className="bg-white/20 border border-white/30 px-5 py-2 rounded-full text-sm font-bold text-white"
            >
              Buy
            </button>
          </div>
          <p className="text-xs mt-2 text-white/60">Premium currency</p>
        </div>

        {/* Wallet Balance Card */}
     
      </div>

      {/* Recent Activity */}
      <div className="px-4 mt-7">
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold">Recent Activity</p>
          <button onClick={() => router.push("/wallet/transactions")} className="text-sm text-pink-500 font-semibold">
            See All
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/60 rounded-full p-1 mb-4">
          {["ALL", "Gold", "Diamonds"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow"
                  : "text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
            ))
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <p className="text-4xl mb-2">🪙</p>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            filteredHistory.slice(0, 6).map((item) => (
              <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                    {iconForSource(item.source)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatLabel(item.source_reference || item.source)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.coin_type === "GOLD" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-500"
                      }`}>
                        {item.coin_type === "GOLD" ? "Gold" : "Diamond"}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-base font-bold ${item.type === "CREDIT" ? "text-green-500" : "text-red-400"}`}>
                  {item.type === "CREDIT" ? "+" : "-"}{item.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className=" bottom-0 left-0 right-0 px-4  pt-6"
        style={{ background: "linear-gradient(to top, #F5F6FA 65%, transparent)" }}>
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={() => router.push("/wallet/apply-coins")}
            className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
          >
            🪙 Use Coin
          </button>
          <button
            onClick={() => router.push("/wallet/diamond-store")}
            className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
          >
            💎 Buy Diamonds
          </button>
        </div>
      </div>
    </div>
  );
}