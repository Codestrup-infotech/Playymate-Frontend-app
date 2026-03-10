"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { kycService } from '@/services/kyc';
import { getErrorMessage } from '@/lib/api/errorMap';

export default function KYCCompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    completeKYC();
  }, []);

  const completeKYC = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await kycService.completeKYC();
      
      const result = response?.data?.data;
      
      if (result?.status === 'COMPLETED' || result?.onboarding_state === 'KYC_COMPLETED') {
        // KYC is complete, move to next step
        setLoading(false);
      } else {
        setError('Could not complete KYC');
      }
    } catch (err) {
      const errorCode = err.response?.data?.error_code;
      const message = getErrorMessage(errorCode) || 'Failed to complete KYC';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to questionnaire or home based on next_required_step
    // For now, redirect to home
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-pink-500 animate-spin mb-4" />
          <p className="text-lg">Completing verification...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="text-xl font-semibold">Something went wrong</p>
          <p className="text-sm text-gray-400 mt-2">{error}</p>
          <button
            onClick={completeKYC}
            className="mt-6 w-full py-4 rounded-full font-Poppins font-semibold
                     bg-gradient-to-r from-pink-500 to-orange-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Content */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-Playfair Display font-bold">
            Verification
            <span className="block bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Complete!
            </span>
          </h1>
          
          <p className="mt-4 text-gray-300 text-lg">
            Your identity has been verified successfully
          </p>

          <p className="mt-2 text-gray-500 text-sm">
            Welcome to Playymate! Let's set up your profile
          </p>

          {/* Next steps info */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">What's next?</h3>
            <ul className="text-sm text-gray-400 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">1</span>
                Select your interests
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">2</span>
                Answer some questions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">3</span>
                Start matching!
              </li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            className="mt-8 w-full py-4 rounded-full font-Poppins font-semibold
                     bg-gradient-to-r from-pink-500 to-orange-400
                     flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
