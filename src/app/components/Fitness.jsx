"use client";

import { useState, useEffect, useRef } from "react";
import { questionnaireService } from "@/services/questionnaire";
import { startQuestionnaireSession } from "@/lib/api/categoryApi";

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
      const arr = Array.isArray(prevAnswer) ? prevAnswer : [prevAnswer];
      return arr.includes(condition_value);
    }

    return true;
  });
}

/* =====================================================
   WATER BALL
   – Two wave layers: back (cyan/teal) + front (blue/indigo)
   – Continuous requestAnimationFrame loop, never stops
   – progress (0–100) controls fill level
===================================================== */
function WaterBall({ progress }) {
  const SIZE = 80;
  const R = SIZE / 2;
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const clampedPct = Math.min(Math.max(progress, 0), 100);

    function draw() {
      tickRef.current += 0.022;
      const tk = tickRef.current;

      ctx.clearRect(0, 0, SIZE, SIZE);

      // ── clip everything inside the circle ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.clip();

      // Water fill: 0 % → fillY = SIZE (bottom), 100 % → fillY = 0 (top)
      const fillY = SIZE - (clampedPct / 100) * SIZE;

      // ════════════════════════════════════════
      // LAYER 1 — back wave  (cyan ↔ teal)
      // sits a few px above the front wave for depth
      // ════════════════════════════════════════
      ctx.beginPath();
      ctx.moveTo(0, SIZE);
      ctx.lineTo(0, fillY + 6);

      for (let x = 0; x <= SIZE; x++) {
        const y =
          fillY + 6 +
          Math.sin(x * 0.042 + tk * 0.85 + 2.1) * 7 +
          Math.sin(x * 0.075 + tk * 1.25 + 0.6) * 3.5;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(SIZE, SIZE);
      ctx.closePath();

      // cyan-500 → teal-700 → deep-ocean
      const gBack = ctx.createLinearGradient(0, fillY, 0, SIZE);
      gBack.addColorStop(0,    "rgba(6, 182, 212, 0.80)");   // cyan-500
      gBack.addColorStop(0.45, "rgba(15, 118, 158, 0.88)");  // teal-600
      gBack.addColorStop(1,    "rgba(7,  60, 110, 0.96)");   // deep
      ctx.fillStyle = gBack;
      ctx.fill();

      // ════════════════════════════════════════
      // LAYER 2 — front wave  (blue ↔ indigo)
      // slightly lower start → covers back partially
      // ════════════════════════════════════════
      ctx.beginPath();
      ctx.moveTo(0, SIZE);
      ctx.lineTo(0, fillY);

      for (let x = 0; x <= SIZE; x++) {
        const y =
          fillY +
          Math.sin(x * 0.048 + tk + 0.4)       * 6 +
          Math.sin(x * 0.088 + tk * 1.55 + 1.3) * 3;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(SIZE, SIZE);
      ctx.closePath();

      // indigo-500 → blue-600 → deep-blue
      const gFront = ctx.createLinearGradient(0, fillY, 0, SIZE);
      gFront.addColorStop(0,    "rgba(99,  102, 241, 0.88)");  // indigo-500
      gFront.addColorStop(0.42, "rgba(37,   99, 235, 0.94)");  // blue-600
      gFront.addColorStop(1,    "rgba(15,   52, 160, 1)");     // deep blue
      ctx.fillStyle = gFront;
      ctx.fill();

      // ── soft gloss highlight (top-left arc) ──
      const gloss = ctx.createRadialGradient(
        R * 0.50, R * 0.40, R * 0.03,
        R * 0.50, R * 0.40, R * 0.70
      );
      gloss.addColorStop(0,   "rgba(255,255,255,0.30)");
      gloss.addColorStop(0.55,"rgba(255,255,255,0.07)");
      gloss.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.fillStyle = gloss;
      ctx.fill();

      ctx.restore();

      // ── outer ring ──
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(147, 220, 255, 0.70)";
      ctx.lineWidth = 3;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [progress]);   // restarts when progress changes so fillY updates

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <canvas
        ref={canvasRef}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "10%",
          display: "block",
        }}
      />
      {/* percentage label on top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "700",
          fontSize: "1.1rem",
          textShadow: "0 1px 2px rgba(0,0,0,0.75)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {progress}%
      </div>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */
export default function Fitness({ onBack, onComplete }) {

  const [questions,     setQuestions]     = useState([]);
  const [allQuestions,  setAllQuestions]  = useState({ fitness: [], medical: [] });
  const [answers,       setAnswers]       = useState({});
  const [stepIndex,     setStepIndex]     = useState(0);
  const [coins,         setCoins]         = useState(0);
  const [coinsEarned,   setCoinsEarned]   = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [phase,         setPhase]         = useState("loading");
  const [currentCategory, setCurrentCategory] = useState("fitness");

  /* =====================================================
     FETCH QUESTIONS
  ===================================================== */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('[Fitness] Fetching all questions...');
        const res  = await questionnaireService.getQuestions();
        const data = res.data?.data || res.data;
        console.log('[Fitness] Questions response:', data);

        const fitnessQuestions = data?.questions?.fitness || [];
        const medicalQuestions = data?.questions?.medical || [];

        console.log('[Fitness] Fitness questions:', fitnessQuestions.map(q => ({ id: q.question_id, type: q.question_type })));
        console.log('[Fitness] Medical questions:', medicalQuestions.map(q => ({ id: q.question_id, type: q.question_type })));

        const sortedFitness = fitnessQuestions.sort(
          (a, b) => (a.flow_order || 0) - (b.flow_order || 0)
        );
        const sortedMedical = medicalQuestions.sort(
          (a, b) => (a.flow_order || 0) - (b.flow_order || 0)
        );

        setAllQuestions({ fitness: sortedFitness, medical: sortedMedical });
        setQuestions(sortedFitness);
        setCurrentCategory("fitness");
        setPhase("questions");

        // Check if required questions are present
        const requiredQuestions = ['fitness_level', 'workout_frequency', 'has_medical_conditions'];
        const allQ = [...sortedFitness, ...sortedMedical];
        const missing = requiredQuestions.filter(rq => !allQ.find(q => q.question_id === rq));
        if (missing.length > 0) {
          console.warn('[Fitness] Missing required questions:', missing);
        } else {
          console.log('[Fitness] All required questions found!');
        }

      } catch (err) {
        console.error("[Fitness] Failed to load fitness questions:", err);
        setAllQuestions({ fitness: [], medical: [] });
        setQuestions([]);
        setPhase("questions");

      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  /* ─── derived state ─── */
  const visibleSteps = buildVisibleSteps(questions, answers);
  const current      = visibleSteps[stepIndex];

  const totalQuestions =
    allQuestions.fitness.length + allQuestions.medical.length;

  let currentProgress = 0;
  if (currentCategory === "fitness") {
    currentProgress = stepIndex + 1;
  } else if (currentCategory === "medical") {
    currentProgress = allQuestions.fitness.length + stepIndex + 1;
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
    if (current.question_type === "text")
      return val && val.trim().length > 0;
    if (current.question_type === "multi_choice")
      return Array.isArray(val) && val.length > 0;
    if (current.question_type === "boolean")
      return val !== undefined && val !== null;
    return val !== undefined && val !== null;
  };

  /* =====================================================
     SUBMIT ANSWER
  ===================================================== */
  const submitAnswer = async () => {
    if (!current) return;

    const qId          = current.question_id;
    const answer       = answers[qId];
    const questionType = current.question_type;
    let   payload      = {};

    console.log(`[Fitness.submitAnswer] Submitting: ${qId}`, { answer, questionType, options: current.options });

    if (
      questionType === "single_select" ||
      questionType === "single_choice" ||
      questionType === "single"
    ) {
      let optionIdToSend = null;

      if (answer && typeof answer === "string") {
        const byId = current.options?.find((opt) => opt.option_id === answer);
        if (byId) optionIdToSend = answer;
      }

      if (!optionIdToSend) {
        const byLabel = current.options?.find(
          (opt) => opt.label === answer || opt.value === answer
        );
        if (byLabel?.option_id) optionIdToSend = byLabel.option_id;
      }

      // Special handling for fitness_level, workout_frequency
      if (!optionIdToSend && answer && typeof answer === "string") {
        const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '');
        const byNormalized = current.options?.find(
          (opt) => 
            opt.label?.toLowerCase().replace(/\s+/g, '') === normalizedAnswer ||
            opt.value?.toLowerCase().replace(/\s+/g, '') === normalizedAnswer
        );
        if (byNormalized?.option_id) optionIdToSend = byNormalized.option_id;
      }

      payload.selected_option_ids = optionIdToSend ? [optionIdToSend] : [];
      console.log(`[Fitness.submitAnswer] Single select payload:`, payload);

    } else if (
      questionType === "multi_select" ||
      questionType === "multi_choice" ||
      questionType === "multi"
    ) {
      const selectedIds = (answer || [])
        .map((a) => {
          const byId = current.options?.find((opt) => opt.option_id === a);
          if (byId) return a;
          const byLabel = current.options?.find(
            (opt) => opt.label === a || opt.value === a
          );
          return byLabel?.option_id || a;
        })
        .filter(Boolean);

      if (selectedIds.length > 0) payload.selected_option_ids = selectedIds;
      console.log(`[Fitness.submitAnswer] Multi select payload:`, payload);

    } else if (questionType === "boolean") {
      payload.answer_boolean = answer === true;
      console.log(`[Fitness.submitAnswer] Boolean payload:`, payload);

    } else if (questionType === "text") {
      payload.answer_text = answer;
      console.log(`[Fitness.submitAnswer] Text payload:`, payload);

    } else if (questionType === "number" || questionType === "range") {
      payload.answer_number =
        typeof answer === "number"
          ? answer
          : parseInt(answer) || parseFloat(answer);
      console.log(`[Fitness.submitAnswer] Number/Range payload:`, payload);
    }

    try {
      console.log(`[Fitness.submitAnswer] Calling API for ${qId} with payload:`, payload);
      const res  = await questionnaireService.submitAnswer(qId, payload);
      const data = res.data?.data;
      console.log(`[Fitness.submitAnswer] Success for ${qId}:`, data);

      if (!coinsEarned.has(qId)) {
        setCoins((c) => c + COINS_PER_QUESTION);
        setCoinsEarned((prev) => new Set([...prev, qId]));
      }

      if (data?.profile_completed) {
        console.log(`[Fitness.submitAnswer] Profile completed! Full response:`, data);
        setPhase("success");
        return;
      }

      if (stepIndex < visibleSteps.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        if (currentCategory === "fitness" && allQuestions.medical.length > 0) {
          setCurrentCategory("medical");
          setQuestions(allQuestions.medical);
          setStepIndex(0);
          setAnswers({});
        } else {
          setPhase("success");
        }
      }

    } catch (err) {
      console.error(`[Fitness.submitAnswer] Error for ${qId}:`, err);
      console.error(`[Fitness.submitAnswer] Error response:`, err.response?.data);
    }
  };

  /* =====================================================
     RENDER — LOADING
  ===================================================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  /* =====================================================
     RENDER — SUCCESS
  ===================================================== */
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Physical Profile Completed!</h2>
        <p className="text-gray-400 mb-2">You earned {coins} coins</p>
        <button
          onClick={async () => {
            try {
              // Get token from sessionStorage
              const token = sessionStorage.getItem('accessToken');
              if (token) {
                console.log('[Fitness] Starting questionnaire session...');
                await startQuestionnaireSession(token, false);
                console.log('[Fitness] Questionnaire session started!');
              }
            } catch (err) {
              console.error('[Fitness] Error starting session:', err);
            }
            // Then navigate to questionnaire
            onComplete();
          }}
          className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
        >
          Continue
        </button>
      </div>
    );
  }

  /* =====================================================
     RENDER — QUESTIONS
  ===================================================== */
  return (
    <div className=" bg-black text-white flex flex-col relative ">

      {/* TOP PROGRESS BAR */}
      {/* <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button onClick={onBack} className="text-white text-xl">
            ←
          </button>
        )}
        <div className="flex-1 mx-4 h-1 bg-gray-700 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div> */}

      {/* WATER BALL */}
      <div className="flex justify-center font-Poppins text-sm mb-2">
        <WaterBall progress={progress} />
      </div>

      {/* QUESTION CARD */}
      <div className="bg-gradient-to-r font-Poppins from-blue-600 to-cyan-500 rounded-2xl p-6 text-center mb-8">
        <div className="text-sm uppercase tracking-wide  mb-2">
          💪 FITNESS
        </div>
        <h2 className="text-lg">{current?.question_text}</h2>
      </div>

      {/* OPTIONS */}
      <div className="space-y-4 font-Poppins">

        {current?.question_type === "boolean" && (
          <>
            <button
              onClick={() => setAnswer(current.question_id, true)}
              className={`w-full py-4 rounded-xl border transition ${
                answers[current.question_id] === true
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-600 hover:bg-blue-400"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setAnswer(current.question_id, false)}
              className={`w-full py-4 rounded-xl border transition ${
                answers[current.question_id] === false
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-600 hover:bg-blue-400"
              }`}
            >
              No
            </button>
          </>
        )}

        {current?.question_type === "single_choice" &&
          current.options.map((opt) => {
            const selected = answers[current.question_id] === opt.label;
            return (
              <button
                key={opt.option_id}
                onClick={() => setAnswer(current.question_id, opt.label)}
                className={`w-full py-3.5 rounded-xl border transition ${
                  selected
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-600 hover:bg-blue-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}

      </div>

      {/* CONTINUE BUTTON */}
      <button
        disabled={!hasAnswer()}
        onClick={submitAnswer}
        className="bottom-6 w-96 font-Poppins mt-4 justify-center items-center py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        Continue
      </button>

    </div>
  );
}