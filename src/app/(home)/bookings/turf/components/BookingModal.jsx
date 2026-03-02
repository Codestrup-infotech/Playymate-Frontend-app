"use client";

export default function BookingModal({
  venue,
  slot,
  onClose,
  onBrowse
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl p-8 w-[90%] max-w-md text-center text-white relative shadow-2xl">

        {/* Emoji */}
        <div className="text-6xl mb-4">🎉</div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          Booking Confirmed!
        </h2>

        {/* Venue */}
        <p className="text-white/90 mb-2">
          {venue?.name}
        </p>

        {/* Time */}
        <p className="font-semibold mb-4">
          {slot}
        </p>

        {/* Info */}
        <p className="text-sm text-white/80 mb-6">
          A QR code has been sent to your email.
          <br />
          Show it at the venue.
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