"use client";

export default function PhysicalTopProgress({ progress = 0, pendingCoins = 0 }) {
return ( 
<> 


  <div className="w-96 px-6 pt-4 mb-3">

      {/* COIN TEXT */}
      <div className="text-pink-400 text-sm mt-2  flex justify-center items-center mb-1 font-Poppins font-normal">
      +{pendingCoins} Gold Coins earned!
      </div>
  {/* PROGRESS BAR */}
      <div className="relative w-full h-2 bg-[#E8EAEC] rounded-full font-Poppins overflow-visible">
  {/* FILLED BAR */}
  <div
    className="h-full bg-gradient-to-r from-pink-500 to-orange-400  font-Poppins transition-all duration-500"
      style={{ width: `${progress}%` }}
  />

 {/* COIN ICON */}
  <div
    className="absolute -top-2 transition-all duration-500"
     style={{ left: `calc(${progress}% - 12px)` }}
  >
    <div className="w-6 h-6 rounded-full bg-yellow-400  shadow-md"></div>
  </div>

</div>

    </div>

</>






);
}