"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const activities = [
  { name: "Social Events", icon: "🎉" },
  { name: "Dining Events", icon: "🍽️" },
  { name: "Standup Comedy", icon: "🎤" },
  { name: "Theatre", icon: "🎭" },
  { name: "Live Concerts", icon: "🎶" },
  { name: "Karaoke", icon: "🎤" },
  { name: "Adventure Games", icon: "🧗" },
  { name: "Gigs", icon: "🎸" },
  { name: "Night Clubs", icon: "🕺" },
  { name: "Wine Tasting", icon: "🍷" },
];

export default function ActivitiesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1); // 1 = select, 2 = confirm

  const toggleActivity = (name) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((a) => a !== name);
      }

      if (prev.length === 3) {
        const copy = [...prev];
        copy.pop();
        return [...copy, name];
      }

      return [...prev, name];
    });
  };

  useEffect(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("selectedActivities") || "[]"
    );
    if (saved.length) setSelected(saved);

    const savedStep = sessionStorage.getItem("activity_step");
    if (savedStep === "selected") setStep(2);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "selectedActivities",
      JSON.stringify(selected)
    );
  }, [selected]);

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
      <div className="w-full max-w-6xl">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="text-center mb-10 space-y-4">
              <h1 className="text-white text-3xl md:text-4xl font-semibold">
                Personalize Your{" "}
                <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Playymate
                </span>{" "}
                Experience
              </h1>
              <p className="text-gray-400">
                Choose up to 3 activities you enjoy
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activities.map((activity, i) => {
                const isActive = selected.includes(activity.name);
                return (
                  <button
                    key={i}
                    onClick={() => toggleActivity(activity.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400 scale-[1.02]"
                          : "bg-[#050B14] border-pink-500 text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:scale-[1.02]"
                      }`}
                  >
                    <span className="text-lg">{activity.icon}</span>
                    <span className="text-sm md:text-base font-medium">
                      {activity.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => {
                  setStep(2);
                  sessionStorage.setItem("activity_step", "selected");
                }}
                disabled={selected.length < 3}
                className="px-10 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="mb-10 text-center space-y-3">
              <h1 className="text-white text-3xl font-semibold">
                Your Selected Activities
              </h1>
              <p className="text-gray-400">
                Choose one to continue
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selected.map((name, i) => {
                const activity = activities.find(
                  (a) => a.name === name
                );
                return (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(
                        `/physical-questions/activities/${name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                    className="flex items-center gap-3 px-4 py-4 rounded-xl border border-pink-400 text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition"
                  >
                    <span className="text-lg">{activity?.icon}</span>
                    <span className="text-base font-medium">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="text-pink-400 underline"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
