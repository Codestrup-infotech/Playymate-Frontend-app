"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import experienceService from "@/services/experience";
import { userService } from "@/services/user";

export default function CompleteExperience() {

  const router = useRouter();

  const [screens, setScreens] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const currentScreen = screens[step];

  // FETCH API SCREENS
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
    // All screens completed - call the onboarding complete API to update state
    try {
      await userService.completeOnboarding();
      console.log("Onboarding completed successfully");
    } catch (completeErr) {
      // Log error but don't block user from proceeding
      console.error("Error completing onboarding:", completeErr);
    }
    router.push("/home");
  }

} catch (error) {
  console.error("Submit error:", error.response?.data || error);
}
  
    setLoading(false);
  };

  const skip = async () => {
    // Call skip API and then complete onboarding
    try {
      await experienceService.skipAnswers();
    } catch (skipErr) {
      // Log error but don't block user from proceeding
      console.error("Error skipping experience:", skipErr);
    }
    
    // Complete onboarding after skip
    try {
      await userService.completeOnboarding();
      console.log("Onboarding completed successfully");
    } catch (completeErr) {
      // Log error but don't block user from proceeding
      console.error("Error completing onboarding:", completeErr);
    }
    
    router.push("/home");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">

          <p className="text-gray-400 text-sm">Final step</p>

          <h1 className="text-white text-4xl font-bold">
            COMPLETE YOUR
          </h1>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            EXPERIENCE
          </h2>

          <p className="text-cyan-400 mt-2">
            {currentScreen?.icon} {currentScreen?.title}
          </p>

        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">

        {currentScreen?.questions?.map((question) => (

            <div
              key={question.question_key}
              className="bg-[#121212] p-4 rounded-xl border border-cyan-500/40"
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
        <div className="mt-8 space-y-4">

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