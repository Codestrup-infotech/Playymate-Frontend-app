"use client";

import { Star, MapPin, Users } from "lucide-react";

export default function CoachCard({ coach, onSelect }) {
  return (
    <div
      onClick={() => onSelect(coach)}
      className="bg-zinc-900 rounded-3xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.02] transition"
    >
      <div className="relative">
        <img
          src={coach.images[0]}
          className="w-full h-60 object-cover"
          alt={coach.name}
        />

        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
          ₹{coach.price_per_hour}/hr
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {coach.name}
        </h2>

        <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            {coach.location}
          </div>

          <div className="flex items-center gap-1">
            <Users size={14} />
            {coach.capacity}
          </div>
        </div>

        <div className="flex items-center gap-1 text-yellow-400 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
          <span className="text-gray-300 ml-2">
            {coach.rating}
          </span>
        </div>
      </div>
    </div>
  );
}