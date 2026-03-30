

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { questionnaireService } from "../../../services/questionnaire";
import React from "react";
import Fitness from "@/app/components/Fitness";
import PhysicalTopProgress from "@/app/components/PhysicalTopProgress";

export default function PhysicalPreferences() {
  const router = useRouter();

  const TOTAL_STEPS = 6;

  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(160);
  const [blood, setBlood] = useState("A+");

  const [pendingCoins, setPendingCoins] = useState(0);
  const progress = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  const [screenData, setScreenData] = useState(null);
  const [basicMetricsQuestions, setBasicMetricsQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiFetched, setApiFetched] = useState(false);

  const [introAgree, setIntroAgree] = useState(false);
  const [weightAgree, setWeightAgree] = useState(false);
  const [heightAgree, setHeightAgree] = useState(false);

  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState(null);

  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [consentScreen, setConsentScreen] = useState(null);
  const [consentScreenData, setConsentScreenData] = useState(null);
  const [showLoader, setShowLoader] = useState(true);


  useEffect(() => {
    const fetchConsentScreen = async () => {
      try {
        const res =
          await questionnaireService.getPhysicalProfileConsentScreen();

        console.log("CONSENT API RESPONSE:", res);

        if (res?.data?.data) {
          setConsentScreenData(res.data.data);
        }

      } catch (error) {
        console.error("Consent API failed:", error);
      }
    };

    fetchConsentScreen();
  }, []);

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

        setTimeout(() => {
          setStep(2);
        }, 3000);

      } catch (err) {
        console.error("Failed to fetch screen:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchScreenData();
  }, []);

  const submitAnswer = async (questionId, answer, questionData = null) => {
    try {
      setAnswerLoading(true);
      setAnswerError(null);

      const questionType = questionData?.question_type || "number";
      let payload = {};

      if (questionType === "single_select" || questionId === "blood_group") {
        let optionId = null;

        if (answer && typeof answer === "string" && answer.startsWith("opt_")) {
          optionId = answer;
        }

        if (!optionId && answer && typeof answer === "string") {
          const byId = questionData?.options?.find(
            (opt) => opt.option_id === answer
          );
          if (byId) optionId = answer;
        }

        if (!optionId && answer && typeof answer === "string") {
          const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, "");

          const byLabel = questionData?.options?.find(
            (opt) =>
              opt.label?.toLowerCase().replace(/\s+/g, "") === normalizedAnswer ||
              opt.value?.toLowerCase().replace(/\s+/g, "") === normalizedAnswer
          );

          if (byLabel?.option_id) optionId = byLabel.option_id;
        }

        if (!optionId && questionId === "blood_group") {
          const bloodGroupMap = {
            "A+": "opt_a+",
            "A-": "opt_a-",
            "B+": "opt_b+",
            "B-": "opt_b-",
            "AB+": "opt_ab+",
            "AB-": "opt_ab-",
            "O+": "opt_o+",
            "O-": "opt_o-",
            unknown: "opt_unknown",
          };

          optionId = bloodGroupMap[answer];
        }

        if (optionId) payload.selected_option_ids = [optionId];

      } else if (questionType === "number" || questionType === "range") {
        payload.answer_number =
          typeof answer === "number"
            ? answer
            : parseInt(answer) || parseFloat(answer);

      } else if (questionType === "text") {
        payload.answer_text = answer;

      } else if (questionType === "boolean") {
        payload.answer_boolean =
          answer === true || answer === "true" || answer === 1;
      }

      const response = await questionnaireService.submitAnswer(
        questionId,
        payload
      );
      console.log("FULL API RESPONSE:", response);
      console.log("API DATA:", response.data);
      console.log("REWARD DATA:", response.data?.data?.reward);
      console.log("PENDING COINS:", response.data?.data?.reward?.pending_coins);
      const coins = response.data?.data?.reward?.pending_coins;

      if (coins !== undefined) {
        setPendingCoins(coins);
      }

      return true;

    } catch (err) {
      console.error(err);

      setAnswerError(
        err.response?.data?.message ||
        `Failed to submit ${questionId} answer`
      );

      return false;

    } finally {
      setAnswerLoading(false);
    }
  };






  const nextDisabled =
    (step === 1 && !introAgree);


  const goNext = async () => {

    // INTRO → CONSENT
    if (step === 1 && introAgree) {
      setStep(2);
      return;
    }

    // CONSENT → FETCH QUESTIONS
    if (step === 2) {
      try {

        setConsentLoading(true);
        setConsentError(null);

        await questionnaireService.submitConsent(true);

        setQuestionsLoading(true);

        const questionsRes =
          await questionnaireService.getQuestions("basic_metrics");

        const questions =
          questionsRes.data?.data?.questions?.basic_metrics || [];

        const sortedQuestions =
          questions.sort((a, b) => a.flow_order - b.flow_order);

        setBasicMetricsQuestions(sortedQuestions);

        const weightQuestion = sortedQuestions.find(
          (q) => q.question_id === "weight"
        );

        const heightQuestion = sortedQuestions.find(
          (q) => q.question_id === "height"
        );

        if (weightQuestion?.range_config) {
          const { min, max } = weightQuestion.range_config;
          setWeight(Math.round((min + max) / 2));
        }

        if (heightQuestion?.range_config) {
          const { min, max } = heightQuestion.range_config;
          setHeight(Math.round((min + max) / 2));
        }

        setStep(3);

      } catch (err) {
        console.error(err);
        setConsentError(
          err.response?.data?.message || "Failed to submit consent."
        );
      } finally {
        setConsentLoading(false);
        setQuestionsLoading(false);
      }

      return;
    }

    if (!nextDisabled) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4 overflow-hidden">

      {/* {step >= 2 && (
      <div className="w-96">
        <PhysicalTopProgress progress={progress} pendingCoins={pendingCoins} />
      </div>
    )} */}

      {step >= 3 && step <= 6 && (
        <div className="w-96">
          <PhysicalTopProgress progress={progress} pendingCoins={pendingCoins} />
        </div>
      )}
      <div className="w-full max-w-sm">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <IntroLoader image={screenData?.image_url} />
            )}

            {step === 2 && (
              <Intro
                agree={introAgree}
                setAgree={setIntroAgree}
                onNext={goNext}
                disabled={!introAgree}
                screenData={consentScreenData}
                loading={consentLoading}
                error={consentError}
              />
            )}

            {step === 3 && (
              <WeightStep
                value={weight}
                agree={weightAgree}
                setAgree={setWeightAgree}
                setValue={setWeight}
                questionData={basicMetricsQuestions.find(
                  (q) => q.question_id === "weight"
                )}
                onNext={async () => {
                  const q = basicMetricsQuestions.find(
                    (q) => q.question_id === "weight"
                  );
                  if (q) await submitAnswer(q.question_id, weight, q);
                  setStep(4);
                }}
                onBack={() => setStep(2)}
                disabled={nextDisabled}
              />
            )}

            {step === 4 && (
              <HeightStep
                value={height}
                setValue={setHeight}
                agree={heightAgree}
                setAgree={setHeightAgree}
                questionData={basicMetricsQuestions.find(
                  (q) => q.question_id === "height"
                )}
                onNext={async () => {
                  const q = basicMetricsQuestions.find(
                    (q) => q.question_id === "height"
                  );
                  if (q) await submitAnswer(q.question_id, height, q);
                  setStep(5);
                }}
                onBack={() => setStep(3)}
                disabled={nextDisabled}
              />
            )}

            {step === 5 && (
              <BloodStep
                value={blood}
                setValue={setBlood}
                questionData={basicMetricsQuestions.find(
                  (q) => q.question_id === "blood_group"
                )}
                onBack={() => setStep(4)}
                onComplete={async () => {
                  const q = basicMetricsQuestions.find(
                    (q) => q.question_id === "blood_group"
                  );
                  if (q && blood)
                    await submitAnswer(q.question_id, blood, q);

                  setStep(6);
                }}
              />
            )}

            {step === 6 && (
              <Fitness
                onBack={() => setStep(5)}
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

function IntroLoader({ image }) {
  return (
    <>

      <div className="flex items-center justify-center min-h-screen bg-black">
        <img
          src={image}
          alt="loading"
          className="w-80 h-[450px]  rounded-2xl "
        />
      </div> </>
  );
}

function Intro({ agree, setAgree, onNext, disabled, screenData, loading, error }) {

  const title = screenData?.title || "Physical Profile";
  const description = screenData?.description;

  const securityNote =
    screenData?.privacy_assurance ||
    "Your information is secure and never shared";

  const checkboxLabel =
    screenData?.consent_checkbox_text ||
    "I understand and agree to answer questions";

  const ctaText = screenData?.cta_text || "Continue";

  const gradientStart = screenData?.title_gradient_start || "#FF6B6B";
  const gradientEnd = screenData?.title_gradient_end || "#FFA726";

  const cardBackground = screenData?.card_background || "#1c1c1c";
  const borderGradient = screenData?.card_border_gradient || "#4A47A3";
  return (
    <div className="flex flex-col justify-between py-10">



      <div
        className="rounded-2xl border py-12 px-4 text-center"
        style={{
          background: cardBackground,
          borderColor: borderGradient
        }}
      >

        <h2
          className="text-4xl font-bold mb-5 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`
          }}
        >
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
        className={`w-full py-4 rounded-full transition mt-10 font-Poppins ${disabled
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
          }`}
      >
        {loading ? "Loading..." : ctaText}
      </button>
    </div>
  );
}

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
  disabled,
  questionData,
}) {
  const [unit, setUnit] = useState("kg");

  const rangeConfig = questionData?.range_config || {};
  const minWeight = rangeConfig?.min || 30;
  const maxWeight = rangeConfig?.max || 200;

  const questionText =
    questionData?.question_text || "What's your Weight";

  const convertWeight = (val, from, to) => {
    if (from === to) return val;
    if (from === "kg" && to === "lbs") return Math.round(val * 2.20462);
    if (from === "lbs" && to === "kg") return Math.round(val / 2.20462);
    return val;
  };

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    setValue(convertWeight(value, unit, newUnit));
  };

  return (
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
        {questionText?.split(" ").map((word, index) => (
          <span
            key={index}
            className={
              index === 2
                ? "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
                : ""
            }
          >
            {word + " "}
          </span>
        ))}
      </h2>

      {/* Unit Toggle */}
      <div className="bg-[#1f1f1f] rounded-full p-1 flex w-[200px] h-[42px] items-center relative mb-8">

        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-[#1A43CA] to-[#1FCCF2] transition-all duration-300 ${unit === "lbs" ? "left-1" : "left-[calc(50%+0px)]"
            }`}
        />

        <button
          onClick={() => handleUnitChange("lbs")}
          className={`flex-1 bg-transparent border-none text-sm font-semibold cursor-pointer relative z-10 ${unit === "lbs" ? "text-white" : "text-[#888]"
            }`}
        >
          Lbs
        </button>

        <button
          onClick={() => handleUnitChange("kg")}
          className={`flex-1 bg-transparent border-none text-sm font-semibold cursor-pointer relative z-10 ${unit === "kg" ? "text-white" : "text-[#888]"
            }`}
        >
          kg
        </button>
      </div>

      {/* Weight Display */}
      <div className="text-[60px] font-semibold mb-8 flex items-baseline gap-2">
        {value}
        <span className="text-[22px] font-light">{unit}</span>
      </div>

      {/* Ruler */}
      <WeightRuler
        value={value}
        setValue={setValue}
        unit={unit}
        min={minWeight}
        max={maxWeight}
      />

      {/* Note */}
      <div className="mt-3 text-center text-xs text-[#888]">
        <p>
          Note: If you do not know your current weight, select "Not Sure"
          and visit nearest Playmate Center.
        </p>

        <label className="flex items-center justify-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-pink-500"
          />
          <span className="text-[11px] text-[#666]">
            Not Sure – Visit nearest Playmate Center
          </span>
        </label>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disabled}
        className="mt-3 w-[55px] h-[55px] rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white text-[22px]"
      >
        ✓
      </button>

    </div>
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
    <div className="w-full relative">

      {/* Ruler viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[80px] overflow-hidden cursor-ew-resize touch-none"
      >


        {/* Minus Button */}
        <button
          onClick={() => setValue((prev) => Math.max(prev - 1, min))}
          className="absolute left-[10%] bottom-[-1px] -translate-x-full 
  w-8 h-8 flex items-center justify-center 
  rounded-full bg-[#1f1f1f] text-pink-500 text-lg font-bold z-30"
        >
          −
        </button>

        {/* Plus Button */}
        <button
          onClick={() => setValue((prev) => Math.min(prev + 1, max))}
          className="absolute left-[90%] bottom-[-1px] 
  w-8 h-8 flex items-center justify-center 
  rounded-full bg-[#1f1f1f] text-pink-500 text-lg font-bold z-30"
        >
          +
        </button>


        {/* Center selection line */}
        <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-[2px] h-[56px] bg-pink-500 z-20 rounded-[1px]" />

        {/* Tick strip */}
        <div
          className="flex items-end h-full transition-transform duration-100 ease-out"
          style={{
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
                className={`flex flex-col items-center justify-end flex-shrink-0 pb-2`}
                style={{
                  width: stepWidth,
                  opacity: isOutOfRange ? 0.2 : 1,
                }}
              >

                {/* Label above major ticks */}
                {isMajor && (
                  <span
                    className={`text-[16px] font-Poppins mb-[6px] whitespace-nowrap  ${isSelected
                        ? "text-white "
                        : "text-[#666] font-normal "
                      }`}
                  >
                    {v}
                  </span>
                )}

                {/* Tick line */}
                <div
                  className="rounded-[1px] mb-2"
                  style={{
                    width: isSelected ? 2 : 2,
                    height: isMajor ? 32 : 16,
                    background: isSelected
                      ? "#ec4899"
                      : "#E8EAEC",
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



// Scroll clamp limits (value cannot go beyond these)
const FT_MIN = 4;
const FT_MAX = 8;
const IN_MIN = 100;
const IN_MAX = 200;

// Extra visual ticks to show above/below the clamp limits (display only, not selectable)
const VISUAL_EXTRA = 4;

function HeightStep({
  value,
  setValue,
  setAgree,
  agree,
  onNext,
  disabled,
  questionData
}) {
  const [unit, setUnit] = useState("in");

  const rangeConfig = questionData?.range_config || {};
  const minHeight = rangeConfig?.min || 50;
  const maxHeight = rangeConfig?.max || 250;

  const questionText =
    questionData?.question_text || "What's your Height";

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
    <div className="flex flex-col items-center px-5 font-['Poppins'] text-white max-w-[390px] mx-auto">

      {/* Title */}
      <h2 className="font-['Playfair_Display'] text-[27px] font-semibold text-center mb-4 mt-1 tracking-[-0.3px]">
        {questionText?.split(" ").map((word, index) => (
          <span
            key={index}
            className={
              index === 2
                ? "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
                : ""
            }
          >
            {word + " "}
          </span>
        ))}
      </h2>

      {/* Unit Toggle */}
      <div className="bg-[#1f1f1f] rounded-full p-1 flex border border-[#F57264] w-[200px] h-[48px] items-center relative mb-2">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-[#1A43CA] to-[#1FCCF2] transition-all duration-300"
          style={{ left: unit === "ft" ? 4 : "calc(50% + 0px)" }}
        />

        <button
          onClick={() => handleUnitChange("ft")}
          className={`flex-1 text-[14px] relative z-10 ${unit === "ft" ? "text-white" : "text-[#888]"
            }`}
        >
          Ft
        </button>

        <button
          onClick={() => handleUnitChange("in")}
          className={`flex-1 text-[14px] relative z-10 ${unit === "in" ? "text-white" : "text-[#888]"
            }`}
        >
          Inches
        </button>
      </div>

      {/* Ruler */}
      <HeightRuler
        value={value}
        setValue={setValue}
        unit={unit}
        min={minHeight}
        max={maxHeight}
      />

      {/* Note */}
      <div className="text-center px-4 py-3 text-[11px] text-[#888]">
        <p className="text-white/90">
          Note: If you do not know your height, select "Not Sure"
          and visit your nearest Playmate Center.
        </p>

        <label className="flex items-center justify-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-pink-500"
          />
          <span>Not Sure – Visit nearest Playmate Center</span>
        </label>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disabled}
        className="mt-2 w-[50px] h-[50px] rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white text-[22px] flex items-center justify-center"
      >
        ✓
      </button>

    </div>
  );
}

function HeightRuler({ value, setValue, unit, min, max }) {
  const containerRef = useRef(null);
  const touchStart = useRef(0);

  const VISUAL_EXTRA = 4;

  const visMin = min - VISUAL_EXTRA;
  const visMax = max + VISUAL_EXTRA;

  const stepHeight = 10;
  const viewHeight = 250;
  const center = viewHeight / 2;

  const clampedValue = Math.min(Math.max(value, min), max);
  const offset = (clampedValue - visMin) * stepHeight;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      setValue((prev) =>
        Math.min(Math.max(prev + direction, min), max)
      );
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => el.removeEventListener("wheel", handleWheel);
  }, [setValue, min, max]);

  return (
    <div className="flex items-center justify-between w-full px-3">

      {/* Value */}
      <div>
        <div className="text-[40px] font-semibold">{clampedValue}</div>
        <div className="text-[16px]">
          {unit === "in" ? "Inches" : "Feet"}
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={containerRef}
        className="relative w-[140px] overflow-hidden cursor-ns-resize"
        style={{ height: viewHeight }}
      >

        {/* + Button */}
        <div
          onClick={() => setValue((p) => Math.min(p + 1, max))}
          className="absolute right-0 top-2 z-20 w-[30px] h-[30px] bg-white/10 rounded-full flex items-center justify-center text-pink-500 cursor-pointer"
        >
          +
        </div>

        {/* Center indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[9px] border-b-[9px] border-r-[16px] border-t-transparent border-b-transparent border-r-pink-500" />

        {/* - Button */}
        <div
          onClick={() => setValue((p) => Math.max(p - 1, min))}
          className="absolute right-0 bottom-2 z-20 w-[30px] h-[30px] bg-white/10 rounded-full flex items-center justify-center text-pink-500 cursor-pointer"
        >
          −
        </div>

        {/* Ticks */}
        <div
          className="absolute right-3 w-full transition-transform duration-100"
          style={{ transform: `translateY(${center - offset}px)` }}
        >
          {Array.from({ length: visMax - visMin + 1 }).map((_, i) => {
            const v = visMin + i;
            const isMajor = v % 10 === 0;
            const isSelected = v === clampedValue;

            return (
              <div
                key={v}
                className="flex items-center justify-end pr-[22px]"
                style={{ height: stepHeight }}
              >
                {isMajor && (
                  <span className="text-[14px] mr-[6px]">{v}</span>
                )}

                <div
                  style={{
                    width: isMajor ? 60 : 30,
                    height: isSelected ? 4 : isMajor ? 3 : 1,
                    background: isSelected ? "#ec4899" : "#fff"
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



function BloodStep({ value, setValue, onComplete, questionData }) {
  const [group, setGroup] = useState(value?.replace(/[+-]/, "") || "A");
  const [rh, setRh] = useState(value?.includes("-") ? "-" : "+");

  const questionText =
    questionData?.question_text || "What's your Blood Group";

  const updateValue = (g, r) => {
    setGroup(g);
    setRh(r);
    setValue(`${g}${r}`);
  };

  return (
    <div className="bg-black text-white flex flex-col px-4 mt-2">

      {/* Title */}
      <h2 className="text-3xl text-center mb-6 font-semibold font-['Playfair_Display']">
        {questionText?.split(" ").map((word, index) => (
          <span
            key={index}
            className={
              index === 2
                ? "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
                : ""
            }
          >
            {word + " "}
          </span>
        ))}
      </h2>

      {/* Blood Group Selector */}
      <div className="flex justify-center mb-10">
        <div className="flex bg-[#1f1f1f] border border-[#FF8319] rounded-full p-1 w-[260px]">
          {["A", "B", "AB", "O"].map((g) => (
            <button
              key={g}
              onClick={() => updateValue(g, rh)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${group === g
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
      <div className="text-center font-Poppins ">
        <div className="text-[90px] font-extrabold leading-none text-red-500">
          {group}
          <span className="text-4xl align-top ml-1">{rh}</span>
        </div>
      </div>

      {/* RH Selector */}
      <div className="flex justify-center items-center gap-6 mb-10">
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
      {/* Confirm Button */}
      <div className="flex justify-center mb-2">
        <button
          onClick={onComplete}
          className="py-2 px-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl shadow-lg"
        >
          ✓
        </button>
      </div>

      {/* Note */}
      <p className="text-[12px] text-white text-center mb-2">
        Note: If you do not know your blood group,
        visit your nearest Playmate Center.
      </p>

      {/* Checkbox */}
      <label className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>

    </div>
  );
}



