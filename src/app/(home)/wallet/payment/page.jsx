"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const amount = params.get("amount");
  const diamonds = params.get("diamonds");

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-3">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold">Wallet</h1>
      </div>

      <h1 className="text-xl mb-6">Payment</h1>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
        <p>{diamonds} Diamonds</p>
        <p className="text-lg font-bold">₹{amount}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-zinc-900 p-4 rounded-xl">UPI</div>
        <div className="bg-zinc-900 p-4 rounded-xl">Google Pay</div>
        <div className="bg-zinc-900 p-4 rounded-xl">PhonePe</div>
      </div>

      <button
        onClick={() => router.push(`/wallet/success?diamonds=${diamonds}`)}
        className="bg-gradient-to-r from-pink-500 to-orange-500 w-full py-3 rounded-xl"
      >
        Confirm purchase ₹{amount}
      </button>
    </div>
  );
}