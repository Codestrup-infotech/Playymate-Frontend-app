"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  User
} from "lucide-react";
import { kycService } from "@/services/kyc";

// AWS Amplify UI for Face Liveness
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react-liveness/styles.css';

/**
 * FaceLivenessModal Component
 * 
 * Implements AWS Rekognition Stream-based Face Liveness verification
 * using AWS Amplify UI component.
 * 
 * Flow:
 * 1. Creates a liveness session via API
 * 2. Uses AWS Amplify FaceLivenessDetector to capture video
 * 3. Verifies the session with the backend
 */
export default function FaceLivenessModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onError 
}) {
  const [step, setStep] = useState("initializing"); // initializing, ready, verifying, success, error
  const [sessionData, setSessionData] = useState(null); // { sessionId, credentials, region }
  const [error, setError] = useState(null);

  const AWS_REGION = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1") 
    : "ap-south-1";

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeLiveness();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep("initializing");
    setSessionData(null);
    setError(null);
  };

  const initializeLiveness = async () => {
    try {
      setStep("initializing");
      setError(null);

      console.log("Creating liveness session for profile modal...");

      // Create liveness session with AWS Rekognition
      const response = await kycService.createLivenessSession();
      
      console.log("Session created:", response.data);

      if (response.data.status === "success") {
        // Store the whole payload including credentials
        setSessionData(response.data.data);
        setStep("ready");
      } else {
        throw new Error(response.data.message || "Failed to create liveness session");
      }
    } catch (err) {
      console.error("Failed to create liveness session:", err);
      setError(err.response?.data?.message || "Failed to initialize face verification");
      setStep("error");
    }
  };

  const handleAnalysisComplete = async () => {
    console.log("Video capture complete, verifying...");
    
    try {
      setStep("verifying");
      
      // Verify the liveness session
      const response = await kycService.verifyLivenessSession(sessionData.sessionId);

      console.log("Verification response:", response.data);

      if (response.data.status === "success") {
        setStep("success");
        onSuccess?.(response.data);
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
      onError?.(err);
    }
  };

  const handleAmplifyError = (err) => {
    console.error("AWS Amplify Error:", err);
    setError(err.message || "An error occurred during face verification");
    setStep("error");
    onError?.(err);
  };

  const handleRetry = () => {
    resetState();
    initializeLiveness();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Face Liveness Verification</h3>
          <button 
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Initializing State */}
          {step === "initializing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Initializing face verification...</p>
            </div>
          )}

          {/* Ready State - AWS Amplify FaceLivenessDetector */}
          {step === "ready" && sessionData && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm text-center mb-4">
                Position your face within the frame and follow the instructions
              </p>
              
              <div className="w-full rounded-xl overflow-hidden">
                <FaceLivenessDetector
                  sessionId={sessionData.sessionId}
                  region={sessionData.region || AWS_REGION}
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleAmplifyError}
                  // Pass temporary AWS credentials from backend
                  credentialProvider={async () => ({
                    accessKeyId: sessionData.credentials.accessKeyId,
                    secretAccessKey: sessionData.credentials.secretAccessKey,
                    sessionToken: sessionData.credentials.sessionToken,
                    expiration: new Date(sessionData.credentials.expiration),
                  })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Verifying State */}
          {step === "verifying" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white font-medium mb-2">Verifying...</p>
              <p className="text-gray-400 text-sm text-center">
                Analyzing your video for liveness verification
              </p>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Verification Successful!</h4>
              <p className="text-gray-400 text-sm text-center mb-6">
                Your face liveness has been verified successfully.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* Error State */}
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
                  onClick={handleClose}
                  className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
