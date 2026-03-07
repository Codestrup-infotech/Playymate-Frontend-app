"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { questionnaireService } from "../../../services/questionnaire";
import React from "react";
import Fitness from "@/app/components/Fitness";
export default function PhysicalPreferences() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(160);
  const [blood, setBlood] = useState("A+");
  const [screenData, setScreenData] = useState(null);
  const [basicMetricsQuestions, setBasicMetricsQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiFetched, setApiFetched] = useState(false);

  // Fetch onboarding screen data on mount
  // useEffect(() => {
  //   const fetchScreenData = async () => {
  //     try {
  //       setLoading(true);
        
  //       // API: GET /api/v1/onboarding/screens?type=physical_intro
  //       const response = await api.get("/onboarding/screens", {
  //         params: { type: "physical_intro" },
  //       });
        
  //       if (response.data?.data?.screens?.[0]) {
  //         setScreenData(response.data.data.screens[0]);
  //       }
        
  //       // After API success, wait 3 seconds then auto-proceed
  //       setApiFetched(true);
  //       setTimeout(() => {
  //         setIntroAgree(true); // Auto-check the consent checkbox
  //         setLoading(false);
  //         // Auto-trigger the continue after checking checkbox
  //         setTimeout(() => {
  //           goNext();
  //         }, 500); // Small delay to ensure checkbox is checked
  //       }, 3000);
        
  //     } catch (err) {
  //       console.error("Failed to fetch screen data:", err);
  //       // Wait 5 seconds before showing error to give backend time to respond
  //       await new Promise(resolve => setTimeout(resolve, 5000));
  //       setError(err.message || "Failed to load screen data");
  //       setLoading(false);
  //     }
  //   };

  //   fetchScreenData();
  // }, []);

 useEffect(() => {
  const fetchScreenData = async () => {
    try {
      setLoading(true);

      const response = await questionnaireService.getOnboardingScreen(
        "physical_intro",
        "mobile"
      );

      if (response.data?.data?.screens?.[0]) {
        setScreenData(response.data.data.screens[0]);
      }

      setLoading(false);

      // show GIF loader for 3 sec
   setTimeout(() => {
  setShowLoader(false);
}, 6000);
    } catch (err) {
      console.error("Failed to fetch screen:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  fetchScreenData();
}, []);

  const [introAgree, setIntroAgree] = useState(false);
  const [weightAgree, setWeightAgree] = useState(false);
  const [heightAgree, setHeightAgree] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);
const [showLoader, setShowLoader] = useState(true);
  // Submit answer to API - handles all question types based on question_data
  const submitAnswer = async (questionId, answer, questionData = null) => {
    try {
      setAnswerLoading(true);
      setAnswerError(null);
      
      // Get question type from questionData or determine from answer
      const questionType = questionData?.question_type || 'number';
      
      let payload = {};
      
      // Handle based on question type from API
      if (questionType === 'single_select') {
        // For single select - MUST use selected_option_ids with option_id
        let optionId = null;
        
        // Check if answer is already option_id
        if (answer && typeof answer === 'string') {
          const byId = questionData?.options?.find(opt => opt.option_id === answer);
          if (byId) {
            optionId = answer;
          }
        }
        
        // If not found by ID, try by label or value
        if (!optionId) {
          const byLabel = questionData?.options?.find(
            opt => opt.label === answer || opt.value === answer
          );
          if (byLabel?.option_id) {
            optionId = byLabel.option_id;
          }
        }
        
        if (optionId) {
          payload.selected_option_ids = [optionId];
        } else {
          console.error("No option_id found for:", answer);
          return false;
        }
      } else if (questionType === 'number') {
        // For number - use answer_number
        payload.answer_number = typeof answer === 'number' ? answer : parseInt(answer) || parseFloat(answer);
      } else if (questionType === 'text') {
        payload.answer_text = answer;
      } else if (questionType === 'boolean') {
        // For boolean - use answer_boolean
        payload.answer_boolean = answer === true || answer === 'true' || answer === 1;
      } else {
        // Default fallback - try as single select
        if (answer && typeof answer === 'string') {
          const option = questionData?.options?.find(
            opt => opt.label === answer || opt.value === answer
          );
          if (option?.option_id) {
            payload.selected_option_ids = [option.option_id];
          }
        }
      }
      
      // Call the API with the payload
      await questionnaireService.submitAnswer(questionId, payload);
      
      return true;
    } catch (err) {
      console.error(`Failed to submit ${questionId} answer:`, err);
      setAnswerError(err.response?.data?.message || `Failed to submit ${questionId} answer`);
      return false;
    } finally {
      setAnswerLoading(false);
    }
  };

  const nextDisabled =
    (step === 1 && !introAgree) ||
    (step === 2 && !weightAgree) ||
    (step === 3 && !heightAgree);

  const goNext = async () => {
    // If on step 1 (intro), submit consent first
    if (step === 1 && introAgree) {
      try {
        setConsentLoading(true);
        setConsentError(null);
        
        // Call consent API
        await questionnaireService.submitConsent(true);
        
        // Fetch basic metrics questions from API after consent
        setQuestionsLoading(true);
        try {
          const questionsRes = await questionnaireService.getQuestions('basic_metrics');
          const questions = questionsRes.data?.data?.questions?.basic_metrics || [];
          // Sort by flow_order
          const sortedQuestions = questions.sort((a, b) => a.flow_order - b.flow_order);
          setBasicMetricsQuestions(sortedQuestions);
          
          // Set default values from API range_config if available
          const weightQuestion = sortedQuestions.find(q => q.question_id === 'weight');
          const heightQuestion = sortedQuestions.find(q => q.question_id === 'height');
          
          if (weightQuestion?.range_config) {
            const { min, max } = weightQuestion.range_config;
            setWeight(Math.round((min + max) / 2)); // Set to middle value
          }
          if (heightQuestion?.range_config) {
            const { min, max } = heightQuestion.range_config;
            setHeight(Math.round((min + max) / 2)); // Set to middle value
          }
        } catch (qErr) {
          console.error('Failed to fetch questions:', qErr);
        } finally {
          setQuestionsLoading(false);
        }
        
        // After successful consent, proceed to next step
        setStep((s) => s + 1);
      } catch (err) {  
        console.error("Failed to submit consent:", err);
        setConsentError(err.response?.data?.message || "Failed to submit consent. Please try again.");
        // Still allow user to proceed even if consent fails (for demo purposes)
        setStep((s) => s + 1);
      } finally {
        setConsentLoading(false);
      }
    } else if (!nextDisabled) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setStep((s) => s - 1);
  };


  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4 overflow-hidden">
     
     
     <div className="w-full max-w-sm">

  {loading ? (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  ) : (
    <>
     {step === 1 && showLoader ? (
  <IntroLoader image={screenData?.image_url} />
) : step === 1 ? (
  <Intro
    agree={introAgree}
    setAgree={setIntroAgree}
    onNext={goNext}
    disabled={nextDisabled}
    screenData={screenData}
    loading={consentLoading}
    error={consentError}
  />
) : null}

      {step === 2 && (
        <WeightStep
          value={weight}
          agree={weightAgree}
          setAgree={setWeightAgree}
          setValue={setWeight}
          questionData={basicMetricsQuestions.find(q => q.question_id === "weight")}
          onNext={async () => {
            const weightQuestion = basicMetricsQuestions.find(q => q.question_id === "weight");
            if (weightQuestion) {
              await submitAnswer(weightQuestion.question_id, weight, weightQuestion);
            }
            setStep(3);
          }}
          onBack={() => setStep(1)}
          disabled={nextDisabled}
        />
      )}

      {step === 3 && (
        <HeightStep
          value={height}
          setValue={setHeight}
          agree={heightAgree}
          setAgree={setHeightAgree}
          questionData={basicMetricsQuestions.find(q => q.question_id === "height")}
          onNext={async () => {
            const heightQuestion = basicMetricsQuestions.find(q => q.question_id === "height");
            if (heightQuestion) {
              await submitAnswer(heightQuestion.question_id, height, heightQuestion);
            }
            setStep(4);
          }}
          onBack={() => setStep(2)}
          disabled={nextDisabled}
        />
      )}

      {step === 4 && (
        <BloodStep
          value={blood}
          setValue={setBlood}
          questionData={basicMetricsQuestions.find(q => q.question_id === "blood_group")}
          onBack={() => setStep(3)}
          onComplete={async () => {
            const bloodQuestion = basicMetricsQuestions.find(
              q => q.question_id === "blood_group"
            );

            if (bloodQuestion && blood) {
              // Pass the blood value and questionData
              await submitAnswer(bloodQuestion.question_id, blood, bloodQuestion);
            }

            setStep(5); // ✅ move to Fitness
          }}
        />
      )}

      {step === 5 && (
        <Fitness
          onBack={() => setStep(4)}
          onComplete={() => {
            router.push("/onboarding/questionnaire");
          }}
        />
      )}
    </>
  )}

</div>
    </div>
  );
}

/* ---------------- STEP 1: INTRO ---------------- */

// function Intro({ agree, setAgree, onNext, disabled, screenData, loading, error }) {
//   // Use API data from GET /api/v1/onboarding/screens?type=physical_intro
//   // API Response: { screens: [{ title, description, media, cta_buttons }] }
//   const title = screenData?.title || "Physical Profile";
//   const description = screenData?.description || "Help us understand your physical attributes";
  
//   // Static values (not in API response)
//   const securityNote = "Your information is secure and never shared";
//   const checkboxLabel = "I understand and agree to answer questions about my physical activity preferences";
  
//   // Get CTA button label from API or use default
//   const ctaLabel = screenData?.cta_buttons?.[0]?.label || "Continue";

//   return (
//     <div className="flex flex-col justify-between py-10 ">
//       <div className="text-white text-xl cursor-pointer mb-6 ">←</div>
//       <div className="rounded-2xl border border-blue-500/40 bg-[#1c1c1c] py-12 px-4 text-center">
//         <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
//           {title}
//         </h2>
//         <p className="text-sm text-gray-300 mb-5 font-Poppins ">
//           {description}
//         </p>

//         <p className="text-[14px] font-Poppins text-gray-400 mb-4 ">{securityNote}</p>

//         <label className="flex items-start gap-3 text-xs text-gray-300 text-left font-Poppins">
//           <input
//             type="checkbox"
//             checked={agree}
//             onChange={(e) => setAgree(e.target.checked)}
//             className="mt-1 accent-pink-500"
//           />
//           <span>{checkboxLabel}</span>
//         </label>


//       </div>

//       <div>
//         <p className="font-Poppins text-center text-[#697586] py-6">By continuing, you agree to Playmate’s Term & Privacy Policy.</p>
//       </div>

//       {error && (
//         <p className="font-Poppins text-center text-red-400 py-2 text-sm">{error}</p>
//       )}

//       <button
//         onClick={onNext}
//         disabled={disabled}
//         className={`w-full py-4 rounded-full transition font-Poppins ${disabled
//             ? "bg-gray-700 text-gray-400 cursor-not-allowed"
//             : "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
//           }`}
//       >
//         {loading ? "Loading..." : ctaLabel}
//       </button>
//     </div>
//   );
// }


function IntroLoader({ image }) {
  return (
    <> 
    
    <div className="flex items-center justify-center min-h-screen bg-black">
      <img
        src={image}
        alt="loading"
        className="w-80 h-80 object-contain rounded-xl"
      />
    </div> </>
  );
}


function Intro({ agree, setAgree, onNext, disabled, screenData, loading, error }) {
  const title = screenData?.title || "Physical Profile";
  const description =
    screenData?.description || "Help us understand your physical attributes";

  const securityNote = "Your information is secure and never shared";

  const checkboxLabel =
    "I understand and agree to answer questions about my physical activity preferences";

  return (
    <div className="flex flex-col justify-between py-10">
      
      <div className="text-white text-xl cursor-pointer mb-6">←</div>

      <div className="rounded-2xl border border-blue-500/40 bg-[#1c1c1c] py-12 px-4 text-center">

        <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
          {title}
        </h2>

        <p className="text-sm text-gray-300 mb-5 font-Poppins">
          {description}
        </p>

        <p className="text-[14px] text-gray-400 mb-4 font-Poppins">
          {securityNote}
        </p>

        <label className="flex items-start gap-3 text-xs text-gray-300 text-left font-Poppins">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 accent-pink-500"
          />
          <span>{checkboxLabel}</span>
        </label>

      </div>

      {error && (
        <p className="text-center text-red-400 py-2 text-sm">{error}</p>
      )}

      <button
        onClick={onNext}
        disabled={disabled}
        className={`w-full py-4 rounded-full transition mt-10 font-Poppins ${
          disabled
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
        }`}
      >
        {loading ? "Loading..." : "Continue"}
      </button>
    </div>
  );
}
/* ---------------- STEP 2: WEIGHT (SCROLL LOGIC) ---------------- */



// Clamp limits
const KG_MIN = 1;
const KG_MAX = 250;
const LBS_MIN = 2;
const LBS_MAX = 550;


function WeightStep({
  value,
  setValue,
  setAgree,
  agree,
  onNext,
  onBack,
  disabled,
  questionData,
}) {
  const [unit, setUnit] = useState("kg");

  // Get dynamic config from API or use defaults
  const rangeConfig = questionData?.range_config || {};
  const minWeight = rangeConfig?.min || 30;
  const maxWeight = rangeConfig?.max || 200;
  const stepWeight = rangeConfig?.step || 0.5;
  const defaultUnit = rangeConfig?.unit || 'kg';
  const questionText = questionData?.question_text || "What's your Weight";
  const helpText = questionData?.help_text || "If you do not know your current weight, select 'Not Sure' and visit your nearest Playmate Center for proper weight check.";
  const placeholder = questionData?.placeholder || "Enter weight";


  const convertWeight = (val, from, to) => {
    if (from === to) return val;
    if (from === "kg" && to === "lbs") return Math.round(val * 2.20462);
    if (from === "lbs" && to === "kg") return Math.round(val / 2.20462);
    return val;
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    const converted = convertWeight(value, unit, newUnit);
    setUnit(newUnit);
    setValue(converted);
  };

  const handleAgree = (e) => {
    setAgree(e.target.checked);
    onAgreeChange && onAgreeChange(e.target.checked);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          background: "#0a0a0a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px",
          fontFamily: "'Poppins', sans-serif",
          color: "white",
          maxWidth: 390,
          margin: "0 auto",
        }}
      >
        {/* Back arrow */}
        <div
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            fontSize: 22,
            cursor: "pointer",
            marginBottom: 20,
            color: "#aaa",
          }}
        >
          ←
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 24,
            marginTop: 4,
            letterSpacing: "-0.3px",
          }}
        >
          {questionText}
        </h2>

        {/* Unit toggle — Lbs left, Kg right, Kg active by default */}
        <div
          style={{
            background: "#1f1f1f",
            borderRadius: 999,
            padding: 4,
            display: "flex",
            width: 200,
            height: 42,
            alignItems: "center",
            position: "relative",
            marginBottom: 32,
          }}
        >
          {/* Sliding pill — right when kg, left when lbs */}
          <div
            style={{
              position: "absolute",
              top: 4,
              bottom: 4,
              width: "calc(50% - 4px)",
              borderRadius: 999,
              background: "linear-gradient(to right, #1A43CA, #1FCCF2)",
              transition: "left 0.3s ease",
              left: unit === "lbs" ? 4 : "calc(50% + 0px)",
            }}
          />
          <button
            onClick={() => handleUnitChange("lbs")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: unit === "lbs" ? "white" : "#888",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Lbs
          </button>
          <button
            onClick={() => handleUnitChange("kg")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: unit === "kg" ? "white" : "#888",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            kg
          </button>
        </div>

        {/* Big value display */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 32,
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          {value}
          <span style={{ fontSize: 22, fontWeight: 300, color: "white" }}>
            {unit}
          </span>
        </div>

        {/* Horizontal Ruler */}
        <WeightRuler value={value} setValue={setValue} unit={unit} />

        {/* Note */}
        <div
          style={{
            marginTop: 32,
            background: "#141414",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 12,
            color: "#888",
            lineHeight: 1.65,
            width: "100%",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#aaa" }}>Note:</strong> If you do not know your current weight, select "Not Sure" and visit your nearest Playmate Center for proper weight check.
          </p>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ accentColor: "#ec4899", width: 15, height: 15 }}
            />
            <span style={{ fontSize: 11, color: "#666" }}>
              Not Sure – Visit nearest Playmate Center
            </span>
          </label>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={disabled}
          style={{
            marginTop: 32,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ec4899, #f97316)",
            border: "none",
            color: "white",
            fontSize: 22,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          ✓
        </button>
      </div>
    </>
  );
}

function WeightRuler({ value, setValue, unit }) {
  const containerRef = useRef(null);
  const touchStart = useRef(0);

  const min = unit === "kg" ? KG_MIN : LBS_MIN;
  const max = unit === "kg" ? KG_MAX : LBS_MAX;

  // Visual range extends beyond hard limits
  const visMin = min - VISUAL_EXTRA;
  const visMax = max + VISUAL_EXTRA;

  const stepWidth = 14; // px per tick

  // Clamp displayed value
  const clampedValue = Math.min(Math.max(value, min), max);

  // Offset from visMin to center the selected tick
  const scrollOffset = (clampedValue - visMin) * stepWidth;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      setValue((prev) => Math.min(Math.max(prev + direction, min), max));
    };

    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEnd = e.touches[0].clientX;
      const delta = touchStart.current - touchEnd;
      if (Math.abs(delta) > 10) {
        const direction = delta > 0 ? 1 : -1;
        setValue((prev) => Math.min(Math.max(prev + direction, min), max));
        touchStart.current = touchEnd;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [setValue, min, max]);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      {/* Ruler viewport */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: 80,
          overflow: "hidden",
          cursor: "ew-resize",
          touchAction: "none",
        }}
      >
        {/* Left fade */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 48,
            background: "linear-gradient(to right, #0a0a0a, transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        {/* Right fade */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 48,
            background: "linear-gradient(to left, #0a0a0a, transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        {/* Center selection line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            width: 2,
            height: 56,
            background: "#ec4899",
            zIndex: 20,
            borderRadius: 1,
          }}
        />

        {/* Tick strip */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            height: "100%",
            transition: "transform 0.1s ease-out",
            transform: `translateX(calc(50% - ${scrollOffset}px - ${stepWidth / 2}px))`,
          }}
        >
          {Array.from({ length: visMax - visMin + 1 }).map((_, i) => {
            const v = visMin + i;
            const isMajor = v % 5 === 0;
            const isSelected = v === clampedValue;
            const isOutOfRange = v < min || v > max;

            return (
              <div
                key={v}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: stepWidth,
                  flexShrink: 0,
                  opacity: isOutOfRange ? 0.2 : 1,
                  paddingBottom: 0,
                }}
              >
                {/* Label above major ticks */}
                {isMajor && (
                  <span
                    style={{
                      fontSize: 11,
                      color: isSelected ? "white" : "#666",
                      fontWeight: isSelected ? 700 : 400,
                      marginBottom: 6,
                      fontFamily: "'Poppins', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v}
                  </span>
                )}
                {/* Tick line */}
                <div
                  style={{
                    width: isSelected ? 2 : 1,
                    height: isMajor ? 32 : 16,
                    background: isSelected
                      ? "#ec4899"
                      : "rgba(255,255,255,0.7)",
                    borderRadius: 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ---------------- REMAINING STEPS (STUBS) ---------------- */

// function HeightStep({ value, onBack, onNext }) {
//   return (
//     <div className="text-center">
//       <div className="text-left text-xl mb-6 cursor-pointer" onClick={onBack}>←</div>
//       <h2 className="text-2xl mb-10">Height Step (Placeholder)</h2>
//       <button onClick={onNext} className="p-4 bg-orange-500 rounded-full">Next</button>
//     </div>
//   );
// }







// Scroll clamp limits (value cannot go beyond these)
const FT_MIN = 4;
const FT_MAX = 8;
const IN_MIN = 100;
const IN_MAX = 200;

// Extra visual ticks to show above/below the clamp limits (display only, not selectable)
const VISUAL_EXTRA = 4;

function HeightStep({ value,
  setValue,
  setAgree,
  agree,
  onNext,
  onBack,
  disabled,
  questionData }) {
  const [unit, setUnit] = useState("in");

  // Get dynamic config from API or use defaults
  const rangeConfig = questionData?.range_config || {};
  const minHeight = rangeConfig?.min || 100;
  const maxHeight = rangeConfig?.max || 250;
  const stepHeight = rangeConfig?.step || 1;
  const defaultUnit = rangeConfig?.unit || 'cm';
  const questionText = questionData?.question_text || "What's your Height";
  const helpText = questionData?.help_text || "Stand straight against a wall and measure";


  const convertHeight = (val, from, to) => {
    if (from === to) return val;
    if (from === "ft" && to === "in") return Math.round(val * 12);
    if (from === "in" && to === "ft") return Math.round(val / 12);
    return val;
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    const converted = convertHeight(value, unit, newUnit);
    setUnit(newUnit);
    setValue(converted);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          background: "#0a0a0a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px",
          fontFamily: "'Poppins', sans-serif",
          color: "white",
          maxWidth: 390,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Back arrow */}
        <div
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            fontSize: 22,
            cursor: "pointer",
            marginBottom: 24,
            color: "#aaa",
          }}
        >
          ←
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 28,
            marginTop: 4,
            letterSpacing: "-0.3px",
          }}
        >
          {questionText}
        </h2>

        {/* Unit toggle */}
        <div
          style={{
            background: "#1f1f1f",
            borderRadius: 999,
            padding: 4,
            display: "flex",
            width: 200,
            height: 42,
            alignItems: "center",
            position: "relative",
            marginBottom: 28,
          }}
        >
          {/* Sliding pill */}
          <div
            style={{
              position: "absolute",
              top: 4,
              bottom: 4,
              width: "calc(50% - 4px)",
              borderRadius: 999,
              background: "linear-gradient(to right, #1A43CA, #1FCCF2)",
              transition: "left 0.3s ease",
              left: unit === "ft" ? 4 : "calc(50% + 0px)",
            }}
          />
          <button
            onClick={() => handleUnitChange("ft")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: unit === "ft" ? "white" : "#888",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Ft
          </button>
          <button
            onClick={() => handleUnitChange("in")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: unit === "in" ? "white" : "#888",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Inches
          </button>
        </div>

        {/* Ruler + value section */}
        <HeightRuler value={value} setValue={setValue} unit={unit} />

        {/* Note */}
        <div
          style={{
            marginTop: 28,
            background: "#141414",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 11.5,
            color: "#888",
            lineHeight: 1.6,
            width: "100%",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#aaa" }}>Note:</strong> If you do not know your current weight, select "Not Sure" and visit your nearest Playmate Center for proper weight check.
          </p>
          <label className="flex items-start gap-2 text-gray-300 font-Poppins text-center">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 accent-pink-500"
            />
            <span>
              Not Sure – Visit nearest Playmate Center
            </span>
          </label>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={disabled}
          style={{
            marginTop: 28,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ec4899, #f97316)",
            border: "none",
            color: "white",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          }}
        >
          ✓
        </button>
      </div>
    </>
  );
}

function HeightRuler({ value, setValue, unit }) {
  const containerRef = useRef(null);
  const touchStart = useRef(0);

  // Hard scroll clamp boundaries
  const min = unit === "in" ? IN_MIN : FT_MIN;
  const max = unit === "in" ? IN_MAX : FT_MAX;

  // Visual render range — extends VISUAL_EXTRA ticks beyond each hard limit
  const visMin = min - VISUAL_EXTRA;
  const visMax = max + VISUAL_EXTRA;

  const stepHeight = 10;
  const viewHeight = 300;
  const center = viewHeight / 2;

  // Clamped selected value
  const clampedValue = Math.min(Math.max(value, min), max);

  // Offset is relative to visMin so the ruler strip positions correctly
  const offset = (clampedValue - visMin) * stepHeight;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      // Strictly clamped — cannot scroll past min or max
      setValue((prev) => Math.min(Math.max(prev + direction, min), max));
    };

    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEnd = e.touches[0].clientY;
      const delta = touchStart.current - touchEnd;
      if (Math.abs(delta) > 8) {
        const direction = delta > 0 ? 1 : -1;
        setValue((prev) => Math.min(Math.max(prev + direction, min), max));
        touchStart.current = touchEnd;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [setValue, min, max]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "0 12px",
      }}
    >
      {/* Left big value */}
      <div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1,
            color: "white",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {clampedValue}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#888",
            marginTop: 4,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {unit === "in" ? "Inches" : "Feet"}
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          height: viewHeight,
          width: 110,
          overflow: "hidden",
          cursor: "ns-resize",
        }}
      >
        {/* Pink arrow indicator at center */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderRight: "16px solid #ec4899",
          }}
        />

        {/* Top fade overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to bottom, #0a0a0a, transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        {/* Bottom fade overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to top, #0a0a0a, transparent)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        {/* Tick strip — visMin to visMax */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            transform: `translateY(${center - offset}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {Array.from({ length: visMax - visMin + 1 }).map((_, i) => {
            const v = visMin + i;
            const isMajor = v % 10 === 0;
            const isSelected = v === clampedValue;
            // Ticks outside the scrollable range are faded to hint the boundary
            const isOutOfRange = v < min || v > max;

            return (
              <div
                key={v}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: stepHeight,
                  paddingRight: 22,
                  opacity: isOutOfRange ? 0.25 : 1,
                }}
              >
                {isMajor && (
                  <span
                    style={{
                      color: isSelected ? "white" : "#555",
                      fontSize: 11,
                      marginRight: 6,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    {v}
                  </span>
                )}
                <div
                  style={{
                    width: isMajor ? 40 : 20,
                    height: isSelected ? 2 : isMajor ? 2 : 1,
                    background: isSelected
                      ? "#ec4899"
                      : isMajor
                        ? "#555"
                        : "#333",
                    borderRadius: 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}








// function BloodStep({ value, onBack }) {
//   return (
//     <div className="text-center">
//       <div className="text-left text-xl mb-6 cursor-pointer" onClick={onBack}>←</div>
//       <h2 className="text-2xl mb-10">Blood Group: {value}</h2>
//       <button className="p-4 bg-pink-500 rounded-full">Finish</button>
//     </div>
//   );
// }

function BloodStep({ value, setValue, onBack, onComplete, questionData }) {
  const [group, setGroup] = useState(value?.replace(/[+-]/, "") || "A");
  const [rh, setRh] = useState(value?.includes("-") ? "-" : "+");

  // Get dynamic config from API
  const options = questionData?.options || [];
  const questionText = questionData?.question_text || "What's your Blood Group";
  const helpText = questionData?.help_text || "This helps in case of medical emergencies";

  const updateValue = (g, r) => {
    setGroup(g);
    setRh(r);
    setValue(`${g}${r}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 py-6">

      {/* TOP BAR */}
      <div className="text-xl mb-6 cursor-pointer" onClick={onBack}>
        ←
      </div>

      {/* TITLE */}
      <h2 className="text-3xl text-center mb-6 font-semibold font-Playfair Display ">
        What’s your <span className="text-orange-400">Blood</span><br />
        <span className="text-orange-400">Group</span>
      </h2>

      {/* GROUP SELECTOR */}
      <div className="flex justify-center mb-10 font-Poppins ">
        <div className="flex bg-[#1f1f1f] rounded-full p-1 w-[260px]">
          {["A", "B", "AB", "O"].map((g) => (
            <button
              key={g}
              onClick={() => updateValue(g, rh)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition
                ${group === g
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                  : "text-gray-300"
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* BIG VALUE */}
      <div className="text-center mb-10 font-Poppins ">
        <div className="text-[90px] font-extrabold leading-none text-red-500">
          {group}
          <span className="text-4xl align-top ml-1">{rh}</span>
        </div>
      </div>

      {/* + / - SELECTOR */}
      <div className="flex justify-center items-center gap-6 mb-10 font-Poppins">
        <button
          onClick={() => updateValue(group, "+")}
          className={`text-3xl font-bold ${rh === "+" ? "text-red-500" : "text-gray-500"
            }`}
        >
          +
        </button>

        <span className="text-sm text-gray-400">or</span>

        <button
          onClick={() => updateValue(group, "-")}
          className={`text-3xl font-bold ${rh === "-" ? "text-red-500" : "text-gray-500"
            }`}
        >
          −
        </button>
      </div>

      {/* CONFIRM */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onComplete}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl shadow-lg"
        >
          ✓
        </button>
      </div>

      {/* NOTE */}
      <p className="text-[14px] text-white/80 font-normal  text-center mb-4 font-Poppins  ">
        Note: If you do not know your current blood group,
        select “Not Sure” and visit your nearest Playmate
        Center for proper check.
      </p>

      {/* CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-gray-400 font-Poppins justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>
    </div>
  );
}




