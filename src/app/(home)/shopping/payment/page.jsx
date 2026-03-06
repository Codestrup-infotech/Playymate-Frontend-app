"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { products } from "../data/products";
import { ArrowLeft } from "lucide-react";

export default function Payment() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const product = products.find(
    (item) => item.id.toString() === id
  );

  const [selected, setSelected] = useState("wallet");

  if (!product) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );
  }

  // Example calculation
  const delivery = 50;
  const tax = 25;
  const discount = 100;

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
          Payment
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">

          {/* Amount Payable */}
          <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
            <p className="text-gray-400 uppercase text-sm mb-4">
              Amount Payable
            </p>
            <h2 className="text-3xl font-bold text-pink-500">
              ₹{total}.00
            </h2>
          </div>

          {/* Payment Methods */}
          <div className="space-y-5">
            {["diamond", "gold", "wallet", "razorpay"].map(
              (method) => (
                <div
                  key={method}
                  onClick={() => setSelected(method)}
                  className={`p-6 rounded-2xl border cursor-pointer transition ${
                    selected === method
                      ? "border-pink-500"
                      : "border-gray-800 bg-[#111]"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="capitalize">
                      {method}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selected === method
                          ? "bg-pink-500 border-pink-500"
                          : "border-gray-600"
                      }`}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 h-fit sticky top-10">
          <div className="flex justify-between mb-6 text-lg">
            <span>Paying via {selected}</span>
            <span className="text-pink-500 font-bold">
              ₹{total}.00
            </span>
          </div>

          <button
            onClick={() =>
              router.push(`/shopping/success?id=${product.id}&total=${total}`)
            }
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-full text-lg font-semibold"
          >
            Confirm Purchase
          </button>
        </div>

      </div>

    </div>
  );
}