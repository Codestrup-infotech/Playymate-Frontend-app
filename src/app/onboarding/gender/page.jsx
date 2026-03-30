"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { userService } from "@/services/user";
import { getErrorMessage } from "@/lib/api/errorMap";
import { getRouteFromStep } from "@/lib/api/navigation";


export default function OnboardingGenderPage() {
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenConfig, setScreenConfig] = useState(null);
  const clearError = () => setError(null);


  const genderOptions = [
    {
      id: "male",
      label: screenConfig?.option_labels?.male || "Male",
      symbol: "♂",
      symbolColor: "#e05a6a",
    },
    {
      id: "female",
      label: screenConfig?.option_labels?.female || "Female",
      symbol: "♀",
      symbolColor: "#e05a6a",
    },
    {
      id: "other",
      label: screenConfig?.option_labels?.other || "Other",
      symbol: null,
    },
  ];

  useEffect(() => {
    const initialize = async () => {
      try {
  
        // onboarding state check
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
  
        const pastGenderStates = [
          "DOB_CAPTURED",
          "PARENT_CONSENT_PENDING",
          "PARENT_CONSENT_APPROVED",
          "LOCATION_CAPTURED",
          "PROFILE_PHOTO_CAPTURED",
        ];
  
        if (pastGenderStates.includes(state)) {
          router.push("/onboarding/dob");
          return;
        }
  
        // 🔹 Fetch screen config
        const configRes = await userService.getScreenConfig("gender_selection");
        const screen = configRes?.data?.data?.screen;
  
        setScreenConfig(screen);
  
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setInitialLoading(false);
      }
    };
  
    initialize();
  
  }, [router]);


  const handleSubmit = async (selectedGender) => {
    if (!selectedGender) {
      setError("Please select your gender");
      return;
    }

    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("playymate_access_token");

    console.log(
      "🔑 Gender API - Token being used:",
      token ? token.substring(0, 30) + "..." : "NO TOKEN"
    );
    console.log(
      "🔑 Gender API - Token from sessionStorage:",
      !!sessionStorage.getItem("accessToken")
    );
    console.log(
      "🔑 Gender API - Token from localStorage:",
      !!localStorage.getItem("accessToken")
    );

    try {
      setLoading(true);
      setGender(selectedGender);
      clearError();

      const response = await userService.updateGender(selectedGender);

      console.log("Gender save response:", response);
      console.log("Gender save response.data:", response?.data);

      router.push("/onboarding/dob");
    } catch (err) {
      console.error("Gender save error:", err);
      console.error("Gender save error response:", err.response?.data);

      const errorCode = err.response?.data?.error_code;
      const message =
        err.response?.data?.message ||
        getErrorMessage(errorCode) ||
        "Failed to save gender. Please try again.";

      console.error("Gender error code:", errorCode);
      console.error("Gender error message:", message);

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // const handleSkip = () => {
  //   router.push("/onboarding/dob");
  // };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111113] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        {/* <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.push("/onboarding/name")}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-300" />
          </div>
        </div> */}

        {/* Title */}
        <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
  {(screenConfig?.title || "")
    .split(" ")
    .map((word, index) => (
      <span
        key={index}
        className={
          index === 2
            ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
            : ""
        }
      >
        {word}{" "}
      </span>
    ))}
    </h1>
        <p>
          {screenConfig?.subtitle || ""}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Gender Options */}
        <div className="mt-8 flex flex-col gap-4   font-Poppins font-normal">
          {genderOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSubmit(option.id)}
              disabled={loading}
              className={`
                w-full py-5 px-6
                flex items-center justify-center gap-3
                text-lg font-semibold
                rounded-2xl
                bg-gradient-to-br from-[#1e1e22] to-[#18181c] hover:bg-gradient-to-br  hover:from-[#EB4694] hover:to-[#FF8319]
                border
                transition-all duration-200
                shadow-lg
                ${
                  gender === option.id
                    ? "border-pink-500 ring-1  ring-pink-500/50 scale-[1.02]"
                    : "border-[#2a2a30] hover:border-pink-500/60 hover:brightness-110"
                }
                active:scale-[0.98]
                disabled:opacity-50
              `}
            >
              <span>{option.label}</span>

              {option.symbol && (
                <span
                  className="text-xl hover:text-white"
                  style={{ color: option.symbolColor }}
                >
                  {option.symbol}
                </span>
              )}

              {loading && gender === option.id && (
                <Loader2 className="w-4 h-4 animate-spin ml-1 text-pink-400  " />
              )}
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          type="button"
          // onClick={handleSkip}
          disabled={loading}
          className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {/* Skip for now */}
        </button>
      </div>
    </div>
  );
}