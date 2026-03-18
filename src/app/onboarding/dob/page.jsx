

// "use client";

// import { useState, useMemo, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
// import { userService } from '@/services/user';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { getRouteFromStep } from '@/lib/api/navigation';

// const ITEM_HEIGHT = 48;
// const VISIBLE_ITEMS = 7;

// function DrumPicker({ items, selectedIndex, onIndexChange, formatLabel }) {
//   const containerRef = useRef(null);
//   const isDragging = useRef(false);
//   const startY = useRef(0);
//   const startIndex = useRef(0);

//   const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

//   const handlePointerDown = (e) => {
//     isDragging.current = true;
//     startY.current = e.clientY ?? e.touches?.[0]?.clientY;
//     startIndex.current = selectedIndex;
//     e.currentTarget.setPointerCapture?.(e.pointerId);
//   };

//   const handlePointerMove = (e) => {
//     if (!isDragging.current) return;
//     const clientY = e.clientY ?? e.touches?.[0]?.clientY;
//     const delta = startY.current - clientY;
//     const indexDelta = Math.round(delta / ITEM_HEIGHT);
//     const newIndex = clamp(startIndex.current + indexDelta, 0, items.length - 1);
//     onIndexChange(newIndex);
//   };

//   const handlePointerUp = () => {
//     isDragging.current = false;
//   };

//   const handleWheel = (e) => {
//     e.preventDefault();
//     const delta = e.deltaY > 0 ? 1 : -1;
//     onIndexChange(clamp(selectedIndex + delta, 0, items.length - 1));
//   };

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;
//     el.addEventListener('wheel', handleWheel, { passive: false });
//     return () => el.removeEventListener('wheel', handleWheel);
//   });

//   const visibleRange = 3; // items above/below center

//   return (
//     <div
//       ref={containerRef}
//       className="relative select-none cursor-grab active:cursor-grabbing overflow-hidden"
//       style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
//       onPointerDown={handlePointerDown}
//       onPointerMove={handlePointerMove}
//       onPointerUp={handlePointerUp}
//       onPointerLeave={handlePointerUp}
//     >
//       {/* Fade top */}
//       <div
//         className="absolute inset-x-0 top-0 z-10 pointer-events-none"
//         style={{
//           height: ITEM_HEIGHT * 3,
//           background: 'linear-gradient(to bottom, #111113 0%, transparent 100%)',
//         }}
//       />
//       {/* Fade bottom */}
//       <div
//         className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
//         style={{
//           height: ITEM_HEIGHT * 3,
//           background: 'linear-gradient(to top, #111113 0%, transparent 100%)',
//         }}
//       />
//       {/* Center highlight bar */}
//       <div
//         className="absolute inset-x-0 z-20 pointer-events-none"
//         style={{
//           top: ITEM_HEIGHT * 3,
//           height: ITEM_HEIGHT,
//           borderTop: '1px solid rgba(255,255,255,0.08)',
//           borderBottom: '1px solid rgba(255,255,255,0.08)',
//         }}
//       />

//       {/* Items */}
//       <div
//         style={{
//           transform: `translateY(${(3 - selectedIndex) * ITEM_HEIGHT}px)`,
//           transition: isDragging.current ? 'none' : 'transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
//         }}
//       >
//         {items.map((item, idx) => {
//           const distance = Math.abs(idx - selectedIndex);
//           const isSelected = idx === selectedIndex;
//           const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.35 : 0.15;
//           const scale = distance === 0 ? 1 : distance === 1 ? 0.88 : 0.76;

//           return (
//             <div
//               key={idx}
//               onClick={() => onIndexChange(idx)}
//               style={{
//                 height: ITEM_HEIGHT,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 opacity,
//                 transform: `scale(${scale})`,
//                 transition: 'opacity 0.15s, transform 0.15s',
//                 cursor: 'pointer',
//                 fontSize: isSelected ? '1.5rem' : '1rem',
//                 fontWeight: isSelected ? '700' : '400',
//                 color: isSelected
//                   ? 'transparent'
//                   : '#fff',
//                 background: isSelected
//                   ? 'linear-gradient(90deg, #e8506a, #e8923a)'
//                   : 'transparent',
//                 WebkitBackgroundClip: isSelected ? 'text' : 'unset',
//                 WebkitTextFillColor: isSelected ? 'transparent' : '#fff',
//                 letterSpacing: isSelected ? '0.01em' : '0',
//               }}
//             >
//               {formatLabel ? formatLabel(item) : item}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default function OnboardingDOBPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [age, setAge] = useState(null);

//   const currentYear = new Date().getFullYear();

//   const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
//   const months = useMemo(() => [
//     'Jan','Feb','Mar','Apr','May','Jun',
//     'Jul','Aug','Sep','Oct','Nov','Dec'
//   ], []);
//   const years = useMemo(() => {
//     const arr = [];
//     for (let y = currentYear - 13; y >= currentYear - 100; y--) arr.push(y);
//     return arr;
//   }, [currentYear]);

//   const [dayIndex, setDayIndex] = useState(6);      // default day=7
//   const [monthIndex, setMonthIndex] = useState(1);  // default Feb
//   const [yearIndex, setYearIndex] = useState(21);   // default ~2002

//   const selectedDay = days[dayIndex];
//   const selectedMonth = monthIndex + 1; // 1-based
//   const selectedYear = years[yearIndex];

//   const clearError = () => setError(null);

//   useEffect(() => {
//     // ✅ Use stored next step — no API call needed
//     const nextStep = sessionStorage.getItem("onboarding_next_step");
//     const token = sessionStorage.getItem("access_token") || 
//                   sessionStorage.getItem("accessToken") || 
//                   localStorage.getItem("accessToken") ||
//                   localStorage.getItem("playymate_access_token");

//     if (!token) {
//       router.push("/login/phone");
//       return;
//     }

//     // If the backend says user's next step is PAST dob, skip forward
//     if (nextStep && nextStep !== "DOB_CAPTURED" && nextStep !== "DOB") {
//       const stepRoutes = {
//         "PARENT_CONSENT_PENDING": "/onboarding/parent-consent",
//         "PARENT_CONSENT_APPROVED": "/onboarding/location",
//         "LOCATION_CAPTURED": "/onboarding/photo",
//         "PROFILE_PHOTO_CAPTURED": "/onboarding/kyc",
//         "KYC_COMPLETED": "/onboarding/physical",
//         "PHYSICAL_PROFILE_QUESTIONS": "/onboarding/physical",
//         "ACTIVE_USER": "/onboarding/home",
//         "COMPLETED": "/onboarding/home",
//         "HOME": "/onboarding/home",
//         "ACTIVE": "/onboarding/home",
//       };
//       const route = stepRoutes[nextStep];
//       if (route) {
//         router.push(route);
//         return;
//       }
//     }

//     // Otherwise, user belongs on this page — let them stay
//     setInitialLoading(false);
//   }, [router]);

//   const computeAge = () => {
//     const birthDate = new Date(`${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`);
//     const today = new Date();
//     let a = today.getFullYear() - birthDate.getFullYear();
//     const md = today.getMonth() - birthDate.getMonth();
//     if (md < 0 || (md === 0 && today.getDate() < birthDate.getDate())) a--;
//     return a;
//   };

//   const handleContinuePress = () => {
//     clearError();
//     const a = computeAge();
//     if (a < 13) { setError('You must be at least 13 years old to use this app'); return; }
//     if (a > 100) { setError('Please enter a valid date of birth'); return; }
//     setAge(a);
//     setShowConfirm(true);
//   };

//   const handleSubmit = async () => {
//     const dob = `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
    
//     // Compute local age for immediate redirect decision
//     const computedAge = computeAge();
//     const isUnder18 = computedAge < 18;
//     const isAdult = computedAge >= 18;
    
//     console.log('Computed age:', computedAge, 'Under 18:', isUnder18, 'Adult:', isAdult);
    
//     // If user is under 18, redirect to parent consent (still save DOB first)
//     if (isUnder18) {
//       try {
//         setLoading(true);
//         clearError();
        
//         // Save DOB first
//         const response = await userService.updateDOB(dob);
//         console.log('DOB saved for minor user, response:', response.data);
        
//         // Check API response for consent_required flag
//         const responseData = response?.data;
//         const consentRequired = responseData?.consent_required;
//         const nextStep = responseData?.next_required_step;
        
//         console.log('Minor user - consent_required:', consentRequired, 'next_step:', nextStep);
        
//         // If API indicates parent consent is needed, redirect there
//         if (consentRequired || nextStep === 'PARENT_CONSENT') {
//           console.log('API indicates parent consent required - redirecting to parent-consent');
//           router.push('/onboarding/parent-consent');
//           return;
//         }
        
//         // Fallback: still redirect to parent consent based on local age
//         console.log('Redirecting to parent consent (fallback)');
//         router.push('/onboarding/parent-consent');
//         return;
//       } catch (err) {
//         console.error('DOB save error for minor:', err);
//         // Even if API fails, redirect to parent consent based on local age
//         router.push('/onboarding/parent-consent');
//         return;
//       }
//     }
    
//     // For adults (18+), proceed with normal flow
//     try {
//       setLoading(true);
//       clearError();

//       const response = await userService.updateDOB(dob);
//       console.log('DOB response:', response.data);

//       const responseData = response?.data;
//       const data = responseData?.data;
//       const ageGroup = data?.age_group;
      
//       // Use local age check for routing - if locally under 18, go to parent consent
//       if (isUnder18) {
//         console.log('User is under 18 - redirecting to parent consent');
//         router.push('/onboarding/parent-consent');
//         return;
//       }

//       // For adults (18+), check for next_required_step from API response
//       const nextStep = responseData?.next_required_step;
//       console.log('Next step from API:', nextStep);
      
//       // Check if nextStep is a valid string (not empty object, not empty string)
//       const isValidNextStep = nextStep && typeof nextStep === 'string' && nextStep.trim() !== '';
      
//       if (isValidNextStep) {
//         // If API returns a valid step string, use it for adults
//         if (nextStep === 'PARENT_CONSENT') {
//           router.push('/onboarding/parent-consent');
//           return;
//         } else if (nextStep === 'LOCATION') {
//           router.push('/onboarding/location');
//           return;
//         } else if (nextStep === 'PROFILE_PHOTO') {
//           router.push('/onboarding/photo');
//           return;
//         } else {
//           // For any other step from API
//           const route = getRouteFromStep(nextStep);
//           if (route) {
//             router.push(route);
//             return;
//           }
//         }
//       }

//       // Default for adults: go to location
//       console.log('Navigating to location (adult)');
//       router.push('/onboarding/location');
//     } catch (err) {
//       console.error('DOB save error:', err);
//       const errorCode = err.response?.data?.error_code;
//       const status = err.response?.status;
//       const errorMsg = err.response?.data?.message;
      
//       // Handle 403 or FORBIDDEN - skip to next step (user already has DOB set)
//       if (status === 403 || errorCode === 'FORBIDDEN') {
//         console.log("Got 403/FORBIDDEN on DOB update - checking next step from session");
//         const nextStep = sessionStorage.getItem("onboarding_next_step");
//         // If next step is past DOB, go there; otherwise default to location
//         if (nextStep && nextStep !== "DOB_CAPTURED" && nextStep !== "DOB") {
//           const route = getRouteFromStep(nextStep);
//           if (route) {
//             router.push(route);
//             return;
//           }
//         }
//         // Default skip to location
//         sessionStorage.setItem("onboarding_next_step", "LOCATION_CAPTURED");
//         router.push('/onboarding/location');
//         return;
//       }
      
//       // Handle state mismatch errors
//       if (status === 400) {
//         const nextStep = err.response?.data?.next_required_step;
//         if (nextStep) {
//           const route = getRouteFromStep(nextStep);
//           router.push(route);
//           return;
//         }
//       }
      
//       const message = getErrorMessage(errorCode) || errorMsg || 'Failed to save date of birth. Please try again.';
//       setError(message);
//       setShowConfirm(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleSkip = () => router.push('/onboarding/location');

//   if (initialLoading) {
//     return (
//       <div className=" flex  items-center justify-center" style={{ backgroundColor: '#111113' }}>
//         <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
//       </div>
//     );
//   }

//   const monthLabel = months[monthIndex];
//   const confirmLabel = `${monthLabel} ${selectedDay}, ${selectedYear}`;

//   return (
//     <div
//       className="min-h-screen text-white flex flex-col items-center justify-start px-6 pt-6 "
//       style={{ backgroundColor: '#111113' }}
//     >
//       <div className="w-full max-w-sm flex flex-col space-y-8">
//         {/* Header */}
//         {/* <div className="flex items-center gap-3 mb-8">
//           <button
//             onClick={() => router.push('/onboarding/gender')}
//             className="p-2 rounded-full hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[30%]" />
//           </div>
//         </div> */}

//         {/* Title */}
//         <div className="text-center ">
//           <h1 className="text-3xl font-bold tracking-tight">
//             How{' '}
//             <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Old</span>{' '}
//             <span
//               style={{
//                 background: 'linear-gradient(90deg, #e8506a, #c0392b)',
//                 WebkitBackgroundClip: 'text  ',
//                 WebkitTextFillColor: 'transparent',
//                 fontWeight: 700,
//               }}
//             >
//               Are You
//             </span>
//           </h1>
//           <p className="mt-1 text-gray-400 text-sm font-Poppins">Please Provide your age in Years</p>
//         </div>

//         {error && (
//           <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2 mb-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Drum Pickers */}
//         <div className="flex-1 flex items-center font-Poppins ">
//           <div
//             className="w-full rounded-2xl overflow-hidden"
//             style={{
//               background: 'linear-gradient(160deg, #1c1c1f, #151518)',
//               border: '1px solid rgba(255,255,255,0.06)',
//             }}
//           >
//             <div className="grid grid-cols-3">
//               {/* Day */}
//               <DrumPicker
//                 items={days}
//                 selectedIndex={dayIndex}
//                 onIndexChange={setDayIndex}
//                 formatLabel={(d) => String(d).padStart(2, '0')}
//               />
//               {/* Month */}
//               <DrumPicker
//                 items={months}
//                 selectedIndex={monthIndex}
//                 onIndexChange={setMonthIndex}
//               />
//               {/* Year */}
//               <DrumPicker
//                 items={years}
//                 selectedIndex={yearIndex}
//                 onIndexChange={setYearIndex}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Confirm Sheet */}
//         {showConfirm ? (
//           <div
//             className="mt-6 rounded-2xl p-5 text-center font-Poppins"
//             style={{
//               background: 'linear-gradient(160deg, #1e1e22, #18181c)',
//               border: '1px solid rgba(255,255,255,0.08)',
//             }}
//           >
//             <p className="text-white font-bold text-lg mb-1">You're {age}</p>
//             <p className="text-gray-400 text-sm mb-4">
//               Is {confirmLabel} your birthday? This can only be changed once.
//             </p>
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full py-4 rounded-full font-Poppins font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
//               style={{ background: 'linear-gradient(90deg, #e8506a, #e8923a)' }}
//             >
//               {loading ? <><Loader2 className="w-5 h-5 animate-spin font-Poppins " />Saving...</> : 'Continue'}
//             </button>
//             <button
//               onClick={() => setShowConfirm(false)}
//               className="mt-3 text-gray-400 text-sm hover:text-white transition-colors w-full py-2"
//             >
//               Edit
//             </button>
//           </div>
//         ) : (
        
//             <button
//               onClick={handleContinuePress}
//               disabled={loading}
//               className="w-full font-Poppins py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
//               style={{ background: 'linear-gradient(90deg, #e8506a, #e8923a)' }}
//             >
//               Continue
//             </button>
         
        
//         )}

//         <div/>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '@/services/user';
import { getErrorMessage } from '@/lib/api/errorMap';
import { getRouteFromStep } from '@/lib/api/navigation';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 7;

function DrumPicker({ items, selectedIndex, onIndexChange, formatLabel }) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startIndex = useRef(0);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY;
    startIndex.current = selectedIndex;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const delta = startY.current - clientY;
    const indexDelta = Math.round(delta / ITEM_HEIGHT);
    const newIndex = clamp(startIndex.current + indexDelta, 0, items.length - 1);
    onIndexChange(newIndex);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    onIndexChange(clamp(selectedIndex + delta, 0, items.length - 1));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  });

  const visibleRange = 3; // items above/below center

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Fade top */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 3,
          background: 'linear-gradient(to bottom, #111113 0%, transparent 100%)',
        }}
      />
      {/* Fade bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 3,
          background: 'linear-gradient(to top, #111113 0%, transparent 100%)',
        }}
      />
      {/* Center highlight bar */}
      <div
        className="absolute inset-x-0 z-20 pointer-events-none"
        style={{
          top: ITEM_HEIGHT * 3,
          height: ITEM_HEIGHT,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      />
{/* Items */}
<div
  style={{
    transform: `translateY(${(3 - selectedIndex) * ITEM_HEIGHT}px)`,
    transition: isDragging.current
      ? "none"
      : "transform 0.25s cubic-bezier(0.22,0.61,0.36,1)",
    transformStyle: "preserve-3d",
  }}
>
  {items.map((item, idx) => {
    const distance = idx - selectedIndex;
    const absDistance = Math.abs(distance);
    const isSelected = idx === selectedIndex;

    const rotateX = distance * -20;   // tilt effect
    const translateZ = isSelected ? 40 : 0;
    const opacity =
      absDistance === 0
        ? 1
        : absDistance === 1
        ? 0.6
        : absDistance === 2
        ? 0.35
        : 0.15;

    const scale =
      absDistance === 0
        ? 1.1
        : absDistance === 1
        ? 0.9
        : 0.75;

    return (
      <div
        key={idx}
        onClick={() => onIndexChange(idx)}
        style={{
          height: ITEM_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity,
          transform: `
            rotateX(${rotateX}deg)
            translateZ(${translateZ}px)
            scale(${scale})
          `,
          transformStyle: "preserve-3d",
          transition: "all 0.25s ease",
          cursor: "pointer",
          fontSize: isSelected ? "1.6rem" : "1rem",
          fontWeight: isSelected ? "700" : "400",
          letterSpacing: "0.02em",

          /* Playmate active color */
          color: isSelected ? "transparent" : "#9CA3AF",

          background: isSelected
            ? "linear-gradient(90deg, #EF3AFF, #FF8319)"
            : "transparent",

          WebkitBackgroundClip: isSelected ? "text" : "unset",
          WebkitTextFillColor: isSelected ? "transparent" : "#9CA3AF",
        }}
      >
        {formatLabel ? formatLabel(item) : item}
      </div>
    );
  })}
</div>
    </div>
  );
}

export default function OnboardingDOBPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [age, setAge] = useState(null);
  const [screenConfig, setScreenConfig] = useState(null);

  const currentYear = new Date().getFullYear();

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const months = useMemo(() => [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ], []);
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear - 13; y >= currentYear - 100; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const [dayIndex, setDayIndex] = useState(6);      // default day=7
  const [monthIndex, setMonthIndex] = useState(1);  // default Feb
  const [yearIndex, setYearIndex] = useState(21);   // default ~2002

  const selectedDay = days[dayIndex];
  const selectedMonth = monthIndex + 1; // 1-based
  const selectedYear = years[yearIndex];

  const clearError = () => setError(null);

  useEffect(() => {
    const initialize = async () => {
      try {
  
        const statusRes = await userService.getOnboardingStatus();
        const state = statusRes?.data?.data?.onboarding_state;
  
        if (state !== "GENDER_CAPTURED") {
          router.push("/onboarding/gender");
          return;
        }
  
        const configRes = await userService.getScreenConfig("age_selection");
        const screen = configRes?.data?.data?.screen;
  
        setScreenConfig(screen);
  
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setInitialLoading(false);
      }
    };
  
    initialize();
  
  }, [router]);
  const computeAge = () => {
    const birthDate = new Date(`${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`);
    const today = new Date();
    let a = today.getFullYear() - birthDate.getFullYear();
    const md = today.getMonth() - birthDate.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birthDate.getDate())) a--;
    return a;
  };

  const handleContinuePress = () => {
    clearError();
    const a = computeAge();
    if (a < 13) { setError('You must be at least 13 years old to use this app'); return; }
    if (a > 100) { setError('Please enter a valid date of birth'); return; }
    setAge(a);
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    const dob = `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
    
    // Compute local age for immediate redirect decision
    const computedAge = computeAge();
    const isUnder18 = computedAge < 18;
    const isAdult = computedAge >= 18;
    
    console.log('Computed age:', computedAge, 'Under 18:', isUnder18, 'Adult:', isAdult);
    
    // If user is under 18, redirect to parent consent (still save DOB first)
    if (isUnder18) {
      try {
        setLoading(true);
        clearError();
        
        // Save DOB first
        const response = await userService.updateDOB(dob);
        console.log('DOB saved for minor user, response:', response.data);
        
        // Check API response for consent_required flag
        const responseData = response?.data;
        const consentRequired = responseData?.consent_required;
        const nextStep = responseData?.next_required_step;
        
        console.log('Minor user - consent_required:', consentRequired, 'next_step:', nextStep);
        
        // If API indicates parent consent is needed, redirect there
        if (consentRequired || nextStep === 'PARENT_CONSENT') {
          console.log('API indicates parent consent required - redirecting to parent-consent');
          router.push('/onboarding/parent-consent');
          return;
        }
        
        // Fallback: still redirect to parent consent based on local age
        console.log('Redirecting to parent consent (fallback)');
        router.push('/onboarding/parent-consent');
        return;
      } catch (err) {
        console.error('DOB save error for minor:', err);
        // Even if API fails, redirect to parent consent based on local age
        router.push('/onboarding/parent-consent');
        return;
      }
    }
    
    // For adults (18+), proceed with normal flow
    try {
      setLoading(true);
      clearError();

      const response = await userService.updateDOB(dob);
      console.log('DOB response:', response.data);

      const responseData = response?.data;
      const data = responseData?.data;
      const ageGroup = data?.age_group;
      
      // Use local age check for routing - if locally under 18, go to parent consent
      if (isUnder18) {
        console.log('User is under 18 - redirecting to parent consent');
        router.push('/onboarding/parent-consent');
        return;
      }

      // For adults (18+), check for next_required_step from API response
      const nextStep = responseData?.next_required_step;
      console.log('Next step from API:', nextStep);
      
      // Check if nextStep is a valid string (not empty object, not empty string)
      const isValidNextStep = nextStep && typeof nextStep === 'string' && nextStep.trim() !== '';
      
      if (isValidNextStep) {
        // If API returns a valid step string, use it for adults
        if (nextStep === 'PARENT_CONSENT') {
          router.push('/onboarding/parent-consent');
          return;
        } else if (nextStep === 'LOCATION') {
          router.push('/onboarding/location');
          return;
        } else if (nextStep === 'PROFILE_PHOTO') {
          router.push('/onboarding/photo');
          return;
        } else {
          // For any other step from API
          const route = getRouteFromStep(nextStep);
          if (route) {
            router.push(route);
            return;
          }
        }
      }

      // Default for adults: go to location
      console.log('Navigating to location (adult)');
      router.push('/onboarding/location');
    } catch (err) {
      console.error('DOB save error:', err);
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;
      
      // Handle state mismatch errors
      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;
        if (nextStep) {
          const route = getRouteFromStep(nextStep);
          router.push(route);
          return;
        }
      }
      
      const message = getErrorMessage(errorCode) || errorMsg || 'Failed to save date of birth. Please try again.';
      setError(message);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // const handleSkip = () => router.push('/onboarding/location');

  if (initialLoading) {
    return (
      <div className=" flex  items-center justify-center" style={{ backgroundColor: '#111113' }}>
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const monthLabel = months[monthIndex];
  const confirmLabel = `${monthLabel} ${selectedDay}, ${selectedYear}`;

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-start px-6 pt-6 "
      style={{ backgroundColor: '#111113' }}
    >
      <div className="w-full max-w-sm flex flex-col space-y-8">
        {/* Header */}
        {/* <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/onboarding/gender')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[30%]" />
          </div>
        </div> */}

        {/* Title */}
        <div className="text-center ">
        <h1 className="text-3xl font-bold tracking-tight">
  {(screenConfig?.title || "How Old Are You")
    .split(" ")
    .map((word, index) => (
      <span
        key={index}
        className={
          index === 1
            ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
            : ""
        }
      >
        {word}{" "}
      </span>
    ))}
</h1>
<p className="mt-2 text-gray-400 text-sm font-Poppins">
  {screenConfig?.subtitle || "Helps us personalize your experience"}
</p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2 mb-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drum Pickers */}
        <div className="flex-1 flex items-center font-Poppins">
  <div
    className="w-full rounded-xl overflow-hidden p-[1px]"
    style={{
      background: "linear-gradient(160deg, #1c1c1f, #151518)",
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: `
        0 10px 30px rgba(0,0,0,0.6),
        0 0 25px rgba(239,58,255,0.15),
        0 0 35px rgba(255,131,25,0.12)
      `
    }}
  >
    <div
      className="rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #1c1c1f, #151518)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 0 20px rgba(236,72,153,0.15)",
      }}
    >
      <div className="grid grid-cols-3">
        {/* Day */}
        <DrumPicker
          items={days}
          selectedIndex={dayIndex}
          onIndexChange={setDayIndex}
          formatLabel={(d) => String(d).padStart(2, "0")}
        />

        {/* Month */}
        <DrumPicker
          items={months}
          selectedIndex={monthIndex}
          onIndexChange={setMonthIndex}
        />

        {/* Year */}
        <DrumPicker
          items={years}
          selectedIndex={yearIndex}
          onIndexChange={setYearIndex}
        />
      </div>
    </div>
  </div>
</div>

        {/* Confirm Sheet */}
        {showConfirm ? (
          <div
            className="mt-6 rounded-2xl p-5 text-center font-Poppins"
            style={{
              background: "linear-gradient(160deg, #1c1c1f, #151518)",
              border: "2px solid rgba(255,255,255,0.05)",
              boxShadow: `
                0 10px 30px rgba(0,0,0,0.6),
                0 0 25px rgba(239,58,255,0.15),
                0 0 35px rgba(255,131,25,0.12)
              `
            }}
          >
           <p className="text-white font-bold text-lg mb-1">
  You're{" "}
  <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
    {age}
  </span>
</p>
            <p className="text-gray-400 text-sm mb-4">
              Is {confirmLabel} your birthday? This can only be changed once.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-full font-Poppins font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #e8506a, #e8923a)' }}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin font-Poppins " />Saving...</> : 'Continue'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="mt-3 text-gray-400 text-sm hover:text-white transition-colors w-full py-2"
            >
              Edit
            </button>
          </div>
        ) : (
        
            <button
              onClick={handleContinuePress}
              disabled={loading}
              className="w-full font-Poppins py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #EF3AFF, #FF8319)' }}
            >
              {screenConfig?.button_text?.primary || "Continue"}
            </button>
         
        
        )}

        <div/>
      </div>
    </div>
  );
}
