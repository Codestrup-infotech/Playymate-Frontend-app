
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { authService } from "@/services/auth";
import { getErrorMessage } from "@/lib/api/errorMap";

export default function StepPhone({ onBackToWelcome }) {
  const router = useRouter();

  const [step, setStep] = useState("phone"); // phone | phoneOtp | email | emailOtp
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState("");

  const inputsRef = useRef([]);

  /* ----------------------------------------------------------- */
  /* Helpers */
  /* ----------------------------------------------------------- */

  const clearError = () => setError(null);

  const clearSession = () => {
    sessionStorage.removeItem("auth_flow_id");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("email");
  };

  const resetOtpState = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setResendMessage("");
  };

  /* ----------------------------------------------------------- */
  /* Timer */
  /* ----------------------------------------------------------- */

  useEffect(() => {
    if (step !== "phoneOtp" && step !== "emailOtp") return;
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  useEffect(() => {
    if (step === "phoneOtp" || step === "emailOtp") {
      resetOtpState();
      setTimeout(() => inputsRef.current[0]?.focus(), 200);
    }
  }, [step]);

  /* ----------------------------------------------------------- */
  /* PHONE - SEND OTP */
  /* ----------------------------------------------------------- */

  const sendPhoneOtp = async () => {
    if (loading) return;

    if (phone.length !== 10) {
      setError("Please enter a valid 10 digit phone number.");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const response = await authService.sendPhoneOTPDirect(phone);
      const flowId = response?.data?.auth_flow_id;

      if (!flowId) throw new Error("Authentication session not created");

      sessionStorage.setItem("auth_flow_id", flowId);
      sessionStorage.setItem("phone", phone);

      setStep("phoneOtp");
    } catch (err) {
      const errorCode = err?.response?.data?.error_code;
      setError(getErrorMessage(errorCode) || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------- */
  /* PHONE - VERIFY OTP */
  /* ----------------------------------------------------------- */

  const verifyPhoneOtp = async () => {
    if (loading) return;

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter a valid 6 digit OTP.");
      return;
    }

    const flowId = sessionStorage.getItem("auth_flow_id");
    if (!flowId) {
      setError("Session expired. Please try again.");
      setStep("phone");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const response = await authService.verifyPhoneOTP(flowId, code);
      const verified = response?.data?.user?.phone_verified;

      if (!verified) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      setStep("email");
    } catch (err) {
      const errorCode = err?.response?.data?.error_code;

      if (errorCode === "INVALID_AUTH_FLOW") {
        clearSession();
        setError("Session expired. Please start again.");
        setStep("phone");
      } else {
        setError(getErrorMessage(errorCode) || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------- */
  /* EMAIL - SEND OTP */
  /* ----------------------------------------------------------- */

  const sendEmailOtp = async () => {
    if (loading) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const flowId = sessionStorage.getItem("auth_flow_id");
      if (!flowId) {
        setError("Session expired. Please start again.");
        setStep("phone");
        return;
      }

      await authService.sendEmailOTP(flowId, email);
      sessionStorage.setItem("email", email);

      setStep("emailOtp");
    } catch (err) {
      const errorCode = err?.response?.data?.error_code;
      setError(getErrorMessage(errorCode) || "Failed to send email OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------- */
  /* EMAIL - VERIFY OTP */
  /* ----------------------------------------------------------- */

  const verifyEmailOtp = async () => {
    if (loading) return;

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter a valid 6 digit OTP.");
      return;
    }

    const flowId = sessionStorage.getItem("auth_flow_id");
    if (!flowId) {
      setError("Session expired. Please start again.");
      setStep("phone");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const response = await authService.verifyEmailOTP(flowId, code);
      const verified = response?.data?.user?.email_verified;

      if (!verified) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      clearSession();
      router.push("/personal-verification");
    } catch (err) {
      const errorCode = err?.response?.data?.error_code;
      setError(getErrorMessage(errorCode) || "Email verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------- */
  /* OTP Input */
  /* ----------------------------------------------------------- */

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (step === "phoneOtp") await sendPhoneOtp();
    if (step === "emailOtp") await sendEmailOtp();

    setResendMessage("OTP is Resent. Enter the OTP.");
    setTimer(30);
  };

  /* ----------------------------------------------------------- */
  /* UI */
  /* ----------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 font-[Poppins] transition-all duration-500">
      <div className="w-full max-w-sm space-y-6 relative animate-fadeIn">

        <button
          onClick={onBackToWelcome}
          className="absolute -top-14 left-0 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-sm font-semibold"
        >
          ← Back
        </button>

        {/* PHONE */}
        {step === "phone" && (
          <>
            <h1 className="text-3xl font-bold text-center font-['Playfair_Display']">
              Login With <span className="text-pink-400">Phone</span>
            </h1>

            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.startsWith("91")) value = value.slice(2);
                if (value.length <= 10) setPhone(value);
                clearError();
              }}
              className="w-full h-12 bg-black border border-pink-500 rounded-xl px-4"
              placeholder="Enter 10 digit mobile number"
            />

            {error && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            <button
              onClick={sendPhoneOtp}
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue"}
            </button>
          </>
        )}

        {/* OTP */}
        {(step === "phoneOtp" || step === "emailOtp") && (
          <>
            <h2 className="text-3xl font-bold text-center font-['Playfair_Display']">
              Verify OTP
            </h2>

            <p className="text-center text-sm text-gray-400">
              Enter the OTP sent to{" "}
              {step === "phoneOtp" ? `+91${phone}` : email}
            </p>

            <div className="flex justify-center gap-3 mt-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-12 h-12 bg-black border border-pink-500 rounded-lg text-center text-xl"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mt-2">
                {error}
              </p>
            )}

            {resendMessage && (
              <p className="text-green-400 text-sm text-center">
                {resendMessage}
              </p>
            )}

            <button
              onClick={
                step === "phoneOtp"
                  ? verifyPhoneOtp
                  : verifyEmailOtp
              }
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mt-4"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify OTP"}
            </button>

            <div className="text-center text-sm text-gray-400 mt-3">
              {timer > 0 ? (
                <>Resend OTP in {timer}s</>
              ) : (
                <span
                  onClick={handleResend}
                  className="underline cursor-pointer"
                >
                  Don’t receive OTP? Resend OTP
                </span>
              )}
            </div>
          </>
        )}

        {/* EMAIL */}
        {step === "email" && (
          <>
            <h1 className="text-3xl font-bold text-center font-['Playfair_Display']">
              Enter <span className="text-pink-400">Email</span>
            </h1>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="w-full pl-10 p-3 bg-black border border-pink-500 rounded-xl"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            <button
              onClick={sendEmailOtp}
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
