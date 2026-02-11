"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const nostalgiaGames = [
  { name: "Gulli Danda", icon: "🏏" },
  { name: "Kancha", icon: "🪀" },
  { name: "Chain", icon: "🧍‍♂️" },
  { name: "Hide & Seek", icon: "🙈" },
  { name: "Hopscotch", icon: "🟦" },
  { name: "Blindfold", icon: "👀" },
  { name: "Dog & Bowl", icon: "🐕" },
  { name: "Antakshari", icon: "🎵" },
  { name: "Musical Chair", icon: "🪑" },
  { name: "Lagori", icon: "🪨" },
];

export default function NostalgiaGamePage() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(0); // 1 = select, 2 = confirm

  const toggleGame = (name) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((g) => g !== name);
      }

      if (prev.length === 3) {
        const copy = [...prev];
        copy.pop();
        return [...copy, name];
      }

      return [...prev, name];
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
              src="/Gif/nostalgiaGif.gif"
              alt="Sports Intro"
              className="w-[300px] md:w-[420px] object-contain z-10"
            />

            {/* Bottom Dark Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-black/90 to-transparent z-20" />

            {/* Text */}
            <div className="absolute bottom-10 text-center z-30">
              <h1 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
              Back to Gully 
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                Vibes
              </h2>
            </div>
          </div>
        )}


        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="text-center mb-10 space-y-4">
              <h1 className="text-white text-3xl md:text-4xl font-semibold">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Nostalgia
                </span>{" "}
                Games
              </h1>
              <p className="text-gray-400">
                Pick up to 3 childhood favorites
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {nostalgiaGames.map((game, i) => {
                const isActive = selected.includes(game.name);
                return (
                  <button
                    key={i}
                    onClick={() => toggleGame(game.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-black border-green-400 scale-[1.02]"
                          : "bg-[#050B14] border-green-500 text-white hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-500 hover:text-black hover:scale-[1.02]"
                      }`}
                  >
                    <span className="text-lg">{game.icon}</span>
                    <span className="text-sm md:text-base font-medium">
                      {game.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => {
                  setStep(2);
                  sessionStorage.setItem("nostalgia_step", "selected");
                }}
                disabled={selected.length < 3}
                className="px-10 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold hover:scale-105 transition disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="mb-10 text-center space-y-3">
              <h1 className="text-white text-3xl font-semibold">
                Your Selected Nostalgia Games
              </h1>
              <p className="text-gray-400">
                Choose one to continue
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selected.map((name, i) => {
                const game = nostalgiaGames.find(
                  (g) => g.name === name
                );
                return (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(
                        `/physical-questions/nostalgia-games/${name
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace("&", "and")}`
                      )
                    }
                    className="flex items-center gap-3 px-4 py-4 rounded-xl border border-green-400 text-white hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-500 hover:text-black transition"
                  >
                    <span className="text-lg">{game?.icon}</span>
                    <span className="text-base font-medium">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="text-green-400 underline"
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
