// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Loader2,
//   Camera,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   ArrowLeft,
//   ArrowRight,
//   User,
//   Smartphone,
//   Fingerprint,
//   Building2,
//   Clock,
//   X,
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { kycService } from "@/services/kyc";
// import { userService } from "@/services/user";
// import { getRouteFromStep } from "@/lib/api/navigation";

// /**
//  * KYC Page States
//  * INTRO - Initial screen with Skip/Continue options
//  * DIGILOCKER_INIT - Starting DigiLocker verification
//  * DIGILOCKER_POLLING - Polling for Aadhaar verification
//  * DIGILOCKER_SUCCESS - Aadhaar verified successfully
//  * FACE_CAPTURE - Camera for selfie
//  * FACE_REVIEW - Review captured selfie
//  * FACE_VERIFYING - Submitting face liveness
//  * FACE_SUCCESS - Face liveness passed
//  * KYC_COMPLETE - Final KYC completion
//  * ERROR - Error state
//  */

// const KYC_STEPS = {
//   INTRO: "intro",
//   DIGILOCKER_INIT: "digilocker_init",
//   DIGILOCKER_POLLING: "digilocker_polling",
//   DIGILOCKER_SUCCESS: "digilocker_success",
//   FACE_CAPTURE: "face_capture",
//   FACE_REVIEW: "face_review",
//   FACE_VERIFYING: "face_verifying",
//   FACE_SUCCESS: "face_success",
//   KYC_COMPLETE: "kyc_complete",
//   ERROR: "error",
// };

// export default function KYCPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
  
//   // Check for verification_id from DigiLocker redirect
//   const verificationIdFromUrl = searchParams.get("verification_id");
//   const statusFromUrl = searchParams.get("status");

//   // State management
//   const [currentStep, setCurrentStep] = useState(KYC_STEPS.INTRO);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [errorCode, setErrorCode] = useState("");
  
//   // KYC Data
//   const [verificationId, setVerificationId] = useState("");
//   const [aadhaarData, setAadhaarData] = useState(null);
//   const [selfie, setSelfie] = useState(null);
//   const [selfieFile, setSelfieFile] = useState(null);
//   const [graceDaysRemaining, setGraceDaysRemaining] = useState(null);
  
//   // Camera refs
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const pollingRef = useRef(null);

//   // Dev mode configuration
//   const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

//   /* ================= EFFECTS ================= */

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       stopCamera();
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   // Check onboarding status on mount
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       // Skip if we have a verification ID from URL (DigiLocker redirect)
//       if (verificationIdFromUrl) {
//         setInitialLoading(false);
//         return;
//       }

//       try {
//         const response = await userService.getOnboardingStatus();
//         const state = response?.data?.data?.onboarding_state;
//         const nextStep = response?.data?.next_required_step;

//         // KYC completed states - redirect to next step
//         const kycCompletedStates = ['KYC_COMPLETED', 'PHYSICAL_PROFILE_CONSENT', 'PHYSICAL_PROFILE_COMPLETED', 'QUESTIONNAIRE_COMPLETE', 'COMPLETED', 'ACTIVE'];
        
//         if (kycCompletedStates.includes(state)) {
//           // KYC already completed, navigate to next step
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             if (route && route !== '/onboarding/kyc') {
//               router.push(route);
//               return;
//             }
//           }
//           // Default navigation after KYC
//           router.push('/onboarding/');
//           return;
//         }

//         // If not in KYC-required state, redirect to correct step
//         const kycRequiredStates = ['PROFILE_DETAILS_CAPTURED', 'VERIFICATION_PENDING', 'AADHAAR_VERIFIED', 'FACE_LIVENESS_PASSED'];
        
//         if (!kycRequiredStates.includes(state) && nextStep) {
//           // User not in KYC state, redirect to their actual next step
//           const route = getRouteFromStep(nextStep);
//           if (route && route !== '/onboarding/kyc') {
//             router.push(route);
//             return;
//           }
//         }

//       } catch (err) {
//         console.error('Failed to check onboarding status:', err);
//         // Continue anyway - let user try to proceed
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     checkOnboardingStatus();
//   }, [router, verificationIdFromUrl]);

//   // Handle redirect from DigiLocker
//   useEffect(() => {
//     if (verificationIdFromUrl && statusFromUrl) {
//       handleDigilockerRedirect(verificationIdFromUrl, statusFromUrl);
//     }
//   }, [verificationIdFromUrl, statusFromUrl]);

//   // Start camera when entering FACE_CAPTURE step
//   useEffect(() => {
//     if (currentStep === KYC_STEPS.FACE_CAPTURE) {
//       startCamera();
//     }
//     return () => {
//       if (currentStep !== KYC_STEPS.FACE_CAPTURE && currentStep !== KYC_STEPS.FACE_REVIEW) {
//         stopCamera();
//       }
//     };
//   }, [currentStep]);

//   /* ================= DIGILOCKER METHODS ================= */

//   const handleDigilockerRedirect = async (vid, status) => {
//     setVerificationId(vid);
    
//     if (status === "verified" || status === "AUTHENTICATED") {
//       // Already verified, proceed to get document
//       try {
//         await fetchAadhaarDocument(vid);
//       } catch (err) {
//         setError("Failed to fetch Aadhaar document");
//         setCurrentStep(KYC_STEPS.ERROR);
//       }
//     } else if (status === "pending") {
//       // Start polling
//       startPolling(vid);
//     } else {
//       // Failed or other status
//       setError("Verification was not completed. Please try again.");
//       setCurrentStep(KYC_STEPS.ERROR);
//     }
//   };

//   const handleStartDigilocker = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setErrorCode("");

//       // Generate new verification ID
//       const vid = verificationIdFromUrl || uuidv4();
//       setVerificationId(vid);

//       if (DEV_MODE) {
//         // Simulate DigiLocker flow in dev mode
//         setTimeout(() => {
//           startPolling(vid);
//         }, 1000);
//         return;
//       }

//       // Call DigiLocker create URL API
//       const redirectUrl = process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI || "playymate://kyc-callback";
      
//       const response = await kycService.digilockerCreateUrl(
//         vid,
//         ["AADHAAR"],
//         redirectUrl,
//         "verification"
//       );

//       const consentUrl = response.data?.data?.consent_url;

//       if (!consentUrl) {
//         throw new Error("Consent URL not received from server");
//       }

//       // Redirect to DigiLocker
//       window.location.href = consentUrl;
      
//     } catch (err) {
//       console.error("DigiLocker init error:", err);
//       const errorMsg = err.response?.data?.message || "Failed to start verification";
//       const errorCodeVal = err.response?.data?.error_code;
      
//       setError(errorMsg);
//       setErrorCode(errorCodeVal || "");
//       setLoading(false);
//     }
//   };

//   const startPolling = (vid = verificationId) => {
//     setCurrentStep(KYC_STEPS.DIGILOCKER_POLLING);
    
//     let attempts = 0;
//     const maxAttempts = 40; // ~2 minutes at 3s interval
//     let pollCount = 0;

//     if (pollingRef.current) {
//       clearInterval(pollingRef.current);
//     }

//     pollingRef.current = setInterval(async () => {
//       attempts++;
//       pollCount++;

//       // Dev mode simulation
//       if (DEV_MODE) {
//         if (pollCount >= 3) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
          
//           // Simulate successful verification
//           setAadhaarData({
//             name: "Demo User",
//             aadhaar_number: "XXXXXXXX1234",
//             dob: "01-01-1990",
//             gender: "M",
//           });
//           setCurrentStep(KYC_STEPS.DIGILOCKER_SUCCESS);
//         }
//         return;
//       }

//       if (attempts > maxAttempts) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//         setError("Verification timeout. Please try again.");
//         setCurrentStep(KYC_STEPS.ERROR);
//         return;
//       }

//       try {
//         const statusResponse = await kycService.digilockerStatus(vid);
//         const statusData = statusResponse.data?.data;
//         const status = statusData?.status;

//         if (status === "AUTHENTICATED" || status === "verified") {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
          
//           // Fetch Aadhaar document
//           await fetchAadhaarDocument(vid);
//         } else if (status === "failed" || status === "FAILED") {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//           setError("Verification failed. Please try again.");
//           setCurrentStep(KYC_STEPS.ERROR);
//         }
//         // Continue polling for "pending" status
//       } catch (err) {
//         console.error("Polling error:", err);
//         // Continue polling on network errors
//       }
//     }, 3000);
//   };

//   const fetchAadhaarDocument = async (vid) => {
//     try {
//       if (DEV_MODE) {
//         setAadhaarData({
//           name: "Demo User",
//           aadhaar_number: "XXXXXXXX1234",
//           dob: "01-01-1990",
//           gender: "M",
//         });
//         setCurrentStep(KYC_STEPS.DIGILOCKER_SUCCESS);
//         return;
//       }

//       const docResponse = await kycService.digilockerDocument("AADHAAR", vid);
//       const docData = docResponse.data?.data;
      
//       if (docData) {
//         setAadhaarData(docData);
//       }
//       setCurrentStep(KYC_STEPS.DIGILOCKER_SUCCESS);
//     } catch (err) {
//       console.error("Fetch document error:", err);
//       // Even if document fetch fails, proceed to face capture
//       setCurrentStep(KYC_STEPS.DIGILOCKER_SUCCESS);
//     }
//   };

//   const stopPolling = () => {
//     if (pollingRef.current) {
//       clearInterval(pollingRef.current);
//       pollingRef.current = null;
//     }
//   };

//   /* ================= FACE LIVENESS METHODS ================= */

//   const proceedToFaceCapture = () => {
//     stopPolling();
//     setCurrentStep(KYC_STEPS.FACE_CAPTURE);
//   };

//   const startCamera = async () => {
//     try {
//       if (streamRef.current) {
//         return; // Camera already started
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: false,
//       });

//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }
//     } catch (err) {
//       console.error("Camera error:", err);
//       setError("Unable to access camera. Please allow camera permission.");
//       setCurrentStep(KYC_STEPS.ERROR);
//     }
//   };

//   const stopCamera = useCallback(() => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//   }, []);

//   const captureSelfie = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     try {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       const ctx = canvas.getContext("2d");

//       // Set canvas dimensions to match video
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       // Draw video frame to canvas
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       // Convert to base64 image
//       const imageData = canvas.toDataURL("image/jpeg", 0.9);
//       setSelfie(imageData);

//       // Create blob for upload
//       canvas.toBlob(
//         (blob) => {
//           setSelfieFile(blob);
//         },
//         "image/jpeg",
//         0.95
//       );

//       stopCamera();
//       setCurrentStep(KYC_STEPS.FACE_REVIEW);
//     } catch (err) {
//       console.error("Capture error:", err);
//       setError("Failed to capture selfie. Please try again.");
//     }
//   };

//   const retakeSelfie = () => {
//     setSelfie(null);
//     setSelfieFile(null);
//     setCurrentStep(KYC_STEPS.FACE_CAPTURE);
//   };

//   const handleFaceVerify = async () => {
//     if (!selfie || !selfieFile) {
//       setError("Please capture a selfie first.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       setCurrentStep(KYC_STEPS.FACE_VERIFYING);

//       if (DEV_MODE) {
//         // Simulate face verification in dev mode
//         setTimeout(() => {
//           setCurrentStep(KYC_STEPS.FACE_SUCCESS);
//           // Auto proceed to complete KYC
//           setTimeout(() => completeKYC(), 1500);
//         }, 2000);
//         return;
//       }

//       // Step 1: Get presigned URL
//       const fileName = `kyc_selfie_${Date.now()}.jpg`;
//       const presignResponse = await kycService.getPresignedUrl(
//         fileName,
//         selfieFile.size,
//         "image/jpeg",
//         "verification"
//       );

//       const { upload_url, file_url } = presignResponse.data?.data;

//       if (!upload_url || !file_url) {
//         throw new Error("Failed to get upload URL");
//       }

//       // Step 2: Upload to presigned URL
//       await kycService.uploadToPresigned(upload_url, selfieFile, "image/jpeg");

//       // Step 3: Submit face liveness
//       await kycService.faceLiveness(file_url);

//       // Step 4: Complete KYC
//       setCurrentStep(KYC_STEPS.FACE_SUCCESS);
      
//       // Auto proceed to complete KYC after a short delay
//       setTimeout(() => completeKYC(), 1500);

//     } catch (err) {
//       console.error("Face verification error:", err);
//       const errorMsg = err.response?.data?.message || "Face verification failed. Please try again.";
//       const errorCodeVal = err.response?.data?.error_code;
      
//       setError(errorMsg);
//       setErrorCode(errorCodeVal || "");
//       setCurrentStep(KYC_STEPS.FACE_REVIEW);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const completeKYC = async () => {
//   //   try {
//   //     setLoading(true);

//   //     if (!DEV_MODE) {
//   //       await kycService.completeKYC();
//   //     }

//   //     setCurrentStep(KYC_STEPS.KYC_COMPLETE);
//   //   } catch (err) {
//   //     console.error("KYC complete error:", err);
//   //     // Even if completeKYC fails, show success since liveness passed
//   //     setCurrentStep(KYC_STEPS.KYC_COMPLETE);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   const completeKYC = async () => {
//     try {
//       setLoading(true);

//       let nextStep = null;

//       if (!DEV_MODE) {
//         const response = await kycService.completeKYC();
//         // Get next required step from response
//         nextStep = response?.data?.next_required_step;
//       }

//       setCurrentStep(KYC_STEPS.KYC_COMPLETE);

//       // Navigate to next step after showing success
//       setTimeout(() => {
//         if (nextStep) {
//           const route = getRouteFromStep(nextStep);
//           if (route && route !== '/onboarding/kyc') {
//             router.push(route);
//             return;
//           }
//         }
//         // Default: navigate to physical activity
//         router.push('/onboarding/physical');
//       }, 2000);

//     } catch (err) {
//       console.group("🚨 KYC COMPLETE ERROR");

//       if (err.response) {
//         console.error("Status:", err.response.status);
//         console.error("Error Code:", err.response.data?.error_code);
//         console.error("Message:", err.response.data?.message);
//         console.error("Full Response:", err.response.data);
//       } else if (err.request) {
//         console.error("No response received:", err.request);
//       } else {
//         console.error("Request setup error:", err.message);
//       }

//       console.groupEnd();

//       // Even on error, show completion - liveness already passed
//       setCurrentStep(KYC_STEPS.KYC_COMPLETE);
      
//       // Still try to navigate after showing success
//       setTimeout(() => {
//         router.push('/onboarding/physical');
//       }, 2000);

//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= SKIP METHODS ================= */

//   const handleSkip = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       if (!DEV_MODE) {
//         try {
//           const response = await kycService.skipAadhaar();
//           const data = response.data?.data;
          
//           if (data?.grace_days_remaining) {
//             setGraceDaysRemaining(data.grace_days_remaining);
//           }
//         } catch (skipErr) {
//           // If skip fails (e.g., already verified or processed), still proceed to face liveness
//           // The backend might return 400 if Aadhaar is already done
//           console.log("Skip Aadhaar response:", skipErr.response?.data);
//         }
//       }

//       // According to flow: SKIP AADHAAR → FACE LIVENESS → KYC COMPLETE
//       // Users who skip Aadhaar still need to complete face liveness
//       setCurrentStep(KYC_STEPS.FACE_CAPTURE);
//     } catch (err) {
//       console.error("Skip error:", err);
//       // Even on error, proceed to face liveness as per the flow
//       setCurrentStep(KYC_STEPS.FACE_CAPTURE);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= NAVIGATION ================= */

//   const goBack = () => {
//     stopPolling();
//     stopCamera();
    
//     switch (currentStep) {
//       case KYC_STEPS.DIGILOCKER_INIT:
//       case KYC_STEPS.DIGILOCKER_POLLING:
//         setCurrentStep(KYC_STEPS.INTRO);
//         break;
//       case KYC_STEPS.DIGILOCKER_SUCCESS:
//         setCurrentStep(KYC_STEPS.INTRO);
//         break;
//       case KYC_STEPS.FACE_CAPTURE:
//         setCurrentStep(KYC_STEPS.DIGILOCKER_SUCCESS);
//         break;
//       case KYC_STEPS.FACE_REVIEW:
//         setCurrentStep(KYC_STEPS.FACE_CAPTURE);
//         break;
//       case KYC_STEPS.ERROR:
//         setCurrentStep(KYC_STEPS.INTRO);
//         setError("");
//         setErrorCode("");
//         break;
//       default:
//         break;
//     }
//   };

//   const handleContinueToPhysical = () => {
//     router.push("/physical-activity");
//   };

//   const handleRetry = () => {
//     setError("");
//     setErrorCode("");
//     setCurrentStep(KYC_STEPS.INTRO);
//   };

//   /* ================= RENDER HELPERS ================= */

//   const renderHeader = (showBack = true) => (
//     <div className="flex items-center justify-between mb-6">
//       {showBack && currentStep !== KYC_STEPS.INTRO && currentStep !== KYC_STEPS.KYC_COMPLETE && (
//         <button
//           onClick={goBack}
//           className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5 text-white" />
//         </button>
//       )}
//       <div className="flex-1" />
//       <div className="text-sm text-gray-400">
//         {currentStep === KYC_STEPS.INTRO && "Step 1 of 3"}
//         {(currentStep === KYC_STEPS.DIGILOCKER_INIT || 
//           currentStep === KYC_STEPS.DIGILOCKER_POLLING || 
//           currentStep === KYC_STEPS.DIGILOCKER_SUCCESS) && "Step 2 of 3"}
//         {(currentStep === KYC_STEPS.FACE_CAPTURE || 
//           currentStep === KYC_STEPS.FACE_REVIEW || 
//           currentStep === KYC_STEPS.FACE_VERIFYING ||
//           currentStep === KYC_STEPS.FACE_SUCCESS) && "Step 3 of 3"}
//         {currentStep === KYC_STEPS.KYC_COMPLETE && "Complete"}
//         {currentStep === KYC_STEPS.ERROR && "Error"}
//       </div>
//     </div>
//   );

//   /* ================= RENDER STEPS ================= */

//   const renderIntro = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
//           <Shield className="w-10 h-10 text-white" />
//         </div>
//         <h1 className="text-2xl font-bold text-white mb-2">
//           Verify Your Identity
//         </h1>
//         <p className="text-gray-400 text-sm">
//           Complete KYC to access all features and ensure a safe community
//         </p>
//       </div>

//       {/* Features List */}
//       <div className="space-y-3 bg-gray-900/50 rounded-xl p-4">
//         <div className="flex items-center gap-3 text-gray-300">
//           <Fingerprint className="w-5 h-5 text-pink-500" />
//           <span className="text-sm">Aadhaar Verification via DigiLocker</span>
//         </div>
//         <div className="flex items-center gap-3 text-gray-300">
//           {/* <Face className="w-5 h-5 text-orange-500" /> */}
//           <span className="text-sm">Face Liveness Check</span>
//         </div>
//         <div className="flex items-center gap-3 text-gray-300">
//           <Building2 className="w-5 h-5 text-pink-500" />
//           <span className="text-sm">Secure & Encrypted Process</span>
//         </div>
//       </div>

//       {/* Skip Option */}
//       <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
//         <div className="flex items-start gap-3">
//           <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="text-yellow-200 text-sm font-medium">Skip Aadhaar for Now</p>
//             <p className="text-yellow-400/70 text-xs mt-1">
//               You can skip Aadhaar, but face verification is still required to complete KYC. You have 30 days to complete full verification.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="space-y-3 pt-2">
//         <button
//           onClick={handleStartDigilocker}
//           disabled={loading}
//           className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
//         >
//           {loading ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <>
//               <Smartphone className="w-5 h-5" />
//               Continue with DigiLocker
//             </>
//           )}
//         </button>

//         <button
//           onClick={handleSkip}
//           disabled={loading}
//           className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
//         >
//           Skip for Now
//         </button>
//       </div>
//     </div>
//   );

//   const renderDigilockerInit = () => (
//     <div className="space-y-6 text-center">
//       <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4">
//         <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
//       </div>
//       <h2 className="text-xl font-semibold text-white">
//         Connecting to DigiLocker
//       </h2>
//       <p className="text-gray-400 text-sm">
//         Please wait while we set up your verification...
//       </p>
//     </div>
//   );

//   const renderDigilockerPolling = () => (
//     <div className="space-y-6 text-center">
//       <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4">
//         <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
//       </div>
//       <h2 className="text-xl font-semibold text-white">
//         Verifying Your Aadhaar
//       </h2>
//       <p className="text-gray-400 text-sm">
//         Please complete verification on DigiLocker screen
//       </p>
//       <p className="text-gray-500 text-xs">
//         This may take a few moments...
//       </p>
      
//       <button
//         onClick={() => startPolling()}
//         className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition-colors"
//       >
//         Refresh Status
//       </button>
//     </div>
//   );

//   const renderDigilockerSuccess = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
//           <CheckCircle className="w-10 h-10 text-green-500" />
//         </div>
//         <h2 className="text-xl font-semibold text-white">
//           Aadhaar Verified Successfully!
//         </h2>
        
//         {aadhaarData && (
//           <div className="mt-4 bg-gray-900/50 rounded-xl p-4 text-left">
//             <p className="text-gray-400 text-xs mb-2">Verified Details</p>
//             <div className="space-y-2">
//               <p className="text-white">
//                 <span className="text-gray-500">Name: </span>
//                 {aadhaarData.name || "N/A"}
//               </p>
//               <p className="text-white">
//                 <span className="text-gray-500">Aadhaar: </span>
//                 {aadhaarData.aadhaar_number || "N/A"}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       <button
//         onClick={proceedToFaceCapture}
//         className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
//       >
//         Continue to Face Verification
//         <ArrowRight className="w-5 h-5" />
//       </button>
//     </div>
//   );

//   const renderFaceCapture = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-white mb-2">
//           Face Verification
//         </h2>
//         <p className="text-gray-400 text-sm">
//           Position your face in the circle and capture a selfie
//         </p>
//       </div>

//       <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden">
//         {/* Camera Preview */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//         />
        
//         {/* Overlay Circle */}
//         <div className="absolute inset-0 pointer-events-none">
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-white/30" />
//         </div>

//         {/* Camera Guide */}
//         <div className="absolute bottom-4 left-0 right-0 text-center">
//           <p className="text-white/80 text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
//             Look at the camera
//           </p>
//         </div>
//       </div>

//       <canvas ref={canvasRef} className="hidden" />

//       <button
//         onClick={captureSelfie}
//         className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
//       >
//         <Camera className="w-5 h-5" />
//         Capture Selfie
//       </button>
//     </div>
//   );

//   const renderFaceReview = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-white mb-2">
//           Review Your Selfie
//         </h2>
//         <p className="text-gray-400 text-sm">
//           Make sure your face is clearly visible
//         </p>
//       </div>

//       {/* Selfie Preview */}
//       <div className="aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden">
//         <img
//           src={selfie}
//           alt="Selfie preview"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 flex items-center gap-2">
//           <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//           <p className="text-red-400 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex gap-3">
//         <button
//           onClick={retakeSelfie}
//           className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
//         >
//           Retake
//         </button>
//         <button
//           onClick={handleFaceVerify}
//           disabled={loading}
//           className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <>
//               <CheckCircle className="w-5 h-5" />
//               Verify
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );

//   const renderFaceVerifying = () => (
//     <div className="space-y-6 text-center py-8">
//       <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4">
//         <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
//       </div>
//       <h2 className="text-xl font-semibold text-white">
//         Verifying Your Face
//       </h2>
//       <p className="text-gray-400 text-sm">
//         Please wait while we verify your identity...
//       </p>
//     </div>
//   );

//   const renderFaceSuccess = () => (
//     <div className="space-y-6 text-center">
//       <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
//         <CheckCircle className="w-10 h-10 text-green-500" />
//       </div>
//       <h2 className="text-xl font-semibold text-white">
//         Face Verification Passed!
//       </h2>
//       <p className="text-gray-400 text-sm">
//         Your identity has been verified successfully
//       </p>
//     </div>
//   );

//   const renderKYCComplete = () => (
//     <div className="space-y-6 text-center">
//       <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
//         <Shield className="w-12 h-12 text-white" />
//       </div>
//       <h2 className="text-2xl font-bold text-white">
//         KYC Completed Successfully!
//       </h2>
//       <p className="text-gray-400">
//         Your identity verification is complete. You now have full access to all features.
//       </p>

//       <button
//         onClick={handleContinueToPhysical}
//         className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
//       >
//         Continue
//         <ArrowRight className="w-5 h-5" />
//       </button>
//     </div>
//   );

//   const renderError = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
//           <X className="w-10 h-10 text-red-500" />
//         </div>
//         <h2 className="text-xl font-semibold text-white mb-2">
//           Verification Failed
//         </h2>
//         <p className="text-gray-400 text-sm">
//           {error || "Something went wrong. Please try again."}
//         </p>
//         {errorCode && (
//           <p className="text-gray-500 text-xs mt-2">
//             Error Code: {errorCode}
//           </p>
//         )}
//       </div>

//       <div className="flex gap-3">
//         <button
//           onClick={goBack}
//           className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
//         >
//           Go Back
//         </button>
//         <button
//           onClick={handleRetry}
//           className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold hover:opacity-90 transition-opacity"
//         >
//           Try Again
//         </button>
//       </div>
//     </div>
//   );

//   /* ================= MAIN RENDER ================= */

//   const renderStep = () => {
//     switch (currentStep) {
//       case KYC_STEPS.INTRO:
//         return renderIntro();
//       case KYC_STEPS.DIGILOCKER_INIT:
//         return renderDigilockerInit();
//       case KYC_STEPS.DIGILOCKER_POLLING:
//         return renderDigilockerPolling();
//       case KYC_STEPS.DIGILOCKER_SUCCESS:
//         return renderDigilockerSuccess();
//       case KYC_STEPS.FACE_CAPTURE:
//         return renderFaceCapture();
//       case KYC_STEPS.FACE_REVIEW:
//         return renderFaceReview();
//       case KYC_STEPS.FACE_VERIFYING:
//         return renderFaceVerifying();
//       case KYC_STEPS.FACE_SUCCESS:
//         return renderFaceSuccess();
//       case KYC_STEPS.KYC_COMPLETE:
//         return renderKYCComplete();
//       case KYC_STEPS.ERROR:
//         return renderError();
//       default:
//         return renderIntro();
//     }
//   };

//   // Show loading state for initial/digilocker init
//   const isLoading = loading || initialLoading || currentStep === KYC_STEPS.DIGILOCKER_INIT;

//   // Show initial loading screen
//   if (initialLoading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6">
//         <div className="w-full max-w-md text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4">
//             <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
//           </div>
//           <h2 className="text-xl font-semibold text-white mb-2">
//             Loading...
//           </h2>
//           <p className="text-gray-400 text-sm">
//             Checking verification status
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6">
//       <div className="w-full max-w-md">
//         {/* Progress Indicator */}
//         {currentStep !== KYC_STEPS.KYC_COMPLETE && (
//           <div className="mb-6">
//             <div className="flex gap-2">
//               <div className={`h-1 flex-1 rounded-full ${currentStep !== KYC_STEPS.INTRO ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-700'}`} />
//               <div className={`h-1 flex-1 rounded-full ${['DIGILOCKER_INIT', 'DIGILOCKER_POLLING', 'DIGILOCKER_SUCCESS', 'FACE_CAPTURE', 'FACE_REVIEW', 'FACE_VERIFYING', 'FACE_SUCCESS', 'KYC_COMPLETE'].includes(currentStep) ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-700'}`} />
//               <div className={`h-1 flex-1 rounded-full ${['FACE_CAPTURE', 'FACE_REVIEW', 'FACE_VERIFYING', 'FACE_SUCCESS', 'KYC_COMPLETE'].includes(currentStep) ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-700'}`} />
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         {renderHeader()}

//         {/* Main Content */}
//         <div className="bg-gray-900/50 rounded-2xl p-6">
//           {renderStep()}
//         </div>

//         {/* Footer */}
//         {currentStep === KYC_STEPS.INTRO && (
//           <p className="text-center text-gray-500 text-xs mt-6">
//             By continuing, you agree to our Terms of Service and Privacy Policy
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Shield,
  Smartphone,
  Fingerprint,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { kycService } from "@/services/kyc";
import { userService } from "@/services/user";
import { getRouteFromStep } from "@/lib/api/navigation";

const STEPS = {
  INTRO: "intro",
  POLLING: "polling",
  SUCCESS: "success",
  ERROR: "error",
};

export default function KYCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationIdFromUrl = searchParams.get("verification_id");
  const statusFromUrl = searchParams.get("status");

  const [step, setStep] = useState(STEPS.INTRO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [aadhaarData, setAadhaarData] = useState(null);

  const pollingRef = useRef(null);
  const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

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

  /* ================= HANDLE DIGILOCKER REDIRECT ================= */

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
      setError("Verification failed.");
      setStep(STEPS.ERROR);
    }
  };

  /* ================= START DIGILOCKER ================= */

  const handleStart = async () => {
    try {
      setLoading(true);

      const vid = uuidv4();
      setVerificationId(vid);

      if (DEV_MODE) {
        startPolling(vid);
        return;
      }

      const redirectUrl =
        process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI ||
        "playymate://kyc-callback";

      const res = await kycService.digilockerCreateUrl(
        vid,
        ["AADHAAR"],
        redirectUrl,
        "verification"
      );

      const consentUrl = res.data?.data?.consent_url;
      window.location.href = consentUrl;
    } catch (err) {
      setError("Failed to start verification.");
      setStep(STEPS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLLING ================= */

  const startPolling = (vid) => {
    setStep(STEPS.POLLING);

    let attempts = 0;

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 40) {
        clearInterval(pollingRef.current);
        setError("Timeout.");
        setStep(STEPS.ERROR);
        return;
      }

      try {
        const res = await kycService.digilockerStatus(vid);
        const status = res.data?.data?.status;

        if (status === "AUTHENTICATED" || status === "verified") {
          clearInterval(pollingRef.current);
          await fetchDocument(vid);
        }
      } catch {}
    }, 3000);
  };

  const fetchDocument = async (vid) => {
    try {
      if (DEV_MODE) {
        setAadhaarData({
          name: "Demo User",
          aadhaar_number: "XXXXXX1234",
        });
        // Auto-redirect to liveness after successful Aadhaar verification
        router.push("/onboarding/kyc/liveness");
        return;
      }

      const res = await kycService.digilockerDocument("AADHAAR", vid);
      setAadhaarData(res.data?.data);
      // Auto-redirect to liveness after successful Aadhaar verification
      router.push("/onboarding/kyc/liveness");
    } catch {
      // Even on error, redirect to liveness
      router.push("/onboarding/kyc/liveness");
    }
  };

  /* ================= SKIP ================= */

  const handleSkip = async () => {
    try {
      if (!DEV_MODE) {
        await kycService.skipAadhaar();
      }

      // 🔥 Push to Liveness
      router.push("/onboarding/kyc/liveness");
    } catch {
      router.push("/onboarding/kyc/liveness");
    }
  };

  /* ================= SUCCESS CONTINUE ================= */

  const proceedToLiveness = () => {
    router.push("/onboarding/kyc/liveness");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

        {step === STEPS.INTRO && (
          <>
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-pink-500 mx-auto mb-3" />
              <h2 className="text-xl text-white font-bold">
                Verify Your Identity
              </h2>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold mb-3"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue with DigiLocker"}
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-3 border border-gray-700 text-gray-400 rounded-xl"
            >
              Skip for Now
            </button>
          </>
        )}

        {step === STEPS.POLLING && (
          <div className="text-center text-white">
            <Loader2 className="animate-spin mx-auto mb-3" />
            Verifying Aadhaar...
          </div>
        )}

        {step === STEPS.SUCCESS && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white text-center mb-4">
              Aadhaar Verified Successfully
            </p>
            <button
              onClick={proceedToLiveness}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold"
            >
              Continue to Face Verification
            </button>
          </>
        )}

        {step === STEPS.ERROR && (
          <>
            <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={() => setStep(STEPS.INTRO)}
              className="w-full py-3 bg-gray-700 rounded-xl text-white"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}