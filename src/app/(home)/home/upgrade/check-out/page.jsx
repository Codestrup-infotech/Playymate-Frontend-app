"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  // ✅ MOCK DATA (Replace with API later)
  const plan = {
    name: "Pro Plan",
    price: 299,
    coins: 800,
    billing: "Billed monthly",
  };

  const walletBalance = 1200;

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [promoCode, setPromoCode] = useState("");
  const [discount] = useState(0);

  const subtotal = plan.price;
  const total = subtotal - discount;

  const paymentMethods = [
    {
      id: "upi",
      title: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "card",
      title: "Card",
      subtitle: "Credit or Debit Card",
    },
    {
      id: "razorpay",
      title: "Razorpay",
      subtitle: "Cards, NetBanking",
    },
    {
      id: "wallet",
      title: "Wallet",
      subtitle: `Balance: ₹ ${walletBalance}`,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex justify-center px-6 py-12">
      <div className="w-full max-w-4xl space-y-10">

        {/* Page Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold">Checkout</h1>
        </div>

        {/* Plan Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl">
              👑
            </div>
            <div>
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-gray-400 text-sm">{plan.billing}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-pink-500">
              ₹ {plan.price}
              <span className="text-gray-400 text-lg font-normal"> /month</span>
            </p>
          </div>
        </div>

        {/* Coins Included */}
        <div className="bg-zinc-900 rounded-full py-4 px-6 text-yellow-400 text-lg text-center">
          🪙 {plan.coins} gold coins included
        </div>

        {/* Payment Methods */}
        <SectionTitle title="Payment Methods" />

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`rounded-2xl p-[2px] cursor-pointer transition ${
                selectedMethod === method.id
                  ? "bg-gradient-to-r from-pink-500 to-orange-500"
                  : "bg-zinc-800"
              }`}
            >
              <div className="bg-zinc-900 rounded-2xl px-6 py-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {method.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {method.subtitle}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedMethod === method.id
                      ? "bg-pink-500 border-pink-500"
                      : "border-gray-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code */}
        <SectionTitle title="Promo Code" />

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 outline-none border border-zinc-700 focus:border-pink-500"
          />
          <button className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition">
            Apply
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-900 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pro Player Plan</h2>
            <span className="text-green-400 border border-green-500 px-4 py-1 rounded-full text-sm">
              Monthly
            </span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-green-400">
            <span>Discount</span>
            <span>-₹ {discount}</span>
          </div>

          <div className="border-t border-zinc-700 pt-4 flex justify-between text-xl font-semibold">
            <span>Total</span>
            <span className="text-pink-500">
              ₹ {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" />
          <p className="text-gray-400 text-sm">
            I agree to the Terms & Conditions and authorize recurring payments
          </p>
        </div>

        {/* Payment Button */}
        <div className="flex justify-center pt-6">
          <button 
            onClick={() => router.push("/home/upgrade/activation-screen")}
            className="w-full md:w-1/2 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

/* Section Title */
function SectionTitle({ title }) {
  return (
    <h3 className="text-gray-400 text-lg font-medium">
      {title}
    </h3>
  );
}