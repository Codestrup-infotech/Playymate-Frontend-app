"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    percent: 30,
    title: "Attendance style?",
    options: ["Occasionally", "Regularly"],
  },
  {
    percent: 60,
    title: "Group preference",
    options: ["Solo", "Small group"],
  },
 
];

export default function SocialEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = slides[step];

  // Go back to selected activities
  const goBackToSelectedActivities = () => {
    sessionStorage.setItem("activity_step", "selected");
    router.push("/physical-questions/activities");
  };

  const selectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [current.title]: opt }));
  };

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setStep(3); // finish screen
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative overflow-hidden">

        {/* Progress Circle */}
        {step < 3 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-14 h-14 rounded-full bg-black border-4 border-pink-500 flex items-center justify-center text-pink-500 font-bold">
              {slides[step].percent}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl p-6 shadow-2xl bg-black">
          {step < 3 ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-Poppins flex flex-col justify-center items-center text-center h-40">
                <h3 className="text-white text-sm mb-3 font-semibold">
                  SOCIAL EVENT
                </h3>

                <hr className="w-60 border-pink-300 mb-3" />

                <h2 className="text-white text-xl font-semibold">
                  {current.title}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mt-8">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectOption(opt)}
                    className={`w-full py-2 rounded-lg border transition
                      ${
                        answers[current.title] === opt
                          ? "bg-[#C60385] text-white font-Poppins"
                          : "border-[#C60385] text-white font-Poppins hover:bg-white/10"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Continue */}
              <button
                onClick={next}
                disabled={!answers[current.title]}
                className="mt-8 w-full py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-500 text-white disabled:opacity-40"
              >
                Continue
              </button>
            </>
          ) : (
            // Finish Screen
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center mb-4">
                <span className="text-3xl text-white">✓</span>
              </div>

              <h2 className="text-white text-3xl font-semibold mb-4">
                Preferences Saved Successfully
              </h2>

              <p className="text-gray-400 text-lg mb-6 font-Poppins">
                Your social event experience is now personalized.
              </p>

              <button
                onClick={goBackToSelectedActivities}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-Poppins"
              >
                Back to Your Selected Activities
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
