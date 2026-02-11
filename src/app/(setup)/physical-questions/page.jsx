// "use client";

// import { useRouter } from "next/navigation";




// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";


// const sports = [
//   { name: "Cricket", icon: "🏏" },
//   { name: "Football", icon: "⚽" },
//   { name: "Badminton", icon: "🏸" },
//   { name: "Volleyball", icon: "🏐" },
//   { name: "Basketball", icon: "🏀" },
//   { name: "Skating", icon: "⛸️" },
//   { name: "Water Games", icon: "🏊" },
//   { name: "Card Games", icon: "🃏" },
//   { name: "Motor Sports", icon: "🏍️" },
//   { name: "Pickle Ball", icon: "🥒" },
// ];

// export default function Page() {
//   const router = useRouter();
//   const [selected, setSelected] = useState([]);
//   const [step, setStep] = useState(1); // 1 = select sports, 2 = selected list




















//   const toggleSport = (sport) => {
//   setSelected((prev) => {
//     // If already selected → unselect it
//     if (prev.includes(sport)) {
//       return prev.filter((s) => s !== sport);
//     }


//     // If already 3 selected → remove the last one & add the new
//     if (prev.length === 3) {
//       const newArr = [...prev];
//       newArr.pop();   // remove the last selected
//       return [...newArr, sport];
//     }

//     // Otherwise → just add
//     return [...prev, sport];
//   });
// };




//   useEffect(() => {
//     // restore selected sports
//     const saved = JSON.parse(sessionStorage.getItem("selectedSports") || "[]");
//     if (saved.length) setSelected(saved);

//     // restore step (go to Step 2 if coming back from sport page)
//     const savedStep = sessionStorage.getItem("pq_step");
//     if (savedStep === "selected") setStep(2);
//   }, []);

//   // whenever selected changes, persist it
//   useEffect(() => {
//     sessionStorage.setItem("selectedSports", JSON.stringify(selected));
//   }, [selected]);

//   // ...rest of your component
// }



//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">
//         {/* STEP 1 - SELECT SPORTS */}
//         {step === 1 && (
//           <>
//             <div className="text-center mb-10 flex flex-col space-y-5">
//               <h1 className="text-white text-3xl md:text-4xl font-semibold font-Poppins ">
//                 What Sports Do You Love to
//                 <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
//                   Play
//                 </span>
//               </h1>
//               <p className="text-gray-400 mt-2 font-Poppins ">
//                 Choose up to 3 interests for your profile
//               </p>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {sports.map((sport, i) => {
//                 const isActive = selected.includes(sport.name);

//                 return (
//                   <button
//                     key={i}
//                     onClick={() => toggleSport(sport.name)}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                       ${
//                         isActive
//                           ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-[1.02]"
//                           : "bg-[#050B14] border-[#003BFF] text-white hover:border-none hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
//                       }`}
//                   >
//                     <span className="text-lg">{sport.icon}</span>
//                     <span className="text-sm md:text-base font-medium">
//                       {sport.name}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="flex justify-center mt-10">
//               <button
//                 onClick={() => setStep(2)}
//                 disabled={selected.length < 3}
//                 className="px-10 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:scale-105 transition disabled:opacity-40 disabled:scale-100"
//               >
//                 Continue
//               </button>
//             </div>
//           </>
//         )}

//         {/* STEP 2 - SHOW SELECTED SPORTS */}
//         {step === 2 && (
//           <>
//             <div className="text-center mb-10 flex flex-col space-y-5">
//               <h1 className="text-white text-3xl md:text-4xl font-semibold font-Poppins">
//                 Your Selected Sports
//               </h1>
//               <p className="text-gray-400 font-Poppins">
//                 Choose one to continue
//               </p>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {selected.map((sport, i) => {
//                 const icon = sports.find((s) => s.name === sport)?.icon;

//                 return (
//                   <button
//                     key={i}
//                     onClick={() =>
//                       router.push(`/physical-questions/${sport.toLowerCase().replace(" ", "")}`)
//                     }
//                     className="flex items-center gap-3 px-4 py-4 rounded-xl border border-cyan-400
//                     text-white hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02] transition"
//                   >
//                     <span className="text-lg">{icon}</span>
//                     <span className="text-base font-medium">{sport}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="flex justify-between mt-10">
//               <button
//                 onClick={() => setStep(1)}
//                 className="text-cyan-400 underline"
//               >
//                 ← Back
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const sports = [
  { name: "Cricket", icon: "🏏" },
  { name: "Football", icon: "⚽" },
  { name: "Badminton", icon: "🏸" },
  { name: "Volleyball", icon: "🏐" },
  { name: "Basketball", icon: "🏀" },
  { name: "Skating", icon: "⛸️" },
  { name: "Water Games", icon: "🏊" },
  { name: "Card Games", icon: "🃏" },
  { name: "Motor Sports", icon: "🏍️" },
  { name: "Pickle Ball", icon: "🥒" },
  { name: "Tennis", icon: "🎾" },
  { name: "Cycling", icon: "🚴" },
];

export default function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(0); // 0 = GIF, 1 = select, 2 = selected list

  const toggleSport = (sport) => {
    setSelected((prev) => {
      if (prev.includes(sport)) {
        return prev.filter((s) => s !== sport);
      }

      if (prev.length === 3) {
        const newArr = [...prev];
        newArr.pop();
        return [...newArr, sport];
      }

      return [...prev, sport];
    });
  };

  // 🎬 Show GIF for 3 seconds
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 4000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
      <div className="w-full max-w-6xl">

        {/* STEP 0 - GIF INTRO */}
        {step === 0 && (
          <div className="relative h-screen w-full flex items-center justify-center overflow-hidden min-h-screen bg-black  px-4">

            {/* GIF Image */}
            <img
              src="/Gif/sportGif.gif"
              alt="Sports Intro"
              className="w-[300px] md:w-[420px] object-contain z-10"
            />

            {/* Bottom Dark Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-black/90 to-transparent z-20" />

            {/* Text */}
            <div className="absolute bottom-10 text-center z-30">
              <h1 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
                WANNA PLAY
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                TOGETHER?
              </h2>
            </div>
          </div>
        )}

        {/* STEP 1 - SELECT SPORTS */}
        {step === 1 && (
          <>
            <div className="text-center mb-10 flex flex-col space-y-5">
              <h1 className="text-white text-3xl md:text-4xl font-semibold">
                What Sports Do You Love to{" "}
                <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Play
                </span>
              </h1>
              <p className="text-gray-400">
                Choose up to 3 interests for your profile
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sports.map((sport, i) => {
                const isActive = selected.includes(sport.name);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSport(sport.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-[1.02]"
                        : "bg-[#050B14] border-[#003BFF] text-white hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
                      }`}
                  >
                    <span className="text-lg">{sport.icon}</span>
                    <span>{sport.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => setStep(2)}
                disabled={selected.length < 3}
                className="px-10 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 2 - SELECT ONE */}
        {step === 2 && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-white text-3xl font-semibold">
                Your Selected Sports
              </h1>
              <p className="text-gray-400">
                Choose one to continue
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selected.map((sport, i) => {
                const icon = sports.find((s) => s.name === sport)?.icon;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(
                        `/physical-questions/sports/${sport
                          .toLowerCase()
                          .replace(/\s+/g, "")}`
                      )
                    }
                    className="flex items-center gap-3 px-4 py-4 rounded-xl border border-cyan-400 text-white hover:bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <span>{icon}</span>
                    <span>{sport}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="text-cyan-400 underline"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
