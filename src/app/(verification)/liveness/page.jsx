"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Face, ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, Camera, RefreshCw } from 'lucide-react';
import { kycService } from '@/services/kyc';
import { getErrorMessage } from '@/lib/api/errorMap';

export default function FaceLivenessPage() {
  const router = useRouter();
  const [step, setStep] = useState('init'); // init | capturing | verifying | success | failed
  const [imageUrl, setImageUrl] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const clearError = () => setError(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setStep('captured');
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setStep('init');
    clearError();
  };

  const handleVerify = async () => {
    if (!capturedImage) {
      setError('Please capture an image first');
      return;
    }

    // IMPORTANT: Never reuse the same image_url across attempts
    // The backend will generate a unique challenge for each verification

    try {
      setLoading(true);
      clearError();
      setStep('verifying');

      // Upload captured image to get a URL (you might need to implement this)
      // For now, we'll send the base64 as a data URL
      // In production, you'd upload to cloud storage and get a signed URL
      
      const response = await kycService.faceLiveness(capturedImage);
      
      const result = response?.data?.data;
      
      if (result?.status === 'VERIFIED' || result?.verified === true) {
        setStep('success');
      } else if (result?.status === 'FAILED' || result?.verified === false) {
        setStep('failed');
        setError(result?.message || 'Face verification failed. Please try again.');
      } else {
        // Handle pending or other statuses
        setStep('failed');
        setError('Verification could not be completed');
      }
    } catch (err) {
      const errorCode = err.response?.data?.error_code;
      const message = getErrorMessage(errorCode) || 'Face verification failed';
      setError(message);
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('init');
    setCapturedImage(null);
    setError(null);
    startCamera();
  };

  const handleContinue = () => {
    // Navigate to KYC complete page
    router.push('/verification/complete');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[95%]" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
              <Face className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-Playfair Display font-bold">
              Face
              <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Verification
              </span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Complete face verification for identity confirmation
            </p>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera View */}
          {(step === 'init' || step === 'captured') && (
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-900">
                {step === 'init' ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full border-2 border-white/30" />
                    </div>
                  </>
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Canvas for capture (hidden) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera controls */}
              <div className="flex justify-center mt-4">
                {step === 'init' ? (
                  <button
                    onClick={captureImage}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 
                             flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={retakeImage}
                      className="px-6 py-3 rounded-full bg-white/10 border border-white/20
                               flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Retake
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={loading}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400
                               disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {step === 'init' && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Position your face within the circle
                </p>
              )}
            </div>
          )}

          {/* Verifying */}
          {step === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-pink-500 animate-spin mb-4" />
              <p className="text-lg">Verifying your face...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we verify your identity</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-xl font-semibold">Face Verified!</p>
              <p className="text-sm text-gray-400 mt-2">Your identity has been confirmed</p>
              <button
                onClick={handleContinue}
                className="mt-6 w-full py-4 rounded-full font-Poppins font-semibold
                         bg-gradient-to-r from-pink-500 to-orange-400"
              >
                Continue
              </button>
            </div>
          )}

          {/* Failed */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-xl font-semibold">Verification Failed</p>
              <p className="text-sm text-gray-400 mt-2">{error || 'Please try again with better lighting'}</p>
              <button
                onClick={handleRetry}
                className="mt-6 w-full py-4 rounded-full font-Poppins font-semibold
                         bg-gradient-to-r from-pink-500 to-orange-400"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
