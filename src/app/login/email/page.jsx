// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { authService } from "../../../services/auth";

// export default function EmailLogin() {
//   const router = useRouter();

//   const [step, setStep] = useState("email");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const inputsRef = useRef([]);

//   // Prevent direct access
//   useEffect(() => {
//     const flowId = sessionStorage.getItem("auth_flow_id");
//     if (!flowId) {
//       router.push("/login");
//     }
//   }, []);

//   const sendEmailOtp = async () => {
//     const flowId = sessionStorage.getItem("auth_flow_id");

//     try {
//       setLoading(true);
//       setError(null);

//       await authService.sendEmailOTP(flowId, email);
//       sessionStorage.setItem("email", email);

//       setStep("emailOtp");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyEmailOtp = async () => {
//     const flowId = sessionStorage.getItem("auth_flow_id");
//     const code = otp.join("");

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await authService.verifyEmailOTP(flowId, code, email);

//       if (!response?.data?.user?.email_verified) {
//         setError("Invalid OTP.");
//         return;
//       }

//       // ✅ Go directly to onboarding name
//       router.push("/onboarding/name");
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

//         {step === "email" && (
//           <>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter email"
//               className="w-full bg-gray-800 px-4 py-3 rounded-lg"
//             />

//             <button
//               onClick={sendEmailOtp}
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 rounded-lg"
//             >
//               {loading ? "Sending..." : "Send OTP"}
//             </button>
//           </>
//         )}

//         {step === "emailOtp" && (
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
//               onClick={verifyEmailOtp}
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

// export default function EmailLogin() {
//   const router = useRouter();
//   const [step, setStep] = useState("email");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const inputsRef = useRef([]);

//   useEffect(() => {
//     const flowId = sessionStorage.getItem("auth_flow_id");
    
//     // If no flow ID, redirect to phone login to start the proper flow
//     if (!flowId) {
//       router.push("/login/phone");
//       return;
//     }
    
//     // Clear any previously stored email to ensure user enters their own email
//     // Don't pre-fill email from previous session
//     sessionStorage.removeItem("email");
//     setEmail("");
//   }, []);

//   const sendEmailOtp = async () => {
//     const flowId = sessionStorage.getItem("auth_flow_id");
//     try {
//       setLoading(true);
//       setError(null);
//       await authService.sendEmailOTP(flowId, email);
//       sessionStorage.setItem("email", email);
//       setStep("emailOtp");
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to send OTP.";
//       console.error('Send email OTP error:', err.response?.data);
      
//       // Handle INVALID_STEP_TRANSITION error
//       if (errorMessage === 'INVALID_STEP_TRANSITION' || err.response?.status === 500) {
//         sessionStorage.removeItem("auth_flow_id");
//         sessionStorage.removeItem("email");
//         setError("Session expired. Please start again from phone verification.");
//         setTimeout(() => {
//           router.push("/login/phone");
//         }, 2000);
//         return;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyEmailOtp = async () => {
//     const flowId = sessionStorage.getItem("auth_flow_id");
//     const code = otp.join("");
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await authService.verifyEmailOTP(flowId, code, email);
      
//       if (!response?.data?.user?.email_verified) {
//         setError("Invalid OTP.");
//         return;
//       }
      
//       // Get the next required step from the response
//       const nextStep = response?.data?.next_required_step;
      
//       // Mark email as verified in session
//       sessionStorage.setItem('email_verified', 'true');
      
//       console.log('Email verification response:', { nextStep, response: response?.data });
      
//       // After email verification, check if it's an old user or new user
//       // If nextStep indicates user is already completed (ACTIVE_USER, etc.), call auth/complete first
//       // For old users with completed onboarding, we need the JWT token
//       if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || 
//           nextStep === 'HOME' || nextStep === 'ACTIVE' || 
//           nextStep === 'DONE' || nextStep === 'EXTENDED_PROFILE_COMPLETED') {
//         // Old user with completed onboarding - need JWT token
//         try {
//           const completeResponse = await authService.completeLogin(flowId);
//           const tokens = completeResponse?.data?.data || completeResponse?.data || {};
//           const accessToken = tokens.access_token || tokens.accessToken;
//           const refreshToken = tokens.refresh_token || tokens.refreshToken;
//           if (accessToken) {
//             authService.storeTokens({ accessToken, refreshToken });
//           }
//         } catch (e) {
//           console.error('Error completing login for completed user:', e);
//         }
//         router.push('/onboarding/home');
//         return;
//       }
      
//       // For NAME_CAPTURE or basic steps, redirect to name page
//       // auth/complete will be called there after name is entered
//       if (nextStep === 'NAME_CAPTURE' || nextStep === 'NAME' || 
//           nextStep === 'BASIC_ACCOUNT' || nextStep === 'BASIC_ACCOUNT_CREATED') {
//         router.push('/onboarding/name');
//         return;
//       }
      
//       // For other onboarding steps, we need to get JWT first
//       // This handles old users who have already passed the name step
//       try {
//         const completeResponse = await authService.completeLogin(flowId);
//         const tokens = completeResponse?.data?.data || completeResponse?.data || {};
//         const accessToken = tokens.access_token || tokens.accessToken;
//         const refreshToken = tokens.refresh_token || tokens.refreshToken;
        
//         if (accessToken) {
//           authService.storeTokens({ accessToken, refreshToken });
          
//           // Now get onboarding status with the token
//           const statusResponse = await userService.getOnboardingStatus();
//           const currentStep = statusResponse?.data?.data?.next_required_step;
//           const userState = statusResponse?.data?.data?.user_state;
          
//           console.log('Onboarding status after email verify:', { currentStep, userState });
          
//           const redirectStep = currentStep || userState || nextStep;
          
//           if (redirectStep) {
//             if (redirectStep === 'ACTIVE_USER' || redirectStep === 'COMPLETED' || 
//                 redirectStep === 'HOME' || redirectStep === 'ACTIVE' || 
//                 redirectStep === 'DONE' || redirectStep === 'EXTENDED_PROFILE_COMPLETED') {
//               router.push('/onboarding/home');
//               return;
//             }
            
//             const route = getRouteFromStep(redirectStep);
//             if (route && route !== '/login') {
//               router.push(route);
//               return;
//             }
//           }
//         }
//       } catch (e) {
//         console.error('Error:', e);
//       }
      
//       // Default: go to name page
//       router.push('/onboarding/name');
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.response?.data?.error || "Verification failed.";
//       console.error('Email OTP verification error:', err.response?.data);
      
//       // Handle INVALID_STEP_TRANSITION error - flow may have expired or be invalid
//       if (errorMessage === 'INVALID_STEP_TRANSITION' || err.response?.status === 500) {
//         // Clear invalid flow and redirect to phone login to start fresh
//         sessionStorage.removeItem("auth_flow_id");
//         sessionStorage.removeItem("email");
//         setError("Session expired. Please start again from phone verification.");
//         // Optionally auto-redirect after a short delay
//         setTimeout(() => {
//           router.push("/login/phone");
//         }, 2000);
//         return;
//       }
      
//       setError(errorMessage);
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
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "400px",
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           gap: "28px",
//         }}
//       >
//         {/* Title */}
//         <div style={{ textAlign: "center", marginBottom: "4px" }}>
//           <h1 style={{ fontSize: "32px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>
//             {step === "email" ? (
//               <>
//                 Email{" "}
//                 <span
//                   style={{
//                     background: "linear-gradient(to right, #f472b6, #f97316)",
//                     WebkitBackgroundClip: "text",
//                     WebkitTextFillColor: "transparent",
//                   }}
//                 >
//                   Address
//                 </span>
//               </>
//             ) : (
//               <>
//                 Enter{" "}
//                 <span
//                   style={{
//                     background: "linear-gradient(to right, #f472b6, #f97316)",
//                     WebkitBackgroundClip: "text",
//                     WebkitTextFillColor: "transparent",
//                   }}
//                 >
//                   OTP
//                 </span>
//               </>
//             )}
//           </h1>
//           <p
//             style={{
//               color: "#aaa",
//               fontSize: "15px",
//               marginTop: "12px",
//               fontFamily: "sans-serif",
//               fontWeight: 400,
//             }}
//           >
//             {step === "email"
//               ? "We'll need your email to stay in touch"
//               : `OTP sent to ${email}`}
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div
//             style={{
//               background: "rgba(239,68,68,0.1)",
//               border: "1px solid rgba(239,68,68,0.6)",
//               color: "#f87171",
//               padding: "12px 16px",
//               borderRadius: "12px",
//               fontSize: "14px",
//               fontFamily: "sans-serif",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {/* Email Step */}
//         {step === "email" && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               background: "#1a1a1a",
//               borderRadius: "14px",
//               padding: "0 16px",
//               height: "58px",
//               gap: "12px",
//               backgroundImage:
//                 "linear-gradient(#1a1a1a, #1a1a1a), linear-gradient(to right, #d946ef, #f97316)",
//               backgroundOrigin: "border-box",
//               backgroundClip: "padding-box, border-box",
//               border: "1.5px solid transparent",
//             }}
//           >
//             {/* Email Icon */}
//             <svg
//               width="22"
//               height="22"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="#888"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               style={{ flexShrink: 0 }}
//             >
//               <rect x="2" y="4" width="20" height="16" rx="3" ry="3" />
//               <polyline points="2,4 12,13 22,4" />
//             </svg>

//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Email"
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
//         {step === "emailOtp" && (
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
//           </>
//         )}
//       </div>

//       {/* Continue / Verify Button */}
//       <div style={{ width: "100%", maxWidth: "400px" }}>
//         <button
//           onClick={step === "email" ? sendEmailOtp : verifyEmailOtp}
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
//           {loading
//             ? step === "email"
//               ? "Sending..."
//               : "Verifying..."
//             : "Continue"}
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

export default function EmailLogin() {
  const router = useRouter();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    const flowId = sessionStorage.getItem("auth_flow_id");

    if (!flowId) {
      router.push("/login/phone");
      return;
    }

    sessionStorage.removeItem("email");
    setEmail("");
  }, []);

  useEffect(() => {
    let interval;
    if (step === "emailOtp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendEmailOtp = async () => {
    const flowId = sessionStorage.getItem("auth_flow_id");
    try {
      setLoading(true);
      setError(null);
      await authService.sendEmailOTP(flowId, email);
      sessionStorage.setItem("email", email);
      setStep("emailOtp");
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP.";

      if (errorMessage === "INVALID_STEP_TRANSITION" || err.response?.status === 500) {
        sessionStorage.removeItem("auth_flow_id");
        sessionStorage.removeItem("email");
        setError("Session expired. Please start again from phone verification.");
        setTimeout(() => {
          router.push("/login/phone");
        }, 2000);
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    const flowId = sessionStorage.getItem("auth_flow_id");
    const code = otp.join("");

    try {
      setLoading(true);
      setError(null);
      const response = await authService.verifyEmailOTP(flowId, code, email);

      if (!response?.data?.user?.email_verified) {
        setError("Invalid OTP.");
        return;
      }

      const nextStep = response?.data?.next_required_step;
      sessionStorage.setItem("email_verified", "true");

      if (
        nextStep === "ACTIVE_USER" ||
        nextStep === "COMPLETED" ||
        nextStep === "HOME" ||
        nextStep === "ACTIVE" ||
        nextStep === "DONE" ||
        nextStep === "EXTENDED_PROFILE_COMPLETED"
      ) {
        try {
          const completeResponse = await authService.completeLogin(flowId);
          const tokens =
            completeResponse?.data?.data || completeResponse?.data || {};
          const accessToken = tokens.access_token || tokens.accessToken;
          const refreshToken = tokens.refresh_token || tokens.refreshToken;
          if (accessToken) {
            authService.storeTokens({ accessToken, refreshToken });
          }
        } catch (e) {}

        router.push("/onboarding/home");
        return;
      }

      if (
        nextStep === "NAME_CAPTURE" ||
        nextStep === "NAME" ||
        nextStep === "BASIC_ACCOUNT" ||
        nextStep === "BASIC_ACCOUNT_CREATED"
      ) {
        router.push("/onboarding/name");
        return;
      }

      try {
        const completeResponse = await authService.completeLogin(flowId);
        const tokens =
          completeResponse?.data?.data || completeResponse?.data || {};
        const accessToken = tokens.access_token || tokens.accessToken;
        const refreshToken = tokens.refresh_token || tokens.refreshToken;

        if (accessToken) {
          authService.storeTokens({ accessToken, refreshToken });

          const statusResponse = await userService.getOnboardingStatus();
          const currentStep =
            statusResponse?.data?.data?.next_required_step;
          const userState =
            statusResponse?.data?.data?.user_state;

          const redirectStep = currentStep || userState || nextStep;

          if (redirectStep) {
            if (
              redirectStep === "ACTIVE_USER" ||
              redirectStep === "COMPLETED" ||
              redirectStep === "HOME" ||
              redirectStep === "ACTIVE" ||
              redirectStep === "DONE" ||
              redirectStep === "EXTENDED_PROFILE_COMPLETED"
            ) {
              router.push("/onboarding/home");
              return;
            }

            const route = getRouteFromStep(redirectStep);
            if (route && route !== "/login") {
              router.push(route);
              return;
            }
          }
        }
      } catch (e) {}

      router.push("/onboarding/name");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Verification failed.";

      if (errorMessage === "INVALID_STEP_TRANSITION" || err.response?.status === 500) {
        sessionStorage.removeItem("auth_flow_id");
        sessionStorage.removeItem("email");
        setError("Session expired. Please start again from phone verification.");
        setTimeout(() => {
          router.push("/login/phone");
        }, 2000);
        return;
      }

      setError(errorMessage);
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
    <div className="min-h-screen bg-black text-white flex flex-col justify-between items-center px-6 py-12">
      
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl"
        >
          ←
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col justify-center flex-1 gap-7">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-['Playfair_Display']">
            {step === "email" ? (
              <>
                Email{" "}
                <span className="bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent">
                  Address
                </span>
              </>
            ) : (
              <>
                Enter{" "}
                <span className="bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent">
                  OTP
                </span>
              </>
            )}
          </h1>

          <p className="text-gray-400 mt-3 text-sm font-['Poppins']">
            {step === "email"
              ? "We'll need your email to stay in touch"
              : `OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm font-['Poppins']">
            {error}
          </div>
        )}

        {step === "email" && (
          <div className="flex items-center bg-[#1a1a1a]   border-[#F9731F] hover:border-white rounded-xl px-4 h-14 border border-transparent bg-clip-padding relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              className="w-full bg-transparent outline-none text-white font-['Poppins']"
            />
          </div>
        )}

        {step === "emailOtp" && (
          <>
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, i)
                  }
                  className={`w-12 h-14 text-center rounded-xl bg-[#1a1a1a] text-white text-lg font-['Poppins'] outline-none ${
                    digit ? "border border-pink-500" : "border border-gray-700"
                  }`}
                />
              ))}
            </div>

            {!canResend ? (
              <p className="text-center text-gray-400 text-sm font-['Poppins']">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button
                onClick={sendEmailOtp}
                className="text-center text-sm text-pink-400 font-['Poppins']"
              >
                Resend OTP
              </button>
            )}
          </>
        )}
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={step === "email" ? sendEmailOtp : verifyEmailOtp}
          disabled={loading}
          className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-base font-semibold font-['Poppins'] disabled:opacity-80"
        >
          {loading
            ? step === "email"
              ? "Sending..."
              : "Verifying..."
            : "Continue"}
        </button>
      </div>
    </div>
  );
}