"use client";
import React from "react";
import { useState } from "react";

export default function PersonalVerifictionFlow() {
    const [step, setStep] = useState(1);

    const [data, setData] = useState({
        gender: "",
        dob: "",
        age: "",
        status: "",
    });

    const pic = [
        "/loginAvatars/map-bg.jpg"
    ];

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">

            {step === 1 && (
                <GenderStep
                    value={data.gender}
                    onSelect={(gender) =>
                        setData({ ...data, gender })
                    }
                    onNext={() => setStep(2)}
                />
            )}

            {step === 2 && (
                <AgeStep
                    data={data}
                    setData={setData}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <ParentConsentStep
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                />
            )}


            {step === 4 && (
                <LocationPermissionStep
                    onNext={() => setStep(5)}
                    onBack={() => setStep(3)}
                />
            )}

            {step === 5 && (
                <LocationPickerStep
                    onNext={() => setStep(6)}
                    onBack={() => setStep(4)}
                />
            )}


            {step === 6 && (
                <PhotoStep
                    onNext={() => setStep(7)}
                    onBack={() => setStep(5)}
                />
            )}

            {step === 7 && (
                <StatusStep
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(8)}
                    onBack={() => setStep(6)}
                />

            )}

            {step === 8 && (
                <CompleteProfileStep
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(9)}
                    onBack={() => setStep(7)}
                />

            )}


        </div>
    );
}


// STEP 1 — GENDER

function GenderStep({ value, onSelect, onNext }) {
    const genders = ["Male", "Female", "Other"];

    return (
        <div className="w-[340px] text-center">

            <h1 className="text-3xl font-serif">
                What’s Your <span className="text-pink-500">Gender</span>
            </h1>

            <p className="text-gray-400 mt-2">
                Tell us about your gender
            </p>

            <div className="mt-10 space-y-4">
                {genders.map((g) => (
                    <button
                        key={g}
                        onClick={() => onSelect(g)}
                        className={`w-full py-4 rounded-xl border transition
              ${value === g
                                ? "border-pink-500 bg-white/5 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                                : "border-gray-700"
                            }`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            <button
                disabled={!value}
                onClick={onNext}
                className="mt-10 w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
            >
                Continue
            </button>
        </div>
    );
}


// STEP 2 — AGE

function AgeStep({ data, setData, onNext, onBack }) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const years = Array.from(
        { length: 90 },
        (_, i) => new Date().getFullYear() - i
    );

    const [day, setDay] = React.useState(7);
    const [month, setMonth] = React.useState("Feb");
    const [year, setYear] = React.useState(2002);

    const age =
        new Date().getFullYear() - year;

    function confirmDob() {
        const dob = `${year}-${String(
            months.indexOf(month) + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        setData({ ...data, dob, age });
        onNext();
    }

    return (
        <div className="w-[360px] text-center">

            {/* HEADER */}
            <div className="flex items-center gap-12 mb-3">
                <button onClick={onBack} className="mt-6 mb-10 text-gray-400 text-3xl font-bold"> ← </button>
                <h1 className="text-3xl font-serif">
                    How <span className="text-pink-500">Old</span> Are You
                </h1>
            </div>

            <p className="text-gray-400 text-sm">
                Please provide your age in years
            </p>

            {/* WHEEL */}
            <div className="relative mt-12 h-[240px]">

                {/* fade overlays */}
                <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

                {/* center highlight */}
                <div className="absolute top-1/2 left-0 w-full h-[52px]
          -translate-y-1/2
          border-t border-b border-pink-500/40
          bg-pink-500/5 rounded-xl z-10 pointer-events-none"
                />

                <div className="grid grid-cols-3 h-full">

                    <WheelColumn
                        items={days}
                        value={day}
                        onChange={setDay}
                    />

                    <WheelColumn
                        items={months}
                        value={month}
                        onChange={setMonth}
                    />

                    <WheelColumn
                        items={years}
                        value={year}
                        onChange={setYear}
                        highlight
                    />

                </div>
            </div>

            {/* AGE CARD */}
            <div className="mt-12 border border-pink-500/40 rounded-2xl p-5
        bg-black/60
        shadow-[0_0_40px_rgba(236,72,153,0.35)]">

                <p className="text-xl font-semibold">
                    You’re {age}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                    Is {month} {day}, {year} your birthday?
                    This can only be changed once.
                </p>

                <button
                    onClick={confirmDob}
                    className="mt-6 w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500
            font-semibold tracking-wide"
                >
                    Continue
                </button>

                <button
                    onClick={onBack}
                    className="mt-3 text-sm text-gray-400"
                >
                    Edit
                </button>
            </div>

        </div>
    );
}


function WheelColumn({ items, value, onChange, highlight }) {
    const containerRef = React.useRef(null);
    const itemRefs = React.useRef([]);

    // find closest item when scrolling stops
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeout;

        function onScroll() {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                const center =
                    container.scrollTop +
                    container.offsetHeight / 2;

                let closestIndex = 0;
                let minDist = Infinity;

                itemRefs.current.forEach((el, idx) => {
                    if (!el) return;

                    const elCenter =
                        el.offsetTop + el.offsetHeight / 2;

                    const dist = Math.abs(elCenter - center);

                    if (dist < minDist) {
                        minDist = dist;
                        closestIndex = idx;
                    }
                });

                onChange(items[closestIndex]);
            }, 80);
        }

        container.addEventListener("scroll", onScroll);

        return () => container.removeEventListener("scroll", onScroll);
    }, [items, value]);

    // snap active into center
    React.useEffect(() => {
        const index = items.indexOf(value);
        const container = containerRef.current;
        const el = itemRefs.current[index];

        if (!container || !el) return;

        const offset =
            el.offsetTop -
            container.offsetHeight / 2 +
            el.offsetHeight / 2;

        container.scrollTo({
            top: offset,
            behavior: "smooth",
        });
    }, [value]);

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
            <div className="py-[96px] space-y-4">

                {items.map((item, idx) => {
                    const active = item === value;

                    return (
                        <div
                            key={item}
                            ref={(el) => (itemRefs.current[idx] = el)}
                            className={`snap-center text-center transition-all duration-200
                ${active
                                    ? highlight
                                        ? "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent text-2xl font-semibold"
                                        : "bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent text-2xl font-semibold"
                                    : "text-gray-500 opacity-30"
                                }`}
                        >
                            {item}
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

// STEP 3 — PARENT CONSENT

function ParentConsentStep({ onNext, onBack }) {
    const [checked, setChecked] = React.useState(false);

    return (
        <div className="w-[360px] h-[640px] text-white relative px-6">

            {/* BACK */}
            <button
                onClick={onBack}
                className="absolute top-4 left-2 text-xl"
            >
                ←
            </button>

            {/* CONTENT */}
            <div className="mt-24 text-center">

                <h1 className="text-3xl font-serif">
                    <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                        Parent Consent
                    </span>
                </h1>

                <p className="mt-6 text-gray-400 text-sm leading-relaxed">
                    To continue using Playmate, we need permission from a parent or
                    guardian. This helps us keep the experience safe and age-appropriate.
                </p>

                <p className="mt-4 text-gray-500 text-xs">
                    Your information is secure and never shared.
                </p>

                {/* CHECKBOX */}
                <label className="mt-10 flex items-start gap-3 text-left text-sm cursor-pointer">

                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-1 accent-pink-500"
                    />

                    <span>
                        I am parent or legal guardian and I give consent
                    </span>
                </label>

            </div>

            {/* FOOTER */}
            <div className="absolute bottom-8 left-0 w-full px-6">

                <button
                    disabled={!checked}
                    onClick={onNext}
                    className="w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400
            font-semibold
            disabled:opacity-40"
                >
                    Give Consent
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                    By continuing, you agree to Playmate’s Terms & Privacy Policy.
                </p>
            </div>

        </div>
    );
}



// STEP 4 — LOCATION
function LocationPermissionStep({ onNext, onBack }) {
    return (
        <div className="relative w-[360px] h-[640px] overflow-hidden bg-black">

            {/* MAP BACKGROUND IMAGE */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url( /loginAvatars/map.jpg)", // put image in /public/map-bg.jpg
                }}
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/20" />

            {/* PERMISSION CARD */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">

                <div className="bg-white rounded-2xl p-6 w-[280px] text-center shadow-2xl">

                    <div className="mx-auto w-14 h-14 flex items-center justify-center">
                        <span className="text-4xl">📍</span>
                    </div>

                    <h2 className="mt-4 font-bold text-lg text-black">
                        Location
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Allow maps to access your location while you use the app?
                    </p>

                    <button
                        onClick={onNext}
                        className="mt-6 w-full py-3 rounded-full
              bg-gradient-to-r from-pink-500 to-orange-400
              text-white font-semibold"
                    >
                        Allow
                    </button>


                </div>
            </div>
        </div>
    );
}

// STEP 5 - LocationPicker
function LocationPickerStep({ onNext, onBack }) {
    const [query, setQuery] = React.useState("");

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
        query
    )}&output=embed`;

    return (
        <div className="relative w-[360px] h-[640px] overflow-hidden bg-black">

            {/* MAP */}
            <iframe
                src={mapUrl}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Bottom Search Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%]
        bg-black/80 rounded-xl p-3 backdrop-blur">

                <div className="flex items-center gap-2 border border-pink-500/40 rounded-lg px-3 py-2">

                    <span>🔍</span>

                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search location..."
                        className="bg-transparent outline-none text-sm flex-1 text-white"
                    />

                </div>

                <button
                    onClick={onNext}
                    className="mt-3 w-full py-3 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400"
                >
                    Confirm Location
                </button>

                <button
                    onClick={onBack}
                    className="mt-2 text-xs text-gray-400 w-full"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

// STEP 6 — PHOTO

function PhotoStep({ onNext, onBack }) {
    const [photo, setPhoto] = React.useState(null);

    function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPhoto(url);
    }

    return (
        <div className="w-[360px] text-center text-white">
            <div className="flex items-center gap-12 mb-3">
                <button onClick={onBack} className="mt-6 mb-10 text-gray-400 text-3xl font-bold"> ← </button>

                {/* TITLE */}
                <h1 className="text-3xl font-serif">
                    Add a Profile{" "}
                    <span className="text-orange-400">Photo</span>
                </h1>
            </div>
            <p className="text-gray-400 mt-2 text-sm px-4">
                Add a photo to personalize your profile and make your experience
                more engaging.
            </p>

            {/* MAIN IMAGE */}
            <div className="relative mt-10 mx-auto w-[170px] h-[210px]
        rounded-2xl p-[2px]
        bg-gradient-to-br from-pink-500 to-orange-400">

                <div className="w-full h-full bg-white rounded-2xl overflow-hidden flex items-center justify-center">

                    {photo ? (
                        <img
                            src={photo}
                            alt="profile"
                            className="w-full h-full object-fill"
                        />
                    ) : (
                        <img
                            src="/loginAvatars/profile.png"
                            alt="placeholder"
                            className="w-28 h-28 object-cover"
                        />
                    )}

                </div>

                {/* CAMERA BUTTON */}
                <label className="absolute -bottom-3 -right-3 w-12 h-12
          rounded-full bg-pink-500 flex items-center justify-center
          cursor-pointer shadow-lg">

                    📷
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                    />
                </label>
            </div>

            {/* SMALL UPLOAD BOXES */}
            <div className="grid grid-cols-2 gap-4 mt-10 px-4">

                {[1, 2].map((i) => (
                    <label
                        key={i}
                        className="border border-pink-500/40 rounded-xl p-6
              flex flex-col items-center gap-2
              cursor-pointer
              bg-white/5
              hover:bg-white/10 transition">

                        <div className="w-10 h-10 rounded-full
              bg-gradient-to-br from-pink-500 to-orange-400
              flex items-center justify-center">

                            👤
                        </div>

                        <span className="text-sm">Upload Photo</span>

                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleUpload}
                        />
                    </label>
                ))}

            </div>

            {/* BUTTON */}
            <button
                disabled={!photo}
                onClick={onNext}
                className="mt-12 w-[90%] py-4 rounded-full
          bg-gradient-to-r from-pink-500 to-orange-400
          font-semibold
          disabled:opacity-40"
            >
                Get Started
            </button>
        </div>
    );
}

// STEP 7 — STATUS

function StatusStep({ value, onSelect, onNext, onBack }) {
    const options = [
        { label: "Student", icon: "🎓" },
        { label: "Working Professional", icon: "💼" },
        { label: "Business Owner", icon: "👜" },
        { label: "Self - Employed", icon: "👤" },
        { label: "Freelancer", icon: "🧑‍💻" },
        { label: "Other", icon: "⋯" },
    ];

    return (
        <div className="w-[360px] text-center text-white">

            <div className="flex items-center gap-12 mb-3">
                <button onClick={onBack} className="mt-6 mb-10 text-gray-400 text-3xl font-bold"> ← </button>

                {/* TITLE */}
                <h1 className="text-3xl font-serif leading-tight">
                    What are you{" "}
                    <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                        doing right now?
                    </span>
                </h1>
            </div>
            <p className="text-gray-400 mt-2 text-sm px-6">
                This helps us tailor your Playmate experience.
            </p>

            {/* OPTIONS */}
            <div className="mt-5 space-y-3 px-4">

                {options.map((opt) => {
                    const active = value === opt.label;

                    return (
                        <button
                            key={opt.label}
                            onClick={() => onSelect(opt.label)}
                            className={`w-full flex items-center justify-between
                px-4 py-4 rounded-xl border transition-all
                ${active
                                    ? "border-pink-500 bg-white/5 shadow-[0_0_20px_rgba(236,72,153,0.35)]"
                                    : "border-gray-700 bg-white/2"
                                }`}
                        >
                            {/* LEFT */}
                            <div className="flex items-center gap-3 text-left">

                                <span className="text-xl">{opt.icon}</span>

                                <span className="text-sm">
                                    {opt.label}
                                </span>
                            </div>

                            {/* RADIO */}
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${active
                                        ? "border-pink-500"
                                        : "border-gray-500"
                                    }`}
                            >
                                {active && (
                                    <div className="w-2.5 h-2.5 rounded-full
                    bg-gradient-to-r from-pink-500 to-orange-400"
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* BUTTON */}
            <button
                disabled={!value}
                onClick={onNext}
                className="mt-8 w-[90%] py-4 rounded-full
          bg-gradient-to-r from-pink-500 to-orange-400
          font-semibold
          disabled:opacity-40"
            >
                Continue
            </button>

            {/* SKIP */}
            <button
                // onClick={}
                className="mt-4 text-xs text-gray-400"
            >
                Skip for now
            </button>

        </div>
    );
}

//STEP 8 - CompleteProfile

function CompleteProfileStep({ onNext, onBack }) {
  const [form, setForm] = React.useState({
    education: "",
    hometown: "",
    qualification: "",
    bio: "",
  });

  return (
    <div className="w-[360px] h-[640px] text-white relative px-6">

      {/* TOP BAR */}
      <div className="flex items-center gap-3 pt-4">
        <button onClick={onBack} className="text-xl">←</button>
        <p className="flex-1 text-center text-sm text-gray-400">
          Profile setup
        </p>
      </div>

      {/* TITLE */}
      <div className="mt-6 text-center">

        <h1 className="text-3xl font-serif leading-tight">
          Complete your{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            profile
          </span>
        </h1>

        <p className="mt-2 text-gray-400 text-sm px-4">
          Help us recommend better playmates for you. You can skip this anytime.
        </p>
      </div>

      {/* FORM */}
      <div className="mt-8 space-y-5">

        {/* EDUCATION */}
        <InputBox
          label="Education"
          placeholder="College / school / University name"
          value={form.education}
          onChange={(v) =>
            setForm({ ...form, education: v })
          }
          icon="🎓"
        />

        {/* HOMETOWN */}
        <InputBox
          label="Hometown"
          placeholder="Where are you from?"
          value={form.hometown}
          onChange={(v) =>
            setForm({ ...form, hometown: v })
          }
          icon="📍"
        />

        {/* QUALIFICATION */}
        <InputBox
          label="Qualification"
          placeholder="Where do you work?"
          value={form.qualification}
          onChange={(v) =>
            setForm({ ...form, qualification: v })
          }
          icon="👜"
        />

        {/* BIO */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Bio
          </label>

          <div className="border border-pink-500/40 rounded-xl p-4 bg-white/5">

            <div className="flex gap-2 items-start">

              <span className="mt-1">✏️</span>

              <textarea
                rows={4}
                placeholder="Tell us about yourself..."
                value={form.bio}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
                className="bg-transparent w-full outline-none text-sm resize-none"
              />

            </div>
          </div>

          <button
            className="mt-2 text-xs text-pink-400 flex items-center gap-1"
            type="button"
          >
            ✨ Generate bio with AI
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-8 left-0 w-full px-6">

        <button
          onClick={() => {
            console.log("PROFILE DATA:", form);
            onNext();
          }}
          className="w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400
            font-semibold"
        >
          Save & Continue
        </button>

        <button
          onClick={onNext}
          className="mt-4 text-xs text-gray-400 w-full"
        >
          Skip for now
        </button>
      </div>

    </div>
  );
}

function InputBox({ label, placeholder, value, onChange, icon }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">
        {label}
      </label>

      <div className="border border-pink-500/40 rounded-xl p-4 bg-white/5
        flex items-center gap-2">

        <span>{icon}</span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none text-sm w-full"
        />

      </div>
    </div>
  );
}

