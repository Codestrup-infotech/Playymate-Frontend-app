"use client";


import React, { useState, useEffect } from "react";


export default function PersonalVerification() {


  const [step, setStep] = useState(1);

  useEffect(() => {
    const savedStep = sessionStorage.getItem("pq_step");
    if (savedStep) {
      setStep(Number(savedStep));
      sessionStorage.removeItem("pq_step");
    }
  }, []);

  






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
                <KYC
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(9)}
                    onBack={() => setStep(7)}
                />

            )}


             {step === 9 && (
                <VerifyAadhaar
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(10)}
                    onBack={() => setStep(8)}
                />

            )}

              {step === 10 && (
                <AthaarOTP
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(11)}
                    onBack={() => setStep(9)}
                />

            )}

            
              {step === 11 && (
                <FaceVerification
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(12)}
                    onBack={() => setStep(10)}
                />

            )}

             {step === 12 && (
                <AlignFace
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(13)}
                    onBack={() => setStep(11)}
                />

            )} 

            {step === 13 && (
                <Success
                    value={data.status}
                    onSelect={(status) =>
                        setData({ ...data, status })
                    }
                    onNext={() => setStep(14)}
                    onBack={() => setStep(12)}
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

            <h1 className="text-3xl font-Playfair Display">
                What’s Your <span className="text-pink-500">Gender</span>
            </h1>

            <p className="text-gray-400 mt-2 font-Poppins">
                Tell us about your gender
            </p>

            <div className="mt-10 space-y-4 font-Poppins">
                {genders.map((g) => (
                    <button
                        key={g}
                        onClick={() => onSelect(g)}
                        className={`w-full py-4 rounded-xl border transition
              ${value === g
                                ? "border-pink-500 bg-white/5 "
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
                className="mt-10 w-full py-4 font-Poppins rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
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
                <h1 className="text-3xl font-Playfair Display">
                    How <span className="text-pink-500">Old</span> Are You
                </h1>
            </div>

            <p className="text-gray-400 text-sm font-Poppins ">
                Please provide your age in years
            </p>

            {/* WHEEL */}
            <div className="relative mt-12 h-[240px] font-Poppins">

                {/* fade overlays */}
                <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

                {/* center highlight */}
                <div className="absolute top-1/2 left-0 w-full h-[52px] font-Poppins
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
            <div className="mt-12 border-2 border-pink-500/40 rounded-2xl p-5
        bg-black/60
        ">

                <p className="text-xl font-semibold">
                    You’re {age}
                </p>

                <p className="text-xs text-gray-400 mt-2 font-Poppins"> 
                    Is {month} {day}, {year} your birthday?
                    This can only be changed once.
                </p>

                <button
                    onClick={confirmDob}
                    className="mt-6 w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500 font-Poppins
            font-semibold tracking-wide"
                >
                    Continue
                </button>

                <button
                    onClick={onBack}
                    className="mt-3 text-sm text-gray-400 font-Poppins "
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
                                    : "text-gray-500 opacity-30 text-2xl"
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

                <h1 className="text-3xl font-Playfair Display">
                    <span className="bg-gradient-to-r font-Playfair Display from-pink-500 to-orange-400 bg-clip-text text-transparent">
                        Parent Consent
                    </span>
                </h1>

                <p className="mt-6 text-gray-400 text-sm leading-relaxed font-Poppins ">
                    To continue using Playmate, we need permission from a parent or
                    guardian. This helps us keep the experience safe and age-appropriate.
                </p>

                <p className="mt-4 text-gray-500 text-xs font-Poppins">
                    Your information is secure and never shared.
                </p>

                {/* CHECKBOX */}
                <label className="mt-10 flex items-start gap-3 text-left text-sm cursor-pointer font-Poppins">

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
            <div className="absolute bottom-8 left-0 w-full px-6 font-Poppins">

                <button
                    disabled={!checked}
                    onClick={onNext}
                    className="w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400
         
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

                    <h2 className="mt-4 font-bold text-lg text-black font-Poppins">
                        Location
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 font-Poppins ">
                        Allow maps to access your location while you use the app?
                    </p>

                    <button
                        onClick={onNext}
                        className="mt-6 w-full py-3 rounded-full
              bg-gradient-to-r from-pink-500 to-orange-400
              text-white font-Poppins "
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
        <div className="relative w-[360px] h-[640px] overflow-hidden bg-black font-Poppins">

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
        <div className="w-[360px] text-center text-white py-16">
            <div className="flex items-center gap-12 mb-3">
                <button onClick={onBack} className="mt-6 mb-10 text-gray-400 text-3xl font-bold"> ← </button>

                {/* TITLE */}
                <h1 className="text-3xl font-Playfair Display">
                    Add a Profile{" "}
                    <span className="text-orange-400">Photo</span>
                </h1>
            </div>
            <p className="text-gray-400 mt-2 text-sm px-4 font-Poppins ">
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
                   rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center
                   cursor-pointer shadow-lg">

                    <img src="/loginAvatars/camera.png" alt="" />
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                    />
                </label>
            </div>

            {/* SMALL UPLOAD BOXES */}
            <div className="grid grid-cols-2 gap-4 mt-10 px-4 font-Poppins ">

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
       font-Poppins
          disabled:opacity-40"
            >
                Get Started
            </button>
        </div>
    );
}

// STEP 7 — STATUS


import { useRouter } from "next/navigation";

 function StatusStep({ value, onSelect, onBack }) {
  const router = useRouter();

  const options = [
    { label: "Student", icon: "🎓" },
    { label: "Working Professional", icon: "💼" },
    { label: "Business Owner", icon: "👜" },
    { label: "Self - Employed", icon: "👤" },
    { label: "Freelancer", icon: "🧑‍💻" },
    { label: "Other", icon: "⋯" },
  ];

  // 👉 Navigate based on selected status
  const handleNext = () => {
    if (!value) return;

    switch (value) {
      case "Student":
        router.push("/personal-verifiction/profile_setup/student");
        break;

      case "Working Professional":
        router.push(
          "/personal-verifiction/profile_setup/working_professional"
        );
        break;

      case "Business Owner":
        router.push("/personal-verifiction/profile_setup/business_owner");
        break;

      case "Self - Employed":
        router.push("/personal-verifiction/profile_setup/self_employed");
        break;

      case "Freelancer":
        router.push("/personal-verifiction/profile_setup/freelancer");
        break;

      default:
        router.push("/personal-verifiction/profile_setup/other");
    }
  };

  return (
    <div className="w-[360px] text-center text-white">

      {/* TOP BAR */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={onBack}
          className="text-3xl text-gray-400 font-bold"
        >
          ←
        </button>

        <h1 className="text-2xl font-Playfair Display font-semibold leading-tight">
          What are you{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            doing right now?
          </span>
        </h1>
      </div>

      <p className="text-gray-400 text-sm px-4 font-Poppins">
        This helps us tailor your Playmate experience.
      </p>

      {/* OPTIONS */}
      <div className="mt-6 space-y-3 px-2 font-Poppins">
        {options.map((opt) => {
          const active = value === opt.label;

          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt.label)}
              className={`w-full flex items-center justify-between
                px-4 py-4 rounded-xl border transition-all
                ${
                  active
                    ? "border-pink-500 bg-white/5"
                    : "border-gray-700 bg-white/2"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm">{opt.label}</span>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    active
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

      {/* CONTINUE */}
      <button
        disabled={!value}
        onClick={handleNext}
        className="mt-8 w-[90%] py-4 rounded-full
          bg-gradient-to-r from-pink-500 to-orange-400
          font-Poppins disabled:opacity-40"
      >
        Continue
      </button>

      {/* SKIP */}
      <button className="mt-4 text-xs text-gray-400 font-Poppins">
        Skip for now
      </button>
    </div>
  );
}


// step 8   /   KYC

function KYC({ onNext, onSkip, onBack }) {
  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center px-6">

      {/* Back Arrow */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-5 left-5 text-white/80 text-xl"
        >
          ←
        </button>
      )}

      {/* Card */}
      <div
        className="
          w-full max-w-sm
          rounded-3xl
          p-8
          text-center
          bg-gradient-to-br from-[#2a1626] to-[#120a12]
          shadow-[0_0_60px_rgba(255,100,160,0.18)]
        "
      >
        {/* Title */}
        <h1 className="text-3xl font-Playfair Display text-white">
          Start Your{" "}
          <span className="text-orange-400">
            KYC
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-sm text-white/50 leading-relaxed">
          Free users must verify within 30 days
          <br />
          to continue using the app
        </p>

        {/* Buttons */}
        <div className="mt-10 flex gap-4 justify-center">

          {/* Skip */}
          <button
            onClick={onNext}
            className="
              px-9 py-3 rounded-full
              border border-pink-500/60
              text-white/70
              hover:bg-white/5
              transition
            "
          >
            Skip
          </button>

          {/* Continue */}
          <button
            onClick={onNext}
            className="
              px-9 py-3 rounded-full  text-white font-Poppins
              bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
              shadow-[0_0_28px_rgba(255,130,60,0.5)]
              hover:scale-[1.04]
              transition
            "
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  );
}

// step 9  /   Verify Aadhar

function VerifyAadhaar({ onBack, onNext }) {
  const [aadhaar, setAadhaar] = React.useState("");

  return (
    <div className="min-h-screen bg-black relative px-6 text-white flex flex-col">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-white/80 text-xl"
      >
        ←
      </button>

      {/* CONTENT */}
      <div className="mt-28 text-center">

        <h1 className="text-3xl font-Playfair Display leading-tight">
          Enter Your{" "}
          <span className="bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] bg-clip-text text-transparent">
            Aadhar
          </span>
          <br />
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Number
          </span>
        </h1>

        <p className="mt-4 text-sm text-white/40 px-4">
          We have sent the OTP to your aadhar
          <br />
          number
        </p>

        {/* INPUT */}
        <div className="mt-10">

          <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]">
            <input
              value={aadhaar}
              maxLength={12}
              onChange={(e) =>
                setAadhaar(
                  e.target.value.replace(/\D/g, "")
                )
              }
              placeholder="Enter your 16 Digit Aadhar Number"
              className="
                w-full rounded-2xl px-5 py-4
                bg-[#141414]
                outline-none
                text-sm
                placeholder:text-white/30
              "
            />
          </div>

        </div>
      </div>

      {/* VERIFY BUTTON */}
      <div className="mt-auto pb-10">

        <button
          disabled={aadhaar.length !== 12}
          onClick={onNext}
          className="
            w-full py-4 rounded-full font-semibold
            bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
            shadow-[0_0_28px_rgba(255,130,60,0.5)]
            disabled:opacity-40
          "
        >
          Verify Aadhar
        </button>
      </div>

    </div>
  );
}

// step 10   /   Adhaar OTP

function AthaarOTP({ onBack, onVerify,onNext, onResend }) {
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const inputsRef = React.useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const code = otp.join("");

  return (
    <div className="min-h-screen bg-black relative px-6 text-white flex flex-col">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-white/80 text-xl"
      >
        ←
      </button>

      {/* CONTENT */}
      <div className="mt-28 text-center">

        <h1 className="text-3xl font-Playfair Display leading-tight">
          Verification{" "}
          <span className="text-orange-400">
            Code
          </span>
        </h1>

        <p className="mt-4 text-sm text-white/40 px-4 leading-relaxed">
          Please enter the code we just sent to your registered
          <br />
          mobile number to verify your Aadhaar number.
        </p>

        {/* OTP BOXES */}
        <div className="mt-10 flex justify-center gap-3">

          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              maxLength={1}
              onChange={(e) =>
                handleChange(e.target.value, i)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, i)
              }
              className="
                w-12 h-14 text-center text-xl
                rounded-xl
                bg-[#141414]
                border border-[#EF3AFF]/40
                focus:border-[#FF8319]
                outline-none
              "
            />
          ))}
        </div>

        {/* RESEND */}
        <div className="mt-6 text-sm text-white/50">
          Didn’t receive OTP?{" "}
          <button
            onClick={onResend}
            className="text-white underline"
          >
            Resend Code
          </button>
        </div>
      </div>

      {/* VERIFY BUTTON */}
      <div className="mt-auto pb-10">

        <button
          disabled={code.length !== 6}
          onClick={onNext}
          className="
            w-full py-4 rounded-full font-semibold
            bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
            shadow-[0_0_28px_rgba(255,130,60,0.5)]
            disabled:opacity-40
          "
        >
          Verify
        </button>
      </div>

    </div>
  );
}

//step 11    /    FaceVerification 

function FaceVerification({ onBack, onStart, onNext }) {

  return (
    <div className="min-h-screen bg-black relative px-6 text-white flex flex-col">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-white/80 text-xl"
      >
        ←
      </button>

      {/* CONTENT */}
      <div className="mt-24 text-center">

        {/* TITLE */}
        <h1 className="text-3xl font-Playfair Display">
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Face
          </span>{" "}
          Verification
        </h1>

        {/* ICON */}
        <div className="mt-10 flex justify-center relative">

          {/* Scan Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-44 relative">

              {/* corners */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-pink-500" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-400" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-500" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-400" />

            </div>
          </div>

          {/* Avatar */}
          <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] flex items-center justify-center">
            <span className="text-3xl text-black">✔</span>
          </div>

        </div>

        {/* TEXT */}
        <h2 className="mt-10 text-lg font-semibold">
          Verify your identity
        </h2>

        <p className="mt-3 w-96 text-md text-white/40 px-10 leading-relaxed">
          Please enter the code we just sent to your registered
          mobile number to verify your Aadhaar number.
        </p>
      </div>

      {/* BUTTON */}
      <div className="mt-auto pb-10">

        <button
          onClick={onNext}
          className="
            w-full py-4 rounded-full font-semibold
            bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
            shadow-[0_0_30px_rgba(255,130,60,0.55)]
            hover:scale-[1.03]
            transition
          "
        >
          Start Verification
        </button>

      </div>

    </div>
  );
}

// step 12    /   AlignFace

function AlignFace({ onBack, onVerify , onNext }) {
    
  return (
    <div className="min-h-screen bg-black relative px-6 text-white flex flex-col items-center">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-white/80 text-xl"
      >
        ←
      </button>

      {/* TITLE */}
      <h1 className="mt-20 text-center text-3xl font-Playfair Display leading-tight">
        Align Your Face in the
        <br />
        Frame
      </h1>

      {/* SCAN AREA */}
      <div className="mt-12 relative">

        {/* Circular Frame */}
        <div className="relative w-72 h-72 rounded-full overflow-hidden border border-white/15">

          {/* Fake Camera Image */}
          <img
            src="/loginAvatars/faceVerifyimg.png" // replace with camera feed later
            alt="Face preview"
            className="w-full h-full object-cover opacity-90"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Scan Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px]
            bg-gradient-to-r from-transparent via-blue-400 to-transparent
            animate-pulse"
          />

          {/* Circular Ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
        </div>
      </div>

      {/* VERIFY BUTTON */}
      <div className="mt-auto w-full pb-10">

        <button
          onClick={onNext}
          className="
            w-full py-4 rounded-full font-semibold
            bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
            shadow-[0_0_30px_rgba(255,130,60,0.55)]
            hover:scale-[1.03]
            transition
          "
        >
          Verify
        </button>
      </div>

    </div>
  );
}

// step 13   /   Success

function Success({ onBack, onDone }) {
  return (
    <div className="min-h-screen bg-black relative px-6 text-white flex flex-col">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-white/80 text-xl"
      >
        ←
      </button>

      {/* CENTER CONTENT */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">

        <h1 className="text-4xl font-Playfair Display font-semibold
          bg-gradient-to-r from-pink-400 to-orange-400
          bg-clip-text text-transparent">
          Congratulations!
        </h1>

        <p className="mt-4 text-sm text-white/40 max-w-xs">
          Your account has been verified successfully.
        </p>

      </div>

      {/* OPTIONAL CTA */}
      {onDone && (
        <div className="pb-10">
          <button
            onClick={onDone}
            className="
              w-full py-4 rounded-full font-Poppins
              bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
              shadow-[0_0_28px_rgba(255,130,60,0.5)]
            "
          >
            Continue
          </button>
        </div>
      )}

    </div>
  );
}


