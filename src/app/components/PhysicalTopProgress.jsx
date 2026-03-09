"use client";

export default function PhysicalTopProgress({ progress = 0, pendingCoins = 0 }) {
return ( <div className="w-full px-6 pt-4">

  {/* PROGRESS BAR */}
  <div className="relative w-full h-1.5 bg-[#E8EAEC] rounded-full overflow-hidden">

    {/* FILLED BAR */}
    <div
      className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500"
      style={{ width: `${progress}%` }}
    />

    {/* COIN ICON */}
    <div
      className="absolute -top-3 transition-all duration-500"
      style={{ left: `calc(${progress}% - 12px)` }}
    >
      <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs shadow-lg">
        🪙
      </div>
    </div>
  </div>

  {/* COIN TEXT */}
  <div className="text-pink-400 font-Poppins text-sm mt-2 font-normal ">
    +{pendingCoins} Coins earned!
  </div>
</div> 
);
}