"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { products } from "../../data/products";
import { Heart, Share2, Star, ShoppingCart } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [openSpec, setOpenSpec] = useState(true);

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

  return (
    <div className="bg-black text-white min-h-screen max-w-6xl mx-auto py-10 px-6">

       {/* BACK BUTTON */}
<div className="flex items-center mb-6">
  <button
    onClick={() => router.back()}
    className="flex items-center gap-2 text-white hover:text-pink-400 transition"
  >
    <ArrowLeft size={22} />
    <span className="text-sm">Back</span>
  </button>
</div>

      <div className="grid md:grid-cols-2 gap-12">

        {/* IMAGE SECTION */}
        <div className="relative">
          <img
            src={product.image}
            className="w-full h-[500px] object-cover rounded-xl"
          />

          <div className="absolute top-4 right-4 flex gap-3">
            <div className="bg-white p-2 rounded-full">
              <Share2 size={18} color="black" />
            </div>
            <div className="bg-white p-2 rounded-full">
              <Heart size={18} color="black" />
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div>

          <h2 className="text-3xl font-semibold">
            {product.name}
          </h2>

          <p className="text-gray-400 mt-2">
            {product.subtitle}
          </p>

          {/* PRICE */}
          <div className="flex gap-4 items-center mt-4">
            <span className="text-2xl font-bold">
              ₹{product.price}
              {product.type === "rent" && <span className="text-sm"> /day</span>}
            </span>

            {product.oldPrice && (
              <>
                <span className="line-through text-gray-500">
                  ₹{product.oldPrice}
                </span>
                <span className="text-red-500 text-sm">
                  {product.discount}
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-gray-400">(10) See Reviews</span>
          </div>

          {/* RENT EXTRA OPTIONS */}
          {product.type === "rent" && (
            <div className="mt-6 bg-purple-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Rental Duration:
              </p>
              <select className="mt-2 bg-black border border-gray-700 p-2 rounded w-full">
                <option>1 Day</option>
                <option>3 Days</option>
                <option>7 Days</option>
              </select>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p>Select Quantity</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => qty > 1 && setQty(qty - 1)}
                className="bg-gray-800 px-4 py-1 rounded"
              >
                -
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="bg-gray-800 px-4 py-1 rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-6 mt-8">
            <button className="flex-1 border border-pink-500 py-3 rounded-full flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              Add to cart
            </button>

            <button
              onClick={() =>
                router.push(`/shopping/checkout?id=${product.id}`)
              }
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 py-3 rounded-full"
            >
              {product.type === "rent" ? "Rent Now" : "Buy Now"}
            </button>
          </div>

        </div>
      </div>

      {/* ACCORDION SECTION */}
      <div className="mt-12 space-y-4">

        <div className="bg-purple-900/40 p-4 rounded-lg">
          Product Details
        </div>

        <div
          onClick={() => setOpenSpec(!openSpec)}
          className="bg-purple-900/40 p-4 rounded-lg cursor-pointer"
        >
          <div className="flex justify-between">
            <span>Specifications</span>
            <span>{openSpec ? "-" : "+"}</span>
          </div>

          {openSpec && (
            <div className="mt-3 text-gray-300 text-sm space-y-1">
              <p>Material: Urethane Cover</p>
              <p>Compression: Medium</p>
              <p>Spin Control: High</p>
              <p>Suitable For: Beginners & Professionals</p>
            </div>
          )}
        </div>

        <div className="bg-purple-900/40 p-4 rounded-lg">
          Material & Care
        </div>

        <div className="bg-purple-900/40 p-4 rounded-lg">
          Rating & Reviews
        </div>

      </div>

    </div>
  );
}