// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { authService } from "../../../services/auth";

// export default function PhoneLogin() {
//   const router = useRouter();

//   const [step, setStep] = useState("phone");
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [timer, setTimer] = useState(30);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const inputsRef = useRef([]);

//   // OTP Timer
//   useEffect(() => {
//     if (step !== "phoneOtp" || timer === 0) return;

//     const interval = setInterval(() => {
//       setTimer((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [timer, step]);

//   // Focus first OTP input
//   useEffect(() => {
//     if (step === "phoneOtp") {
//       setTimeout(() => inputsRef.current[0]?.focus(), 200);
//     }
//   }, [step]);

//   const sendPhoneOtp = async () => {
//     if (phone.length !== 10) {
//       setError("Enter valid 10 digit phone.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await authService.sendPhoneOTP(phone);
//       const flowId = response?.data?.auth_flow_id;

//       sessionStorage.setItem("auth_flow_id", flowId);
//       sessionStorage.setItem("phone", phone);

//       setStep("phoneOtp");
//       setTimer(30);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyPhoneOtp = async () => {
//     const code = otp.join("");
//     const flowId = sessionStorage.getItem("auth_flow_id");

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await authService.verifyPhoneOTP(flowId, code);

//       if (!response?.data?.user?.phone_verified) {
//         setError("Invalid OTP.");
//         return;
//       }

//       // Go to Email Step (separate page)
//       router.push("/login/email");
//     } catch (err) {
//       setError(err.response?.data?.message || "Verification failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpChange = (value, index) => {
//     if (!/^\d?$/.test(value)) return;

//     const updated = [...otp];
//     updated[index] = value;
//     setOtp(updated);

//     if (value && index < 5) {
//       inputsRef.current[index + 1]?.focus();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-sm space-y-6">

//         {error && (
//           <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
//             {error}
//           </div>
//         )}

//         {step === "phone" && (
//           <>
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//               placeholder="Enter phone"
//               className="w-full bg-gray-800 px-4 py-3 rounded-lg"
//               maxLength={10}
//             />

//             <button
//               onClick={sendPhoneOtp}
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 rounded-lg"
//             >
//               {loading ? "Sending..." : "Send OTP"}
//             </button>
//           </>
//         )}

//         {step === "phoneOtp" && (
//           <>
//             <div className="flex gap-2 justify-between">
//               {otp.map((digit, i) => (
//                 <input
//                   key={i}
//                   ref={(el) => (inputsRef.current[i] = el)}
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleOtpChange(e.target.value, i)}
//                   className="w-12 h-12 text-center bg-gray-800 rounded-lg"
//                 />
//               ))}
//             </div>

//             <button
//               onClick={verifyPhoneOtp}
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 rounded-lg"
//             >
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth";
import { getRouteFromStep } from "../../../lib/api/navigation";
import { userService } from "../../../services/user";
import { calculateProgressPercentage } from "../../../lib/onboarding/progressCalculator";

export default function PhoneLogin() {
  const router = useRouter();

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (step !== "phoneOtp" || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  useEffect(() => {
    if (step === "phoneOtp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 200);
    }
  }, [step]);

  // const sendPhoneOtp = async () => {
  //   if (phone.length !== 10) {
  //     setError("Enter valid 10 digit phone.");
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await authService.sendPhoneOTP(phone);
  //     const flowId = response?.data?.auth_flow_id;
  //     sessionStorage.setItem("auth_flow_id", flowId);
  //     sessionStorage.setItem("phone", phone);
  //     setStep("phoneOtp");
  //     setTimer(30);
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Failed to send OTP.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const sendPhoneOtp = async () => {
  if (phone.length !== 10) {
    setError("Enter valid 10 digit phone.");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    // Clear any previous session data to ensure fresh flow for new user
    sessionStorage.removeItem("auth_flow_id");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("phone_verified");
    sessionStorage.removeItem("email_verified");
    sessionStorage.removeItem("name_captured");
    
    // Also clear any old tokens from previous session (both sessionStorage and localStorage)
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("playymate_access_token");
    localStorage.removeItem("playymate_refresh_token");

    // 🔥 API CALL
    const response = await authService.sendPhoneOTP(phone);

    // 🔥 GET OTP FROM RESPONSE
    const backendOtp =
      response?.data?.otp || response?.data?.data?.otp;

    // 🔥 SHOW OTP IN CONSOLE
    console.log("🔥 TEST OTP:", backendOtp);

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
  const verifyPhoneOtp = async () => {
    const code = otp.join("");
    const flowId = sessionStorage.getItem("auth_flow_id");
    try {
      setLoading(true);
      setError(null);
      const response = await authService.verifyPhoneOTP(flowId, code);
      
      // Check if phone is verified
      if (!response?.data?.user?.phone_verified) {
        setError("Invalid OTP.");
        return;
      }
      
      // Get the next required step from the response
      const nextStep = response?.data?.next_required_step;
      const emailVerified = response?.data?.user?.email_verified;
      
      // Mark phone as verified in session
      sessionStorage.setItem('phone_verified', 'true');
      
      // If email is verified from backend response, set it in sessionStorage
      if (emailVerified) {
        sessionStorage.setItem('email_verified', 'true');
      }
      
      console.log('Phone verification response:', { nextStep, emailVerified, response: response?.data });
      
      // Handle redirect based on next_required_step from backend
      // The backend knows the user's progress and returns the correct step
      // But sometimes backend returns EMAIL_VERIFICATION even when email is already verified
      // So we check both nextStep and emailVerified
      
      // If email is already verified, we should check onboarding status and redirect to current step
      if (emailVerified) {
        // Get tokens first
        try {
          const completeResponse = await authService.completeLogin(flowId);
          const tokens = completeResponse?.data?.data || completeResponse?.data || {};
          const accessToken = tokens.access_token || tokens.accessToken;
          const refreshToken = tokens.refresh_token || tokens.refreshToken;
          
          if (accessToken) {
            authService.storeTokens({ accessToken, refreshToken });
          }
        } catch (e) {
          console.error('Error completing login:', e);
        }
        
        // If backend returns EMAIL_VERIFICATION but email is already verified,
        // we should go to the next onboarding step
        if (nextStep === 'EMAIL_VERIFICATION' || nextStep === 'EMAIL_OTP') {
          // Since email is verified, check user's onboarding status
          // and redirect to their current step
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentStep = statusResponse?.data?.data?.next_required_step;
            const onboardingState = statusResponse?.data?.data?.onboarding_state;
            
            console.log('Checking onboarding status after phone verify:', { currentStep, onboardingState });
            
            if (currentStep && currentStep !== 'EMAIL_VERIFICATION' && currentStep !== 'EMAIL_OTP') {
              const route = getRouteFromStep(currentStep);
              if (route && route !== '/login' && route !== '/') {
                authService.storeOnboardingResume({
                  onboarding_state: currentStep,
                  progress_percentage: calculateProgressPercentage(currentStep)
                });
                router.push(route);
                return;
              }
            }
            
            // Default: go to name page since email is verified
            router.push('/onboarding/name');
            return;
          } catch (statusErr) {
            console.error('Error getting status:', statusErr);
            // Default: go to name page
            router.push('/onboarding/name');
            return;
          }
        }
        
        // Otherwise use the nextStep from backend
        if (nextStep) {
          // If user is already completed, go to home
          if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME' || nextStep === 'ACTIVE') {
            router.push('/onboarding/home');
            return;
          }
          
          const route = getRouteFromStep(nextStep);
          if (route && route !== '/login' && route !== '/') {
            authService.storeOnboardingResume({
              onboarding_state: nextStep,
              progress_percentage: calculateProgressPercentage(nextStep)
            });
            router.push(route);
            return;
          }
        }
        
        // Default: go to name page
        router.push('/onboarding/name');
        return;
      }
      
      // Email not verified - go to email page
      router.push("/login/email");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 24px 48px",
        fontFamily: "'Georgia', serif",
        position: "relative",
      }}
    >
      {/* Back Arrow */}
      <div style={{ alignSelf: "flex-start" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "22px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ←
        </button>
      </div>

      {/* Center Content */}
      <div style={{ width: "100%", maxWidth: "400px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>
            {step === "phone" ? (
              <>Login With <span style={{ color: "#E8824A" }}>Phone</span></>
            ) : (
              <>Enter <span style={{ color: "#E8824A" }}>OTP</span></>
            )}
          </h1>
          <p style={{ color: "#aaa", fontSize: "15px", marginTop: "12px", fontFamily: "sans-serif", fontWeight: 400 }}>
            {step === "phone"
              ? "We'll need your phone number to send an OTP for verification."
              : `We've sent a 6-digit OTP to +91 ${sessionStorage.getItem?.("phone") || phone}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.6)",
              color: "#f87171",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {/* Phone Step */}
        {step === "phone" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#1a1a1a",
              borderRadius: "14px",
              border: "1.5px solid",
              borderColor: "#d946ef",
              padding: "0 16px",
              height: "58px",
              gap: "10px",
              /* Gradient border trick via box-shadow */
              boxShadow: "0 0 0 1.5px transparent",
              outline: "none",
              backgroundImage: "linear-gradient(#1a1a1a, #1a1a1a), linear-gradient(to right, #d946ef, #f97316)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              border: "1.5px solid transparent",
            }}
          >
            {/* Flag + Code */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <span style={{ fontSize: "24px" }}>🇮🇳</span>
              <span style={{ color: "#aaa", fontSize: "15px", fontFamily: "sans-serif" }}>91+</span>
              <span style={{ color: "#555", fontSize: "13px" }}>▾</span>
            </div>
            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "#444" }} />
            {/* Input */}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder=""
              maxLength={10}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "16px",
                fontFamily: "sans-serif",
                caretColor: "#d946ef",
              }}
            />
          </div>
        )}

        {/* OTP Step */}
        {step === "phoneOtp" && (
          <>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  style={{
                    width: "48px",
                    height: "56px",
                    textAlign: "center",
                    background: "#1a1a1a",
                    border: digit ? "1.5px solid #d946ef" : "1.5px solid #333",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "20px",
                    fontFamily: "sans-serif",
                    outline: "none",
                    caretColor: "#d946ef",
                    transition: "border-color 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Resend */}
            <div style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: "14px", color: "#aaa" }}>
              {timer > 0 ? (
                <span>Resend OTP in <span style={{ color: "#E8824A" }}>00:{String(timer).padStart(2, "0")}</span></span>
              ) : (
                <button
                  onClick={() => { setTimer(30); sendPhoneOtp(); }}
                  style={{ background: "none", border: "none", color: "#d946ef", cursor: "pointer", fontSize: "14px" }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Continue / Verify Button */}
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <button
          onClick={step === "phone" ? sendPhoneOtp : verifyPhoneOtp}
          disabled={loading}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "50px",
            border: "none",
            background: "linear-gradient(to right, #d946ef, #f97316)",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "600",
            fontFamily: "sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
            letterSpacing: "0.3px",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? (step === "phone" ? "Sending..." : "Verifying...") : (step === "phone" ? "Continue" : "Verify OTP")}
        </button>
      </div>
    </div>
  );
}
