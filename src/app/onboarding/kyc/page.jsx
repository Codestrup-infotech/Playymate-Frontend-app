

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Loader2,
//   Shield,
//   Smartphone,
//   Fingerprint,
//   Building2,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   ArrowRight,
//   X,
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { kycService } from "@/services/kyc";
// import { userService } from "@/services/user";
// import { getRouteFromStep } from "@/lib/api/navigation";

// const STEPS = {
//   INTRO: "intro",
//   POLLING: "polling",
//   SUCCESS: "success",
//   ERROR: "error",
// };

// export default function KYCPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const verificationIdFromUrl = searchParams.get("verification_id");
//   const statusFromUrl = searchParams.get("status");

//   const [step, setStep] = useState(STEPS.INTRO);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [verificationId, setVerificationId] = useState("");
//   const [aadhaarData, setAadhaarData] = useState(null);
//   // Track which KYC screens are enabled
//   const [screensEnabled, setScreensEnabled] = useState({
//     aadhaar: true,
//     liveness: true,
//   });

//   const pollingRef = useRef(null);
//   const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

//   /* ================= CHECK STATUS ================= */

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await userService.getOnboardingStatus();
//         const state = res?.data?.data?.onboarding_state;
//         const nextStep = res?.data?.next_required_step;

//         const completedStates = [
//           "KYC_COMPLETED",
//           "PHYSICAL_PROFILE_CONSENT",
//           "PHYSICAL_PROFILE_COMPLETED",
//           "QUESTIONNAIRE_COMPLETE",
//           "COMPLETED",
//           "ACTIVE",
//         ];

//         if (completedStates.includes(state)) {
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             if (route) {
//               router.push(route);
//               return;
//             }
//           }
//           router.push("/onboarding/physical");
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     checkStatus();
//   }, [router]);

//   /* ================= FETCH SCREEN VISIBILITY ================= */

//   useEffect(() => {
//     const fetchScreenVisibility = async () => {
//       try {
//         const res = await kycService.getKycScreens();
//         const { screens } = res.data?.data || {};
//         if (screens) {
//           setScreensEnabled({
//             aadhaar: screens.aadhaar?.enabled ?? true,
//             liveness: screens.liveness?.enabled ?? true,
//           });
//         }
//       } catch (err) {
//         console.error('Failed to fetch KYC screen visibility:', err);
//         // Default to both enabled
//       }
//     };

//     fetchScreenVisibility();
//   }, []);

//   /* ================= HANDLE DIGILOCKER REDIRECT ================= */

//   useEffect(() => {
//     if (verificationIdFromUrl && statusFromUrl) {
//       handleRedirect(verificationIdFromUrl, statusFromUrl);
//     }
//   }, [verificationIdFromUrl, statusFromUrl]);

//   const handleRedirect = async (vid, status) => {
//     setVerificationId(vid);

//     if (status === "verified" || status === "AUTHENTICATED") {
//       await fetchDocument(vid);
//     } else if (status === "pending") {
//       startPolling(vid);
//     } else {
//       setError("Verification failed.");
//       setStep(STEPS.ERROR);
//     }
//   };

//   /* ================= START DIGILOCKER ================= */

//   const handleStart = async () => {
//     try {
//       setLoading(true);

//       const vid = uuidv4();
//       setVerificationId(vid);

//       if (DEV_MODE) {
//         startPolling(vid);
//         return;
//       }

//       const redirectUrl =
//         process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI ||
//         "playymate://kyc-callback";

//       const res = await kycService.digilockerCreateUrl(
//         vid,
//         ["AADHAAR"],
//         redirectUrl,
//         "verification"
//       );

//       const consentUrl = res.data?.data?.consent_url;
//       window.location.href = consentUrl;
//     } catch (err) {
//       setError("Failed to start verification.");
//       setStep(STEPS.ERROR);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= POLLING ================= */

//   const startPolling = (vid) => {
//     setStep(STEPS.POLLING);

//     let attempts = 0;

//     pollingRef.current = setInterval(async () => {
//       attempts++;
//       if (attempts > 40) {
//         clearInterval(pollingRef.current);
//         setError("Timeout.");
//         setStep(STEPS.ERROR);
//         return;
//       }

//       try {
//         const res = await kycService.digilockerStatus(vid);
//         const status = res.data?.data?.status;

//         if (status === "AUTHENTICATED" || status === "verified") {
//           clearInterval(pollingRef.current);
//           await fetchDocument(vid);
//         }
//       } catch {}
//     }, 3000);
//   };

//   const fetchDocument = async (vid) => {
//     try {
//       if (DEV_MODE) {
//         setAadhaarData({
//           name: "Demo User",
//           aadhaar_number: "XXXXXX1234",
//         });
//       } else {
//         const res = await kycService.digilockerDocument("AADHAAR", vid);
//         setAadhaarData(res.data?.data);
//       }
      
//       // Check if liveness is enabled
//       if (screensEnabled.liveness) {
//         // Go to liveness verification
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         // Liveness disabled - complete KYC directly
//         try {
//           if (!DEV_MODE) {
//             await kycService.completeKYC();
//           }
//           router.push("/onboarding/physical");
//         } catch (err) {
//           console.error('Error completing KYC:', err);
//           router.push("/onboarding/physical");
//         }
//       }
//     } catch {
//       // Even on error, check liveness status before navigating
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         router.push("/onboarding/physical");
//       }
//     }
//   };

//   /* ================= SKIP ================= */

//   const handleSkip = async () => {
//     try {
//       if (!DEV_MODE) {
//         await kycService.skipAadhaar();
//       }

//       // Check if liveness is enabled
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         // Liveness disabled - complete KYC directly
//         try {
//           if (!DEV_MODE) {
//             await kycService.completeKYC();
//           }
//           router.push("/onboarding/physical");
//         } catch (err) {
//           console.error('Error completing KYC:', err);
//           router.push("/onboarding/physical");
//         }
//       }
//     } catch {
//       // On error, check liveness status before navigating
//       if (screensEnabled.liveness) {
//         router.push("/onboarding/kyc/liveness");
//       } else {
//         router.push("/onboarding/physical");
//       }
//     }
//   };

//   /* ================= SUCCESS CONTINUE ================= */

//   const proceedToLiveness = () => {
//     // Check if liveness is enabled
//     if (screensEnabled.liveness) {
//       router.push("/onboarding/kyc/liveness");
//     } else {
//       // Liveness disabled - complete KYC directly
//       router.push("/onboarding/physical");
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

//         {step === STEPS.INTRO && (
//           <>
//             <div className="text-center mb-6">
//               <Shield className="w-12 h-12 text-pink-500 mx-auto mb-3" />
//               <h2 className="text-xl text-white font-bold">
//                 Verify Your Identity
//               </h2>
//             </div>

//             {/* Aadhaar button - only show if aadhaar is enabled */}
//             {screensEnabled.aadhaar && (
//               <>
//                 <button
//                   onClick={handleStart}
//                   className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold mb-3"
//                 >
//                   {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue with DigiLocker"}
//                 </button>

//                 <button
//                   onClick={handleSkip}
//                   className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl"
//                 >
//                   Skip for Now
//                 </button>
//               </>
//             )}

//             {/* If aadhaar is disabled, directly go to liveness */}
//             {!screensEnabled.aadhaar && screensEnabled.liveness && (
//               <button
//                 onClick={() => router.push("/onboarding/kyc/liveness")}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue to Face Verification
//               </button>
//             )}

//             {/* If both are disabled (shouldn't happen based on photo page logic), complete KYC */}
//             {!screensEnabled.aadhaar && !screensEnabled.liveness && (
//               <button
//                 onClick={async () => {
//                   try {
//                     if (!DEV_MODE) {
//                       await kycService.completeKYC();
//                     }
//                     router.push("/onboarding/physical");
//                   } catch (err) {
//                     console.error('Error completing KYC:', err);
//                     router.push("/onboarding/physical");
//                   }
//                 }}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue
//               </button>
//             )}
//           </>
//         )}

//         {step === STEPS.POLLING && (
//           <div className="text-center text-white">
//             <Loader2 className="animate-spin mx-auto mb-3" />
//             Verifying Aadhaar...
//           </div>
//         )}

//         {step === STEPS.SUCCESS && (
//           <>
//             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
//             <p className="text-white text-center mb-4">
//               Aadhaar Verified Successfully
//             </p>
//             {screensEnabled.liveness ? (
//               <button
//                 onClick={proceedToLiveness}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue to Face Verification
//               </button>
//             ) : (
//               <button
//                 onClick={() => router.push("/onboarding/physical")}
//                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
//               >
//                 Continue
//               </button>
//             )}
//           </>
//         )}

//         {step === STEPS.ERROR && (
//           <>
//             <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
//             <p className="text-red-400 text-center mb-4">{error}</p>
//             <button
//               onClick={() => setStep(STEPS.INTRO)}
//               className="w-full py-3 bg-gray-700 rounded-xl text-white"
//             >
//               Try Again
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


// "use client";

// import React, { useEffect, useRef, useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Loader2, Shield, X } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { kycService } from "@/services/kyc";
// import { getRouteFromStep } from "@/lib/api/navigation";

// import { userService } from "@/services/user";



// const STEPS = {
//   INTRO: "intro",
//   POLLING: "polling",
//   ERROR: "error",
// };

// function KYCPageContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const verificationIdFromUrl = searchParams.get("verification_id");
//   const statusFromUrl = searchParams.get("status");

//   const pollingRef = useRef(null);

//   const [step, setStep] = useState(STEPS.INTRO);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [verificationId, setVerificationId] = useState("");

//   const [screenConfig, setScreenConfig] = useState(null);

//   const [screensEnabled, setScreensEnabled] = useState({
//     aadhaar: true,
//     liveness: true,
//   });

//    /* ================= CHECK STATUS ================= */
 
//    useEffect(() => {
//      const checkStatus = async () => {
//        try {
//          const res = await userService.getOnboardingStatus();
//          const state = res?.data?.data?.onboarding_state;
//          const nextStep = res?.data?.next_required_step;
 
//          const completedStates = [
//            "KYC_COMPLETED",
//            "PHYSICAL_PROFILE_CONSENT",
//            "PHYSICAL_PROFILE_COMPLETED",
//            "QUESTIONNAIRE_COMPLETE",
//            "COMPLETED",
//            "ACTIVE",
//          ];
 
//          if (completedStates.includes(state)) {
//            if (nextStep) {
//              const route = getRouteFromStep(nextStep);
//              if (route) {
//                router.push(route);
//                return;
//              }
//            }
//            router.push("/onboarding/physical");
//          }
//        } catch (err) {
//          console.error(err);
//        }
//      };
 
//      checkStatus();
//    }, [router]);
 

//   /* ========================================================
//      FETCH SCREEN CONFIG
//   ======================================================== */

//   useEffect(() => {
//     const fetchScreens = async () => {
//       try {
//         const res = await kycService.getScreenConfigs();

//         const screens = res?.data?.data?.screens || [];

//         const kycScreen = screens.find(
//           (s) => s.screen_key === "kyc_start"
//         );

//         setScreenConfig(kycScreen);
//       } catch (err) {
//         console.error("Screen config error:", err);
//       }
//     };

//     fetchScreens();
//   }, []);

//   /* ========================================================
//      FETCH KYC SCREEN VISIBILITY
//   ======================================================== */

//   useEffect(() => {
//     const fetchScreenVisibility = async () => {
//       try {
//         const res = await kycService.getKycScreens();

//         const { screens } = res?.data?.data || {};

//         if (screens) {
//           setScreensEnabled({
//             aadhaar: screens.aadhaar?.enabled ?? true,
//             liveness: screens.liveness?.enabled ?? true,
//           });
//         }
//       } catch (err) {
//         console.error("KYC screens error:", err);
//       }
//     };

//     fetchScreenVisibility();
//   }, []);

//   /* ========================================================
//      HANDLE DIGILOCKER REDIRECT
//   ======================================================== */

//   useEffect(() => {
//     if (verificationIdFromUrl && statusFromUrl) {
//       handleRedirect(verificationIdFromUrl, statusFromUrl);
//     }
//   }, [verificationIdFromUrl, statusFromUrl]);

//   const handleRedirect = async (vid, status) => {
//     setVerificationId(vid);

//     if (status === "verified" || status === "AUTHENTICATED") {
//       await fetchDocument(vid);
//     } else if (status === "pending") {
//       startPolling(vid);
//     } else {
//       setError("Verification failed");
//       setStep(STEPS.ERROR);
//     }
//   };

//   /* ========================================================
//      START DIGILOCKER
//   ======================================================== */

//   const handleContinue = async () => {
//     try {
//       setLoading(true);

//       const vid = uuidv4();
//       setVerificationId(vid);

//       const redirectUrl =
//         process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI ||
//         "playymate://kyc-callback";

//       const res = await kycService.digilockerCreateUrl(
//         vid,
//         ["AADHAAR"],
//         redirectUrl
//       );

//       const consentUrl = res?.data?.data?.consent_url;

//       if (consentUrl) {
//         window.location.href = consentUrl;
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to start verification");
//       setStep(STEPS.ERROR);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ========================================================
//      POLLING DIGILOCKER STATUS
//   ======================================================== */

//   const startPolling = (vid) => {
//     setStep(STEPS.POLLING);

//     let attempts = 0;

//     pollingRef.current = setInterval(async () => {
//       attempts++;

//       if (attempts > 40) {
//         clearInterval(pollingRef.current);
//         setError("Verification timeout");
//         setStep(STEPS.ERROR);
//         return;
//       }

//       try {
//         const res = await kycService.digilockerStatus(vid);

//         const status = res?.data?.data?.status;

//         if (status === "verified") {
//           clearInterval(pollingRef.current);
//           await fetchDocument(vid);
//         }
//       } catch {}
//     }, 3000);
//   };

//   /* ========================================================
//      FETCH DOCUMENT
//   ======================================================== */

//   const fetchDocument = async (vid) => {
//     try {
//       await kycService.digilockerDocument("AADHAAR", vid);

//       routeAfterAadhaar();
//     } catch {
//       routeAfterAadhaar();
//     }
//   };

//   /* ========================================================
//      SKIP AADHAAR
//   ======================================================== */

//   const handleSkip = async () => {
//     try {
//       await kycService.skipAadhaar();

//       routeAfterAadhaar();
//     } catch {
//       routeAfterAadhaar();
//     }
//   };

//   /* ========================================================
//      ROUTE AFTER AADHAAR
//   ======================================================== */

//   const routeAfterAadhaar = async () => {
//     if (screensEnabled.liveness) {
//       router.push("/onboarding/kyc/liveness");
//     } else {
//       await kycService.completeKYC();
//       router.push("/onboarding/physical");
//     }
//   };

//   /* ========================================================
//      LOADING SCREEN CONFIG
//   ======================================================== */

//   if (!screenConfig) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
//       </div>
//     );
//   }

//   /* ========================================================
//      UI
//   ======================================================== */

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

//         {step === STEPS.INTRO && (
//           <>
//             <div className="text-center mb-6">

//               <Shield className="w-12 h-12 text-pink-500 mx-auto mb-3" />

//               <h2 className="text-xl font-bold text-white">
//                 {screenConfig.title}
//               </h2>

//               {screenConfig.subtitle && (
//                 <p className="text-gray-400 text-sm mt-2">
//                   {screenConfig.subtitle}
//                 </p>
//               )}

//               {screenConfig.description && (
//                 <p className="text-gray-500 text-xs mt-2">
//                   {screenConfig.description}
//                 </p>
//               )}
//             </div>

//             <button
//               onClick={handleContinue}
//               disabled={loading}
//               className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold mb-3"
//             >
//               {loading ? (
//                 <Loader2 className="animate-spin mx-auto" />
//               ) : (
//                 screenConfig.button_text?.primary
//               )}
//             </button>

//             {screenConfig.button_text?.skip && (
//               <button
//                 onClick={handleSkip}
//                 className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl"
//               >
//                 {screenConfig.button_text.skip}
//               </button>
//             )}
//           </>
//         )}

//         {step === STEPS.POLLING && (
//           <div className="text-center text-white">
//             <Loader2 className="animate-spin mx-auto mb-3" />
//             Verifying Aadhaar...
//           </div>
//         )}

//         {step === STEPS.ERROR && (
//           <>
//             <X className="w-12 h-12 text-red-500 mx-auto mb-3" />

//             <p className="text-red-400 text-center mb-4">
//               {error}
//             </p>

//             <button
//               onClick={() => setStep(STEPS.INTRO)}
//               className="w-full py-3 bg-gray-700 rounded-xl text-white"
//             >
//               Retry
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// function KYCPageLoading() {
//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center">
//       <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
//     </div>
//   );
// }

// export default function KYCPage() {
//   return (
//     <Suspense fallback={<KYCPageLoading />}>
//       <KYCPageContent />
//     </Suspense>
//   );
// }

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Shield, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";

import { userService } from "@/services/user";



const STEPS = {
  INTRO: "intro",
  POLLING: "polling",
  ERROR: "error",
};

export default function KYCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationIdFromUrl = searchParams.get("verification_id");
  const statusFromUrl = searchParams.get("status");

  const pollingRef = useRef(null);

  const [step, setStep] = useState(STEPS.INTRO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [verificationId, setVerificationId] = useState("");

  const [screenConfig, setScreenConfig] = useState(null);

  const [screensEnabled, setScreensEnabled] = useState({
    aadhaar: true,
    liveness: true,
  });

   /* ================= CHECK STATUS ================= */
 
   useEffect(() => {
     const checkStatus = async () => {
       try {
         const res = await userService.getOnboardingStatus();
         const state = res?.data?.data?.onboarding_state;
         const nextStep = res?.data?.next_required_step;
 
         const completedStates = [
           "KYC_COMPLETED",
           "PHYSICAL_PROFILE_CONSENT",
           "PHYSICAL_PROFILE_COMPLETED",
           "QUESTIONNAIRE_COMPLETE",
           "COMPLETED",
           "ACTIVE",
         ];
 
         if (completedStates.includes(state)) {
           if (nextStep) {
             const route = getRouteFromStep(nextStep);
             if (route) {
               router.push(route);
               return;
             }
           }
           router.push("/onboarding/physical");
         }
       } catch (err) {
         console.error(err);
       }
     };
 
     checkStatus();
   }, [router]);
 

  /* ========================================================
     FETCH SCREEN CONFIG
  ======================================================== */

  useEffect(() => {
    const fetchScreen = async () => {
      try {
        const res = await userService.getScreenConfig("kyc_start");
  
        const screen =
          res?.data?.data?.screen ||
          res?.data?.screen ||
          res?.data;
  
        setScreenConfig(screen);
      } catch (err) {
        console.error("KYC screen fetch error:", err);
      }
    };
  
    fetchScreen();
  }, []);

  /* ========================================================
     FETCH KYC SCREEN VISIBILITY
  ======================================================== */

  useEffect(() => {
    const fetchScreenVisibility = async () => {
      try {
        const res = await kycService.getKycScreens();

        const { screens } = res?.data?.data || {};

        if (screens) {
          setScreensEnabled({
            aadhaar: screens.aadhaar?.enabled ?? true,
            liveness: screens.liveness?.enabled ?? true,
          });
        }
      } catch (err) {
        console.error("KYC screens error:", err);
      }
    };

    fetchScreenVisibility();
  }, []);

  /* ========================================================
     HANDLE DIGILOCKER REDIRECT
  ======================================================== */

  useEffect(() => {
    if (verificationIdFromUrl && statusFromUrl) {
      handleRedirect(verificationIdFromUrl, statusFromUrl);
    }
  }, [verificationIdFromUrl, statusFromUrl]);

  const handleRedirect = async (vid, status) => {
    setVerificationId(vid);

    if (status === "verified" || status === "AUTHENTICATED") {
      await fetchDocument(vid);
    } else if (status === "pending") {
      startPolling(vid);
    } else {
      setError("Verification failed");
      setStep(STEPS.ERROR);
    }
  };

  /* ========================================================
     START DIGILOCKER
  ======================================================== */

  const handleContinue = async () => {
    try {
      setLoading(true);

      const vid = uuidv4();
      setVerificationId(vid);

      const redirectUrl =
        process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI ||
        "playymate://kyc-callback";

      const res = await kycService.digilockerCreateUrl(
        vid,
        ["AADHAAR"],
        redirectUrl
      );

      const consentUrl = res?.data?.data?.consent_url;

      if (consentUrl) {
        window.location.href = consentUrl;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start verification");
      setStep(STEPS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
     POLLING DIGILOCKER STATUS
  ======================================================== */

  const startPolling = (vid) => {
    setStep(STEPS.POLLING);

    let attempts = 0;

    pollingRef.current = setInterval(async () => {
      attempts++;

      if (attempts > 40) {
        clearInterval(pollingRef.current);
        setError("Verification timeout");
        setStep(STEPS.ERROR);
        return;
      }

      try {
        const res = await kycService.digilockerStatus(vid);

        const status = res?.data?.data?.status;

        if (status === "verified") {
          clearInterval(pollingRef.current);
          await fetchDocument(vid);
        }
      } catch {}
    }, 3000);
  };

  /* ========================================================
     FETCH DOCUMENT
  ======================================================== */

  const fetchDocument = async (vid) => {
    try {
      await kycService.digilockerDocument("AADHAAR", vid);

      routeAfterAadhaar();
    } catch {
      routeAfterAadhaar();
    }
  };

  /* ========================================================
     SKIP AADHAAR
  ======================================================== */

  const handleSkip = async () => {
    try {
      await kycService.skipAadhaar();

      routeAfterAadhaar();
    } catch {
      routeAfterAadhaar();
    }
  };

  /* ========================================================
     ROUTE AFTER AADHAAR
  ======================================================== */

  const routeAfterAadhaar = async () => {
    if (screensEnabled.liveness) {
      router.push("/onboarding/kyc/liveness");
    } else {
      await kycService.completeKYC();
      router.push("/onboarding/physical");
    }
  };

  /* ========================================================
     LOADING SCREEN CONFIG
  ======================================================== */

  if (!screenConfig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    );
  }

  /* ========================================================
     UI
  ======================================================== */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full  p-6 rounded-2xl">

      {step === STEPS.INTRO && (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">

    {/* Title */}
    <h1 className="text-4xl font-Playfair Display font-bold text-white mb-4">
      {(screenConfig?.title || "Start Your KYC")
        .split(" ")
        .map((word, i) =>
          i === 2 ? (
            <span
              key={i}
              className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent"
            >
              {" " + word}
            </span>
          ) : (
            " " + word
          )
        )}
    </h1>

    {/* Subtitle */}
    {screenConfig?.subtitle && (
      <p className="text-gray-400 text-base font-Poppins max-w-xs mb-12 leading-relaxed">
        {screenConfig.subtitle}
      </p>
    )}

    {/* Card */}
    <div className="w-full max-w-sm bg-gradient-to-b from-[#2c0f27] to-[#1a0b17] rounded-3xl p-7">

      {/* Description */}
      {screenConfig?.description && (
        <p className="text-gray-300 text-sm mb-8 leading-relaxed font-Poppins">
          {screenConfig.description}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-4">

        {/* Skip */}
        {screenConfig?.button_text?.skip && (
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-full border  border-pink-500 text-white font-medium"
          >
            {screenConfig.button_text.skip}
          </button>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex-1 py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            screenConfig?.button_text?.primary || "Continue"
          )}
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 py-3 rounded-full font-Poppins border border-pink-500 text-white font-medium"
        >
          {screenConfig?.button_text?.skip || "Skip"}
        </button>

      </div>
    </div>
  </div>
)}
        {step === STEPS.POLLING && (
          <div className="text-center text-white">
            <Loader2 className="animate-spin mx-auto mb-3" />
            Verifying Aadhaar...
          </div>
        )}

        {step === STEPS.ERROR && (
          <>
            <X className="w-12 h-12 text-red-500 mx-auto mb-3" />

            <p className="text-red-400 text-center mb-4">
              {error}
            </p>

            <button
              onClick={() => setStep(STEPS.INTRO)}
              className="w-full py-3 bg-gray-700 rounded-xl text-white"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}