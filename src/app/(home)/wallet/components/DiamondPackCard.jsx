"use client";

export default function DiamondPackCard({ diamonds, price, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 p-6 rounded-2xl cursor-pointer hover:scale-105 transition"
    >
      <h3 className="text-xl font-bold">{diamonds} Diamonds</h3>
      <p className="text-gray-400 mt-2">₹{price}</p>
    </div>
  );
}