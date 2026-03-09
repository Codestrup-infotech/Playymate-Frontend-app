"use client";

export default function PaymentMethod({
  label,
  selected,
  onSelect,
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer ${
        selected
          ? "border-pink-500 bg-zinc-800"
          : "border-zinc-700 bg-zinc-900"
      }`}
    >
      {label}
    </div>
  );
}