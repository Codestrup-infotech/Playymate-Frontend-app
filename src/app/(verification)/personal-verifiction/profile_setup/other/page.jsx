"use client"; // if you use hooks, router, or browser APIs

import React from "react";
import { useRouter } from "next/navigation";

export default function OtherProfileSetupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Other Profile Setup</h1>

      <p className="mb-6">Fill your other details here.</p>

      <button
        onClick={() => {
          sessionStorage.setItem("pq_step", "7");
          router.push("/personal-verifiction");
        }}
        className="px-4 py-2 rounded bg-pink-600"
      >
        Back to Verification
      </button>
    </div>
  );
}
