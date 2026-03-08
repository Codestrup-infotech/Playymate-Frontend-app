// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
// import { userService } from '@/services/user';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { getRouteFromStep } from '@/lib/api/navigation';

// const GENDER_OPTIONS = [
//   { id: 'male', label: 'Male', emoji: '👨' },
//   { id: 'female', label: 'Female', emoji: '👩' },
//   { id: 'other', label: 'Other', emoji: '🌈' },
// ];

// export default function OnboardingGenderPage() {
//   const router = useRouter();
//   const [gender, setGender] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const clearError = () => setError(null);

//   // Check onboarding status on mount
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       try {
//         const response = await userService.getOnboardingStatus();
//         const state = response?.data?.data?.onboarding_state;
        
//         // If already past gender, redirect to next step
//         const validStates = ['GENDER_CAPTURED', 'DOB_CAPTURED', 'PARENT_CONSENT_PENDING', 'PARENT_CONSENT_APPROVED', 'LOCATION_CAPTURED', 'PROFILE_PHOTO_CAPTURED'];
//         if (validStates.includes(state)) {
//           const nextStep = response?.data?.next_required_step;
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             router.push(route);
//           } else {
//             router.push('/onboarding/dob');
//           }
//           return;
//         }
        
//         // Must be in BASIC_ACCOUNT_CREATED state to proceed
//         if (state !== 'BASIC_ACCOUNT_CREATED') {
//           const nextStep = response?.data?.next_required_step;
//           if (nextStep) {
//             const route = getRouteFromStep(nextStep);
//             router.push(route);
//           } else {
//             router.push('/onboarding/name');
//           }
//           return;
//         }
//       } catch (err) {
//         console.error('Failed to check onboarding status:', err);
//         // Continue anyway - let user try to submit
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     checkOnboardingStatus();
//   }, [router]);

//   const handleSubmit = async (selectedGender) => {
//     if (!selectedGender) {
//       setError('Please select your gender');
//       return;
//     }

//     try {
//       setLoading(true);
//       clearError();

//       const response = await userService.updateGender(selectedGender);
      
//       // Navigate based on next_required_step
//       const nextStep = response?.data?.next_required_step;
//       if (nextStep) {
//         const route = getRouteFromStep(nextStep);
//         router.push(route);
//       } else {
//         // Default to DOB page
//         router.push('/onboarding/dob');
//       }
//     } catch (err) {
//       const errorCode = err.response?.data?.error_code;
//       const message = getErrorMessage(errorCode) || 'Failed to save gender. Please try again.';
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     router.push('/onboarding/dob');
//   };

//   // Show loading while checking status
//   if (initialLoading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//         <div className="w-full max-w-sm">
//           <div className="flex items-center justify-center">
//             <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-8">
//           <button
//             onClick={() => router.push('/onboarding/name')}
//             className="p-2 rounded-full hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[20%]" />
//           </div>
//         </div>

//         {/* Content */}
//         <div className="space-y-6">
//           <div className="text-center">
//             <h1 className="text-3xl font-Playfair Display font-bold">
//               What's your
//               <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
//                 gender
//               </span>
//               ?
//             </h1>
//             <p className="mt-2 text-gray-400 text-sm">
//               This helps us personalize your experience
//             </p>
//           </div>

//           {error && (
//             <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
//               <AlertCircle className="w-4 h-4" />
//               <span>{error}</span>
//             </div>
//           )}

//           {/* Gender Options */}
//           <div className="grid grid-cols-2 gap-3">
//             {GENDER_OPTIONS.map((option) => (
//               <button
//                 key={option.id}
//                 onClick={() => handleSubmit(option.id)}
//                 disabled={loading}
//                 className={`
//                   p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
//                   ${gender === option.id 
//                     ? 'border-pink-500 bg-pink-500/20' 
//                     : 'border-white/10 hover:border-pink-500/50 bg-white/5'
//                   }
//                   disabled:opacity-50
//                 `}
//               >
//                 <span className="text-3xl">{option.emoji}</span>
//                 <span className="text-sm font-medium">{option.label}</span>
//               </button>
//             ))}
//           </div>

//           <button
//             type="button"
//             onClick={handleSkip}
//             disabled={loading}
//             className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors disabled:opacity-50"
//           >
//             Skip for now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
// import { userService } from '@/services/user';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { getRouteFromStep } from '@/lib/api/navigation';

// const GENDER_OPTIONS = [
//   { id: 'male', label: 'Male', symbol: '♂', symbolColor: '#e05a6a' },
//   { id: 'female', label: 'Female', symbol: '♀', symbolColor: '#e05a6a' },
//   { id: 'other', label: 'Other', symbol: null },
// ];

// export default function OnboardingGenderPage() {
//   const router = useRouter();
//   const [gender, setGender] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const clearError = () => setError(null);

//   // Check onboarding status on mount
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       try {
//         const response = await userService.getOnboardingStatus();
//         const state = response?.data?.data?.onboarding_state;
        
//         console.log('Gender page - State:', state);
        
//         // If already past gender, redirect to DOB
//         const pastGenderStates = ['DOB_CAPTURED', 'PARENT_CONSENT_PENDING', 'PARENT_CONSENT_APPROVED', 'LOCATION_CAPTURED', 'PROFILE_PHOTO_CAPTURED'];
//         if (pastGenderStates.includes(state)) {
//           router.push('/onboarding/dob');
//           return;
//         }
        
//         // If state is GENDER_CAPTURED or BASIC_ACCOUNT_CREATED (new user), stay on this page
//         // BASIC_ACCOUNT_CREATED means user has completed name but not yet selected gender
//         if (state === 'GENDER_CAPTURED' || state === 'BASIC_ACCOUNT_CREATED' || !state) {
//           setInitialLoading(false);
//           return;
//         }
        
//         // For any other state, redirect to name
//         router.push('/onboarding/name');
//       } catch (err) {
//         console.error('Failed to check onboarding status:', err);
//         router.push('/onboarding/name');
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     checkOnboardingStatus();
//   }, [router]);

//   const handleSubmit = async (selectedGender) => {
//     if (!selectedGender) {
//       setError('Please select your gender');
//       return;
//     }

//     // Debug: Check current token before API call
//     const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || localStorage.getItem('playymate_access_token');
//     console.log('🔑 Gender API - Token being used:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
//     console.log('🔑 Gender API - Token from sessionStorage:', !!sessionStorage.getItem('accessToken'));
//     console.log('🔑 Gender API - Token from localStorage:', !!localStorage.getItem('accessToken'));

//     try {
//       setLoading(true);
//       clearError();

//       const response = await userService.updateGender(selectedGender);
//       console.log('Gender save response:', response);
//       console.log('Gender save response.data:', response?.data);

//       // Always redirect to DOB page after gender (simpler and more reliable)
//       router.push('/onboarding/dob');
//     } catch (err) {
//       console.error('Gender save error:', err);
//       console.error('Gender save error response:', err.response?.data);
//       const errorCode = err.response?.data?.error_code;
//       const message = err.response?.data?.message || getErrorMessage(errorCode) || 'Failed to save gender. Please try again.';
//       console.error('Gender error code:', errorCode);
//       console.error('Gender error message:', message);
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     router.push('/onboarding/dob');
//   };

//   if (initialLoading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//         <div className="w-full max-w-sm">
//           <div className="flex items-center justify-center">
//             <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen text-white flex items-center justify-center px-6"
//       style={{ backgroundColor: '#111113' }}
//     >
//       <div className="w-full max-w-sm">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-10">
//           <button
//             onClick={() => router.push('/onboarding/name')}
//             className="p-2 rounded-full hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[20%]" />
//           </div>
//         </div>

//         {/* Title */}
//         <div className="text-center mb-2">
//           <h1 className="text-3xl font-bold tracking-tight">
//             What's Your{' '}
//             <span
//               style={{
//                 background: 'linear-gradient(90deg, #e8506a, #c0392b)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//               }}
//             >
//               Gender
//             </span>
//           </h1>
//           <p className="mt-2 text-gray-400 text-sm">Tell Us about your Gender</p>
//         </div>

//         {error && (
//           <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-3">
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Gender Options */}
//         <div className="mt-8 flex flex-col gap-4">
//           {GENDER_OPTIONS.map((option) => (
//             <button
//               key={option.id}
//               onClick={() => handleSubmit(option.id)}
//               disabled={loading}
//               style={{
//                 background: 'linear-gradient(145deg, #1e1e22, #18181c)',
//                 border: '1px solid #2a2a30',
//                 borderRadius: '14px',
//                 boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
//               }}
//               className="
//                 w-full py-5 px-6
//                 flex items-center justify-center gap-3
//                 text-white text-lg font-semibold
//                 transition-all duration-150
//                 hover:border-pink-500/60 hover:brightness-110
//                 active:scale-[0.98]
//                 disabled:opacity-50
//               "
//             >
//               <span className="text-lg">{option.label}</span>
//               {option.symbol && (
//                 <span
//                   style={{ color: option.symbolColor, fontSize: '1.3rem', lineHeight: 1 }}
//                 >
//                   {option.symbol}
//                 </span>
//               )}
//               {loading && gender === option.id && (
//                 <Loader2 className="w-4 h-4 animate-spin ml-1 text-pink-400" />
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Skip */}
//         <button
//           type="button"
//           onClick={handleSkip}
//           disabled={loading}
//           className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors disabled:opacity-50"
//         >
//           Skip for now
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { userService } from "@/services/user";
import { getErrorMessage } from "@/lib/api/errorMap";
import { getRouteFromStep } from "@/lib/api/navigation";

const GENDER_OPTIONS = [
  { id: "male", label: "Male", symbol: "♂", symbolColor: "#e05a6a" },
  { id: "female", label: "Female", symbol: "♀", symbolColor: "#e05a6a" },
  { id: "other", label: "Other", symbol: null },
];

export default function OnboardingGenderPage() {
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;

        console.log("Gender page - State:", state);

        const pastGenderStates = [
          "DOB_CAPTURED",
          "PARENT_CONSENT_PENDING",
          "PARENT_CONSENT_APPROVED",
          "LOCATION_CAPTURED",
          "PROFILE_PHOTO_CAPTURED",
        ];

        if (pastGenderStates.includes(state)) {
          router.push("/onboarding/dob");
          return;
        }

        if (
          state === "GENDER_CAPTURED" ||
          state === "BASIC_ACCOUNT_CREATED" ||
          !state
        ) {
          setInitialLoading(false);
          return;
        }

        router.push("/onboarding/name");
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
        router.push("/onboarding/name");
      } finally {
        setInitialLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleSubmit = async (selectedGender) => {
    if (!selectedGender) {
      setError("Please select your gender");
      return;
    }

    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("playymate_access_token");

    console.log(
      "🔑 Gender API - Token being used:",
      token ? token.substring(0, 30) + "..." : "NO TOKEN"
    );
    console.log(
      "🔑 Gender API - Token from sessionStorage:",
      !!sessionStorage.getItem("accessToken")
    );
    console.log(
      "🔑 Gender API - Token from localStorage:",
      !!localStorage.getItem("accessToken")
    );

    try {
      setLoading(true);
      setGender(selectedGender);
      clearError();

      const response = await userService.updateGender(selectedGender);

      console.log("Gender save response:", response);
      console.log("Gender save response.data:", response?.data);

      router.push("/onboarding/dob");
    } catch (err) {
      console.error("Gender save error:", err);
      console.error("Gender save error response:", err.response?.data);

      const errorCode = err.response?.data?.error_code;
      const message =
        err.response?.data?.message ||
        getErrorMessage(errorCode) ||
        "Failed to save gender. Please try again.";

      console.error("Gender error code:", errorCode);
      console.error("Gender error message:", message);

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // const handleSkip = () => {
  //   router.push("/onboarding/dob");
  // };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111113] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        {/* <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.push("/onboarding/name")}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-300" />
          </div>
        </div> */}

        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            What's Your{" "}
            <span className="bg-gradient-to-r from-pink-500 to-red-600 bg-clip-text text-transparent">
              Gender
            </span>
          </h1>

          <p className="mt-2 text-gray-400 text-sm font-Poppins">
            Tell Us about your Gender
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Gender Options */}
        <div className="mt-8 flex flex-col gap-4   font-Poppins font-normal">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSubmit(option.id)}
              disabled={loading}
              className={`
                w-full py-5 px-6
                flex items-center justify-center gap-3
                text-lg font-semibold
                rounded-2xl
                bg-gradient-to-br from-[#1e1e22] to-[#18181c] hover:bg-gradient-to-br  hover:from-[#EB4694] hover:to-[#FF8319]
                border
                transition-all duration-200
                shadow-lg
                ${
                  gender === option.id
                    ? "border-pink-500 ring-1  ring-pink-500/50 scale-[1.02]"
                    : "border-[#2a2a30] hover:border-pink-500/60 hover:brightness-110"
                }
                active:scale-[0.98]
                disabled:opacity-50
              `}
            >
              <span>{option.label}</span>

              {option.symbol && (
                <span
                  className="text-xl hover:text-white"
                  style={{ color: option.symbolColor }}
                >
                  {option.symbol}
                </span>
              )}

              {loading && gender === option.id && (
                <Loader2 className="w-4 h-4 animate-spin ml-1 text-pink-400  " />
              )}
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          type="button"
          // onClick={handleSkip}
          disabled={loading}
          className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {/* Skip for now */}
        </button>
      </div>
    </div>
  );
}