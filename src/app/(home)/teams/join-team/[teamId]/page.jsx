"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Trophy, 
  Crown, 
  Shield,
  Coins,
  Star,
  CheckCircle,
  AlertCircle,
  Share2,
  MoreVertical,
  Calendar
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/lib/ThemeContext"
import { getTeamProfile } from "@/lib/api/teamApi"

const SKILL_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
  professional: "Professional"
}

const DURATION_LABELS = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly"
}

export default function TeamProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const teamId = params?.teamId

  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Theme styles - matching joining-fee page
  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-100"
  const mutedBg = isDark ? "bg-gray-800" : "bg-gray-100"

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        setError("Invalid team ID")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await getTeamProfile(teamId)
        const teamData = response?.data || response

        if (!teamData || !teamData._id) {
          setError("Team not found")
          setTeam(null)
        } else {
          setTeam(teamData)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching team:", err)
        setError(err?.message || "Failed to load team details")
        setTeam(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [teamId])

  const handleBack = () => {
    if (router?.back) {
      try {
        router.back()
        return
      } catch (e) {
        console.warn("router.back() failed, falling back:", e)
      }
    }
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/teams'
    }
  }

  if (loading) {
    return (
      <div className={`p-3 sm:p-4 md:p-6 ${pageBg} min-h-screen`}>
        <div className="flex items-center gap-3 mb-6 pt-4 max-w-2xl mx-auto">
          <div className={`w-10 h-10 rounded-full ${mutedBg} animate-pulse shrink-0`}></div>
          <div className={`h-6 ${mutedBg} rounded w-32 animate-pulse`}></div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className={`h-40 sm:h-48 rounded-2xl sm:rounded-3xl ${mutedBg} animate-pulse mb-4`}></div>
          <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm mb-4 border ${borderColor} -mt-12 sm:-mt-16 relative z-10`}>
            <div className="flex items-end gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl ${mutedBg} animate-pulse shrink-0`}></div>
              <div className="flex-1 pb-2">
                <div className={`h-7 sm:h-8 ${mutedBg} rounded w-1/2 animate-pulse mb-2`}></div>
                <div className={`h-4 ${mutedBg} rounded w-1/3 animate-pulse`}></div>
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border ${borderColor}`}>
                <div className={`h-4 ${mutedBg} rounded w-1/4 animate-pulse mb-3`}></div>
                <div className={`h-3 ${mutedBg} rounded w-3/4 animate-pulse`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !team) {
    return (
      <div className={`p-4 sm:p-6 flex items-center justify-center min-h-screen ${pageBg}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full text-center shadow-xl border ${borderColor} mx-4`}
        >
          <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6`}>
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h2 className={`text-xl sm:text-2xl  mb-2 sm:mb-3 ${textColor}`}>Team Not Found</h2>
          <p className={`${mutedText} mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base`}>
            The team you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-transform text-sm sm:text-base"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className={`p-4 sm:p-6 flex items-center justify-center min-h-screen ${pageBg}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full text-center shadow-xl border ${borderColor} mx-4`}
        >
          <div className={`w-16 h-16 sm:w-20 sm:h-20 ${mutedBg} rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6`}>
            <Users className={`w-8 h-8 sm:w-10 sm:h-10 ${mutedText}`} />
          </div>
          <h2 className={`text-xl sm:text-2xl  mb-2 sm:mb-3 ${textColor}`}>No Team Data</h2>
          <p className={`${mutedText} mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base`}>
            Unable to load team information. Please try again later.
          </p>
          <button
            onClick={() => router.push('/teams')}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-transform text-sm sm:text-base"
          >
            Back to Teams
          </button>
        </motion.div>
      </div>
    )
  }

  const teamData = team
  const location = teamData.location || {}
  const membership = teamData.membership
  const members = teamData.members || []
  const rolesConfig = teamData.roles_config || {}

  const locationString = location.area && location.city
    ? `${location.area}, ${location.city}`
    : location.city || location.area || "Location not set"

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return null
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const skillLevelDisplay = SKILL_LEVELS[teamData.skill_level] || teamData.skill_level || "Not specified"

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className={`min-h-screen ${pageBg} pb-10  selection:bg-pink-500/10`}>

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${isDark ? "bg-black/80" : "bg-white/80"} border-b ${borderColor} px-3 sm:px-4 md:px-6 py-3 sm:py-4`}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border ${borderColor} ${mutedText} shrink-0`}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-xl font-Poppins tracking-tight text-gray-900">Team Profile</h1>
          </div>
          {/* <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border ${borderColor} ${mutedText}`}
            >
              <Share2 size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border ${borderColor} ${mutedText}`}
            >
              <MoreVertical size={16} />
            </motion.button>
          </div> */}
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4"
      >

        {/* Banner */}
        <motion.div
          variants={itemVariants}
          className="relative h-36 sm:h-44 md:h-48 rounded-2xl sm:rounded-[2.5rem] overflow-hidden mb-3 sm:mb-4 shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2">
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white shadow-xl">
              {teamData.category_value || "Sports"}
            </div>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className={`${cardBg} rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-xl mb-4 sm:mb-6 border ${borderColor} -mt-12 sm:-mt-16 md:-mt-20 relative z-10`}
        >
          <div className="flex flex-col items-center text-center">

            {/* Logo */}
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 to-orange-400 p-1 shadow-2xl -mt-12 sm:-mt-16 mb-3 sm:mb-4"
            >
              <div className={`w-full h-full rounded-xl sm:rounded-2xl ${cardBg} flex items-center justify-center overflow-hidden border-4 border-white`}>
                {teamData.logo ? (
                  <img
                    src={teamData.logo}
                    alt={teamData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-Poppins font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-400">
                    {teamData.name?.charAt(0)?.toUpperCase() || "T"}
                  </span>
                )}
              </div>
            </motion.div>

            <h1 className={`text-2xl sm:text-3xl font-Poppins tracking-tighter mb-1 ${textColor} px-2`}>
              {teamData.name}
            </h1>
            <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap justify-center">
              <span className="text-xs sm:text-sm  text-pink-500">
                @{teamData.name?.toLowerCase().replace(/\s+/g, '_')}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className={`text-xs sm:text-sm ${mutedText}`}>{location.city || ""}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              <div className={`${mutedBg} border ${borderColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center`}>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 mb-1 sm:mb-2" />
                <p className={`text-base sm:text-lg font-Poppins font-black ${textColor} leading-none`}>{teamData.member_count || members.length || 0}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest  text-gray-400 mt-1">Members</p>
              </div>
              <div className={`${mutedBg} border ${borderColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center`}>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mb-1 sm:mb-2" />
                <p className={`text-base sm:text-lg  ${textColor} leading-none`}>{skillLevelDisplay.split(' ')[0]}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest  text-gray-400 mt-1">Skill</p>
              </div>
              <div className={`${mutedBg} border ${borderColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center`}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mb-1 sm:mb-2" />
                <p className={`text-base sm:text-lg font-Poppins font-black ${textColor} leading-none`}>{teamData.max_members || 0}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest  text-gray-400 mt-1">Capacity</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Sections */}
        <div className="space-y-3 sm:space-y-4">

          {/* About */}
          {teamData.description && (
            <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
              <h3 className="text-xs sm:text-sm font-Poppins font-black uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 flex items-center gap-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                About Team
              </h3>
              <p className={`${mutedText} text-xs sm:text-sm leading-relaxed font-medium`}>
                {teamData.description}
              </p>
            </motion.div>
          )}

          {/* Location */}
          <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-Poppins font-black uppercase tracking-widest text-gray-400">Primary Location</h3>
                <p className={` text-sm sm:text-base ${textColor}`}>{locationString}</p>
              </div>
            </div>
          </motion.div>

          {/* Membership */}
          {membership && membership.is_paid && (
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] p-1 bg-gradient-to-br from-yellow-400/30 via-orange-400/30 to-pink-400/30"
            >
              <div className={`${cardBg} rounded-xl sm:rounded-[1.9rem] p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="font-Poppins font-black uppercase tracking-widest text-orange-600 flex items-center gap-2 text-xs sm:text-sm">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    Membership Plans
                  </h3>
                  <div className="px-2 sm:px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[9px] sm:text-[10px] font-Poppins font-black text-orange-600 uppercase tracking-widest">
                    Premium
                  </div>
                </div>

                <div className="grid gap-2 sm:gap-3">
                  {membership.duration_pricing && Object.entries(membership.duration_pricing).map(([duration, pricing]) => (
                    <div
                      key={duration}
                      className={`flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl ${mutedBg} border ${borderColor}`}
                    >
                      <span className={` text-sm sm:text-base ${mutedText}`}>{DURATION_LABELS[duration] || duration}</span>
                      <span className={`text-lg sm:text-xl font-Poppins font-black ${textColor}`}>
                        {formatPrice(pricing?.amount)}
                      </span>
                    </div>
                  ))}

                  {!membership.duration_pricing && membership.fee_amount && (
                    <div className={`flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl ${mutedBg} border ${borderColor}`}>
                      <span className={` text-sm sm:text-base ${mutedText}`}>
                        {DURATION_LABELS[membership.default_duration_type] || "Membership"}
                      </span>
                      <span className={`text-lg sm:text-xl font-Poppins font-black ${textColor}`}>
                        {formatPrice(membership.fee_amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col gap-2">
                  {membership.welcome_bonus_coins > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-orange-600 bg-orange-50 p-2.5 sm:p-3 rounded-xl border border-orange-100">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>GET {membership.welcome_bonus_coins} COINS WELCOME BONUS</span>
                    </div>
                  )}
                  {membership.gold_coin_discount_pct > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-pink-600 bg-pink-50 p-2.5 sm:p-3 rounded-xl border border-pink-100">
                      <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>{membership.gold_coin_discount_pct}% DISCOUNT WITH GOLD COINS</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Roles */}
          {(rolesConfig.co_captain_enabled || rolesConfig.manager_enabled || rolesConfig.coach_enabled) && (
            <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
              <h3 className="text-xs sm:text-sm font-Poppins font-black uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                Available Roles
              </h3>
              <div className="flex flex-wrap gap-2">
                {rolesConfig.co_captain_enabled && (
                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${mutedBg} border ${borderColor} flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold ${mutedText}`}>
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    Co-Captain
                  </div>
                )}
                {rolesConfig.manager_enabled && (
                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${mutedBg} border ${borderColor} flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold ${mutedText}`}>
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    Manager
                  </div>
                )}
                {rolesConfig.coach_enabled && (
                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${mutedBg} border ${borderColor} flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold ${mutedText}`}>
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    Coach
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Members */}
          {members.length > 0 && (
            <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-Poppins font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  Squad Members
                </h3>
                <span className={`text-[9px] sm:text-[10px] font-Poppins font-black ${mutedBg} px-2 py-1 rounded-md ${mutedText} uppercase tracking-widest`}>
                  {members.length} Total
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {members.slice(0, 5).map((member, index) => (
                  <div key={member._id || index} className="flex items-center gap-3 sm:gap-4 group">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${mutedBg} p-0.5 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-orange-400 transition-all duration-300`}>
                        <div className={`w-full h-full rounded-[0.6rem] sm:rounded-[0.9rem] ${cardBg} flex items-center justify-center overflow-hidden`}>
                          {member.user?.profile_image_url ? (
                            <img
                              src={member.user.profile_image_url}
                              alt={member.user?.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-Poppins font-black text-gray-400">
                              {member.user?.full_name?.charAt(0)?.toUpperCase() || "M"}
                            </span>
                          )}
                        </div>
                      </div>
                      {member.role === 'owner' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                          <Crown className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={` text-xs sm:text-sm ${textColor} truncate`}>{member.user?.full_name}</p>
                      <p className="text-[9px] sm:text-[10px] font-Poppins font-black uppercase tracking-widest text-gray-400">{member.role}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={`p-1.5 sm:p-2 rounded-lg ${mutedBg} border ${borderColor} ${mutedText} shrink-0`}
                    >
                      <MoreVertical size={13} />
                    </motion.button>
                  </div>
                ))}

                {members.length > 5 && (
                  <button className={`w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${mutedBg} border ${borderColor} text-[10px] sm:text-xs font-Poppins font-black uppercase tracking-widest ${mutedText} hover:${textColor} hover:${mutedBg} transition-all`}>
                    View All {members.length} Members
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 mb-4 text-center">
          <p className="text-[9px] sm:text-[10px] font-Poppins font-black uppercase tracking-[0.2em] text-gray-400">
            Established {teamData.created_at
              ? new Date(teamData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
              : 'Recently'}
          </p>
        </motion.div>
      </motion.main>

      {/* Fixed Bottom CTA */}  
      <AnimatePresence>
        {!teamData.is_member && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className=" bottom-0 inset-x-0 px-3 sm:px-6 pb-5 sm:pb-6 pt-4 bg-gradient-to-t from-white via-white/90 to-transparent z-50"
          >
            <div className="max-w-2xl mx-auto">
              <Link
                href={`/teams/join-team/onboarding?teamId=${teamId}`}
                className="relative group block w-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-orange-500 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center justify-center w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-Poppins font-semibold text-sm sm:text-base tracking-wide shadow-xl shadow-pink-500/20 transition-all active:scale-95">
                  Join Team
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
