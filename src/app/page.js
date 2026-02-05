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

"use client";
import { useState } from "react";

const slides = [
  {
    title: "From Virtual to Reality.",
    highlight: "Reality.",
    desc: "Turn your interests into real experiences.",
    img: "onboarding/1.png",
    border: "border-fuchsia-500",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-fuchsia-500",
  },
  {
    title: "Play. Connect. Learn.",
    highlight: "Learn",
    desc: "Build communities, join events, and meet your  Playmates.",
    img: "onboarding/2.png",
    border: "border-sky-500",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-sky-500",
  },
  {
    title: "Live Your Journey",
    highlight: "Journey",
    desc: "",
    img: "onboarding/3.png",
    border: "border-[#FF8319]",
    glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#FF8319]",
  },
  {
    title: "Grow Your Skills",
    highlight: "Skills",
    desc: "",
    img: "onboarding/4.png",
    border: "border-[#4839FF]",
    glow: "shadow-[0_0_25px_rgba(72,57,255,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#4839FF]",
  },
  {
    title: "Build Your Playymate",
    highlight: "Playymate",
    desc: "Personalize your experience your way.",
    img: "onboarding/5.png",
    border: "border-[#99DDFF]",
    glow: "shadow-[0_0_25px_rgba(153,221,255,0.7)]",
    btn: "bg-[#2C1029]",
    dot: "bg-[#99DDFF]",
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const s = slides[i];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="  px-4 w-[311px] text-center text-white">
        {/* Image Card */}
        <div
          className={`relative mx-auto overflow-hidden rounded-3xl border-2 ${s.border} ${s.glow}`}
        >
          <img
            src={s.img}
            alt="Onboarding"
            className="h-[400px]  w-[311px]"
          />
        </div>

        {/* Title */}
        <h2 className="mt-6 font-Playfair Display  text-2xl font-semibold">
          {s.title.split(s.highlight)[0]}
          <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            {s.highlight}
          </span>
        </h2>

        {/* Description */}
        <p className="mt-2 text-[16x] font-normal text-gray-300 font-Poppins  ">{s.desc}</p>

        {/* Dots (clickable) */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                idx === i ? `${item.dot} ring-4 ring-white/30` : "bg-gray-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next / Get Started Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() =>
              setI((prev) => Math.min(prev + 1, slides.length - 1))
            }
            className={`rounded-xl bg-gradient-to-r ${s.btn} px-5 py-2 text-[16px] text-[#FF94F6] font-Poppins `}
          >
            {i === slides.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}
