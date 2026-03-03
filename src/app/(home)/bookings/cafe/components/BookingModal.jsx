"use client";

export default function CafeBookingSuccess({
  cafe,
  groupSize,
  onClose,
  onBrowse
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-gradient-to-br   from-pink-500 to-orange-500 rounded-3xl p-10 w-[90%] max-w-md text-center text-white shadow-2xl">

        <div className="text-6xl mb-6">☕</div>

        <h1 className="text-2xl font-bold mb-3">
          Booking Confirmed!
        </h1>

        <p className="mb-2">{cafe?.title}</p>

        <p className="font-semibold mb-4">
          Group Size: {groupSize}
        </p>

        <p className="text-sm mb-6">
          A confirmation email has been sent to you.
          <br />
          Show it at the first cafe in your trail.
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