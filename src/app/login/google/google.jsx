"use client";

import { useState, useCallback } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.playymate.com/api/v1';

export default function GoogleLogin({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleIdToken = credential?.idToken;
      
      // Send token to backend
      const idToken = await result.user.getIdToken();

      const res = await axios.post(`${API_URL}/auth/social/google`, {
        id_token: idToken,
      });

      if (res.data.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.data.accessToken);
      }
      if (res.data.data?.refreshToken) {
        localStorage.setItem('refreshToken', res.data.data.refreshToken);
      }
      
      // Navigate after successful login
      if (res.data.data?.accessToken) {
        window.location.href = '/';
      } else if (res.data.data?.auth_flow_id) {
        window.location.href = '/onboarding/name';
      }
    } catch (err) {
      console.log("Full error:", err.response?.data);
      console.log("Status:", err.response?.status);
      console.error("Google login error:", err);
      setError("Google Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            Playymate
          </h1>
          <p className="text-gray-400 mt-2">Find your sports partner</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <div className="space-y-4 animate-fadeIn">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white text-black rounded-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-gray-100"
          >
            <img src="/loginAvatars/google.png" className="w-6 h-6" alt="google" />
            <span>{isLoading ? 'Processing...' : 'Continue with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
