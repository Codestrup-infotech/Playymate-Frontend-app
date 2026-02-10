"use client";

import { useState, useRef, useEffect } from "react";

export default function PhysicalPreferences() {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(160);
  const [blood, setBlood] = useState("A+");

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4">
      <div className="w-full max-w-sm">

        {step === 1 && <Intro onNext={() => setStep(2)} />}

        {step === 2 && (
          <WeightStep
            value={weight}
            setValue={setWeight}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <HeightStep
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

/* ---------------- STEP 1 ---------------- */

function Intro({ onNext }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between px-4 py-6">

      {/* TOP BACK ICON */}
      <div className="text-white text-xl">←</div>

      {/* CENTER CARD */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-blue-500/40 bg-[#1c1c1c] p-6 text-center">

          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            Physical Activity <br /> Preferences
          </h2>

          <p className="text-sm text-gray-300 mb-4">
            We’ll ask a few questions to understand your fitness level and activity interests.
            This helps us recommend activities that are safer and more suitable for you.
          </p>

          <p className="text-xs text-gray-500 mb-6">
            Your information is secure and never shared.
          </p>

          {/* CHECKBOX */}
          <label className="flex items-start gap-3 text-xs text-gray-300 text-left">
            <input
              type="checkbox"
              className="mt-1 accent-pink-500"
            />
            <span>
              I understand and agree to answer questions about my physical activity preferences
            </span>
          </label>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 mb-4">
        By continuing, you agree to Playmate’s{" "}
        <span className="underline">Terms</span> &{" "}
        <span className="underline">Privacy Policy</span>.
      </div>

      {/* CTA BUTTON */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 font-semibold text-white"
      >
        Continue
      </button>
    </div>
  );
}


/* ---------------- STEP 2 ---------------- */





/* =======================
   WEIGHT RULER (SAME FILE)
   ======================= */
function WeightRuler({ value, setValue }) {
  const ref = useRef(null);

  const min = 20;
  const max = 90;
  const stepWidth = 12;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const centerOffset = el.clientWidth / 2;

    el.scrollLeft =
      (value - min) * stepWidth +
      stepWidth / 2 -
      centerOffset;
  }, [value]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const centerOffset = el.clientWidth / 2;

    // 🔑 THIS IS THE FIX
    const raw =
      el.scrollLeft +
      centerOffset -
      stepWidth / 2;

    const index = Math.round(raw / stepWidth);
    const newValue = min + index;

    if (newValue >= min && newValue <= max) {
      setValue(newValue);
    }
  };

  return (
    <div className="relative w-full">

      {/* CENTER LINE */}
      <div className="absolute left-1/2 top-0 h-14 w-[2px] bg-white z-10 -translate-x-1/2 pointer-events-none" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto overflow-y-hidden"
        style={{
          paddingLeft: "50%",
          paddingRight: "50%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const v = min + i;
          const isMajor = v % 5 === 0;

          return (
            <div
              key={v}
              className="flex flex-col items-center shrink-0"
              style={{ width: stepWidth }}
            >
              <div
                className={`w-[2px] bg-white ${
                  isMajor ? "h-10" : "h-6"
                }`}
              />
              {isMajor && (
                <span className="text-[10px] text-gray-400 mt-1">
                  {v}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* =======================
   WEIGHT STEP (SAME FILE)
   ======================= */
 function WeightStep({ value, setValue, onNext, onBack }) {
  const [unit, setUnit] = useState("kg");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 py-6">

      {/* TOP BAR */}
      <div className="text-xl mb-6 cursor-pointer" onClick={onBack}>
        ←
      </div>

      {/* TITLE */}
      <h2 className="text-2xl text-center mb-4">
        What’s your <span className="text-orange-400">Weight</span>
      </h2>

      {/* UNIT TOGGLE */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-[#1f1f1f] rounded-full p-1 w-48">
          <button
            onClick={() => setUnit("lbs")}
            className={`flex-1 py-2 text-sm ${
              unit === "lbs" ? "text-white" : "text-gray-400"
            }`}
          >
            Lbs
          </button>
          <button
            onClick={() => setUnit("kg")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              unit === "kg"
                ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white"
                : "text-gray-400"
            }`}
          >
            kg
          </button>
        </div>
      </div>

      {/* VALUE */}
      <div className="text-center mb-10">
        <div className="text-4xl font-bold">
          {value} <span className="text-lg">{unit}</span>
        </div>
      </div>

      {/* RULER */}
      <div className="w-full">
        <WeightRuler value={value} setValue={setValue} />
      </div>

      {/* CONFIRM BUTTON */}
      <div className="flex justify-center mt-10 mb-6">
        <button
          onClick={onNext}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl"
        >
          ✓
        </button>
      </div>

      {/* NOTE */}
      <p className="text-xs text-gray-400 text-center mb-4">
        Note: If you do not know your current weight,
        select “Not Sure” and visit your nearest Playmate
        Center for proper weight check.
      </p>

      {/* CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>
    </div>
  );
}


/* ---------------- STEP 3 ---------------- */



function HeightStep({ value, setValue, onNext, onBack }) {
  const [unit, setUnit] = useState("cm");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 py-6">

      {/* TOP BAR */}
      <div className="text-xl mb-6 cursor-pointer" onClick={onBack}>
        ←
      </div>

      {/* TITLE */}
      <h2 className="text-2xl text-center mb-4">
        What’s your <span className="text-orange-400">Height</span>
      </h2>

      {/* UNIT TOGGLE */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-[#1f1f1f] rounded-full p-1 w-48">
          <button
            onClick={() => setUnit("ft")}
            className={`flex-1 py-2 rounded-full text-sm ${
              unit === "ft" ? "text-gray-300" : ""
            }`}
          >
            ft
          </button>

          <button
            onClick={() => setUnit("cm")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold
              ${
                unit === "cm"
                  ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white"
                  : "text-gray-300"
              }`}
          >
            cm
          </button>
        </div>
      </div>

      {/* VALUE */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold">
          {value} <span className="text-lg font-medium">{unit}</span>
        </div>
      </div>

      {/* RULER + POINTER */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* POINTER */}
          <div className="absolute right-[-18px] top-1/2 -translate-y-1/2">
            <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-pink-500" />
          </div>

          <VerticalRuler
            min={0}
            max={200}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>

      {/* CONFIRM BUTTON */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onNext}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-2xl shadow-lg"
        >
          ✓
        </button>
      </div>

      {/* NOTE */}
      <p className="text-xs text-gray-400 text-center mb-4">
        Note: If you do not know your current height,
        select “Not Sure” and visit your nearest Playmate
        Center for proper height check.
      </p>

      {/* CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>
    </div>
  );
}

/* ---------------- STEP 4 ---------------- */



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
      <h2 className="text-2xl text-center mb-6">
        What’s your <span className="text-orange-400">Blood</span><br />
        <span className="text-orange-400">Group</span>
      </h2>

      {/* GROUP SELECTOR */}
      <div className="flex justify-center mb-10">
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
      <div className="text-center mb-10">
        <div className="text-[90px] font-extrabold leading-none text-red-500">
          {group}
          <span className="text-4xl align-top ml-1">{rh}</span>
        </div>
      </div>

      {/* + / - SELECTOR */}
      <div className="flex justify-center items-center gap-6 mb-10">
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
      <p className="text-xs text-gray-400 text-center mb-4">
        Note: If you do not know your current blood group,
        select “Not Sure” and visit your nearest Playmate
        Center for proper check.
      </p>

      {/* CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <input type="checkbox" className="accent-pink-500" />
        Not Sure – Visit nearest Playmate Center
      </label>
    </div>
  );
}


/* ---------------- COMMON UI ---------------- */

function Header({ title, highlight }) {
  return (
    <h2 className="text-xl mb-6 text-center">
      {title} <span className="text-orange-400">{highlight}</span>
    </h2>
  );
}

function ValueDisplay({ children }) {
  return (
    <div className="text-4xl font-bold text-center mb-6">
      {children}
    </div>
  );
}

function StepActions({ onNext, onBack, isLast }) {
  return (
    <div className="mt-10 flex gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="w-1/3 py-4 rounded-full border border-gray-600"
        >
          Back
        </button>
      )}

      <PrimaryButton onClick={onNext}>
        {isLast ? "Finish" : "Next"}
      </PrimaryButton>
    </div>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 font-semibold"
    >
      {children}
    </button>
  );
}

/* ---------------- SCROLLABLE WEIGHT ---------------- */

function HorizontalRuler({ min, max, value, onChange }) {
  const ref = useRef(null);
  const itemWidth = 40;

  useEffect(() => {
    ref.current.scrollLeft =
      (value - min) * itemWidth -
      ref.current.offsetWidth / 2 +
      itemWidth / 2;
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-[2px] bg-orange-400 z-10" />

      <div
        ref={ref}
        className="flex overflow-x-scroll scrollbar-hide px-[50%] py-6"
        onScroll={(e) => {
          const center = e.target.scrollLeft + e.target.offsetWidth / 2;
          const index = Math.round(center / itemWidth);
          const val = min + index;
          if (val >= min && val <= max) onChange(val);
        }}
      >
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <div key={i} className="w-10 flex justify-center">
            <div className="h-10 w-[2px] bg-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SCROLLABLE HEIGHT ---------------- */

function VerticalRuler({ min, max, value, onChange }) {
  const ref = useRef(null);
  const itemHeight = 24;

  useEffect(() => {
    ref.current.scrollTop =
      (value - min) * itemHeight -
      ref.current.offsetHeight / 2 +
      itemHeight / 2;
  }, []);

  return (
    <div className="relative h-64 mx-auto w-20">
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-orange-400 z-10" />

      <div
        ref={ref}
        className="h-full overflow-y-scroll scrollbar-hide py-[50%]"
        onScroll={(e) => {
          const center = e.target.scrollTop + e.target.offsetHeight / 2;
          const index = Math.round(center / itemHeight);
          const val = min + index;
          if (val >= min && val <= max) onChange(val);
        }}
      >
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <div key={i} className="h-6 flex items-center">
            <div className="w-full h-[2px] bg-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- BLOOD GROUP SCROLL ---------------- */

function BloodGroupPicker({ value, setValue }) {
  const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const ref = useRef(null);
  const itemWidth = 70;

  useEffect(() => {
    const index = groups.indexOf(value);
    ref.current.scrollLeft =
      index * itemWidth -
      ref.current.offsetWidth / 2 +
      itemWidth / 2;
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-[2px] bg-orange-400 z-10" />

      <div
        ref={ref}
        className="flex overflow-x-scroll scrollbar-hide px-[50%] py-6"
        onScroll={(e) => {
          const center = e.target.scrollLeft + e.target.offsetWidth / 2;
          const index = Math.round(center / itemWidth);
          if (groups[index]) setValue(groups[index]);
        }}
      >
        {groups.map((g) => (
          <div
            key={g}
            className={`w-[70px] mx-2 py-4 text-center rounded-full font-semibold
              ${
                value === g
                  ? "bg-gradient-to-r from-pink-500 to-orange-400"
                  : "border border-gray-600 text-gray-300"
              }`}
          >
            {g}
          </div>
        ))}
      </div>

      <p className="text-center text-green-400 font-semibold mt-4">
        Selected: {value}
      </p>
    </div>
  );
}
