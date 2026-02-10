"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function StudentProfilePage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    education: "",
    hometown: "",
    qualification: "",
    bio: "",
  });


const goBackToQuestion = () => {
  sessionStorage.setItem("pq_step", "7"); // remember step
  router.push("/personal-verifiction");   // clean URL
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

          <button
            onClick={() => {
              console.log("STUDENT PROFILE:", form);

              // 👉 backend submit later

              router.push("/personalVerifictionFlow?step=8"); // or next onboarding step
            }}
            className="
              w-full py-4 rounded-full  font-Poppins
              bg-gradient-to-r from-pink-500 to-orange-400
            
            "
          >
            Save & Continue
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
