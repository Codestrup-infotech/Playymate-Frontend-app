"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function SelfEmployedProfilePage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    profession: "",
    workingAs: "",
    industry: "",
    experience: "",
    location: "",
    bio: "",
  });

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4">

      <div className="w-full max-w-sm text-white relative">

        {/* TOP BAR */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => router.push("/personalVerifictionFlow?step=7")}
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
              Self Employed Profile
            </span>
          </h1>

          <p className="mt-2 text-sm text-white/40 px-6">
            Help us recommend better opportunities for you. You can skip this anytime
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10 space-y-5">

          <InputBoxSelfEmployed
            label="Profession / Service"
            placeholder="eg. Freelancer, Photographer, Consultant"
            value={form.profession}
            onChange={(v) =>
              setForm({ ...form, profession: v })
            }
            icon="🛠️"
          />

          <InputBoxSelfEmployed
            label="Working As"
            placeholder="Solo / Contractor / Agency"
            value={form.workingAs}
            onChange={(v) =>
              setForm({ ...form, workingAs: v })
            }
            icon="👤"
          />

          <InputBoxSelfEmployed
            label="Industry"
            placeholder="IT / Creative / Construction / Finance / Other"
            value={form.industry}
            onChange={(v) =>
              setForm({ ...form, industry: v })
            }
            icon="📊"
          />

          <InputBoxSelfEmployed
            label="Years of Experience"
            placeholder="0–1 / 1–3 / 3–5 / 5+ years"
            value={form.experience}
            onChange={(v) =>
              setForm({ ...form, experience: v })
            }
            icon="📈"
          />

          <InputBoxSelfEmployed
            label="Work Location"
            placeholder="City or Remote"
            value={form.location}
            onChange={(v) =>
              setForm({ ...form, location: v })
            }
            icon="📍"
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
                  placeholder="Tell us about your work..."
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
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12">

          <button
            onClick={() => {
              console.log("SELF EMPLOYED PROFILE:", form);

              // 👉 API call later

             router.push("/personalVerifictionFlow?step=8"); // or next onboarding step

            }}
            className="
              w-full py-4 rounded-full font-semibold
              bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]
              shadow-[0_0_28px_rgba(255,130,60,0.45)]
            "
          >
            Save & Continue
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

function InputBoxSelfEmployed({
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
        "
      >
        {icon && <span className="text-lg">{icon}</span>}

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
