"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Shield, 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Car, 
  ShowerHead, 
  Lock, 
  Coffee, 
  Wifi, 
  Dumbbell, 
  Snowflake, 
  Play,
} from "lucide-react";

// Mock Data
const venueData = {
  name: "Elite Football Arena",
  category: "Football",
  rating: 5.0,
  verified: true,
  safetyChecked: true,
  isLive: true,
  price: 1200,
  discount: 200,
  total: 1000,
  images: [
    "/search/football.jpg",
    "/explore/2.jpg",
    "/explore/1.jpg",
    "/search/yoga.jpg",
  ],
  amenities: [
    { icon: <Car size={18} />, label: "Parking" },
    { icon: <ShowerHead size={18} />, label: "Showers" },
    { icon: <Lock size={18} />, label: "Lockers" },
    { icon: <Coffee size={18} />, label: "Cafe" },
    { icon: <Wifi size={18} />, label: "Free WiFi" },
    { icon: <Dumbbell size={18} />, label: "Equipment" },
    { icon: <Snowflake size={18} />, label: "Air Con" },
    { icon: <Shield size={18} />, label: "First Aid" },
  ],
  address: "Elite Sports Complex, Baner Road, Pune, Maharashtra 411045",
  description: "Experience world-class football at our premium arena. Professionally maintained turf, modern facilities, and expert trainers make this the perfect venue for both casual players and serious athletes. Whether you're organizing a match with friends or training for competitions, we provide everything you need for an unforgettable football experience.",
  trainer: {
    name: "Sport Management Trainer",
    image: "/loginAvatars/avatars1.jpg",
  },
  slots: "4 Slots",
  nextSlot: "Today 3:00 PM",
};

// VenueHero Component
function VenueHero({ images, onBack }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-video">
        <img
          src={images[selectedImage]}
          alt="Venue"
          className="w-full h-full object-cover rounded-b-3xl transition-opacity duration-300"
        />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent rounded-b-3xl" />
      </div>

      {/* Thumbnail Stack */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? "border-pink-500 scale-110"
                : "border-white/30 opacity-70 hover:opacity-100"
            }`}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// InfoCard Component
function InfoCard({ icon, title, children, className = "" }) {
  return (
    <div className={`bg-[#111111] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// AmenityItem Component
function AmenityItem({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all cursor-pointer">
      <div className="text-pink-500">{icon}</div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

// BottomActionBar Component
function BottomActionBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-white/10 pb-safe z-50">
      <div className="flex items-center justify-between p-4">
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center hover:bg-[#252525] hover:scale-105 active:scale-95 transition-all">
            <Bookmark size={20} className="text-white" />
          </button>
          <button className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center hover:bg-[#252525] hover:scale-105 active:scale-95 transition-all">
            <Share2 size={20} className="text-white" />
          </button>
        </div>

        {/* Center Join Live */}
        <button className="px-6 py-3 bg-red-600 rounded-xl font-semibold flex items-center gap-2 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all">
          <Play size={18} fill="currentColor" />
          Join Live
        </button>

        {/* Right Book Now */}
        <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-all">
          Book Now
        </button>
      </div>

      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}

// Main Page Component
export default function ListingDetailsPage() {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white pb-28 animate-fade-in">
      {/* Hero Section */}
      <VenueHero 
        images={venueData.images} 
        onBack={() => window.history.back()} 
      />

      {/* Content */}
      <div className="px-4 pt-4 -mt-8 relative z-10">
        {/* Status + Title */}
        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5 mb-4">
          {/* Live Badge */}
          {venueData.isLive && (
            <span className="inline-flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Live Now
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold mb-3">{venueData.name}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-gray-400 text-sm border border-white/10">
              {venueData.category}
            </span>
            {venueData.verified && (
              <span className="px-3 py-1 rounded-full bg-transparent text-green-500 text-sm border border-green-500/50 flex items-center gap-1">
                <CheckCircle size={14} />
                Verified
              </span>
            )}
            {venueData.safetyChecked && (
              <span className="px-3 py-1 rounded-full bg-transparent text-green-500 text-sm border border-green-500/50 flex items-center gap-1">
                <Shield size={14} />
                Safety Checked
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={star <= venueData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                />
              ))}
            </div>
            <span className="text-yellow-400 font-semibold">{venueData.rating}</span>
          </div>
        </div>

        {/* Location Card */}
        <InfoCard icon={<MapPin size={20} className="text-white" />} title="Location" className="mb-4">
          <p className="text-gray-400 text-sm mb-3">{venueData.address}</p>
          <div className="rounded-xl overflow-hidden h-32 bg-[#1a1a1a]">
            <img src="/loginAvatars/map.jpg" alt="Map" className="w-full h-full object-cover opacity-70" />
          </div>
        </InfoCard>

        {/* About Section */}
        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5 mb-4">
          <h3 className="text-white font-semibold mb-3">About</h3>
          <p className={`text-gray-400 text-sm leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
            {venueData.description}
          </p>
          <button 
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-pink-500 text-sm mt-2 hover:underline"
          >
            {showFullDescription ? "Read Less" : "Read More"}
          </button>
        </div>

        {/* Amenities */}
        <InfoCard icon={<CheckCircle size={20} className="text-white" />} title="Amenities" className="mb-4">
          <div className="grid grid-cols-4 gap-2 mt-3">
            {venueData.amenities.map((amenity, index) => (
              <AmenityItem key={index} icon={amenity.icon} label={amenity.label} />
            ))}
          </div>
        </InfoCard>

        {/* Pricing */}
        <InfoCard icon={<span className="text-white font-bold">₹</span>} title="Pricing" className="mb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Base price</span>
              <span className="text-white">₹{venueData.price}/hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Membership discount</span>
              <span className="text-green-500">-₹{venueData.discount}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                ₹{venueData.total}/hour
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Calendar */}
        <InfoCard icon={<Calendar size={20} className="text-white" />} title="Calendar" className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span>{venueData.nextSlot}</span>
            </div>
            <span className="px-3 py-1 rounded-full border border-red-500/50 text-red-500 text-sm">
              {venueData.slots}
            </span>
          </div>
        </InfoCard>

        {/* Trainer */}
        <div className="bg-[#111111] rounded-2xl p-4 border border-white/5 mb-4 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          <img 
            src={venueData.trainer.image} 
            alt="Trainer" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-white font-medium">{venueData.trainer.name}</p>
            <p className="text-gray-500 text-sm">View Profile</p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </div>

        {/* Cancellation Policy */}
        <div className="bg-[#111111] rounded-2xl p-4 border border-white/5 mb-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          <span className="text-white font-medium">Cancellation Policy</span>
          <ChevronRight size={20} className="text-gray-500" />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <BottomActionBar />

      {/* Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}
