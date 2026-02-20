"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

export default function StepPhone({ onBackToWelcome }) {
  const router = useRouter();

  const [step, setStep] = useState("phone"); // phone | phoneOtp | email | emailOtp
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digit
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // ⏱️ 30s Timer for resend
  useEffect(() => {
    if (step !== "phoneOtp" && step !== "emailOtp") return;
    if (timer === 0) return;

    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer, step]);

  const resetOtpTimer = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
  };

  // 📩 Send Phone OTP
  const sendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      alert("Enter valid phone number");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/v1/auth/phone/send-otp", { phone });
      resetOtpTimer();
      setStep("phoneOtp");
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify Phone OTP
  const verifyPhoneOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return alert("Enter 6 digit OTP");

    try {     
      setLoading(true);
      await axios.post("http://localhost:5000/api/v1/auth/phone/verify-otp", {
        phone,
        otp: code,
      });
      setOtp(["", "", "", "", "", ""]);
      setStep("email");
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 📧 Send Email OTP
  const sendEmailOtp = async () => {
    if (!email.includes("@")) {
      alert("Enter valid email");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/v1/auth/email/send-otp", { email });
      resetOtpTimer();
      setStep("emailOtp");
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch {
      alert("Failed to send email OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Verify Email OTP + Redirect
  const verifyEmailOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return alert("Enter 6 digit OTP");

    try {
      setLoading(true); 
      const res = await axios.post("http://localhost:5000/api/v1/auth/email/verify-otp", {
        email,
        otp: code,
      });

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      router.push("/account");
    } catch {
      alert("Invalid Email OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔢 OTP Input Handler (Auto Move)
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const copy = [...otp];
    copy[index] = value;
    setOtp(copy);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">
      <button
        onClick={onBackToWelcome}
        className="absolute top-5 left-4 px-4 py-2 rounded-full 
               bg-gradient-to-r from-pink-500 to-orange-400 
               text-white text-sm font-semibold shadow-lg"
      >
        ← Back
      </button>

      <div className="w-full max-w-sm space-y-6">

        {/* ---------------- PHONE ---------------- */}
        {step === "phone" && (
          <>
            <div className="flex flex-col space-y-6 text-center">
              <h1 className="text-[32px] font-Playfair Display font-bold">
                Login With
                <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Phone
                </span>
              </h1>

              <p className="text-gray-400 max-w-xs text-[16px] font-Poppins">
                We'll need your phone number to send an OTP for verification.
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="🇮🇳 +91 | "
                className="w-full h-[48px] bg-black text-white font-Poppins border border-[#F16179] rounded-[1rem] px-4 outline-none focus:ring-2 focus:ring-[#F16179]/50 transition-all"
              />

              <button
                onClick={sendPhoneOtp}
                disabled={loading}
                className="w-full py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-400"
              >
                {loading ? "Sending..." : "Continue"}
              </button>
            </div>
          </>
        )}

        {/* ---------------- OTP UI (Phone + Email Same UI) ---------------- */}
        {(step === "phoneOtp" || step === "emailOtp") && (
          <>
            <div className="flex flex-col justify-center text-center space-y-3">
              <h1 className="text-[32px] font-Playfair Display font-bold">
                Enter
                <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Code
                </span>
              </h1>
              <p className="text-gray-400 text-sm font-Poppins">
                {step === "phoneOtp"
                  ? `Please enter code we just sent to +${phone}`
                  : `Please enter code sent to ${email}`}
              </p>
            </div>

            <div className="flex justify-center gap-4 py-6">
              {otp.map((o, i) => (
                <div
                  key={i}
                  className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
                >
                  <input
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={o}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-12 rounded-xl bg-black text-center text-xl text-white outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={step === "phoneOtp" ? verifyPhoneOtp : verifyEmailOtp}
              disabled={loading}
              className="w-full py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-400"
            >
              Verify
            </button>

            <p className="text-center text-sm text-gray-400">
              {timer > 0 ? (
                <>Resend OTP in <span className="text-red-400">{timer}s</span></>
              ) : (
                <span
                  onClick={step === "phoneOtp" ? sendPhoneOtp : sendEmailOtp}
                  className="text-white underline cursor-pointer"
                >
                  Resend OTP
                </span>
              )}
            </p>
          </>
        )}

        {/* ---------------- EMAIL ---------------- */}
        {step === "email" && (
          <>
            <div className="flex flex-col space-y-5 text-center">
              <h1 className="text-[32px] font-Playfair Display font-bold">
                Email
                <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Address
                </span>
              </h1>

              <p className="text-gray-400 text-md font-Poppins">
                We'll need your email to stay in touch.
              </p>
            </div>

            <div className="w-full p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]">
              <div className="relative">
                <input
                  className="w-full p-3 pl-10 rounded-xl bg-black font-Poppins text-white placeholder-gray-400 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={sendEmailOtp}
              disabled={loading}
              className="w-full py-3 rounded-full font-Poppins bg-gradient-to-r from-pink-500 to-orange-400"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
