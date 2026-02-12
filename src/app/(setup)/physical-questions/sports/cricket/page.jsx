

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

/* ---------------- AUTO BACKGROUND COLORS ---------------- */
const BG_COLORS = [
  "from-[#1A43CA] to-[#1FCCF2]",
  "from-[#AC57FE] to-[#6752F2]",
  "from-[#FF9F27] to-[#FF5C24]",
];


export default function CricketPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);



  const API_KEY = "API_KEY_FROM_BACKEND";



  const MOCK_QUESTIONS = [
    {
      id: "q1",
      question: "Your cricket involvement",
      options: [
        "Casual / recreational",
        "Weekend matches",
        "Regular practice",
        "Competitive / tournaments",
      ],
      bgColor: "linear-gradient(135deg, #1A43CA, #1FCCF2)",
    },
    {
      id: "q2",
      question: "Preferred cricket format",
      options: [
        "Box cricket",
        "Turf cricket",
        "Open ground cricket",
        "Practice nets only",
      ],
      bgColor: "linear-gradient(135deg, #C60385, #F43F5E)",
    },
    {
      id: "q3",
      question: "Ball type",
      options: ["Tennis ball", "Leather ball", "Both"],
      bgColor: "linear-gradient(135deg, #0F766E, #14B8A6)",
    },
  ];

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {




    // const fetchQuestions = async () => {
    //   try {
    //     const res = await axios.get(
    //       " ",
    //       {
    //         headers: {
    //           Authorization: `Bearer ${API_KEY}`,
    //         },
    //       }
    //     );

    //     setQuestions(res.data.questions); // admin-controlled
    //   } catch (err) {
    //     console.error("Failed to load questions", err);
    //        setQuestions(MOCK_QUESTIONS); // ✅ fallback
    //   } finally {
    //     setLoading(false);
    //   }
    // };



    const fetchQuestions = async () => {
      try {
        if (!API_URL) {
          setQuestions(MOCK_QUESTIONS);
          return;
        }

        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        setQuestions(res.data.questions);
      } catch (err) {
        setQuestions(MOCK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };


    fetchQuestions();
  }, []);

  const totalSteps = Array.isArray(questions) ? questions.length : 0;
  const current = totalSteps > 0 ? questions[step] : null;



  /* ---------------- PERCENTAGE ---------------- */
  const percent = useMemo(() => {
    if (!totalSteps) return 0;
    return Math.round(((step + 1) / totalSteps) * 100);
  }, [step, totalSteps]);

  /* ---------------- ACTIONS ---------------- */
  const selectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: option,
    }));
  };

  const next = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      try {
        await axios.post(
          "",
          { answers },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        setFinished(true); // ✅ show success screen
      } catch (err) {
        console.error("Failed to submit answers", err);
      }
    }
  };


  const back = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setStep(0); // first screen stays safe
    }
  };

  if (!current) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading questions...
      </div>
    );
  }


  if (!current) return null;

  const bg = BG_COLORS[step % BG_COLORS.length];

  if (finished) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 font-Poppins">
        <div className="text-center">

          <div className="flex justify-center mb-6">
            <img
              src="/GIF/cricket.gif"
              alt="Success"
              className="w-24"
            />
          </div>

          <h2 className="text-3xl font-semibold text-pink-500 mb-3">
            Preferences Saved Successfully
          </h2>

          <p className="text-gray-400 mb-8">
            Your experience is now personalized for you
          </p>

          <button
            onClick={() => router.push("/physical-questions?step=1")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white"
          >
            Back to Sports
          </button>

        </div>
      </div>
    );
  }


  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen py-16 bg-black flex items-center justify-center px-4 font-Poppins">
      <div className="w-full max-w-sm relative">


        <button
          onClick={back}
          className="absolute -top-10 left-0 text-white text-2xl"
        >
          ←
        </button>

        {/* PROGRESS RING */}
        <ProgressRing percent={percent} />

        {/* QUESTION CARD */}
        <div
          className={`mt-10 rounded-3xl p-10  text-center  shadow-2xl
          bg-gradient-to-br ${bg}`}
        >
          <p className="text-white  text-sm font-semibold font-Poppins">
            🏏 CRICKET
          </p>
          <div className={`mt-4 h-[0.5px] w-full bg-gradient-to-r ${bg}`} />


          <h2 className="mt-3 text-white text-lg font-semibold font-Poppins">
            {current.question}
          </h2>
        </div>

        {/* OPTIONS */}
        <div className="mt-8 space-y-3">
          {current.options.map((opt) => {
            const active = answers[current.id] === opt;

            return (
              <button
                key={opt}
                onClick={() => selectOption(opt)}
                className={`w-full py-3 rounded-xl border transition
                  ${active
                    ? "bg-[#2468B6] text-white  border-[#1FCCF2]"
                    : "border-pink-500/80 text-white hover:bg-white/10"
                  }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* CONTINUE */}
        <button
          onClick={next}
          disabled={!answers[current.id]}
          className="mt-10 w-full py-3 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-500
            text-white
            disabled:opacity-40"
        >
          {step === totalSteps - 1 ? "Save" : "Continue"}
        </button>
      </div>
    </div>
  );
}


function ProgressRing({ percent }) {
  const radius = 40;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  return (
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#000000]  p-1 rounded-full z-10">

      <svg height={radius * 2} width={radius * 2}>
        <circle

          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke="#3EE800"
          fill="#1D93E1"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.6s ease",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="absolute inset-0 flex items-center  justify-center">
        <span className="text-white   text-sm font-medium  ">
          {percent}%
        </span>
      </div>


    </div>
  );
}
