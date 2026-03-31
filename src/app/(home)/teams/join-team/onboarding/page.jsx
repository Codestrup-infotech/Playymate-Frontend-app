"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Wallet, Trophy, Calendar, ShieldCheck, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getTeamProfile, previewMembership } from "@/lib/api/teamApi"

function OnboardingContent() {
  // Call useSearchParams at top level - it works in client components
  const searchParams = useSearchParams()
  const router = useRouter()
  // Safely get teamId with optional chaining
  const teamId = searchParams?.get?.("teamId") || null

  const [teamData, setTeamData] = useState(null)
  const [membershipData, setMembershipData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError("No team specified")
        setLoading(false)
        return
      }

      try {
        const [team, membership] = await Promise.all([
          getTeamProfile(teamId),
          previewMembership(teamId)
        ])
        setTeamData(team)
        setMembershipData(membership)
        // Default select the first option
        if (membership?.options?.length > 0) {
          setSelectedOption(membership.options[0].type)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load team details")
      }
      setLoading(false)
    }

    fetchData()
  }, [teamId])

  // Store teamId in session for payment page
  useEffect(() => {
    if (teamId) {
      sessionStorage.setItem("pendingTeamId", teamId)
    }
  }, [teamId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Preparing your membership...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100">
            <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-pink-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Back to Teams
          </button>
        </motion.div>
      </div>
    )
  }

  const membershipOptions = membershipData?.options || []
  const walletBalances = membershipData?.wallet_balances || {}
  const currentPrice = membershipOptions.find(o => o.type === selectedOption)?.price || teamData?.membership?.fee_amount || 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* COVER & HEADER */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop"
          alt="Stadium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-xl mx-auto px-4 -mt-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          {/* PROFILE SECTION */}
          <div className="p-8 pb-4 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl overflow-hidden bg-white">
                {teamData?.logo ? (
                  <img
                    src={teamData.logo}
                    alt={teamData.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-3xl font-bold text-white">
                    {teamData?.name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                <ShieldCheck size={16} />
              </div>
            </div>
            <h2 className="text-3xl font-bold mt-4 tracking-tight text-slate-900">
              {teamData?.name || "Team Name"}
            </h2>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-sm font-medium">
              <Trophy size={14} className="text-orange-500" />
              {teamData?.category_value || teamData?.sport || "N/A"}
            </div>
          </div>

          <div className="px-6 pb-8 space-y-8">

            {/* MEMBERSHIP OPTIONS */}
            {membershipOptions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select Plan</h3>
                  <span className="text-pink-500 text-xs font-bold bg-pink-50 px-2 py-0.5 rounded">Best Value</span>
                </div>
                <div className="space-y-3">
                  {membershipOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedOption(option.type)}
                      className={`w-full text-left transition-all duration-300 rounded-2xl border-2 p-4 flex justify-between items-center group ${
                        selectedOption === option.type
                          ? "border-pink-500 bg-pink-50/30 ring-4 ring-pink-500/5"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedOption === option.type
                            ? "border-pink-500 bg-pink-500"
                            : "border-slate-300 bg-white"
                        }`}>
                          {selectedOption === option.type && (
                            <Check size={12} className="text-white" strokeWidth={4} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{option.type}</p>
                          {option.duration_label && (
                            <p className="text-xs text-slate-500 font-medium">{option.duration_label}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${selectedOption === option.type ? "text-pink-600" : "text-slate-900"}`}>
                          ₹{option.price || 0}
                        </p>
                        {option.discount > 0 && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Save {option.discount}%
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
                            
            {/* WALLET BALANCES */}
            {(walletBalances.gold_coins > 0 || walletBalances.diamonds > 0) && (
              <section>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Your Rewards</h3>
                <div className="grid grid-cols-2 gap-4">
                  {walletBalances.gold_coins > 0 && (
                    <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-amber-700 font-black text-lg leading-none">{walletBalances.gold_coins}</p>
                        <p className="text-[10px] text-amber-600/80 font-bold uppercase tracking-wider">Gold Coins</p>
                      </div>
                    </div>
                  )}
                  {walletBalances.diamonds > 0 && (
                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="text-blue-700 font-black text-lg leading-none">{walletBalances.diamonds}</p>
                        <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-wider">Diamonds</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="bg-gray-200 rounded-2xl overflow-hidden border border-gray-300">

  {/* SPORT */}
  <div className="flex justify-between items-center px-4 py-4">
    <span className="text-black-400 text-sm">Sport</span>
    <span className="text-gray-800 text-sm font-semibold">
      {teamData?.sport || "Cricket"}
    </span>
  </div>

  <div className="border-t border-gray-300" />

  {/* JOIN FEE */}
  <div className="flex justify-between items-center px-4 py-4">
    <span className="text-black-400 text-sm">Join Fee</span>
    <span className="text-gray-800 text-sm font-semibold">
      ₹{teamData?.membership?.fee_amount || 499}
    </span>
  </div>

  <div className="border-t border-gray-300" />

  {/* DURATION */}
  <div className="flex justify-between items-center px-4 py-4">
    <span className="text-black-400 text-sm">Duration</span>
    <span className="text-black-800 text-sm font-semibold">
      {teamData?.membership?.duration || "Monthly"}
    </span>
  </div>

</div>


            {/* BENEFITS */}
            <section>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Membership Perks</h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                {[
                  { title: "Team Chat Access", desc: "Connect with players instantly", icon: <Zap size={16} /> },
                  { title: "Exclusive Events", desc: "Priority booking for matches", icon: <Calendar size={16} /> },
                  { title: "Member Discounts", desc: "Save on gear and sessions", icon: <Trophy size={16} /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-pink-500">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-sm">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </motion.div>
      </div>

      {/* FOOTER ACTION */}
      <div className=" bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total to pay</p>
            <p className="text-2xl font-black text-slate-900">₹{currentPrice}</p>
          </div>
          <Link
            href={`/teams/join-team/payment?teamId=${teamId}&option=${selectedOption}`}
            className="flex-1 sm:flex-none px-10 py-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 rounded-2xl text-sm font-black text-white flex items-center justify-center shadow-lg shadow-pink-200 transition-all active:scale-95 uppercase tracking-wider"
          >
            Continue to Payment
            <span className="sm:hidden ml-2">· ₹{currentPrice}</span>
          </Link>
        </div>
      </div>

    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export default function JoinPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Preparing your membership...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
