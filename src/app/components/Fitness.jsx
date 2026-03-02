"use client";

import { useState, useEffect } from "react";
import { questionnaireService } from "@/services/questionnaire";

const COINS_PER_QUESTION = 10;

/* =====================================================
   CONDITIONAL VISIBILITY
===================================================== */
function buildVisibleSteps(questions, answers) {
  return questions.filter((q) => {
    if (!q.conditional_on) return true;

    const { question_id, condition_type, condition_value } =
      q.conditional_on;

    const prevAnswer = answers[question_id];

    if (prevAnswer === undefined || prevAnswer === null) {
      return false;
    }

    if (condition_type === "equals") {
      return String(prevAnswer) === String(condition_value);
    }

    if (condition_type === "contains") {
      const arr = Array.isArray(prevAnswer)
        ? prevAnswer
        : [prevAnswer];

      return arr.includes(condition_value);
    }

    return true;
  });
}

export default function Fitness({ onBack, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("loading");

  /* =====================================================
     FETCH QUESTIONS
  ===================================================== */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await questionnaireService.getQuestions(
          "fitness"
        );

        const fitnessQuestions =
          res.data?.data?.questions?.fitness || [];

        const sorted = fitnessQuestions.sort(
          (a, b) => a.flow_order - b.flow_order
        );

        setQuestions(sorted);
        setPhase("questions");
      } catch (err) {
        console.error("Failed to load fitness questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const visibleSteps = buildVisibleSteps(questions, answers);
  const current = visibleSteps[stepIndex];

  const progress =
    visibleSteps.length > 0
      ? Math.round(
          ((stepIndex + 1) / visibleSteps.length) * 100
        )
      : 0;

  /* =====================================================
     SET ANSWER
  ===================================================== */
  const setAnswer = (questionId, value, type) => {
    setAnswers((prev) => {
      if (type === "multi") {
        const existing = prev[questionId] || [];

        return {
          ...prev,
          [questionId]: existing.includes(value)
            ? existing.filter((v) => v !== value)
            : [...existing, value],
        };
      }

      return { ...prev, [questionId]: value };
    });
  };

  const hasAnswer = () => {
    if (!current) return false;

    const val = answers[current.question_id];

    if (current.question_type === "text") {
      return val && val.trim().length > 0;
    }

    if (current.question_type === "multi_choice") {
      return Array.isArray(val) && val.length > 0;
    }

    return val !== undefined && val !== null;
  };

  /* =====================================================
     SUBMIT ANSWER
  ===================================================== */
  const submitAnswer = async () => {
    if (!current) return;

    const qId = current.question_id;
    const answer = answers[qId];

   let payload = {};

    if (current.question_type === "single_choice") {
      const selected = current.options.find(
        (opt) => opt.label === answer
      );
      payload.selected_option_ids = [selected.option_id];
    }

    if (current.question_type === "multi_choice") {
      payload.selected_option_ids = current.options
        .filter((opt) =>
          answer.includes(opt.label)
        )
        .map((opt) => opt.option_id);
    }

    if (current.question_type === "boolean") {
      payload.answer_boolean = answer === true;
    }

    if (current.question_type === "text") {
      payload.answer_text = answer;
    }

    try {
      const res =
        await questionnaireService.submitAnswer(
          qId,
          payload
        );

      const data = res.data?.data;

      /* COINS */
      if (!coinsEarned.has(qId)) {
        setCoins((c) => c + COINS_PER_QUESTION);
        setCoinsEarned((prev) => new Set([...prev, qId]));
      }

      /* COMPLETE */
      if (data?.profile_completed) {
        setPhase("success");
        return;
      }

      /* NEXT STEP */
      if (stepIndex < visibleSteps.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        setPhase("success");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading Fitness...
      </div>
    );
  }

  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">
          Fitness Profile Completed!
        </h2>
        <p className="mb-4 text-gray-400">
          You earned {coins} coins
        </p>

        <button
          onClick={onComplete}   // 👈 parent controls navigation
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
        >
          Continue
        </button>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */
  return (
    <div className="min-h-screen bg-[#1a0a2e] text-white px-6 pt-16 pb-32">

      {/* BACK */}
      {onBack && (
        <div
          onClick={onBack}
          className="absolute top-6 left-6 text-xl cursor-pointer"
        >
          ←
        </div>
      )}

      {/* PROGRESS */}
      <div className="mb-6">
        <div className="h-2 bg-white/20 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm mt-2 text-right text-green-400">
          {progress}%
        </p>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-gradient-to-br from-purple-700 to-fuchsia-600 p-6 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center">
          {current?.question_text}
        </h2>

        <div className="space-y-3">
          {/* BOOLEAN */}
          {current?.question_type === "boolean" && (
            <>
              <button
                onClick={() =>
                  setAnswer(current.question_id, true)
                }
                className="w-full py-3 rounded-xl bg-white/10"
              >
                Yes
              </button>
              <button
                onClick={() =>
                  setAnswer(current.question_id, false)
                }
                className="w-full py-3 rounded-xl bg-white/10"
              >
                No
              </button>
            </>
          )}

          {/* SINGLE */}
          {current?.question_type === "single_choice" &&
            current.options.map((opt) => (
              <button
                key={opt.option_id}
                onClick={() =>
                  setAnswer(current.question_id, opt.label)
                }
                className="w-full py-3 rounded-xl bg-white/10"
              >
                {opt.label}
              </button>
            ))}

          {/* MULTI */}
          {current?.question_type === "multi_choice" &&
            current.options.map((opt) => (
              <button
                key={opt.option_id}
                onClick={() =>
                  setAnswer(
                    current.question_id,
                    opt.label,
                    "multi"
                  )
                }
                className="w-full py-3 rounded-xl bg-white/10"
              >
                {opt.label}
              </button>
            ))}

          {/* TEXT */}
          {current?.question_type === "text" && (
            <textarea
              value={
                answers[current.question_id] || ""
              }
              onChange={(e) =>
                setAnswer(
                  current.question_id,
                  e.target.value
                )
              }
              placeholder={current.placeholder}
              className="w-full p-3 rounded-xl bg-white/10 text-white"
            />
          )}
        </div>
      </div>

      {/* COINS */}
      <div className="text-center mt-4 text-yellow-400">
        🪙 {coins} coins
      </div>

      {/* CONTINUE */}
      <button
        disabled={!hasAnswer()}
        onClick={submitAnswer}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        {stepIndex < visibleSteps.length - 1
          ? "Continue"
          : "Finish 🎉"}
      </button>
    </div>
  );
}