// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, AlertCircle, Shield } from 'lucide-react';
// import { userService } from '@/services/user';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { getRouteFromStep } from '@/lib/api/navigation';

// export default function OnboardingParentConsentPage() {
//   const router = useRouter();
//   const [checked, setChecked] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const clearError = () => setError(null);

//   // Check onboarding status on mount
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       try {
//         const response = await userService.getOnboardingStatus();
//         const state = response?.data?.data?.onboarding_state;
//         const nextStep = response?.data?.next_required_step;

//         console.log('Parent consent - Current state:', state, 'Next step:', nextStep);

//         // If already approved, redirect to location
//         if (state === 'PARENT_CONSENT_APPROVED') {
//           router.push('/onboarding/location');
//           return;
//         }

//         // If location already captured, go to profile photo
//         if (state === 'LOCATION_CAPTURED' || state === 'PROFILE_PHOTO_CAPTURED') {
//           router.push('/onboarding/photo');
//           return;
//         }

//         // If not in pending state, redirect based on next step
//         if (state !== 'PARENT_CONSENT_PENDING') {
//           // Handle DOB_CAPTURED state - user was redirected from DOB page because they are a minor
//           // Stay on this page to let them complete parent consent
//           if (state === 'DOB_CAPTURED') {
//             console.log('State is DOB_CAPTURED - staying on parent consent page');
//             setInitialLoading(false);
//             return;
//           }

//           // Try to get next step from response - check both locations and validate it's a string
//           const nextRequiredStep = (nextStep && typeof nextStep === 'string')
//             ? nextStep
//             : (response?.data?.data?.next_required_step);

//           if (nextRequiredStep && typeof nextRequiredStep === 'string') {
//             const route = getRouteFromStep(nextRequiredStep);
//             router.push(route);
//           } else {
//             // Default based on state
//             router.push('/onboarding/gender');
//           }
//           return;
//         }
//       } catch (err) {
//         console.error('Failed to check onboarding status:', err);
//         // Continue anyway - let user try to give consent
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     checkOnboardingStatus();
//   }, [router]);

//   const handleConsent = async () => {
//     if (!checked) return;

//     try {
//       setLoading(true);
//       clearError();

//       // Save parent consent to backend
//       const response = await userService.giveParentConsent();
//       console.log('Parent consent response:', response.data);

//       // Navigate based on next_required_step from API - validate it's a string
//       const nextStep = response?.data?.next_required_step;
//       if (nextStep && typeof nextStep === 'string') {
//         const route = getRouteFromStep(nextStep);
//         router.push(route);
//       } else {
//         // Default to location after consent
//         router.push('/onboarding/location');
//       }
//     } catch (err) {
//       console.error('Error saving parent consent:', err);
//       console.error('Error response:', err.response?.data);

//       const errorCode = err.response?.data?.error_code;
//       const status = err.response?.status;
//       const errorMsg = err.response?.data?.message;

//       // Handle authentication errors
//       if (status === 401) {
//         window.location.href = '/login';
//         return;
//       }

//       // Handle state mismatch errors - get next step from error response
//       if (status === 400) {
//         const nextStep = err.response?.data?.next_required_step;
//         if (nextStep && typeof nextStep === 'string') {
//           const route = getRouteFromStep(nextStep);
//           router.push(route);
//           return;
//         }

//         // Check for INVALID_ONBOARDING_STATE error
//         // The backend may not have updated the state correctly after saving DOB
//         // Since the user has already checked the consent box and submitted,
//         // we can proceed to location page anyway
//         if (errorCode === 'INVALID_ONBOARDING_STATE') {
//           console.log('Invalid state transition - proceeding to location anyway');
//           // Use window.location to ensure redirect works
//           window.location.href = `${window.location.origin}/onboarding/location`;
//           return;
//         }

//         // If error message mentions state, try to refresh status
//         if (errorMsg?.includes('state')) {
//           try {
//             const statusResponse = await userService.getOnboardingStatus();
//             const currentState = statusResponse?.data?.data?.onboarding_state;
//             const nextRequiredStep = statusResponse?.data?.next_required_step;

//             console.log('Current state:', currentState, 'Next step:', nextRequiredStep);

//             // If already approved, go to location
//             if (currentState === 'PARENT_CONSENT_APPROVED') {
//               router.push('/onboarding/location');
//               return;
//             }

//             // Navigate to the next required step - validate it's a string
//             if (nextRequiredStep && typeof nextRequiredStep === 'string') {
//               const route = getRouteFromStep(nextRequiredStep);
//               router.push(route);
//               return;
//             }

//             // Default fallback based on current state
//             if (currentState === 'LOCATION_CAPTURED') {
//               router.push('/onboarding/photo');
//               return;
//             }
//           } catch (statusErr) {
//             console.error('Error fetching status:', statusErr);
//           }
//         }

//         setError(errorMsg || 'Invalid state. Please try again or go back to previous step.');
//         return;
//       }

//       // Handle specific error messages from backend
//       if (errorMsg) {
//         setError(errorMsg);
//         return;
//       }

//       const message = getErrorMessage(errorCode) || 'Failed to save parent consent. Please try again.';
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading while checking status
//   if (initialLoading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//         <div className="w-full max-w-sm">
//           <div className="flex items-center justify-center">
//             <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className=" h-screen  w-full bg-black text-white flex flex-col items-center justify-center text-center px-4">
//       <button
//         onClick={() => router.push('/onboarding/dob')}
//         className=" mb-10 mr-80 rounded-full hover:bg-white/10 transition-colors"
//       >
//         <ArrowLeft className="w-5 h-5" />
//       </button>
//       <div className='flex flex-col max-w-md space-y-10 justify-center items-center  '>
//         {/* Header */}





//         {/* Content */}
//         <div className="space-y-6">

//           <h1 className="text-3xl font-Playfair Display font-bold">
//             Parent
//             <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
//               Consent
//             </span>
//           </h1>
//           <p className="mt-4 text-gray-400 text-sm leading-relaxed font-Poppins">
//             To continue using Playmate, we need permission from a parent or
//             guardian. This helps us keep the experience safe and age-appropriate.
//           </p>
//           <p className="mt-4 text-gray-500 text-xs font-Poppins">
//             Your information is secure and never shared.
//           </p>
//         </div>

//         {error && (
//           <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
//             <AlertCircle className="w-4 h-4" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* CHECKBOX */}
//         <label className="flex items-start gap-3 text-left text-sm cursor-pointer font-Poppins mt-8">
//           <input
//             type="checkbox"
//             checked={checked}
//             onChange={(e) => setChecked(e.target.checked)}
//             className="mt-1 accent-pink-500 w-5 h-5"
//           />
//           <span>
//             I am parent or legal guardian and I give consent
//           </span>
//         </label>


//         {/* FOOTER */}
//         <div className=" px-6 font-Poppins">
//           <button
//             disabled={!checked || loading}
//             onClick={handleConsent}
//             className="w-96 py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40 flex items-center justify-center"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                 Saving...
//               </>
//             ) : (
//               'Give Consent'
//             )}
//           </button>

//           <p className="mt-4 text-center text-xs text-gray-500">
//             By continuing, you agree to Playmate's Terms & Privacy Policy.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { userService } from "@/services/user";
import { authService } from "@/services/auth";
import { getErrorMessage } from "@/lib/api/errorMap";
import { getRouteFromStep } from "@/lib/api/navigation";

export default function OnboardingParentConsentPage() {
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [screenConfig, setScreenConfig] = useState(null);

  const clearError = () => setError(null);

  // Load screen configuration
  useEffect(() => {
    const fetchScreenConfig = async () => {
      try {
        const response = await authService.getOnboardingScreen("parent_consent");
        const screen = response?.data?.data?.screen;

        if (screen) {
          setScreenConfig(screen);
        }
      } catch (err) {
        console.error("Failed to load parent consent screen config:", err);
      }
    };

    fetchScreenConfig();
  }, []);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
        const nextStep = response?.data?.next_required_step;

        console.log("Parent consent - Current state:", state, "Next step:", nextStep);

        if (state === "PARENT_CONSENT_APPROVED") {
          router.push("/onboarding/location");
          return;
        }

        if (state === "LOCATION_CAPTURED" || state === "PROFILE_PHOTO_CAPTURED") {
          router.push("/onboarding/photo");
          return;
        }

        if (state !== "PARENT_CONSENT_PENDING") {
          if (state === "DOB_CAPTURED") {
            console.log("State is DOB_CAPTURED - staying on parent consent page");
            setInitialLoading(false);
            return;
          }

          const nextRequiredStep =
            nextStep && typeof nextStep === "string"
              ? nextStep
              : response?.data?.data?.next_required_step;

          if (nextRequiredStep && typeof nextRequiredStep === "string") {
            const route = getRouteFromStep(nextRequiredStep);
            router.push(route);
          } else {
            router.push("/onboarding/gender");
          }

          return;
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleConsent = async () => {
    if (!checked) return;

    try {
      setLoading(true);
      clearError();

      const response = await userService.giveParentConsent();

      console.log("Parent consent response:", response.data);

      const nextStep = response?.data?.next_required_step;

      if (nextStep && typeof nextStep === "string") {
        const route = getRouteFromStep(nextStep);
        router.push(route);
      } else {
        router.push("/onboarding/location");
      }
    } catch (err) {
      console.error("Error saving parent consent:", err);
      console.error("Error response:", err.response?.data);

      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;

      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;

        if (nextStep && typeof nextStep === "string") {
          const route = getRouteFromStep(nextStep);
          router.push(route);
          return;
        }

        if (errorCode === "INVALID_ONBOARDING_STATE") {
          window.location.href = `${window.location.origin}/onboarding/location`;
          return;
        }

        if (errorMsg?.includes("state")) {
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentState = statusResponse?.data?.data?.onboarding_state;
            const nextRequiredStep = statusResponse?.data?.next_required_step;

            if (currentState === "PARENT_CONSENT_APPROVED") {
              router.push("/onboarding/location");
              return;
            }

            if (nextRequiredStep && typeof nextRequiredStep === "string") {
              const route = getRouteFromStep(nextRequiredStep);
              router.push(route);
              return;
            }

            if (currentState === "LOCATION_CAPTURED") {
              router.push("/onboarding/photo");
              return;
            }
          } catch (statusErr) {
            console.error("Error fetching status:", statusErr);
          }
        }

        setError(errorMsg || "Invalid state. Please try again or go back to previous step.");
        return;
      }

      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      const message =
        getErrorMessage(errorCode) ||
        "Failed to save parent consent. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || !screenConfig) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center text-center px-4">
      <button
        onClick={() => router.push("/onboarding/dob")}
        className="mb-10 mr-80 rounded-full hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col max-w-md space-y-10 justify-center items-center">

        <div className="space-y-6">
          <h1 className="text-3xl font-Playfair Display font-bold">
            {screenConfig?.title?.split(" ")[0]}
            <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
              {screenConfig?.title?.split(" ").slice(1).join(" ")}
            </span>
          </h1>

          {screenConfig?.description && (
            <p className="mt-4 text-gray-400 text-sm leading-relaxed font-Poppins">
              {screenConfig.description}
            </p>
          )}

          <p className="mt-4 text-gray-500 text-xs font-Poppins">
            Your information is secure and never shared.
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <label className="flex items-start gap-3 text-left text-sm cursor-pointer font-Poppins mt-8">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 accent-pink-500 w-5 h-5"
          />

          <span>
            {screenConfig?.option_labels?.consent_checkbox}
          </span>
        </label>

        <div className="px-6 font-Poppins">
          <button
            disabled={!checked || loading}
            onClick={handleConsent}
            className="w-96 py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              screenConfig?.button_text?.primary
            )}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            By continuing, you agree to Playmate's Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}