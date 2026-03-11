// "use client";

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Loader2,
//   Camera,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import { kycService } from "@/services/kyc";
// import { getRouteFromStep } from "@/lib/api/navigation";

// export default function LivenessPage() {
//   const router = useRouter();

//   const [step, setStep] = useState("capture");
//   const [selfie, setSelfie] = useState(null);
//   const [selfieFile, setSelfieFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

//   useEffect(() => {
//     startCamera();
//     return stopCamera;
//   }, []);

//   const startCamera = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     streamRef.current = stream;
//     videoRef.current.srcObject = stream;
//   };

//   const stopCamera = useCallback(() => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//     }
//   }, []);

//   const capture = () => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const ctx = canvas.getContext("2d");

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0);

//     canvas.toBlob((blob) => {
//       setSelfieFile(blob);
//     }, "image/jpeg");

//     setSelfie(canvas.toDataURL("image/jpeg"));
//     stopCamera();
//     setStep("review");
//   };

//   const verify = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       if (!DEV_MODE) {
//         const fileName = `kyc_selfie_${Date.now()}.jpg`;

//         const presign = await kycService.getPresignedUrl(
//           fileName,
//           selfieFile.size,
//           "image/jpeg",
//           "verification"
//         );

//         const { upload_url, file_url } = presign.data.data;

//         await kycService.uploadToPresigned(
//           upload_url,
//           selfieFile,
//           "image/jpeg"
//         );

//         await kycService.faceLiveness(file_url);

//         const complete = await kycService.completeKYC();
//         const nextStep = complete?.data?.next_required_step;

//         setStep("success");

//         setTimeout(() => {
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             if (route) {
//               router.push(route);
//               return;
//             }
//           }
//           router.push("/onboarding/physical");
//         }, 2000);
//       } else {
//         setTimeout(() => {
//           setStep("success");
//           router.push("/onboarding/physical");
//         }, 2000);
//       }
//     } catch (err) {
//       console.error("Liveness verification error:", err);
      
//       // Get more specific error message from response
//       const errorMessage = err.response?.data?.message || err.response?.data?.error_code;
      
//       if (errorMessage === 'LIVENESS_FAILED' || errorMessage?.includes('Liveness')) {
//         setError("Liveness check failed. Please try again with a clearer photo, better lighting, and ensure your face is centered.");
//       } else if (err.response?.status === 400) {
//         setError("Verification failed. Please try again with a clearer photo.");
//       } else if (err.response?.status === 401) {
//         setError("Session expired. Please start the process again.");
//       } else {
//         setError("Face verification failed. Please try again.");
//       }
      
//       // Go back to capture to allow retry
//       setStep("capture");
//       // Restart camera
//       setTimeout(() => startCamera(), 500);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

//         {step === "capture" && (
//           <>
//             <video ref={videoRef} autoPlay className="rounded-xl mb-4" />
//             <canvas ref={canvasRef} className="hidden" />
//             <button
//               onClick={capture}
//               className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
//             >
//               <Camera className="w-5 h-5" /> Capture
//             </button>
//           </>
//         )}

//         {step === "review" && (
//           <>
//             <img src={selfie} className="rounded-xl mb-4" />
//             {error && (
//               <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 mb-3">
//                 <p className="text-red-400 text-sm text-center">{error}</p>
//                 <p className="text-red-400/70 text-xs text-center mt-2">
//                   Tips: Use good lighting, keep your face centered, and ensure the photo is clear.
//                 </p>
//               </div>
//             )}
//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setStep("capture");
//                   setError("");
//                   setTimeout(() => startCamera(), 300);
//                 }}
//                 disabled={loading}
//                 className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
//               >
//                 Retake Photo
//               </button>
//               <button
//                 onClick={verify}
//                 disabled={loading}
//                 className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold disabled:opacity-50"
//               >
//                 {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Again"}
//               </button>
//             </div>
//           </>
//         )}

//         {step === "success" && (
//           <div className="text-center">
//             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
//             <p className="text-white">KYC Completed Successfully</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, CheckCircle } from "lucide-react";

import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";

export default function LivenessPage() {
  const router = useRouter();

  const [step, setStep] = useState("capture");

  const [selfie, setSelfie] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [screenConfig, setScreenConfig] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [successConfig, setSuccessConfig] = useState(null);
  const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

  /* =========================================================
     LOAD SCREEN CONFIG (Dynamic UI)
  ========================================================== */

  const [introConfig, setIntroConfig] = useState(null);
  const [scanConfig, setScanConfig] = useState(null);
  
  useEffect(() => {
    const fetchScreenConfigs = async () => {
      try {
        const [introRes, scanRes] = await Promise.all([
          kycService.getScreenConfig("face_verification_intro"),
          kycService.getScreenConfig("face_verification_scan"),
        ]);
  
        setIntroConfig(introRes?.data?.data?.screen || null);
        setScanConfig(scanRes?.data?.data?.screen || null);
      } catch (err) {
        console.error("Screen config fetch error:", err);
      }
    };
  
    fetchScreenConfigs();
  }, []);

  /* =========================================================
     CAMERA START
  ========================================================== */

  useEffect(() => {
    startCamera();

    return stopCamera;
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access is required for face verification.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  /* =========================================================
     CAPTURE PHOTO
  ========================================================== */

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setSelfieFile(blob);
    }, "image/jpeg");

    setSelfie(canvas.toDataURL("image/jpeg"));

    stopCamera();

    setStep("review");
  };

  /* =========================================================
     VERIFY FACE LIVENESS
  ========================================================== */

  const verify = async () => {
    try {
      setLoading(true);
      setError("");

      if (!DEV_MODE) {
        const fileName = `kyc_selfie_${Date.now()}.jpg`;

        const presign = await kycService.getPresignedUrl(
          fileName,
          selfieFile.size,
          "image/jpeg",
          "verification"
        );

        const { upload_url, file_url } = presign.data.data;

        await kycService.uploadToPresigned(
          upload_url,
          selfieFile,
          "image/jpeg"
        );





//         await kycService.faceLiveness(file_url);

//         // const complete = await kycService.completeKYC();

//         // const nextStep = complete?.data?.next_required_step;

//         let nextStep = null;

// try {
//   const complete = await kycService.completeKYC();
//   nextStep = complete?.data?.next_required_step;
// } catch (error) {
//   const errorCode = error?.response?.data?.error_code;

//   // Backend returns 400 when Aadhaar is skipped
//   if (errorCode === "AADHAAR_REQUIRED") {
//     console.warn("Aadhaar skipped, continuing onboarding");
//   } else {
//     console.error("completeKYC error:", error);
//   }
// }


// await kycService.faceLiveness(file_url);

// let nextStep = null;

// try {
//   const complete = await kycService.completeKYC();
//   nextStep = complete?.data?.next_required_step;
// } catch (error) {

//   const errorCode = error?.response?.data?.error_code;

//   if (errorCode === "AADHAAR_REQUIRED") {
//     console.warn("Aadhaar skipped, continuing onboarding");

//   } else if (errorCode === "LIVENESS_REQUIRED") {
//     console.warn("Backend still processing liveness");

//   } else {
//     console.error("completeKYC error:", error);
//   }
// }
await kycService.faceLiveness(file_url);

/* Check updated KYC status before completing */

const statusRes = await kycService.getKycStatus();
const kycData = statusRes?.data?.data;

let nextStep = null;

if (kycData?.liveness_verified) {
  try {
    const complete = await kycService.completeKYC();
    nextStep = complete?.data?.next_required_step;
  } catch (error) {
    const errorCode = error?.response?.data?.error_code;

    if (errorCode === "AADHAAR_REQUIRED") {
      console.warn("Aadhaar skipped, continuing onboarding");
    } else {
      console.error("completeKYC error:", error);
    }
  }
}

       setStep("success");

setTimeout(() => {
  if (nextStep) {
    const route = getRouteFromStep(nextStep);
    if (route) {
      router.push(route);
      return;
    }
  }

  router.push("/onboarding/physical");
}, 2000);
      } else {
        setStep("success");

        setTimeout(() => {
          router.push("/onboarding/physical");
        }, 1500);
      }
    } catch (err) {
      console.error("Liveness error:", err);

      const errorCode =
        err.response?.data?.error_code ||
        err.response?.data?.message;

      if (errorCode === "LIVENESS_FAILED") {
        setError(
          "Face verification failed. Ensure good lighting and keep your face centered."
        );
      } else {
        setError("Verification failed. Please try again.");
      }

      setStep("capture");

      setTimeout(() => startCamera(), 400);
    } finally {
      setLoading(false);
    }
  };

  // Success

  useEffect(() => {
    const fetchSuccessScreen = async () => {
      try {
        const res = await kycService.getScreenConfig("kyc_success");
  
        const screen = res?.data?.data?.screen;
  
        setSuccessConfig(screen);
      } catch (err) {
        console.error("KYC success config error:", err);
      }
    };
  
    fetchSuccessScreen();
  }, []);

  /* =========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">


      <div className="max-w-md w-full text-center mb-3 bg-gray-900/50 p-6 rounded-2xl">

        {/* TITLE SECTION */}
        <h2 className="text-2xl font-bold text-white">
          {introConfig?.title || "Face Verification"}
          </h2>
          {introConfig?.subtitle && (
         <p className="text-gray-400 text-sm mt-2">
          {introConfig.subtitle}
         </p>
         )}

      {introConfig?.description && (
        <p className="text-gray-500 text-xs mt-2 mb-6">
       {introConfig.description}
     </p>
      )}

        <div className="text-center ">
         

         

          
        </div>

       {/* CAPTURE STEP */}

{step === "capture" && (
  <div className="flex flex-col items-center text-center">

         <h1 className="text-xl font-Playfair Display font-bold text-white mb-8">
            {screenConfig?.title}
         </h1>

    {/* Face Circle Frame */}
    <div className="relative w-72 h-72 rounded-full overflow-hidden border border-blue-400/30">

      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Blue Overlay */}
      <div className="absolute inset-0 bg-blue-900/30"></div>

      {/* Moving Scan Line */}
      <div className="absolute left-0 right-0 h-[3px] bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-scan"></div>

    </div>

    <canvas ref={canvasRef} className="hidden" />

    {/* Button from API */}
    <button
      onClick={capture}
      className="mt-14 w-full max-w-sm py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold"
    >
      {screenConfig?.button_text?.primary || "Capture"}
    </button>

  </div>
)}    


  {/* REVIEW STEP */}

{step === "review" && (
  <div className="flex flex-col items-center text-center">

    {/* Title from API */}
    

    {/* Circular Selfie Preview */}
    <div className="relative w-72 h-72 rounded-full overflow-hidden border border-blue-400/30 mb-8">

      <img
        src={selfie}
        alt="Selfie preview"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Optional overlay */}
      <div className="absolute inset-0 bg-blue-900/20"></div>

    </div>

    {error && (
      <p className="text-red-400 text-sm text-center mb-4">
        {error}
      </p>
    )}

    {/* Buttons */}
    <div className="flex gap-4 w-full max-w-sm">

      {/* Retake */}
      <button
        onClick={() => {
          setStep("capture");
          setError("");

          setTimeout(() => startCamera(), 300);
        }}
        disabled={loading}
        className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-full"
      >
        {screenConfig?.button_text?.retake || "Retake"}
      </button>

      {/* Verify */}
      <button
        onClick={verify}
        disabled={loading}
        className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white font-semibold"
      >
        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          screenConfig?.button_text?.primary || "Verify"
        )}
      </button>

    </div>

  </div>
)}
        {/* SUCCESS STEP */}

        {step === "success" && (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">

    {/* Back Button */}
    <button
      onClick={() => router.back()}
      className="absolute left-6 top-6 text-white text-2xl"
    >
      ←
    </button>

    {/* Congrats Badge */}
    <div className="mb-8">
      <div className="text-orange-400 font-bold text-xl relative">
        <span className="absolute inset-0 flex items-center justify-center text-purple-500 text-5xl opacity-40">
          ✦
        </span>

        <span className="relative text-orange-400 text-lg tracking-widest">
          CONGRATS
        </span>
      </div>
    </div>

    {/* Title */}
    <h1 className="text-4xl font-Playfair Display font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
      {successConfig?.title || "Congratulations!"}
    </h1>

    {/* Subtitle */}
    <p className="text-gray-400 text-lg max-w-sm">
      {successConfig?.subtitle ||
        "Your account has been verified successfully."}
    </p>

  </div>
)}
      </div>
    </div>
  );
}