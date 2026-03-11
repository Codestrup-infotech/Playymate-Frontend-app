// "use client";

// import { useEffect, useCallback, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { userService } from "@/services/user";
// import { authService } from "@/services/auth";
// import { getRouteFromStep } from "@/lib/api/navigation";
// import { getOnboardingRedirect } from "@/lib/onboarding/stateMachine";

// const FACEBOOK_APP_ID =
//   process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "your-facebook-app-id";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// export default function LoginPage() {
//   const router = useRouter();

//   const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
//   const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

//   /* ================= CHECK IF ALREADY LOGGED IN ================= */
//   useEffect(() => {
//     const checkExistingSession = async () => {
//       const accessToken = authService.getAccessToken();
      
//       if (accessToken) {
//         try {
//           // User has token, check their onboarding status
//           const response = await userService.getOnboardingStatus();
//           const data = response?.data?.data || response?.data || {};
//           const nextStep = data.next_required_step;
//           const onboardingState = data.onboarding_state;
          
//           console.log('Already logged in - checking status:', { nextStep, onboardingState });
          
//           // If user is completed, go to home
//           if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
//             router.push('/onboarding/home');
//             return;
//           }
          
//           // If user has valid next step, redirect to their current step
//           if (nextStep && typeof nextStep === 'string') {
//             const route = getRouteFromStep(nextStep);
//             if (route && route !== '/login' && route !== '/') {
//               router.push(route);
//               return;
//             }
//           }
          
//           // Fallback: Use state-based redirect if nextStep is invalid
//           if (onboardingState && onboardingState !== 'INIT') {
//             const stateRoute = getOnboardingRedirect(onboardingState);
//             if (stateRoute && stateRoute !== '/login') {
//               console.log('Login: Falling back to state-based redirect:', onboardingState, '->', stateRoute);
//               router.push(stateRoute);
//               return;
//             }
//           }
          
//           // Default to home or onboarding
//           router.push('/onboarding/home');
//         } catch (err) {
//           console.error('Error checking session:', err);
//           // Token might be invalid, continue to login
//         }
//       }
//     };
    
//     checkExistingSession();
//   }, [router]);

//   /* ================= GOOGLE LOGIN ================= */

//   const handleGoogleLogin = useCallback(async () => {
//     try {
//       setIsLoadingGoogle(true);

//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);

//       const idToken = await result.user.getIdToken();

//       const res = await axios.post(`${API_URL}/auth/social/google`, {
//         id_token: idToken,
//       });

//       const { accessToken, refreshToken, auth_flow_id } =
//         res?.data?.data || {};

//       if (accessToken) {
//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("refreshToken", refreshToken);
        
//         // Check onboarding status and redirect accordingly
//         try {
//           const statusRes = await axios.get(`${API_URL}/users/onboarding/status`, {
//             headers: { Authorization: `Bearer ${accessToken}` }
//           });
//           const statusData = statusRes?.data?.data || {};
//           const nextStep = statusData.next_required_step;
//           const onboardingState = statusData.onboarding_state;
          
//           if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
//             router.push('/onboarding/home');
//           } else if (nextStep && typeof nextStep === 'string') {
//             const route = getRouteFromStep(nextStep);
//             if (route && route !== '/login' && route !== '/') {
//               router.push(route);
//             } else if (onboardingState) {
//               // Fallback to state-based redirect
//               const stateRoute = getOnboardingRedirect(onboardingState);
//               if (stateRoute && stateRoute !== '/login') {
//                 router.push(stateRoute);
//               } else {
//                 router.push('/onboarding/home');
//               }
//             }
//           } else if (onboardingState) {
//             // Fallback to state-based redirect
//             const stateRoute = getOnboardingRedirect(onboardingState);
//             if (stateRoute && stateRoute !== '/login') {
//               router.push(stateRoute);
//             } else {
//               router.push('/onboarding/home');
//             }
//           } else {
//             router.push('/onboarding/home');
//           }
//         } catch (e) {
//           router.push('/');
//         }
//       } else if (auth_flow_id) {
//         router.push("/onboarding/name");
//       }
//     } catch (error) {
//       console.error("Google login error:", error?.response?.data || error);
//       alert("Google Login Failed. Please try again.");
//     } finally {
//       setIsLoadingGoogle(false);
//     }
//   }, [router]);

//   /* ================= FACEBOOK LOGIN ================= */

//   const handleFacebookLogin = useCallback(
//     async (response) => {
//       if (!response?.authResponse?.accessToken) return;

//       try {
//         setIsLoadingFacebook(true);

//         const res = await axios.post(`${API_URL}/auth/social/facebook`, {
//           token: response.authResponse.accessToken,
//         });

//         const { accessToken, refreshToken, auth_flow_id } =
//           res?.data?.data || {};

//         if (accessToken) {
//           localStorage.setItem("accessToken", accessToken);
//           localStorage.setItem("refreshToken", refreshToken);
          
//           // Check onboarding status and redirect accordingly
//           try {
//             const statusRes = await axios.get(`${API_URL}/users/onboarding/status`, {
//               headers: { Authorization: `Bearer ${accessToken}` }
//             });
//             const statusData = statusRes?.data?.data || {};
//             const nextStep = statusData.next_required_step;
//             const onboardingState = statusData.onboarding_state;
            
//             if (nextStep === 'ACTIVE_USER' || nextStep === 'COMPLETED' || nextStep === 'HOME') {
//               router.push('/onboarding/home');
//             } else if (nextStep && typeof nextStep === 'string') {
//               const route = getRouteFromStep(nextStep);
//               if (route && route !== '/login' && route !== '/') {
//                 router.push(route);
//               } else if (onboardingState) {
//                 const stateRoute = getOnboardingRedirect(onboardingState);
//                 if (stateRoute && stateRoute !== '/login') {
//                   router.push(stateRoute);
//                 } else {
//                   router.push('/onboarding/home');
//                 }
//               }
//             } else if (onboardingState) {
//               const stateRoute = getOnboardingRedirect(onboardingState);
//               if (stateRoute && stateRoute !== '/login') {
//                 router.push(stateRoute);
//               } else {
//                 router.push('/onboarding/home');
//               }
//             } else {
//               router.push('/onboarding/home');
//             }
//           } catch (e) {
//             router.push('/');
//           }
//         } else if (auth_flow_id) {
//           router.push("/onboarding/name");
//         }
//       } catch (error) {
//         console.error("Facebook login error:", error?.response?.data || error);
//         alert("Facebook Login Failed. Please try again.");
//       } finally {
//         setIsLoadingFacebook(false);
//       }
//     },
//     [router]
//   );

//   const handleFacebookLoginClick = useCallback(() => {
//     if (!window.FB) {
//       alert("Facebook SDK not loaded. Please refresh.");
//       return;
//     }

//     window.FB.login(
//       (response) => {
//         if (response.authResponse) {
//           handleFacebookLogin(response);
//         }
//       },
//       {
//         scope: "public_profile,email",
//         return_scopes: true,
//       }
//     );
//   }, [handleFacebookLogin]);

//   /* ================= LOAD FACEBOOK SDK ================= */

//   useEffect(() => {
//     if (document.getElementById("facebook-jssdk")) return;

//     const script = document.createElement("script");
//     script.id = "facebook-jssdk";
//     script.src = "https://connect.facebook.net/en_US/sdk.js";
//     script.async = true;
//     script.defer = true;
//     script.crossOrigin = "anonymous";

//     script.onload = () => {
//       if (window.FB) {
//         window.FB.init({
//           appId: FACEBOOK_APP_ID,
//           cookie: true,
//           xfbml: false,
//           version: "v18.0",
//         });
//       }
//     };

//     document.body.appendChild(script);
//   }, []);

//   /* ================= UI ================= */
//  const outerAvatars = [
//     "/loginAvatars/avatars1.jpg",
//     "/loginAvatars/avatars6.jpg",
//     "/loginAvatars/avatars8.png",
//     "/loginAvatars/avatars4.jpg",
//     "/loginAvatars/avatars5.jpg",
//     "/loginAvatars/avatars7.png",
//   ];

//   const innerAvatars = [
//     "/loginAvatars/avatars1.jpg",
//     "/loginAvatars/avatars2.jpg",
//   ];
  
//   return (
//     <div className="lg:px-32 lg:py-12 px-4 min-h-screen bg-black text-white">
//       <div className="lg:flex flex flex-col lg:flex-row justify-center lg:space-x-32 space-y-20 lg:space-y-0 border border-dashed border-gray-700 rounded-3xl py-10">

//         {/* LEFT SIDE */}
//        <div className="flex flex-col justify-center items-center">
//             <img src="/loginAvatars/logo.png" alt="" className="w-72  mb-4  " />

//             <div className=" bg-black flex items-center justify-center">
//               <div className="relative w-[400px] h-[400px] flex items-center justify-center  ">

//                 {/* OUTER DASHED RING - 6 Avatars */}
//                 <div className="absolute w-[350px] h-[350px] border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
//                   {outerAvatars.map((src, i) => (
//                     <div
//                       key={`outer-${i}`}
//                       className="absolute w-14 h-14 rounded-full p-[2px] animate-orbit-outer"
//                       style={{ "--angle": `${i * 60}deg` }}
//                     >
//                       <div className="w-full h-full rounded-full overflow-hidden ">
//                         <img src={src} alt="" className="w-full h-full" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* INNER DARK RING - bg-[#262626] */}
//                 <div className="absolute w-52 h-52 bg-[#262626] rounded-full flex items-center justify-center">
//                   {/* INNER AVATARS - Positioned half-in, half-out */}
//                   {innerAvatars.map((src, i) => (
//                     <div
//                       key={`inner-${i}`}
//                       className="absolute w-12 h-12 rounded-full p-[1px] animate-orbit-inner z-20"
//                       style={{ "--angle": `${i * 180 + 90}deg` }}
//                     >
//                       <div className="w-full h-full rounded-full overflow-hidden ">
//                         <img src={src} alt="" className="w-full h-full" />
//                       </div>
//                     </div>
//                   ))}

//                   {/* CENTER WHITE CORE */}
//                   <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center z-10 shadow-lg">
//                     <div className=" rounded-full overflow-hidden">
//                       <img
//                         src="/loginAvatars/avatars6.jpg"
//                         alt="Center"
//                         className="w-24 h-24 justify-center  items-center"
//                       />
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </div>
            
//              </div>

//         {/* RIGHT SIDE */}
//         <div className="pt-20 w-full max-w-sm">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold mb-2">
//               Find Your People,
//             </h2>
//             <p className="text-3xl font-bold">
//               Play your{" "}
//               <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
//                 Vibe
//               </span>
//             </p>
//           </div>

//           {/* PHONE BUTTON */}
//           <button
//             onClick={() => router.push("/login/phone")}
//             className="btn-main w-full mb-4 flex items-center gap-4 px-8 py-3"
//           >
//             <img
//               src="/loginAvatars/mobile.png"
//               className="w-6 h-6"
//               alt="phone"
//             />
//             Continue with Phone
//           </button>

//           {/* GOOGLE BUTTON */}
//           <button
//             onClick={handleGoogleLogin}
//             disabled={isLoadingGoogle}
//             className="btn-outline w-full mb-4 flex items-center gap-4 px-8 py-3"
//           >
//             <img
//               src="/loginAvatars/google.png"
//               className="w-6 h-6"
//               alt="google"
//             />
//             {isLoadingGoogle ? "Processing..." : "Continue with Google"}
//           </button>

//           {/* FACEBOOK BUTTON */}
//           <button
//             onClick={handleFacebookLoginClick}
//             disabled={isLoadingFacebook}
//             className="btn-outline w-full flex items-center gap-4 px-8 py-3"
//           >
//             <img
//               src="/loginAvatars/facebook.png"
//               className="w-6 h-6"
//               alt="facebook"
//             />
//             {isLoadingFacebook
//               ? "Processing..."
//               : "Continue with Facebook"}
//           </button>

//           <p className="text-sm text-gray-400 mt-6 text-center">
//             Already have an account?{" "}
//             <span className="text-orange-400 cursor-pointer">
//               Sign in
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


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
  process.env.NEXT_PUBLIC_API_URL || "https://api-dev.playymate.com/api/v1";

export default function LoginPage() {
  const router = useRouter();

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [screenConfig, setScreenConfig] = useState(null);

  /* ======= FETCH LOGIN SCREEN CONFIG =======*/

  useEffect(() => {
    const fetchLoginScreen = async () => {
      try {
        const res = await authService.getLoginScreen("welcome", "web");
        const screen = res?.data?.data?.screen;
        setScreenConfig(screen);
      } catch (err) {
        console.error("Failed to load login config:", err);
      }
    };

    fetchLoginScreen();
  }, []);

  /* ================= CHECK EXISTING SESSION ================= */

  useEffect(() => {
    const checkExistingSession = async () => {
      const accessToken = authService.getAccessToken();

      if (accessToken) {
        try {
          const response = await userService.getOnboardingStatus();
          const data = response?.data?.data || {};
          const nextStep = data.next_required_step;
          const onboardingState = data.onboarding_state;

          console.log('Login page - nextStep:', nextStep);
          console.log('Login page - onboardingState:', onboardingState);

          if (
            nextStep === "ACTIVE_USER" ||
            nextStep === "COMPLETED" ||
            nextStep === "HOME" ||
            nextStep === "DONE" ||
            nextStep === "ACTIVE" ||
            nextStep === "EXPERIENCE_COMPLETED" ||
            nextStep === "EXPERIENCE_COMPLETE" ||
            // Extended profile states (only completed ones go to home)
            nextStep === "EXTENDED_PROFILE_PENDING" ||
            nextStep === "EXTENDED_PROFILE_COMPLETED"
          ) {
            console.log('Redirecting to /home - completed state');
            router.push("/home");
            return;
          }

          // EXTENDED_PROFILE_INTRO - user needs to complete extended profile (experience)
          if (nextStep === "EXTENDED_PROFILE_INTRO") {
            console.log('Redirecting to /onboarding/experience - EXTENDED_PROFILE_INTRO');
            router.push("/onboarding/experience");
            return;
          }

          // If user has completed questionnaire, redirect to experience
          if (
            nextStep === "QUESTIONNAIRE_COMPLETED" ||
            nextStep === "QUESTIONNAIRE_COMPLETE"
          ) {
            console.log('Redirecting to /onboarding/experience - QUESTIONNAIRE_COMPLETED');
            router.push("/onboarding/experience");
            return;
          }

          if (nextStep) {
            const route = getRouteFromStep(nextStep);
            console.log('getRouteFromStep result for', nextStep, ':', route);
            if (route && route !== "/login") {
              router.push(route);
              return;
            }
          }

          if (onboardingState) {
            const stateRoute = getOnboardingRedirect(onboardingState);
            console.log('getOnboardingRedirect result for', onboardingState, ':', stateRoute);
            if (stateRoute && stateRoute !== "/login") {
              router.push(stateRoute);
              return;
            }
          }

          console.log('Falling through to /home');
          router.push("/home");
        } catch (err) {
          console.error("Session check failed:", err);
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

      const { accessToken, refreshToken } = res?.data?.data || {};

      if (accessToken) {
        authService.storeTokens({ accessToken, refreshToken });
        router.push("/onboarding/home");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google Login Failed.");
    } finally {
      setIsLoadingGoogle(false);
    }
  }, [router]);

  /* ================= FACEBOOK LOGIN ================= */

  const handleFacebookLoginClick = useCallback(() => {
    if (!window.FB) {
      alert("Facebook SDK not loaded.");
      return;
    }

    window.FB.login(
      async (response) => {
        if (!response?.authResponse?.accessToken) return;

        try {
          setIsLoadingFacebook(true);

          const res = await axios.post(
            `${API_URL}/auth/social/facebook`,
            {
              token: response.authResponse.accessToken,
            }
          );

          const { accessToken, refreshToken } =
            res?.data?.data || {};

          if (accessToken) {
            authService.storeTokens({ accessToken, refreshToken });
            router.push("/onboarding/home");
          }
        } catch (error) {
          console.error("Facebook login error:", error);
        } finally {
          setIsLoadingFacebook(false);
        }
      },
      { scope: "public_profile,email" }
    );
  }, [router]);

  /* ================= LOAD FACEBOOK SDK ================= */

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;

    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          version: "v18.0",
        });
      }
    };

    document.body.appendChild(script);
  }, []);

  /* ================= UI ================= */


   /* ================= UI ================= */
 const outerAvatars = [
    "/loginAvatars/avatars1.jpg",
    "/loginAvatars/avatars6.jpg",
    "/loginAvatars/avatars8.png",
    "/loginAvatars/avatars4.jpg",
    "/loginAvatars/avatars5.jpg",
    "/loginAvatars/avatars7.png",
  ];

  const innerAvatars = [
    "/loginAvatars/avatars1.jpg",
    "/loginAvatars/avatars2.jpg",
  ];

  return (
    <div className="lg:px-32 lg:py-12 px-4 min-h-screen bg-black text-white">
      <div className="lg:flex flex flex-col lg:flex-row justify-center lg:space-x-32 space-y-20 lg:space-y-0 border border-dashed border-gray-700 rounded-3xl py-10">

       {/* LEFT SIDE */}
       <div className="flex flex-col justify-center items-center">
            <img src="/loginAvatars/logo.png" alt="" className="w-72  mb-4  " />

            <div className=" bg-black flex items-center justify-center">
              <div className="relative w-[400px] h-[400px] flex items-center justify-center  ">

                {/* OUTER DASHED RING - 6 Avatars */}
                <div className="absolute w-[350px] h-[350px] border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                  {outerAvatars.map((src, i) => (
                    <div
                      key={`outer-${i}`}
                      className="absolute w-14 h-14 rounded-full p-[2px] animate-orbit-outer"
                      style={{ "--angle": `${i * 60}deg` }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden ">
                        <img src={src} alt="" className="w-full h-full" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* INNER DARK RING - bg-[#262626] */}
                <div className="absolute w-52 h-52 bg-[#262626] rounded-full flex items-center justify-center">
                  {/* INNER AVATARS - Positioned half-in, half-out */}
                  {innerAvatars.map((src, i) => (
                    <div
                      key={`inner-${i}`}
                      className="absolute w-12 h-12 rounded-full p-[1px] animate-orbit-inner z-20"
                      style={{ "--angle": `${i * 180 + 90}deg` }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden ">
                        <img src={src} alt="" className="w-full h-full" />
                      </div>
                    </div>
                  ))}

                  {/* CENTER WHITE CORE */}
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center z-10 shadow-lg">
                    <div className=" rounded-full overflow-hidden">
                      <img
                        src="/loginAvatars/avatars6.jpg"
                        alt="Center"
                        className="w-24 h-24 justify-center  items-center"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
             </div>

        {/* RIGHT SIDE */} 
        <div className="pt-14  flex flex-col justify-center items-center  font-Playfair Display ">
        <div className="text-center max-w-md mb-8">
  <h2 className="text-3xl font-bold mb-2">
    {screenConfig?.title &&
      screenConfig.title.split(" ").map((word, index) => {
        const isGradient = index === 2 || index === 5; // 3rd & 6th word

        return (
          <span
            key={index}
            className={
              isGradient
                ? "bg-gradient-to-r from-fuchsia-500 to-orange-500 bg-clip-text text-transparent"
                : ""
            }
          >
            {word + " "}
          </span>
        );
      })}
  </h2>

            <p className="text-md text-slate-400 font-Poppins ">
              {screenConfig?.subtitle }
            
            </p>
          </div>
<div className="w-96 "> 
          {/* PHONE BUTTON */}
          <button
            onClick={() => router.push("/login/phone")}
            className="btn-main  mb-4 flex items-center font-Poppins font-normal gap-4 px-8 py-3"
          >
            <img
              src="/loginAvatars/mobile.png"
              className="w-6 h-6"
              alt="phone"
            />
            {screenConfig?.cta_text?.primary ||
              "Continue with Phone"}
          </button>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="btn-outline mb-4 flex  items-center  font-Poppins font-normal gap-4 px-8 py-3"
          >
            <img
              src="/loginAvatars/google.png"
              className="w-6 h-6"
              alt="google"
            />
            {isLoadingGoogle
              ? "Processing..."
              : "Continue with Google"}
          </button>

          {/* FACEBOOK BUTTON */}
          <button
            onClick={handleFacebookLoginClick}
            disabled={isLoadingFacebook}
            className="btn-outline  flex items-center  font-Poppins font-normal gap-4 px-8 py-3"
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
</div>
          <p className="text-sm text-gray-400 mt-6 text-center  font-Poppins font-normal">
            Create account?{" "}
            <span
               onClick={() => router.push("/onboarding/create-account")}
               className="text-orange-400 cursor-pointer hover:text-orange-300 transition-colors"
             >
             Sign in
           </span>
          </p>
        </div>
      </div>
    </div>
  );
}