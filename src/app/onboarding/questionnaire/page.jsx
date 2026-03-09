
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelection from "@/app/components/CategorySelection";
import { userService } from "@/services/user";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const response = await userService.getOnboardingStatus();
        const data = response?.data?.data || {};
        const nextStep = data.next_required_step;
        const onboardingState = data.onboarding_state;

        // If user has completed onboarding, redirect to home
        const completedSteps = [
          "ACTIVE_USER",
          "COMPLETED",
          "HOME",
          "DONE",
          "ACTIVE",
          "QUESTIONNAIRE_COMPLETED",
          "QUESTIONNAIRE_COMPLETE",
          "EXTENDED_PROFILE_COMPLETED",
          "EXTENDED_PROFILE_INTRO",
          "EXTENDED_PROFILE_PENDING",
        ];

        if (completedSteps.includes(nextStep) || completedSteps.includes(onboardingState)) {
          router.push("/home");
          return;
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <CategorySelection />;
}
