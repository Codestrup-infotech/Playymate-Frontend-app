"use client";
import Link from "next/link";
import { Star, MapPin, Users } from "lucide-react";

export default function VenueCard({ venue }) {
  return (
    <Link href={`/booking/turf/${venue.id}`}>
      <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-lg">

        {/* Image */}
        <div className="relative">
          <img
            src={venue.images[0]}
            alt={venue.name}
            className="w-full h-60 object-cover"
          />

          {/* Price Tag */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
            ₹{venue.price_per_hour}/hr
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">
            {venue.name}
          </h2>

          <div className="flex justify-between items-center text-sm text-gray-400">

            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {venue.location}
            </div>

            <div className="flex items-center gap-2">
              <Users size={14} />
              {venue.capacity}
            </div>

          </div>

          <div className="flex items-center gap-1 text-yellow-400 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
            <span className="text-gray-300 ml-2">
              {venue.rating}
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
}