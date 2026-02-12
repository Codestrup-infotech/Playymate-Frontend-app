// "use client";
// import React, { useState } from "react";

// const PhysicalActivityFlow = () => {
//   const [step, setStep] = useState(1);
//   const [weight, setWeight] = useState(62);
//   const [height, setHeight] = useState(160);
//   const [bloodType, setBloodType] = useState({ type: "A", rh: "+" });

//   // Common UI Styles
//   const gradientText = "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent";
//   const gradientBtn = "bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-4 px-10 rounded-full w-full max-w-xs shadow-lg transform active:scale-95 transition-all";

//   // --- SUB-COMPONENTS FOR SCREENS ---

//   const IntroScreen = () => (
//     <div className="flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn px-28">
//       <div className="bg-[#1A1A1A] px-6 py-10 rounded-3xl border border-[#1FCCF2] text-center  ">
//         <h1 className={`text-4xl font-serif font-bold mb-4 ${gradientText}`}>Physical Activity Preferences</h1>
//         <p className="text-gray-400 text-md leading-relaxed mb-6 font-Poppins ">
//      We’ll ask a few questions to understand your fitness level and activity interests. This helps us recommend activities that are safer and more suitable for you.
//         </p>
//         <p className="text-gray-600 text-md mb-8">Your information is secure and never shared.</p>
//         <label className="flex items-start text-xs text-gray-500 text-left gap-2 cursor-pointer">
//           <input type="checkbox" className="mt-1 accent-orange-500 text-md text-white " />
//           <p className="text-[13px] text-gray-400 font-Poppins">I understand and agree to answer questions about my physical activity preferences.</p>
//         </label>
//       </div>

//       <div className="text-md font-Poppins text-gray-500">By continuing, you agree to Playmate’s Term & Privacy Policy.</div>
      
//       <button onClick={() => setStep(2)} className={gradientBtn}>Continue</button>
//     </div>
//   );

//   const WeightScreen = () => (
//     <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn">
//       <h2 className="text-3xl font-bold text-white">What's your <span className={gradientText}>Weight</span></h2>
      
//       <div className="relative w-full flex flex-col items-center">
//         <div className="text-5xl font-bold text-white mb-10">{weight} <span className="text-lg text-gray-400">Kg</span></div>
        
//         {/* Mock Weight Ruler */}
//         <div className="w-full overflow-x-auto no-scrollbar flex items-end gap-4 px-1/2 cursor-pointer" 
//              onScroll={(e) => {
//                const val = Math.floor(e.target.scrollLeft / 10) + 40;
//                if(val > 30 && val < 150) setWeight(val);
//              }}>
//           <div className="flex items-end h-24 gap-2 pb-2">
//              {[...Array(100)].map((_, i) => (
//                <div key={i} className={`bg-gray-600 transition-all ${i % 5 === 0 ? 'h-12 w-0.5' : 'h-6 w-0.5'}`} />
//              ))}
//           </div>
//           {/* Center Indicator */}
//           <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-20 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
//         </div>
//       </div>

//       <button onClick={() => setStep(3)} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full shadow-xl">
//         <CheckIcon />
//       </button>
//     </div>
//   );

//   const HeightScreen = () => (
//     <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn">
//       <h2 className="text-3xl font-bold text-white">What's your <span className={gradientText}>Height</span></h2>
      
//       <div className="flex items-center justify-around w-full">
//         <div className="text-5xl font-bold text-white">{height} <span className="text-lg text-gray-400">cm</span></div>
        
//         {/* Mock Vertical Height Ruler */}
//         <div className="h-64 overflow-y-auto no-scrollbar relative border-r border-gray-700 pr-4">
//            {[...Array(100)].map((_, i) => (
//              <div key={i} className="flex items-center justify-end gap-2 mb-2">
//                {i % 5 === 0 && <span className="text-[10px] text-gray-500">{200 - i}</span>}
//                <div className={`bg-gray-600 ${i % 5 === 0 ? 'w-8 h-0.5' : 'w-4 h-0.5'}`} />
//              </div>
//            ))}
//            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[15px] border-r-pink-500" />
//         </div>
//       </div>

//       <button onClick={() => setStep(4)} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full">
//         <CheckIcon />
//       </button>
//     </div>
//   );

//   const BloodGroupScreen = () => (
//     <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn text-white">
//       <h2 className="text-3xl font-bold">What's your <span className={gradientText}>Blood Group</span></h2>
      
//       <div className="flex gap-2 bg-[#222] p-1 rounded-full">
//         {['A', 'B', 'AB', 'O'].map(type => (
//           <button 
//             key={type}
//             onClick={() => setBloodType({...bloodType, type})}
//             className={`px-6 py-2 rounded-full transition-all ${bloodType.type === type ? 'bg-gradient-to-r from-pink-500 to-orange-400' : ''}`}
//           >
//             {type}
//           </button>
//         ))}
//       </div>

//       <div className="text-center">
//         <div className={`text-9xl font-black ${gradientText}`}>{bloodType.type}<sup className="text-5xl">{bloodType.rh}</sup></div>
//         <div className="flex items-center justify-center gap-8 mt-4 text-4xl">
//            <button onClick={() => setBloodType({...bloodType, rh: '+'})} className={bloodType.rh === '+' ? 'text-orange-500' : 'text-gray-600'}>+</button>
//            <span className="text-gray-700 text-xl">or</span>
//            <button onClick={() => setBloodType({...bloodType, rh: '-'})} className={bloodType.rh === '-' ? 'text-orange-500' : 'text-gray-600'}>-</button>
//         </div>
//       </div>

//       <button onClick={() => alert("Profile Completed!")} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full">
//         <CheckIcon />
//       </button>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
//       <div className="w-1/2  overflow-hidden relative shadow-2xl">
//         {/* Header Navigation */}
//         {step > 1 && (
//           <button onClick={() => setStep(step - 1)} className="absolute top-8 left-8 text-white z-10">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
//             </svg>
//           </button>
//         )}

//         {/* Dynamic Screen Rendering */}
//         <div className="h-full px-6 flex flex-col justify-center">
//           {step === 1 && <IntroScreen />}
//           {step === 2 && <WeightScreen />}
//           {step === 3 && <HeightScreen />}
//           {step === 4 && <BloodGroupScreen />}
//         </div>
//       </div>

//       <style dangerouslySetInnerHTML={{ __html: `
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
//       `}} />
//     </div>
//   );
// };

// const CheckIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-8 h-8">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
//   </svg>
// );

// export default PhysicalActivityFlow;



"use client";

import { useState, useRef, useEffect } from "react";

export default function PhysicalPreferences() {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(160);
  const [blood, setBlood] = useState("A+");

    const [introAgree, setIntroAgree] = useState(false);
  const [weightAgree, setWeightAgree] = useState(false);

  const nextDisabled =
    (step === 1 && !introAgree) ||
    (step === 2 && !weightAgree);

  const goNext = () => {
    if (!nextDisabled) setStep((s) => s + 1);
  };

  const goBack = () => {
    setStep((s) => s - 1);
  };
  

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4 overflow-hidden">
      <div className="w-full max-w-sm">
        {step === 1 && <Intro agree={introAgree} setAgree={setIntroAgree} onNext={goNext} disabled={nextDisabled} />}


        {step === 2 && (
          <WeightStep
            value={weight}  
            agree={weightAgree}
            setAgree={setWeightAgree}
            setValue={setWeight}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            disabled={nextDisabled}
          />
        )}

        {step === 3 && (
          <HeightPicker
            value={height}
            setValue={setHeight}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <BloodStep
            value={blood}
            setValue={setBlood}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- STEP 1: INTRO ---------------- */

function Intro({ agree, setAgree, onNext, disabled }) {
  return (
    <div className="flex flex-col justify-between py-10 ">
      <div className="text-white text-xl cursor-pointer mb-6 ">←</div>
      <div className="rounded-2xl border border-blue-500/40 bg-[#1c1c1c] py-12 px-4 text-center">
        <h2 className="text-4xl font-bold mb-5 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
          Physical Activity <br /> Preferences
        </h2>
        <p className="text-sm text-gray-300 mb-5 font-Poppins ">
         We’ll ask a few questions to understand your fitness level and activity interests. This helps us recommend activities that are safer and more suitable for you.
        </p>

        <p className="text-[14px] font-Poppins text-gray-400 mb-4 ">Your information is secure and never shared</p>
        
       <label className="flex items-start gap-3 text-xs text-gray-300 text-left font-Poppins">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 accent-pink-500"
          />
          <span>
            I understand and agree to answer questions about my physical
            activity preferences
          </span>
        </label>


      </div>

<div>
  <p className="font-Poppins text-center text-[#697586] py-6">By continuing, you agree to Playmate’s Term & Privacy Policy.</p>
</div>

      <button
        onClick={onNext}
        disabled={disabled}
        className={`w-full py-4 rounded-full transition font-Poppins ${
          disabled
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
        }`}
      >
        Continue
      </button>
    </div>
  );
}

/* ---------------- STEP 2: WEIGHT (SCROLL LOGIC) ---------------- */

function WeightStep({ value, setValue, setAgree, agree, onNext, onBack ,disabled}) {
  const [unit, setUnit] = useState("kg");

  return (
    <div className="flex flex-col items-center  ">
      <div className="w-full text-xl mb-6 cursor-pointer " onClick={onBack}>←</div>
      <h2 className="text-4xl text-center mb-10 font-Playfair Display font-semibold   ">
        What’s your <span className="text-orange-400">Weight</span>
      </h2>
    

   <div className="flex justify-center mb-8 font-Poppins">
  {/* Container */}
  <div className="relative flex bg-[#1f1f1f] rounded-full p-1 w-48 h-10 items-center cursor-pointer">
    
    {/* Sliding Background Indicator */}
    <div 
      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-[#1A43CA] to-[#1FCCF2] ${
        unit === "kg" ? "left-[calc(50%+2px)]" : "left-1"
      }`}
    />

    {/* Lbs Button */}
    <button
      onClick={() => setUnit("lbs")}
      className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${
        unit === "lbs" ? "text-white" : "text-gray-400"
      }`}
    >
      Lbs
    </button>

    {/* Kg Button */}
    <button
      onClick={() => setUnit("kg")}
      className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${
        unit === "kg" ? "text-white" : "text-gray-400"
      }`}
    >
      kg
    </button>
  </div>
</div>



      <div className="text-center mb-10">
        <div className="text-5xl font-Poppins font-semibold ">
          {value} <span className="text-xl not-italic font-light text-white">{unit}</span>
        </div>
      </div>

      <WeightRuler value={value} setValue={setValue} />


<div className="text-center font-Poppins text-white/60 font-normal text-[14px] py-10">
  Note:  If you do not know your current weight, select “Not Sure” and visit your nearest Playmate Center for proper weight check.
  </div>

 {/* <label className="flex items-start gap-2  text-gray-300  font-Poppins text-center">
          <input type="checkbox" className="mt-1 accent-pink-500  " />
          <span>I agree to answer questions about my physical activity.</span>
        </label> */}



         <label className="flex items-start gap-2  text-gray-300  font-Poppins text-center">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 accent-pink-500"
          />
          <span>
            I understand and agree to answer questions about my physical
            activity preferences
          </span>
        </label>



      <button
        onClick={onNext}
        disabled={disabled}
        className="mt-12 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl flex items-center justify-center"
      >
        ✓
      </button>
    </div>
  );
}

function WeightRuler({ value, setValue }) {
  const containerRef = useRef(null);
  const touchStart = useRef(0);
  const min = 1;
  const max = 150;
  const stepWidth = 15;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      // Scroll Down (e.deltaY > 0) -> Increase Weight
      const direction = e.deltaY > 0 ? 1 : -1;
      setValue((prev) => Math.min(Math.max(prev + direction, min), max));
    };

    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEnd = e.touches[0].clientY;
      const delta = touchStart.current - touchEnd;

      if (Math.abs(delta) > 10) { // Sensitivity threshold
        const direction = delta > 0 ? 1 : -1;
        setValue((prev) => Math.min(Math.max(prev + direction, min), max));
        touchStart.current = touchEnd; // Reset start to current for continuous scroll
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [setValue]);

  const scrollOffset = (value - min) * stepWidth;

  return (
    <div className="relative w-full h-20 flex items-center font-Poppins justify-center overflow-hidden touch-none" ref={containerRef}>
      {/* Selection Indicator */}
      <div className="absolute left-1/2 bottom-0 h-14 w-[2px] bg-pink-500 z-20 -translate-x-1/2" />
      
      {/* Ruler Track */}
      <div 
        className="flex items-end transition-transform duration-150 ease-out"
        style={{ transform: `translateX(calc(50% - ${scrollOffset}px - ${stepWidth/2}px))` }}
      >
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const v = min + i;
          const isMajor = v % 5 === 0;
          return (
            <div key={v} className="flex flex-col items-center shrink-0" style={{ width: stepWidth }}>
              {isMajor && <span className="text-[20px] text-white mb-4">{v}</span>}
              
              <div className={`w-[1px] ${isMajor ? "h-8 bg-white text-md font-bold" : "h-4 bg-white font-bold "}`} 
              
              
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- STEP 2: Height (SCROLL LOGIC) ---------------- */



 function HeightPicker({
  initialValue = 160,
  onChange,
}) {
  // CONFIG
  const MIN = 100;
  const MAX = 200;
  const VISUAL_MIN = 80;
  const VISUAL_MAX = 220;

  const STEP_HEIGHT = 16;
  const SCROLL_SENSITIVITY = 0.004;
  const SPRING = 0.12;
  const DAMPING = 0.82;

  // SMOOTH STATE
  const position = useRef(initialValue);
  const velocity = useRef(0);
  const raf = useRef(null);

  const [height, setHeight] = useState(initialValue);

  // PHYSICS LOOP
  const animate = () => {
    velocity.current *= DAMPING;
    position.current += velocity.current;

    if (position.current < MIN) {
      velocity.current += (MIN - position.current) * SPRING;
    }
    if (position.current > MAX) {
      velocity.current += (MAX - position.current) * SPRING;
    }

    const snapped = Math.round(position.current);
    const clamped = Math.min(Math.max(snapped, MIN), MAX);

    if (clamped !== height) {
      setHeight(clamped);
      if (onChange) onChange(clamped);
    }

    raf.current = requestAnimationFrame(animate);
  };

  // INPUT
  useEffect(() => {
    raf.current = requestAnimationFrame(animate);

    const onWheel = (e) => {
      e.preventDefault();
      velocity.current += e.deltaY * SCROLL_SENSITIVITY;
    };

    let lastTouch = 0;

    const onTouchStart = (e) => {
      lastTouch = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      velocity.current += (lastTouch - y) * SCROLL_SENSITIVITY * 6;
      lastTouch = y;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [height, onChange]);

  // RULER OFFSET
  const offset = (position.current - VISUAL_MIN) * STEP_HEIGHT;

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center overflow-hidden select-none">
      {/* VALUE */}
      <div className="mr-20 flex items-baseline gap-2">
        <span className="text-8xl font-black">{height}</span>
        <span className="text-3xl text-gray-400">cm</span>
      </div>

      {/* RULER */}
      <div className="relative h-screen w-40 flex items-center justify-end pointer-events-none">
        {/* POINTER */}
        <div className="absolute right-0 z-30 w-0 h-0 border-y-[12px] border-y-transparent border-r-[18px] border-r-pink-500 drop-shadow-[0_0_10px_#ec4899]" />

        {/* TRACK */}
        <div
          className="flex flex-col will-change-transform"
          style={{
            transform: `translateY(calc(50% - ${offset}px))`,
          }}
        >
          {Array.from(
            { length: VISUAL_MAX - VISUAL_MIN + 1 },
            (_, i) => VISUAL_MIN + i
          ).map((val) => {
            const isMajor = val % 5 === 0;
            const outOfRange = val < MIN || val > MAX;

            return (
              <div
                key={val}
                className="flex items-center justify-end"
                style={{ height: STEP_HEIGHT }}
              >
                {isMajor && (
                  <span
                    className={`mr-6 text-xl font-bold transition-all ${
                      outOfRange
                        ? "text-gray-700 blur-[1px] opacity-30"
                        : height === val
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {val}
                  </span>
                )}

                <div
                  className={`transition-all ${
                    isMajor ? "h-[3px]" : "h-[1px]"
                  } ${
                    outOfRange
                      ? "bg-gray-800 w-6 blur-[1px] opacity-30"
                      : height === val
                      ? "bg-white w-14"
                      : "bg-gray-500 w-8"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-10 text-gray-600 text-xs tracking-widest uppercase">
        Scroll or swipe to adjust
      </div>
    </div>
  );
}

  



//Blood Group

function BloodStep({ value, setValue, onBack }) {
  const [group, setGroup] = useState(value?.replace(/[+-]/, "") || "A");
  const [rh, setRh] = useState(value?.includes("-") ? "-" : "+");

  const updateValue = (g, r) => {
    setGroup(g);
    setRh(r);
    setValue(`${g}${r}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 py-6">

      {/* TOP BAR */}
      <div className="text-xl mb-6 cursor-pointer" onClick={onBack}>
        ←
      </div>

      {/* TITLE */}
      <h2 className="text-3xl text-center mb-6 font-semibold font-Playfair Display ">
        What’s your <span className="text-orange-400">Blood</span><br />
        <span className="text-orange-400">Group</span>
      </h2>

      {/* GROUP SELECTOR */}
      <div className="flex justify-center mb-10 font-Poppins ">
        <div className="flex bg-[#1f1f1f] rounded-full p-1 w-[260px]">
          {["A", "B", "AB", "O"].map((g) => (
            <button
              key={g}
              onClick={() => updateValue(g, rh)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition
                ${
                  group === g
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : "text-gray-300"
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* BIG VALUE */}
      <div className="text-center mb-10 font-Poppins ">
        <div className="text-[90px] font-extrabold leading-none text-red-500">
          {group}
          <span className="text-4xl align-top ml-1">{rh}</span>
        </div>
      </div>

      {/* + / - SELECTOR */}
      <div className="flex justify-center items-center gap-6 mb-10 font-Poppins">
        <button
          onClick={() => updateValue(group, "+")}
          className={`text-3xl font-bold ${
            rh === "+" ? "text-red-500" : "text-gray-500"
          }`}
        >
          +
        </button>

        <span className="text-sm text-gray-400">or</span>

        <button
          onClick={() => updateValue(group, "-")}
          className={`text-3xl font-bold ${
            rh === "-" ? "text-red-500" : "text-gray-500"
          }`}
        >
          −
        </button>
      </div>

      {/* CONFIRM */}
      <div className="flex justify-center mb-6">
        <button
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl shadow-lg"
        >
          ✓
        </button>
      </div>

      {/* NOTE */}
      <p className="text-[14px] text-white/80 font-normal  text-center mb-4 font-Poppins  ">
        Note: If you do not know your current blood group,
        select “Not Sure” and visit your nearest Playmate
        Center for proper check.
      </p>

      {/* CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-gray-400 font-Poppins justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>
    </div>
  );
}

