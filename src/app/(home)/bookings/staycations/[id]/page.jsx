"use client";

import { useParams, useRouter } from "next/navigation";
import { staycations } from "../data/staycations";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import BookingModal from "../components/BookingModal";

export default function StaycationDetails() {
  const { id } = useParams();
  const router = useRouter();

  const stay = staycations.find((s) => s.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!stay) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Not Found
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pb-40">

      {/* Hero */}
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20"
        >
          <ArrowLeft size={24} />
        </button>

        <img
          src={stay.images[selectedImage]}
          className="w-full h-[350px] object-cover rounded-b-3xl"
        />

        <div className="absolute left-6 top-24 space-y-3">
          {stay.images.map((img, index) => (
            <img
              key={index}
              src={img}
              onClick={() => setSelectedImage(index)}
              className={`w-16 h-16 rounded-xl cursor-pointer border-2 ${
                selectedImage === index
                  ? "border-pink-500"
                  : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 mt-6">
        <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
          {stay.category}
        </span>

        <h1 className="text-3xl font-bold mt-3">{stay.name}</h1>

        {/* Amenities */}
        <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-xl mb-5">Amenities</h3>

          <div className="grid grid-cols-2 gap-4">
            {stay.amenities.map((item) => (
              <div
                key={item}
                className="bg-zinc-800 rounded-xl p-4 text-center text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg mb-4">Booking Summary</h3>

          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>Night Price</span>
            <span>₹{stay.price_per_night}</span>
          </div>

          <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            <span>Total</span>
            <span>₹{stay.price_per_night}</span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-6">
  <button
    onClick={() => setShowModal(true)}
    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-xl font-semibold text-lg"
  >
    Confirm Booking
  </button>
</div>

{showModal && (
  <BookingModal
    stay={stay}
    onClose={() => setShowModal(false)}
    onBrowse={() => {
      setShowModal(false);  // close modal first
      router.push("/booking");
    }}
  />
)}
    </div>
  );
}