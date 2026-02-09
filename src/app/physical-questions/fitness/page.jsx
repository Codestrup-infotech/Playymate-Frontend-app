"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    percent: 30,
    title: "Current Fitness Level",
    options: [
      "Beginner",
      "Intermediate",
      "Advanced",
    
    ],
   
  },
  {
    percent: 60,
    title: "Workout Frequency",
    options: [
      "I do not exercise",
      "1–2 days per week",
      "3–4 days per week",
      "1–3 days per week",
    ],
  
  },
  {
    percent: 100,
    title: "Do you have any medical conditions?",
    options: ["Yes", "No"],
   
  },
   {
    percent: 60,
    title: "If Yes, please select applicable conditions",
    options: [
      "High / Low Blood Pressure",
      "Diabetes",
      "Heart Condition",
      "Other",
    ],
  
  },
 {
    percent: 100,
    title: "Are you currently taking any medication?",
    options: ["Yes", "No"],
   
  },

];

export default function FitnessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = slides[step];


  // After "Preferences Saved Successfully"
const goBackToSelectedSports = () => {
  sessionStorage.setItem("pq_step", "selected");  // remember Step 2
  router.push("/physical-questions");
};


  const selectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [current.title]: opt }));
  };

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setStep(5); // finish screen
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative overflow-hidden ">

        {/* Progress Circle */}
        {step < 5 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 ">
            <div className="w-14 h-14 rounded-full bg-black border-4 border-green-400 flex items-center justify-center text-green-400 font-bold">
              {slides[step].percent}
            </div>
          </div>
        )}

        {/* Card */}
        <div
          className={`rounded-3xl p-6  shadow-2xl bg-gradient-to-br ${
            step < 5 ? current.color : "from-black to-black "
          }`}
        >
          {step < 5 ? (
            <>

<div className="bg-blue-500 rounded-2xl font-Poppins flex flex-col justify-center items-center text-center h-40  ">

              <h3 className="text-white text-sm mb-4 font-semibold">💪️ FITNESS</h3>

<hr className="w-60  border-sky-400 py-2" />

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
                          ? "bg-[#2468B6] text-white font-Poppins"
                          : "border-[#C60385] font-Poppins shadow-2xl text-white hover:bg-white/10"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={next}
                disabled={!answers[current.title]}
                className="mt-8 w-full py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-500 text-white font-normal disabled:opacity-40"
              >
                Continue
              </button>
            </>
          ) : (
            // Finish Screen
            <div className="flex flex-col items-center justify-center h-80 text-center   ">
              <div className="w-16 h-16 rounded-full bg-[#cbcdcf] flex items-center justify-center mb-4">
                <span className="text-4xl font-bold  text-white ">✓</span>
              </div>
              <h2 className="text-white text-4xl font-semibold   mb-4 ">
                Preferences Saved Successfully
              </h2>
              <p className="text-gray-400 text-lg mb-6 font-Poppins ">
                Your experience is now personalized for you.
              </p>

           <button
  onClick={goBackToSelectedSports}
  className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-Poppins font-normal"
>
  Back to Your Selected Sports
</button>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}
