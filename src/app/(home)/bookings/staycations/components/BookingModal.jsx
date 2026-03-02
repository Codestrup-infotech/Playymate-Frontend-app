"use client";

export default function StaycationBookingSuccess({
  stay,
  nights = 1,
  onClose,
  onBrowse
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl p-10 w-[90%] max-w-md text-center text-white shadow-2xl">

        <div className="text-6xl mb-6">🏖️</div>

        <h1 className="text-2xl font-bold mb-3">
          Booking Confirmed!
        </h1>

        <p className="mb-2">{stay?.name}</p>

        <p className="font-semibold mb-4">
          {nights} Night{nights > 1 ? "s" : ""} Stay
        </p>

        <p className="text-sm mb-6">
          A confirmation email has been sent to you.
          <br />
          Show it at check-in.
        </p>

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