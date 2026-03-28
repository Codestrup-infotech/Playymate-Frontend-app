"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RulesRolesPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-5 py-6 pb-28">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team" className="text-gray-900">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </div>

      {/* STEP BAR */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
          <div className="h-1 flex-1 rounded-full bg-gray-300"></div>
          <div className="h-1 flex-1 rounded-full bg-gray-300"></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Basic info</span>
          <span className="text-pink-500 font-medium">Rules & Roles</span>
          <span className="text-gray-400">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </div>

      {/* TEAM SIZE */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">TEAM SIZE: 15</p>

        <input
          type="range"
          min="5"
          max="50"
          defaultValue="15"
          className="w-full accent-pink-500"
        />

        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      {/* SKILL LEVEL */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-3">SKILL LEVEL</p>

        <div className="flex flex-wrap gap-3">
          {["All Levels", "Beginner", "Intermediate", "Advanced", "Pro"].map((item, i) => (
            <button
              key={i}
              className={`px-5 py-2.5 rounded-full text-sm font-medium ${
                i === 0
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* AGE GROUP */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-3">AGE GROUP</p>

        <div className="flex flex-wrap gap-3">
          {["Under 18", "18+", "25+", "35+", "All Ages"].map((item, i) => (
            <button
              key={i}
              className={`px-5 py-2.5 rounded-full text-sm font-medium ${
                i === 0
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* TEAM ROLES */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Team Roles</h2>

        <div className="space-y-4">

          {/* ROLE ITEM */}
          {[
            {
              title: "Co-captain",
              desc: "Assist in team decisions",
              active: true,
            },
            {
              title: "Manager",
              desc: "Handle logistics & scheduling",
              active: false,
            },
            {
              title: "Coach",
              desc: "Training & strategy",
              active: false,
            },
          ].map((role, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="font-semibold">{role.title}</p>
                <p className="text-sm text-gray-500">{role.desc}</p>
              </div>

              {/* TOGGLE (UI ONLY) */}
              <div
                className={`w-14 h-8 rounded-full flex items-center p-1 ${
                  role.active
                    ? "bg-gradient-to-r from-pink-500 to-orange-400"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow transform transition ${
                    role.active ? "ml-auto" : ""
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTINUE BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams/create-team/joining-fee"
          className="px-10 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-semibold text-white flex items-center justify-center shadow-lg"
        >
          Continue
        </Link>
      </div>
    </div>
  )
}