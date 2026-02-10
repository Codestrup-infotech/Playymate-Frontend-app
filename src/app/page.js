

"use client";

import { useEffect, useState } from "react";


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
    <div className="relative w-full xl:h-screen lg:h-screen h-full flex flex-col justify-center text-center items-center space-y-20 xl:space-y-0 lg:space-y-0 ">





      <div className="flex flex-col justify-center items-center space-y-2">
        <img src="/playymate-icon.png" className="xl:w-52 lg:w-52 w-40" />
        <img src="/playymate-logo.png" className=" xl:w-[500px] lg:w-[500px] w-96 " />

      </div>




      <div className="xl:absolute xl:bottom-12 lg:absolute lg:bottom-12 w-full flex justify-center px-6">
        <button
          onClick={onNext}
          className="w-full max-w-sm rounded-full bg-gradient-to-r 
          from-pink-500 to-orange-400 py-4 text-lg  font-Poppins "
        >
          Get Started
        </button>
      </div>

    </div>
  );
}



/* ---------------- LANGUAGE ---------------- */




const languages = [
  { name: "Arabic", code: "sa", flag: "https://flagcdn.com/w40/sa.png" },
  { name: "Spanish", code: "es", flag: "https://flagcdn.com/w40/es.png" },
  { name: "French", code: "fr", flag: "https://flagcdn.com/w40/fr.png" },
  { name: "German", code: "de", flag: "https://flagcdn.com/w40/de.png" },
  { name: "Hindi", code: "in", flag: "https://flagcdn.com/w40/in.png" },
  { name: "Korean", code: "kr", flag: "https://flagcdn.com/w40/kr.png" },
  { name: "Vietnamese", code: "vn", flag: "https://flagcdn.com/w40/vn.png" },
];


function Language({ onNext }) {
  


   const [lang, setLang] = useState("Hindi");
  const [search, setSearch] = useState("");

  const filtered = languages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=" py-16 ">

    




    <div className="min-h-screen bg-black flex items-center justify-center text-center">
      <div className="w-full max-w-sm">
        <h2 className="text-4xl  font-semibold  italic text-white font-Playfair Display py-6">
          Choose the language
        </h2>
        <p className="mt-1 text-md text-gray-400 font-Poppins">
          Select your preferred language below. This helps us serve you better.
        </p>

        {/* You Selected */}
        <div className="mt-6">
          <p className="text-md text-white  font-Poppins text-start mb-2">You Selected</p>

          <div className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]">
            <div className="flex items-center justify-between rounded-xl bg-[#0B0B0F] px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://flagcdn.com/w40/in.png"
                  alt="India"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-Poppins">{lang}</span>
              </div>
              <span className="text-pink-500">✔</span>
            </div>
          </div>
        </div>

        {/* All Languages */}
        <div className="mt-6">
          <p className="text-md text-white  font-Poppins text-start  mb-2">All Languages</p>

          <div className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] font-Poppins ">
            <div className="rounded-xl bg-[#0B0B0F] p-3 space-y-2 max-h-80 overflow-y-auto  custom-scrollbar">
              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full mb-2 rounded-lg bg-black px-3 py-2 text-sm text-white placeholder-gray-500 border border-white/10 focus:outline-none"
              />

              {filtered.map((l) => (
                <button
                  key={l.name}
                  onClick={() => setLang(l.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={l.flag}
                      alt={l.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm text-white font-Poppins">
                      {l.name}
                    </span>
                  </div>

                  <span
                    className={`w-4 h-4 rounded-full border ${
                      lang === l.name
                        ? "border-pink-500 bg-pink-500"
                        : "border-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>


      <button
        onClick={onNext}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins "
      >
        Continue
      </button>
    </div>
  );
}

/* ---------------- WELCOME ---------------- */

function Welcome({ onNext }) {
  return (
    <div className="  flex  mt-20  flex-col space-y-4 justify-center text-center items-center ">

      <div className="   ">
        <h1 className="text-4xl font-semibold  font-Playfair Display italic ">Welcome!</h1>
        <p className="mt-2 text-gray-300 max-w-xs font-Poppins ">
          Sports, fitness, fun, food, and friends together.
        </p>
      </div>

     
        <Rings />
     

      <div className="  w-full flex justify-center px-6 pb-10">
        <button
          onClick={onNext}
          className="w-full max-w-sm rounded-full bg-gradient-to-r font-Poppins 
          from-pink-500 to-orange-400 py-3 text-lg "
        >
          Get Started
        </button>
      </div>

    </div>
  );
}


// function Rings() {
//   const data = [
//     {
//       size: 480,
//       color: "#a855f7", // Purple
//       duration: "30s",
//       images: ["https://picsum.photos/id/102/60"],
//       type: "arc-75" // 75% of a circle
//     },
//     {
//       size: 400,
//       color: "#06b6d4", // Cyan
//       duration: "25s",
//       images: ["https://picsum.photos/id/103/60", "https://picsum.photos/id/104/60"],
//       type: "arc-50" // Half circle
//     },
//     {
//       size: 320,
//       color: "#eab308", // Yellow
//       duration: "20s",
//       images: ["https://picsum.photos/id/106/60"],
//       type: "arc-25" // Quarter circle
//     },
//     {
//       size: 240,
//       color: "#f97316", // Orange
//       duration: "15s",
//       images: ["https://picsum.photos/id/107/80"], // Larger center-ish image
//       type: "full"
//     },
//     {
//       size: 160,
//       color: "#ef4444", // Red
//       duration: "12s",
//       images: ["https://picsum.photos/id/108/40"],
//       type: "arc-50"
//     }
//   ];

//   return (
//     <>
//       <style>{`
//         @keyframes rotate-center {
//           from { transform: translate(-50%, -50%) rotate(0deg); }
//           to { transform: translate(-50%, -50%) rotate(360deg); }
//         }

//         .canvas {
//           position: relative;
//           width: 600px;
//           height: 600px;
//           display: flex;  
//           align-items: center;
//           justify-content: center;
//           background: #000; /* Dark background like your image */
//           overflow: hidden;
//         }

//         .ring-path {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           border-radius: 50%;
//           border: 2px solid transparent; /* Base is invisible */
//         }

//         /* Defining the "Cut" styles using border-sides */
//         .arc-75 { border-top-color: inherit; border-right-color: inherit; border-bottom-color: inherit; }
//         .arc-50 { border-top-color: inherit; border-left-color: inherit; }
//         .arc-25 { border-top-color: inherit; }
//         .full { border-color: inherit; opacity: 0.8; }

//         .orbiting-node {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           width: 50px;
//           height: 50px;
//           border-radius: 50%;
//           object-fit: cover;
//           border: 2px solid #000; /* Contrast ring around image */
//           background: #222;
//         }
//       `}</style>

//       <div className="canvas">
//         {data.map((ring, i) => (
//           <div
//             key={i}
//             className={`ring-path ${ring.type}`}
//             style={{
//               width: ring.size,
//               height: ring.size,
//               borderColor: ring.color,
//               animation: `rotate-center ${ring.duration} linear infinite`,
//               // Add variety by rotating the starting position of the "cut"
//               transform: `translate(-50%, -50%) rotate(${i * 45}deg)`
//             }}
//           >
//             {ring.images.map((src, idx) => {
//               // Position images along the path
//               const angle = (idx * 360) / ring.images.length;
//               const radius = ring.size / 2;

//               return (
//                 <img
//                   key={idx}
//                   src={src}
//                   alt="orbit"
//                   className="orbiting-node"
//                   style={{
//                     width: ring.size < 250 ? '80px' : '50px', // Matches your "main" soccer image size
//                     height: ring.size < 250 ? '80px' : '50px',
//                     transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`
//                   }}
//                 />
//               );
//             })}
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }


function Rings() {
  const data = [
    { size: 480, color: "#a855f7", duration: 30, images: ["https://picsum.photos/id/102/60"], segments: 3, gap: 30 },
    { size: 400, color: "#06b6d4", duration: 25, images: ["https://picsum.photos/id/103/60", "https://picsum.photos/id/104/60"], segments: 2, gap: 40 },
    { size: 320, color: "#eab308", duration: 20, images: ["https://picsum.photos/id/106/60"], segments: 3, gap: 50 },
    { size: 240, color: "#f97316", duration: 15, images: ["https://picsum.photos/id/107/80"], segments: 1, gap: 0 },
    { size: 160, color: "#ef4444", duration: 12, images: ["https://picsum.photos/id/108/40"], segments: 2, gap: 30 }
  ];

  return (
    <>
      <style>{`
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .canvas {
          position: relative;
          width: 600px;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          overflow: hidden;
        }

        .ring-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          animation: rotate linear infinite;
          border-radius: 50%;
          pointer-events: none;
        }

        .orbit-img {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 2px solid #000;
          object-fit: cover;
          background: #222;
        }
      `}</style>

      <div className="canvas">
        {data.map((ring, i) => {
          const r = ring.size / 2;
          const circumference = 2 * Math.PI * (r - 6);
          const dash = ring.segments === 1
            ? "none"
            : `${(circumference / ring.segments) - ring.gap} ${ring.gap}`;

          return (
            <div
              key={i}
              className="ring-wrap"
              style={{
                width: ring.size,
                height: ring.size,
                animationDuration: `${ring.duration}s`
              }}
            >
              {/* TRUE CIRCLE RING */}
              <svg
                width={ring.size}
                height={ring.size}
                viewBox={`0 0 ${ring.size} ${ring.size}`}
              >
                <circle
                  cx={r}
                  cy={r}
                  r={r - 6}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth="4"
                  strokeDasharray={dash}
                  strokeLinecap="round"
                />
              </svg>

              {/* ORBITING IMAGES */}
              {ring.images.map((src, idx) => {
                const angle = (idx * 360) / ring.images.length;

                return (
                  <img
                    key={idx}
                    src={src}
                    className="orbit-img"
                    style={{
                      width: ring.size < 250 ? 80 : 50,
                      height: ring.size < 250 ? 80 : 50,
                      transform: `
                        rotate(${angle}deg)
                        translateX(${r}px)
                        rotate(-${angle}deg)
                      `
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}










import { useRouter } from "next/navigation";
import axios from "axios";

/* ---------- FRONTEND UI CONFIG (NO IMAGES HERE) ---------- */
const slideUI = [
  {
    title: "From Virtual to Reality.",
    highlight: ["Virtual", "Reality"],
    desc: "Turn your interests into real experiences.",
    border: "border-fuchsia-500",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
    dot: "bg-fuchsia-500",
  },
  {
    title: "Play. Connect. Learn.",
    highlight: ["Connect"],
    desc: "Build communities, join events, and meet your Playmates.",
    border: "border-sky-500",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    dot: "bg-sky-500",
  },
  {
    title: "Live Your Journey",
    highlight: ["Live", "Journey"],
    desc: "",
    border: "border-[#FF8319]",
    glow: "shadow-[0_0_25px_rgba(255,131,25,0.7)]",
    dot: "bg-[#FF8319]",
  },
  {
    title: "Grow Your Skills",
    highlight: ["Grow", "Skills"],
    desc: "",
    border: "border-[#4839FF]",
    glow: "shadow-[0_0_25px_rgba(72,57,255,0.7)]",
    dot: "bg-[#4839FF]",
  },
  {
    title: "Build Your Playymate",
    highlight: ["Playymate"],
    desc: "Let’s get moving.",
    border: "border-[#99DDFF]",
    glow: "shadow-[0_0_25px_rgba(153,221,255,0.7)]",
    dot: "bg-[#99DDFF]",
  },
];

 function Slider() {
  const [slides, setSlides] = useState([]);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ---------- FETCH IMAGES FROM BACKEND ---------- */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("https://api.yourbackend.com/onboarding-images");
        // Example backend response:
        // [{ img: "https://api.../1.png" }, { img: "https://api.../2.png" }]

        const finalSlides = slideUI.map((ui, index) => ({
          ...ui,
          img: res.data?.[index]?.img || "/onboarding/fallback.png",
        }));

        setSlides(finalSlides);
      } catch (error) {
        console.log("Failed to load images", error);

        // If API fails, still show UI with fallback images
        const fallbackSlides = slideUI.map((ui) => ({
          ...ui,
          img: "/onboarding/fallback.png",
        }));

        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  /* ---------- TITLE HIGHLIGHT ---------- */
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading onboarding...
      </div>
    );
  }

  const isLastSlide = i === slides.length - 1;
  const isFinalPage = i === slides.length;
  const totalScreens = slides.length + 1;

  return (
    <main className="xl:min-h-screen py-4 lg:min-h-screen bg-black flex items-center justify-center">
      <div className="w-[450px] text-white">

        {/* SLIDER */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {/* Slides */}
            {slides.map((s, idx) => (
              <div key={idx} className="min-w-full text-center px-4">
                <div
                  className={`mx-auto xl:w-[280px] xl:h-[380px] lg:w-[280px] lg:h-[380px] rounded-3xl border-2 overflow-hidden ${s.border} ${s.glow}`}
                >
                  <img
                    src={s.img}
                    alt="slide"
                    className="h-full w-full object-cover"
                  />
                </div>

                <h2 className="mt-6 font-Playfair text-2xl font-semibold">
                  {renderTitle(s.title, s.highlight)}
                </h2>

                <p className="mt-2 text-gray-300 font-Poppins">
                  {s.desc}
                </p>
              </div>
            ))}

            {/* FINAL PAGE */}
            <div className="min-w-full text-center px-4 flex flex-col justify-center items-center">
            <div className="min-w-full text-center px-4 flex flex-col justify-center items-center">
              <img
                src="/playymate-icon.png"
                alt="icon"
                className="h-1 mb-4"
              />

              <div className="mx-auto w-[370px] h-[400px] rounded-3xl border-2 border-purple-500 shadow-xl shadow-purple-500/30  p-6 flex flex-col items-center justify-center"
              
               style={{
          background:
            "radial-gradient(circle at center, #000000, #000000, #000000, #140521, #140521)",
        }}
              
              >
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
                  className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 text-white  font-Poppins "
                >
                  Get Started
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* DOTS */}
        {!isFinalPage && (
          <div className="flex justify-center gap-3 mt-4">
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

        {/* NEXT / GET STARTED */}
        {!isFinalPage && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                if (i < totalScreens - 1) setI(i + 1);
              }}
              className={`px-6 py-2 font-Poppins transition-all duration-300 ${
                isLastSlide
                  ? "rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-400/40"
                  : "rounded-xl bg-[#140521] text-[#FF94F6]"
              }`}
            >
              {isLastSlide ? "Get Started" : "Next"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}



