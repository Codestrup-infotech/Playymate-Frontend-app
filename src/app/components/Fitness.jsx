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
  // State for all categories - fitness and medical
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
  const [currentCategory, setCurrentCategory] = useState('fitness');

  /* =====================================================
     FETCH QUESTIONS - Get both fitness and medical categories dynamically
  ===================================================== */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch all questions from the API
        const res = await questionnaireService.getQuestions();
        
        // Handle both response formats (success and status)
        const data = res.data?.data || res.data;
        
        // Get questions from the API response - dynamic based on API
        const fitnessQuestions = data?.questions?.fitness || [];
        const medicalQuestions = data?.questions?.medical || [];
        
        // Sort each category by flow_order
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
        
        // Start with fitness questions first
        setQuestions(sortedFitness);
        setCurrentCategory('fitness');
        setPhase("questions");
      } catch (err) {
        console.error("Failed to load fitness questions:", err);
        // Fallback to empty arrays
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

  // Calculate total progress across both fitness and medical categories
  const totalQuestions = allQuestions.fitness.length + allQuestions.medical.length;
  
  // Calculate current position across all categories
  let currentProgress = 0;
  if (currentCategory === 'fitness') {
    // In fitness category - progress based on stepIndex in fitness
    currentProgress = stepIndex + 1;
  } else if (currentCategory === 'medical') {
    // In medical category - progress = fitness.length + stepIndex + 1
    currentProgress = allQuestions.fitness.length + stepIndex + 1;
  }
  
  const progress = totalQuestions > 0
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

    // Handle boolean type (used in medical questions)
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

    console.log("Submitting answer:", { qId, answer, questionType, options: current.options });

    let payload = {};

    // Handle single select - use selected_option_ids with option_id
    if (questionType === "single_select" || questionType === "single_choice" || questionType === "single") {
      let optionIdToSend = null;
      
      // First, check if answer is already an option_id
      if (answer && typeof answer === 'string') {
        const byId = current.options?.find(opt => opt.option_id === answer);
        if (byId) {
          optionIdToSend = answer;
        }
      }
      
      // If not found by ID, try by label or value
      if (!optionIdToSend) {
        const byLabel = current.options?.find(
          (opt) => opt.label === answer || opt.value === answer
        );
        if (byLabel?.option_id) {
          optionIdToSend = byLabel.option_id;
        }
      }
      
      if (optionIdToSend) {
        payload.selected_option_ids = [optionIdToSend];
      } else {
        console.error("No option_id found:", answer, "Options:", current.options);
        // Send empty to trigger error or use the raw answer
        payload.selected_option_ids = [];
      }
    }
    // Handle multi select
    else if (questionType === "multi_select" || questionType === "multi_choice" || questionType === "multi") {
      const selectedIds = (answer || []).map(a => {
        // Check if already option_id
        const byId = current.options?.find(opt => opt.option_id === a);
        if (byId) return a;
        // Find by label/value
        const byLabel = current.options?.find(opt => opt.label === a || opt.value === a);
        return byLabel?.option_id || a;
      }).filter(Boolean);
      
      if (selectedIds.length > 0) {
        payload.selected_option_ids = selectedIds;
      }
    }
    // Handle boolean - MUST use answer_boolean (not selected_option_ids)
    else if (questionType === "boolean") {
      // Convert answer to actual boolean
      if (answer === true) {
        payload.answer_boolean = true;
      } else if (answer === false) {
        payload.answer_boolean = false;
      } else if (answer === "true" || answer === "1") {
        payload.answer_boolean = true;
      } else if (answer === "false" || answer === "0") {
        payload.answer_boolean = false;
      } else {
        // Try to find option_id for Yes/No
        const boolOption = current.options?.find(
          opt => opt.label === answer || opt.value === answer
        );
        if (boolOption?.option_id) {
          payload.selected_option_ids = [boolOption.option_id];
        } else {
          // Default to false
          payload.answer_boolean = false;
        }
      }
    }
    // Handle text
    else if (questionType === "text") {
      payload.answer_text = answer;
    }
    // Handle number
    else if (questionType === "number") {
      payload.answer_number = typeof answer === 'number' ? answer : parseInt(answer) || parseFloat(answer);
    }
    else {
      console.error("Unknown question type:", questionType);
      payload.selected_option_ids = answer ? [answer] : [];
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

      /* NEXT STEP - Handle category transition (fitness -> medical) */
      if (stepIndex < visibleSteps.length - 1) {
        // More questions in current category
        setStepIndex((i) => i + 1);
      } else {
        // Current category complete - check if we need to transition to medical
        if (currentCategory === 'fitness' && allQuestions.medical.length > 0) {
          // Transition to medical questions
          setCurrentCategory('medical');
          setQuestions(allQuestions.medical);
          setStepIndex(0);
          // Clear answers for medical questions
          setAnswers({});
        } else {
          // All categories complete
          setPhase("success");
        }
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
        Loading Physical Profile...
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
          Physical Profile Completed!
        </h2>
        <p className="mb-4 text-gray-400">
          You answered {allQuestions.fitness.length + allQuestions.medical.length} questions
        </p>
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

      {/* CATEGORY INDICATOR */}
      <div className="mb-4 text-center">
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm">
          {currentCategory === 'fitness' ? '💪 Fitness Level' : '🏥 Medical Information'}
        </span>
      </div>

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
        {/* Check if this is the last question across all categories */}
        {currentCategory === 'medical' && stepIndex >= allQuestions.medical.length - 1
          ? "Finish 🎉"
          : "Continue"}
      </button>
    </div>
  );
}