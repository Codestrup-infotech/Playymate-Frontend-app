

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
    dot: "bg-fuchsia-500",
  },
  {
    title: "Play. Connect. Learn.",
    highlight: ["Connect"],
    desc: "Build communities, join events, and meet your Playmates.",
    img: "/onboarding/2.png",
    border: "border-sky-500",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    dot: "bg-sky-500",
  },
  {
    title: "Live Your Journey",
    highlight: ["Live", "Journey"],
    desc: "",
    img: "/onboarding/3.png",
    border: "border-[#FF8319]",
    glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
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
        <img src="/playymate-icon.png" className="w-52" />
        <img src="/playymate-logo.png" className=" w-[500px] " />

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
            className={`w-full rounded-xl border p-3 text-left ${lang === l
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


import { useRouter } from "next/navigation";
function Slider() {
  const [i, setI] = useState(0);
  const router = useRouter();

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
                className={`h-3 w-3 rounded-full transition-all ${idx === i
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
                  setI(i + 1); 
                }
              }}
              className={`px-6 py-2 font-Poppins transition-all duration-300
                ${isLastSlide
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


