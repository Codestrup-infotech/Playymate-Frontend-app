"use client";

import { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";


export default function StepPhone({ onBackToWelcome }) {
  const router = useRouter();

  const DEV_SKIP_OTP = true; // set to false when backend OTP is ready


  const [step, setStep] = useState("phone"); // phone | phoneOtp | email | emailOtp
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  // ⏱️ 30s Timer for resend
  useEffect(() => {
    if (step !== "phoneOtp" && step !== "emailOtp") return;
    if (timer === 0) return;

    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer, step]);

  const resetOtpTimer = () => {
    setTimer(30);
    setOtp(["", "", "", ""]);
  };

  // 📩 Send Phone OTP
  const sendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      alert("Enter valid phone number");
      return;
    }



    if (DEV_SKIP_OTP) {
      // ✅ Fake success for UI testing
      setStep("email");
      setOtp(["", "", "", ""]);
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3001/api/auth/send-phone-otp", { phone });
      resetOtpTimer();
      setStep("phoneOtp");
    } catch {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify Phone OTP
  const verifyPhoneOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) return alert("Enter 4 digit OTP");



    try {
      setLoading(true);
      await axios.post("http://localhost:3001/api/auth/verify-phone-otp", {
        phone,
        otp: code,
      });
      setStep("email");
      setOtp(["", "", "", ""]);
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



    if (DEV_SKIP_OTP) {
      // ✅ Fake success for UI testing
      setStep("emailOtp");
      setOtp(["", "", "", ""]);
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:3001/api/auth/send-email-otp", { email });
      resetOtpTimer();
      setStep("emailOtp");
    } catch {
      alert("Failed to send email OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Verify Email OTP + Redirect
  const verifyEmailOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) return alert("Enter 4 digit OTP");






    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/api/auth/verify-email-otp", {
        email,
        otp: code,
      });

      // Store JWT if backend returns
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

  const handleOtpChange = (v, i) => {
    if (!/^\d?$/.test(v)) return;
    const copy = [...otp];
    copy[i] = v;
    setOtp(copy);
  };



  const back = () => {
    setOtp(["", "", "", ""]); // clear OTP when going back

    if (step === "phoneOtp") setStep("phone");
    else if (step === "email") setStep("phoneOtp");
    else if (step === "emailOtp") setStep("email");
  };

  const goTop = () => {
    setStep("phone");        // always go to first screen
    setOtp(["", "", "", ""]);
    setTimer(30);
  };



  return (


    <>



      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">









        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">

          {/* 🔙 Back to Welcome (Colorful Button) */}
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
                <div className="flex flex-col space-y-6 text-center justify-center ">
                  <h1 className="text-[32px]   font-Playfair Display  font-bold  ">
                    Login With

                    <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Phone </span>


                  </h1>

                  <p className="text-gray-400   max-w-xs text-[16px] font-Poppins font-normal ">
                    We'll need your phone number to send an OTP for verification.
                  </p>

                  <div className="py-6  flex justify-start items-start text-start bg-black text-black  ">
                   <div className="py-6 flex justify-start items-start w-full">
  <div className="relative w-full">
    
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="🇮🇳 +91 | "
      className="w-full h-[48px] bg-black text-white border border-[#F16179] rounded-[1rem] px-4 outline-none focus:ring-2 focus:ring-[#F16179]/50 transition-all"
    />
  </div>
</div>
                  </div>







                  <button
                    onClick={sendPhoneOtp}
                    disabled={loading}
                    className="w-full py-3 rounded-full font-Poppins font-normal bg-gradient-to-r  from-pink-500 to-orange-400"
                  >
                    {loading ? "Sending..." : "Continue"}
                  </button> </div>
              </>
            )}

            {/* ---------------- PHONE OTP ---------------- */}
            {step === "phoneOtp" && (
              <>
                <div className="flex flex-col justify-center  text-center space-y-3">
                  <h1 className=" font-bold font-Playfair Display text-[32px]">

                    Enter
                    <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Code </span>

                  </h1>
                  <p className="text-gray-400 text-sm font-Poppins">
                    Please enter code we just send to +{phone}
                  </p>
                </div>
                {/* <div className="flex justify-center gap-4 py-6">
              {otp.map((o, i) => (
                <input
                  key={i}
                  value={o}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="w-12 h-12 rounded-xl bg-black border border-[#EF3AFF] text-center text-xl   "
                />
              ))}
            </div> */}



                <div className="flex justify-center gap-4 py-6">
                  {otp.map((o, i) => (
                    <div
                      key={i}
                      className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
                    >
                      <input
                        value={o}
                        maxLength={1}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        className="w-12 h-12 rounded-xl bg-black text-center text-xl text-white outline-none"
                      />
                    </div>
                  ))}
                </div>



                <button
                  onClick={verifyPhoneOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-full font-Poppins font-normal bg-gradient-to-r from-pink-500 to-orange-400"
                >
                  Verify
                </button>

                <p className="text-center text-sm text-gray-400 font-Poppins ">
                  {timer > 0 ? (
                    <>Resend OTP in <span className="text-red-400">{timer}s</span></>
                  ) : (
                    <span
                      onClick={sendPhoneOtp}
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
                <div className="flex  flex-col space-y-5 justify-center text-center">
                  <h1 className="text-[32px] font-Playfair Display font-bold">Email

                    <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Address </span>

                  </h1>
                  <p className="text-gray-400 text-md font-Poppins">
                    We'll need your email to stay in touch.
                  </p> </div>



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

            {/* ---------------- EMAIL OTP ---------------- */}
            {step === "emailOtp" && (
              <>

              
                <div className="flex flex-col justify-center text-center  space-y-3  ">
                  <h1 className="text-[32px] font-Playfair Display font-bold">Enter

                    <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Code </span>

                  </h1>
                  <p className="text-gray-400 text-md font-Poppins ">
                    Please enter code sent to  {email}
                  </p>
                </div>
                
              <div className="flex justify-center gap-4">
  {otp.map((o, i) => (
    <div
      key={i}
      className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
    >
      <input
        value={o}
        maxLength={1}
        onChange={(e) => handleOtpChange(e.target.value, i)}
        className="w-12 h-12 rounded-xl bg-black text-center text-xl text-white focus:outline-none"
      />
    </div>
  ))}
</div>


                <button
                  onClick={verifyEmailOtp}
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
                      onClick={sendEmailOtp}
                      className="text-white underline cursor-pointer"
                    >
                      Resend OTP
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
