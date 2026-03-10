"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Shield, User, CheckCircle } from "lucide-react";
import { kycService } from "@/services/kyc";

export default function KYCSeparatePage() {
  const router = useRouter();
  
  // KYC flow steps:
  // 1 = KYC Intro
  // 2 = VerifyAadhaar (enter aadhaar number)
  // 3 = AadhaarOTP (enter OTP)
  // 4 = FaceVerification (take selfie)
  // 5 = AlignFace (position face)
  // 6 = Success
  const [step, setStep] = useState(1);

  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEV_MODE = true; // change to false when API is ready


  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelfie(dataUrl);
    stopCamera();
    setStep(5);
  };

  const retakeSelfie = () => {
    setSelfie(null);
    setStep(4);
    startCamera();
  };

  const handleSendOTP = async () => {
    if (aadhaar.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    
    setLoading(true);

    if (DEV_MODE) {
    setTimeout(() => {
      setOtpSent(true);
      setStep(3);   // jump to OTP screen
      setLoading(false);
    }, 500);
    return;
  }

    try {
      
      const { userService } = await import("@/services/user");
      await userService.sendAadhaarOTP(aadhaar);
      setOtpSent(true);
      setStep(3);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    
    
    try {
      const { userService } = await import("@/services/user");
      await userService.verifyAadhaarOTP(otp, aadhaar);
      setStep(4);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerify = async () => {
    if (!selfie) {
      alert("Please take a selfie first");
      return;
    }
    
    setLoading(true);
    try {
      await kycService.faceLiveness(selfie);
      setStep(6);
    } catch (error) {
      console.error("Face verification error:", error);
      alert("Face verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-md ">
        
        {step === 1 && <KYCIntro onNext={() => setStep(2)} onSkip={() => router.push("/physical-activity")} />}
        {step === 2 && <VerifyAadhaar aadhaar={aadhaar} setAadhaar={setAadhaar} onNext={handleSendOTP} onBack={goBack} loading={loading} />}
        {step === 3 && <AadhaarOTP otp={otp} setOtp={setOtp} onNext={handleVerifyOTP} onBack={goBack} loading={loading} />}
        {step === 4 && <FaceVerification videoRef={videoRef} canvasRef={canvasRef} onCapture={captureSelfie} onBack={goBack} startCamera={startCamera} />}
        {step === 5 && <AlignFace selfie={selfie} onRetake={retakeSelfie} onVerify={handleFaceVerify} onBack={goBack} loading={loading} />}
        {step === 6 && <Success onNext={() => router.push("/physical-activity")} />}

      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS LOCKED LIKE DESIGN ---------- */

function KYCIntro({ onNext, onSkip }) {
  return (
    <> 
<div className="flex flex-col text-white text-center py-10 space-y-4"> 
     <h1 className="text-4xl font-semibold font-Playfair Display  ">Start Your   <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  KYC </span> </h1>
     <p className="font-Poppins text-white/50">Free users must complete KYC within 
 <span className="text-white"> 30 days </span> to continue using the app</p> </div>
    <div className="text-center text-white space-y-6  font-Poppins bg-[#241320] py-10 rounded-2xl  p-6">
     
      <p className="text-md text-white/40">Complete the KYC process to unlock full access. Please fill in your details carefully and correctly.</p>

      <div className="mt-10   flex space-x-10  ">
        <button onClick={onSkip} className="w-full py-3 rounded-full border border-white/20 text-white/60">Skip</button>
        <button onClick={onNext} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400">Continue</button>
      </div>
    </div> </>
  );
}

function VerifyAadhaar({ aadhaar, setAadhaar, onNext, onBack, loading }) {
  return (
    <div className="text-white space-y-20">
      <button onClick={onBack}>←</button>
      <div className="flex flex-col text-center space-y-6"> 
      <h1 className="text-4xl text-center font-semibold">Enter Your    <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Aadhaar Number </span> </h1>
                  <p className="font-Poppins text-white/40">We have sent the OTP to your aadhar
number</p> </div>

      <input
        value={aadhaar}
        maxLength={12}
        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter Aadhaar Number"
        className="w-full text-center font-Poppins bg-white/5 border  border-white/10 rounded-2xl py-4"
      />

      <button disabled={loading} onClick={onNext} className="w-full font-Poppins py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400">
        {loading ? "Sending..." : "Verify Aadhaar"}
      </button>
    </div>
  );
}

// function AadhaarOTP({ otp, setOtp, onNext, onBack, loading }) {
//   const [timer, setTimer] = useState(40);

//   useEffect(() => {
//     if (timer === 0) return;
//     const t = setInterval(() => setTimer((s) => s - 1), 1000);
//     return () => clearInterval(t);
//   }, [timer]);

//   return (
//     <div className="text-white min-h-[80vh] flex flex-col justify-between">
      
//       {/* Top */}
//       <div>
//         <button onClick={onBack} className="text-white/80 text-xl mb-6">
//           ←
//         </button>

//         <h1 className="text-4xl font-semibold font-Playfair Display text-center">
//           Verification{" "}
//           <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
//             Code
//           </span>
//         </h1>

//         <p className="mt-3 text-center text-white/40 text-sm px-4 leading-relaxed">
//           Please enter the code we just sent to your registered mobile number
//           to verify your Aadhar number.
//         </p>

//         {/* OTP Boxes */}
//         <div className="mt-10 flex justify-center gap-3">
//           {[0, 1, 2, 3, 4].map((i) => (
//             <div
//               key={i}
//               className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
//             >
//               <input
//                 maxLength={1}
//                 value={otp[i] || ""}
//                 onChange={(e) => {
//                   const val = e.target.value.replace(/\D/g, "");
//                   if (val) {
//                     const newOtp = otp.split("");
//                     newOtp[i] = val;
//                     setOtp(newOtp.join(""));
//                     const next = document.getElementById(`otp-${i + 1}`);
//                     if (next) next.focus();
//                   }
//                 }}
//                 id={`otp-${i}`}
//                 className="w-12 h-14 bg-black rounded-xl text-center text-xl outline-none focus:ring-2 focus:ring-pink-500"
//               />
//             </div>
//           ))}
//         </div>

//         {/* Resend */}
//         <p className="mt-6 text-center text-white/50 text-sm">
//           Didn’t receive OTP?{" "}
//           {timer > 0 ? (
//             <span className="text-white/40">Resend in {timer}s</span>
//           ) : (
//             <button
//               onClick={() => setTimer(40)}
//               className="underline text-white font-medium"
//             >
//               Resend Code
//             </button>
//           )}
//         </p>
//       </div>

//       {/* Bottom Verify Button */}
//       <button
//         disabled={loading || otp.length !== 5}
//         onClick={onNext}
//         className="w-full py-4 rounded-full text-white text-lg font-medium
//         bg-gradient-to-r from-pink-500 to-orange-400
//         disabled:opacity-40 disabled:cursor-not-allowed"
//       >
//         {loading ? "Verifying..." : "Verify"}
//       </button>
//     </div>
//   );
// }




function AadhaarOTP({ otp, setOtp, onNext, onBack, loading }) {
  const [timer, setTimer] = useState(40);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer === 0) return;
    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newOtp = otp.split("");
    newOtp[i] = val;
    setOtp(newOtp.join(""));

    if (inputsRef.current[i + 1]) {
      inputsRef.current[i + 1].focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      newOtp[i] = "";
      setOtp(newOtp.join(""));
      if (inputsRef.current[i - 1]) {
        inputsRef.current[i - 1].focus();
      }
    }
  };

  const handleResend = () => {
    setTimer(40);
    setResent(true);
  };

  return (
    <div className="text-white min-h-[80vh] flex flex-col justify-between ">
      
      <div>
        <button onClick={onBack} className="text-white/80 text-xl mb-6">
          ←
        </button>

        <h1 className="text-3xl font-Playfair Display text-center font-semibold ">
          Verification{" "}
          <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Code
          </span>
        </h1>

        <p className="mt-3 text-center text-white/40 text-sm px-4 leading-relaxed font-Poppins ">
          Please enter the code we just sent to your registered mobile number
          to verify your Aadhar number.
        </p>

        {/* OTP Boxes */}
        <div className="mt-10 flex justify-center gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-[1px] rounded-xl bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]"
            >
              <input
                ref={(el) => (inputsRef.current[i] = el)}
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-14 bg-black rounded-xl font-Poppins text-center text-xl outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          ))}
        </div>

        {/* Resend status */}
        <p className="mt-6 text-center text-white/50 text-sm font-Poppins">
          {timer > 0 ? (
            resent ? (
              <>
                OTP has been resent. Enter within{" "}
                <span className="text-white">{timer}s</span>
              </>
            ) : (
              <>
                Didn’t receive OTP?{" "}
                <span className="text-white/40">Resend in {timer}s</span>
              </>
            )
          ) : (
            <button
              onClick={handleResend}
              className="underline text-white font-medium"
            >
              Resend Code
            </button>
          )}
        </p>
      </div>

      <button
        disabled={loading || otp.length !== 5}
        onClick={onNext}
        className="w-full py-4 rounded-full text-white text-lg font-medium
        bg-gradient-to-r from-pink-500 to-orange-400
        disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}





function FaceVerification({ videoRef, canvasRef, onCapture, onBack, startCamera }) {
  useEffect(() => { startCamera(); }, []);

  return (
    <div className="text-white space-y-6">
      <button onClick={onBack}>←</button>
      <h1 className="text-xl font-semibold">Face Verification</h1>

      <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-white/20">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <button onClick={onCapture} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex justify-center gap-2">
        <Camera size={18} /> Verify
      </button>
    </div>
  );
}

function AlignFace({ selfie, onRetake, onVerify, onBack, loading }) {
  return (
    <div className="text-white space-y-6">
      <button onClick={onBack}>←</button>
      <h1 className="text-xl font-semibold">Align Your Face in Frame</h1>

      <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-white/20">
        {selfie && <img src={selfie} className="w-full h-full object-cover" />}
      </div>

      <div className="flex gap-4">
        <button onClick={onRetake} className="flex-1 py-3 border rounded-full">Retake</button>
        <button onClick={onVerify} disabled={loading} className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400">
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

function Success({ onNext }) {
  return (
    <div className="text-center text-white space-y-6">
      <h1 className="text-2xl font-semibold">Congratulations!</h1>
      <p className="text-white/50 text-sm">Your account has been verified successfully.</p>

      <button onClick={onNext} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400">
        Continue
      </button>
    </div>
  );
}
