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


// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { authService } from "../../../services/auth";
// import { getRouteFromStep } from "../../../lib/api/navigation";
// import { userService } from "../../../services/user";
// import { calculateProgressPercentage } from "../../../lib/onboarding/progressCalculator";

// export default function PhoneLogin() {
//   const router = useRouter();

//   const [step, setStep] = useState("phone");
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [timer, setTimer] = useState(30);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const inputsRef = useRef([]);

//   useEffect(() => {
//     if (step !== "phoneOtp" || timer === 0) return;
//     const interval = setInterval(() => {
//       setTimer((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [timer, step]);

//   useEffect(() => {
//     if (step === "phoneOtp") {
//       setTimeout(() => inputsRef.current[0]?.focus(), 200);
//     }
//   }, [step]);

//   // const sendPhoneOtp = async () => {
//   //   if (phone.length !== 10) {
//   //     setError("Enter valid 10 digit phone.");
//   //     return;
//   //   }
//   //   try {
//   //     setLoading(true);
//   //     setError(null);
//   //     const response = await authService.sendPhoneOTP(phone);
//   //     const flowId = response?.data?.auth_flow_id;
//   //     sessionStorage.setItem("auth_flow_id", flowId);
//   //     sessionStorage.setItem("phone", phone);
//   //     setStep("phoneOtp");
//   //     setTimer(30);
//   //   } catch (err) {
//   //     setError(err.response?.data?.message || "Failed to send OTP.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// const sendPhoneOtp = async () => {
//   if (phone.length !== 10) {
//     setError("Enter valid 10 digit phone.");
//     return;
//   }

//   try {
//     setLoading(true);
//     setError(null);

//     // Clear any previous session data to ensure fresh flow for new user
//     sessionStorage.removeItem("auth_flow_id");
//     sessionStorage.removeItem("phone");
//     sessionStorage.removeItem("email");
//     sessionStorage.removeItem("phone_verified");
//     sessionStorage.removeItem("email_verified");
//     sessionStorage.removeItem("name_captured");
    
//     // Also clear any old tokens from previous session (both sessionStorage and localStorage)
//     sessionStorage.removeItem('accessToken');
//     sessionStorage.removeItem('refreshToken');
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("playymate_access_token");
//     localStorage.removeItem("playymate_refresh_token");

//     // 🔥 API CALL
//     const response = await authService.sendPhoneOTP(phone);

//     // 🔥 GET OTP FROM RESPONSE
//     const backendOtp =
//       response?.data?.otp || response?.data?.data?.otp;

//     // 🔥 SHOW OTP IN CONSOLE
//     console.log("🔥 TEST OTP:", backendOtp);

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
//   const verifyPhoneOtp = async () => {
//     const code = otp.join("");
//     const flowId = sessionStorage.getItem("auth_flow_id");
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await authService.verifyPhoneOTP(flowId, code);
      
//       // Check if phone is verified
//       if (!response?.data?.user?.phone_verified) {
//         setError("Invalid OTP.");
//         return;
//       }
      
//       // Get the next required step from the response
//       const nextStep = response?.data?.next_required_step;
//       const emailVerified = response?.data?.user?.email_verified;
      
//       // Mark phone as verified in session
//       sessionStorage.setItem('phone_verified', 'true');
      
//       console.log('Phone verification response:', { nextStep, emailVerified, response: response?.data });
      
//       // If email is not verified, redirect to email page (new user flow)
//       if (!emailVerified) {
//         router.push('/login/email');
//         return;
//       }
      
//       // If email is already verified (old user), we need to:
//       // 1. Call auth/complete to get JWT token
//       // 2. Use that token to get onboarding status
//       try {
//         // Step 1: Complete login to get JWT token
//         const completeResponse = await authService.completeLogin(flowId);
//         const tokens = completeResponse?.data?.data || completeResponse?.data || {};
//         const accessToken = tokens.access_token || tokens.accessToken;
//         const refreshToken = tokens.refresh_token || tokens.refreshToken;
        
//         if (accessToken) {
//           authService.storeTokens({ accessToken, refreshToken });
//           // Now we have the token, can call onboarding status
//           const statusResponse = await userService.getOnboardingStatus();
//           const currentStep = statusResponse?.data?.data?.next_required_step;
//           const onboardingState = statusResponse?.data?.data?.onboarding_state;
//           const userState = statusResponse?.data?.data?.user_state;
          
//           console.log('Onboarding status after phone verify:', { currentStep, onboardingState, userState });
          
//           // Use the actual onboarding state to redirect
//           const redirectStep = currentStep || userState || nextStep;
          
//           // Handle redirect based on the actual onboarding state
//           if (redirectStep) {
//             // If user is already completed, go to home
//             if (redirectStep === 'ACTIVE_USER' || redirectStep === 'COMPLETED' || 
//                 redirectStep === 'HOME' || redirectStep === 'ACTIVE' || 
//                 redirectStep === 'DONE' || redirectStep === 'EXTENDED_PROFILE_COMPLETED') {
//               router.push('/onboarding/home');
//               return;
//             }
            
//             // For basic account steps (name not captured yet), go to name
//             if (redirectStep === 'NAME_CAPTURE' || redirectStep === 'NAME' || 
//                 redirectStep === 'BASIC_ACCOUNT' || redirectStep === 'BASIC_ACCOUNT_CREATED') {
//               router.push('/onboarding/name');
//               return;
//             }
            
//             // For all other onboarding steps, use the route mapping
//             const route = getRouteFromStep(redirectStep);
//             if (route && route !== '/login' && route !== '/') {
//               authService.storeOnboardingResume({
//                 onboarding_state: redirectStep,
//                 progress_percentage: calculateProgressPercentage(redirectStep)
//               });
//               router.push(route);
//               return;
//             }
//           }
          
//           // Default: go to name page
//           router.push('/onboarding/name');
//           return;
//         }
//       } catch (completeErr) {
//         console.error('Error completing login:', completeErr);
//       }
      
//       // If we couldn't get tokens, just go to name page
//       router.push('/onboarding/name');
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
//     <div
//       style={{
//         minHeight: "100vh",
//         backgroundColor: "#000",
//         color: "#fff",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: "60px 24px 48px",
//         fontFamily: "'Georgia', serif",
//         position: "relative",
//       }}
//     >
//       {/* Back Arrow */}
//       <div style={{ alignSelf: "flex-start" }}>
//         <button
//           onClick={() => router.back()}
//           style={{
//             background: "none",
//             border: "none",
//             color: "#fff",
//             fontSize: "22px",
//             cursor: "pointer",
//             padding: 0,
//           }}
//         >
//           ←
//         </button>
//       </div>

//       {/* Center Content */}
//       <div style={{ width: "100%", maxWidth: "400px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px" }}>
//         {/* Title */}
//         <div style={{ textAlign: "center", marginBottom: "8px" }}>
//           <h1 style={{ fontSize: "32px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>
//             {step === "phone" ? (
//               <>  Login With <span style={{ color: "#F472B6" }}>Phone</span></>   
              
//             ) : (
//               <>Enter <span style={{ color: "#E8824A" }}>OTP</span></>
//             )}
//           </h1>
//           <p style={{ color: "#aaa", fontSize: "15px", marginTop: "12px", fontFamily: "sans-serif", fontWeight: 400 }}>
//             {step === "phone"
//               ? "We'll need your phone number to send an OTP for verification."
//               : `We've sent a 6-digit OTP to +91 ${sessionStorage.getItem?.("phone") || phone}`}
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div
//             style={{
//               background: "#EC4899",
//               border: "#EC4899",
//               color: "#EC4899",
//               padding: "12px 16px",
//               borderRadius: "12px",
//               fontSize: "14px",
//               fontFamily: "sans-serif",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {/* Phone Step */}
//         {step === "phone" && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               background: "#1a1a1a",
//               borderRadius: "14px",
//               border: "1.5px solid",
//               borderColor: "#EC4899",
//               padding: "0 16px",
//               height: "58px",
//               gap: "10px",
//               /* Gradient border trick via box-shadow */
//               boxShadow: "0 0 0 1.5px transparent",
//               outline: "none",
//               backgroundImage: "linear-gradient(#1a1a1a, #1a1a1a), linear-gradient(to right, #d946ef, #f97316)",
//               backgroundOrigin: "border-box",
//               backgroundClip: "padding-box, border-box",
//               border: "1.5px solid transparent",
//             }}
//           >
//             {/* Flag + Code */}
//             <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
//               <span style={{ fontSize: "24px" }}>🇮🇳</span>
//               <span style={{ color: "#aaa", fontSize: "15px", fontFamily: "sans-serif" }}>91+</span>
//               <span style={{ color: "#555", fontSize: "13px" }}>▾</span>
//             </div>
//             {/* Divider */}
//             <div style={{ width: "1px", height: "24px", background: "#444" }} />
//             {/* Input */}
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//               placeholder=""
//               maxLength={10}
//               style={{
//                 flex: 1,
//                 background: "transparent",
//                 border: "none",
//                 outline: "none",
//                 color: "#fff",
//                 fontSize: "16px",
//                 fontFamily: "sans-serif",
//                 caretColor: "#d946ef",
//               }}
//             />
//           </div>
//         )}

//         {/* OTP Step */}
//         {step === "phoneOtp" && (
//           <>
//             <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
//               {otp.map((digit, i) => (
//                 <input
//                   key={i}
//                   ref={(el) => (inputsRef.current[i] = el)}
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleOtpChange(e.target.value, i)}
//                   style={{
//                     width: "48px",
//                     height: "56px",
//                     textAlign: "center",
//                     background: "#1a1a1a",
//                     border: digit ? "1.5px solid #d946ef" : "1.5px solid #333",
//                     borderRadius: "12px",
//                     color: "#fff",
//                     fontSize: "20px",
//                     fontFamily: "sans-serif",
//                     outline: "none",
//                     caretColor: "#d946ef",
//                     transition: "border-color 0.2s",
//                   }}
//                 />
//               ))}
//             </div>

//             {/* Resend */}
//             <div style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: "14px", color: "#aaa" }}>
//               {timer > 0 ? (
//                 <span>Resend OTP in <span style={{ color: "#E8824A" }}>00:{String(timer).padStart(2, "0")}</span></span>
//               ) : (
//                 <button
//                   onClick={() => { setTimer(30); sendPhoneOtp(); }}
//                   style={{ background: "none", border: "none", color: "#d946ef", cursor: "pointer", fontSize: "14px" }}
//                 >
//                   Resend OTP
//                 </button>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Continue / Verify Button */}
//       <div style={{ width: "100%", maxWidth: "400px" }}>
//         <button
//           onClick={step === "phone" ? sendPhoneOtp : verifyPhoneOtp}
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "18px",
//             borderRadius: "50px",
//             border: "none",
//             background: "linear-gradient(to right, #d946ef, #f97316)",
//             color: "#fff",
//             fontSize: "17px",
//             fontWeight: "600",
//             fontFamily: "sans-serif",
//             cursor: loading ? "not-allowed" : "pointer",
//             opacity: loading ? 0.8 : 1,
//             letterSpacing: "0.3px",
//             transition: "opacity 0.2s",
//           }}
//         >
//           {loading ? (step === "phone" ? "Sending..." : "Verifying...") : (step === "phone" ? "Continue" : "Verify OTP")}
//         </button>
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

      sessionStorage.removeItem("auth_flow_id");
      sessionStorage.removeItem("phone");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("phone_verified");
      sessionStorage.removeItem("email_verified");
      sessionStorage.removeItem("name_captured");

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("playymate_access_token");
      localStorage.removeItem("playymate_refresh_token");

      const response = await authService.sendPhoneOTP(phone);

      const backendOtp =
        response?.data?.otp || response?.data?.data?.otp;

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

      const response = await authService.verifyPhoneOTP(flowId, code);

      if (!response?.data?.user?.phone_verified) {
        setError("Invalid OTP.");
        return;
      }

      const nextStep = response?.data?.next_required_step;
      const emailVerified = response?.data?.user?.email_verified;

      sessionStorage.setItem("phone_verified", "true");

      if (!emailVerified) {
        router.push("/login/email");
        return;
      }

      try {
        const completeResponse = await authService.completeLogin(flowId);

        const tokens =
          completeResponse?.data?.data || completeResponse?.data || {};

        const accessToken =
          tokens.access_token || tokens.accessToken;

        const refreshToken =
          tokens.refresh_token || tokens.refreshToken;

        if (accessToken) {
          authService.storeTokens({ accessToken, refreshToken });

          const statusResponse =
            await userService.getOnboardingStatus();

          const currentStep =
            statusResponse?.data?.data?.next_required_step;

          const onboardingState =
            statusResponse?.data?.data?.onboarding_state;

          const userState =
            statusResponse?.data?.data?.user_state;

          const redirectStep =
            currentStep || userState || nextStep;

          if (
            redirectStep === "ACTIVE_USER" ||
            redirectStep === "COMPLETED" ||
            redirectStep === "HOME"
          ) {
            router.push("/home");
            return;
          }

          // If user has completed questionnaire, redirect to experience
          if (
            redirectStep === "QUESTIONNAIRE_COMPLETED" ||
            redirectStep === "QUESTIONNAIRE_COMPLETE"
          ) {
            router.push("/onboarding/experience");
            return;
          }

          // If user has completed experience, redirect to home
          if (
            redirectStep === "EXPERIENCE_COMPLETED" ||
            redirectStep === "EXPERIENCE_COMPLETE"
          ) {
            router.push("/home");
            return;
          }

          if (
            redirectStep === "NAME_CAPTURE" ||
            redirectStep === "NAME"
          ) {
            router.push("/onboarding/name");
            return;
          }

          const route = getRouteFromStep(redirectStep);

          if (route) {
            authService.storeOnboardingResume({
              onboarding_state: redirectStep,
              progress_percentage:
                calculateProgressPercentage(redirectStep),
            });

            router.push(route);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }

      router.push("/onboarding/name");
    } catch (err) {
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
    <div className="min-h-screen bg-black text-white flex flex-col  justify-center items-center space-y-20 px-6">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-xl  mr-80 "
      >
        ←
      </button>

      {/* Content */}
      <div className="flex  flex-col justify-center items-center w-full mx-auto">

        {/* Title */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold">
            {currentScreen?.title
              ?.split(" ")
              .map((word, index) =>
                index === 2 ? (
                  <span
                    key={index}
                    className="bg-gradient-to-br from-[#EF3AFF] via-[#FF8319] to-[#FF8319] bg-clip-text text-transparent"
                  >
                    {" " + word}
                  </span>
                ) : (
                  " " + word
                )
              )}
          </h1>

          <p className="text-gray-400 mt-3   font-Poppins text-sm">
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
          <div className="flex items-center  w-96 font-Poppins bg-[#1a1a1a] rounded-xl px-4 h-14 gap-3 border border-pink-500 ">

            <span className="text-xl">🇮🇳</span>

            <span className="text-gray-400">
              {phoneScreen?.input_placeholders?.country_code}
            </span>

            <div className="w-px h-6 bg-gray-600" />

            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              placeholder={
                phoneScreen?.input_placeholders?.phone
              }
              className="flex-1 bg-transparent  outline-none text-white"
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

      {/* Button */}
      <button
        onClick={
          step === "phone" ? sendPhoneOtp : verifyPhoneOtp
        }
        disabled={loading}
        className="w-full max-w-sm font-Poppins mx-auto py-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500 font-semibold"
      >
        {loading
          ? "Loading..."
          : currentScreen?.cta_text?.primary}
      </button>
    </div>
  );
}