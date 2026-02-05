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

/* ---------------- SLIDES ---------------- */

const slides = [
  {
    title: "From Virtual to Reality.",
    highlight: "Reality.",
    desc: "Turn your interests into real experiences.",
    img: "onboarding/1.png",
    border: "border-fuchsia-500",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
    dot: "bg-fuchsia-500",
  },
  {
    title: "Play. Connect. Learn.",
    highlight: "Learn",
    desc: "Build communities, join events, and meet your Playmates.",
    img: "onboarding/2.png",
    border: "border-sky-500",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    dot: "bg-sky-500",
  },
  {
    title: "Live Your Journey",
    highlight: "Journey",
    desc: "",
    img: "onboarding/3.png",
    border: "border-[#FF8319]",
    glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
    dot: "bg-[#FF8319]",
  },
];

/* ---------------- MAIN ---------------- */

export default function OnboardingFlow() {
  const [step, setStep] = useState(0); // 0=language,1=welcome,2=slider
  const [slideIndex, setSlideIndex] = useState(0);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      {step === 0 && <Language onNext={() => setStep(1)} />}

      {step === 1 && <Welcome onNext={() => setStep(2)} />}

      {step === 2 && (
        <Slider
          i={slideIndex}
          setI={setSlideIndex}
          onFinish={() => alert("Done onboarding 🎉")}
        />
      )}

    </main>
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
    <div className="relative w-full h-screen">

      <div className="absolute top-14 left-10">
        <h1 className="text-4xl font-semibold">Welcome!</h1>
        <p className="mt-2 text-gray-300 max-w-xs">
          Sports, fitness, fun, food, and friends together.
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Rings />
      </div>

      <div className="absolute bottom-12 w-full flex justify-center px-6">
        <button
          onClick={onNext}
          className="w-full max-w-md rounded-full bg-gradient-to-r 
          from-pink-500 to-orange-400 py-4 text-lg font-semibold"
        >
          Get Started
        </button>
      </div>

    </div>
  );
}

/* ---------------- RINGS ---------------- */

function Rings() {
  const data = [
    { size: 520, color: "border-fuchsia-500", speed: "animate-spin-slow" },
    { size: 420, color: "border-sky-400", speed: "animate-spin-slower" },
    { size: 320, color: "border-yellow-400", speed: "animate-spin-slow" },
  ];

  return (
    <div className="relative w-[520px] h-[520px]">
      {data.map((c, i) => (
        <div
          key={i}
          className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 
          rounded-full border-2 ${c.color} ${c.speed}`}
          style={{ width: c.size, height: c.size }}
        />
      ))}
    </div>
  );
}

/* ---------------- SLIDER ---------------- */

function Slider({ i, setI, onFinish }) {
  const s = slides[i];

  return (
    <div className="px-4 w-[311px] text-center flex flex-col">

      {/* Image */}
      <div
        className={`mx-auto overflow-hidden rounded-3xl border-2 
        ${s.border} ${s.glow} h-[400px] w-[311px]`}
      >
        <img
          src={s.img}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Text */}
      <div className="mt-6 h-[96px] flex flex-col justify-center">
        <h2 className="text-2xl font-semibold">
          {s.title.split(s.highlight)[0]}
          <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            {s.highlight}
          </span>
        </h2>
        <p className="mt-2 text-gray-300">{s.desc}</p>
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2.5 w-2.5 rounded-full ${
              idx === i ? `${s.dot}` : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (i === slides.length - 1) onFinish();
            else setI(i + 1);
          }}
          className="rounded-xl bg-[#2C1029] px-5 py-2 text-[#FF94F6]"
        >
          {i === slides.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

    </div>
  );
}

