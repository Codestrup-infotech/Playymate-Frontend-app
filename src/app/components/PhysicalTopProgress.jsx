"use client";

export default function PhysicalTopProgress({ progress = 0, pendingCoins = 0 }) {
return ( 
<> 
{/* <div className="w-full px-6 pt-4">

 
  <div className="relative w-full h-1.5 bg-[#E8EAEC] rounded-full overflow-hidden">

   
    <div
      className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500"
      style={{ width: `${progress}%` }}
    />

    
    <div
      className="absolute -top-3 transition-all duration-500"
      style={{ left: `calc(${progress}% - 12px)` }}
    >
      <div className="w-6 h-6 rounded-full bg-yellow-400  shadow-md"></div>
    </div>
  </div>

 
  <div className="text-pink-400 font-Poppins text-sm mt-2 font-normal ">
    +{pendingCoins} Coins earned!
  </div>
</div>  */}








  <div className="w-96 px-6 pt-4">

     
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
 {/* COIN TEXT */}
      <div className="text-pink-400 text-sm mt-2 font-Poppins font-normal">
      +{pendingCoins} Coins earned!
      </div>
    </div>










</>






);
}