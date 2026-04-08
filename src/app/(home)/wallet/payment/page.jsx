"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Suspense, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || localStorage.getItem("access_token") || null;
};

const paymentMethods = [
  { label: "UPI", icon: "📲", sub: "Any UPI app" },
  { label: "Google Pay", icon: "🟢", sub: "Google Pay · PhonePe" },
  { label: "PhonePe", icon: "🟣", sub: "PhonePe · BHIM" },
];

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const amount = params.get("amount");
  const diamonds = params.get("diamonds");
  const packId = params.get("pack");

  const [selectedMethod, setSelectedMethod] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    const token = getToken();
    if (!token) { setError("Please login to continue."); setLoading(false); return; }

    try {
      const res = await fetch(`${API_BASE}/diamonds/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: packId,
          payment_method: "TEST",
        }),
      });
      const data = await res.json();
      if (data?.status === "success") {
        const credited = data.data?.diamonds_credited || Number(diamonds);
        const newBal = data.data?.new_balance ?? 0;
        router.push(`/wallet/success?diamonds=${credited}&newBalance=${newBal}`);
      } else {
        setError(data?.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <> 
    <div className=" flex justify-center items-center lg:mb-10 mb-2  "> 
    <div className="lg:min-h-screen lg:w-2/3  w-full   md:h-screen  text-gray-900 lg:mb-24 pb-5 font-Poppins ">
      {/* Header */}
      <div className=" px-5 lg:pb-4 pt-6 flex items-center ">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold hidden lg:block md:block ">Payment</h1>
      </div>

      {/* Order Summary */}
      <div className="px-4 lg:mt-5 mt-3 mb-6">
        <div
          className="rounded-3xl p-6 text-center relative overflow-hidden shadow-md"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <p className="text-xs font-bold tracking-widest text-white/60 uppercase mb-3">Order Summary</p>
          <div className="text-4xl mb-2">💎</div>
          <h2 className="text-3xl font-black text-white">{Number(diamonds || 0).toLocaleString()} Diamonds</h2>
          <div className="mt-4 bg-white/15 backdrop-blur border border-white/30 rounded-2xl py-3">
            <p className="text-2xl font-black text-white">₹{Number(amount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 mb-6">
        <p className="text-sm font-bold text-gray-500 tracking-wide uppercase mb-3">Payment Method</p>
        <div className="space-y-3">
          {paymentMethods.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMethod(i)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-sm ${
                selectedMethod === i
                  ? "border-pink-400 bg-pink-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                <p className="text-xs text-gray-400">{m.sub}</p>
              </div>
              {selectedMethod === i && (
                <CheckCircle2 size={20} className="text-pink-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 mb-4">
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            {error}
          </p>
        </div>
      )}

      {/* Confirm */}
      <div className="px-4 ">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-4 rounded-3xl text-base font-bold text-white shadow-lg disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
        >
          {loading ? "Processing..." : `Confirm purchase ₹${Number(amount || 0).toLocaleString()}`}
        </button>
      </div>
    </div>
</div>
     </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="bg-[#F5F6FA] min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}