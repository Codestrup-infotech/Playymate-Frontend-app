"use client";

import React from "react";
import { useRouter } from "next/navigation";
import userService from "../../../../../services/user";

export default function StudentProfilePage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    education: "",
    hometown: "",
    qualification: "",
    bio: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);


const goBackToQuestion = () => {
  sessionStorage.setItem("pq_step", "7"); // remember step
  router.push("/personal-verification");   // clean URL
};

const handleSaveAndContinue = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    console.log("STUDENT PROFILE:", form);
    console.log("Calling API to save student profile...");

    // Call API to save student profile
    const response = await userService.completeProfileSetup('student', form);
    
    console.log("API Response Success:", response);
    console.log("Profile saved successfully! Navigating to KYC...");
    router.push("/personal-verification/kyc");
  } catch (err) {
    console.error("========== API ERROR ==========");
    console.error("Error message:", err.message);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    console.error("Full error:", err);
    console.error("================================");
    
    setError(err.response?.data?.message || "Failed to save profile. Please try again.");
    
    // For demo/development, still navigate to KYC if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log("Dev mode: Navigating to KYC anyway (API call failed)...");
      router.push("/personal-verification/kyc");
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4 py-10 ">

      <div className="w-full max-w-sm text-white relative">

        {/* TOP BAR */}
        <div className="flex items-center gap-3 pt-4">
         <button
            onClick={goBackToQuestion}
            className="text-xl text-white/70"
         >
         ←
        </button>

          <p className="flex-1 text-center text-md font-Poppins text-white/40">
            Profile setup
          </p>
        </div>

        {/* TITLE */}
        <div className="mt-8 text-center">

          <h1 className="text-3xl font-Playfair Display font-semibold  leading-tight">
            Complete your{" "}
            <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              Student Profile
            </span>
          </h1>

          <p className="mt-2 text-white/40 text-sm px-6 font-Poppins ">
            Help us recommend better playmates for you. You can skip this anytime.
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10 space-y-5 font-Poppins ">

          <InputBoxStudent
            label="Education"
            placeholder="College / school / University name"
            value={form.education}
            onChange={(v) =>
              setForm({ ...form, education: v })
            }
            icon="🎓"
          />

          <InputBoxStudent
            label="Hometown"
            placeholder="Where are you from?"
            value={form.hometown}
            onChange={(v) =>
              setForm({ ...form, hometown: v })
            }
            icon="📍"
          />

          <InputBoxStudent
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
            <label className="text-xs text-white/50 mb-1 block">
              Bio
            </label>

            <div className="border border-pink-500/40 rounded-xl p-4 bg-white/5">

              <div className="flex gap-3 items-start">

                <span className="mt-1 text-pink-400">✏️</span>

                <textarea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className="
                    bg-transparent w-full outline-none
                    text-sm resize-none
                    placeholder:text-white/30
                  "
                />

              </div>
            </div>

            <button
              className="mt-3 text-xs text-pink-400 flex items-center gap-1"
              type="button"
            >
              ✨ Generate bio with AI
            </button>
          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-12">

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSaveAndContinue}
            disabled={isLoading}
            className="
              w-full py-4 rounded-full  font-Poppins
              bg-gradient-to-r from-pink-500 to-orange-400
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? "Saving..." : "Save & Continue"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-md text-white/40 w-full font-Poppins "
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---------InputBox--------- */

function InputBoxStudent({
  label,
  placeholder,
  value,
  onChange,
  icon,
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1 block">
        {label}
      </label>

      <div
        className="
          border border-white/10
          focus-within:border-pink-500/60
          rounded-xl px-4 py-3
          bg-[#141414]
          flex items-center gap-3
        "
      >
        <span className="text-lg">{icon}</span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            bg-transparent outline-none
            text-sm w-full
            placeholder:text-white/30
          "
        />
      </div>
    </div>
  );
}
