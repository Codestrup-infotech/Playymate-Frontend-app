"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, MapPin, Users, Trophy, Calendar, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/ThemeContext"
import { createTeam, generatePresignedUrl } from "@/lib/api/teamApi"

// Helper function to convert team name to URL slug
const toSlug = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/\s+/g, "-")
}

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

  // Image state
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const bannerInputRef = useRef(null)
  const profileInputRef = useRef(null)

  // Load team data and images from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load team data
      const stored = sessionStorage.getItem("createTeamData")
      if (stored) {
        setTeamData(JSON.parse(stored))
      }

      // Load saved images from sessionStorage
      const savedBanner = sessionStorage.getItem("teamBannerImage")
      const savedProfile = sessionStorage.getItem("teamProfileImage")
      const savedBannerFile = sessionStorage.getItem("teamBannerFile")
      const savedProfileFile = sessionStorage.getItem("teamProfileFile")

      if (savedBanner) {
        setBannerImage(savedBanner)
      }
      if (savedProfile) {
        setProfileImage(savedProfile)
      }

      // Restore File objects from base64
    // ✅ Banner File Restore (ERROR-FREE)
if (savedBannerFile) {
  const fileData = sessionStorage.getItem("teamBannerFileData")
  if (fileData) {
    try {
      const parts = fileData.split(",")

      const mimeMatch = parts[0]?.match(/:(.*?);/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"

      const base64String = parts.length > 1 ? parts[1] : parts[0]

      // ✅ Clean + normalize base64 (fix for atob error)
      const cleanedBase64 = base64String
        .replace(/\s/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/")

      const byteCharacters = atob(cleanedBase64)
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const file = new File([blob], savedBannerFile, { type: mimeType })

      setBannerFile(file)
    } catch (err) {
      console.error("Banner decode error:", err)
    }
  }
}


// ✅ Profile File Restore (ERROR-FREE)
if (savedProfileFile) {
  const fileData = sessionStorage.getItem("teamProfileFileData")
  if (fileData) {
    try {
      const parts = fileData.split(",")

      const mimeMatch = parts[0]?.match(/:(.*?);/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"

      const base64String = parts.length > 1 ? parts[1] : parts[0]

      // ✅ Clean + normalize base64 (fix for atob error)
      const cleanedBase64 = base64String
        .replace(/\s/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/")

      const byteCharacters = atob(cleanedBase64)
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const file = new File([blob], savedProfileFile, { type: mimeType })

      setProfileFile(file)
    } catch (err) {
      console.error("Profile decode error:", err)
    }
  }
}
    }
  }, [])

  // Helper: Convert File to base64 for sessionStorage
  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
  }

 const handleBannerUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // ✅ convert to base64 (persistent)
  const base64 = await fileToBase64(file)

  // ✅ set preview image (no blob URL)
  setBannerImage(base64)

  // ✅ keep file for API upload
  setBannerFile(file)

  // ✅ store in sessionStorage
  sessionStorage.setItem("teamBannerFileData", base64)
  sessionStorage.setItem("teamBannerFile", file.name)
}

  const handleProfileUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // ✅ convert to base64 (persistent)
  const base64 = await fileToBase64(file)

  // ✅ set preview image (no blob URL)
  setProfileImage(base64)

  // ✅ keep file for API upload
  setProfileFile(file)

  // ✅ store in sessionStorage (only required data)
  sessionStorage.setItem("teamProfileFileData", base64)
  sessionStorage.setItem("teamProfileFile", file.name)
}

  const handleCreateTeam = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (!teamData) return

    setLoading(true)
    setError(null)

    try {
      // Helper: Upload file to S3 using presigned URL
      const uploadToS3 = async (file, purpose) => {
        if (!file) return null

        const fileName = sessionStorage.getItem(`team${purpose}File`) || `${purpose}_${Date.now()}`
        const mimeType = file.type || "image/png"

        // Get presigned URL from API
        const { data } = await generatePresignedUrl({
          purpose,
          file_name: fileName,
          mime_type: mimeType,
        })

        const { presigned_url, key } = data

        // Upload to S3
        await fetch(presigned_url, {
          method: "PUT",
          headers: { "Content-Type": mimeType },
          body: file,
        })

        return key
      }

      // Upload images to S3 if they exist
      let logoKey = null
      let bannerKey = null

      if (profileFile) {
        logoKey = await uploadToS3(profileFile, "logo")
      }

      if (bannerFile) {
        bannerKey = await uploadToS3(bannerFile, "banner")
      }

      // Prepare the API payload
      const categoryType = teamData.category_type?.trim() || "sports"
      
      console.log("Creating team with:", {
        name: teamData.name,
        category_type: categoryType,
        category_value: teamData.category_value,
        fullTeamData: teamData
      })
      
      const apiPayload = {
        name: teamData.name,
        category_type: categoryType,
        category_value: teamData.category_value,
        visibility: teamData.visibility || "public",
        description: teamData.description,
        skill_level: teamData.skill_level || "all_levels",
        age_group: teamData.age_group || "all_ages",
        max_members: teamData.max_members || 15,
        roles_config: teamData.roles_config || {},
        is_primary_sport: teamData.is_primary_sport || false,
      }

      // Add logo and banner keys if uploaded
      if (logoKey) {
        apiPayload.logo_key = logoKey
      }
      if (bannerKey) {
        apiPayload.banner_key = bannerKey
      }

      // Add membership data if paid
      if (teamData.membership) {
        apiPayload.membership = teamData.membership
      }

      const response = await createTeam(apiPayload)

      // Console log the response to see the result
      console.log("Create team response:", response)

      // Clear session storage after successful creation
      sessionStorage.removeItem("createTeamData")
      sessionStorage.removeItem("teamBannerImage")
      sessionStorage.removeItem("teamProfileImage")
      sessionStorage.removeItem("teamBannerFile")
      sessionStorage.removeItem("teamProfileFile")
      sessionStorage.removeItem("teamBannerFileData")
      sessionStorage.removeItem("teamProfileFileData")

      // Navigate to the created team using the slug format
      router.push(`/teams/my-team/${toSlug(response.name)}`)
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
    ? teamData.skill_level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "All Levels"

  const ageGroupLabel = teamData?.age_group
    ? teamData.age_group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "18+"

  const teamInitial = teamData?.name?.charAt(0)?.toUpperCase() || "T"

  return (
    <motion.div
      className={`min-h-screen ${pageBg} ${textColor} px-5 py-6 pb-10 font-Poppins`}
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
        <h1 className="text-xl tracking-tight">Create Team</h1>
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

      {/* TEAM CARD WITH BANNER + PROFILE UPLOAD */}
      <motion.div
        variants={itemVariants}
        className={`${cardBg} border ${borderColor} rounded-3xl shadow-sm mb-6 overflow-hidden`}
      >
        {/* Hidden file inputs */}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfileUpload}
        />

       {/* BANNER SECTION */}
<div
  className="relative w-full h-36 cursor-pointer group"
  onClick={() => bannerInputRef.current?.click()}
>
  {/* Banner: image with fallback */}
  {bannerImage ? (
    <img
      src={bannerImage}
      alt="Team Banner"
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none"
        e.currentTarget.parentElement.style.background =
          "linear-gradient(to right, #EF3AFF, #FF8319)"
      }}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]" />
  )}

  {/* Banner overlay */}
  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
      <Camera size={20} className="text-white" />
    </div>
    <span className="text-white text-xs font-semibold">Upload Banner</span>
  </div>
</div>

        {/* PROFILE IMAGE + TEAM INFO ROW */}
        <div className="flex items-end gap-4 px-5 pb-5 -mt-8 relative">
          {/* Profile image / initials avatar */}
          <div
            className="relative cursor-pointer group/profile shrink-0"
            onClick={() => profileInputRef.current?.click()}
          >
          <div
  className="relative cursor-pointer group/profile shrink-0"
  onClick={() => profileInputRef.current?.click()}
>
  <div className="w-36 h-36   rounded-2xl border-2 border-white dark:border-[#1a1a2e] overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
    
    {profileImage ? (
      <img
        src={profileImage}
        alt="Team Profile"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    ) : null}

    {/* ✅ Default SVG always present behind image */}
   <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-10 h-10 text-gray-500"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" />
  <path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
</svg>
  </div>

  {/* Camera overlay */}
  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-200 flex items-center justify-center">
    <Camera size={18} className="text-white" />
  </div>
</div>

            {/* Camera icon overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
          </div>

          {/* Team name + badges */}
          <div className="lg:pb-5 lg:px-5">
            <h2 className="text-2xl  font-Poppins font-bold ">{teamData?.name || "Team Name"}</h2>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider bg-green-100 text-green-600">
                {teamData?.category_value || "Sport"}
              </span>
              <span className="px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-blue-100 text-black  ">
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
        <h3 className="text-lg  mb-5 flex items-center gap-2">
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
          <span className="text-pink-500 font-semibold">terms and conditions</span>{" "}
          of Playymate
        </label>
      </motion.div>

      {/* CREATE BUTTON */}
      <motion.div
        className="mt-10 inset-x-5 flex justify-center z-50"
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
          className="w-full max-w-md py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-lg font-bold text-white flex items-center justify-center shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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