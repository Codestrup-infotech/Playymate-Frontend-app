"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import { resolveInviteCode, acceptInvite, declineInvite, getMyInvites } from "@/lib/api/teamApi";

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

function InviteDetailsSkeleton() {
  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6 pt-4 max-w-2xl mx-auto">
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="h-40 sm:h-48 rounded-2xl sm:rounded-3xl bg-slate-200 animate-pulse mb-4"></div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm mb-4 border border-slate-100 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-200 animate-pulse shrink-0"></div>
            <div className="flex-1 pb-2">
              <div className="h-7 sm:h-8 bg-slate-200 rounded w-1/2 animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse mb-3"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InviteDetailsError({ message, onBack }) {
  return (
    <div className="p-4 sm:p-6 flex items-center justify-center min-h-screen bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full text-center shadow-xl border border-slate-100 mx-4"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-slate-900">Invite Not Found</h2>
        <p className="text-slate-500 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {message || "The invitation you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={onBack}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-transform text-sm sm:text-base"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  )
}

export default function InviteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const inviteCode = params.inviteCode;
  
  const pageBg = "bg-[#F8FAFC] text-slate-900";
  const cardBg = "bg-white border-slate-200/60";
  const mutedText = "text-slate-500";
  const borderColor = "border-slate-200/60";
  const mutedBg = "bg-slate-100";

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!inviteCode) return;
      
      try {
        const response = await resolveInviteCode(inviteCode);
        setInviteData(response.data);
        
        const invitesResponse = await getMyInvites();
        const myInvites = invitesResponse.invites || [];
        const alreadyAccepted = myInvites.some(
          inv => inv.invite_code === inviteCode && inv.status === "accepted"
        );
        if (alreadyAccepted) {
          setIsAccepted(true);
        }
      } catch (err) {
        console.error("Error fetching invite details:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteCode]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      console.log("handleAccept called with inviteCode:", inviteCode);
      const response = await acceptInvite(inviteCode);
      console.log("Accept invite response:", response);
      setIsAccepted(true);
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert(error.message || "Failed to accept invitation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinNow = () => {
    if (inviteData?.team_id) {
      router.push(`/teams/join-team/onboarding?teamId=${inviteData.team_id}`);
    }
  };

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

  if (loading) return <InviteDetailsSkeleton />
  if (error && !inviteData) return <InviteDetailsError message={error} onBack={handleBack} />
  if (!inviteData) return <InviteDetailsError message="Invitation not found" onBack={handleBack} />

  const teamData = inviteData;
  const location = teamData.location || {};
  const membership = teamData.membership;

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
    <div className={`min-h-screen ${pageBg} pb-10 font-sans selection:bg-pink-500/10`}>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border border-slate-200/40 text-slate-600 shrink-0`}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">Invitation Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border border-slate-200/40 text-slate-600`}
            >
              <Share2 size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${mutedBg} flex items-center justify-center border border-slate-200/40 text-slate-600`}
            >
              <MoreVertical size={16} />
            </motion.button>
          </div>
        </div>
      </header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4"
      >

        <motion.div
          variants={itemVariants}
          className="relative h-36 sm:h-44 md:h-48 rounded-2xl sm:rounded-[2.5rem] overflow-hidden mb-3 sm:mb-4 shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2">
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white shadow-xl">
              {teamData.category_value || "Team"}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`${cardBg} rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-xl shadow-slate-200/50 mb-4 sm:mb-6 border ${borderColor} -mt-12 sm:-mt-16 md:-mt-20 relative z-10`}
        >
          <div className="flex flex-col items-center text-center">

            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 to-orange-400 p-1 shadow-2xl -mt-12 sm:-mt-16 mb-3 sm:mb-4"
            >
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                {teamData.logo_url ? (
                  <img
                    src={teamData.logo_url}
                    alt={teamData.team_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-400">
                    {teamData.team_name?.charAt(0)?.toUpperCase() || "T"}
                  </span>
                )}
              </div>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter mb-1 text-slate-900 px-2">
              {teamData.team_name}
            </h1>
            <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap justify-center">
              <span className="text-xs sm:text-sm font-semibold text-pink-500">
                @{teamData.team_name?.toLowerCase().replace(/\s+/g, '_')}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className={`text-xs sm:text-sm ${mutedText}`}>{location.city || "Global"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{teamData.member_count || 0}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Members</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{skillLevelDisplay.split(' ')[0]}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Skill</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{teamData.max_members || 0}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Capacity</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">

          {teamData.description && (
            <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 mb-3 sm:mb-4 flex items-center gap-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                About Team
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                {teamData.description}
              </p>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Primary Location</h3>
                <p className="font-bold text-sm sm:text-base text-slate-900">{locationString}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${borderColor} shadow-sm`}>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 mb-3 sm:mb-4 flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
              Team Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={mutedText}>Category</span>
                <span className="font-medium">{teamData.category_value || teamData.category_type}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={mutedText}>Visibility</span>
                <span className="font-medium capitalize">{teamData.visibility}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={mutedText}>Skill Level</span>
                <span className="font-medium capitalize">{teamData.skill_level || "Any"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={mutedText}>Age Group</span>
                <span className="font-medium capitalize">{teamData.age_group?.replace("_", " ") || "All"}</span>
              </div>
            </div>
          </motion.div>

          {membership && membership.is_paid && (
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] p-1 bg-gradient-to-br from-yellow-400/30 via-orange-400/30 to-pink-400/30"
            >
              <div className="bg-white rounded-xl sm:rounded-[1.9rem] p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="font-black uppercase tracking-widest text-orange-600 flex items-center gap-2 text-xs sm:text-sm">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    Membership Plans
                  </h3>
                  <div className="px-2 sm:px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[9px] sm:text-[10px] font-black text-orange-600 uppercase tracking-widest">
                    Premium
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-600 text-sm sm:text-base">
                    {DURATION_LABELS[membership.default_duration_type] || "Membership"}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900">
                    {formatPrice(membership.fee_amount)}
                  </span>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col gap-2">
                  {membership.welcome_bonus_coins > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-orange-600 bg-orange-50 p-2.5 sm:p-3 rounded-xl border border-orange-100">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>GET {membership.welcome_bonus_coins} COINS WELCOME BONUS</span>
                    </div>
                  )}
                  {membership.gold_coin_discount_pct > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-pink-600 bg-pink-50 p-2.5 sm:p-3 rounded-xl border border-pink-100">
                      <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>{membership.gold_coin_discount_pct}% DISCOUNT WITH GOLD COINS</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 mb-4 text-center">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {teamData.visibility === "public" ? "Public Team" : "Private Team"} • Invitation Required
          </p>
        </motion.div>

      </motion.main>

      <AnimatePresence>
        {teamData.invite_valid && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className=" bottom-0 inset-x-0 px-3 sm:px-6 pb-5 sm:pb-6 pt-4 bg-gradient-to-t from-white via-white/90 to-transparent z-50"
          >
            <div className="max-w-2xl mx-auto">
              {isAccepted ? (
                <Link
                  href={`/teams/join-team/onboarding?teamId=${teamData.team_id}`}
                  className="relative group block w-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-orange-500 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center justify-center w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-4 sm:py-5 rounded-[1.3rem] sm:rounded-[1.8rem] font-black text-base sm:text-lg uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all active:scale-95">
                    Join Now
                  </div>
                </Link>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="relative group block w-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white py-4 sm:py-5 rounded-[1.3rem] sm:rounded-[1.8rem] font-black text-base sm:text-lg uppercase tracking-widest shadow-xl shadow-green-500/20 transition-all active:scale-95 disabled:opacity-70">
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} className="mr-2" />
                        Accept
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!teamData.invite_valid && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 inset-x-0 px-3 sm:px-6 pb-5 sm:pb-6 pt-4 bg-gradient-to-t from-white via-white/90 to-transparent z-50"
        >
          <div className="max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-center font-medium">
              This invitation has expired or is no longer valid
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}