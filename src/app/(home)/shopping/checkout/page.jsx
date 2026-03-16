"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { products } from "../data/products";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const product = products.find(
    (item) => item.id.toString() === id
  );

  if (!product) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );
  }

  const delivery = 50;
  const discount = 100;
  const tax = 25;

  const total =
    product.price + delivery - discount + tax;

  return (
    <div className="bg-black text-white min-h-screen px-10 py-12">

      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-semibold">
          Order Summary
        </h1>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-10">

        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-8">

          {/* PRICE BREAKDOWN */}
          <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
            <p className="text-gray-400 mb-6 uppercase text-sm">
              Price Breakdown
            </p>

            <div className="flex justify-between mb-3">
              <span>Product Price</span>
              <span>₹{product.price}.00</span>
            </div>

            <div className="flex justify-between mb-3 text-gray-400">
              <span>Delivery Fee</span>
              <span>+₹{delivery}.00</span>
            </div>

            <div className="flex justify-between mb-3 text-green-400">
              <span>Discount</span>
              <span>-₹{discount}.00</span>
            </div>

            <div className="flex justify-between mb-4 text-gray-400">
              <span>Taxes & Fees</span>
              <span>₹{tax}.00</span>
            </div>

            <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-pink-500">
                ₹{total}.00
              </span>
            </div>
          </div>

          {/* APPLY REWARDS */}
          <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
            <p className="text-gray-400 mb-6 uppercase text-sm">
              Apply Rewards
            </p>

            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="font-medium">Gold Coins</p>
                <p className="text-gray-400 text-sm">
                  150 Available • Max 10% Discount
                </p>
              </div>
              <span className="text-green-400">
                -₹20.00
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Diamond Coins</p>
                <p className="text-gray-400 text-sm">
                  75 Available • Full usage allowed
                </p>
              </div>
              <span className="text-green-400">
                -₹20.00
              </span>
            </div>
          </div>

          {/* PROMO CODE */}
          <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
            <p className="text-gray-400 mb-6 uppercase text-sm">
              Promo Code
            </p>

            <div className="flex gap-4">
              <input
                placeholder="Enter Promo Code"
                className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none"
              />
              <button className="bg-gray-800 px-8 rounded-xl">
                Apply
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (Sticky Summary Card) */}
        <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 h-fit sticky top-10">

          <div className="flex justify-between mb-6 text-lg">
            <span>Total Payable</span>
            <span className="text-pink-500 font-bold">
              ₹{total}.00
            </span>
          </div>

          <button
            onClick={() =>
              router.push(`/shopping/payment?id=${product.id}`)
            }
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-full text-lg font-semibold"
          >
            Proceed to Payment
          </button>

          <p className="text-gray-400 text-sm mt-6">
            Secure payment powered by trusted providers
          </p>

        </div>

      </div>

    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}