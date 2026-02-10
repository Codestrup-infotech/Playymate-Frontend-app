"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BusinessOwnerProfilePage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    businessName: "",
    role: "",
    industry: "",
    yearsInBusiness: "",
    companySize: "",
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
              Business Profile
            </span>
          </h1>

          <p className="mt-2 text-sm text-white/40 px-6">
            Help us recommend better connections for you. You can skip this anytime
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10 space-y-5">

          <InputBoxBusinessOwner
            label="Business Name"
            placeholder="eg. Shinde Technologies Pvt Ltd"
            value={form.businessName}
            onChange={(v) =>
              setForm({ ...form, businessName: v })
            }
            icon="🏢"
          />

          <InputBoxBusinessOwner
            label="Your Role"
            placeholder="Founder / CEO / Partner"
            value={form.role}
            onChange={(v) =>
              setForm({ ...form, role: v })
            }
            icon="👔"
          />

          <InputBoxBusinessOwner
            label="Industry"
            placeholder="IT / Manufacturing / Retail / Finance / Other"
            value={form.industry}
            onChange={(v) =>
              setForm({ ...form, industry: v })
            }
            icon="📊"
          />

          <InputBoxBusinessOwner
            label="Years in Business"
            placeholder="0–1 / 1–3 / 3–5 / 5+ years"
            value={form.yearsInBusiness}
            onChange={(v) =>
              setForm({ ...form, yearsInBusiness: v })
            }
            icon="📅"
          />

          <InputBoxBusinessOwner
            label="Company Size"
            placeholder="1–10 / 11–50 / 51–200 / 200+"
            value={form.companySize}
            onChange={(v) =>
              setForm({ ...form, companySize: v })
            }
            icon="👥"
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
                  placeholder="Tell us about your business..."
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
              console.log("BUSINESS PROFILE:", form);

              // 👉 backend submit later

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

function InputBoxBusinessOwner({
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
          focus-within:border-[#EF3AFF]/70
          rounded-xl px-4 py-2
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
