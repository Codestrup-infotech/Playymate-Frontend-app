// "use client";
// import { useState } from "react";

// const slides = [
//   {
//     title: "From Virtual to Reality.",
//     desc: "Turn your interests into real experiences.",
//     img: "/onboard1.png",
//     cta: "Next",
//   },
//   {
//     title: "Start Your Journey",
//     desc: "Let’s get moving.",
//     img: "/onboard2.png",
//     cta: "Next",
//   },
//   {
//     title: "Build Your Perfect Playymate Experience!",
//     desc: "Share a little about yourself to get better matches.",
//     img: "/onboard3.png",
//     cta: "Get Started",
//   },
// ];

// export default function OnboardingFlow() {
//   const [step, setStep] = useState(0);
//   const [lang, setLang] = useState("Hindi");

//   return (
//     <main className="min-h-screen bg-black text-white flex items-center justify-center">
//       <div className="w-[360px] max-w-full px-4">
//         {step === 0 && <LanguageSelect lang={lang} setLang={setLang} onNext={() => setStep(1)} />}
//         {step === 1 && <Slide data={slides[0]} onNext={() => setStep(2)} />}
//         {step === 2 && <RingAnimation onNext={() => setStep(3)} />}
//         {step === 3 && <Slide data={slides[1]} onNext={() => setStep(4)} />}
//         {step === 4 && <Slide data={slides[2]} onNext={() => alert("Get Started")} />}
//       </div>
//     </main>
//   );
// }

// function LanguageSelect({ lang, setLang, onNext }) {
//   return (
//     <div className="rounded-3xl bg-gradient-to-br from-purple-900 to-black p-6">
//       <h2 className="text-xl font-semibold">Choose the language</h2>

//       <div className="mt-4 space-y-3">
//         {["English", "Hindi", "Spanish"].map((l) => (
//           <button
//             key={l}
//             onClick={() => setLang(l)}
//             className={`w-full rounded-xl border p-3 text-left ${
//               lang === l ? "border-pink-500 bg-pink-500/10" : "border-white/20"
//             }`}
//           >
//             {l}
//           </button>
//         ))}
//       </div>

//       <button
//         onClick={onNext}
//         className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold"
//       >
//         Continue
//       </button>
//     </div>
//   );
// }

// function Slide({ data, onNext }) {
//   return (
//     <div className="text-center">
//       <div className="mx-auto h-[360px] w-full rounded-3xl bg-gradient-to-br from-purple-500/30 to-black flex items-center justify-center">
//         <span className="opacity-60">Image</span>
//       </div>

//       <h2 className="mt-6 text-2xl font-semibold">{data.title}</h2>
//       <p className="mt-2 text-gray-300">{data.desc}</p>

//       <button
//         onClick={onNext}
//         className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold"
//       >
//         {data.cta}
//       </button>
//     </div>
//   );
// }

// function RingAnimation({ onNext }) {
//   return (
//     <div className="text-center">
//       <div className="relative mx-auto my-10 h-[260px] w-[260px]">
//         <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-pink-500/50" />
//         <div className="absolute inset-6 animate-spin-slow-reverse rounded-full border-4 border-purple-500/50" />
//         <div className="absolute inset-12 animate-spin-slow rounded-full border-4 border-orange-400/50" />
//       </div>

//       <h2 className="text-2xl font-semibold">Welcome!</h2>
//       <p className="mt-2 text-gray-300">
//         Sports, fitness, fun, food, and friends together.
//       </p>

//       <button
//         onClick={onNext}
//         className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold"
//       >
//         Next
//       </button>
//     </div>
//   );
// }

// "use client";
// import { useState } from "react";

// const slides = [
//   {
//     title: "From Virtual to Reality.",
//     highlight: "Reality.",
//     desc: "Turn your interests into real experiences.",
//     img: "onboarding/1.png",
//     border: "border-fuchsia-500",
//     glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-fuchsia-500",
//   },
//   {
//     title: "Play. Connect. Learn.",
//     highlight: "Learn",
//     desc: "Build communities, join events, and meet your  Playmates.",
//     img: "onboarding/2.png",
//     border: "border-sky-500",
//     glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-sky-500",
//   },
//   {
//     title: "Live Your Journey",
//     highlight: "Journey",
//     desc: "",
//     img: "onboarding/3.png",
//     border: "border-[#FF8319]",
//     glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#FF8319]",
//   },
//   {
//     title: "Grow Your Skills",
//     highlight: "Skills",
//     desc: "",
//     img: "onboarding/4.png",
//     border: "border-[#4839FF]",
//     glow: "shadow-[0_0_25px_rgba(72,57,255,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#4839FF]",
//   },
//   {
//     title: "Build Your Playymate",
//     highlight: "Playymate",
//     desc: "Let’s get moving.",
//     img: "onboarding/5.png",
//     border: "border-[#99DDFF]",
//     glow: "shadow-[0_0_25px_rgba(153,221,255,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#99DDFF]",
//   },
// ];

// export default function Onboarding() {
//   const [i, setI] = useState(0);
//   const s = slides[i];

//   return (
//     <main className="min-h-screen bg-black flex items-center justify-center pt-8">
//       <div className="  px-4  text-center text-white">
//         {/* Image Card */}
//         <div
//           className={`relative mx-auto w-[280px] overflow-hidden rounded-3xl border-2 ${s.border} ${s.glow}`}
//         >
//           <img
//             src={s.img}
//             alt="Onboarding"
//             className="h-[380px]  w-full "
//           />
//         </div>

//         {/* Title */}
//         <h2 className="mt-6 font-Playfair Display  text-2xl font-semibold">
//           {s.title.split(s.highlight)[0]}
//           <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
//             {s.highlight}
//           </span>
//         </h2>

//         {/* Description */}
//         <p className="mt-2 text-[16x] font-normal text-gray-300 font-Poppins  ">{s.desc}</p>

//         {/* Dots (clickable) */}
//         <div className="mt-4 flex items-center justify-center gap-2">
//           {slides.map((item, idx) => (
//             <button
//               key={idx}
//               onClick={() => setI(idx)}
//               className={`h-2.5 w-2.5 rounded-full transition-all ${
//                 idx === i ? `${item.dot} ring-4 ring-white/30` : "bg-gray-500"
//               }`}
//               aria-label={`Go to slide ${idx + 1}`}
//             />
//           ))}
//         </div>

//         {/* Next / Get Started Button */}
//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={() =>
//               setI((prev) => Math.min(prev + 1, slides.length - 1))
//             }
//             className={`rounded-xl bg-gradient-to-r ${s.btn} px-5 py-2 text-[16px] text-[#FF94F6] font-Poppins `}
//           >
//             {i === slides.length - 1 ? "Get Started" : "Next"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }

// "use client";
// import { useState } from "react";

// const slides = [
//   {
//     title: "From Virtual to Reality.",
//     highlight: ["Virtual","Reality"], // Can be an array or string
//     desc: "Turn your interests into real experiences.",
//     img: "onboarding/1.png",
//     border: "border-fuchsia-500",
//     glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-fuchsia-500",
//   },
//   {
//     title: "Play. Connect. Learn.",
//     highlight: ["Connect"],
//     desc: "Build communities, join events, and meet your Playmates.",
//     img: "onboarding/2.png",
//     border: "border-sky-500",
//     glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-sky-500",
//   },
//   {
//     title: "Live Your Journey",
//     // Highlighting multiple separate words
//     highlight: ["Live", "Journey"], 
//     desc: "",
//     img: "onboarding/3.png",
//     border: "border-[#FF8319]",
//     glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#FF8319]",
//   },
//   {
//     title: "Grow Your Skills",
//     // Highlighting multiple separate words
//     highlight: ["Grow", "Skills"],
//     desc: "",
//     img: "onboarding/4.png",
//     border: "border-[#4839FF]",
//     glow: "shadow-[0_0_25px_rgba(72,57,255,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#4839FF]",
//   },
//   {
//     title: "Build Your Playymate",
//     // Highlighting a specific word in the middle or end
//     highlight: ["Playymate"],
//     desc: "Let’s get moving.",
//     img: "onboarding/5.png",
//     border: "border-[#99DDFF]",
//     glow: "shadow-[0_0_25px_rgba(153,221,25,0.7)]",
//     btn: "bg-[#2C1029]",
//     dot: "bg-[#99DDFF]",
//   },
// ];

// export default function Onboarding() {
//   const [i, setI] = useState(0);
//   const s = slides[i];

//   // Helper function to handle multi-word highlighting
//   const renderTitle = (title, highlight) => {
//     // Ensure highlights is always an array
//     const targets = Array.isArray(highlight) ? highlight : [highlight];

//     // Create a regex pattern that matches any of the target words
//     // The () capturing group ensures the delimiters (the highlighted words) are included in the split result
//     const regex = new RegExp(`(${targets.join("|")})`, "gi");

//     // Split the title based on the regex
//     const parts = title.split(regex);

//     return parts.map((part, index) => {
//       // Check if the current part matches any of our highlight words (case-insensitive)
//       const isHighlight = targets.some(
//         (t) => t.toLowerCase() === part.toLowerCase()
//       );

//       return isHighlight ? (
//         <span
//           key={index}
//           className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
//         >
//           {part}
//         </span>
//       ) : (
//         <span key={index}>{part}</span>
//       );
//     });
//   };

//   return (
//     <main className="min-h-screen bg-black flex items-center justify-center pt-8">
//       <div className="px-4 text-center text-white  w-1/2">
//         {/* Image Card */}
//         <div
//           className={`relative mx-auto w-[280px] overflow-hidden rounded-3xl border-2 ${s.border} ${s.glow}`}
//         >
//           <img
//             src={s.img}
//             alt="Onboarding"
//             className="h-[380px] w-full"
//           />
//         </div>
        
// <div className="flex flex-col h-24  space-y-3 mt-6 "> 
//         {/* Title */}
//         <h2 className=" font-Playfair text-2xl font-semibold transition-all transform hover:scale-150 ">
//           {renderTitle(s.title, s.highlight)}
//         </h2>

//         {/* Description */}
//         <p className=" text-[16px] font-normal text-gray-300 font-Poppins">
//           {s.desc}
//         </p>
 
//         {/* Dots (clickable) */}
//         <div className=" flex items-center justify-center gap-2">
//           {slides.map((item, idx) => (
//             <button
//               key={idx}
//               onClick={() => setI(idx)}
//               className={`h-2.5 w-2.5 rounded-full transition-all ${
//                 idx === i ? `${item.dot} ring-4 ring-white/30` : "bg-gray-500"
//               }`}
//               aria-label={`Go to slide ${idx + 1}`}
//             />
//           ))}
//         </div> </div>

//         {/* Next / Get Started Button */}
//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={() =>
//               setI((prev) => Math.min(prev + 1, slides.length - 1))
//             }
//             className={`rounded-xl bg-gradient-to-r ${s.btn} px-5 py-2 text-[16px] text-[#FF94F6] font-Poppins`}
//           >
//             {i === slides.length - 1 ? "Get Started" : "Next"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }


"use client";

import { useState } from "react";

/* ---------------- SLIDES ---------------- */

const slides = [
  {
    title: "From Virtual to Reality.",
    highlight: ["Virtual", "Reality"],
    desc: "Turn your interests into real experiences.",
    img: "/onboarding/1.png",
    border: "border-fuchsia-500",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-fuchsia-500",
  },
  {
    title: "Play. Connect. Learn.",
    highlight: ["Connect"],
    desc: "Build communities, join events, and meet your Playmates.",
    img: "/onboarding/2.png",
    border: "border-sky-500",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-sky-500",
  },
  {
    title: "Live Your Journey",
    highlight: ["Live", "Journey"],
    desc: "",
    img: "/onboarding/3.png",
    border: "border-[#FF8319]",
    glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#FF8319]",
  },
  {
    title: "Grow Your Skills",
    highlight: ["Grow", "Skills"],
    desc: "",
    img: "/onboarding/4.png",
    border: "border-[#4839FF]",
    glow: "shadow-[0_0_25px_rgba(72,57,255,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#4839FF]",
  },
  {
    title: "Build Your Playymate",
    highlight: ["Playymate"],
    desc: "Let’s get moving.",
    img: "/onboarding/5.png",
    border: "border-[#99DDFF]",
    glow: "shadow-[0_0_25px_rgba(153,221,255,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#99DDFF]",
  },
];

/* ---------------- MAIN ---------------- */

export default function OnboardingFlow() {
  const [step, setStep] = useState(0); // 0=language,1=welcome,2=slider
  const [slideIndex, setSlideIndex] = useState(0);




  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">


{step === 0 && <Landing onNext={() => setStep(1)} />}


      {step === 1 && <Language onNext={() => setStep(2)} />}

      {step === 2 && <Welcome onNext={() => setStep(3)} />}

      {step === 3 && (
        <Slider
          i={slideIndex}
          setI={setSlideIndex}
          onFinish={() => alert("Done onboarding 🎉")}
        />
      )}

    </main>
  );
}

/*--------Landing--------- */

function Landing({ onNext }) {
  return (
    <div className="relative w-full h-screen  flex flex-col justify-center text-center items-center ">

  



   <div className="flex flex-col justify-center items-center space-y-2">
      <img src="/playymate-icon.png" className="w-52"/>
      <img src="/playymate-logo.png" className=" w-[500px] "/>

    </div>





   

      <div className="absolute bottom-12 w-full flex justify-center px-6">
        <button
          onClick={onNext}
          className="w-full max-w-sm rounded-full bg-gradient-to-r 
          from-pink-500 to-orange-400 py-4 text-lg font-semibold"
        >
          Get Started
        </button>
      </div>

    </div>
  );
}



/* ---------------- LANGUAGE ---------------- */

function Language({ onNext }) {
  const [lang, setLang] = useState("English");

  return (
    <div className="w-[320px] p-6 rounded-3xl bg-gradient-to-br from-purple-900 to-black">

      <h2 className="text-xl font-semibold">Choose the language</h2>

      <div className="mt-4 space-y-3">
        {["English", "Hindi", "Spanish"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`w-full rounded-xl border p-3 text-left ${
              lang === l
                ? "border-pink-500 bg-pink-500/10"
                : "border-white/20"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold"
      >
        Continue
      </button>
    </div>
  );
}

/* ---------------- WELCOME ---------------- */

function Welcome({ onNext }) {
  return (
    <div className="relative w-full h-screen  flex   ">

      <div className="absolute top-9  ">
        <h1 className="text-4xl font-semibold">Welcome!</h1>
        <p className="mt-2 text-gray-300 max-w-xs font-Poppins ">
          Sports, fitness, fun, food, and friends together.
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Rings />
      </div>

      <div className="absolute bottom-12 w-full flex justify-center px-6">
        <button
          onClick={onNext}
          className="w-full max-w-sm rounded-full bg-gradient-to-r 
          from-pink-500 to-orange-400 py-3 text-lg font-semibold"
        >
          Get Started
        </button>
      </div>

    </div>
  );
}

/* ---------------- RINGS ---------------- */

// function Rings() {
//   const data = [
//     { size: 400, color: "border-fuchsia-500", speed: "animate-spin-slow" },
//     { size: 300, color: "border-sky-400", speed: "animate-spin-slower" },
//     { size: 320, color: "border-yellow-400", speed: "animate-spin-slow" },
//      { size: 320, color: "border-orange-400", speed: "animate-spin-slow" },
//   ];

//   return (
//     <div className="relative w-[520px] h-[520px]">
//       {data.map((c, i) => (
//         <div
//           key={i}
//           className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 
//           rounded-full border-2 ${c.color} ${c.speed}`}
//           style={{ width: c.size, height: c.size }}
//         />
//       ))}
//     </div>
//   );
// }




 function Rings() {
  const data = [
    { 
      size: 480, 
      color: "#a855f7", // Purple
      duration: "30s", 
      images: ["https://picsum.photos/id/102/60"], 
      type: "arc-75" // 75% of a circle
    },
    { 
      size: 400, 
      color: "#06b6d4", // Cyan
      duration: "25s", 
      images: ["https://picsum.photos/id/103/60", "https://picsum.photos/id/104/60"], 
      type: "arc-50" // Half circle
    },
    { 
      size: 320, 
      color: "#eab308", // Yellow
      duration: "20s", 
      images: ["https://picsum.photos/id/106/60"], 
      type: "arc-25" // Quarter circle
    },
    { 
      size: 240, 
      color: "#f97316", // Orange
      duration: "15s", 
      images: ["https://picsum.photos/id/107/80"], // Larger center-ish image
      type: "full" 
    },
    { 
      size: 160, 
      color: "#ef4444", // Red
      duration: "12s", 
      images: ["https://picsum.photos/id/108/40"], 
      type: "arc-50" 
    }
  ];

  return (
    <>
      <style>{`
        @keyframes rotate-center {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .canvas {
          position: relative;
          width: 600px;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000; /* Dark background like your image */
          overflow: hidden;
        }

        .ring-path {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 2px solid transparent; /* Base is invisible */
        }

        /* Defining the "Cut" styles using border-sides */
        .arc-75 { border-top-color: inherit; border-right-color: inherit; border-bottom-color: inherit; }
        .arc-50 { border-top-color: inherit; border-left-color: inherit; }
        .arc-25 { border-top-color: inherit; }
        .full { border-color: inherit; opacity: 0.8; }

        .orbiting-node {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #000; /* Contrast ring around image */
          background: #222;
        }
      `}</style>

      <div className="canvas">
        {data.map((ring, i) => (
          <div
            key={i}
            className={`ring-path ${ring.type}`}
            style={{
              width: ring.size,
              height: ring.size,
              borderColor: ring.color,
              animation: `rotate-center ${ring.duration} linear infinite`,
              // Add variety by rotating the starting position of the "cut"
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`
            }}
          >
            {ring.images.map((src, idx) => {
              // Position images along the path
              const angle = (idx * 360) / ring.images.length;
              const radius = ring.size / 2;
              
              return (
                <img
                  key={idx}
                  src={src}
                  alt="orbit"
                  className="orbiting-node"
                  style={{
                    width: ring.size < 250 ? '80px' : '50px', // Matches your "main" soccer image size
                    height: ring.size < 250 ? '80px' : '50px',
                    transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}


/* ---------------- SLIDER ---------------- */

// function Slider() {


//     const [i, setI] = useState(0);
//   const [locked, setLocked] = useState(false);

//   const renderTitle = (title, highlight) => {
//     const targets = Array.isArray(highlight) ? highlight : [highlight];
//     const regex = new RegExp(`(${targets.join("|")})`, "gi");

//     return title.split(regex).map((part, idx) =>
//       targets.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
//         <span
//           key={idx}
//           className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
//         >
//           {part}
//         </span>
//       ) : (
//         <span key={idx}>{part}</span>
//       )
//     );
//   };

//   return (
//     <main className="min-h-screen bg-black flex items-center justify-center">
//       <div className="w-[420px] text-white">

//         {/* SLIDING CONTENT ONLY */}
//         <div className="relative overflow-hidden h-[500px]">
//           <div
//             className="flex transition-transform duration-700 ease-in-out"
//             style={{ transform: `translateX(-${i * 100}%)` }}
//           >
//             {slides.map((s, idx) => (
//               <div key={idx} className="min-w-full text-center px-4">
//                 <div
//                   className={`mx-auto w-[280px] h-[380px] rounded-3xl border-2 overflow-hidden ${s.border} ${s.glow}`}
//                 >
//                   <img
//                     src={s.img}
//                     alt=""
//                     className="h-full w-full "
//                   />
//                 </div>

//                 <h2 className="mt-6 font-Playfair text-2xl font-semibold">
//                   {renderTitle(s.title, s.highlight)}
//                 </h2>

//                 <p className="mt-2 text-gray-300 font-Poppins">
//                   {s.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* FIXED DOTS */}
//         <div className="flex justify-center gap-3 mt-2 ">
//           {slides.map((item, idx) => (
//             <button
//               key={idx}
//               onClick={() => setI(idx)}
//               className={`h-3 w-3 rounded-full transition-all ${
//                 idx === i
//                   ? `${item.dot} ring-4 ring-white/40 scale-125`
//                   : "bg-gray-600"
//               }`}
//             />
//           ))}
//         </div>

//         {/* FIXED NEXT BUTTON BELOW DOTS */}
//         <div className="mt-5 flex justify-end">
//           <button
//             onClick={() => {
//               if (i < slides.length - 1) {
//                 setI(i + 1);
//               } else {
//                 setLocked(true);
//               }
//             }}
//             className={`rounded-xl px-5 py-2 text-[#FF94F6] font-Poppins ${
//               locked ? "bg-gray-600" : slides[i].btn
//             }`}
//           >
//             {i === slides.length - 1 ? "Get Started" : "Next"}
//           </button>

//         </div>
//       </div>
//     </main>
//   );
// }

// import { useState } from "react";
// import { useRouter } from "next/router";

function Slider() {
  const [i, setI] = useState(0);
  // const router = useRouter();

  const renderTitle = (title, highlight) => {
    const targets = Array.isArray(highlight) ? highlight : [highlight];
    const regex = new RegExp(`(${targets.join("|")})`, "gi");

    return title.split(regex).map((part, idx) =>
      targets.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
        <span
          key={idx}
          className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
        >
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  const isLastSlide = i === slides.length - 1;      // 5th slide (index 4)
  const isFinalPage = i === slides.length;          // 6th page (index 5)
  const totalScreens = slides.length + 1;           // 6 total

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-[420px] text-white">

        {/* SLIDING CONTENT ONLY */}
        <div className="relative overflow-hidden h-[500px]">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {/* 1–5 Normal Slides */}
            {slides.map((s, idx) => (
              <div key={idx} className="min-w-full text-center px-4">
                <div
                  className={`mx-auto w-[280px] h-[380px] rounded-3xl border-2 overflow-hidden ${s.border} ${s.glow}`}
                >
                  <img src={s.img} alt="" className="h-full w-full" />
                </div>

                <h2 className="mt-6 font-Playfair text-2xl font-semibold">
                  {renderTitle(s.title, s.highlight)}
                </h2>

                <p className="mt-2 text-gray-300 font-Poppins">
                  {s.desc}
                </p>
              </div>
            ))}

            {/* 6th FINAL PAGE (LOGIN SCREEN) */}
            <div className="min-w-full text-center px-4 flex flex-col justify-center items-center">
              <img
                src="/playymate-icon.png"
                alt="icon"
                className="h-16 mb-4"
              />

              <div className="mx-auto w-[370px] h-[400px] rounded-3xl border-2 border-purple-500 shadow-xl shadow-purple-500/30 bg-gradient-to-b from-purple-700/40 to-black p-6 flex flex-col items-center justify-center">
                <h2 className="font-Playfair text-[30px] font-semibold mb-2">
                  Build Your Perfect{" "}
                  <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                    Playymate
                  </span>{" "}
                  Experience!
                </h2>

                <p className="text-gray-300 text-sm mb-10 font-Poppins">
                  Share a little about yourself to get better matches and recommendations.
                  Your data is always safe and never shared.
                </p>

                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 text-white font-semibold shadow-lg shadow-pink-400/40"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DOTS (ONLY FOR 1–5 SLIDES, NOT FINAL PAGE) */}
        {!isFinalPage && (
          <div className="flex justify-center gap-3 mt-2">
            {slides.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx === i
                    ? `${item.dot} ring-4 ring-white/40 scale-125`
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* NEXT / GET STARTED BUTTON (ONLY FOR 1–5 SLIDES) */}
        {!isFinalPage && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => {
                if (i < totalScreens - 1) {
                  setI(i + 1); // slide 5 → final page
                }
              }}
              className={`px-6 py-2 font-Poppins transition-all duration-300
                ${
                  isLastSlide
                    ? "rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-400/40"
                    : "rounded-xl text-[#FF94F6] " + slides[i].btn
                }
              `}
            >
              {isLastSlide ? "Get Started" : "Next"}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}


///////// Login page after onboarding ////////



"use client";

import { useState } from "react";
import Image from "next/image";


export default function LoginFlow() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);

    const next = () => setStep(step + 1);
    const back = () => setStep(step - 1);

    const handleOtp = (val, i) => {
        const copy = [...otp];
        copy[i] = val;
        setOtp(copy);
    };

    const avatars = [
        // "/loginAvatars/logo.png",
        "/loginAvatars/avatars1.jpg",
        "/loginAvatars/avatars2.jpg",
        "/loginAvatars/avatars3.jpg",
        "/loginAvatars/avatars4.jpg",
        "/loginAvatars/avatars5.jpg",
        "/loginAvatars/avatars6.jpg",
    ];



    return (

        <> 
      

        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center  ">

<div className="w-96"> 
  {step > 1 && (
                <button onClick={back} className="mt-6 mb-10 text-gray-400 text-3xl font-bold   "> ← </button>
            )} </div>
            

            {/* ---------------- STEP 1 ---------------- */}
            {step === 1 && (

                <div className="">
                    <div className=" flex space-x-32 border-[0.5px] border-dashed border-gray-700 rounded-3xl px-20 py-20">

                        <div className="flex flex-col space-y-10  ">
                            <img src="/loginAvatars/logo.png" alt="" className="mb-8 w-72  " />

                            {/* AVATAR RING */}
                            <div className="relative flex justify-center ">


                                {/* CENTER AVATAR */}
                                <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center z-10">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src="/loginAvatars/avatars1.jpg"
                                            fill
                                            alt="avatar"

                                            priority
                                        />
                                    </div>
                                </div>

                                {/* ORBIT */}
                                <div className="absolute inset-0 flex items-center justify-center mb-">

                                    {/* DASHED RING */}
                                    <div className="w-44 h-44 border-2 border-dashed border-gray-600 rounded-full animate-spin-slow" />

                                    {avatars.map((a, i) => (
                                        <div
                                            key={i}
                                            className="absolute animate-spin-slow-reverse w-9 h-9 rounded-full p-[2px] bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg"
                                            style={{
                                                transform: `rotate(${i * 60}deg) translate(88px) rotate(-${i * 60}deg)`
                                            }}
                                        >
                                            <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                                                <Image src={a} fill alt="avatar" className="object-cover" />
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>

                        <div >
                            <div className="flex  flex-col justify-center  items-center mb-5">
                                <h2 className="text-3xl font-Playfair Display font-bold Display mb-2">
                                    Find Your People,
                                </h2>
                                <p className="text-3xl  font-bold  font-Playfair Display mb-5 ">
                                    Play your


                                    <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                        Vibe </span>



                                </p> </div>

                            {/* BUTTONS */}
                            <button
                                onClick={next}
                                className="btn-main flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                            >
                                <img src="/loginAvatars/mobile.png" className="w-6 h-6" alt="mobile" />
                                <span className="font-normal">Continue with Phone</span>
                            </button>

                            <button
                                className="btn-outline flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                            >
                                <img src="/loginAvatars/google.png" className="w-6 h-6" alt="google" />
                                <span className="font-normal">Continue with Google</span>
                            </button>

                            <button
                                className="btn-outline flex items-center justify-start gap-4 px-8 py-3 font-Poppins w-full"
                            >
                                <img src="/loginAvatars/facebook.png" className="w-6 h-6" alt="facebook" />
                                <span className="font-normal">Continue with Facebook</span>
                            </button>


                            {/* FOOTER */}
                            <p className="text-sm text-gray-400 mt-6 font-Poppins justify-center  text-center ">
                                Already Have an Account?{" "}
                                <span className="text-orange-400 cursor-pointer">
                                    Sign in
                                </span>
                            </p>
                        </div>
                    </div> </div>
            )}



            {/* ---------------- STEP 2 ---------------- */}
            {step === 2 && (
                <div className="min-h-screen text-center   bg-black text-white flex flex-col px-6 pt-10">

                    {/* BACK BUTTON */}
                    {/* <button
                            onClick={back}
                            className="w-8 h-8 flex items-center justify-center border border-cyan-400 text-cyan-400 rounded-md mb-16"
                        >
                            ←
                        </button> */}

                    {/* CONTENT */}
                    <div className="flex flex-col items-center text-center font-bold">

                        <h1 className="text-3xl flex font-Playfair Display mb-3">
                            Login With

                            <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Phone </span>


                        </h1>

                        <p className="text-gray-400 max-w-xs text-[16px] font-Poppins font-normal mb-10">
                            We'll need your phone number to send an OTP for verification.
                        </p>

                        {/* PHONE INPUT */}
                        <div className="w-full max-w-sm mb-12">

                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                                <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                    {/* FLAG */}
                                    <span className="mr-3 text-lg">🇮🇳</span>

                                    {/* CODE */}
                                    <span className="text-gray-400 mr-2">91+</span>

                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Phone number"
                                        className="bg-transparent flex-1 outline-none font-Poppins text-white"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* CONTINUE */}
                        <button
                            onClick={next}
                            className="w-full max-w-sm py-4 font-Poppins font-normal rounded-full  text-lg bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
                        >
                            Continue
                        </button>

                    </div>
                </div>
            )}


            {/* ---------------- STEP 3 ---------------- */}

            {step === 3 && (
                <div className="min-h-screen  bg-black font-bold text-white flex flex-col px-6 pt-14">

                    {/* TITLE */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl flex ml-16 font-Playfair Display mb-3">
                            Enter

                            <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Code </span>




                        </h1>

                        <p className="text-gray-400 text-sm font-Poppins font-normal ">
                            Please enter code we just send to
                        </p>

                        <p className="text-gray-300 text-sm">
                            +91 {phone || "99292 77633"}
                        </p>
                    </div>

                    {/* OTP BOXES */}
                    <div className="flex justify-center gap-4 mb-6">

                        {otp.map((o, i) => (
                            <div
                                key={i}
                                className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400"
                            >
                                <input
                                    value={o}
                                    onChange={(e) => handleOtp(e.target.value, i)}
                                    maxLength={1}
                                    className="w-12 h-12 bg-black text-center rounded-xl text-xl outline-none"
                                />
                            </div>
                        ))}

                    </div>

                    {/* TIMER */}
                    <p className="text-center text-sm text-gray-400 mb-14">
                        Enter the code within{" "}
                        <span className="text-red-500 font-semibold">00:30</span>
                    </p>

                    {/* VERIFY */}
                    <button
                        onClick={next}
                        className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
                    >
                        Verify
                    </button>

                    {/* RESEND */}
                    <p className="text-center text-sm mt-12 text-gray-400">
                        Didn’t receive OTP?
                        <span className="block text-white underline cursor-pointer mt-1">
                            Resend Code
                        </span>
                    </p>
                </div>
            )}

            {/* ---------------- STEP 4 ---------------- */}
            {step === 4 && (
                <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                    {/* TITLE */}
                    <div className="text-center mb-12 font-bold ">
                        <h1 className="text-3xl ml-10 flex font-Playfair Display mb-3">
                            Email
                            <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Address </span>



                        </h1>

                        <p className="text-gray-400 text-sm">
                            We'll need your email to stay in touch
                        </p>
                    </div>

                    {/* EMAIL INPUT */}
                    <div className="mb-14">

                        <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                            <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                {/* ICON */}
                                <span className="mr-3 text-gray-400">✉️</span>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="bg-transparent flex-1 outline-none text-white placeholder-gray-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* CONTINUE */}
                    <button
                        onClick={next}
                        className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] "
                    >
                        Continue
                    </button>
                </div>
            )}


            {/* ---------------- STEP 5 ---------------- */}
            {step === 5 && (
                <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                    {/* TITLE */}
                    <div className="text-center mb-12 font-bold ">
                        <h1 className="text-3xl flex ml-16 font-Playfair Display mb-3">
                            Enter

                            <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Code </span>

                        </h1>


                        <p className="text-gray-400 text-sm font-Poppins font-normal ">
                            Please enter code we just send to
                        </p>

                        <p className="text-gray-300 text-sm font-Poppins">
                            {email || "xyz@gmail.com"}
                        </p>
                    </div>

                    {/* OTP BOXES */}
                    <div className="flex justify-center gap-4 mb-6">

                        {otp.map((o, i) => (
                            <div
                                key={i}
                                className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400"
                            >
                                <input
                                    value={o}
                                    onChange={(e) => handleOtp(e.target.value, i)}
                                    maxLength={1}
                                    className="w-12 h-12 bg-black text-center rounded-xl text-xl outline-none"
                                />
                            </div>
                        ))}

                    </div>

                    {/* TIMER */}
                    <p className="text-center text-sm text-gray-400 mb-14">
                        Enter the code within{" "}
                        <span className="text-red-500 font-semibold">00:30</span>
                    </p>

                    {/* VERIFY */}
                    <button
                        onClick={next}
                        className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                    >
                        Verify
                    </button>

                    {/* RESEND */}
                    <p className="text-center text-sm mt-12 text-gray-400">
                        Didn’t receive OTP?
                        <span className="block text-white underline cursor-pointer mt-1">
                            Resend Code
                        </span>
                    </p>
                </div>
            )}


            {/* ---------------- STEP 6 ---------------- */}
            {step === 6 && (
                <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                    {/* TITLE */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-Playfair Display mb-3">
                            What’s Your Name?
                        </h1>

                        <p className="text-gray-400 text-sm">
                            We'll need your email to stay in touch
                        </p>
                    </div>

                    {/* NAME INPUT */}
                    <div className="mb-14">

                        <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                            <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                {/* ICON */}
                                <span className="mr-3 text-gray-400">👤</span>

                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full Name"
                                    className="bg-transparent flex-1 outline-none text-white placeholder-gray-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* CONTINUE */}
                    <button
                        className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                    >
                        Continue
                    </button>
                </div>
            )}

        </div>
        </>

    );
}





