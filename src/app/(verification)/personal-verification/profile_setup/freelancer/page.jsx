"use client";

import React from "react";
import { useRouter } from "next/navigation";
import userService from "../../../../../services/user";

export default function FreelancerProfilePage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    skill: "",
    type: "",
    industry: "",
    experience: "",
    availability: "",
    bio: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSaveAndContinue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("FREELANCER PROFILE:", form);
      console.log("Calling API to save freelancer profile...");

      // Call API to save freelancer profile
      const response = await userService.completeProfileSetup('freelancer', form);
      
      console.log("API Response Success:", response);
      
      // Navigate to KYC on success
      router.push("/personal-verification/kyc");
    } catch (err) {
      console.error("Failed to save freelancer profile:", err);
      setError(err.response?.data?.message || "Failed to save profile. Please try again.");
      
      // For demo/development, still navigate to KYC if API fails
      if (process.env.NODE_ENV === 'development') {
        router.push("/personal-verification/kyc");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4">

      <div className="w-full max-w-sm text-white relative">

        {/* TOP BAR */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => router.push("/personal-verifiction?step=7")}
            className="text-xl text-white/70"
          >
            ←
          </button>

          <p className="flex-1 text-center text-xs text-white/40">
            Profile setup
          </p>
        </div>

        {/* TITLE */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-serif leading-tight">
            Complete your{" "}
            <span className="bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] bg-clip-text text-transparent">
              Freelancer profile
            </span>
          </h1>

          <p className="mt-2 text-sm text-white/40 px-6">
            Help us recommend better gigs for you. You can skip this anytime
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10 space-y-5">

          <InputBoxFreelancer
            label="Skill / Service"
            placeholder="eg. Web Developer, Designer, Writer"
            value={form.skill}
            onChange={(v) =>
              setForm({ ...form, skill: v })
            }
            icon="🛠️"
          />

          <InputBoxFreelancer
            label="Freelancer Type"
            placeholder="Solo / Agency / Contractor"
            value={form.type}
            onChange={(v) =>
              setForm({ ...form, type: v })
            }
            icon="👨‍💻"
          />

          <InputBoxFreelancer
            label="Industry"
            placeholder="IT / Creative / Marketing / Finance / Other"
            value={form.industry}
            onChange={(v) =>
              setForm({ ...form, industry: v })
            }
            icon="📊"
          />

          <InputBoxFreelancer
            label="Experience Level"
            placeholder="Fresher / 1–3 / 3–5 / 5+ years"
            value={form.experience}
            onChange={(v) =>
              setForm({ ...form, experience: v })
            }
            icon="📈"
          />

          <InputBoxFreelancer
            label="Availability"
            placeholder="Full-time / Part-time / Project-based"
            value={form.availability}
            onChange={(v) =>
              setForm({ ...form, availability: v })
            }
            icon="⏳"
          />

          {/* BIO */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">
              Bio
            </label>

            <div className="border border-[#EF3AFF]/40 rounded-xl p-4 bg-white/5">
              <div className="flex gap-3 items-start">
                <span className="mt-1">✏️</span>

                <textarea
                  rows={3}
                  placeholder="Tell us about your freelance work..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className="
                    bg-transparent w-full outline-none
                    text-sm resize-none text-white
                    placeholder:text-white/30
                  "
                />
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
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
              w-full py-4 rounded-full font-semibold
              bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
              shadow-[0_0_28px_rgba(255,130,60,0.45)]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? "Saving..." : "Save & Continue"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-xs text-white/40 w-full"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---------------- INPUT BOX ---------------- */

function InputBoxFreelancer({
  label,
  placeholder,
  value,
  onChange,
  icon,
  type = "text",
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1 block">
        {label}
      </label>

      <div
        className="
          border border-white/10
          focus-within:border-[#EF3AFF]/70
          rounded-xl px-4 py-3
          bg-[#141414]
          flex items-center gap-3
          transition
        "
      >
        {icon && (
          <span className="text-lg select-none">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            bg-transparent outline-none
            text-sm w-full text-white
            placeholder:text-white/30
          "
        />
      </div>
    </div>
  );
}
