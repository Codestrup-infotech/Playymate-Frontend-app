"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";

// AWS Amplify UI for Face Liveness
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react-liveness/styles.css';

export default function LivenessPage() {
  const router = useRouter();

  const [step, setStep] = useState("initializing"); // initializing, ready, verifying, success, error
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [screenConfig, setScreenConfig] = useState(null);

  const DEV_MODE = process.env.NEXT_PUBLIC_KYC_DEV_MODE === "true";
  const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";

  /* =========================================================
     LOAD SCREEN CONFIG (Dynamic UI)
  ========================================================== */

  useEffect(() => {
    const fetchScreenConfig = async () => {
      try {
        const res = await kycService.getScreenConfig(
          "face_verification_intro"
        );

        setScreenConfig(res?.data?.data);
      } catch (err) {
        console.error("Screen config error:", err);
      }
    };

    fetchScreenConfig();
  }, []);

  /* =========================================================
     INITIALIZE LIVENESS SESSION
  ========================================================== */

  useEffect(() => {
    initializeLiveness();
  }, []);

  const initializeLiveness = async () => {
    try {
      setStep("initializing");
      setError("");

      console.log("Creating AWS Rekognition liveness session...");

      // Create liveness session with AWS Rekognition
      const response = await kycService.createLivenessSession();

      console.log("Session response:", response.data);

      if (response.data.status === "success") {
        setSessionId(response.data.data.sessionId);
        setStep("ready");
      } else {
        throw new Error(response.data.message || "Failed to create liveness session");
      }
    } catch (err) {
      console.error("Failed to create liveness session:", err);
      setError(err.response?.data?.message || err.message || "Failed to initialize face verification");
      setStep("error");
    }
  };

  /* =========================================================
     HANDLE LIVENESS ANALYSIS COMPLETE
     This is called by AWS Amplify when video analysis is done
  ========================================================== */

  const handleAnalysisComplete = async () => {
    console.log("Video capture complete, verifying session...");
    
    try {
      setStep("verifying");

      // Verify the liveness session with the backend
      const response = await kycService.verifyLivenessSession(sessionId);

      console.log("Verification response:", response.data);

      if (response.data.status === "success") {
        setStep("success");

        // Check for next step in onboarding
        const nextStep = response.data.next_required_step;

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
        throw new Error(response.data.message || "Liveness verification failed");
      }
    } catch (err) {
      console.error("Liveness verification error:", err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error_code ||
                          "Face verification failed. Please try again.";
      setError(errorMessage);
      setStep("error");
    }
  };

  /* =========================================================
     HANDLE ERRORS FROM AWS AMPLIFY
  ========================================================== */

  const handleError = (err) => {
    console.error("AWS Amplify Liveness Error:", err);
    setError(err.message || "An error occurred during face verification");
    setStep("error");
  };

  /* =========================================================
     RETRY
  ========================================================== */

  const handleRetry = () => {
    setError("");
    setSessionId(null);
    setStep("initializing");
    initializeLiveness();
  };

  /* =========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/50 p-6 rounded-2xl">

        {/* TITLE SECTION */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {screenConfig?.title || "Face Liveness Verification"}
          </h2>

          {screenConfig?.subtitle && (
            <p className="text-gray-400 text-sm mt-2">
              {screenConfig.subtitle}
            </p>
          )}

          {screenConfig?.description && (
            <p className="text-gray-500 text-xs mt-2">
              {screenConfig.description}
            </p>
          )}
        </div>

        {/* INITIALIZING STATE */}
        {step === "initializing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Initializing face verification...</p>
          </div>
        )}

        {/* READY STATE - AWS AMPLIFY LIVENESS DETECTOR */}
        {step === "ready" && sessionId && (
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-400 text-sm text-center mb-4">
              Position your face within the frame and follow the instructions
            </p>
            
            <div className="w-full rounded-xl overflow-hidden" style={{ maxWidth: '400px' }}>
              <FaceLivenessDetector
                sessionId={sessionId}
                region={AWS_REGION}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
                // Styling props
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* VERIFYING STATE */}
        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-white font-medium mb-2">Verifying...</p>
            <p className="text-gray-400 text-sm text-center">
              Analyzing your video for liveness verification
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Verification Successful!</h4>
            <p className="text-gray-400 text-sm text-center">
              Your face liveness has been verified successfully.
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-24 h-24 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Verification Failed</h4>
            <p className="text-gray-400 text-sm text-center mb-2">
              {error || "An error occurred during verification."}
            </p>
            <p className="text-gray-500 text-xs text-center mb-6">
              Tips: Use good lighting, keep your face centered, and ensure your face is clearly visible.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => router.back()}
                className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl text-white font-medium flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
