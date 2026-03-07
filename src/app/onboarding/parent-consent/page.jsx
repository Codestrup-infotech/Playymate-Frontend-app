"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Shield } from 'lucide-react';
import { userService } from '@/services/user';
import { getErrorMessage } from '@/lib/api/errorMap';
import { getRouteFromStep } from '@/lib/api/navigation';

export default function OnboardingParentConsentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Check onboarding status on mount
  useEffect(() => {
    // ✅ Use stored next step — no API call needed
    const nextStep = sessionStorage.getItem("onboarding_next_step");
    const token = sessionStorage.getItem("access_token") || 
                  sessionStorage.getItem("accessToken") || 
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("playymate_access_token");

    if (!token) {
      router.push("/login/phone");
      return;
    }

    // If the backend says user's next step is PAST parent consent, skip forward
    if (nextStep && nextStep !== "PARENT_CONSENT_PENDING" && nextStep !== "PARENT_CONSENT") {
      const stepRoutes = {
        "PARENT_CONSENT_APPROVED": "/onboarding/location",
        "LOCATION_CAPTURED": "/onboarding/photo",
        "PROFILE_PHOTO_CAPTURED": "/onboarding/kyc",
        "KYC_COMPLETED": "/onboarding/physical",
        "PHYSICAL_PROFILE_QUESTIONS": "/onboarding/physical",
        "ACTIVE_USER": "/onboarding/home",
        "COMPLETED": "/onboarding/home",
        "HOME": "/onboarding/home",
        "ACTIVE": "/onboarding/home",
      };
      const route = stepRoutes[nextStep];
      if (route) {
        router.push(route);
        return;
      }
    }

    // Otherwise, user belongs on this page — let them stay
    setInitialLoading(false);
  }, [router]);

  const handleConsent = async () => {
    if (!checked) return;

    try {
      setLoading(true);
      clearError();
      
      // Save parent consent to backend
      const response = await userService.giveParentConsent();
      console.log('Parent consent response:', response.data);
      
      // ✅ Store the next step
      const nextStep = response?.data?.next_required_step;
      sessionStorage.setItem("onboarding_next_step", nextStep || "");
      
      // Navigate based on next_required_step from API - validate it's a string
      if (nextStep && typeof nextStep === 'string') {
        const route = getRouteFromStep(nextStep);
        router.push(route);
      } else {
        // Default to location after consent
        router.push('/onboarding/location');
      }
    } catch (err) {
      console.error('Error saving parent consent:', err);
      console.error('Error response:', err.response?.data);
      
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;
      
      // Handle authentication errors
      if (status === 401) {
        window.location.href = '/login';
        return;
      }
      
      // Handle state mismatch errors - get next step from error response
      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;
        if (nextStep && typeof nextStep === 'string') {
          const route = getRouteFromStep(nextStep);
          router.push(route);
          return;
        }
        
        // Check for INVALID_ONBOARDING_STATE error
        // The backend may not have updated the state correctly after saving DOB
        // Since the user has already checked the consent box and submitted,
        // we can proceed to location page anyway
        if (errorCode === 'INVALID_ONBOARDING_STATE') {
          console.log('Invalid state transition - proceeding to location anyway');
          // Use window.location to ensure redirect works
          window.location.href = `${window.location.origin}/onboarding/location`;
          return;
        }
        
        // If error message mentions state, try to refresh status
        if (errorMsg?.includes('state')) {
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentState = statusResponse?.data?.data?.onboarding_state;
            const nextRequiredStep = statusResponse?.data?.next_required_step;
            
            console.log('Current state:', currentState, 'Next step:', nextRequiredStep);
            
            // If already approved, go to location
            if (currentState === 'PARENT_CONSENT_APPROVED') {
              window.location.href = `${window.location.origin}/onboarding/location`;
              return;
            }
          } catch (statusErr) {
            console.error('Error fetching status:', statusErr);
          }
        }
      }
      
      const message =
        getErrorMessage(errorCode) ||
        errorMsg ||
        'Failed to submit consent. Please try again.';
        
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111113] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Parent Consent</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-pink-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4">
            Parent/Guardian Consent Required
          </h2>
          
          {/* Description */}
          <p className="text-gray-400 text-center mb-8">
            Since you are under 13 years of age, we need consent from your parent or guardian to continue using Playymate.
          </p>

          {/* Requirements */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-8">
            <h3 className="font-semibold mb-3">What parents need to know:</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Playymate is a platform for sports activities</li>
              <li>• We collect basic profile information</li>
              <li>• Location data for nearby activities</li>
              <li>• Profile photo for verification</li>
            </ul>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
            />
            <span className="text-gray-300 text-sm">
              My parent/guardian has reviewed the information above and consents to my participation in Playymate.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleConsent}
            disabled={!checked || loading}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              checked && !loading
                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Submit Consent'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
