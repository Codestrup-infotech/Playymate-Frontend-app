

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Loader2,
//   Shield,
//   Smartphone,
//   Fingerprint,
//   Building2,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   ArrowRight,
//   X,
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { kycService } from "@/services/kyc";
// import { userService } from "@/services/user";
// import { getRouteFromStep } from "@/lib/api/navigation";

// const STEPS = {
//   INTRO: "intro",
//   POLLING: "polling",
//   SUCCESS: "success",
//   ERROR: "error",
// };

// export default function KYCPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const verificationIdFromUrl = searchParams.get("verification_id");
//   const statusFromUrl = searchParams.get("status");

//   const [step, setStep] = useState(STEPS.INTRO);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [verificationId, setVerificationId] = useState("");
//   const [aadhaarData, setAadhaarData] = useState(null);
//   // Track which KYC screens are enabled
//   const [screensEnabled, setScreensEnabled] = useState({
//     aadhaar: true,
//     liveness: true,
//   });

//   const pollingRef = useRef(null);
//   const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

//   /* ================= CHECK STATUS ================= */

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await userService.getOnboardingStatus();
//         const state = res?.data?.data?.onboarding_state;
//         const nextStep = res?.data?.next_required_step;

//         const completedStates = [
//           "KYC_COMPLETED",
//           "PHYSICAL_PROFILE_CONSENT",
//           "PHYSICAL_PROFILE_COMPLETED",
//           "QUESTIONNAIRE_COMPLETE",
//           "COMPLETED",
//           "ACTIVE",
//         ];

//         if (completedStates.includes(state)) {
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             if (route) {
//               router.push(route);
//               return;
//             }
//           }
//           router.push("/onboarding/physical");
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     checkStatus();
//   }, [router]);

//   /* ================= FETCH SCREEN VISIBILITY ================= */

//   useEffect(() => {
//     const fetchScreenVisibility = async () => {
//       try {
//         const res = await kycService.getKycScreens();
//         const { screens } = res.data?.data || {};
//         if (screens) {
//           setScreensEnabled({
//             aadhaar: screens.aadhaar?.enabled ?? true,
//             liveness: screens.liveness?.enabled ?? true,
//           });
//         }
//       } catch (err) {
//         console.error('Failed to fetch KYC screen visibility:', err);
//         // Default to both enabled
//       }
//     };

//     fetchScreenVisibility();
//   }, []);

//   /* ================= HANDLE DIGILOCKER REDIRECT ================= */

//   useEffect(() => {
//     if (verificationIdFromUrl && statusFromUrl) {
//       handleRedirect(verificationIdFromUrl, statusFromUrl);
//     }
//   }, [verificationIdFromUrl, statusFromUrl]);

//   const handleRedirect = async (vid, status) => {
//     setVerificationId(vid);

//     if (status === "verified" || status === "AUTHENTICATED") {
//       await fetchDocument(vid);
//     } else if (status === "pending") {
//       startPolling(vid);
//     } else {
//       setError("Verification failed.");
//       setStep(STEPS.ERROR);
//     }
//   };

//   /* ================= START DIGILOCKER ================= */

//   const handleStart = async () => {
//     try {
//       setLoading(true);

//       const vid = uuidv4();
//       setVerificationId(vid);

//       if (DEV_MODE) {
//         startPolling(vid);
//         return;
//       }

//       const redirectUrl =
//         process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI ||
//         "playymate://kyc-callback";

//       const res = await kycService.digilockerCreateUrl(
//         vid,
//         ["AADHAAR"],
//         redirectUrl,
//         "verification"
//       );

//       const consentUrl = res.data?.data?.consent_url;
//       window.location.href = consentUrl;
//     } catch (err) {
//       setError("Failed to start verification.");
//       setStep(STEPS.ERROR);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= POLLING ================= */

//   const startPolling = (vid) => {
//     setStep(STEPS.POLLING);

//     let attempts = 0;

//     pollingRef.current = setInterval(async () => {
//       attempts++;
//       if (attempts > 40) {
//         clearInterval(pollingRef.current);
//         setError("Timeout.");
//         setStep(STEPS.ERROR);
//         return;
//       }

//       try {
//         const res = await kycService.digilockerStatus(vid);
//         const status = res.data?.data?.status;

//         if (status === "AUTHENTICATED" || status === "verified") {
//           clearInterval(pollingRef.current);
//           await fetchDocument(vid);
//         }
//       } catch {}
//     }, 3000);
//   };

//   const fetchDocument = async (vid) => {
//     try {
//       if (DEV_MODE) {
//         setAadhaarData({
//           name: "Demo User",
//           aadhaar_number: "XXXXXX1234",
//         });
//       } else {
//         const res = await kycService.digilockerDocument("AADHAAR", vid);
//         setAadhaarData(res.data?.data);
//       }
      
//       // Check if liveness is enabled
//       if (screensEnabled.liveness) {
//         // Go to liveness verification
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         // Liveness disabled - complete KYC directly
//         try {
//           if (!DEV_MODE) {
//             await kycService.completeKYC();
//           }
//           router.push("/onboarding/physical");
//         } catch (err) {
//           console.error('Error completing KYC:', err);
//           router.push("/onboarding/physical");
//         }
//       }
//     } catch {
//       // Even on error, check liveness status before navigating
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         router.push("/onboarding/physical");
//       }
//     }
//   };

//   /* ================= SKIP ================= */

//   const handleSkip = async () => {
//     try {
//       if (!DEV_MODE) {
//         await kycService.skipAadhaar();
//       }

//       // Check if liveness is enabled
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         // Liveness disabled - complete KYC directly
//         try {
//           if (!DEV_MODE) {
//             await kycService.completeKYC();
//           }
//           router.push("/onboarding/physical");
//         } catch (err) {
//           console.error('Error completing KYC:', err);
//           router.push("/onboarding/physical");
//         }
//       }
//     } catch {
//       // On error, check liveness status before navigating
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         router.push("/onboarding/physical");
//       }
//     }
//   };

//   /* ================= SUCCESS CONTINUE ================= */

//   const proceedToLiveness = () => {
//     // Check if liveness is enabled
//     if (screensEnabled.liveness) {
//       router.push("/onboarding/kyc/liveness");
//     } else {
//       // Liveness disabled - complete KYC directly
//       router.push("/onboarding/physical");
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

//         {step === STEPS.INTRO && (
//           <>
//             <div className="text-center mb-6">
//               <Shield className="w-12 h-12 text-pink-500 mx-auto mb-3" />
//               <h2 className="text-xl text-white font-bold">
//                 Verify Your Identity
//               </h2>
//             </div>

//             {/* Aadhaar button - only show if aadhaar is enabled */}
//             {screensEnabled.aadhaar && (
//               <>
//                 <button
//                   onClick={handleStart}
//                   className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold mb-3"
//                 >
//                   {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue with DigiLocker"}
//                 </button>

//                 <button
//                   onClick={handleSkip}
//                   className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl"
//                 >
//                   Skip for Now
//                 </button>
//               </>
//             )}

//             {/* If aadhaar is disabled, directly go to liveness */}
//             {!screensEnabled.aadhaar && screensEnabled.liveness && (
//               <button
//                 onClick={() => router.push("/onboarding/kyc/liveness")}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue to Face Verification
//               </button>
//             )}

//             {/* If both are disabled (shouldn't happen based on photo page logic), complete KYC */}
//             {!screensEnabled.aadhaar && !screensEnabled.liveness && (
//               <button
//                 onClick={async () => {
//                   try {
//                     if (!DEV_MODE) {
//                       await kycService.completeKYC();
//                     }
//                     router.push("/onboarding/physical");
//                   } catch (err) {
//                     console.error('Error completing KYC:', err);
//                     router.push("/onboarding/physical");
//                   }
//                 }}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue
//               </button>
//             )}
//           </>
//         )}

//         {step === STEPS.POLLING && (
//           <div className="text-center text-white">
//             <Loader2 className="animate-spin mx-auto mb-3" />
//             Verifying Aadhaar...
//           </div>
//         )}

//         {step === STEPS.SUCCESS && (
//           <>
//             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
//             <p className="text-white text-center mb-4">
//               Aadhaar Verified Successfully
//             </p>
//             {screensEnabled.liveness ? (
//               <button
//                 onClick={proceedToLiveness}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue to Face Verification
//               </button>
//             ) : (
//               <button
//                 onClick={() => router.push("/onboarding/physical")}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue
//               </button>
//             )}
//           </>
//         )}

//         {step === STEPS.ERROR && (
//           <>
//             <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
//             <p className="text-red-400 text-center mb-4">{error}</p>
//             <button
//               onClick={() => setStep(STEPS.INTRO)}
//               className="w-full py-3 bg-gray-700 rounded-xl text-white"
//             >
//               Try Again
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
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
        const res  = await questionnaireService.getQuestions();
        const data = res.data?.data || res.data;

        const fitnessQuestions = data?.questions?.fitness || [];
        const medicalQuestions = data?.questions?.medical || [];

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

      payload.selected_option_ids = optionIdToSend ? [optionIdToSend] : [];

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

    } else if (questionType === "boolean") {
      payload.answer_boolean = answer === true;

    } else if (questionType === "text") {
      payload.answer_text = answer;

    } else if (questionType === "number") {
      payload.answer_number =
        typeof answer === "number"
          ? answer
          : parseInt(answer) || parseFloat(answer);
    }

    try {
      const res  = await questionnaireService.submitAnswer(qId, payload);
      const data = res.data?.data;

      if (!coinsEarned.has(qId)) {
        setCoins((c) => c + COINS_PER_QUESTION);
        setCoinsEarned((prev) => new Set([...prev, qId]));
      }

      if (data?.profile_completed) {
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
      console.error("Submit error:", err);
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
          onClick={onComplete}
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
    <div className="min-h-screen bg-black text-white flex flex-col relative ">

      {/* TOP PROGRESS BAR */}
      <div className="flex items-center justify-between mb-8">
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
      </div>

      {/* WATER BALL */}
      <div className="flex justify-center font-Poppins text-sm mb-3">
        <WaterBall progress={progress} />
      </div>

      {/* QUESTION CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-center mb-8">
        <div className="text-sm uppercase tracking-wide font-semibold mb-2">
          💪 FITNESS
        </div>
        <h2 className="text-lg font-semibold">{current?.question_text}</h2>
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
                className={`w-full py-4 rounded-xl border transition ${
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
        className="bottom-6 w-96 font-Poppins mt-8 justify-center items-center py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        Continue
      </button>

    </div>
  );
}