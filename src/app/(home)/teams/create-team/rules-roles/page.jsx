"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"

const SKILL_LEVELS = [
  { value: "all_levels", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Pro" },
]

const AGE_GROUPS = [
  { value: "all_ages", label: "All Ages" },
  { value: "under_18", label: "Under 18" },
  { value: "18_plus", label: "18+" },
  { value: "25_plus", label: "25+" },
  { value: "35_plus", label: "35+" },
]

const DEFAULT_ROLES = [
  {
    key: "co_captain_enabled",
    title: "Co-captain",
    desc: "Assist in team decisions",
    active: true,
  },
  {
    key: "manager_enabled",
    title: "Manager",
    desc: "Handle logistics & scheduling",
    active: false,
  },
  {
    key: "coach_enabled",
    title: "Coach",
    desc: "Training & strategy",
    active: false,
  },
]

export default function RulesRolesPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-200"
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500"

  // State from sessionStorage (from previous step)
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    category_value: "",
    location: "",
    visibility: "public",
    description: "",
  })

  // Form state for rules-roles
  const [formData, setFormData] = useState({
    max_members: 15,
    skill_level: "all_levels",
    age_group: "all_ages",
    roles_config: {
      co_captain_enabled: true,
      manager_enabled: false,
      coach_enabled: false,
    },
  })

  // Load basic info from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("createTeamData")
      if (stored) {
        setBasicInfo(JSON.parse(stored))
      }
    }
  }, [])

  const handleRoleToggle = (roleKey) => {
    setFormData(prev => ({
      ...prev,
      roles_config: {
        ...prev.roles_config,
        [roleKey]: !prev.roles_config[roleKey],
      },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Combine basic info and rules-roles data
    const teamData = {
      ...basicInfo,
      ...formData,
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("createTeamData", JSON.stringify(teamData))
    }
    router.push("/teams/create-team/joining-fee")
  }

  return (
    <div className={`min-h-screen ${pageBg} ${textColor} px-5 py-6 pb-28`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team" className={`${textColor} flex items-center gap-2 font-medium`}>
          <ArrowLeft size={22} />
          <span>Back</span>
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

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TEAM SIZE */}
        <div>
          <p className="text-sm text-gray-500 mb-2">TEAM SIZE: {formData.max_members}</p>

          <input
            type="range"
            name="max_members"
            min="2"
            max="200"
            value={formData.max_members}
            onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
            className="w-full accent-pink-500"
          />

          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>2</span>
            <span>200</span>
          </div>
        </div>

        {/* SKILL LEVEL */}
        <div>
          <p className="text-sm text-gray-500 mb-3">SKILL LEVEL</p>

          <div className="flex flex-wrap gap-3">
            {SKILL_LEVELS.map((item, i) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, skill_level: item.value }))}
                className={`px-5 py-2.5 rounded-full text-sm font-medium ${
                  formData.skill_level === item.value
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : `${cardBg} border ${borderColor} text-gray-700`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* AGE GROUP */}
        <div>
          <p className="text-sm text-gray-500 mb-3">AGE GROUP</p>

          <div className="flex flex-wrap gap-3">
            {AGE_GROUPS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, age_group: item.value }))}
                className={`px-5 py-2.5 rounded-full text-sm font-medium ${
                  formData.age_group === item.value
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                    : `${cardBg} border ${borderColor} text-gray-700`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEAM ROLES */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Team Roles</h2>

          <div className="space-y-4">
            {DEFAULT_ROLES.map((role) => (
              <div
                key={role.key}
                className={`${cardBg} border ${borderColor} rounded-2xl p-4 flex items-center justify-between shadow-sm`}
              >
                <div>
                  <p className="font-semibold">{role.title}</p>
                  <p className="text-sm text-gray-500">{role.desc}</p>
                </div>

                {/* TOGGLE */}
                <button
                  type="button"
                  onClick={() => handleRoleToggle(role.key)}
                  className={`w-14 h-8 rounded-full flex items-center p-1 ${
                    formData.roles_config[role.key]
                      ? "bg-gradient-to-r from-pink-500 to-orange-400"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow transform transition ${
                      formData.roles_config[role.key] ? "ml-auto" : ""
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className="fixed bottom-4 inset-x-4 flex justify-center">
          <button
            type="submit"
            className="px-10 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-semibold text-white flex items-center justify-center shadow-lg"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
