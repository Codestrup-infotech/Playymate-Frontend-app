"use client";
import axios from "axios";

export default function StepGoogle() {
  const loginWithGoogle = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/google-login", {
        token: "google_access_token_here",
      });

      localStorage.setItem("token", res.data.token); // JWT Store
      alert("Google Login Success");
    } catch {
      alert("Google Login Failed");
    }
  };

  return (
    <div className="w-96">
      <button onClick={loginWithGoogle} className="btn-main w-full">
        Login with Google
      </button>
    </div>
  );
}
