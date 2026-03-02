"use client";

import { useRouter } from "next/navigation";

export default function GymBookingSuccess({
  gym,
  plan = "1 Month Membership",
  onClose,
  onBrowse
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl p-10 w-[90%] max-w-md text-center text-white shadow-2xl">

        {/* Icon */}
        <div className="text-6xl mb-6">💪</div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-3">
          Membership Confirmed!
        </h1>

        {/* Gym Name */}
        <p className="mb-2 text-lg">{gym?.name}</p>

        {/* Plan */}
        <p className="font-semibold mb-4">
          {plan}
        </p>

        {/* Message */}
        <p className="text-sm mb-6">
          A confirmation email has been sent to you.
          <br />
          Show it at the reception.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">

          <button
            onClick={onClose}
            className="bg-white/30 hover:bg-white/40 transition text-white px-6 py-2 rounded-xl font-medium"
          >
            Close
          </button>

          <button
            onClick={onBrowse}
            className="bg-white text-black px-6 py-2 rounded-xl font-semibold"
          >
            Browse More
          </button>

        </div>
      </div>
    </div>
  );
}