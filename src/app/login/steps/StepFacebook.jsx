"use client";
import axios from "axios";

export default function StepFacebook() {
  const loginWithFacebook = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/facebook-login", {
        token: "facebook_access_token_here",
      });

      localStorage.setItem("token", res.data.token);
      alert("Facebook Login Success");
    } catch {
      alert("Facebook Login Failed");
    }
  };

  return (
    <div className="w-96">
      <button onClick={loginWithFacebook} className="btn-main w-full">
        Login with Facebook
      </button>
    </div>
  );
}
