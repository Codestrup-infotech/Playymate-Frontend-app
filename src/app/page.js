"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onboardingService } from "@/services/onboarding";

export default function OnboardingFlow() {
  const [screens, setScreens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch onboarding screens from API
  useEffect(() => {
    const fetchScreens = async () => {
      try {
        setLoading(true);
        const response = await onboardingService.getScreens();
        const data = response.data.data;

        // Filter active screens and sort by order
        const activeScreens = data.screens
          .filter((screen) => screen.status === "active")
          .sort((a, b) => a.order - b.order);

        setScreens(activeScreens);
      } catch (err) {
        console.error("Failed to fetch onboarding screens:", err);
        setError(err.message || "Failed to load onboarding screens");
      } finally {
        setLoading(false);
      }
    };

    fetchScreens();
  }, []);

  // Handle navigation
  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/login");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/playymate-icon.png"
            alt="Playmate"
            className="w-16 h-16 animate-pulse"
          />
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No screens
  if (screens.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>No onboarding screens available</p>
      </div>
    );
  }

  const currentScreen = screens[currentIndex];
  // const progress = ((currentIndex + 1) / screens.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress Bar */}
      {/* <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div> */}

      {/* Dynamic Screen Renderer */}
      <ScreenRenderer
        screen={currentScreen}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={currentIndex === 0}
        isLast={currentIndex === screens.length - 1}
        screens={screens}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}

// Dynamic Screen Renderer Component
function ScreenRenderer({ screen, onNext, onBack, isFirst, isLast, screens, currentIndex, setCurrentIndex }) {
  const { type, title, subtitle, image_url, cta, options, is_skippable } = screen;

  // Get marketing screens for slider functionality
  const marketingScreens = screens?.filter(s => s.type === "marketing") || [];
  const currentMarketingIndex = marketingScreens.findIndex(s => s._id === screen._id);
  const isLastMarketing = currentMarketingIndex === marketingScreens.length - 1;

  switch (type) {
    case "splash":
      return (
        <div className="flex flex-col items-center justify-center text-center min-h-screen px-4">

          {/* IMAGE + LOGO */}
          <div className="flex flex-col items-center  mb-14">
            <img
              src={image_url || "/playymate-icon.png"}
              alt={title || "Playmate"}
              className="h-32"
            />

            {title && (
              <img
                src="/playymate-logo.png"
                alt={title}
                className="w-40 object-contain"
              />
            )}
          </div>

          {/* CTA BUTTON */}
          {cta && (
            <button
              onClick={onNext}
              className=" lg:w-full lg:max-w-sm w-60 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 text-lg font-Poppins text-white shadow-md"
            >
              {cta.text}
            </button>
          )}
        </div>
      );

    case "language":
      // Handle language screen - either with options from API or generic list
      const languages = options && options.length > 0 ? options : [
        { value: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
        { value: "es", label: "Spanish", flag: "https://flagcdn.com/w40/es.png" },
        { value: "fr", label: "French", flag: "https://flagcdn.com/w40/fr.png" },
        { value: "de", label: "German", flag: "https://flagcdn.com/w40/de.png" },
        { value: "hi", label: "Hindi", flag: "https://flagcdn.com/w40/in.png" },
        { value: "ar", label: "Arabic", flag: "https://flagcdn.com/w40/sa.png" },
        { value: "zh", label: "Chinese", flag: "https://flagcdn.com/w40/cn.png" },
        { value: "ja", label: "Japanese", flag: "https://flagcdn.com/w40/jp.png" },
        { value: "ko", label: "Korean", flag: "https://flagcdn.com/w40/kr.png" },
      ];
      const [selectedLang, setSelectedLang] = useState(
        languages[0]?.value || "en"
      );
      const [search, setSearch] = useState("");

      const filtered = languages.filter((l) =>
        l.label.toLowerCase().includes(search.toLowerCase())
      );

      return (
        <div className="">
          <div className="min-h-screen bg-black flex items-center justify-center text-center">
            <div className="w-80 ">
              <h2 className="text-3xl font-semibold italic text-white font-Playfair Display py-1">
                {title || "Choose the language"}
              </h2>
              <p className="mt-1 text-sm text-gray-400 font-Poppins">
                {subtitle || "Select your preferred language below."}
              </p>

              {/* Selected Language */}
              <div className="mt-4">
                <p className="text-md text-white font-Poppins text-start mb-2">
                  You Selected
                </p>
                <div className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#B601FD]">
                  <div className="flex items-center justify-between rounded-xl bg-[#0B0B0F] px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          languages.find((l) => l.value === selectedLang)
                            ?.flag || "https://flagcdn.com/w40/us.png"
                        }
                        alt={selectedLang}
                        className="w-6 h-6 rounded-full "
                      />
                      <span className="text-white text-[14px] font-Poppins">
                        {languages.find((l) => l.value === selectedLang)?.label || selectedLang}
                      </span>
                    </div>
                    <span className="text-pink-500">✔</span>
                  </div>
                </div>
              </div>

              {/* All Languages */}
              <div className="mt-6">
                <p className="text-md text-white font-Poppins text-start mb-2">
                  All Languages
                </p>
                <div className=" rounded-xl  border border-[#BA01FD] font-Poppins">
                  <div className=" rounded-xl p-1  font-Poppins">
                    <div className="rounded-xl bg-[#000000] space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full mb-2 sticky top-0 bottom-0   bg-black px-3 py-2 text-sm text-white placeholder-gray-500 border border-b-white/10 border-t-0 border-l-0 border-r-0 focus:outline-none"
                      />
                      {filtered.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => setSelectedLang(l.value)}
                          className="w-full flex items-center justify-between  px-3 py-2 rounded-lg hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={l.flag}
                              alt={l.label}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-sm text-white font-Poppins">
                              {l.label}
                            </span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border ${selectedLang === l.value
                                ? "border-pink-500 bg-pink-500"
                                : "border-white/20"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div></div>
              </div>

              <div className="mt-6 flex gap-4">
                {!isFirst && (
                  <button
                    onClick={onBack}
                    className="flex-1 py-3 rounded-full border border-gray-700 text-gray-400 font-Poppins hover:bg-gray-900"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={onNext}
                  className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins"
                >
                  {cta?.text || "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case "intro": {
      const data = [
        {
          size: 350,
          color: "#a855f7",
          duration: 30,
          startAngle: -30,
          images: [
            { src: "https://picsum.photos/id/102/60", angleOffset: 0 },
            { src: "https://picsum.photos/id/110/60", angleOffset: 120 },
            { src: "https://picsum.photos/id/112/60", angleOffset: 240 },
          ],
          segments: 3,
          gap: 30
        },
        {
          size: 280,
          color: "#06b6d4",
          duration: 25,
          startAngle: 60,
          images: [
            { src: "https://picsum.photos/id/103/60", angleOffset: 0 },
            { src: "https://picsum.photos/id/104/60", angleOffset: 180 }
          ],
          segments: 2,
          gap: 40
        },
        {
          size: 220,
          color: "#eab308",
          duration: 20,
          startAngle: -80,
          images: [{ src: "https://picsum.photos/id/106/60", angleOffset: 0 }],
          segments: 3,
          gap: 50
        },
        {
          size: 160,
          color: "#f97316",
          duration: 15,
          startAngle: 45,
          images: [{ src: "https://picsum.photos/id/107/80", angleOffset: 0 }],
          segments: 1,
          gap: 0
        },
        {
          size: 110,
          color: "#ef4444",
          duration: 12,
          startAngle: 150,
          images: [{ src: "https://picsum.photos/id/108/40", angleOffset: 0 }],

          segments: 2,
          gap: 30
        }
      ];

      return (
        <div className="flex flex-col space-y-4 justify-center text-center items-center pt-9 ">
          <div className="">
            <h1 className="text-4xl font-semibold italic">
              {title || "Welcome!"}
            </h1>
            {subtitle && (
              <p className="mt-2 text-white/80 max-w-xs mx-auto font-Poppins ">
                {subtitle}
              </p>
            )}
          </div>

          <style>{`
        @keyframes rotate-main {
          from { transform: translate(-50%, -50%) rotate(var(--start-angle,0deg)); }
          to   { transform: translate(-50%, -50%) rotate(calc(var(--start-angle,0deg) + 360deg)); }
        }

        @keyframes counter-rotate {
          from { transform: rotate(calc(var(--start-angle,0deg) * -1)); }
          to   { transform: rotate(calc(var(--start-angle,0deg) * -1 - 360deg)); }
        }

        .canvas {
          position: relative;
          width: 350px;
          height: 350px;
          margin: 20px 0;
        }

        .ring-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          animation: rotate-main linear infinite;
          pointer-events: none;
        }

        .orbit-img-box {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          animation: counter-rotate linear infinite;
        }

        .orbit-img {
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>

          <div className="canvas">
            {data.map((ring, idx) => {

              const r = ring.size / 2;
              const circumference = 2 * Math.PI * (r - 6);

              const dash =
                ring.segments === 1
                  ? "none"
                  : `${circumference / ring.segments - ring.gap} ${ring.gap}`;

              const imgSize = ring.size < 200 ? 45 : 35;

              return (
                <div
                  key={idx}
                  className="ring-wrap"
                  style={{
                    width: ring.size,
                    height: ring.size,
                    animationDuration: `${ring.duration}s`,
                    "--start-angle": `${ring.startAngle}deg`,
                    zIndex: idx + 1
                  }}
                >

                  <svg width={ring.size} height={ring.size} viewBox={`0 0 ${ring.size} ${ring.size}`}>
                    <circle
                      cx={r}
                      cy={r}
                      r={r - 6}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="3"
                      strokeDasharray={dash}
                      strokeLinecap="round"
                    />
                  </svg>

                  {ring.images.map((img, imgIdx) => (
                    <div
                      key={imgIdx}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 0,
                        height: 0,
                        transform: `rotate(${img.angleOffset}deg)`
                      }}
                    >
                      <div
                        className="orbit-img-box"
                        style={{
                          width: imgSize,
                          height: imgSize,
                          top: -(r - 6) - imgSize / 2,
                          animationDuration: `${ring.duration}s`,
                          "--start-angle": `${ring.startAngle + img.angleOffset}deg`
                        }}
                      >
                        <img
                          src={img.src}
                          alt=""
                          className="orbit-img"
                          style={{ width: imgSize, height: imgSize }}
                        />
                      </div>
                    </div>
                  ))}

                </div>
              );
            })}
          </div>

          <div className=" flex justify-center px-6 pb-10 gap-4 font-Poppins font-normal ">
            {!isFirst && (
              <button
                onClick={onBack}
                className="px-10 py-3  rounded-full border border-gray-700 text-gray-400"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex-1 px-9 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 text-white"
            >
              {cta?.text || "Get Started"}
            </button>
          </div>
        </div>
      );
    }

    case "marketing": {
      const COLORS = [
        {
          border: "border-fuchsia-500",
          shadow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]",
          gradient: "from-fuchsia-400 to-pink-500",
        },
        {
          border: "border-sky-500",
          shadow: "shadow-[0_0_25px_rgba(56,189,248,0.7)]",
          gradient: "from-sky-400 to-blue-500",
        },
        {
          border: "border-emerald-500",
          shadow: "shadow-[0_0_25px_rgba(16,185,129,0.7)]",
          gradient: "from-emerald-400 to-cyan-500",
        },
        {
          border: "border-amber-500",
          shadow: "shadow-[0_0_25px_rgba(251,191,36,0.7)]",
          gradient: "from-amber-400 to-orange-500",
        },
      ];

      // Use marketing screens only for slider dots
      const slideUI = marketingScreens;
      const color = COLORS[currentMarketingIndex % COLORS.length];

      // Title highlight logic
      const words = (title || "").split(" ");
      let highlightIdx = [];
      if (currentMarketingIndex % 3 === 0) highlightIdx = [0];
      else if (currentMarketingIndex % 3 === 1) highlightIdx = [1, 3];
      else highlightIdx = [0, 2];

      return (
        <div className="relative  py-10 flex flex-col justify-center items-center text-center px-4">

          {/* Image Card */}
          <div
            className={`w-[250px] h-[316px] rounded-3xl border-2 ${color.border} ${color.shadow} overflow-hidden`}
          >
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title */}
          <h2 className="mt-6 text-2xl font-semibold font-Playfair text-white leading-tight">
            {words.map((w, idx) =>
              highlightIdx.includes(idx) ? (
                <span
                  key={idx}
                  className={`mx-1 bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}
                >
                  {w}
                </span>
              ) : (
                <span key={idx} className="mx-1">
                  {w}
                </span>
              )
            )}
          </h2>

          {/* Subtitle */}
          <p className="mt-2 text-gray-300 font-Poppins">
            {subtitle}
          </p>

          {/* Dot Slider */}
          <div className="absolute bottom-32 flex gap-3">
            {slideUI.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const nextScreenIndex = screens.findIndex(
                    (s) => s._id === slideUI[idx]._id
                  );
                  setCurrentIndex(nextScreenIndex);
                }}
                className={`transition-all duration-300 ${idx === currentMarketingIndex
                    ? "w-12 h-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
                    : "w-3 h-3 rounded-full bg-gray-700 hover:bg-gray-600"
                  }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-20 flex gap-4 w-full max-w-sm">
            {!isFirst && (
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-full border border-gray-700 text-gray-400 font-Poppins hover:bg-gray-900"
              >
                Back
              </button>
            )}

            <button
              onClick={onNext}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins"
            >
              {isLastMarketing ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      );
    }

    case "cta":
      // Final CTA screen - not skippable
      return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-6">

          {image_url && (
            <img
              src={image_url}
              alt={title}
              className="w-64 h-64 object-cover rounded-2xl mb-8"
            />
          )}

          <div
            className="mx-auto lg:w-[370px] lg:h-[400px] rounded-3xl border-2 border-purple-500 shadow-xl shadow-purple-500/30 p-6 flex flex-col items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at center, #000000, #000000, #000000, #140521, #140521)",
            }}
          >
            <h2 className="font-Playfair lg:text-[30px] text-[25px] font-bold mb-4">
              {title &&
                title.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className={
                      index === 3
                        ? "bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
                        : ""
                    }
                  >
                    {word + " "}
                  </span>
                ))}
            </h2>

            {subtitle && (
              <p className="text-gray-300 text-sm lg:mb-10 mb-5 font-Poppins">
                {subtitle}
              </p>
            )}

            <div className="flex gap-4 w-full justify-center">

              <button
                onClick={onNext}
                className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 text-white font-Poppins font-semibold"
              >
                {cta?.text || "Get Started"}
              </button>
            </div>
          </div>

        </div>

      );

    case "onboarding":
      return (
        <div className="relative lg:w-full lg:h-screen flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
          <div className="relative z-10 lg:w-full lg:h-full flex flex-col items-center">
            <div className="lg:w-full lg:h-[60vh] flex items-center justify-center">
              <div className="relative w-full lg:max-w-md p-8">
                {image_url && (
                  <img
                    src={image_url}
                    alt={title}
                    className="w-full mb-8 rounded-xl "
                  />
                )}
                <h2 className="text-3xl font-bold text-white font-Poppins mb-4">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-gray-300 font-Poppins text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="absolute bottom-32 flex gap-3">
              {Array.from({ length: screens?.length || 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                      ? "w-12 bg-gradient-to-r from-pink-500 to-orange-400"
                      : "bg-gray-700"
                    }`}
                />
              ))}
            </div>
            <div className="absolute bottom-12 w-full flex justify-center px-6 gap-4">
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="px-6 py-3 rounded-full border border-gray-700 text-gray-400 font-Poppins hover:bg-gray-900"
                >
                  Back
                </button>
              )}
              {isLast ? (
                <button
                  onClick={onNext}
                  className="flex-1 max-w-xs rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins font-semibold text-white shadow-lg hover:shadow-pink-500/30"
                >
                  {cta?.text || "Get Started →"}
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 max-w-xs rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins font-semibold text-white shadow-lg hover:shadow-pink-500/30"
                >
                  {cta?.text || "Next"}
                </button>
              )}
            </div>
          </div>
        </div>
      );

    default:
      // Generic fallback for unknown types
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
          {image_url && (
            <img src={image_url} alt={title} className=" mb-8  h-96 w-72  border-2 border-[#D946EF] shadow-md shadow-[#D946EF] rounded-2xl " />
          )}
          {title && <h1 className="text-3xl font-bold mb-4">{title}</h1>}
          {subtitle && (
            <p className="text-gray-400 mb-8 text-center">{subtitle}</p>
          )}
          <div className="flex gap-4 w-full max-w-sm">
            {!isFirst && (
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-full border border-gray-700 font-Poppins hover:bg-gray-900"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-Poppins"
            >
              {cta?.text || "Next"}
            </button>
          </div>
        </div>
      );
  }
}

