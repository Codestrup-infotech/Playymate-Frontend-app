"use client";

import { useParams } from "next/navigation";
import { venues } from "../data/venues";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingModal from "../components/BookingModal";

import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  ShowerHead,
  Wifi,
  Coffee,
  Wrench,
  AirVent,
  Plus
} from "lucide-react";

export default function TurfDetails() {
  const { id } = useParams();
  const venue = venues.find((v) => v.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);


  if (!venue) return <div className="text-white p-6">Not Found</div>;

  const toggleAddon = (addon) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const total = venue.price_per_hour + addonTotal;

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
          src={venue.images[selectedImage]}
          className="w-full h-[350px] object-cover rounded-b-3xl"
        />

        {/* Thumbnail Strip */}
        <div className="absolute left-6 top-24 space-y-3">
          {venue.images.map((img, index) => (
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
        <h1 className="text-3xl font-bold leading-tight">
          {venue.name}
        </h1>

        <span className="bg-zinc-800 text-sm px-3 py-1 rounded-full mt-2 inline-block">
          {venue.sport}
        </span>

        {/* FEATURE CHIPS */}
        <div className="flex gap-3 mt-5 flex-wrap">
          <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full text-sm flex items-center gap-2">
            <Users size={14} />
            {venue.capacity} players
          </div>

          <div className="px-4 py-2 border border-pink-500 text-pink-500 rounded-full text-sm">
            Floodlights
          </div>

          <div className="px-4 py-2 border border-pink-500 text-pink-500 rounded-full text-sm">
            Indoor
          </div>
        </div>

        {/* AMENITIES */}
        <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-xl mb-5">Amenities</h3>

          <div className="grid grid-cols-2 gap-4">
            {venue.amenities?.map((item) => (
              <div
                key={item}
                className="bg-zinc-800 rounded-xl p-4 flex flex-col items-center text-sm text-gray-300"
              >
                <Plus size={18} className="mb-2 text-pink-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* SLOTS */}
        <div className="mt-10">
          <h3 className="text-xl mb-5">Available Slots</h3>

          <div className="grid grid-cols-2 gap-4">
            {venue.slots?.map((slot, index) => {
              const isDisabled = index === 2; // example disabled slot

              return (
                <button
                  key={slot}
                  disabled={isDisabled}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-xl flex items-center gap-2 text-sm transition
                    ${
                      selectedSlot === slot
                        ? "bg-gradient-to-r from-pink-500 to-orange-500"
                        : "bg-zinc-900"
                    }
                    ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}
                  `}
                >
                  <Clock size={16} />
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* ADD-ONS */}
        <div className="mt-10">
          <h3 className="text-xl mb-5">Available Add-ons</h3>

          {venue.add_ons?.map((addon) => (
            <div
              key={addon.name}
              onClick={() => toggleAddon(addon)}
              className={`flex justify-between items-center p-5 rounded-xl mb-4 cursor-pointer transition
                ${
                  selectedAddons.includes(addon)
                    ? "bg-gradient-to-r from-pink-500 to-orange-500"
                    : "bg-zinc-900"
                }
              `}
            >
              <span>{addon.name}</span>
              <span className="text-green-400">+ ₹{addon.price}</span>
            </div>
          ))}
        </div>

        {/* BOOKING SUMMARY */}
        <div className="mt-10 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg mb-4">Booking Summary</h3>

          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>Turf Price</span>
            <span>₹{venue.price_per_hour} per hour</span>
          </div>

          <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            <span>Total</span>
            <span>₹{total} per hour</span>
          </div>
        </div>

      </div>

      {/* SELECTED BAR */}
      {selectedSlot && (
        <div className="fixed bottom-24 left-6 right-6 bg-gradient-to-r from-pink-500 to-orange-500 p-4 rounded-xl text-center text-sm">
          Selected: {selectedSlot}
        </div>
      )}

      {/* CONFIRM BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-6">

      {showModal && (
  <BookingModal
    venue={venue}
    slot={selectedSlot}
    onClose={() => setShowModal(false)}
    onBrowse={() => {
      setShowModal(false);
      router.push("/bookings");
    }}
  />
)} 
      <button
  disabled={!selectedSlot}
  onClick={() => setShowModal(true)}
  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 py-4 rounded-xl font-semibold text-lg disabled:opacity-40"
>
  Confirm Booking
</button>
      </div>
    </div>
  );
}