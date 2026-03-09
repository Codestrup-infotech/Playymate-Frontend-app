// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import api from "../../../services/api";
// import { questionnaireService } from "../../../services/questionnaire";
// import React from "react";
// import Fitness from "@/app/components/Fitness";
// export default function PhysicalPreferences() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [weight, setWeight] = useState(62);
//   const [height, setHeight] = useState(160);
//   const [blood, setBlood] = useState("A+");
//   const [screenData, setScreenData] = useState(null);
//   const [basicMetricsQuestions, setBasicMetricsQuestions] = useState([]);
//   const [questionsLoading, setQuestionsLoading] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [apiFetched, setApiFetched] = useState(false);

 
//  useEffect(() => {
//   const fetchScreenData = async () => {
//     try {
//       setLoading(true);

//       const response = await questionnaireService.getOnboardingScreen(
//         "physical_intro",
//         "mobile"
//       );

//       if (response.data?.data?.screens?.[0]) {
//         setScreenData(response.data.data.screens[0]);
//       }

//       setLoading(false);

//       // show GIF loader for 3 sec
//    setTimeout(() => {
//   setShowLoader(false);
// }, 6000);
//     } catch (err) {
//       console.error("Failed to fetch screen:", err);
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   fetchScreenData();
// }, []);

//   const [introAgree, setIntroAgree] = useState(false);
//   const [weightAgree, setWeightAgree] = useState(false);
//   const [heightAgree, setHeightAgree] = useState(false);
//   const [consentLoading, setConsentLoading] = useState(false);
//   const [consentError, setConsentError] = useState(null);
//   const [answerLoading, setAnswerLoading] = useState(false);
//   const [answerError, setAnswerError] = useState(null);
// const [showLoader, setShowLoader] = useState(true);
//   // Submit answer to API - handles all question types based on question_data
//   const submitAnswer = async (questionId, answer, questionData = null) => {
//     try {
//       setAnswerLoading(true);
//       setAnswerError(null);
      
//       console.log(`[submitAnswer] Submitting answer for: ${questionId}`, { answer, questionData });
      
//       // Get question type from questionData or determine from answer
//       const questionType = questionData?.question_type || 'number';
      
//       console.log(`[submitAnswer] Question type: ${questionType}`);
      
//       let payload = {};
      
//       // Handle based on question type from API
//       if (questionType === 'single_select' || questionId === 'blood_group') {
//         // For single select - MUST use selected_option_ids with option_id
//         // Blood group uses format: selected_option_ids: ["opt_a+"]
//         let optionId = null;
        
//         // First, check if answer is already in option_id format (e.g., "opt_a+")
//         if (answer && typeof answer === 'string' && answer.startsWith('opt_')) {
//           optionId = answer;
//           console.log(`[submitAnswer] Answer is already option_id: ${optionId}`);
//         }
        
//         // Check if answer is already option_id
//         if (!optionId && answer && typeof answer === 'string') {
//           const byId = questionData?.options?.find(opt => opt.option_id === answer);
//           if (byId) {
//             optionId = answer;
//             console.log(`[submitAnswer] Found option by ID: ${optionId}`);
//           }
//         }
        
//         // If not found by ID, try by label or value (e.g., "A+" -> "opt_a+")
//         if (!optionId && answer && typeof answer === 'string') {
//           // Normalize: "A+" -> "a+" for comparison
//           const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '');
          
//           const byLabel = questionData?.options?.find(
//             opt => 
//               opt.label?.toLowerCase().replace(/\s+/g, '') === normalizedAnswer ||
//               opt.value?.toLowerCase().replace(/\s+/g, '') === normalizedAnswer
//           );
//           if (byLabel?.option_id) {
//             optionId = byLabel.option_id;
//             console.log(`[submitAnswer] Found option by label/value: ${optionId} from ${answer}`);
//           }
//         }
        
//         // Special handling for blood group - map "A+" to "opt_a+", etc.
//         if (!optionId && questionId === 'blood_group' && answer && typeof answer === 'string') {
//           // Map blood group values to option_ids
//           const bloodGroupMap = {
//             'A+': 'opt_a+', 'A-': 'opt_a-',
//             'B+': 'opt_b+', 'B-': 'opt_b-',
//             'AB+': 'opt_ab+', 'AB-': 'opt_ab-',
//             'O+': 'opt_o+', 'O-': 'opt_o-',
//             'unknown': 'opt_unknown'
//           };
//           const mappedOptionId = bloodGroupMap[answer];
//           if (mappedOptionId) {
//             optionId = mappedOptionId;
//             console.log(`[submitAnswer] Mapped blood group: ${answer} -> ${optionId}`);
//           }
//         }
        
//         if (optionId) {
//           payload.selected_option_ids = [optionId];
//           console.log(`[submitAnswer] Final payload:`, payload);
//         } else {
//           console.error(`[submitAnswer] No option_id found for: ${answer}`, { options: questionData?.options });
//           return false;
//         }
//       } else if (questionType === 'number' || questionType === 'range') {
//         // For number/range - use answer_number
//         // Height is in cm or in, Weight is in kg
//         payload.answer_number = typeof answer === 'number' ? answer : parseInt(answer) || parseFloat(answer);
//         console.log(`[submitAnswer] Number/Range payload:`, payload);
//       } else if (questionType === 'text') {
//         payload.answer_text = answer;
//         console.log(`[submitAnswer] Text payload:`, payload);
//       } else if (questionType === 'boolean') {
//         // For boolean - use answer_boolean
//         payload.answer_boolean = answer === true || answer === 'true' || answer === 1;
//         console.log(`[submitAnswer] Boolean payload:`, payload);
//       } else {
//         // Default fallback - try as single select
//         if (answer && typeof answer === 'string') {
//           const option = questionData?.options?.find(
//             opt => opt.label === answer || opt.value === answer
//           );
//           if (option?.option_id) {
//             payload.selected_option_ids = [option.option_id];
//           }
//         }
//         console.log(`[submitAnswer] Default fallback payload:`, payload);
//       }
      
//       // Call the API with the payload
//       console.log(`[submitAnswer] Calling API for ${questionId} with payload:`, payload);
//       const response = await questionnaireService.submitAnswer(questionId, payload);
      
//       console.log(`[submitAnswer] Success for ${questionId}:`, response.data);
      
//       return true;
//     } catch (err) {
//       console.error(`[submitAnswer] Failed to submit ${questionId} answer:`, err);
//       console.error(`[submitAnswer] Error response:`, err.response?.data);
//       setAnswerError(err.response?.data?.message || `Failed to submit ${questionId} answer`);
//       return false;
//     } finally {
//       setAnswerLoading(false);
//     }
//   };

//   const nextDisabled =
//     (step === 1 && !introAgree) ||
//     (step === 2 && !weightAgree) ||
//     (step === 3 && !heightAgree);

//   const goNext = async () => {
//     // If on step 1 (intro), submit consent first
//     if (step === 1 && introAgree) {
//       try {
//         setConsentLoading(true);
//         setConsentError(null);
        
//         // Call consent API
//         console.log('[goNext] Submitting consent...');
//         await questionnaireService.submitConsent(true);
//         console.log('[goNext] Consent submitted successfully');
        
//         // Fetch basic metrics questions from API after consent
//         setQuestionsLoading(true);
//         try {
//           console.log('[goNext] Fetching basic_metrics questions...');
//           const questionsRes = await questionnaireService.getQuestions('basic_metrics');
//           console.log('[goNext] Questions response:', questionsRes.data);
          
//           const questions = questionsRes.data?.data?.questions?.basic_metrics || [];
//           // Sort by flow_order
//           const sortedQuestions = questions.sort((a, b) => a.flow_order - b.flow_order);
//           setBasicMetricsQuestions(sortedQuestions);
//           console.log('[goNext] Basic metrics questions loaded:', sortedQuestions.map(q => q.question_id));
           
//           // Set default values from API range_config if available
//           const weightQuestion = sortedQuestions.find(q => q.question_id === 'weight');
//           const heightQuestion = sortedQuestions.find(q => q.question_id === 'height');
          
//           if (weightQuestion?.range_config) {
//             const { min, max } = weightQuestion.range_config;
//             setWeight(Math.round((min + max) / 2)); // Set to middle value
//             console.log('[goNext] Weight range:', weightQuestion.range_config);
//           }
//           if (heightQuestion?.range_config) {
//             const { min, max } = heightQuestion.range_config;
//             setHeight(Math.round((min + max) / 2)); // Set to middle value
//             console.log('[goNext] Height range:', heightQuestion.range_config);
//           }
//         } catch (qErr) {
//           console.error('[goNext] Failed to fetch questions:', qErr);
//         } finally {
//           setQuestionsLoading(false);
//         }
        
//         // After successful consent, proceed to next step
//         setStep((s) => s + 1);
//       } catch (err) {  
//         console.error("[goNext] Failed to submit consent:", err);
//         setConsentError(err.response?.data?.message || "Failed to submit consent. Please try again.");
//         // Still allow user to proceed even if consent fails (for demo purposes)
//         setStep((s) => s + 1);
//       } finally {
//         setConsentLoading(false);
//       }
//     } else if (!nextDisabled) {
//       setStep((s) => s + 1);
//     }
//   };

//   const goBack = () => {
//     setStep((s) => s - 1);
//   };


//   return (
//     <div className="min-h-screen bg-black text-white flex justify-center items-center px-4 overflow-hidden">
     
     
//      <div className="w-full max-w-sm">

//   {loading ? (
//     <div className="flex justify-center items-center min-h-[400px]">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
//     </div>
//   ) : (
//     <>
//      {step === 1 && showLoader ? (
//   <IntroLoader image={screenData?.image_url} />
// ) : step === 1 ? (
//   <Intro
//     agree={introAgree}
//     setAgree={setIntroAgree}
//     onNext={goNext}
//     disabled={nextDisabled}
//     screenData={screenData}
//     loading={consentLoading}
//     error={consentError}
//   />
// ) : null}

//       {step === 2 && (
//         <WeightStep
//           value={weight}
//           agree={weightAgree}
//           setAgree={setWeightAgree}
//           setValue={setWeight}
//           questionData={basicMetricsQuestions.find(q => q.question_id === "weight")}
//           onNext={async () => {
//             const weightQuestion = basicMetricsQuestions.find(q => q.question_id === "weight");
//             console.log('[WeightStep onNext] Submitting weight:', weight);
//             if (weightQuestion) {
//               const success = await submitAnswer(weightQuestion.question_id, weight, weightQuestion);
//               console.log('[WeightStep onNext] Weight submission result:', success);
//             }
//             setStep(3);
//           }}
//           onBack={() => setStep(1)}
//           disabled={nextDisabled}
//         />
//       )}

//       {step === 3 && (
//         <HeightStep
//           value={height}
//           setValue={setHeight}
//           agree={heightAgree}
//           setAgree={setHeightAgree}
//           questionData={basicMetricsQuestions.find(q => q.question_id === "height")}
//           onNext={async () => {
//             const heightQuestion = basicMetricsQuestions.find(q => q.question_id === "height");
//             console.log('[HeightStep onNext] Submitting height:', height);
//             if (heightQuestion) {
//               const success = await submitAnswer(heightQuestion.question_id, height, heightQuestion);
//               console.log('[HeightStep onNext] Height submission result:', success);
//             }
//             setStep(4);
//           }}
//           onBack={() => setStep(2)}
//           disabled={nextDisabled}
//         />
//       )}

//       {step === 4 && (
//         <BloodStep
//           value={blood}
//           setValue={setBlood}
//           questionData={basicMetricsQuestions.find(q => q.question_id === "blood_group")}
//           onBack={() => setStep(3)}
//           onComplete={async () => {
//             const bloodQuestion = basicMetricsQuestions.find(
//               q => q.question_id === "blood_group"
//             );

//             console.log('[BloodStep onComplete] Submitting blood group:', blood);
//             if (bloodQuestion && blood) {
//               // Pass the blood value and questionData
//               const success = await submitAnswer(bloodQuestion.question_id, blood, bloodQuestion);
//               console.log('[BloodStep onComplete] Blood group submission result:', success);
//             }

//             setStep(5); // ✅ move to Fitness
//           }}
//         />
//       )}

//       {step === 5 && (
//         <Fitness
//           onBack={() => setStep(4)}
//           onComplete={() => {
//             router.push("/onboarding/questionnaire");
//           }}
//         />
//       )}
//     </>
//   )}

// </div>
//     </div>
//   );
// }

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

  const TOTAL_STEPS = 5;

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

  const [showLoader, setShowLoader] = useState(true);

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
    (step === 1 && !introAgree) ||
    (step === 2 && !weightAgree) ||
    (step === 3 && !heightAgree);

  const goNext = async () => {
    if (step === 1 && introAgree) {
      try {
        setConsentLoading(true);
        setConsentError(null);

        await questionnaireService.submitConsent(true);

        setQuestionsLoading(true);

        try {
          const questionsRes =
            await questionnaireService.getQuestions("basic_metrics");

          const questions =
            questionsRes.data?.data?.questions?.basic_metrics || [];

          const sortedQuestions = questions.sort(
            (a, b) => a.flow_order - b.flow_order
          );

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
        } catch (qErr) {
          console.error(qErr);
        } finally {
          setQuestionsLoading(false);
        }

        setStep((s) => s + 1);
      } catch (err) {
        console.error(err);
        setConsentError(
          err.response?.data?.message ||
            "Failed to submit consent."
        );
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
  <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4 overflow-hidden">

    {step >= 2 && (
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
              questionData={basicMetricsQuestions.find(
                (q) => q.question_id === "weight"
              )}
              onNext={async () => {
                const q = basicMetricsQuestions.find(
                  (q) => q.question_id === "weight"
                );
                if (q) await submitAnswer(q.question_id, weight, q);
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
              questionData={basicMetricsQuestions.find(
                (q) => q.question_id === "height"
              )}
              onNext={async () => {
                const q = basicMetricsQuestions.find(
                  (q) => q.question_id === "height"
                );
                if (q) await submitAnswer(q.question_id, height, q);
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
              questionData={basicMetricsQuestions.find(
                (q) => q.question_id === "blood_group"
              )}
              onBack={() => setStep(3)}
              onComplete={async () => {
                const q = basicMetricsQuestions.find(
                  (q) => q.question_id === "blood_group"
                );
                if (q && blood)
                  await submitAnswer(q.question_id, blood, q);

                setStep(5);
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

function IntroLoader({ image }) {
  return (
    <> 
    
    <div className="flex items-center justify-center min-h-screen bg-black">
      <img
        src={image}
        alt="loading"
        className="w-96 h-[450px]  rounded-xl"
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

<div className=" flex flex-col items-center px-5  font-['Poppins'] text-white max-w-[390px] mx-auto relative">

  {/* Title */}
  <h2 className="font-['Playfair_Display'] text-[27px] font-semibold text-center mb-4 mt-1 tracking-[-0.3px]">
    {questionText}
  </h2>

  {/* Unit toggle */}
  <div className="bg-[#1f1f1f] rounded-full p-1 flex border border-[#F57264] w-[200px] h-[48px] items-center relative mb-2">
    
    {/* Sliding pill */}
    <div
      className="absolute top-1 bottom-1 w-[calc(50%-4px)]  rounded-full bg-gradient-to-r from-[#1A43CA] to-[#1FCCF2] transition-all duration-300"
      style={{
        left: unit === "ft" ? 4 : "calc(50% + 0px)",
      }}
    />

    <button
      onClick={() => handleUnitChange("ft")}
      className={`flex-1 bg-transparent border-none font-medium text-[14px] cursor-pointer relative z-[1] ${
        unit === "ft" ? "text-white" : "text-[#888]"
      }`}
    >
      Ft
    </button>

    <button
      onClick={() => handleUnitChange("in")}
      className={`flex-1 bg-transparent border-none font-Poppins font-medium text-[14px] cursor-pointer relative z-[1] ${
        unit === "in" ? "text-white" : "text-[#888]"
      }`}
    >
      Inches
    </button>
  </div>

  {/* Ruler + value section */}
  <HeightRuler value={value} setValue={setValue} unit={unit} />

  {/* Note */} 
  <div className=" flex flex-col justify-center items-center text-center font-Poppins  px-4 py-3.5 text-[11.5px] text-[#888] leading-[1.6] w-full">
    <p className="text-white/90">
    Note:If you do not know your current weight, select "Not Sure" and visit your nearest Playmate Center for proper weight check.
    </p>

    <label className="flex items-start gap-2 text-gray-800 font-Poppins text-center">
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
    className="mt-7 w-[60px] h-[60px] rounded-full bg-gradient-to-br from-pink-500 to-orange-500 border-none text-white text-[22px] cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
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
    <div className="flex items-center justify-between w-full  px-3">

      {/* Left big value */}
      <div>
        <div className="text-[40px] font-semibold leading-none text-white font-Poppins ">
          {clampedValue}
        </div>

        <div className="text-[16px] text-white mt-1  font-['Poppins']">
          {unit === "in" ? "Inches" : "Feet"}
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={containerRef}
        className="relative w-[110px] overflow-hidden cursor-ns-resize   "
        style={{ height: viewHeight }}
      >

        {/* Pink arrow indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[16px] border-r-pink-500" />

      

        {/* Tick strip */}
        <div
          className="absolute left-0 w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translateY(${center - offset}px)`
          }}
        >
          {Array.from({ length: visMax - visMin + 1 }).map((_, i) => {
            const v = visMin + i;
            const isMajor = v % 10 === 0;
            const isSelected = v === clampedValue;
            const isOutOfRange = v < min || v > max;

            return (
              <div
                key={v}
                className="flex items-center justify-end pr-[22px]"
                style={{
                  height: stepHeight,
                  opacity: isOutOfRange ? 0.25 : 1
                }}
              >

                {isMajor && (
                  <span
                    className={`text-[11px] mr-[6px] font-['Poppins'] ${
                      isSelected ? "text-white font-bold" : "text-white font-normal"
                    }`}
                  >
                    {v}
                  </span>
                )}

                <div
                  className="rounded-[1px]"
                  style={{
                    width: isMajor ? 40 : 20,
                    height: isSelected ? 2 : isMajor ? 2 : 1,
                    background: isSelected
                      ? "#ec4899"
                      : isMajor
                      ? "#555"
                      : "#333",
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
    <div className="min-h-screen bg-black text-white flex flex-col px-4 mt-2">



      {/* TITLE */}
      <h2 className="text-3xl text-center mb-6 font-semibold font-Playfair Display ">
        What’s your <span className="text-orange-400">Blood</span><br />
        <span className="text-orange-400">Group</span>
      </h2>

      {/* GROUP SELECTOR */}
      <div className="flex justify-center mb-10 font-Poppins ">
        <div className="flex bg-[#1f1f1f] border border-[#FF8319] rounded-full p-1 w-[260px]">
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
      <div className="text-center font-Poppins ">
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
      <div className="flex justify-center mb-2">
        <button
          onClick={onComplete}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl shadow-lg"
        >
          ✓
        </button>
      </div>

      {/* NOTE */}
      <p className="text-[14px] text-white/80 font-normal  text-center mb-2 font-Poppins  ">
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




