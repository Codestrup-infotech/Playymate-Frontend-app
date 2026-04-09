"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"
import { motion } from "framer-motion"

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
    fee_amount: "",
    default_duration_type: "YEARLY",
    allow_duration_choice: true,
    duration_pricing: {
      MONTHLY: { amount: "" },
      QUARTERLY: { amount: "" },
      YEARLY: { amount: "" },
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
        const parsed = JSON.parse(stored)
        setTeamData(parsed)
        // Also load membership data if exists
        if (parsed.membership) {
          setFormData(prev => ({
            ...prev,
            is_paid: parsed.membership.is_paid ?? true,
            fee_amount: parsed.membership.fee_amount?.toString() ?? "",
            default_duration_type: parsed.membership.default_duration_type ?? "YEARLY",
            allow_duration_choice: parsed.membership.allow_duration_choice ?? true,
            duration_pricing: {
              MONTHLY: { amount: parsed.membership.duration_pricing?.MONTHLY?.amount?.toString() ?? "" },
              QUARTERLY: { amount: parsed.membership.duration_pricing?.QUARTERLY?.amount?.toString() ?? "" },
              YEARLY: { amount: parsed.membership.duration_pricing?.YEARLY?.amount?.toString() ?? "" },
            },
            welcome_bonus_coins: parsed.membership.welcome_bonus_coins ?? 0,
          }))
        }
        // Also load payment preferences if exists
        if (parsed.payment_preferences) {
          setFormData(prev => ({
            ...prev,
            use_gold_coins: parsed.payment_preferences.use_gold_coins ?? false,
            use_diamonds: parsed.payment_preferences.use_diamonds ?? true,
            host_earnings: parsed.host_earnings ?? "wallet",
          }))
        }
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Convert string values to numbers for submission
    const feeAmount = formData.fee_amount === "" ? 0 : parseFloat(formData.fee_amount)
    const durationPricing = {
      MONTHLY: { amount: formData.duration_pricing.MONTHLY.amount === "" ? 0 : parseFloat(formData.duration_pricing.MONTHLY.amount) },
      QUARTERLY: { amount: formData.duration_pricing.QUARTERLY.amount === "" ? 0 : parseFloat(formData.duration_pricing.QUARTERLY.amount) },
      YEARLY: { amount: formData.duration_pricing.YEARLY.amount === "" ? 0 : parseFloat(formData.duration_pricing.YEARLY.amount) },
    }
    // Combine all data
    const fullTeamData = {
      ...teamData,
      membership: {
        is_paid: formData.is_paid,
        fee_amount: feeAmount,
        default_duration_type: formData.default_duration_type,
        allow_duration_choice: formData.allow_duration_choice,
        duration_pricing: durationPricing,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div
      className={`min-h-screen lg:px-60 ${pageBg} ${textColor} px-5 py-6 pb-10 font-Poppins`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/rules-roles" className={textColor}>
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </motion.div>

      {/* STEP BAR */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
            className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
          <motion.div 
            className="h-1 flex-1 bg-gray-300 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-pink-500 font-medium">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ENABLE JOINING FEE */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={`${cardBg} border ${borderColor} rounded-2xl p-5 flex items-center justify-between shadow-sm`}
        >
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
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${formData.is_paid ? "translate-x-6" : "translate-x-0"}`}></div>
            </div>
          </label>
        </motion.div>

        {formData.is_paid && (
          <>
            {/* FEE AMOUNT */}
            <motion.div variants={itemVariants} className="mb-6">
              <p className="text-sm text-gray-500 mb-2">FEE AMOUNT (₹)</p>
              <input
                type="number"
                value={formData.fee_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: e.target.value }))}
                placeholder="Enter Yearly fee amount"
                className={`w-full ${cardBg} border ${borderColor} rounded-2xl px-4 py-4 ${textColor} placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm`}
              />
            </motion.div>

           
            {/* GOLD COIN DISCOUNT */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className={`${cardBg} border ${borderColor} rounded-2xl p-5 shadow-sm mb-6 group cursor-pointer`}
            >
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
            </motion.div>

         
          </>
        )}

        {/* CONTINUE BUTTON */}
        <motion.div 
          className="bottom-4 pt-6 inset-x-4 flex justify-center"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-10 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-semibold text-white flex items-center justify-center shadow-lg"
          >
            Continue
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  )
}
