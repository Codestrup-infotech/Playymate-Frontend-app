"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"

const MEMBERSHIP_DURATIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
]

export default function JoiningFeePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-200"

  // State from sessionStorage (from previous steps)
  const [teamData, setTeamData] = useState({
    name: "",
    category_value: "",
    location: "",
    visibility: "public",
    description: "",
    max_members: 15,
    skill_level: "all_levels",
    age_group: "all_ages",
    roles_config: {
      co_captain_enabled: true,
      manager_enabled: false,
      coach_enabled: false,
    },
  })

  // Form state for membership
  const [formData, setFormData] = useState({
    is_paid: true,
    fee_amount: 0,
    default_duration_type: "YEARLY",
    allow_duration_choice: true,
    duration_pricing: {
      MONTHLY: { amount: 0 },
      QUARTERLY: { amount: 0 },
      YEARLY: { amount: 0 },
    },
    welcome_bonus_coins: 0,
    use_gold_coins: false,
    use_diamonds: true,
    host_earnings: "wallet",
  })

  // Load team data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("createTeamData")
      if (stored) {
        setTeamData(JSON.parse(stored))
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Combine all data
    const fullTeamData = {
      ...teamData,
      membership: {
        is_paid: formData.is_paid,
        fee_amount: formData.fee_amount,
        default_duration_type: formData.default_duration_type,
        allow_duration_choice: formData.allow_duration_choice,
        duration_pricing: formData.duration_pricing,
        welcome_bonus_coins: formData.welcome_bonus_coins,
      },
      payment_preferences: {
        use_gold_coins: formData.use_gold_coins,
        use_diamonds: formData.use_diamonds,
      },
      host_earnings: formData.host_earnings,
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("createTeamData", JSON.stringify(fullTeamData))
    }
    router.push("/teams/create-team/preview")
  }

  return (
    <div className={`min-h-screen ${pageBg} ${textColor} px-5 py-6 pb-28`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/rules-roles" className={textColor}>
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </div>

      {/* STEP BAR */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-pink-500 font-medium">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ENABLE JOINING FEE */}
        <div className={`${cardBg} border ${borderColor} rounded-2xl p-5 flex items-center justify-between shadow-sm`}>
          <div>
            <h3 className="font-semibold text-lg">Enable Joining Fee</h3>
            <p className="text-sm text-gray-500">Charge players to join your team</p>
          </div>

          {/* TOGGLE UI */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_paid}
              onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 ${formData.is_paid ? "bg-gradient-to-r from-pink-500 to-orange-400" : "bg-gray-300"}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${formData.is_paid ? "translate-x-0" : "ml-auto"}`}></div>
            </div>
          </label>
        </div>

        {formData.is_paid && (
          <>
            {/* FEE AMOUNT */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">FEE AMOUNT (₹)</p>
              <input
                type="number"
                value={formData.fee_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: parseFloat(e.target.value) || 0 }))}
                min="0"
                className={`w-full ${cardBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm`}
              />
            </div>

            {/* DURATION PRICING */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">DURATION PRICING</p>
              
              <div className="space-y-3">
                {MEMBERSHIP_DURATIONS.map((duration) => (
                  <div key={duration.value} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-500">{duration.label}</span>
                    <input
                      type="number"
                      value={formData.duration_pricing[duration.value]?.amount || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        duration_pricing: {
                          ...prev.duration_pricing,
                          [duration.value]: { amount: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      min="0"
                      placeholder="Amount"
                      className={`flex-1 ${cardBg} border ${borderColor} rounded-xl px-3 py-2 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* GOLD COIN DISCOUNT */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-5 shadow-sm mb-6`}>
              <h3 className="font-semibold mb-1">Gold Coin Discount</h3>
              <p className="text-sm text-gray-500 mb-4">Allow Discount Via Gold Coins</p>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={formData.use_gold_coins}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_gold_coins: e.target.checked }))}
                  className="w-5 h-5 accent-pink-500"
                />
                <span className="text-sm text-gray-500">Enable gold coin payments</span>
              </div>
            </div>

            {/* DIAMOND PAYMENT */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-5 flex items-center justify-between shadow-sm mb-6`}>
              <div>
                <h3 className="font-semibold">Diamond Coin Payment</h3>
                <p className="text-sm text-gray-500">Full Payment Via Diamond Coins</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.use_diamonds}
                    onChange={(e) => setFormData(prev => ({ ...prev, use_diamonds: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 ${formData.use_diamonds ? "bg-gradient-to-r from-pink-500 to-orange-400" : "bg-gray-300"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${formData.use_diamonds ? "translate-x-0" : ""}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

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
