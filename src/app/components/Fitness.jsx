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
  const [allQuestions, setAllQuestions] = useState({
    fitness: [],
    medical: []
  });
  const [answers, setAnswers] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("loading");
  const [currentCategory, setCurrentCategory] = useState("fitness");

  /* =====================================================
     FETCH QUESTIONS
  ===================================================== */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await questionnaireService.getQuestions();
        const data = res.data?.data || res.data;

        const fitnessQuestions = data?.questions?.fitness || [];
        const medicalQuestions = data?.questions?.medical || [];

        const sortedFitness = fitnessQuestions.sort(
          (a, b) => (a.flow_order || 0) - (b.flow_order || 0)
        );

        const sortedMedical = medicalQuestions.sort(
          (a, b) => (a.flow_order || 0) - (b.flow_order || 0)
        );

        setAllQuestions({
          fitness: sortedFitness,
          medical: sortedMedical
        });

        setQuestions(sortedFitness);
        setCurrentCategory("fitness");
        setPhase("questions");
      } catch (err) {
        console.error("Failed to load fitness questions:", err);
        setAllQuestions({ fitness: [], medical: [] });
        setQuestions([]);
        setPhase("questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const visibleSteps = buildVisibleSteps(questions, answers);
  const current = visibleSteps[stepIndex];

  const totalQuestions =
    allQuestions.fitness.length +
    allQuestions.medical.length;

  let currentProgress = 0;

  if (currentCategory === "fitness") {
    currentProgress = stepIndex + 1;
  } else if (currentCategory === "medical") {
    currentProgress =
      allQuestions.fitness.length +
      stepIndex +
      1;
  }

  const progress =
    totalQuestions > 0
      ? Math.round((currentProgress / totalQuestions) * 100)
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

    if (current.question_type === "boolean") {
      return val !== undefined && val !== null;
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
    const questionType = current.question_type;

    let payload = {};

    if (
      questionType === "single_select" ||
      questionType === "single_choice" ||
      questionType === "single"
    ) {
      let optionIdToSend = null;

      if (answer && typeof answer === "string") {
        const byId = current.options?.find(
          (opt) => opt.option_id === answer
        );
        if (byId) {
          optionIdToSend = answer;
        }
      }

      if (!optionIdToSend) {
        const byLabel = current.options?.find(
          (opt) =>
            opt.label === answer ||
            opt.value === answer
        );
        if (byLabel?.option_id) {
          optionIdToSend = byLabel.option_id;
        }
      }

      if (optionIdToSend) {
        payload.selected_option_ids = [
          optionIdToSend,
        ];
      } else {
        payload.selected_option_ids = [];
      }
    } else if (
      questionType === "multi_select" ||
      questionType === "multi_choice" ||
      questionType === "multi"
    ) {
      const selectedIds = (answer || [])
        .map((a) => {
          const byId = current.options?.find(
            (opt) => opt.option_id === a
          );
          if (byId) return a;

          const byLabel = current.options?.find(
            (opt) =>
              opt.label === a ||
              opt.value === a
          );
          return byLabel?.option_id || a;
        })
        .filter(Boolean);

      if (selectedIds.length > 0) {
        payload.selected_option_ids = selectedIds;
      }
    } else if (questionType === "boolean") {
      if (answer === true) {
        payload.answer_boolean = true;
      } else if (answer === false) {
        payload.answer_boolean = false;
      } else {
        payload.answer_boolean = false;
      }
    } else if (questionType === "text") {
      payload.answer_text = answer;
    } else if (questionType === "number") {
      payload.answer_number =
        typeof answer === "number"
          ? answer
          : parseInt(answer) || parseFloat(answer);
    }

    try {
      const res =
        await questionnaireService.submitAnswer(
          qId,
          payload
        );

      const data = res.data?.data;

      if (!coinsEarned.has(qId)) {
        setCoins((c) => c + COINS_PER_QUESTION);
        setCoinsEarned(
          (prev) => new Set([...prev, qId])
        );
      }

      if (data?.profile_completed) {
        setPhase("success");
        return;
      }

      if (stepIndex < visibleSteps.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        if (
          currentCategory === "fitness" &&
          allQuestions.medical.length > 0
        ) {
          setCurrentCategory("medical");
          setQuestions(allQuestions.medical);
          setStepIndex(0);
          setAnswers({});
        } else {
          setPhase("success");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">
          Physical Profile Completed!
        </h2>
        <p className="text-gray-400 mb-2">
          You earned {coins} coins
        </p>
        <button
          onClick={onComplete}
          className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative px-6 pt-10 pb-32">

      {/* TOP PROGRESS BAR */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white text-xl"
          >
            ←
          </button>
        )}

        <div className="flex-1 mx-4 h-1 bg-gray-700 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* CIRCLE PROGRESS */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">
              {progress}
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORY TITLE */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-center mb-8">
        <div className="text-sm uppercase tracking-wide font-semibold mb-2">
          💪 FITNESS
        </div>
        <h2 className="text-lg font-semibold">
          {current?.question_text}
        </h2>
      </div>

      {/* OPTIONS */}
      <div className="space-y-4">
        {current?.question_type === "boolean" && (
          <>
            <button
              onClick={() =>
                setAnswer(current.question_id, true)
              }
              className="w-full py-4 rounded-xl border border-pink-500 text-white"
            >
              Yes
            </button>

            <button
              onClick={() =>
                setAnswer(current.question_id, false)
              }
              className="w-full py-4 rounded-xl border border-blue-500 text-white"
            >
              No
            </button>
          </>
        )}

        {current?.question_type === "single_choice" &&
          current.options.map((opt) => (
            <button
              key={opt.option_id}
              onClick={() =>
                setAnswer(
                  current.question_id,
                  opt.label
                )
              }
              className="w-full py-4 rounded-xl border border-gray-600 text-white"
            >
              {opt.label}
            </button>
          ))}

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
              className="w-full py-4 rounded-xl border border-gray-600 text-white"
            >
              {opt.label}
            </button>
          ))}

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
            className="w-full p-4 rounded-xl bg-gray-800 text-white border border-gray-600"
          />
        )}
      </div>

      {/* CONTINUE BUTTON */}
      <button
        disabled={!hasAnswer()}
        onClick={submitAnswer}
        className="bottom-6 w-80 mt-8  justify-center items-center py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}