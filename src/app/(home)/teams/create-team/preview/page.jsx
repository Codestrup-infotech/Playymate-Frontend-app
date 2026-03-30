"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, MapPin, Users, Trophy, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/ThemeContext"
import { createTeam } from "@/lib/api/teamApi"

export default function Page() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-100"
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500"

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Load team data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("createTeamData")
      if (stored) {
        setTeamData(JSON.parse(stored))
      }
    }
  }, [])

  const handleCreateTeam = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (!teamData) return

    setLoading(true)
    setError(null)

    try {
      // Prepare the API payload
      const apiPayload = {
        name: teamData.name,
        category_type: teamData.category_type || "sports",
        category_value: teamData.category_value,
        visibility: teamData.visibility || "public",
        description: teamData.description,
        skill_level: teamData.skill_level || "all_levels",
        age_group: teamData.age_group || "all_ages",
        max_members: teamData.max_members || 15,
        roles_config: teamData.roles_config || {},
        is_primary_sport: teamData.is_primary_sport || false,
      }

      // Add membership data if paid
      if (teamData.membership) {
        apiPayload.membership = teamData.membership
      }

      const response = await createTeam(apiPayload)
      
      // Clear session storage after successful creation
      sessionStorage.removeItem("createTeamData")
      
      // Navigate to the created team
      router.push(`/teams/join-team?id=${response._id || response.id}`)
    } catch (err) {
      console.error("Error creating team:", err)
      setError(err.message || "Failed to create team. Please try again.")
    } finally {
      setLoading(false)
    }
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

  // Get display values
  const skillLevelLabel = teamData?.skill_level 
    ? teamData.skill_level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : "All Levels"
    
  const ageGroupLabel = teamData?.age_group
    ? teamData.age_group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : "18+"

  return (
    <motion.div
      className={`min-h-screen ${pageBg} ${textColor} px-5 py-6 pb-28 font-sans`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <Link
          href="/teams/create-team/joining-fee"
          className={`p-2 hover:bg-gray-200 rounded-full transition-colors ${isDark ? "hover:bg-gray-800" : ""}`}
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Create Team</h1>
      </motion.div>

      {/* STEP BAR */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {[1, 2, 3, 4].map((step) => (
            <motion.div
              key={step}
              className="h-1.5 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 + step * 0.1, duration: 0.5 }}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="text-gray-400">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-gray-400">Joining Fee</span>
          <span className="text-pink-500">Preview</span>
        </div>
      </motion.div>

      {/* ERROR MESSAGE */}
      {error && (
        <motion.div 
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* TEAM CARD */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className={`${cardBg} border ${borderColor} rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden group`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 group-hover:bg-pink-100 transition-colors duration-500" />

        <div className="flex items-center gap-5 relative z-10">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-2xl font-black text-white shadow-lg"
            whileHover={{ rotate: 5 }}
          >
            {teamData?.name?.charAt(0)?.toUpperCase() || "T"}
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold">{teamData?.name || "Team Name"}</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600">
                {teamData?.category_value || "Sport"}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600">
                {teamData?.visibility === "private" ? "Private" : "Public"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUMMARY */}
      <motion.div
        variants={itemVariants}
        className={`${cardBg} border ${borderColor} rounded-3xl p-6 shadow-sm mb-6`}
      >
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Check size={20} className="text-pink-500" />
          Summary
        </h3>

        <div className="space-y-4">
          <SummaryItem 
            icon={<MapPin size={16} />} 
            label="Location" 
            value={teamData?.location || "Not set"} 
          />
          <SummaryItem 
            icon={<Users size={16} />} 
            label="Team Size" 
            value={`${teamData?.max_members || 15} players`} 
          />
          <SummaryItem 
            icon={<Trophy size={16} />} 
            label="Skill Level" 
            value={skillLevelLabel} 
          />
          <SummaryItem 
            icon={<Calendar size={16} />} 
            label="Age Group" 
            value={ageGroupLabel} 
          />
          {teamData?.membership?.is_paid && (
            <SummaryItem 
              icon={<Check size={16} />} 
              label="Joining Fee" 
              value={`₹${teamData.membership.fee_amount || 0}`} 
            />
          )}
        </div>
      </motion.div>

      {/* TERMS */}
      <motion.div
        variants={itemVariants}
        className={`${cardBg} border ${borderColor} rounded-2xl p-5 flex items-start gap-4 shadow-sm mb-6 group cursor-pointer`}
      >
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="peer w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-pink-500 checked:border-pink-500 transition-all appearance-none cursor-pointer"
            id="terms"
          />
          <Check
            className="absolute left-1 text-white opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100"
            size={16}
          />
        </div>
        <label
          htmlFor="terms"
          className="text-sm text-gray-600 leading-relaxed cursor-pointer group-hover:text-gray-900 transition-colors"
        >
          I agree to the{" "}
          <span className="text-pink-500 font-semibold">
            terms and conditions
          </span>{" "}
          of Playymate
        </label>
      </motion.div>

      {/* CREATE BUTTON */}
      <motion.div
        className="fixed bottom-6 inset-x-5 flex justify-center z-50"
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
          onClick={handleCreateTeam}
          disabled={loading}
          className="w-full max-w-md py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl text-lg font-bold text-white flex items-center justify-center shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Team"}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  )
}
