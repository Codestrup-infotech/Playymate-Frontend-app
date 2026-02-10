"use client";
import React, { useState } from "react";

const PhysicalActivityFlow = () => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(160);
  const [bloodType, setBloodType] = useState({ type: "A", rh: "+" });

  // Common UI Styles
  const gradientText = "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent";
  const gradientBtn = "bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-4 px-10 rounded-full w-full max-w-xs shadow-lg transform active:scale-95 transition-all";

  // --- SUB-COMPONENTS FOR SCREENS ---

  const IntroScreen = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn px-28">
      <div className="bg-[#1A1A1A] px-6 py-10 rounded-3xl border border-[#1FCCF2] text-center  ">
        <h1 className={`text-4xl font-serif font-bold mb-4 ${gradientText}`}>Physical Activity Preferences</h1>
        <p className="text-gray-400 text-md leading-relaxed mb-6 font-Poppins ">
     We’ll ask a few questions to understand your fitness level and activity interests. This helps us recommend activities that are safer and more suitable for you.
        </p>
        <p className="text-gray-600 text-md mb-8">Your information is secure and never shared.</p>
        <label className="flex items-start text-xs text-gray-500 text-left gap-2 cursor-pointer">
          <input type="checkbox" className="mt-1 accent-orange-500 text-md text-white " />
          <p className="text-[13px] text-gray-400 font-Poppins">I understand and agree to answer questions about my physical activity preferences.</p>
        </label>
      </div>

      <div className="text-md font-Poppins text-gray-500">By continuing, you agree to Playmate’s Term & Privacy Policy.</div>
      
      <button onClick={() => setStep(2)} className={gradientBtn}>Continue</button>
    </div>
  );

  const WeightScreen = () => (
    <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn">
      <h2 className="text-3xl font-bold text-white">What's your <span className={gradientText}>Weight</span></h2>
      
      <div className="relative w-full flex flex-col items-center">
        <div className="text-5xl font-bold text-white mb-10">{weight} <span className="text-lg text-gray-400">Kg</span></div>
        
        {/* Mock Weight Ruler */}
        <div className="w-full overflow-x-auto no-scrollbar flex items-end gap-4 px-1/2 cursor-pointer" 
             onScroll={(e) => {
               const val = Math.floor(e.target.scrollLeft / 10) + 40;
               if(val > 30 && val < 150) setWeight(val);
             }}>
          <div className="flex items-end h-24 gap-2 pb-2">
             {[...Array(100)].map((_, i) => (
               <div key={i} className={`bg-gray-600 transition-all ${i % 5 === 0 ? 'h-12 w-0.5' : 'h-6 w-0.5'}`} />
             ))}
          </div>
          {/* Center Indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-20 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      <button onClick={() => setStep(3)} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full shadow-xl">
        <CheckIcon />
      </button>
    </div>
  );

  const HeightScreen = () => (
    <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn">
      <h2 className="text-3xl font-bold text-white">What's your <span className={gradientText}>Height</span></h2>
      
      <div className="flex items-center justify-around w-full">
        <div className="text-5xl font-bold text-white">{height} <span className="text-lg text-gray-400">cm</span></div>
        
        {/* Mock Vertical Height Ruler */}
        <div className="h-64 overflow-y-auto no-scrollbar relative border-r border-gray-700 pr-4">
           {[...Array(100)].map((_, i) => (
             <div key={i} className="flex items-center justify-end gap-2 mb-2">
               {i % 5 === 0 && <span className="text-[10px] text-gray-500">{200 - i}</span>}
               <div className={`bg-gray-600 ${i % 5 === 0 ? 'w-8 h-0.5' : 'w-4 h-0.5'}`} />
             </div>
           ))}
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[15px] border-r-pink-500" />
        </div>
      </div>

      <button onClick={() => setStep(4)} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full">
        <CheckIcon />
      </button>
    </div>
  );

  const BloodGroupScreen = () => (
    <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn text-white">
      <h2 className="text-3xl font-bold">What's your <span className={gradientText}>Blood Group</span></h2>
      
      <div className="flex gap-2 bg-[#222] p-1 rounded-full">
        {['A', 'B', 'AB', 'O'].map(type => (
          <button 
            key={type}
            onClick={() => setBloodType({...bloodType, type})}
            className={`px-6 py-2 rounded-full transition-all ${bloodType.type === type ? 'bg-gradient-to-r from-pink-500 to-orange-400' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className={`text-9xl font-black ${gradientText}`}>{bloodType.type}<sup className="text-5xl">{bloodType.rh}</sup></div>
        <div className="flex items-center justify-center gap-8 mt-4 text-4xl">
           <button onClick={() => setBloodType({...bloodType, rh: '+'})} className={bloodType.rh === '+' ? 'text-orange-500' : 'text-gray-600'}>+</button>
           <span className="text-gray-700 text-xl">or</span>
           <button onClick={() => setBloodType({...bloodType, rh: '-'})} className={bloodType.rh === '-' ? 'text-orange-500' : 'text-gray-600'}>-</button>
        </div>
      </div>

      <button onClick={() => alert("Profile Completed!")} className="bg-gradient-to-r from-pink-500 to-orange-400 p-4 rounded-full">
        <CheckIcon />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-1/2  overflow-hidden relative shadow-2xl">
        {/* Header Navigation */}
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="absolute top-8 left-8 text-white z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}

        {/* Dynamic Screen Rendering */}
        <div className="h-full px-6 flex flex-col justify-center">
          {step === 1 && <IntroScreen />}
          {step === 2 && <WeightScreen />}
          {step === 3 && <HeightScreen />}
          {step === 4 && <BloodGroupScreen />}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export default PhysicalActivityFlow;