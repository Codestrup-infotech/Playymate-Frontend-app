"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart } from "lucide-react";
import { products } from "./data/products";

export default function ShoppingWeb() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buy");

  const filteredProducts = products.filter(
    (item) => item.type === activeTab
  );

  const categories = [
    "Kits",
    "Equipment",
    "Fitness",
    "Accessories",
  ];

  return (
    <div className="bg-black min-h-screen text-white px-6 md:px-16 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-semibold">Home</h1>
        <div className="relative">
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-pink-500 text-xs px-2 rounded-full">
            5
          </span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-[#111] rounded-xl px-4 py-3 mb-8 border border-gray-800 max-w-lg">
        <Search size={18} className="text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none flex-1 text-sm"
        />
      </div>

      {/* BANNER */}
      <div className="relative rounded-2xl overflow-hidden mb-10 border border-pink-500">
        <img
          src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
          className="w-full h-60 md:h-80 object-cover opacity-70"
        />
        <h2 className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-bold">
          Wear the real Fashion
        </h2>
      </div>

      {/* BUY / RENT TAB */}
      <div className="flex bg-[#111] rounded-full p-1 w-60 mb-10">
        <button
          onClick={() => setActiveTab("buy")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            activeTab === "buy"
              ? "bg-gradient-to-r from-pink-500 to-orange-500"
              : "text-gray-400"
          }`}
        >
          Buy
        </button>

        <button
          onClick={() => setActiveTab("rent")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            activeTab === "rent"
              ? "bg-gradient-to-r from-purple-500 to-pink-600"
              : "text-gray-400"
          }`}
        >
          Rent
        </button>
      </div>

      {/* CATEGORIES */}
      <h2 className="mb-4 text-lg font-semibold">Categories</h2>
      <div className="flex gap-6 mb-10 overflow-x-auto">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="bg-[#111] px-6 py-4 rounded-xl min-w-[120px] text-center cursor-pointer hover:bg-gray-800 transition"
          >
            {cat}
          </div>
        ))}
      </div>

      {/* LATEST HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {activeTab === "buy"
            ? "Latest Products"
            : "Available for Rent"}
        </h2>

        <span className="text-sm text-gray-400 cursor-pointer">
          View all
        </span>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              router.push(`/shopping/product/${item.id}`)
            }
            className="bg-[#111] rounded-xl p-3 cursor-pointer hover:scale-105 transition relative"
          >
            {/* Wishlist */}
            <div className="absolute top-3 right-3 bg-black/60 p-1 rounded-full">
              <Heart size={16} />
            </div>

            <img
              src={item.image}
              className="h-44 w-full object-cover rounded-lg mb-3"
            />

            <h3 className="text-sm md:text-base font-medium">
              {item.name}
            </h3>

            <p className="text-gray-400 text-xs md:text-sm">
              {item.subtitle}
            </p>

            <p className="text-pink-400 mt-2 font-semibold">
              ₹{item.price}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}