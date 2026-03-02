"use client";

import { useParams, useRouter } from "next/navigation";
import { coaches } from "../data/coaches";
import { useState } from "react";
import { ArrowLeft, Clock, Users } from "lucide-react";
import BookingModal from "../components/BookingModal";

export default function CoachDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const coach = coaches.find((c) => c.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showModal, setShowModal] = useState(false);

  if (!coach) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Coach Not Found
      </div>
    );
  }

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon)
        ? prev.filter((a) => a !== addon)
        : [...prev, addon]
    );
  };

  const addonTotal = selectedAddons.reduce(
    (sum, addon) => sum + addon.price,
    0
  );

  const total = coach.price_per_hour + addonTotal;

  return (
    <div className="bg-black text-white min-h-screen pb-40">

      {/* HERO SECTION */}
      <div className="relative">

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 text-white"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Main Image */}
        <img
          src={coach.images?.[selectedImage]}
          alt={coach.name}
          className="w-full h-[350px] object-cover rounded-b-3xl"
        />

        {/* Thumbnails */}
        <div className="absolute left-6 top-24 space-y-3">
          {coach.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              onClick={() => setSelectedImage(index)}
              className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 ${
                selectedImage === index
                  ? "border-pink-500"
                  : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 mt-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold">{coach.name}</h1>

        <span className="bg-zinc-800 text-sm px-3 py-1 rounded-full mt-2 inline-block">
          {coach.sport}
        </span>

        {/* Feature Chips */}
        <div className="flex gap-3 mt-5 flex-wrap">
          <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full text-sm flex items-center gap-2">
            <Users size={14} />
            {coach.capacity} players
          </div>
        </div>

        {/* Amenities */}
        {coach.amenities?.length > 0 && (
          <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl mb-5">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {coach.amenities.map((item) => (
                <div
                  key={item}
                  className="bg-zinc-800 rounded-xl p-4 text-center text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slots */}
        {coach.slots?.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl mb-5">Available Slots</h3>
            <div className="grid grid-cols-2 gap-4">
              {coach.slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-xl flex items-center gap-2 text-sm transition ${
                    selectedSlot === slot
                      ? "bg-gradient-to-r from-pink-500 to-orange-500"
                      : "bg-zinc-900"
                  }`}
                >
                  <Clock size={16} />
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {coach.add_ons?.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl mb-5">Available Add-ons</h3>
            {coach.add_ons.map((addon) => (
              <div
                key={addon.name}
                onClick={() => toggleAddon(addon)}
                className={`flex justify-between items-center p-5 rounded-xl mb-4 cursor-pointer transition ${
                  selectedAddons.includes(addon)
                    ? "bg-gradient-to-r from-pink-500 to-orange-500"
                    : "bg-zinc-900"
                }`}
              >
                <span>{addon.name}</span>
                <span className="text-green-400">
                  + ₹{addon.price}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Booking Summary */}
        <div className="mt-10 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg mb-4">Booking Summary</h3>

          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>Coach Price</span>
            <span>₹{coach.price_per_hour}</span>
          </div>

          <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      {/* Selected Slot Bar */}
      {selectedSlot && (
        <div className="fixed bottom-24 left-6 right-6 bg-gradient-to-r from-pink-500 to-orange-500 p-4 rounded-xl text-center text-sm">
          Selected: {selectedSlot}
        </div>
      )}

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-6">
        <button
          disabled={!selectedSlot}
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-xl font-semibold text-lg disabled:opacity-40"
        >
          Confirm Booking
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <BookingModal
          venue={coach}
          slot={selectedSlot}
          onClose={() => setShowModal(false)}
          onBrowse={() => router.push("/booking")}
        />
      )}
    </div>
  );
}