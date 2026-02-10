"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    title: "Personal & Life Stage",
    sections: [
      {
        question: "What is your relationship status?",
        options: ["Single", "Married", "Prefer not to say"],
      },
      {
        question: "How would you describe your current lifestyle stage?",
        options: [
          "Student life",
          "Early career",
          "Established professional",
          "Business-focused",
          "Family-focused",
        ],
      },
    ],
  },
  {
    title: "Community & Social Participation",
    sections: [
      {
        question: "Are you part of any communities or groups?",
        options: [
          "Sports clubs",
          "Fitness groups",
          "Professional communities",
          "College alumni groups",
          "Local society / housing groups",
          "Online communities",
          "Other",
        ],
      },
      {
        question: "Are you involved in volunteering or social work?",
        options: ["Yes", "Occasionally", "Not currently"],
      },
    ],
  },
  {
    title: "Political & Social Awareness",
    sections: [
      {
        question:
          "Are you interested in political or civic discussions?",
        options: ["Yes", "Sometimes", "Not interested"],
      },
      {
        question:
          "How closely do you follow political or social news?",
        options: [
          "Actively follow",
          "Occasionally follow",
          "Rarely follow",
        ],
      },
    ],
  },
];

export default function CompleteExperience() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = steps[step];

  const selectOption = (question, option) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: option,
    }));
  };

  const nextStep = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const skip = () => {
    router.push("/home"); // adjust route
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4">
      <div className="w-full max-w-sm">

        {/* FINAL SCREEN */}
        {step === steps.length ? (
          <div className="text-center space-y-6">
            <h1 className="text-white text-4xl font-bold">
              You’re{" "}
              <span className="text-pink-500">all set!</span>
            </h1>
            <p className="text-gray-400">
              We’re personalizing your Playymate experience based
              on your interests and preferences.
            </p>

           
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm">Final step</p>
              <h1 className="text-white text-3xl font-bold">
                COMPLETE YOUR{" "}
                <span className="text-pink-500">EXPERIENCE</span>
              </h1>
              <p className="text-cyan-400 mt-2 text-sm">
                {current.title}
              </p>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-6">
              {current.sections.map((section) => (
                <div
                  key={section.question}
                  className="bg-[#121212] rounded-xl p-4 space-y-3"
                >
                  <p className="text-gray-300 text-sm">
                    {section.question}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {section.options.map((opt) => {
                      const isActive =
                        answers[section.question] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            selectOption(section.question, opt)
                          }
                          className={`py-2 rounded-lg border text-sm transition
                            ${
                              isActive
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-none"
                                : "border-gray-600 text-gray-300 hover:border-pink-500"
                            }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-8 space-y-4">
              <button
                onClick={nextStep}
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold"
              >
                Save & Continue
              </button>

              <button
                onClick={nextStep}
                className="w-full text-gray-400 text-sm underline"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
