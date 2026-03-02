"use client";

export default function SlotButton({
  slot,
  selectedSlot,
  onSelect,
  isDisabled = false
}) {
  const isSelected = selectedSlot === slot;

  return (
    <button
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(slot)}
      className={`
        p-3 rounded-xl text-sm font-medium transition-all duration-200
        ${isSelected
          ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg"
          : "bg-zinc-900 text-gray-300 hover:bg-zinc-800"}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {slot}
    </button>
  );
}