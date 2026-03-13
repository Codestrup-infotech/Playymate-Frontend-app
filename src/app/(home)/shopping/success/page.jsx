"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { products } from "../data/products";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();

  const id = params.get("id");
  const total = params.get("total");

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );
  }

  // Generate Order ID
  const orderId =
    "#PLM" +
    Math.floor(100000000 + Math.random() * 900000000);

  const today = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(today.getDate() + 5);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-6">

      {/* CHECK ICON */}
      <div className="mb-6">
        <CheckCircle size={80} className="text-gray-300" />
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-2">
        Booking Confirmed!
      </h1>

      <p className="text-gray-400 mb-10 text-center">
        Your sports gear will be delivered soon.
      </p>

      {/* ORDER CARD */}
      <div className="w-full max-w-lg bg-[#111] p-8 rounded-2xl border border-pink-500 shadow-lg shadow-pink-500/20 mb-8">

        <div className="flex justify-between mb-6">
          <span className="text-gray-400">ORDER ID</span>
          <span className="text-pink-500 font-semibold">
            {orderId}
          </span>
        </div>

        <div className="flex justify-between mb-4">
          <span className="text-gray-400">
            Delivery Date
          </span>
          <span>
            {deliveryDate.toDateString()}
          </span>
        </div>

        <div className="flex justify-between mb-4">
          <span className="text-gray-400">
            Date & Time
          </span>
          <span>
            {today.toDateString()} ,{" "}
            {today.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">
            Amount Paid
          </span>
          <span className="text-pink-500 font-semibold">
            ₹{total}.00
          </span>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-6 mb-10">
        <button className="bg-[#111] px-6 py-4 rounded-xl border border-gray-700">
          Add to Cart
        </button>

        <button className="bg-[#111] px-6 py-4 rounded-xl border border-gray-700">
          View
        </button>
      </div>

      {/* CONTINUE SHOPPING */}
      <button
        onClick={() =>
          router.push("/shopping")
        }
        className="bg-gradient-to-r from-pink-500 to-orange-500 px-12 py-4 rounded-full text-lg font-semibold"
      >
        Continue Shopping
      </button>

    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
