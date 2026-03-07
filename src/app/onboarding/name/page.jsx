// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { User, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
// import { userService } from '@/services/user';
// import { authService } from '@/services/auth';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { getRouteFromStep } from '@/lib/api/navigation';

// export default function OnboardingNamePage() {
//   const router = useRouter();
//   const [name, setName] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Check onboarding status on page load
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('playymate_access_token');
//       const authFlowId = sessionStorage.getItem('auth_flow_id');
//       const phoneVerified = sessionStorage.getItem('phone_verified');
//       const emailVerified = sessionStorage.getItem('email_verified');
      
//       // Check if verification prerequisites are met
//       if (!phoneVerified || !emailVerified) {
//         console.log('Verification prerequisites not met:', { phoneVerified, emailVerified, authFlowId });
//         // Clear invalid session and redirect to phone login
//         sessionStorage.removeItem('auth_flow_id');
//         sessionStorage.removeItem('phone');
//         sessionStorage.removeItem('email');
//         sessionStorage.removeItem('phone_verified');
//         sessionStorage.removeItem('email_verified');
//         router.push('/login/phone');
//         return;
//       }
      
//       if (accessToken) {
//         // User has a token, check their onboarding status
//         try {
//           const statusResponse = await userService.getOnboardingStatus();
//           const nextStep = statusResponse?.data?.data?.next_required_step;
//           const onboardingState = statusResponse?.data?.data?.onboarding_state;
          
//           console.log('Onboarding status:', { nextStep, onboardingState });
          
//           if (nextStep && nextStep !== 'NAME') {
//             // User has already completed name, redirect to current step
//             const route = getRouteFromStep(nextStep);
//             if (route) {
//               router.push(route);
//               return;
//             }
//           }
//         } catch (err) {
//           console.error('Error checking onboarding status:', err);
//         }
//       }
//       setLoading(false);
//     };
    
//     checkOnboardingStatus();
//   }, [router]);

//   const clearError = () => setError(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Prevent duplicate submissions
//     if (isSubmitting) {
//       return;
//     }
    
//     if (!name.trim()) {
//       setError('Please enter your name');
//       return;
//     }
    
//     if (name.trim().length < 2) {
//       setError('Name must be at least 2 characters');
//       return;
//     }

//     try {
//       setLoading(true);
//       setIsSubmitting(true);
//       clearError();

//       const authFlowId = sessionStorage.getItem('auth_flow_id');
      
//       if (!authFlowId) {
//         setError('Authentication session expired. Please login again.');
//         setLoading(false);
//         return;
//       }

//       // Check if phone and email are verified before proceeding
//       // This ensures the flow has completed all verification prerequisites
//       const phoneVerified = sessionStorage.getItem('phone_verified');
//       const emailVerified = sessionStorage.getItem('email_verified');
      
//       // If we don't have verification flags, we need to ensure the flow is valid
//       // The backend will validate this, but we can check early
//       if (!phoneVerified || !emailVerified) {
//         console.log('Verification status:', { phoneVerified, emailVerified, authFlowId });
//       }

//       const response = await authService.updateName(authFlowId, name.trim());
//       console.log('Name update response:', response);
      
//       // Check if the backend returned an error indicating incomplete verification
//       const responseData = response?.data;
//       if (responseData?.error_code === 'VERIFICATION_INCOMPLETE' || 
//           responseData?.message?.includes('Verification incomplete')) {
//         // Clear session and redirect to phone login
//         sessionStorage.removeItem('auth_flow_id');
//         sessionStorage.removeItem('phone');
//         sessionStorage.removeItem('email');
//         sessionStorage.removeItem('phone_verified');
//         sessionStorage.removeItem('email_verified');
//         setError('Verification incomplete. Please start from phone login.');
//         setTimeout(() => {
//           router.push('/login/phone');
//         }, 2000);
//         return;
//       }
      
//       // Mark name as captured in session
//       sessionStorage.setItem('name_captured', 'true');
      
//       // Complete login to get tokens
//       const completeResponse = await authService.completeLogin(authFlowId);
//       console.log('Complete login response:', completeResponse);
//       console.log('Complete login response.data:', completeResponse?.data);
//       console.log('Complete login response.data.data:', completeResponse?.data?.data);
      
//       // Try different possible locations for tokens
//       const tokens = completeResponse?.data?.data || completeResponse?.data || {};
//       const accessToken = tokens.access_token || tokens.accessToken;
//       const refreshToken = tokens.refresh_token || tokens.refreshToken;
      
//       console.log('Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
//       // Store tokens
//       if (accessToken) {
//         authService.storeTokens({ accessToken, refreshToken });
//         console.log('Tokens stored successfully');
//       } else {
//         console.error('No access token received from /auth/complete');
//       }
      
//       // Navigate based on next_required_step
//       const nextStep = response?.data?.next_required_step;
//       // Check if nextStep is valid (not empty object, not empty string)
//       const hasValidNextStep = nextStep && typeof nextStep === 'string' && nextStep.trim() !== '';
      
//       if (hasValidNextStep) {
//         const route = getRouteFromStep(nextStep);
//         if (route) {
//           router.push(route);
//         } else {
//           // Default to gender page if route is not found
//           router.push('/onboarding/gender');
//         }
//       } else {
//         // Default to gender page for new users (after name, next mandatory step is gender)
//         router.push('/onboarding/gender');
//       }
//     } catch (err) {
//       console.error('Name update error:', err);
//       console.error('Error response:', err.response?.data);
      
//       // Handle verification incomplete error from backend
//       const errorCode = err.response?.data?.error_code;
//       const apiMessage = err.response?.data?.message;
      
//       if (errorCode === 'VERIFICATION_INCOMPLETE' || 
//           apiMessage?.includes('Verification incomplete') ||
//           apiMessage?.includes('INVALID_STEP_TRANSITION')) {
//         // Clear session and redirect to phone login
//         sessionStorage.removeItem('auth_flow_id');
//         sessionStorage.removeItem('phone');
//         sessionStorage.removeItem('email');
//         sessionStorage.removeItem('phone_verified');
//         sessionStorage.removeItem('email_verified');
//         setError('Verification incomplete. Please start from phone login.');
//         setTimeout(() => {
//           router.push('/login/phone');
//         }, 2000);
//         return;
//       }
      
//       const message = getErrorMessage(errorCode) || apiMessage || 'Failed to save name. Please try again.';
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleSkip = () => {
//   //   // Skip to next step
//   //   router.push('/onboarding/gender');
//   // };

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-8">
//           <button
//             onClick={() => router.push('/login/email')}
//             className="p-2 rounded-full hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[10%]" />
//           </div>
//         </div>

//         {/* Content */}
//         <div className="space-y-6">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
//               <User className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-Playfair Display font-bold">
//              What’s Your
//               <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
//                 Name?
//               </span>
//               ?
//             </h1>
//             <p className="mt-2 text-gray-400 text-sm">
//               This will be displayed on your profile
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
//                 <AlertCircle className="w-4 h-4" />
//                 <span>{error}</span>
//               </div>
//             )}

//             <div className="relative">
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => {
//                   setName(e.target.value);
//                   clearError();
//                 }}
//                 placeholder="Enter your name"
//                 className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 
//                          text-lg placeholder:text-gray-500 focus:border-pink-500 
//                          focus:outline-none transition-colors text-center"
//                 autoFocus
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading || isSubmitting || !name.trim()}
//               className="w-full py-4 rounded-full font-Poppins font-semibold
//                        bg-gradient-to-r from-pink-500 to-orange-400 
//                        disabled:opacity-50 disabled:cursor-not-allowed
//                        flex items-center justify-center gap-2"
//             >
//               {loading || isSubmitting ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 'Continue'
//               )}
//             </button>
//           </form>

//           {/* <button
//             type="button"
//             onClick={handleSkip}
//             className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
//           >
//             Skip for now
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { userService } from "@/services/user";
import { authService } from "@/services/auth";
import { getErrorMessage } from "@/lib/api/errorMap";
import { getRouteFromStep } from "@/lib/api/navigation";

export default function OnboardingNamePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [screens, setScreens] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(true);

  /*
  =============================
  Fetch Login Screen Config
  =============================
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

  const nameScreen = screens["name_capture"];

  /*
  =============================
  Check onboarding status
  =============================
  */

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const accessToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("playymate_access_token");

      const authFlowId = sessionStorage.getItem("auth_flow_id");
      const phoneVerified = sessionStorage.getItem("phone_verified");
      const emailVerified = sessionStorage.getItem("email_verified");

      if (!phoneVerified || !emailVerified) {
        console.log("Verification prerequisites not met:", {
          phoneVerified,
          emailVerified,
          authFlowId,
        });

        sessionStorage.removeItem("auth_flow_id");
        sessionStorage.removeItem("phone");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("phone_verified");
        sessionStorage.removeItem("email_verified");

        router.push("/login/phone");
        return;
      }

      // ✅ Use stored next step — no API call needed
      if (accessToken) {
        const storedNextStep = sessionStorage.getItem("onboarding_next_step");
        
        // Also try to get from API if stored step is not available
        if (!storedNextStep) {
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const nextStep = statusResponse?.data?.data?.next_required_step;
            // Store it for future use
            sessionStorage.setItem("onboarding_next_step", nextStep || "");
          } catch (err) {
            console.error("Error checking onboarding status:", err);
          }
        }

        const nextStep = storedNextStep || sessionStorage.getItem("onboarding_next_step");

        console.log("Onboarding next step:", nextStep);

        if (nextStep && nextStep !== "NAME" && nextStep !== "NAME_CAPTURE") {
          const route = getRouteFromStep(nextStep);

          if (route) {
            router.push(route);
            return;
          }
        }
      }

      setLoading(false);
    };

    checkOnboardingStatus();
  }, [router]);

  const clearError = () => setError(null);

  /*
  =============================
  Submit Name
  =============================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    try {
      setLoading(true);
      setIsSubmitting(true);
      clearError();

      const authFlowId = sessionStorage.getItem("auth_flow_id");

      if (!authFlowId) {
        setError("Authentication session expired. Please login again.");
        setLoading(false);
        return;
      }

      const phoneVerified = sessionStorage.getItem("phone_verified");
      const emailVerified = sessionStorage.getItem("email_verified");

      if (!phoneVerified || !emailVerified) {
        console.log("Verification status:", {
          phoneVerified,
          emailVerified,
          authFlowId,
        });
      }

      const response = await authService.updateName(
        authFlowId,
        name.trim()
      );

      console.log("Name update response:", response);

      const responseData = response?.data;

      if (
        responseData?.error_code === "VERIFICATION_INCOMPLETE" ||
        responseData?.message?.includes("Verification incomplete")
      ) {
        sessionStorage.removeItem("auth_flow_id");
        sessionStorage.removeItem("phone");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("phone_verified");
        sessionStorage.removeItem("email_verified");

        setError(
          "Verification incomplete. Please start from phone login."
        );

        setTimeout(() => {
          router.push("/login/phone");
        }, 2000);

        return;
      }

      sessionStorage.setItem("name_captured", "true");

      const completeResponse = await authService.completeLogin(authFlowId);

      console.log("Complete login response:", completeResponse);

      const tokens =
        completeResponse?.data?.data || completeResponse?.data || {};

      const accessToken =
        tokens.access_token || tokens.accessToken;

      const refreshToken =
        tokens.refresh_token || tokens.refreshToken;

      console.log("Extracted tokens:", {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
      });

      if (accessToken) {
        authService.storeTokens({ accessToken, refreshToken });
        console.log("Tokens stored successfully");
      } else {
        console.error("No access token received from /auth/complete");
      }

      const nextStep = response?.data?.next_required_step;

      // ✅ Store the next step so subsequent pages don't need to call API
      sessionStorage.setItem("onboarding_next_step", nextStep || "");

      const hasValidNextStep =
        nextStep && typeof nextStep === "string" && nextStep.trim() !== "";

      if (hasValidNextStep) {
        const route = getRouteFromStep(nextStep);

        if (route) {
          router.push(route);
        } else {
          router.push("/onboarding/gender");
        }
      } else {
        router.push("/onboarding/gender");
      }
    } catch (err) {
      console.error("Name update error:", err);
      console.error("Error response:", err.response?.data);

      const errorCode = err.response?.data?.error_code;
      const apiMessage = err.response?.data?.message;

      if (
        errorCode === "VERIFICATION_INCOMPLETE" ||
        apiMessage?.includes("Verification incomplete") ||
        apiMessage?.includes("INVALID_STEP_TRANSITION")
      ) {
        sessionStorage.removeItem("auth_flow_id");
        sessionStorage.removeItem("phone");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("phone_verified");
        sessionStorage.removeItem("email_verified");

        setError(
          "Verification incomplete. Please start from phone login."
        );

        setTimeout(() => {
          router.push("/login/phone");
        }, 2000);

        return;
      }

      const message =
        getErrorMessage(errorCode) ||
        apiMessage ||
        "Failed to save name. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingConfig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/login/email")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[10%]" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">

          <div className="text-center">

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
              <User className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold">
              {nameScreen?.title
                ?.split(" ")
                .map((word, index) =>
                  index === 2 ? (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
                    >
                      {" " + word}
                    </span>
                  ) : (
                    " " + word
                  )
                )}
            </h1>

            <p className="mt-2 text-gray-400 text-sm">
              {nameScreen?.subtitle}
            </p>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                placeholder={
                  nameScreen?.input_placeholders?.full_name
                }
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-lg placeholder:text-gray-500 focus:border-pink-500 focus:outline-none transition-colors text-center"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting || !name.trim()}
              className="w-full py-4 rounded-full font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                nameScreen?.cta_text?.primary
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}