"use client";

import { MapPin, Star } from "lucide-react";
import { useState } from "react";

export default function CafeCard({ cafe, groupSize, setGroupSize, onBook }){
    

  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-lg">

      {/* Image */}
      <div className="relative">
        <img
          src={cafe.image}
          alt={cafe.title}
          className="w-full h-60 object-cover"
        />

        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
          {cafe.badge}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        <h2 className="text-lg font-semibold">{cafe.title}</h2>

        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
          <MapPin size={14} />
          {cafe.location}
        </div>

        {/* Includes */}
        <div className="flex flex-wrap gap-2 mt-4">
          {cafe.includes.map((item) => (
            <span
              key={item}
              className="border border-pink-500 text-xs px-3 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-400 mt-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
          <span className="text-gray-300 ml-2">{cafe.rating}</span>
        </div>
      </div>

      {/* Group Size Selector */}
      <div className="mx-4 mb-6 mt-4 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-2xl p-4 flex justify-between items-center border border-pink-500">

        <span className="text-sm">Group Size</span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
            className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center"
          >
            -
          </button>

          <span className="font-semibold">{groupSize}</span>

          <button
            onClick={() => setGroupSize(groupSize + 1)}
            className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center"
          >
            +
          </button>
        </div>
        <button
  onClick={onBook}
  className="bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-2 rounded-xl font-semibold"
>
  Book Package
</button>
      </div>

    </div>
  );
}