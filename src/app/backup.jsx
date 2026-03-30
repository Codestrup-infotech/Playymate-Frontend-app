

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


////////////////////////////////////////////////////////////



"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getQuestionnaireSession,
  startQuestionnaireSession,
  getCategoryIntro,
  getCategoryItems,
  getItemQuestions,
  submitAnswer,
  saveSelection,
} from "@/lib/api/categoryApi";

export default function CategorySelection() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState(null);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);

  const [introData, setIntroData] = useState(null);
  const [itemsData, setItemsData] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [qIndex, setQIndex] = useState(0);

  const [screen, setScreen] = useState("loading");
  const [showPopup, setShowPopup] = useState(false);
  
  // Popup states for dynamic messages
  const [noQuestionsPopup, setNoQuestionsPopup] = useState(null); // { itemName, itemKey }
  const [itemCompletedPopup, setItemCompletedPopup] = useState(null); // { itemName, itemKey }

  // Track completed categories for visual indication
  const [completedCategories, setCompletedCategories] = useState([]);

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  /* ================= INIT ================= */

  useEffect(() => {
    initialize();
  }, []);

  // async function initialize() {
  //   try {
  //     setScreen("loading");
      
  //     console.log('=== INITIALIZE QUESTIONNAIRE ===');
  //     console.log('Token available:', !!token);
  //     console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
  //     // STEP 1: Try to get existing session (resume from where user left off)
  //     let session = null;
      
  //     try {
  //       console.log('Calling getQuestionnaireSession...');
  //       const response = await getQuestionnaireSession(token);
  //       console.log('API Response raw:', response);
  //       console.log('Response type:', typeof response);
  //       console.log('Response keys:', response ? Object.keys(response) : 'N/A');
        
  //       // getQuestionnaireSession returns null if no session, or session object
  //       session = response;
        
  //       if (session) {
  //         console.log('✅ Existing session found:', session);
  //         console.log('Session ID:', session.session_id);
  //         console.log('Current category key:', session.current_category_key);
  //       } else {
  //         console.log('❌ No active session found, will start new');
  //       }
  //     } catch (err) {
  //       console.log('❌ No existing session error:', err.message);
  //       console.log('Error details:', err);
  //       // No existing session - will start new one below
  //     }
      
  //     // STEP 2: If we have an existing session, resume from it
  //     if (session && session.session_id) {
  //       console.log('>>> RESUMING EXISTING SESSION');
  //       setSessionId(session.session_id);
  //       setCurrentCategoryKey(session.current_category_key);
        
  //       // Track completed categories
  //       if (session.completed_categories) {
  //         setCompletedCategories(
  //           session.completed_categories.map(c => c.category_key)
  //         );
  //       }
        
  //       // Check what stage user is in
  //       const currentStage = session.current_stage;
  //       const currentItem = session.current_item_key;
        
  //       console.log('=== RESUMING QUESTIONNAIRE ===');
  //       console.log('Current category key:', session.current_category_key);
  //       console.log('Current item key:', currentItem);
  //       console.log('Current stage:', currentStage);
  //       console.log('Completed categories:', session.completed_categories);
  //       console.log('==============================');
        
  //       // If user was in the middle of answering questions for an item
  //       if (currentItem && currentStage === 'answering_questions') {
  //         console.log('User was answering questions for item:', currentItem);
  //         // Resume the questions for this item
  //         await resumeItemQuestions(session.current_category_key, currentItem);
  //         return;
  //       }
        
  //       // Otherwise, load the current category (intro or items)
  //       // This is key - we load the CURRENT category, not the first one
  //       console.log('Loading intro for category:', session.current_category_key);
  //       await loadIntro(session.current_category_key);
  //       return;
  //     }
      
  //     // STEP 3: No existing session - start fresh
  //     console.log('>>> STARTING NEW SESSION');
  //     console.log('Starting new questionnaire session');
  //     session = await startQuestionnaireSession(token, false);
  //     console.log('New session created:', session);
  //     console.log('New session current_category_key:', session.current_category_key);
  //     setSessionId(session.session_id);
  //     setCurrentCategoryKey(session.current_category_key);
      
  //     // Load the first category intro
  //     await loadIntro(session.current_category_key);
  //   } catch (err) {
  //     console.error("Initialize error:", err);
  //     setScreen("error");
  //   }
  // }
async function initialize() {
  try {
    setScreen("loading");

    console.log("=== INITIALIZE QUESTIONNAIRE ===");

    let session = null;

    /* ===============================
       STEP 1: CHECK EXISTING SESSION
    =============================== */

    try {
      console.log("Checking existing session...");
      session = await getQuestionnaireSession(token);

      if (session) {
        console.log("Existing session found:", session);
      } else {
        console.log("No existing session");
      }
    } catch (err) {
      console.log("Session check failed:", err.message);
    }

    /* ===============================
       STEP 2: RESUME EXISTING SESSION
    =============================== */

    if (session && session.session_id) {
      console.log(">>> RESUMING SESSION");

      setSessionId(session.session_id);

    let categoryToLoad = session.current_category_key;

if (session.categories_progress?.length) {

  const completedKeys = session.categories_progress
    .filter(c => c.completed === true)
    .map(c => c.category_key);

  setCompletedCategories(completedKeys);

  // find next incomplete category
  const nextCategory = session.categories_progress.find(
    c => c.completed === false
  );

  if (nextCategory) {
    categoryToLoad = nextCategory.category_key;
  }
}

      setCurrentCategoryKey(categoryToLoad);

      const currentStage = session.current_stage;
      const currentItem = session.current_item_key;

      console.log("Resume info:", {
        categoryToLoad,
        currentStage,
        currentItem,
      });

      /* Resume question if user was answering */
      if (currentItem && currentStage === "answering_questions") {
        await resumeItemQuestions(categoryToLoad, currentItem);
        return;
      }

      /* Otherwise load category intro */
      await loadIntro(categoryToLoad);
      return;
    }

    /* ===============================
       STEP 3: START NEW SESSION
    =============================== */

    console.log(">>> STARTING NEW SESSION");

    const newSession = await startQuestionnaireSession(token, false);

    setSessionId(newSession.session_id);
    setCurrentCategoryKey(newSession.current_category_key);

    await loadIntro(newSession.current_category_key);

  } catch (err) {
    console.error("Initialize error:", err);
    setScreen("error");
  }
}
  /* ================= RESUME ITEM QUESTIONS ================= */
  
  async function resumeItemQuestions(categoryKey, itemKey) {
    try {
      setCurrentCategoryKey(categoryKey);
      setCurrentItemKey(itemKey);
      
      // Get category items first (to show which item was being answered)
      const itemsRes = await getCategoryItems(categoryKey, sessionId);
      setItemsData(itemsRes);
      
      // Get questions for the item
      const data = await getItemQuestions(token, itemKey, sessionId);
      
      let questionsList = [];
      if (data.questions) {
        questionsList = data.questions;
      } else if (Array.isArray(data)) {
        questionsList = data;
      } else if (data.data?.questions) {
        questionsList = data.data.questions;
      }
      
      // Check if there's a current_question_index in the session
      const session = await getQuestionnaireSession(token);
      const qIndex = session.current_question_index || 0;
      
      setQuestions(questionsList);
      setQIndex(qIndex);
      setScreen("questions");
    } catch (err) {
      console.error('Failed to resume item questions:', err);
      // Fallback to loading intro
      await loadIntro(categoryKey);
    }
  }

  /* ================= INTRO ================= */

  async function loadIntro(categoryKey) {
    try {
      const intro = await getCategoryIntro(categoryKey);
      setIntroData(intro);
      setScreen("intro");
      
      // Don't auto-load items - show "Continue" button instead
      // This ensures user sees the intro content
    } catch (err) {
      console.error("Intro error:", err);
      // If intro fails, still load items
      loadItems(categoryKey);
    }
  }

  // Manual continue from intro - explicit user action
  function handleIntroContinue() {
    loadItems(currentCategoryKey);
  }

  /* ================= LOAD ITEMS ================= */

  async function loadItems(categoryKey) {
    try {
      const data = await getCategoryItems(categoryKey, sessionId);
      setItemsData(data);
      setScreen("items");
    } catch (err) {
      console.error("Failed to load items:", err);
      // Show error but still allow user to see items
      setItemsData({ items: [], category_title: categoryKey, max_selection: 0 });
      setScreen("items")
    }
  }

  // Handle back from questions - show completed item popup if applicable
  function handleBackToItems() {
    // Check if current item was completed (no questions or all questions answered)
    if (currentItemKey && itemsData?.items) {
      const currentItem = itemsData.items.find(i => i.key === currentItemKey);
      if (currentItem && currentItem.status === 'completed') {
        const itemDisplayName = getItemDisplayName(currentItem);
        setItemCompletedPopup({
          itemName: itemDisplayName,
          itemKey: currentItemKey
        });
        // Auto-hide popup after 2 seconds
        setTimeout(() => setItemCompletedPopup(null), 2000);
      }
    }
    setScreen("items");
  }

  /* ================= ITEM CLICK ================= */

  // Helper function to get item display name from API response
  function getItemDisplayName(item) {
    return item.title || item.name || item.key;
  }

  async function handleItemClick(itemKey) {
    try {
      // Get the item data from itemsData to find the display name
      const clickedItem = itemsData?.items?.find(i => i.key === itemKey);
      const itemDisplayName = clickedItem ? getItemDisplayName(clickedItem) : itemKey;
      
      // First, set the current item key (this is crucial for the context)
      setCurrentItemKey(itemKey);
      console.log('Item clicked:', itemKey);

      // CRITICAL: Call saveSelection BEFORE getting questions
      // This sets the session's current_item_key to this item
      const selectionRes = await saveSelection(token, sessionId, currentCategoryKey, itemKey);
      console.log('Save selection response:', selectionRes);

      // Now fetch questions - this will set the session context for this item
      const data = await getItemQuestions(token, itemKey, sessionId);
      console.log('Questions response:', data);

      // Handle different response structures
      let questionsList = [];
      if (data.questions) {
        questionsList = data.questions;
      } else if (Array.isArray(data)) {
        questionsList = data;
      } else if (data.data?.questions) {
        questionsList = data.data.questions;
      }
      
      console.log('Questions list:', questionsList);
      
      // CHECK: If no questions for this item, show popup and disable the button
      if (!questionsList || questionsList.length === 0) {
        console.log('No questions for this item:', itemDisplayName);
        setNoQuestionsPopup({
          itemName: itemDisplayName,
          itemKey: itemKey
        });
        // Auto-hide popup after 2 seconds
        setTimeout(() => setNoQuestionsPopup(null), 2000);
        return; // Don't proceed to questions screen
      }
      
      setQuestions(questionsList);
      setQIndex(0);
      setScreen("questions");
    } catch (err) {
      console.error("Question error:", err);
    }
  }

  /* ================= SUBMIT ANSWER ================= */

  async function handleAnswer(optionId) {
    // Safety check
    if (!questions || questions.length === 0 || !questions[qIndex]) {
      console.error('No questions available');
      setScreen("items");
      return;
    }
    
    const question = questions[qIndex];

    // Store session info in local variables at the start to avoid state issues
    const sessionIdAtCompletion = sessionId;
    const categoryKeyAtCompletion = currentCategoryKey;
    const itemKeyAtCompletion = currentItemKey;
    
    try {
      // CRITICAL: Ensure we use the correct currentItemKey that was set when loading questions
      // This item_key must match what was used in getItemQuestions
      console.log('Submitting answer with:', {
        session_id: sessionIdAtCompletion,
        category_key: categoryKeyAtCompletion,
        item_key: itemKeyAtCompletion,
        question_id: question.question_id
      });
      
      const submitRes = await submitAnswer(token, {
        session_id: sessionIdAtCompletion,
        category_key: categoryKeyAtCompletion,
        item_key: itemKeyAtCompletion,
        question_id: question.question_id,
        selected_option_ids: [optionId],
      });
      
      console.log('Submit answer response:', submitRes);

      // Check if item is complete based on response
      const isItemComplete = submitRes?.item_complete === true;
      const isCategoryComplete = submitRes?.category_complete === true;
      const nextAction = submitRes?.next_action;
      const nextCategoryKey = submitRes?.next_category_key;
      
      // DEBUG: Log all values from response
      console.log('=== DEBUG: Category Completion ===');
      console.log('Full submitRes:', JSON.stringify(submitRes, null, 2));
      console.log('isItemComplete:', isItemComplete);
      console.log('isCategoryComplete:', isCategoryComplete);
      console.log('nextAction:', nextAction);
      console.log('nextCategoryKey:', nextCategoryKey);
      console.log('qIndex:', qIndex);
      console.log('questions.length:', questions.length);
      console.log('=================================');

      // Next question inside same item (if item not complete yet)
      if (!isItemComplete && qIndex < questions.length - 1) {
        setQIndex((prev) => prev + 1);
        return;
      }

      // ===== ITEM COMPLETED - All questions answered =====
      console.log('All questions answered for item:', itemKeyAtCompletion);
      console.log('Session info - sessionId:', sessionIdAtCompletion, 'categoryKey:', categoryKeyAtCompletion);
      
      // Show popup after item completed
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      // Use the submitAnswer response directly to determine next steps
      // This is more reliable than calling getCategoryItems
      if (isCategoryComplete && nextCategoryKey) {
        console.log('Category complete! Moving to next category:', nextCategoryKey);
        
        // Move to next category
        setCurrentCategoryKey(nextCategoryKey);
        
        // Load intro for next category
        try {
          const nextIntro = await getCategoryIntro(nextCategoryKey);
          console.log('Next category intro:', nextIntro);
          setIntroData(nextIntro);
        } catch (introErr) {
          console.error('Failed to load next intro:', introErr);
        }
        setScreen("intro");
        return;
      }
      
      if (isCategoryComplete && !nextCategoryKey) {
        console.log('All categories complete! Going to home');
        router.push("/onboarding/experience");
        return;
      }

      // If category is not complete, refresh the items list
      console.log('Category not complete, refreshing category data...');
      
      // Small delay to ensure backend processes everything
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Calling getCategoryItems with:', { categoryKey: categoryKeyAtCompletion, sessionId: sessionIdAtCompletion });
      
      const refreshed = await getCategoryItems(
        categoryKeyAtCompletion,
        sessionIdAtCompletion
      );

      console.log('Raw refresh response:', refreshed);

      console.log('Refreshed category data:', refreshed);

      // DEBUG: Log all fields
      console.log('=== DEBUG: After getCategoryItems ===');
      console.log('selected_count:', refreshed.selected_count);
      console.log('completed_count:', refreshed.completed_count);
      console.log('max_selection:', refreshed.max_selection);
      console.log('completed_items:', refreshed.completed_items);
      console.log('category_complete:', refreshed.category_complete);
      console.log('next_category_key:', refreshed.next_category_key);
      console.log('=====================================');

      // Check various fields to determine completion status
      const selectedCount = refreshed.selected_count;
      const completedCount = refreshed.completed_count;
      const maxSelection = refreshed.max_selection;
      const completedItems = refreshed.completed_items || [];
      const categoryComplete = refreshed.category_complete;

      console.log('Counts - Selected:', selectedCount, 'Completed:', completedCount, 'Max:', maxSelection);
      console.log('Completed items:', completedItems);
      console.log('Category complete:', categoryComplete);

      // Check if we have completed enough items (either via selected_count or completed_count)
      const effectiveCompletedCount = completedCount || completedItems.length || 0;
      
      // ===== CASE 1: Category NOT complete =====
      // Either we haven't selected max items yet, or category is not complete
      if (!categoryComplete && effectiveCompletedCount < maxSelection) {
        console.log('Category not complete, showing items');
        setItemsData(refreshed);
        setScreen("items");
        return;
      }

      // ===== CASE 2: Category Complete =====
      if (categoryComplete === true) {
        const nextCategoryKey = refreshed.next_category_key;
        console.log('Category complete, next category:', nextCategoryKey);

        // 🔥 ALL CATEGORIES FINISHED → GO TO HOME
        if (!nextCategoryKey) {
          console.log('No more categories, going to home');
          router.push("/onboading/experience");
          return;
        }

        // Move to next category
        setCurrentCategoryKey(nextCategoryKey);

        // Load intro for next category
        const nextIntro = await getCategoryIntro(nextCategoryKey);
        console.log('Next category intro:', nextIntro);
        setIntroData(nextIntro);
        setScreen("intro");

        // Don't auto-load items - let user tap Continue
        return;
      }

      // Fallback: If we've completed at least 1 item and max is reached, try next category
      if (effectiveCompletedCount >= maxSelection) {
        const nextCategoryKey = refreshed.next_category_key;
        if (nextCategoryKey) {
          console.log('Max items completed, moving to next category:', nextCategoryKey);
          setCurrentCategoryKey(nextCategoryKey);
          const nextIntro = await getCategoryIntro(nextCategoryKey);
          setIntroData(nextIntro);
          setScreen("intro");
          return;
        }
      }

      // Default: return to items screen
      console.log('Default: showing items screen');
      setItemsData(refreshed);
      setScreen("items");
    } catch (err) {
      console.error("Submit answer error:", err);
      alert("Failed to save answer. Please try again.");
    }
  }

  /* ================= UI ================= */

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-pink-500 text-xl mb-2">Loading...</div>
          <p className="text-gray-400 text-sm">Setting up your preferences</p>
        </div>
      </div>
    );
  }

  if (screen === "error") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-red-500 text-5xl mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-center mb-6">Failed to load questionnaire. Please try again.</p>
        <button
          onClick={() => initialize()}
          className="px-8 py-3 bg-pink-500 rounded-full text-white font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">

      {/* INTRO */}
      {screen === "intro" && introData && (
        <div className="max-w-md w-full flex flex-col  text-center justify-center items-center space-y-6">
          {/* <h1 className="text-2xl mb-8 font-bold text-white text-md font-Playfair Display ">
            {introData?.intro?.title_text}
          </h1> */}

          {introData?.intro?.media_url && (
            <img
              src={introData.intro.media_url}
              alt="intro"
              className="w-80 h-96 rounded-2xl "
            />
          )}

          {introData?.intro?.subtitle_text && (
            <p className="text-white text-md font-Playfair Display ">
              {introData.intro.subtitle_text}
            </p>
          )}

          {/* Continue button - user must tap to proceed */}
          <button
            onClick={handleIntroContinue}
            className="w-80 text-white py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full font-Poppins font-semibold text-lg"
          >
            Get Started
          </button>
        </div>
      )}

      {/* ITEMS */}
      {screen === "items" && itemsData && (

<div className="flex flex-col space-y-6  "> 
  <h2 className="text-2xl font-semibold text-center">
            {itemsData.category_title}
           
          </h2>

          {/* <p className="text-2xl font-semibold text-center">  {itemsData.category_description}</p> */}

          <p className="text-center text-gray-400 font-Poppins">
            Select up to <span className="text-white font-Poppins"> {itemsData.max_selection}{" "}
            {itemsData.category_title}  </span>
          </p>

        <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
          {itemsData.items.map((item) => (
            <button
              key={item.key}
              disabled={item.disabled || item.status === "completed"}
              onClick={() => handleItemClick(item.key)}
              className={`w-52 py-3 rounded-lg border transition
                ${
                  item.disabled || item.status === "completed"
                    ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
                    : "border-pink-500 hover:bg-pink-500"
                }`}
            >
              {item.icon || '🏃'} {item.title || item.name || item.key}
            </button>
          ))}

        </div> 
        
        {/* POPUP: No questions for selected item */}
        {noQuestionsPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <p className="font-semibold">
              No questions under {noQuestionsPopup.itemName}. Choose another!
            </p>
          </div>
        )}
        
        {/* POPUP: Item completed - choose next */}
        {itemCompletedPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <p className="font-semibold">
              {itemCompletedPopup.itemName} is completed! Choose next item.
            </p>
          </div>
        )}
        
        </div>
      )}


      {/* QUESTIONS */}
      {screen === "questions" && questions && questions.length > 0 && (
        <div className="max-w-md flex flex-col justify-center items-center w-full space-y-6">
          {questions[qIndex] ? (
            <>
   {itemsData.items_title}
              <div className="p-6 w-96 rounded-xl  bg-gradient-to-r from-[#1B5CD1] to-[#1EB9EC] text-lg text-white font-Poppins text-center">
                
                {questions[qIndex].question_text}
              </div>

              {questions[qIndex].options && questions[qIndex].options.map((opt) => (
                <button
                  key={opt.option_id}
                  onClick={() => handleAnswer(opt.option_id)}
                  className="w-96 py-3 border border-pink-500 hover:bg-[#e28010] font-Poppins rounded-lg"
                >
                  {opt.label}
                </button>
              ))}
              
              {/* Back button to return to items */}
              <button
                onClick={() => handleBackToItems()}
                className="mt-4 text-gray-400 hover:text-white text-sm"
              >
                ← Back to Items
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400">
              No questions available for this item
            </div>
          )}
        </div>
      )}

      {/* No questions available */}
      {screen === "questions" && (!questions || questions.length === 0) && (
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-gray-400">No questions available for this item</p>
          <button
            onClick={() => {
              handleBackToItems();
            }}
            className="px-6 py-3 bg-pink-500 rounded-full"
          >
            Back to Items
          </button>
        </div>
      )}
      
      {/* POPUP: No questions for selected item (when back from questions screen) */}
      {noQuestionsPopup && screen !== "items" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="font-semibold">
            No questions under {noQuestionsPopup.itemName}. Choose another!
          </p>
        </div>
      )}
      
      {/* POPUP: Item completed - choose next (when back from questions screen) */}
      {itemCompletedPopup && screen !== "items" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="font-semibold">
            {itemCompletedPopup.itemName} is completed! Choose next item.
          </p>
        </div>
      )}
    </div>
  );
}

/////////////////////////////////

 /// Quetionnary Backup  

 "use client";
 
 import { useEffect, useState, useRef } from "react";
 import { useRouter } from "next/navigation";
 import {
   getQuestionnaireSession,
   startQuestionnaireSession,
   getCategoryIntro,
   getCategoryItems,
   getItemQuestions,
   submitAnswer,
   saveSelection,
   completeQuestionnaire,
   getCategoryCompletion,
 } from "@/lib/api/categoryApi";
 import SportProgressBar from "@/app/components/SportProgressBar";
 
 export default function CategorySelection() {
   const router = useRouter();
 
   const [sessionId, setSessionId] = useState(null);
   const [currentCategoryKey, setCurrentCategoryKey] = useState(null);
 
   const [introData, setIntroData] = useState(null);
   const [itemsData, setItemsData] = useState(null);
 
   const [questions, setQuestions] = useState([]);
   const [currentItemKey, setCurrentItemKey] = useState(null);
   const [qIndex, setQIndex] = useState(0);
 
   const [screen, setScreen] = useState("loading");
   const [showPopup, setShowPopup] = useState(false);
   
   // Popup states for dynamic messages
   const [noQuestionsPopup, setNoQuestionsPopup] = useState(null); // { itemName, itemKey }
   const [itemCompletedPopup, setItemCompletedPopup] = useState(null); // { itemName, itemKey }
 
   // Track completed categories for visual indication
   const [completedCategories, setCompletedCategories] = useState([]);
   
   // Store full session data for tracking item completion status
   const [sessionData, setSessionData] = useState(null);
 
   const [progressPercentage, setProgressPercentage] = useState(0);
 const [pendingCoins, setPendingCoins] = useState(0);
 
 const [selectedOption, setSelectedOption] = useState(null);
 const [remainingSlots, setRemainingSlots] = useState(null);
 
 const [completionData, setCompletionData] = useState(null);
 
  // ✅ ADD HERE
   const completedItemsCount =
     itemsData?.items?.filter(
       (item) => item.status === "completed" || item.is_completed
     ).length || 0;
 
   const remainingItems =
     itemsData?.max_selection - completedItemsCount;
 
 const [rewardScreen, setRewardScreen] = useState(false);
 const [earnedCoins, setEarnedCoins] = useState(0);
 
 const colorPalette = [
   { card: "from-[#1B5CD1] to-[#1EB9EC]", hover: "hover:bg-[#1EB9EC]" },
   { card: "from-[#9333EA] to-[#6366F1]", hover: "hover:bg-[#6366F1]" },
   { card: "from-[#14B8A6] to-[#22C55E]", hover: "hover:bg-[#22C55E]" },
 ];
 
 const gradient = colorPalette[qIndex % colorPalette.length];
   const token =
     typeof window !== "undefined"
       ? sessionStorage.getItem("access_token")
       : null;
 
   /* ================= INIT ================= */
 
   useEffect(() => {
     initialize();
   }, []);
 
   
 async function initialize() {
   try {
     setScreen("loading");
 
     console.log("=== INITIALIZE QUESTIONNAIRE ===");
 
     let session = null;
 
     /* ===============================
        STEP 1: CHECK EXISTING SESSION
     =============================== */
 
     try {
       console.log("Checking existing session...");
       session = await getQuestionnaireSession(token);
 
       if (session) {
         console.log("Existing session found:", session);
       } else {
         console.log("No existing session");
       }
     } catch (err) {
       console.log("Session check failed:", err.message);
     }
 
     /* ===============================
        STEP 2: RESUME EXISTING SESSION
     =============================== */
 
     if (session && session.session_id) {
       console.log(">>> RESUMING SESSION");
 
       setSessionId(session.session_id);
       setSessionData(session); // Store full session data
       if (session?.overall_progress?.percentage === 100) {
   console.log("All preference categories already completed");
 
   // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
   try {
     const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
     await completeQuestionnaire(token, session.session_id);
     console.log("Questionnaire completed successfully");
   } catch (completeErr) {
     console.error("Error completing questionnaire:", completeErr);
   }
 
   router.push("/onboarding/experience");
   return;
 }
 
       // DEBUG: Log full session data
       console.log('=== DEBUG: Full session data ===');
       console.log('current_category_key:', session.current_category_key);
       console.log('categories_progress:', session.categories_progress);
       console.log('completed_categories:', session.completed_categories);
       console.log('all_session_data:', JSON.stringify(session, null, 2));
       console.log('=== End session data ===');
 
     let categoryToLoad = session.current_category_key;
 
 if (session.categories_progress?.length) {
 
   const completedKeys = session.categories_progress
     .filter(c => c.completed === true)
     .map(c => c.category_key);
 
   setCompletedCategories(completedKeys);
 
   // DEBUG: Log each category's progress
   console.log('=== Category Progress Details ===');
   session.categories_progress.forEach(cat => {
     console.log(`${cat.category_key}: percentage=${cat.percentage}%, selected=${cat.selected_items?.length}, completed=${cat.completed_items?.length}, in_progress=${cat.in_progress_item}`);
   });
   console.log('=== End Category Progress ===');
 
   // find next incomplete category (percentage < 100)
   // This handles both cases: categories with completed=false AND categories with percentage < 100
   const nextCategory = session.categories_progress.find(
     c => c.percentage < 100
   );
 
   if (nextCategory) {
     console.log('Next incomplete category:', nextCategory.category_key);
     categoryToLoad = nextCategory.category_key;
   }
 }
       // Also check completed_categories array
       else if (session.completed_categories?.length) {
         console.log('Completed categories from session:', session.completed_categories);
         setCompletedCategories(session.completed_categories);
         
         // If current category is in completed list, try to find next category
         if (session.completed_categories.includes(session.current_category_key)) {
           console.log('Current category is completed, need to find next');
           // TODO: Get next category - would need another API call or from categories_progress
         }
       }
 
       setCurrentCategoryKey(categoryToLoad);
 
       const currentStage = session.current_stage;
       const currentItem = session.current_item_key;
 
       console.log("Resume info:", {
         categoryToLoad,
         currentStage,
         currentItem,
       });
 
       /* Resume question if user was answering */
       if (currentItem && currentStage === "answering_questions") {
         await resumeItemQuestions(categoryToLoad, currentItem, session.session_id);
         return;
       }
 
       /* Otherwise load category intro */
       await loadIntro(categoryToLoad);
       return;
     }
 
     /* ===============================
        STEP 3: START NEW SESSION
     =============================== */
 
     console.log(">>> STARTING NEW SESSION");
 
     const newSession = await startQuestionnaireSession(token, false);
     console.log('[CategorySelection] New session created:', newSession);
     
     // After starting session, get full session details with session_id
     // This follows the API doc: Get Session Status with session_id
     const sessionDetails = await getQuestionnaireSession(token, newSession.session_id);
     console.log('[CategorySelection] Session details:', sessionDetails);
     
     // Use the session details
     const sessionToUse = sessionDetails || newSession;
     setSessionId(sessionToUse.session_id);
     setCurrentCategoryKey(sessionToUse.current_category_key);
 
     await loadIntro(sessionToUse.current_category_key);
 
   } catch (err) {
     console.error("Initialize error:", err);
     
     // Check if error is due to physical profile not complete
     const errorData = err.response?.data || err.data;
     if (errorData?.error_code === 'PHYSICAL_PROFILE_REQUIRED') {
       console.log('[CategorySelection] Physical profile required, redirecting to /onboarding/physical');
       router.push('/onboarding/physical');
       return;
     }
     
     setScreen("error");
   }
 }
   /* ================= RESUME ITEM QUESTIONS ================= */
   
   async function resumeItemQuestions(categoryKey, itemKey, sessionIdOverride = null) {
     try {
       // Use passed sessionId or fall back to state
       const activeSessionId = sessionIdOverride || sessionId;
       
       console.log('[resumeItemQuestions] Using sessionId:', activeSessionId);
       
       setCurrentCategoryKey(categoryKey);
       setCurrentItemKey(itemKey);
       
       // Get category items first (to show which item was being answered)
       const itemsRes = await getCategoryItems(categoryKey, activeSessionId);
       setItemsData(itemsRes);
       
       // Get questions for the item
       const data = await getItemQuestions(token, itemKey, activeSessionId);
       
       let questionsList = [];
       if (data.questions) {
         questionsList = data.questions;
       } else if (Array.isArray(data)) {
         questionsList = data;
       } else if (data.data?.questions) {
         questionsList = data.data.questions;
       }
       
       // Get current question index from session
       let qIndex = 0;
       try {
         const session = await getQuestionnaireSession(token, activeSessionId);
         if (session && session.current_question_index) {
           qIndex = session.current_question_index;
           console.log('[resumeItemQuestions] Resuming from question index:', qIndex);
         }
       } catch (e) {
         console.log('[resumeItemQuestions] Could not get session for qIndex');
       }
       
      setQuestions(questionsList);
 
 if (qIndex >= questionsList.length) {
   console.warn("Question index exceeded questions length, resetting");
 
   setCurrentItemKey(null);
   setScreen("items");
   return;
 }
 
 setQIndex(qIndex);
 setScreen("questions");
     } catch (err) {
       console.error('Failed to resume item questions:', err);
       // Fallback to loading intro
       await loadIntro(categoryKey);
     }
   }
 
   /* ================= INTRO ================= */
 
   async function loadIntro(categoryKey) {
     try {
       const intro = await getCategoryIntro(categoryKey);
       setIntroData(intro);
       setScreen("intro");
       
       // Don't auto-load items - show "Continue" button instead
       // This ensures user sees the intro content
     } catch (err) {
       console.error("Intro error:", err);
       // If intro fails, still load items
       loadItems(categoryKey);
     }
   }
 
   // Manual continue from intro - explicit user action
   function handleIntroContinue() {
     loadItems(currentCategoryKey);
   }
 
   /* ================= LOAD ITEMS ================= */
 
   async function loadItems(categoryKey) {
     try {
       const data = await getCategoryItems(categoryKey, sessionId);
       setItemsData(data);
       setScreen("items");
     } catch (err) {
       console.error("Failed to load items:", err);
       // Show error but still allow user to see items
       setItemsData({ items: [], category_title: categoryKey, max_selection: 0 });
       setScreen("items")
     }
   }
 
   // Handle back from questions - show completed item popup if applicable
   function handleBackToItems() {
     // Check if current item was completed (no questions or all questions answered)
     if (currentItemKey && itemsData?.items) {
       const currentItem = itemsData.items.find(i => i.key === currentItemKey);
       if (currentItem && currentItem.status === 'completed') {
         const itemDisplayName = getItemDisplayName(currentItem);
         setItemCompletedPopup({
           itemName: itemDisplayName,
           itemKey: currentItemKey
         });
         // Auto-hide popup after 2 seconds
         setTimeout(() => setItemCompletedPopup(null), 2000);
       }
     }
     setScreen("items");
   }
 
   /* ================= ITEM CLICK ================= */
 
   // Helper function to get item display name from API response
   function getItemDisplayName(item) {
     return item.title || item.name || item.key;
   }
 
 //   async function handleItemClick(itemKey) {
 //     try {
 //       // Get the item data from itemsData to find the display name
 //     const clickedItem = itemsData?.items?.find(i => i.key === itemKey);
 
 // if (clickedItem?.status === "completed" || clickedItem?.is_completed) {
 //   console.log("Item already completed, ignoring click");
 //   return;
 // }
 //       const itemDisplayName = clickedItem ? getItemDisplayName(clickedItem) : itemKey;
       
 //       // First, set the current item key (this is crucial for the context)
 //       setCurrentItemKey(itemKey);
 //       console.log('Item clicked:', itemKey);
 
 //       // CRITICAL: Call saveSelection BEFORE getting questions
 //       // This sets the session's current_item_key to this item
 //       const selectionRes = await saveSelection(token, sessionId, currentCategoryKey, itemKey);
 //       console.log('Save selection response:', selectionRes);
 
 //       // Now fetch questions - this will set the session context for this item
 //       const data = await getItemQuestions(token, itemKey, sessionId);
 //       console.log('Questions response:', data);
 
 //       // Handle different response structures
 //       let questionsList = [];
 //       if (data.questions) {
 //         questionsList = data.questions;
 //       } else if (Array.isArray(data)) {
 //         questionsList = data;
 //       } else if (data.data?.questions) {
 //         questionsList = data.data.questions;
 //       }
       
 //       console.log('Questions list:', questionsList);
       
 //       // CHECK: If no questions for this item, show popup and disable the button
 //       // if (!questionsList || questionsList.length === 0) {
 //       //   console.log('No questions for this item:', itemDisplayName);
 //       //   setNoQuestionsPopup({
 //       //     itemName: itemDisplayName,
 //       //     itemKey: itemKey
 //       //   });
 //       //   // Auto-hide popup after 2 seconds
 //       //   setTimeout(() => setNoQuestionsPopup(null), 2000);
 //       //   return; // Don't proceed to questions screen
 //       // }
 
 //       if (!questionsList || questionsList.length === 0) {
 
 //   console.log("No questions for item:", itemDisplayName);
 
 //   // show popup
 //   setNoQuestionsPopup({
 //     itemName: itemDisplayName,
 //     itemKey: itemKey,
 //   });
 
 //   // hide popup automatically
 //   setTimeout(() => setNoQuestionsPopup(null), 2000);
 
 //   // IMPORTANT: stay on items screen
 //   setScreen("items");
 
 //   return; // stop execution
 // }
       
 //       setQuestions(questionsList);
 //       setQIndex(0);
 //       setScreen("questions");
 //     } catch (err) {
 //       console.error("Question error:", err);
 //     }
 //   }
 async function handleItemClick(itemKey) {
   // Get item name first (available for error handling)
   const clickedItem = itemsData?.items?.find(i => i.key === itemKey);
   const itemDisplayName = getItemDisplayName(clickedItem);
   
   try {
     setCurrentItemKey(itemKey);
 
     // FIRST get questions
     const data = await getItemQuestions(token, itemKey, sessionId);
 
     let questionsList = [];
 
     if (data.questions) questionsList = data.questions;
     else if (Array.isArray(data)) questionsList = data;
     else if (data.data?.questions) questionsList = data.data.questions;
 
     console.log('[loadItemQuestions] Questions loaded:', questionsList.length);
     console.log('[loadItemQuestions] Questions data:', data);
 
     // 🚨 NO QUESTIONS CASE - go back to items and don't count this item
    if (!questionsList || questionsList.length === 0) {
 
   console.warn("Backend returned no questions but item expected to have questions");
 
   setCurrentItemKey(null);
   setScreen("items");
 
   return;
 }
 
     // SAVE selection ONLY if questions exist
     await saveSelection(token, sessionId, currentCategoryKey, itemKey);
 
     setQuestions(questionsList);
     setQIndex(0);
     setScreen("questions");
 
   } catch (err) {
     console.error("Question error:", err);
     
     // Check if item is already completed
     const errorMessage = err.message || "";
     if (errorMessage.includes("already completed") || errorMessage.includes("ITEM_ALREADY_COMPLETED")) {
       setItemCompletedPopup({
         itemName: itemDisplayName,
         itemKey: itemKey,
       });
       setTimeout(() => setItemCompletedPopup(null), 2500);
       setCurrentItemKey(null);
       return;
     }
     
     // Show generic error for other cases
     alert("Failed to load questions. Please try again.");
   }
 }
 
   /* ================= SUBMIT ANSWER ================= */
 
   async function handleAnswer(optionId) {
     // Safety check
     if (!questions || questions.length === 0 || !questions[qIndex]) {
       console.error('No questions available');
       setScreen("items");
       return;
     }
     
     const question = questions[qIndex];
 
     // Store session info in local variables at the start to avoid state issues
     const sessionIdAtCompletion = sessionId;
     const categoryKeyAtCompletion = currentCategoryKey;
     const itemKeyAtCompletion = currentItemKey;
     
     try {
       // CRITICAL: Ensure we use the correct currentItemKey that was set when loading questions
       // This item_key must match what was used in getItemQuestions
       console.log('Submitting answer with:', {
         session_id: sessionIdAtCompletion,
         category_key: categoryKeyAtCompletion,
         item_key: itemKeyAtCompletion,
         question_id: question.question_id
       });
       
       // const submitRes = await submitAnswer(token, {
       //   session_id: sessionIdAtCompletion,
       //   category_key: categoryKeyAtCompletion,
       //   item_key: itemKeyAtCompletion,
       //   question_id: question.question_id,
       //   selected_option_ids: [optionId],
       // });
       
 
       const submitRes = await submitAnswer(token, {
   session_id: sessionIdAtCompletion,
   category_key: categoryKeyAtCompletion,
   item_key: itemKeyAtCompletion,
   question_id: question.question_id,
   selected_option_ids: [optionId],
 });
 
 // update progress
 if (submitRes?.item_progress?.percentage !== undefined) {
   setProgressPercentage(submitRes.item_progress.percentage);
 }
 
 // update coins
 if (submitRes?.reward?.pending_coins !== undefined) {
   setPendingCoins(submitRes.reward.pending_coins);
 }
 
 // update remaining items
 if (submitRes?.remaining_slots !== undefined) {
   setRemainingSlots(submitRes.remaining_slots);
 }
 
 // update progress %
 if (submitRes?.item_progress?.percentage !== undefined) {
   setProgressPercentage(submitRes.item_progress.percentage);
 }
 
 // update earned coins
 if (submitRes?.reward?.pending_coins !== undefined) {
   setPendingCoins(submitRes.reward.pending_coins);
 }
 
       console.log('Submit answer response:', submitRes);
 
       // Check if item is complete based on response
       const isItemComplete = submitRes?.item_complete === true;
       const isCategoryComplete = submitRes?.category_complete === true;
       const nextAction = submitRes?.next_action;
       const nextCategoryKey = submitRes?.next_category_key;
       
       // DEBUG: Log all values from response
       console.log('=== DEBUG: Category Completion ===');
       console.log('Full submitRes:', JSON.stringify(submitRes, null, 2));
       console.log('isItemComplete:', isItemComplete);
       console.log('isCategoryComplete:', isCategoryComplete);
       console.log('nextAction:', nextAction);
       console.log('nextCategoryKey:', nextCategoryKey);
       console.log('qIndex:', qIndex);
       console.log('questions.length:', questions.length);
       console.log('=================================');
 
       // Next question inside same item (if item not complete yet)
       if (!isItemComplete && qIndex < questions.length - 1) {
         setQIndex((prev) => prev + 1);
         return;
       }
 
       // ===== ITEM COMPLETED - All questions answered =====
       console.log('All questions answered for item:', itemKeyAtCompletion);
       console.log('Session info - sessionId:', sessionIdAtCompletion, 'categoryKey:', categoryKeyAtCompletion);
       
       // Show popup after item completed
       setShowPopup(true);
       setTimeout(() => setShowPopup(false), 1500);
 
       // Use the submitAnswer response directly to determine next steps
       // This is more reliable than calling getCategoryItems
       // if (isCategoryComplete && nextCategoryKey) {
       //   console.log('Category complete! Moving to next category:', nextCategoryKey);
         
       //   // Move to next category
       //   setCurrentCategoryKey(nextCategoryKey);
         
       //   // Load intro for next category
       //   try {
       //     const nextIntro = await getCategoryIntro(nextCategoryKey);
       //     console.log('Next category intro:', nextIntro);
       //     setIntroData(nextIntro);
       //   } catch (introErr) {
       //     console.error('Failed to load next intro:', introErr);
       //   }
       //   setScreen("intro");
       //   return;
       // }
 
       // CATEGORY COMPLETED → GO NEXT CATEGORY
 // if (submitRes?.category_complete === true) {
 
 //   const nextCategoryKey = submitRes?.next_category_key;
 
 //   if (nextCategoryKey) {
 //     console.log("Moving to next category:", nextCategoryKey);
 
 //     setCurrentCategoryKey(nextCategoryKey);
 
 //     const nextIntro = await getCategoryIntro(nextCategoryKey);
 //     setIntroData(nextIntro);
 
 //     setScreen("intro");
 //     return;
 //   }
 
 //   // No more categories
 //   console.log("All categories completed");
 //   router.push("/onboarding/experience");
 //   return;
 // }
 
 // if (submitRes?.category_complete) {
 
 //   const nextCategoryKey = submitRes?.next_category_key;
 
 //   // ✅ Mark this category as completed locally
 //   setCompletedCategories(prev => [
 //     ...prev,
 //     categoryKeyAtCompletion
 //   ]);
 
 //   if (nextCategoryKey) {
 
 //     console.log("Moving to next category:", nextCategoryKey);
 
 //     setCurrentItemKey(null);
 //     setCurrentCategoryKey(nextCategoryKey);
 
 //     const nextIntro = await getCategoryIntro(nextCategoryKey);
 
 //     setIntroData(nextIntro);
 //     setScreen("intro");
 
 //     return;
 //   }
 
 //   router.push("/onboarding/experience");
 //   return;
 // }
 
 // if (submitRes?.category_complete) {
 
 //   const nextCategoryKey = submitRes?.next_category_key;
 
 //   // mark category completed locally
 //   setCompletedCategories(prev => [
 //     ...prev,
 //     categoryKeyAtCompletion
 //   ]);
 
 //   // ✅ If next category exists → load it
 //   if (nextCategoryKey) {
 
 //     console.log("Moving to next category:", nextCategoryKey);
 
 //     setCurrentItemKey(null);
 //     setCurrentCategoryKey(nextCategoryKey);
 
 //     const nextIntro = await getCategoryIntro(nextCategoryKey);
 
 //     setIntroData(nextIntro);
 //     setScreen("intro");
 
 //     return;
 //   }
 
 //   // ✅ If no next category → onboarding finished
 //   console.log("All categories completed. Redirecting...");
 
 //   // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
 //   try {
 //     const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
 //     await completeQuestionnaire(token, sessionIdAtCompletion);
 //     console.log("Questionnaire completed successfully");
 //   } catch (completeErr) {
 //     console.error("Error completing questionnaire:", completeErr);
 //   }
 
 //   console.log("Redirecting to /onboarding/experience...");
 //   // Use window.location for more reliable redirect
 //   if (typeof window !== 'undefined') {
 //     window.location.href = '/onboarding/experience';
 //   } else {
 //     router.push("/onboarding/experience");
 //   }
 //   return;
 // }
 // if (submitRes?.category_complete) {
 
 //   const nextCategoryKey = submitRes?.next_category_key;
 
 //   const coins = Math.floor(submitRes?.reward?.pending_coins || 0);
 
 //   setEarnedCoins(coins);
 //   setRewardScreen(true);
 
 //   setTimeout(async () => {
 
 //     setRewardScreen(false);
 
 //     if (nextCategoryKey) {
 
 //       setCurrentItemKey(null);
 //       setCurrentCategoryKey(nextCategoryKey);
 
 //       const nextIntro = await getCategoryIntro(nextCategoryKey);
 
 //       setIntroData(nextIntro);
 //       setScreen("intro");
 
 //     } else {
 
 //       router.push("/onboarding/experience");
 
 //     }
 
 //   }, 10000);
 
 //   return;
 // }
 if (submitRes?.category_complete) {
 
   const nextCategoryKey = submitRes?.next_category_key;
 
   try {
 
     const completionRes = await getCategoryCompletion(
       token,
       categoryKeyAtCompletion,
       sessionIdAtCompletion
     );
 
     setCompletionData(completionRes.data);
 
     setRewardScreen(true);
 
     setTimeout(async () => {
 
       setRewardScreen(false);
 
       if (nextCategoryKey) {
 
         setCurrentItemKey(null);
         setCurrentCategoryKey(nextCategoryKey);
 
         const nextIntro = await getCategoryIntro(nextCategoryKey);
 
         setIntroData(nextIntro);
         setScreen("intro");
 
       } else {
 
         router.push("/onboarding/experience");
 
       }
 
     }, 2000);
 
   } catch (err) {
     console.error("Completion screen error:", err);
   }
 
   return;
 }
       
       if (isCategoryComplete && !nextCategoryKey) {
         console.log('All categories complete! Going to experience');
 
         // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
         try {
           const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
           await completeQuestionnaire(token, sessionIdAtCompletion);
           console.log("Questionnaire completed successfully");
         } catch (completeErr) {
           console.error("Error completing questionnaire:", completeErr);
         }
 
         console.log("Redirecting to /onboarding/experience (second location)...");
         // Use window.location for more reliable redirect
         if (typeof window !== 'undefined') {
           window.location.href = '/onboarding/experience';
         } else {
           router.push("/onboarding/experience");
         }
         console.log("After router.push (second) - this should not appear if redirect works");
         return;
       }
 
       // If category is not complete, refresh the items list
       console.log('Category not complete, refreshing category data...');
       
       // Small delay to ensure backend processes everything
       await new Promise(resolve => setTimeout(resolve, 500));
       
       console.log('Calling getCategoryItems with:', { categoryKey: categoryKeyAtCompletion, sessionId: sessionIdAtCompletion });
       
       const refreshed = await getCategoryItems(
         categoryKeyAtCompletion,
         sessionIdAtCompletion
       );
 
       // Refresh session data to get updated completion status
       try {
         const updatedSession = await getQuestionnaireSession(token, sessionIdAtCompletion);
         if (updatedSession) {
           setSessionData(updatedSession);
           console.log('[WORKAROUND] Updated sessionData from API');
         }
       } catch (e) {
         console.log('[WORKAROUND] Could not refresh sessionData:', e);
       }
 
       console.log('Raw refresh response:', refreshed);
 
       // DEBUG: Log each item to see structure
       console.log('=== DEBUG: Items structure ===');
       if (refreshed.items && Array.isArray(refreshed.items)) {
         refreshed.items.forEach((item, idx) => {
           console.log(`Item ${idx}:`, JSON.stringify(item));
         });
       }
       console.log('=== End Items structure ===');
 
       console.log('Refreshed category data:', refreshed);
 
       // DEBUG: Log all fields
       console.log('=== DEBUG: After getCategoryItems ===');
       console.log('selected_count:', refreshed.selected_count);
       console.log('completed_count:', refreshed.completed_count);
       console.log('max_selection:', refreshed.max_selection);
       console.log('completed_items:', refreshed.completed_items);
       console.log('category_complete:', refreshed.category_complete);
       console.log('next_category_key:', refreshed.next_category_key);
       console.log('=====================================');
 
       // Check various fields to determine completion status
       const selectedCount = refreshed.selected_count;
       const completedCount = refreshed.completed_count;
       const maxSelection = refreshed.max_selection;
       const completedItems = refreshed.completed_items || [];
       const categoryComplete = refreshed.category_complete;
 
       console.log('Counts - Selected:', selectedCount, 'Completed:', completedCount, 'Max:', maxSelection);
       console.log('Completed items:', completedItems);
       console.log('Category complete:', categoryComplete);
 
       // ===== WORKAROUND: Use sessionData to get correct completion status =====
       // The getCategoryItems API doesn't return correct completion status
       // So we get it from sessionData which has the correct info
       let effectiveCompletedCount = completedCount || completedItems.length || 0;
       let effectiveSelectedCount = selectedCount;
       
       // Get current category's progress from session data
       if (sessionData && sessionData.categories_progress) {
         const currentCatProgress = sessionData.categories_progress.find(
           c => c.category_key === currentCategoryKey
         );
         
         if (currentCatProgress) {
           const sessionCompletedItems = currentCatProgress.completed_items || [];
           const sessionSelectedItems = currentCatProgress.selected_items || [];
           
           console.log('[WORKAROUND] Session progress for', currentCategoryKey, ':');
           console.log('  selected_items:', sessionSelectedItems);
           console.log('  completed_items:', sessionCompletedItems);
           console.log('  percentage:', currentCatProgress.percentage);
           
           // Use session data if API returned incorrect data
           if (effectiveCompletedCount === 0 && sessionCompletedItems.length > 0) {
             effectiveCompletedCount = sessionCompletedItems.length;
             console.log('[WORKAROUND] Using session completed count:', effectiveCompletedCount);
           }
           if (effectiveSelectedCount === 0 && sessionSelectedItems.length > 0) {
             effectiveSelectedCount = sessionSelectedItems.length;
             console.log('[WORKAROUND] Using session selected count:', effectiveSelectedCount);
           }
         }
       }
       
       console.log('Effective counts - Selected:', effectiveSelectedCount, 'Completed:', effectiveCompletedCount, 'Max:', maxSelection);
       
       // ===== Check if max items reached (workaround for backend not returning correct data) =====
       // If we've completed items in this session (based on the response), check for next category
       if (effectiveCompletedCount >= maxSelection || categoryComplete) {
         console.log('Max items completed or category complete, checking for next category...');
         
         // Try to get next category from session status
         try {
           const sessionData = await getQuestionnaireSession(token, sessionId);
           console.log('Session data for next category:', sessionData);
           
           if (sessionData && sessionData.next_category_key) {
             console.log('Found next category from session:', sessionData.next_category_key);
             setCurrentCategoryKey(sessionData.next_category_key);
             const nextIntro = await getCategoryIntro(sessionData.next_category_key);
             setIntroData(nextIntro);
             setScreen("intro");
             return;
           }
           
           // Also check for next_category in response
           if (refreshed.next_category_key) {
             console.log('Found next category from refresh:', refreshed.next_category_key);
             setCurrentCategoryKey(refreshed.next_category_key);
             const nextIntro = await getCategoryIntro(refreshed.next_category_key);
             setIntroData(nextIntro);
             setScreen("intro");
             return;
           }
         } catch (err) {
           console.log('Error getting session for next category:', err);
         }
         
         // If we still can't find next category but max items reached, try to get from categories list
         if (effectiveCompletedCount >= maxSelection) {
           console.log('Max items completed but no next category found - all categories might be done');
           // Could redirect to experience or show completion
           router.push("/onboarding/experience");
           return;
         }
       }
       
       // ===== CASE 1: Category NOT complete =====
       // Either we haven't selected max items yet, or category is not complete
       if (!categoryComplete && effectiveCompletedCount < maxSelection) {
         console.log('Category not complete, showing items');
         setItemsData(refreshed);
         setScreen("items");
         return;
       }
 
       // Default: return to items screen
       console.log('Default: showing items screen');
       setItemsData(refreshed);
       setScreen("items");
     }
     
     
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
     
     catch (err) {
       console.error("Submit answer error:", err);
       alert("Failed to save answer. Please try again.");
     }
   }
 
   /* ================= UI ================= */
 
   if (screen === "loading") {
     return (
       <div className="min-h-screen bg-black text-white flex items-center justify-center">
         <div className="text-center">
           <div className="animate-pulse text-pink-500 text-xl mb-2">Loading...</div>
           <p className="text-gray-400 text-sm">Setting up your preferences</p>
         </div>
       </div>
     );
   }
 
   if (screen === "error") {
     return (
       <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
         <div className="text-red-500 text-5xl mb-4"></div>
         <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
         <p className="text-gray-400 text-center mb-6">Failed to load questionnaire. Please try again.</p>
         <button
           onClick={() => initialize()}
           className="px-8 py-3 bg-pink-500 rounded-full text-white font-semibold"
         >
           Try Again
         </button>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">
 
       {/* INTRO */}
       {screen === "intro" && introData && (
         <div className="max-w-md w-full flex flex-col  text-center justify-center items-center space-y-6">
           {/* <h1 className="text-2xl mb-8 font-bold text-white text-md font-Playfair Display ">
             {introData?.intro?.title_text}
           </h1> */}
 
           {introData?.intro?.media_url && (
             <img
               src={introData.intro.media_url}
               alt="intro"
               className="w-80 h-96 rounded-2xl "
             />
           )}
 
           {introData?.intro?.subtitle_text && (
             <p className="text-white text-md font-Playfair Display ">
               {introData.intro.subtitle_text}
             </p>
           )}
 
           {/* Continue button - user must tap to proceed */}
           <button
             onClick={handleIntroContinue}
             className="w-80 text-white py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full font-Poppins font-semibold text-lg"
           >
             Get Started
           </button>
         </div>
       )}
 
       {/* ITEMS */}
       {screen === "items" && itemsData && (
 
 <div className="flex flex-col space-y-6  "> 
   <h2 className="text-2xl font-semibold text-center">
             {itemsData.category_title}
            
           </h2>
 
           {/* <p className="text-2xl font-semibold text-center">  {itemsData.category_description}</p> */}
 
           {/* <p className="text-center text-gray-400 font-Poppins">
             Select up to <span className="text-white font-Poppins"> {itemsData.max_selection}{" "}
             {itemsData.category_title}  </span>
           </p> */}
 <p className="text-center text-gray-400 font-Poppins">
   Select up to{" "}
   <span className="text-white font-Poppins">
     {itemsData?.max_selection} {itemsData?.category_title}
   </span>
 
   {(remainingSlots ?? itemsData?.max_selection) > 0 && (
     <span className="text-pink-400 ml-2">
       ({remainingSlots ?? itemsData?.max_selection} more remaining)
     </span>
   )}
 </p>
 
 
         <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
           {itemsData.items.map((item) => (
 //             <button
 //               key={item.key}
 // disabled={
 //   item.disabled ||
 //   item.status === "completed" ||
 //   item.is_completed === true
 // }
 //               onClick={() => handleItemClick(item.key)}
 //             className={`w-52 py-3 rounded-lg border transition
 //   ${
 //     item.status === "completed" || item.is_completed
 //       ? "bg-green-700 border-green-600 opacity-70 cursor-not-allowed"
 //       : item.disabled
 //       ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
 //       : "border-pink-500 hover:bg-pink-500"
 //   }`}
 //             >
 //               {item.icon || '🏃'} {item.title || item.name || item.key}
 //             </button>
 <button
   key={item.key}
   disabled={
     item.disabled ||
     item.status === "completed" ||
     item.is_completed === true
   }
   onClick={() => handleItemClick(item.key)}
   className={`w-52 py-3 rounded-lg border transition flex items-center justify-center gap-2
 
   ${
     item.status === "completed" || item.is_completed
       ? "bg-green-700 border-green-600 text-white cursor-not-allowed"
       : item.disabled
       ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
       : "border-[#ff02c8] hover:bg-[#ff03ea]"
   }
 `}
 >
   {item.icon || "🎯"} {item.title || item.name || item.key}
 
   {(item.status === "completed" || item.is_completed) && (
     <span className="text-green-300 font-bold">✔</span>
   )}
 </button>
 
           ))}
 
         </div> 
         
         {/* POPUP: No questions for selected item */}
         {noQuestionsPopup && (
           <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
             <p className="font-semibold">
               No questions under {noQuestionsPopup.itemName}. Choose another!
             </p>
           </div>
         )}
         
         {/* POPUP: Item completed - choose next */}
         {itemCompletedPopup && (
           <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
             <p className="font-semibold">
               {itemCompletedPopup.itemName} is completed! Choose next item.
             </p>
           </div>
         )}
         
         </div>
       )}
 
 
 
 {/* {rewardScreen && (
   <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center space-y-6">
 
     <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
       Preferences Saved Successfully
     </h1>
 
     <p className="text-gray-400">
       Your experience is now personalized for you.
     </p>
 
     <div className="text-7xl">🪙</div>
 
     <h2 className="text-yellow-400 text-2xl font-semibold">
       You've earned {earnedCoins} Coins
     </h2>
 
   </div>
 )} */}
 {rewardScreen && completionData && (
 
   <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center space-y-6">
 
     <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
       {completionData.completion.title_text}
     </h1>
 
     <p className="text-gray-400">
       {completionData.completion.subtitle_text}
     </p>
 
     {completionData.completion.media_type === "lottie" && (
       <img
         src={completionData.completion.media_url}
         alt="celebration"
         className="w-40 h-40"
       />
     )}
 
     {completionData.completion.show_coins && (
       <h2 className="text-yellow-400 text-2xl font-semibold">
         You've earned {Math.floor(completionData.coins_earned)} Coins
       </h2>
     )}
 
   </div>
 
 )}
 
       {/* QUESTIONS */}
    {screen === "questions" && questions && questions.length > 0 && (
   <div className="max-w-md flex flex-col justify-center items-center w-full space-y-6">
 
  <SportProgressBar
   percentage={progressPercentage}
   pendingCoins={pendingCoins}
   colorStart={gradient.card.split(" ")[0].replace("from-[", "").replace("]", "")}
   colorEnd={gradient.card.split(" ")[1].replace("to-[", "").replace("]", "")}
 />
 
     {questions[qIndex] && qIndex < questions.length ? (
       <>
         <div className={`p-6 w-96 rounded-xl bg-gradient-to-r ${gradient.card} text-lg text-white font-Poppins text-center`}>
           {questions[qIndex].question_text}
         </div>
 
         {questions[qIndex].options &&
           questions[qIndex].options.map((opt) => (
             <button
               key={opt.option_id}
            onClick={() => {
   setSelectedOption(opt.option_id);
   handleAnswer(opt.option_id);
 }}
              className={`w-96 py-3 border font-Poppins rounded-lg transition
 ${
   selectedOption === opt.option_id
     ? "bg-[#474746] border-[#DBD8D4] text-white"
     : `border-[#DBD8D4] ${gradient.hover}`
 }`}
             >
               {opt.label}
             </button>
           ))}
 
         <button
           onClick={() => handleBackToItems()}
           className="mt-4 text-gray-400 hover:text-white text-sm"
         >
           ← Back to Items
         </button>
       </>
     ) : (
       <div className="text-center text-gray-400">
         No questions available for this item
       </div>
     )}
   </div>
 )}
 
       {/* No questions available */}
       {screen === "questions" && (!questions || questions.length === 0) && (
         <div className="max-w-md w-full text-center space-y-4">
           <p className="text-gray-400">No questions available for this item</p>
           <button
             onClick={() => {
               handleBackToItems();
             }}
             className="px-6 py-3 bg-pink-500 rounded-full"
           >
             Back to Items
           </button>
         </div>
       )}
       
       {/* POPUP: No questions for selected item (when back from questions screen) */}
       {noQuestionsPopup && screen !== "items" && (
         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
           <p className="font-semibold">
             No questions under {noQuestionsPopup.itemName}. Choose another!
           </p>
         </div>
       )}
       
       {/* POPUP: Item completed - choose next (when back from questions screen) */}
       {itemCompletedPopup && screen !== "items" && (
         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
           <p className="font-semibold">
             {itemCompletedPopup.itemName} is completed! Choose next item.
           </p>
         </div>
       )}
     </div>
   );
 }  


/////// notification 

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import {
  getAllNotifications,
  getNotificationsByType,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/app/user/notifications";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const TABS = [
  { key: "all",              label: "All",      emoji: "🔔" },
  { key: "unread",           label: "Unread",   emoji: "📌" },
  { key: "post_liked",       label: "Likes",    emoji: "❤️" },
  { key: "reel_liked",       label: "Reels",    emoji: "🎬" },
  { key: "comment_on_post",  label: "Comments", emoji: "💬" },
  { key: "user_followed",    label: "Follows",  emoji: "👥" },
  { key: "message_received", label: "Messages", emoji: "✉️" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SvgIcon = ({ path, size = "5", className = "" }) => (
  <svg className={`w-${size} h-${size} ${className}`} viewBox="0 0 24 24" fill="currentColor">
    <path d={path} />
  </svg>
);

const PATHS = {
  heart:   "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  play:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
  chat:    "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
  reply:   "M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z",
  at:      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47C19.34 17 21 15.34 21 13.43V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
  person:  "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  story:   "M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z",
  mail:    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  phone:   "M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z",
  video:   "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z",
  bell:    "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
  trash:   "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  checks:  "M18 7l-1.41-1.42-6.35 6.35 1.42 1.41L18 7zm-9 9l-4-4-1.42 1.41L9 18.83l10.6-10.6-1.41-1.41L9 16z",
  chevL:   "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z",
  chevR:   "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z",
};

const TYPE_META = {
  post_liked:         { path: PATHS.heart,  color: "#EF3AFF" },
  reel_liked:         { path: PATHS.play,   color: "#FF8319" },
  comment_on_post:    { path: PATHS.chat,   color: "#00D0FF" },
  comment_on_reel:    { path: PATHS.chat,   color: "#00D0FF" },
  reply_to_comment:   { path: PATHS.reply,  color: "#F044FF" },
  user_mentioned:     { path: PATHS.at,     color: "#EF0EFF" },
  user_followed:      { path: PATHS.person, color: "#EF3AFF" },
  story_replied:      { path: PATHS.story,  color: "#FF8319" },
  message_received:   { path: PATHS.mail,   color: "#00D0FF" },
  incoming_call:      { path: PATHS.phone,  color: "#F044FF" },
  livestream_started: { path: PATHS.video,  color: "#EF3AFF" },
  livestream_ended:   { path: PATHS.video,  color: "#FF8319" },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ actor }) => {
  if (!actor?.profile_image_url) {
    return (
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#EF3AFF,#FF8319)" }}
      >
        {actor?.full_name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      src={actor.profile_image_url}
      alt={actor.full_name || "User"}
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
    />
  );
};

const formatTime = (ds) => {
  if (!ds) return "";
  const d = new Date(ds), now = new Date(), diff = now - d;
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dy < 7) return `${dy}d ago`;
  return d.toLocaleDateString();
};

// ─── Pagination bar (exactly like the screenshot) ─────────────────────────────
const PaginationBar = ({ current, total, isDark, perPage, onChange }) => {
  if (total <= 1) return null;

  const textMain = isDark ? "#f0e8ff" : "#1a0a2e";
  const textSub  = isDark ? "#8060a0" : "#9070b0";
  const btnBg    = isDark ? "#1a1428" : "#f3eeff";
  const btnBord  = isDark ? "#2e2248" : "#ddd0f8";
  const wrapBg   = isDark ? "#111118" : "#ffffff";
  const wrapBord = isDark ? "#2e2248" : "#e8d5ff";

  // Smart page list with ellipsis — same logic as the image
  const buildPages = () => {
    const pages = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - current) <= 1) {
        if (pages.length && pages[pages.length - 1] !== "..." && p - pages[pages.length - 1] > 1) {
          pages.push("...");
        }
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6 px-3 sm:px-5 py-3.5 rounded-2xl"
      style={{
        background: wrapBg,
        border: `1px solid ${wrapBord}`,
        boxShadow: isDark
          ? "0 4px 28px #00000060"
          : "0 4px 28px #b090e020",
      }}
    >
      {/* Previous */}
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: btnBg,
          color: textMain,
          border: `1px solid ${btnBord}`,
          fontFamily: "'Sora',sans-serif",
        }}
      >
        <SvgIcon path={PATHS.chevL} size="4" />
        <span>Previous</span>
      </button>

      {/* Page numbers */}
      {buildPages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-sm px-1" style={{ color: textSub }}>
            ···
          </span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => onChange(p)}
            className="w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center flex-shrink-0"
            style={{
              fontFamily: "'Sora',sans-serif",
              ...(current === p
                ? {
                    background: "linear-gradient(135deg,#7B5FF5,#9c6fff)",
                    color: "#fff",
                    boxShadow: "0 0 16px #7B5FF566, 0 2px 8px #7B5FF540",
                    border: "none",
                  }
                : {
                    background: btnBg,
                    color: textMain,
                    border: `1px solid ${btnBord}`,
                  }),
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: btnBg,
          color: textMain,
          border: `1px solid ${btnBord}`,
          fontFamily: "'Sora',sans-serif",
        }}
      >
        <span>Next</span>
        <SvgIcon path={PATHS.chevR} size="4" />
      </button>

      {/* Results count — right side like the image */}
      <span
        className="text-xs sm:text-sm font-medium ml-1"
        style={{ color: textSub, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
      >
        Showing{" "}
        <span style={{ color: textMain, fontWeight: 700 }}>
          {(current - 1) * perPage + 1}–{Math.min(current * perPage, /* total items */ current * perPage)}
        </span>
        {" "}results
      </span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab,     setActiveTab]     = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [deletingIds,   setDeletingIds]   = useState(new Set());

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg         = isDark ? "#0a0a0f"  : "#f5f0ff";
  const cardBg     = isDark ? "#111118"  : "#ffffff";
  const cardUnread = isDark ? "#160f22"  : "#fdf4ff";
  const borderDef  = isDark ? "#1e1a2e"  : "#e8d5ff";
  const borderUrd  = isDark ? "#4a1a6a"  : "#cc80ee";
  const textMain   = isDark ? "#f0e8ff"  : "#1a0a2e";
  const textSub    = isDark ? "#8060a0"  : "#9070b0";
  const tabInact   = isDark ? "#1a1428"  : "#ede5ff";
  const tabInactT  = isDark ? "#8060a0"  : "#7050a0";

  // ── Original logic — untouched ─────────────────────────────────────────────
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res?.data?.unread_count || res?.unread_count || res?.data?.notifications_count || 0);
    } catch {
      setUnreadCount(notifications.filter(n => !n.is_read).length);
    }
  };

  const fetchNotifications = async (type = "all") => {
    try {
      setLoading(true);
      let res;
      if (type === "all")         res = await getAllNotifications();
      else if (type === "unread") res = await getUnreadNotifications();
      else                        res = await getNotificationsByType(type);

      console.log("📢 Notifications API Response:", res);
      console.log("📢 Notifications Data:", res?.data);
      console.log("📢 Notifications List:", res?.data?.notifications);

      setNotifications(res?.data?.notifications || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ── FIX: Instant delete — remove from state first, API call in background ──
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    // Immediately remove from UI — no waiting for API
    setNotifications(prev => {
      const next = prev.filter(n => n._id !== id);
      // Adjust page if we removed the last item on current page
      const newTotal = Math.ceil(next.length / PAGE_SIZE);
      setCurrentPage(cp => Math.min(cp, Math.max(1, newTotal)));
      return next;
    });
    fetchUnreadCount();
    // Fire API silently in background
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    try {
      setActionLoading(true);
      // Clear UI instantly
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      await clearAllNotifications();
    } catch (error) {
      console.error("Error clearing all:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      try {
        await markAsRead(item._id);
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, is_read: true } : n));
        fetchUnreadCount();
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    console.log("Navigate to:", item.notification_type, item.content_id || item._id);
  };

  useEffect(() => {
    fetchNotifications(activeTab);
    fetchUnreadCount();
  }, [activeTab]);

  // ── Pagination slice ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const sliced = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="np-root min-h-screen" style={{ background: bg, color: textMain }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-5 py-5 sm:py-8">

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3">
              <h1 className="sora text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textMain }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span
                  className="sora px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#EF3AFF22,#FF831922)",
                    border: "1px solid #EF3AFF55",
                    color: "#EF3AFF",
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="np-hbtn"
                  style={{
                    background: "linear-gradient(135deg,#EF3AFF1a,#00D0FF1a)",
                    border: "1px solid #EF3AFF44",
                    color: "#EF3AFF",
                  }}
                >
                  <SvgIcon path={PATHS.checks} size="4" />
                  <span className="hidden sm:inline">{actionLoading ? "..." : "Read All"}</span>
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={actionLoading}
                  className="np-hbtn"
                  style={{
                    background: "linear-gradient(135deg,#FF83191a,#FF83191a)",
                    border: "1px solid #FF831944",
                    color: "#FF8319",
                  }}
                >
                  <SvgIcon path={PATHS.trash} size="4" />
                  <span className="hidden sm:inline">{actionLoading ? "..." : "Clear"}</span>
                </button>
              </div>
            )}
          </div>

          {/* ── TABS ── */}
          <div className="np-tabs flex gap-2 overflow-x-auto mb-5 pb-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className="sora flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200"
                style={
                  activeTab === tab.key
                    ? {
                        background: "linear-gradient(135deg,#EF3AFF,#FF8319)",
                        color: "#fff",
                        boxShadow: "0 0 18px #EF3AFF44",
                        border: "none",
                      }
                    : {
                        background: tabInact,
                        color: tabInactT,
                        border: `1px solid ${borderDef}`,
                      }
                }
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── COUNT BAR ── */}
          {notifications.length > 0 && !loading && (
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-sm" style={{ color: textSub }}>
                Showing{" "}
                <span className="sora font-bold" style={{ color: "#EF3AFF" }}>
                  {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, notifications.length)}
                </span>
                {" "}of{" "}
                <span className="sora font-bold" style={{ color: textMain }}>{notifications.length}</span>
              </p>
              <p className="sora text-xs font-medium" style={{ color: textSub }}>
                Page {currentPage}/{totalPages}
              </p>
            </div>
          )}

          {/* ── LOADING SKELETONS ── */}
          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="np-shimmer rounded-2xl"
                  style={{
                    height: "96px",
                    background: cardBg,
                    border: `1px solid ${borderDef}`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && sliced.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#EF3AFF18,#FF831918)",
                  border: "1px solid #EF3AFF33",
                  boxShadow: "0 0 40px #EF3AFF18",
                }}
              >
                <span style={{ color: "#EF3AFF" }}>
                  <SvgIcon path={PATHS.bell} size="10" />
                </span>
              </div>
              <p className="sora font-bold text-xl" style={{ color: textMain }}>All caught up!</p>
              <p className="text-sm" style={{ color: textSub }}>No notifications to show.</p>
            </div>
          )}

          {/* ── NOTIFICATION CARDS ── */}
          {!loading && sliced.length > 0 && (
            <div className="space-y-3">
              {sliced.map((item, idx) => {
                const meta = TYPE_META[item.notification_type] || { path: PATHS.bell, color: "#EF3AFF" };
                return (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`np-card rounded-2xl cursor-pointer ${!item.is_read ? "unread" : ""}`}
                    style={{
                      background: item.is_read ? cardBg : cardUnread,
                      border: `1px solid ${item.is_read ? borderDef : borderUrd}`,
                      animationDelay: `${idx * 0.04}s`,
                      boxShadow: item.is_read
                        ? (isDark ? "0 2px 14px #00000040" : "0 2px 14px #c090e018")
                        : (isDark ? "0 4px 20px #6000a044" : "0 4px 20px #c060e030"),
                    }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
                      {/* Avatar */}
                      <Avatar actor={item.actor_id} />

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm sm:text-base leading-snug ${item.is_read ? "font-medium" : "font-bold"}`}
                              style={{ color: textMain }}
                            >
                              <span style={{ color: meta.color }}>
                                {item?.actor_id?.full_name || "Someone"}
                              </span>
                              {" "}{item?.title || ""}
                            </p>
                            {item?.body && (
                              <p
                                className="text-xs sm:text-sm mt-1.5 line-clamp-2"
                                style={{ color: textSub }}
                              >
                                {item.body}
                              </p>
                            )}
                          </div>

                          {/* Icon + unread dot */}
                          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                            <div
                              className="np-icon-ring"
                              style={{
                                background: `${meta.color}1a`,
                                border: `1.5px solid ${meta.color}44`,
                              }}
                            >
                              <span style={{ color: meta.color }}>
                                <SvgIcon path={meta.path} size="4" />
                              </span>
                            </div>
                            {!item.is_read && <span className="np-dot" />}
                          </div>
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Type badge */}
                            <span
                              className="sora text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                              style={{
                                background: `${meta.color}1a`,
                                color: meta.color,
                                border: `1px solid ${meta.color}33`,
                              }}
                            >
                              {item.notification_type?.replace(/_/g, " ")}
                            </span>
                            {/* Time */}
                            <span className="text-xs" style={{ color: textSub }}>
                              {formatTime(item.created_at)}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5">
                            {!item.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(item._id, e)}
                                className="np-icon-btn"
                                style={{ background: "#EF3AFF1a", color: "#EF3AFF" }}
                                title="Mark as read"
                              >
                                <SvgIcon path={PATHS.check} size="4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(item._id, e)}
                              className="np-icon-btn"
                              style={{ background: "#FF83191a", color: "#FF8319" }}
                              title="Delete"
                            >
                              <SvgIcon path={PATHS.trash} size="4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAGINATION BAR (image-style) — placed below all notifications ── */}
          {!loading && notifications.length > PAGE_SIZE && (
            <PaginationBar
              current={currentPage}
              total={totalPages}
              isDark={isDark}
              perPage={PAGE_SIZE}
              onChange={handlePageChange}
            />
          )}

          {/* Mobile result count (shown below pagination pill on small screens) */}
          {!loading && notifications.length > PAGE_SIZE && (
            <p className="text-center text-xs mt-3 sm:hidden" style={{ color: textSub }}>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, notifications.length)} of {notifications.length}
            </p>
          )}

        </div>
      </div>
    </>
  );
}
