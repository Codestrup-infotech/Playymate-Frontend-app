"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || localStorage.getItem("access_token") || null;
};

function ApplyCoinsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const billAmount = Number(params.get("amount") || 1500);
  const SPEND_CAP_PERCENT = 10; // matches spend_cap_percentage from API

  const [coinData, setCoinData] = useState(null);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetchCoins(token);
  }, []);

  const fetchCoins = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.status === "success") {
        setCoinData(data.data?.gold_coins || {});
      }
    } catch (err) {
      console.error("Coins fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const balance = coinData?.balance || 0;
  const maxDiscount = Math.floor((billAmount * SPEND_CAP_PERCENT) / 100);
  const maxCoins = Math.min(balance, maxDiscount);
  const discount = coinsUsed;
  const remaining = billAmount - discount;

  const sliderPercent = maxCoins > 0 ? (coinsUsed / maxCoins) * 100 : 0;

  return (
    <div className="lg:min-h-screen md:h-screen  text-gray-900 lg:pb-10 lg:px-32 md:px-4 font-Poppins ">
      {/* Header */}
      <div className=" px-5 lg:pb-4 md:pb-3 flex items-center  ">
        <button onClick={() => router.back()} className="w-9 h-9 hidden lg:block md:block rounded-full bg-gray-100  items-center justify-center">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold hidden lg:block md:block ">Apply Coins</h1>
      </div>

      {/* Bill Amount */}
      <div className="px-4 lg:mt-4  lg:mb-7 mb-3">
        <div className="bg-white rounded-3xl p-7 text-center border border-gray-100 shadow-sm">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Bill Amount</p>
          <h2 className="text-5xl font-semibold text-gray-800">₹{billAmount.toLocaleString()}</h2>
        </div>
      </div>

      {/* Coin Slider Section */}
      <div className="px-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          {/* Header row */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <p className="text-base font-bold text-gray-800">Apply Gold Coins</p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Max {SPEND_CAP_PERCENT}% Off
            </span>
          </div>

          {loading ? (
            <div className="h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : (
            <>
              {/* Balance info */}
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>
                  Your balance:{" "}
                  <span className="text-amber-600 font-bold">{balance.toLocaleString()} coins</span>
                </span>
                <span>
                  Max usable:{" "}
                  <span className="text-amber-600 font-bold">{maxCoins} coins</span>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max={maxCoins}
                value={coinsUsed}
                disabled={maxCoins === 0}
                onChange={(e) => setCoinsUsed(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, #ec4899 0%, #f97316 ${sliderPercent}%, #e5e7eb ${sliderPercent}%, #e5e7eb 100%)`,
                }}
              />

              {/* Slider labels */}
              <div className="flex justify-between text-xs mt-2">
                <span className="text-gray-400">0 Coins</span>
                <span className="text-amber-600 font-bold">{coinsUsed} Coins Applied</span>
                <span className="text-gray-400">{maxCoins} Coins</span>
              </div>

              {maxCoins === 0 && balance === 0 && (
                <p className="text-xs text-gray-400 text-center mt-3">No gold coins available</p>
              )}
            </>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl p-6 mt-4 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Bill Amount</span>
            <span className="font-semibold text-gray-700">₹{billAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Coins Discount</span>
            <span className="font-semibold text-green-500">-₹{discount.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Remaining</span>
            <span
              className="text-3xl font-black bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
            >
              ₹{remaining.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm lg:mt-5 mt-3">
          Coins = Real Discounts. Let's go! 🚀
        </p>

        {/* Apply Button */}
        <button
          onClick={() => router.back()}
          disabled={coinsUsed === 0 || loading}
          className="lg:mt-6 mt-4 w-full py-4 rounded-3xl text-base font-bold text-white shadow-lg disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
        >
          Apply {coinsUsed} Coins
        </button>
      </div>
    </div>
  );
}

export default function ApplyCoinsPage() {
  return (
    <Suspense fallback={<div className="bg-[#F5F6FA] min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ApplyCoinsContent />
    </Suspense>
  );
}