"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/services/user";
import { authService } from "@/services/auth";
import { getRouteFromStep } from "@/lib/api/navigation";
import { getOnboardingRedirect } from "@/lib/onboarding/stateMachine";

const FACEBOOK_APP_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "your-facebook-app-id";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api-dev.playymate.com/api/v1";

export default function LoginPage() {
  const router = useRouter();

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

  /* ================= CHECK IF ALREADY LOGGED IN ================= */
  useEffect(() => {
    const checkExistingSession = async () => {
      const accessToken = authService.getAccessToken();
      
      if (accessToken) {
        try {
          // User has token, check their onboarding status
          const response = await userService.getOnboardingStatus();
          const data = response?.data?.data || response?.data || {};
          const nextStep = data.next_required_step;
          const onboardingState = data.onboarding_state;
          
          console.log('Already logged in - checking status:', { nextStep, onboardingState });
          
          // If user is completed, go to home
          if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
            router.push('/onboarding/home');
            return;
          }
          
          // If user has valid next step, redirect to their current step
          if (nextStep && typeof nextStep === 'string') {
            const route = getRouteFromStep(nextStep);
            if (route && route !== '/login' && route !== '/') {
              router.push(route);
              return;
            }
          }
          
          // Fallback: Use state-based redirect if nextStep is invalid
          if (onboardingState && onboardingState !== 'INIT') {
            const stateRoute = getOnboardingRedirect(onboardingState);
            if (stateRoute && stateRoute !== '/login') {
              console.log('Login: Falling back to state-based redirect:', onboardingState, '->', stateRoute);
              router.push(stateRoute);
              return;
            }
          }
          
          // Default to home or onboarding
          router.push('/onboarding/home');
        } catch (err) {
          console.error('Error checking session:', err);
          // Token might be invalid, continue to login
        }
      }
    };
    
    checkExistingSession();
  }, [router]);

  /* ================= GOOGLE LOGIN ================= */

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoadingGoogle(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const res = await axios.post(`${API_URL}/auth/social/google`, {
        id_token: idToken,
      });

      const { accessToken, refreshToken, auth_flow_id } =
        res?.data?.data || {};

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        // Check onboarding status and redirect accordingly
        try {
          const statusRes = await axios.get(`${API_URL}/users/onboarding/status`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const statusData = statusRes?.data?.data || {};
          const nextStep = statusData.next_required_step;
          const onboardingState = statusData.onboarding_state;
          
          if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
            router.push('/onboarding/home');
          } else if (nextStep && typeof nextStep === 'string') {
            const route = getRouteFromStep(nextStep);
            if (route && route !== '/login' && route !== '/') {
              router.push(route);
            } else if (onboardingState) {
              // Fallback to state-based redirect
              const stateRoute = getOnboardingRedirect(onboardingState);
              if (stateRoute && stateRoute !== '/login') {
                router.push(stateRoute);
              } else {
                router.push('/onboarding/home');
              }
            }
          } else if (onboardingState) {
            // Fallback to state-based redirect
            const stateRoute = getOnboardingRedirect(onboardingState);
            if (stateRoute && stateRoute !== '/login') {
              router.push(stateRoute);
            } else {
              router.push('/onboarding/home');
            }
          } else {
            router.push('/onboarding/home');
          }
        } catch (e) {
          router.push('/');
        }
      } else if (auth_flow_id) {
        router.push("/onboarding/name");
      }
    } catch (error) {
      console.error("Google login error:", error?.response?.data || error);
      alert("Google Login Failed. Please try again.");
    } finally {
      setIsLoadingGoogle(false);
    }
  }, [router]);

  /* ================= FACEBOOK LOGIN ================= */

  const handleFacebookLogin = useCallback(
    async (response) => {
      if (!response?.authResponse?.accessToken) return;

      try {
        setIsLoadingFacebook(true);

        const res = await axios.post(`${API_URL}/auth/social/facebook`, {
          token: response.authResponse.accessToken,
        });

        const { accessToken, refreshToken, auth_flow_id } =
          res?.data?.data || {};

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          
          // Check onboarding status and redirect accordingly
          try {
            const statusRes = await axios.get(`${API_URL}/users/onboarding/status`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const statusData = statusRes?.data?.data || {};
            const nextStep = statusData.next_required_step;
            const onboardingState = statusData.onboarding_state;
            
            if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
              router.push('/onboarding/home');
            } else if (nextStep && typeof nextStep === 'string') {
              const route = getRouteFromStep(nextStep);
              if (route && route !== '/login' && route !== '/') {
                router.push(route);
              } else if (onboardingState) {
                const stateRoute = getOnboardingRedirect(onboardingState);
                if (stateRoute && stateRoute !== '/login') {
                  router.push(stateRoute);
                } else {
                  router.push('/onboarding/home');
                }
              }
            } else if (onboardingState) {
              const stateRoute = getOnboardingRedirect(onboardingState);
              if (stateRoute && stateRoute !== '/login') {
                router.push(stateRoute);
              } else {
                router.push('/onboarding/home');
              }
            } else {
              router.push('/onboarding/home');
            }
          } catch (e) {
            router.push('/');
          }
        } else if (auth_flow_id) {
          router.push("/onboarding/name");
        }
      } catch (error) {
        console.error("Facebook login error:", error?.response?.data || error);
        alert("Facebook Login Failed. Please try again.");
      } finally {
        setIsLoadingFacebook(false);
      }
    },
    [router]
  );

  const handleFacebookLoginClick = useCallback(() => {
    if (!window.FB) {
      alert("Facebook SDK not loaded. Please refresh.");
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          handleFacebookLogin(response);
        }
      },
      {
        scope: "public_profile,email",
        return_scopes: true,
      }
    );
  }, [handleFacebookLogin]);

  /* ================= LOAD FACEBOOK SDK ================= */

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: "v18.0",
        });
      }
    };

    document.body.appendChild(script);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="lg:px-32 lg:py-12 px-4 min-h-screen bg-black text-white">
      <div className="lg:flex flex flex-col lg:flex-row justify-center lg:space-x-32 space-y-20 lg:space-y-0 border border-dashed border-gray-700 rounded-3xl py-10">

        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center items-center">
          <img
            src="/playymate-logo.png"
            alt="logo"
            className="w-72 mb-4"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="pt-20 w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Find Your People,
            </h2>
            <p className="text-3xl font-bold">
              Play your{" "}
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Vibe
              </span>
            </p>
          </div>

          {/* PHONE BUTTON */}
          <button
            onClick={() => router.push("/login/phone")}
            className="btn-main w-full mb-4 flex items-center gap-4 px-8 py-3"
          >
            <img
              src="/loginAvatars/mobile.png"
              className="w-6 h-6"
              alt="phone"
            />
            Continue with Phone
          </button>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="btn-outline w-full mb-4 flex items-center gap-4 px-8 py-3"
          >
            <img
              src="/loginAvatars/google.png"
              className="w-6 h-6"
              alt="google"
            />
            {isLoadingGoogle ? "Processing..." : "Continue with Google"}
          </button>

          {/* FACEBOOK BUTTON */}
          <button
            onClick={handleFacebookLoginClick}
            disabled={isLoadingFacebook}
            className="btn-outline w-full flex items-center gap-4 px-8 py-3"
          >
            <img
              src="/loginAvatars/facebook.png"
              className="w-6 h-6"
              alt="facebook"
            />
            {isLoadingFacebook
              ? "Processing..."
              : "Continue with Facebook"}
          </button>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{" "}
            <span className="text-orange-400 cursor-pointer">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}