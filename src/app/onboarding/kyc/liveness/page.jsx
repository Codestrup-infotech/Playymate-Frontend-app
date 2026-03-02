"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";

export default function LivenessPage() {
  const router = useRouter();

  const [step, setStep] = useState("capture");
  const [selfie, setSelfie] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, []);

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

        await kycService.faceLiveness(file_url);

        const complete = await kycService.completeKYC();
        const nextStep = complete?.data?.next_required_step;

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
        setTimeout(() => {
          setStep("success");
          router.push("/onboarding/physical");
        }, 2000);
      }
    } catch (err) {
      console.error("Liveness verification error:", err);
      
      // Get more specific error message from response
      const errorMessage = err.response?.data?.message || err.response?.data?.error_code;
      
      if (errorMessage === 'LIVENESS_FAILED' || errorMessage?.includes('Liveness')) {
        setError("Liveness check failed. Please try again with a clearer photo, better lighting, and ensure your face is centered.");
      } else if (err.response?.status === 400) {
        setError("Verification failed. Please try again with a clearer photo.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please start the process again.");
      } else {
        setError("Face verification failed. Please try again.");
      }
      
      // Go back to capture to allow retry
      setStep("capture");
      // Restart camera
      setTimeout(() => startCamera(), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

        {step === "capture" && (
          <>
            <video ref={videoRef} autoPlay className="rounded-xl mb-4" />
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capture}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" /> Capture
            </button>
          </>
        )}

        {step === "review" && (
          <>
            <img src={selfie} className="rounded-xl mb-4" />
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 mb-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
                <p className="text-red-400/70 text-xs text-center mt-2">
                  Tips: Use good lighting, keep your face centered, and ensure the photo is clear.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("capture");
                  setError("");
                  setTimeout(() => startCamera(), 300);
                }}
                disabled={loading}
                className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Retake Photo
              </button>
              <button
                onClick={verify}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Again"}
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white">KYC Completed Successfully</p>
          </div>
        )}
      </div>
    </div>
  );
}