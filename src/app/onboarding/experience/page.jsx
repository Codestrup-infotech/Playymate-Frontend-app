"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import experienceService from "@/services/experience";
import { userService } from "@/services/user";

export default function CompleteExperience() {

  const router = useRouter();

  // Flow states: 'loading' -> 'questions' -> 'celebration' -> 'home'
  const [flowState, setFlowState] = useState('loading');
  
  const [celebrationData, setCelebrationData] = useState(null);
  const [screens, setScreens] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [introScreen, setIntroScreen] = useState(null);
const [showIntro, setShowIntro] = useState(true);

  const currentScreen = screens[step];

  // FETCH INTRO SCREEN (shows as loader for 4 seconds)
  useEffect(() => {

    const fetchScreens = async () => {
      try {
        // Fetch extended intro screen from backend
        const introRes = await experienceService.getExtendedIntro();
        setIntroScreen(introRes?.data?.data?.screen);
      } catch (error) {
        console.error("Failed to fetch screens:", error);
      }
    };

    fetchScreens();

  }, []);

  // Handle loading screen (4 seconds)
  useEffect(() => {
    if (flowState === 'loading' && introScreen) {
      const timer = setTimeout(() => {
        setFlowState('questions');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [flowState, introScreen]);

  // CHECK ONBOARDING STATUS AND FETCH QUESTIONS
  useEffect(() => {

    const checkOnboardingStatus = async () => {
  try {
    const statusResponse = await userService.getOnboardingStatus();
    const data = statusResponse?.data?.data || {};
    const nextStep = data.next_required_step;
    const onboardingState = data.onboarding_state;

    const completedSteps = [
      "ACTIVE_USER",
      "COMPLETED",
      "HOME",
      "DONE",
      "ACTIVE",
      "EXPERIENCE_COMPLETED",
      "EXPERIENCE_COMPLETE",
      "EXTENDED_PROFILE_COMPLETED",
    ];

    console.log('Experience page - nextStep:', nextStep);
    console.log('Experience page - onboardingState:', onboardingState);

    if (
      completedSteps.includes(nextStep) ||
      completedSteps.includes(onboardingState)
    ) {
      console.log('Experience page - redirecting to home (completed state)');
      router.push("/home");
      return;
    }

    // If user has EXTENDED_PROFILE_INTRO or PENDING, they should stay on experience page
    if (nextStep === 'EXTENDED_PROFILE_INTRO' || nextStep === 'EXTENDED_PROFILE_PENDING' ||
        onboardingState === 'EXTENDED_PROFILE_INTRO' || onboardingState === 'EXTENDED_PROFILE_PENDING') {
      console.log('Experience page - user needs to complete extended profile, staying on this page');
      // Don't redirect - let user complete the experience
    }
  } catch (err) {
    console.error("Failed to check onboarding status:", err);
  }

  try {
    const res = await experienceService.getScreens();
    const apiScreens = res?.data?.data?.screens || [];
    setScreens(apiScreens);
  } catch (error) {
    console.error("Failed to fetch screens:", error);
  }

  setPageLoading(false);
};

    checkOnboardingStatus();
  
  }, [router]);

  // Handle celebration screen auto-redirect (4 seconds)
  useEffect(() => {
    if (flowState === 'celebration') {
      const timer = setTimeout(() => {
        router.push("/home");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [flowState, router]);

  // Fetch completion celebration data from backend after all answers submitted
  const fetchCompletionCelebration = async () => {
    try {
      const res = await experienceService.getCompletionCelebration();
      setCelebrationData(res?.data?.data);
      setFlowState('celebration');
      
      // Mark onboarding as complete on the backend
      try {
        await userService.completeOnboarding();
        console.log('Onboarding marked as complete');
      } catch (completeErr) {
        console.error('Error completing onboarding:', completeErr);
      }
    } catch (error) {
      console.error("Failed to fetch completion celebration:", error);
      // Even if celebration screen fetch fails, try to complete onboarding
      // This handles the case where completion-celebration screen returns 404
      try {
        await userService.completeOnboarding();
        console.log('Onboarding marked as complete after celebration fetch error');
      } catch (completeErr) {
        console.error('Error completing onboarding:', completeErr);
      }
      // Still redirect to home
      router.push("/home");
    }
  };

  // SELECT OPTION
  const selectOption = (questionKey, value, type) => {

    if (type === "multi_choice") {

      setAnswers((prev) => {

        const existing = prev[questionKey] || [];

        if (existing.includes(value)) {
          return {
            ...prev,
            [questionKey]: existing.filter((v) => v !== value)
          };
        }

        return {
          ...prev,
          [questionKey]: [...existing, value]
        };

      });

    } else {

      setAnswers((prev) => ({
        ...prev,
        [questionKey]: value
      }));

    }

  };

  // NEXT STEP
  const handleNext = async () => {
    setLoading(true);
  
  try {

  const responses = Object.entries(answers).map(([key, value]) => ({
    question_key: key,
    answer: value
  }));

  // 🔍 Debug logs
  console.log("=== RESPONSES ===");
  console.log(responses);

  const payload = {
    screen_key: currentScreen.screen_key,
    responses
  };

  console.log("=== PAYLOAD OBJECT ===");
  console.log(payload);

  console.log("=== PAYLOAD JSON ===");
  console.log(JSON.stringify(payload, null, 2));

  await experienceService.saveAnswers(payload);

  if (step < screens.length - 1) {
    setStep(step + 1);
    setAnswers({});
  } else {
    // All screens completed - call completion celebration API from backend
    await fetchCompletionCelebration();
  }

} catch (error) {
  console.error("Submit error:", error.response?.data || error);
}
  
    setLoading(false);
  };

  const skip = async () => {
    // Call skip API
    try {
      await experienceService.skipAnswers();
    } catch (skipErr) {
      console.error("Error skipping experience:", skipErr);
    }
    
    // Call completion celebration API from backend
    await fetchCompletionCelebration();
  };

  // Render Loading Screen (extended-intro from backend API - 4 seconds)
  const renderLoadingScreen = () => (
    // <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
    //   <div className="text-center">
      
    //     <h1 className="text-white text-3xl font-Playfair Display font-bold mb-4">
    //       {introScreen?.title || "Tell Us About Your Experience"}
    //     </h1>
        
       
      
    //     {introScreen?.image_url && (
    //       <div className="mb-6">
    //         <img 
    //           src={introScreen.image_url} 
    //           alt="Experience" 
    //           className=" h-96 w-60 mx-auto  rounded-3xl "
    //         />
    //       </div>
    //     )}
      
    //   </div>
     
    // </div>
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
  {introScreen?.image_url && (
    <div className="relative w-60 h-96">

      {/* Image */}
      <img
        src={introScreen.image_url}
        alt="Experience"
        className="w-full h-full object-cover rounded-3xl"
      />

      {/* Overlay text */}
      <div className="absolute bottom-6 left-0 right-0 text-center px-4">
        {(() => {
          const title =
            introScreen?.title || "Tell Us About Your Experience";

          const words = title.split(" ");
          const lastWord = words.pop();

          return (
            <h1 className="text-white text-xl font-bold leading-tight">
              {words.join(" ")}{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-400 bg-clip-text text-transparent">
                {lastWord}
              </span>
            </h1>
          );
        })()}
      </div>

    </div>
  )}
</div>
  );

  // Render Celebration Screen (data from backend API)
  const renderCelebrationScreen = () => {
    const screen = celebrationData?.screen;
    
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        {screen?.show_confetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="confetti-container"></div>
          </div>
        )}
        <div className="text-center z-10">
          <div className="text-6xl mb-6 animate-pulse">
            🎉
          </div>
          <h1 className="text-white text-4xl font-bold mb-4">
            {screen?.title || "You're All Set!"}
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            {screen?.subtitle || "Welcome to Playymate"}
          </p>
          <p className="text-cyan-400 text-md mb-8">
            {screen?.message || "Your profile is ready!"}
          </p>
          <button
            onClick={() => router.push("/home")}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold text-lg"
          >
            {screen?.cta?.text || "Explore Now"}
          </button>
        </div>
      </div>
    );
  };

  if (pageLoading || !introScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Show loading screen (extended-intro from backend - 4 seconds)
  if (flowState === 'loading') {
    return renderLoadingScreen();
  }

  // Show celebration screen (data from backend API)
  if (flowState === 'celebration') {
    return renderCelebrationScreen();
  }

  // Original questions flow
  return (
    <div className="min-h-screen bg-black flex justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">


          <h1 className="text-white text-4xl font-bold">
            COMPLETE YOUR
          </h1>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            EXPERIENCE
          </h2>

          <p className="text-cyan-400 mt-2 font-Poppins ">
            {currentScreen?.icon} {currentScreen?.title}
          </p>

        </div>

        {/* QUESTIONS */}
        <div className="space-y-6 font-Poppins ">

        {currentScreen?.questions?.map((question) => (

            <div
              key={question.question_key}
              className="bg-[#121212] p-4   rounded-xl border border-cyan-500/40"
            >

              <p className="text-gray-300 text-sm mb-3">
                {question.question_text}
              </p>

              <div className="grid grid-cols-2 gap-3">

                {question.options.map((opt) => {

                  const active =
                    question.question_type === "multi_choice"
                      ? answers[question.question_key]?.includes(opt.value)
                      : answers[question.question_key] === opt.value;

                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        selectOption(
                          question.question_key,
                          opt.value,
                          question.question_type
                        )
                      }
                      className={`py-2 rounded-lg text-sm transition
                      ${
                        active
                          ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                          : "bg-[#1e1e1e] text-gray-300 border border-gray-600 hover:border-pink-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );

                })}

              </div>

            </div>

          ))}

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 space-y-4 font-Poppins ">

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>

          <button
            onClick={skip}
            className="w-full text-gray-400 text-sm"
          >
            Skip for now
          </button>

        </div>

      </div>

    </div>
  );
}
