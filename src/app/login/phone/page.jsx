"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth";
import { getRouteFromStep } from "../../../lib/api/navigation";
import { calculateProgressPercentage } from "../../../lib/onboarding/progressCalculator";

export default function PhoneLogin() {
  const router = useRouter();

  const [step, setStep] = useState("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [screens, setScreens] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(true);

  const inputsRef = useRef([]);

  /*
  ==============================
  Fetch Login Screen Config
  ==============================
  */
  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const res = await authService.getAllLoginScreens("web");
        const screensArray = res?.data?.data?.screens || [];
        const mapped = {};
        screensArray.forEach((s) => {
          mapped[s.screen_type] = s;
        });
        setScreens(mapped);
      } catch (err) {
        console.error("Failed to load login screens", err);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchScreens();
  }, []);

  const phoneScreen = screens["phone_input"];
  const otpScreen = screens["phone_otp"];

  /*
  ==============================
  Timer
  ==============================
  */
  useEffect(() => {
    if (step !== "phoneOtp" || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  /*
  ==============================
  Focus OTP
  ==============================
  */
  useEffect(() => {
    if (step === "phoneOtp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 200);
    }
  }, [step]);

  /*
  ==============================
  Send Phone OTP
  ==============================
  */
  const sendPhoneOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter valid 10 digit phone.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clear all previous session data
      sessionStorage.clear();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("playymate_access_token");
      localStorage.removeItem("playymate_refresh_token");

      const response = await authService.sendPhoneOTP(phone);

      const flowId = response?.data?.auth_flow_id;
      sessionStorage.setItem("auth_flow_id", flowId);
      sessionStorage.setItem("phone", phone);

      setStep("phoneOtp");
      setTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  /*
  ==============================
  Verify OTP
  ==============================
  */
  const verifyPhoneOtp = async () => {
    const code = otp.join("");
    const flowId = sessionStorage.getItem("auth_flow_id");

    try {
      setLoading(true);
      setError(null);

      // Step 1: Verify OTP
      const verifyResponse = await authService.verifyPhoneOTP(flowId, code);

      if (!verifyResponse?.data?.user?.phone_verified) {
        setError("Invalid OTP.");
        return;
      }

      // ✅ FIX: Capture next_required_step HERE from OTP response
      // This is available before completeLogin and doesn't require a 
      // separate API call that would 403.
      const nextStepFromOtp = verifyResponse?.data?.next_required_step;
      const emailVerified = verifyResponse?.data?.user?.email_verified;

      // ✅ Store next step in sessionStorage so onboarding pages don't need to call API
      sessionStorage.setItem("onboarding_next_step", nextStepFromOtp || "");

      sessionStorage.setItem("phone_verified", "true");

      // If email not verified, go collect it first
      if (!emailVerified) {
        router.push("/login/email");
        return;
      }

      // Step 2: Complete login to get tokens
      const completeResponse = await authService.completeLogin(flowId);

      const tokens = completeResponse?.data?.data || completeResponse?.data || {};

      const accessToken = tokens.access_token || tokens.accessToken;
      const refreshToken = tokens.refresh_token || tokens.refreshToken;

      if (!accessToken) {
        setError("Login failed. Please try again.");
        return;
      }

      // ✅ FIX: Store token with the key that matches what the rest of
      // the app reads. CategorySelection reads "access_token" (snake_case).
      // Store BOTH variants to be safe across the codebase.
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("refresh_token", refreshToken);
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);

      // ✅ FIX: Also store in localStorage - app auth guards check localStorage
      // (Google login stores here too)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Also call authService.storeTokens if it handles other storage logic
      authService.storeTokens({ accessToken, refreshToken });

      // ✅ FIX: Do NOT call getOnboardingStatus here.
      // The backend returns 403 for this endpoint with a freshly issued token
      // at this point in the auth flow. We already have next_required_step
      // from the OTP verify response above — use that directly.

      console.log("✅ Login complete. Next step:", nextStepFromOtp);
      console.log("nextStepFromOtp for returning user:", nextStepFromOtp);

      // Route based on next step from OTP response
      if (
        nextStepFromOtp === "ACTIVE_USER" ||
        nextStepFromOtp === "COMPLETED" ||
        nextStepFromOtp === "HOME" ||
        nextStepFromOtp === "ACTIVE" // ACTIVE may be returned for returning users
      ) {
        router.push("/onboarding/home");
        return;
      }

      if (
        nextStepFromOtp === "NAME_CAPTURE" ||
        nextStepFromOtp === "NAME"
      ) {
        router.push("/onboarding/name");
        return;
      }

      if (nextStepFromOtp === "GENDER") {
        router.push("/onboarding/gender");
        return;
      }

      if (nextStepFromOtp === "CATEGORY_SELECTION") {
        router.push("/onboarding/category-selection");
        return;
      }

      if (nextStepFromOtp === "PHYSICAL_PROFILE_QUESTIONS") {
        router.push("/onboarding/physical");
        return;
      }

      // Generic fallback using getRouteFromStep
      const route = getRouteFromStep(nextStepFromOtp);
      if (route) {
        authService.storeOnboardingResume({
          onboarding_state: nextStepFromOtp,
          progress_percentage: calculateProgressPercentage(nextStepFromOtp),
        });
        router.push(route);
        return;
      }

      // Final fallback
      router.push("/onboarding/name");

    } catch (err) {
      console.error("verifyPhoneOtp error:", err);
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /*
  ==============================
  OTP Input Change
  ==============================
  */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {
    const updated = [...otp];

    if (otp[index]) {
      updated[index] = "";
      setOtp(updated);
    } else if (index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }
};

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const currentScreen = step === "phone" ? phoneScreen : otpScreen;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between px-6 py-12">

      {/* Back */}
      <button onClick={() => router.back()} className="text-xl">
        ←
      </button>

      {/* Content */}
      <div className="max-w-md w-full mx-auto">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            {currentScreen?.title
              ?.split(" ")
              .map((word, index) =>
                index === 2 ? (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-fuchsia-500 to-orange-500 bg-clip-text text-transparent"
                  >
                    {" " + word}
                  </span>
                ) : (
                  " " + word
                )
              )}
          </h1>

          <p className="text-gray-400 mt-3  font-Poppins text-sm">
            {currentScreen?.subtitle
              ?.replace("{phone}", `+91 ${phone}`)}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-pink-500 text-white p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* PHONE INPUT */}
        {step === "phone" && (
          <div className="flex items-center  font-Poppins bg-[#1a1a1a] rounded-xl px-4 h-14 gap-3 border border-gray-700">

            <span className="text-xl">🇮🇳</span>
            <span className="text-gray-400">
              {phoneScreen?.input_placeholders?.country_code}
            </span>
            <div className="w-px h-6 bg-gray-600" />
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder={phoneScreen?.input_placeholders?.phone}
              className="flex-1 bg-transparent outline-none text-white"
            />
          </div>
        )}

        {/* OTP */}
        {step === "phoneOtp" && (
          <>
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={digit}
                  maxLength={1}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, i)
                  }
                   onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-12 h-14 text-center bg-[#1a1a1a] font-Poppins rounded-xl border border-gray-600 text-lg"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center text-sm text-gray-400 mt-4 font-Poppins">

              {timer > 0 ? (
                <span>
                  Resend OTP in{" "}
                  <span className="text-orange-400">
                    00:{String(timer).padStart(2, "0")}
                  </span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    setTimer(30);
                    sendPhoneOtp();
                  }}
                  className="text-fuchsia-500"
                >
                  {otpScreen?.cta_text?.resend_otp}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={step === "phone" ? sendPhoneOtp : verifyPhoneOtp}
        disabled={loading}
        className="w-full max-w-md  font-Poppins mx-auto py-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 font-semibold"
      >
        {loading ? "Loading..." : currentScreen?.cta_text?.primary}
      </button>
    </div>
  );
}