"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    percent: 30,
    title: "Gymnastics experience level",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    percent: 60,
    title: "Training frequency",
    options: [
      "Occasionally",
      "2–3 times a week",
      "Regular (4+ times a week)",
    ],
  },
  {
    percent: 100,
    title: "Gymnastics focus",
    options: [
      "Flexibility",
      "Strength & balance",
      "Full routine training",
    ],
  },
];

export default function GymnasticsPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = slides[step];

  const selectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [current.title]: opt }));
  };

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
  localStorage.setItem("clicked-hobbies", "gymnastics");
router.back();

  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative overflow-hidden">

        {step < 3 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-14 h-14 rounded-full bg-black border-4 border-green-400 flex items-center justify-center text-green-400 font-bold">
              {slides[step].percent}
            </div>
          </div>
        )}

        <div className="rounded-3xl p-6 shadow-2xl bg-black">
          {step < 3 ? (
            <>
              <div className="bg-blue-500 rounded-2xl flex flex-col justify-center items-center text-center h-40">
                <h3 className="text-white text-sm mb-4 font-semibold">
                  🤸 GYMNASTICS
                </h3>

                <hr className="w-60 border-sky-400 py-2" />

                <h2 className="text-white text-xl font-semibold mb-6">
                  {current.title}
                </h2>
              </div>

              <div className="space-y-3 mt-8">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectOption(opt)}
                    className={`w-full py-2 rounded-lg border transition
                      ${
                        answers[current.title] === opt
                          ? "bg-[#2468B6] text-white"
                          : "border-[#C60385] text-white hover:bg-white/10"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={next}
                disabled={!answers[current.title]}
                className="mt-8 w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white disabled:opacity-40"
              >
                Continue
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
