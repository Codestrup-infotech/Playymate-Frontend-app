"use client";

import { useState } from "react";
import Image from "next/image";


export default function LoginFlow() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);

    const next = () => setStep(step + 1);
    const back = () => setStep(step - 1);

    const handleOtp = (val, i) => {
        const copy = [...otp];
        copy[i] = val;
        setOtp(copy);
    };

    const avatars = [
        // "/loginAvatars/logo.png",
        "/loginAvatars/avatars1.jpg",
        "/loginAvatars/avatars2.jpg",
        "/loginAvatars/avatars3.jpg",
        "/loginAvatars/avatars4.jpg",
        "/loginAvatars/avatars5.jpg",
        "/loginAvatars/avatars6.jpg",
    ];



    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-[380px] px-6">

                {step > 1 && (
                    <button onClick={back} className="mt-6 mb-10 text-gray-400 text-3xl font-bold"> ← </button>
                )}

                {/* ---------------- STEP 1 ---------------- */}
                {step === 1 && (

                    <div className="text-center">
                        <img src="/loginAvatars/logo.png" alt="" className="mb-20" />

                        {/* AVATAR RING */}
                        <div className="relative flex justify-center mb-14">


                            {/* CENTER AVATAR */}
                            <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center z-10">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                    <Image
                                        src="/loginAvatars/avatars1.jpg"
                                        fill
                                        alt="avatar"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* ORBIT */}
                            <div className="absolute inset-0 flex items-center justify-center mb-">

                                {/* DASHED RING */}
                                <div className="w-44 h-44 border border-dashed border-gray-600 rounded-full animate-spin-slow" />

                                {avatars.map((a, i) => (
                                    <div
                                        key={i}
                                        className="absolute animate-spin-slow-reverse w-9 h-9 rounded-full p-[2px] bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg"
                                        style={{
                                            transform: `rotate(${i * 60}deg) translate(88px) rotate(-${i * 60}deg)`
                                        }}
                                    >
                                        <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                                            <Image src={a} fill alt="avatar" className="object-cover" />
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* HEADLINE */}
                        <h2 className="text-3xl font-serif mb-2">
                            Find Your People,
                        </h2>
                        <h3 className="text-3xl ml-16 flex font-serif mb-5">
                            Play your
                             <svg
                                viewBox="0 0 140 50"
                                width="140"
                                height="50"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="vibeGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EF3AFF" />
                                        <stop offset="100%" stopColor="#FF8319" />
                                    </linearGradient>
                                </defs>

                                <text
                                    x="10"
                                    y="26"
                                    fontSize="36"
                                    fontWeight="700"
                                    fontFamily="serif"
                                    fill="url(#vibeGradient)"
                                >
                                    Vibe
                                </text>
                            </svg>
                         

                        </h3>

                        {/* BUTTONS */}
                        <button onClick={next} className="btn-main flex items-center justify-center gap-3">
                            📞 Continue with Phone
                        </button>

                        <button className="btn-outline flex items-center justify-center gap-3">
                            <img src="/loginAvatars/google.png" className="w-6" />
                            Continue with Google
                        </button>


                        <button className="btn-outline flex items-center justify-center gap-3">
                            <img src="/loginAvatars/facebook.png" className="w-7" />
                            Continue with Facebook
                        </button>

                        {/* FOOTER */}
                        <p className="text-sm text-gray-400 mt-6">
                            Already Have an Account?{" "}
                            <span className="text-orange-400 cursor-pointer">
                                Sign in
                            </span>
                        </p>

                    </div>
                )}



                {/* ---------------- STEP 2 ---------------- */}
                {step === 2 && (
                    <div className="min-h-screen text-center   bg-black text-white flex flex-col px-6 pt-10">

                        {/* BACK BUTTON */}
                        {/* <button
                            onClick={back}
                            className="w-8 h-8 flex items-center justify-center border border-cyan-400 text-cyan-400 rounded-md mb-16"
                        >
                            ←
                        </button> */}

                        {/* CONTENT */}
                        <div className="flex flex-col items-center text-center">

                            <h1 className="text-3xl flex font-serif mb-3">
                                Login With
                                   <svg
                                viewBox="0 0 140 50"
                                width="133"
                                height="50"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="vibeGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EF3AFF" />
                                        <stop offset="100%" stopColor="#FF8319" />
                                    </linearGradient>
                                </defs>

                                <text
                                    x="10"
                                    y="28"
                                    fontSize="36"
                                    fontWeight="700"
                                    fontFamily="serif"
                                    fill="url(#vibeGradient)"
                                >
                                    Phone
                                </text>
                            </svg>
                         
                            </h1>

                            <p className="text-gray-400 max-w-xs mb-10">
                                We'll need your phone number to send an OTP for verification.
                            </p>

                            {/* PHONE INPUT */}
                            <div className="w-full max-w-sm mb-12">

                                <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                                    <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                        {/* FLAG */}
                                        <span className="mr-3 text-lg">🇮🇳</span>

                                        {/* CODE */}
                                        <span className="text-gray-400 mr-2">91+</span>

                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Phone number"
                                            className="bg-transparent flex-1 outline-none text-white"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* CONTINUE */}
                            <button
                                onClick={next}
                                className="w-full max-w-sm py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.5)]"
                            >
                                Continue
                            </button>

                        </div>
                    </div>
                )}


                {/* ---------------- STEP 3 ---------------- */}

                {step === 3 && (
                    <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                        {/* TITLE */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl flex ml-16 font-serif mb-3">
                                Enter 
                                <svg
                                viewBox="0 0 140 50"
                                width="130"
                                height="50"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="vibeGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EF3AFF" />
                                        <stop offset="100%" stopColor="#FF8319" />
                                    </linearGradient>
                                </defs>

                                <text
                                    x="10"
                                    y="28"
                                    fontSize="36"
                                    fontWeight="700"
                                    fontFamily="serif"
                                    fill="url(#vibeGradient)"
                                >
                                    Code
                                </text>
                            </svg>
                            </h1>

                            <p className="text-gray-400 text-sm">
                                Please enter code we just send to
                            </p>

                            <p className="text-gray-300 text-sm">
                                +91 {phone || "99292 77633"}
                            </p>
                        </div>

                        {/* OTP BOXES */}
                        <div className="flex justify-center gap-4 mb-6">

                            {otp.map((o, i) => (
                                <div
                                    key={i}
                                    className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400"
                                >
                                    <input
                                        value={o}
                                        onChange={(e) => handleOtp(e.target.value, i)}
                                        maxLength={1}
                                        className="w-12 h-12 bg-black text-center rounded-xl text-xl outline-none"
                                    />
                                </div>
                            ))}

                        </div>

                        {/* TIMER */}
                        <p className="text-center text-sm text-gray-400 mb-14">
                            Enter the code within{" "}
                            <span className="text-red-500 font-semibold">00:30</span>
                        </p>

                        {/* VERIFY */}
                        <button
                            onClick={next}
                            className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                        >
                            Verify
                        </button>

                        {/* RESEND */}
                        <p className="text-center text-sm mt-12 text-gray-400">
                            Didn’t receive OTP?
                            <span className="block text-white underline cursor-pointer mt-1">
                                Resend Code
                            </span>
                        </p>
                    </div>
                )}

                {/* ---------------- STEP 4 ---------------- */}
                {step === 4 && (
                    <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                        {/* TITLE */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl ml-10 flex font-serif mb-3">
                                Email 
                                 <svg
                                viewBox="0 0 140 50"
                                width="133"
                                height="50"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="vibeGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EF3AFF" />
                                        <stop offset="100%" stopColor="#FF8319" />
                                    </linearGradient>
                                </defs>

                                <text
                                    x="10"
                                    y="28"
                                    fontSize="36"
                                    fontWeight="700"
                                    fontFamily="serif"
                                    fill="url(#vibeGradient)"
                                >
                                    Address
                                </text>
                            </svg>
                            </h1>

                            <p className="text-gray-400 text-sm">
                                We'll need your email to stay in touch
                            </p>
                        </div>

                        {/* EMAIL INPUT */}
                        <div className="mb-14">

                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                                <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                    {/* ICON */}
                                    <span className="mr-3 text-gray-400">✉️</span>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="bg-transparent flex-1 outline-none text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* CONTINUE */}
                        <button
                            onClick={next}
                            className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                        >
                            Continue
                        </button>
                    </div>
                )}


                {/* ---------------- STEP 5 ---------------- */}
                {step === 5 && (
                    <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                        {/* TITLE */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl flex ml-16 font-serif mb-3">
                                Enter 
                                <svg
                                viewBox="0 0 140 50"
                                width="130"
                                height="50"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="vibeGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EF3AFF" />
                                        <stop offset="100%" stopColor="#FF8319" />
                                    </linearGradient>
                                </defs>

                                <text
                                    x="10"
                                    y="28"
                                    fontSize="36"
                                    fontWeight="700"
                                    fontFamily="serif"
                                    fill="url(#vibeGradient)"
                                >
                                    Code
                                </text>
                            </svg>
                            </h1>


                            <p className="text-gray-400 text-sm">
                                Please enter code we just send to
                            </p>

                            <p className="text-gray-300 text-sm">
                                {email || "xyz@gmail.com"}
                            </p>
                        </div>

                        {/* OTP BOXES */}
                        <div className="flex justify-center gap-4 mb-6">

                            {otp.map((o, i) => (
                                <div
                                    key={i}
                                    className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400"
                                >
                                    <input
                                        value={o}
                                        onChange={(e) => handleOtp(e.target.value, i)}
                                        maxLength={1}
                                        className="w-12 h-12 bg-black text-center rounded-xl text-xl outline-none"
                                    />
                                </div>
                            ))}

                        </div>

                        {/* TIMER */}
                        <p className="text-center text-sm text-gray-400 mb-14">
                            Enter the code within{" "}
                            <span className="text-red-500 font-semibold">00:30</span>
                        </p>

                        {/* VERIFY */}
                        <button
                            onClick={next}
                            className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                        >
                            Verify
                        </button>

                        {/* RESEND */}
                        <p className="text-center text-sm mt-12 text-gray-400">
                            Didn’t receive OTP?
                            <span className="block text-white underline cursor-pointer mt-1">
                                Resend Code
                            </span>
                        </p>
                    </div>
                )}


                {/* ---------------- STEP 6 ---------------- */}
                {step === 6 && (
                    <div className="min-h-screen  bg-black text-white flex flex-col px-6 pt-14">

                        {/* TITLE */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl font-serif mb-3">
                                What’s Your Name?
                            </h1>

                            <p className="text-gray-400 text-sm">
                                We'll need your email to stay in touch
                            </p>
                        </div>

                        {/* NAME INPUT */}
                        <div className="mb-14">

                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 to-orange-400">
                                <div className="flex items-center bg-black rounded-xl px-4 py-3">

                                    {/* ICON */}
                                    <span className="mr-3 text-gray-400">👤</span>

                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="bg-transparent flex-1 outline-none text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* CONTINUE */}
                        <button
                            className="w-full py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-pink-500 to-orange-400 shadow-[0_0_25px_rgba(255,120,200,0.6)]"
                        >
                            Continue
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
