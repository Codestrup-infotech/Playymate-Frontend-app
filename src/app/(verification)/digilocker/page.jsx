"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { kycService } from '@/services/kyc';
import { getErrorMessage } from '@/lib/api/errorMap';

export default function DigiLockerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState('init'); // init | checking | redirecting | polling | success | failed
  const [verificationId, setVerificationId] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingInterval = useRef(null);

  const MAX_POLLING_COUNT = 40; // 40 * 3s = 120 seconds max

  const clearError = () => setError(null);

  // Handle redirect back from DigiLocker
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      startPolling();
    } else if (status === 'failed') {
      setStep('failed');
      setError('DigiLocker verification was not completed');
    }
  }, [searchParams]);

  const handleAccountCheck = async () => {
    if (!mobileNumber) {
      setError('Please enter your mobile number');
      return;
    }

    try {
      setLoading(true);
      clearError();

      const response = await kycService.digilockerAccountCheck(
        null, // verificationId will be created by backend
        mobileNumber,
        aadhaarNumber || null
      );

      const vid = response?.data?.data?.verification_id;
      if (vid) {
        setVerificationId(vid);
        await handleCreateUrl(vid);
      } else {
        setError('Failed to create verification session');
      }
    } catch (err) {
      const errorCode = err.response?.data?.error_code;
      const message = getErrorMessage(errorCode) || 'Failed to verify account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUrl = async (vid) => {
    try {
      setLoading(true);
      clearError();

      const redirectUrl = `${window.location.origin}/verification/digilocker`;
      const response = await kycService.digilockerCreateUrl(
        vid,
        ['aadhaar'],
        redirectUrl,
        'verification'
      );

      const consentUrl = response?.data?.data?.consent_url;
      if (consentUrl) {
        setStep('redirecting');
        // Redirect to DigiLocker
        window.location.href = consentUrl;
      } else {
        // Some backends return status directly
        const status = response?.data?.data?.status;
        if (status === 'AUTHENTICATED') {
          setStep('success');
        } else {
          setError('Failed to get consent URL');
        }
      }
    } catch (err) {
      const errorCode = err.response?.data?.error_code;
      const message = getErrorMessage(errorCode) || 'Failed to create consent URL';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = async () => {
    if (!verificationId) {
      // Try to get from URL params
      const vid = searchParams.get('verification_id');
      if (vid) {
        setVerificationId(vid);
      } else {
        // If no verification ID, go back to init
        setStep('init');
        return;
      }
    }

    setStep('polling');
    setPollingCount(0);

    pollingInterval.current = setInterval(async () => {
      try {
        const response = await kycService.digilockerStatus(verificationId);
        const status = response?.data?.data?.status;

        if (status === 'AUTHENTICATED') {
          clearInterval(pollingInterval.current);
          setStep('success');
        } else if (status === 'FAILED') {
          clearInterval(pollingInterval.current);
          setStep('failed');
          setError('DigiLocker verification failed');
        } else if (pollingCount >= MAX_POLLING_COUNT) {
          clearInterval(pollingInterval.current);
          setStep('failed');
          setError('Verification timed out. Please try again.');
        }

        setPollingCount((prev) => prev + 1);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleRetry = () => {
    clearInterval(pollingInterval.current);
    setStep('init');
    setVerificationId(null);
    setError(null);
    setPollingCount(0);
  };

  const handleTimeout = () => {
    setStep('init');
    setVerificationId(null);
    setError('You can try again later');
    setPollingCount(0);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

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
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[90%]" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-Playfair Display font-bold">
              Aadhaar
              <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Verification
              </span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Verify your identity using DigiLocker
            </p>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Step: Init - Account Check */}
          {step === 'init' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    clearError();
                  }}
                  placeholder="Enter mobile number"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 
                           text-white placeholder:text-gray-500 focus:border-pink-500 
                           focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400">Aadhaar Number (Optional)</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="Enter Aadhaar number"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 
                           text-white placeholder:text-gray-500 focus:border-pink-500 
                           focus:outline-none"
                />
              </div>

              <button
                onClick={handleAccountCheck}
                disabled={loading || !mobileNumber}
                className="w-full py-4 rounded-full font-Poppins font-semibold
                         bg-gradient-to-r from-pink-500 to-orange-400 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Continue with DigiLocker
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Redirecting */}
          {step === 'redirecting' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-pink-500 animate-spin mb-4" />
              <p className="text-lg">Redirecting to DigiLocker...</p>
              <p className="text-sm text-gray-400 mt-2">Please complete verification on DigiLocker</p>
            </div>
          )}

          {/* Step: Polling */}
          {step === 'polling' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-pink-500 animate-spin mb-4" />
              <p className="text-lg">Verifying your details...</p>
              <p className="text-sm text-gray-400 mt-2">
                Please wait ({pollingCount * 3}s / 120s)
              </p>
              <button
                onClick={handleTimeout}
                className="mt-4 text-pink-400 text-sm"
              >
                This is taking too long
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-xl font-semibold">Verification Successful!</p>
              <p className="text-sm text-gray-400 mt-2">Your Aadhaar has been verified</p>
              <button
                onClick={() => router.push('/verification/liveness')}
                className="mt-6 w-full py-4 rounded-full font-Poppins font-semibold
                         bg-gradient-to-r from-pink-500 to-orange-400"
              >
                Continue to Face Verification
              </button>
            </div>
          )}

          {/* Step: Failed */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-xl font-semibold">Verification Failed</p>
              <p className="text-sm text-gray-400 mt-2">{error || 'Please try again'}</p>
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
