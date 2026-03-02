"use client";

import { MapPin, Star } from "lucide-react";

export default function StaycationCard({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
    >
      <div className="relative">
        <img
          src={data.images[0]}
          alt={data.name}
          className="w-full h-60 object-cover"
        />

        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
          From ₹{data.price_per_night}/night
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold">{data.name}</h2>

        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            {data.location}
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={14} fill="currentColor" />
            {data.rating}
          </div>
        </div>
      </div>
    </div>
  );
}