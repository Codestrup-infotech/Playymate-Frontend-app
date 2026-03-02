"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user";
import { authService } from "@/services/auth";
import { getRouteFromStep } from "@/lib/api/navigation";
import { getOnboardingRedirect } from "@/lib/onboarding/stateMachine";

/**
 * Home Page Component
 * Main landing page after successful login
 * Displays onboarding progress and redirects to appropriate step if incomplete
 */
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingState, setOnboardingState] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(100);
  const [error, setError] = useState(null);

  // Progress percentage calculation based on onboarding state
  const calculateProgress = (state) => {
    const progressMap = {
      'INIT': 0,
      'PHONE_VERIFIED': 5,
      'EMAIL_VERIFIED': 10,
      'BASIC_ACCOUNT_CREATED': 15,
      'GENDER_CAPTURED': 20,
      'DOB_CAPTURED': 30,
      'PARENT_CONSENT_PENDING': 25,
      'PARENT_CONSENT_APPROVED': 35,
      'LOCATION_CAPTURED': 40,
      'PROFILE_PHOTO_CAPTURED': 50,
      'ACTIVITY_INTENT_CAPTURED': 55,
      'PROFILE_DETAILS_CAPTURED': 60,
      'AADHAAR_VERIFIED': 70,
      'FACE_LIVENESS_PASSED': 75,
      'KYC_COMPLETED': 80,
      'PHYSICAL_PROFILE_CONSENT': 82,
      'PHYSICAL_PROFILE_COMPLETED': 85,
      'QUESTIONNAIRE_STARTED': 87,
      'QUESTIONNAIRE_COMPLETED': 90,
      'EXTENDED_PROFILE_INTRO': 92,
      'EXTENDED_PROFILE_PENDING': 95,
      'EXTENDED_PROFILE_COMPLETED': 100,
      'COMPLETED': 100,
      'ACTIVE_USER': 100
    };
    return progressMap[state] || 0;
  };

  // Get current step label based on onboarding state
  const getCurrentStepLabel = (state) => {
    const stepLabels = {
      'INIT': 'Get Started',
      'PHONE_VERIFIED': 'Phone Verification',
      'EMAIL_VERIFIED': 'Email Verification',
      'BASIC_ACCOUNT_CREATED': 'Name',
      'GENDER_CAPTURED': 'Gender',
      'DOB_CAPTURED': 'Date of Birth',
      'PARENT_CONSENT_PENDING': 'Parent Consent',
      'PARENT_CONSENT_APPROVED': 'Location',
      'LOCATION_CAPTURED': 'Profile Photo',
      'PROFILE_PHOTO_CAPTURED': 'Activity Intent',
      'ACTIVITY_INTENT_CAPTURED': 'Profile Details',
      'PROFILE_DETAILS_CAPTURED': 'KYC Verification',
      'AADHAAR_VERIFIED': 'Face Liveness',
      'FACE_LIVENESS_PASSED': 'KYC Complete',
      'KYC_COMPLETED': 'Physical Profile',
      'PHYSICAL_PROFILE_CONSENT': 'Physical Profile Consent',
      'PHYSICAL_PROFILE_COMPLETED': 'Questionnaire',
      'QUESTIONNAIRE_STARTED': 'Questionnaire',
      'QUESTIONNAIRE_COMPLETED': 'Extended Profile',
      'EXTENDED_PROFILE_INTRO': 'Extended Profile',
      'EXTENDED_PROFILE_PENDING': 'Extended Profile',
      'EXTENDED_PROFILE_COMPLETED': 'Complete!',
      'COMPLETED': 'Complete!',
      'ACTIVE_USER': 'Home'
    };
    return stepLabels[state] || 'Onboarding';
  };

  // Check onboarding status and redirect if incomplete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const accessToken = authService.getAccessToken();
        
        if (!accessToken) {
          // No token, redirect to login
          router.push('/login');
          return;
        }

        // Fetch user profile and onboarding status
        const response = await userService.getOnboardingStatus();
        const data = response?.data?.data || response?.data || {};
        
        const state = data.onboarding_state;
        const nextStep = data.next_required_step;
        
        console.log('Home page - Onboarding status:', { state, nextStep, data });
        
        setOnboardingState(state);
        setProgressPercentage(calculateProgress(state));
        
        // Check if onboarding is incomplete
        if (state && state !== 'COMPLETED' && state !== 'ACTIVE_USER') {
          // Onboarding incomplete - redirect to appropriate step
          // First try next_required_step
          if (nextStep && typeof nextStep === 'string') {
            const route = getRouteFromStep(nextStep);
            if (route && route !== '/onboarding/home') {
              console.log('Redirecting to incomplete onboarding step:', route);
              router.push(route);
              return;
            }
          }
          
          // Fallback to state-based redirect if nextStep is invalid
          const stateRoute = getOnboardingRedirect(state);
          if (stateRoute && stateRoute !== '/onboarding/home') {
            console.log('Home: Falling back to state-based redirect:', state, '->', stateRoute);
            router.push(stateRoute);
            return;
          }
        }
        
        // Set user data
        setUser(data);
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        // If error, try to continue to home
        setError('Unable to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  // Handle continue button click
  const handleContinue = () => {
    if (onboardingState && onboardingState !== 'COMPLETED' && onboardingState !== 'ACTIVE_USER') {
      // Redirect to next incomplete step
      const route = getRouteFromStep(onboardingState);
      if (route && route !== '/onboarding/home') {
        router.push(route);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('playymate_access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('playymate_refresh_token');
    localStorage.removeItem('onboarding_state');
    localStorage.removeItem('onboarding_resume_data');
    localStorage.removeItem('progress_percentage');
    localStorage.removeItem('user_id');
    localStorage.removeItem('current_step');
    sessionStorage.removeItem('auth_flow_id');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('phone');
    
    router.push('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Playymate</h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">👋</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome{user?.full_name ? `, ${user.full_name}` : ''}!
          </h2>
          <p className="text-gray-400">
            {progressPercentage === 100 
              ? "You're all set! Enjoy using Playymate."
              : "Complete your profile to get started."
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Progress Card */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Onboarding Progress</h3>
            <span className="text-pink-500 font-bold">{progressPercentage}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Current Step */}
          <p className="text-gray-400 text-sm">
            {progressPercentage === 100 
              ? "All steps completed!" 
              : `Current step: ${getCurrentStepLabel(onboardingState)}`
            }
          </p>
          
          {/* Continue Button */}
          {progressPercentage < 100 && (
            <button
              onClick={handleContinue}
              className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg font-semibold"
            >
              Continue Onboarding
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {progressPercentage === 100 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm text-gray-400">Profile Verified</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-sm text-gray-400">Ready to Play</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
