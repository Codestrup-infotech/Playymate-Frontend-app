"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import userService from "@/services/user";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState("signup"); // signup | login

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  };

  const handleSignup = async () => {
    if (!validatePassword(form.password)) {
      setMessage(
        "Password must be 8+ chars with uppercase, lowercase, number & special char"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await userService.emailPasswordSignup(
        form.email,
        form.password,
        form.confirmPassword
      );

      setMessage("Account created successfully 🎉");
      setMode("login"); // 👈 Switch to login after signup
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await userService.loginUser(
        form.email,
        form.password
      );

      localStorage.setItem("token", res.data.token);

      router.push("/home"); // 👈 Redirect to home
    } catch (error) {
      setMessage("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-orange-900 text-white transition-all duration-500">

      <div className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-lg border border-purple-500 shadow-2xl">

        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent transition-all duration-300">
          {mode === "signup" ? "Create Account" : "Sign In"}
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-[#1f1f2e] border border-purple-500 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-[#1f1f2e] border border-purple-500 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
        />

        {/* CONFIRM PASSWORD (Only for Signup) */}
        {mode === "signup" && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-[#1f1f2e] border border-purple-500 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
          />
        )}

        {/* BUTTON */}
        <button
          onClick={mode === "signup" ? handleSignup : handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:opacity-90 transition-all"
        >
          {loading
            ? "Please wait..."
            : mode === "signup"
            ? "Create Account"
            : "Login"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="text-center mt-4 text-sm text-yellow-400">
            {message}
          </p>
        )}

        {/* TOGGLE TEXT */}
        <p className="text-center mt-6 text-gray-400 text-sm">
          {mode === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}

          <span
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setMessage("");
            }}
            className="ml-2 text-purple-400 cursor-pointer hover:text-orange-400 transition-colors"
          >
            {mode === "signup" ? "Sign In" : "Create Account"}
          </span>
        </p>

      </div>
    </div>
  );
}