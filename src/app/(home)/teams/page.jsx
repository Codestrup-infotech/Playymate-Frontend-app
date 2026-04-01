"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Trophy, Calendar, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"
import { getMyTeams, checkEligibility, initiateSlotPurchase, confirmSlotPurchase } from "@/lib/api/teamApi"

// Helper function to convert team name to URL slug
const toSlug = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/\s+/g, "-")
}

export default function TeamsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
  const cardBg = isDark ? "bg-[#12121c] border-[#2a2a45]" : "bg-white border-gray-200"
  const actBg = isDark ? "bg-[#12121c] border-[#2a2a45] hover:bg-[#1c1c2e]" : "bg-white border-gray-200 hover:bg-gray-50"
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500"

  // State for team data
  const [teamsData, setTeamsData] = useState({
    owned: [],
    joined: [],
    loading: true,
    error: null,
  })

  // KYC and eligibility state
  const [eligibility, setEligibility] = useState({
    can_create_team: false,
    kyc_status: null,
    max_teams_allowed: 0,
    teams_created_count: 0,
    denial_reason: null,
    loading: false,
    // New fields from eligibility API
    available_packages: [],
    slot_addons_available: false,
    purchased_slots_total: 0,
    purchased_slots_remaining: 0,
    plan_name: '',
    plan_limit: 0,
  })

  // Show KYC modal
  const [showKycModal, setShowKycModal] = useState(false)

  // Show limit exceeded modal
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Slot purchase state
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState(null)

  // Handle slot package purchase
  const handlePurchaseSlot = async () => {
    if (!selectedPackage) {
      setPurchaseError("Please select a package")
      return
    }

    setPurchasing(true)
    setPurchaseError(null)

    try {
      const idempotencyKey = `slot_purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Initiate the purchase
      const initiateResponse = await initiateSlotPurchase({
        package_id: selectedPackage._id,
        idempotency_key: idempotencyKey,
        use_gold_coins: false
      })

      if (initiateResponse.status === 'success' || initiateResponse.data) {
        // Confirm the purchase
        const confirmResponse = await confirmSlotPurchase({
          idempotency_key: idempotencyKey
        })

        if (confirmResponse.status === 'success') {
          // Close modal and refresh eligibility
          setShowLimitModal(false)
          setSelectedPackage(null)
          
          // Refresh eligibility to get updated slot balance
          const updatedEligibility = await checkEligibility()
          setEligibility(prev => ({
            ...prev,
            purchased_slots_total: updatedEligibility.purchased_slots_total || 0,
            purchased_slots_remaining: updatedEligibility.purchased_slots_remaining || 0,
            can_create_team: updatedEligibility.can_create_team || false
          }))

          // If user can now create team, navigate to create page
          if (updatedEligibility.can_create_team) {
            router.push("/teams/create-team")
          }
        } else {
          setPurchaseError(confirmResponse.message || "Purchase failed")
        }
      } else {
        setPurchaseError(initiateResponse.message || "Purchase initiation failed. You may not have enough coins.")
      }
    } catch (error) {
      console.error("Error purchasing slot:", error)
      // Check for specific error messages
      if (error.message.includes('402') || error.message.includes('Payment Required')) {
        setPurchaseError("Insufficient coins. Please purchase more coins to continue.")
      } else {
        setPurchaseError(error.message || "Failed to purchase slot package")
      }
    } finally {
      setPurchasing(false)
    }
  }

  // Fetch teams data on mount
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        // Fetch both teams and eligibility in parallel
        const [teamsResponse, eligibilityResponse] = await Promise.all([
          getMyTeams(),
          checkEligibility()
        ])
        
        setTeamsData({
          owned: teamsResponse.owned || [],
          joined: teamsResponse.member || teamsResponse.joined || [],
          loading: false,
          error: null,
        })
        
        // Set eligibility data including teams_created_count
        setEligibility({
          can_create_team: eligibilityResponse.can_create_team ?? false,
          kyc_status: eligibilityResponse.kyc_status || null,
          max_teams_allowed: eligibilityResponse.max_teams_allowed || 0,
          teams_created_count: eligibilityResponse.teams_created_count || 0,
          denial_reason: eligibilityResponse.denial_reason || null,
          loading: false,
          // New fields from eligibility API
          available_packages: eligibilityResponse.available_packages || [],
          slot_addons_available: eligibilityResponse.slot_addons_available || false,
          purchased_slots_total: eligibilityResponse.purchased_slots_total || 0,
          purchased_slots_remaining: eligibilityResponse.purchased_slots_remaining || 0,
          plan_name: eligibilityResponse.plan_name || '',
          plan_limit: eligibilityResponse.plan_limit || 0,
        })
      } catch (error) {
        console.error("Error fetching teams:", error)
        setTeamsData({
          owned: [],
          joined: [],
          loading: false,
          error: "Failed to load teams",
        })
        setEligibility(prev => ({ ...prev, loading: false }))
      }
    }

    fetchTeamsData()
  }, [])

  const totalTeams = teamsData.owned.length + teamsData.joined.length
  const ownedCount = teamsData.owned.length
  const joinedCount = teamsData.joined.length

  // Handle create team click with eligibility check
  const handleCreateTeamClick = async (e) => {
    e.preventDefault()
    setEligibility(prev => ({ ...prev, loading: true }))

    try {
      const response = await checkEligibility()
      
      const eligibilityData = {
        can_create_team: response.can_create_team ?? false,
        kyc_status: response.kyc_status || null,
        max_teams_allowed: response.max_teams_allowed || 0,
        teams_created_count: response.teams_created_count || 0,
        denial_reason: response.denial_reason || null,
        loading: false,
        // New fields from eligibility API
        available_packages: response.available_packages || [],
        slot_addons_available: response.slot_addons_available || false,
        purchased_slots_total: response.purchased_slots_total || 0,
        purchased_slots_remaining: response.purchased_slots_remaining || 0,
        plan_name: response.plan_name || '',
        plan_limit: response.plan_limit || 0,
      }

      setEligibility(eligibilityData)

      // Check KYC status first
      if (eligibilityData.kyc_status !== "verified") {
        // KYC not verified - show KYC modal
        setShowKycModal(true)
        return
      }

      // KYC verified but can't create team - show limit modal
      if (!eligibilityData.can_create_team) {
        setShowLimitModal(true)
        return
      }

      // All good - redirect to create team page
      router.push("/teams/create-team")

    } catch (error) {
      console.error("Error checking eligibility:", error)
      // On error, still allow navigation but log the error
      router.push("/teams/create-team")
    }
  }

  // Dynamic activities from API (when available)
  const activities = [
    { icon: <Trophy size={20} />, title: "Loading recent activity...", time: "" },
  ]

  return (
    <div className={`min-h-screen px-5 py-6 transition-all ${pageBg}`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold tracking-tight">My Teams</h1>
      </div>

      {/* GRADIENT CARD */}
      <div className="rounded-[28px] p-6 mb-6 bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] shadow-xl">
        <p className="text-xs tracking-[0.2em] text-white/80">YOUR TEAMS</p>
        
        {teamsData.loading ? (
          <h2 className="text-6xl font-bold mt-2 text-white leading-none">...</h2>
        ) : (
          // Use teams_created_count from eligibility API if available, otherwise fallback to calculated total
          <h2 className="text-6xl font-bold mt-2 text-white leading-none">
            {eligibility.teams_created_count > 0 ? eligibility.teams_created_count : totalTeams}
          </h2>
        )}
        
        <p className="text-sm mt-3 text-white/90 font-medium">
          {eligibility.teams_created_count > 0 ? eligibility.teams_created_count : ownedCount} OWNED <span className="mx-2">•</span> {joinedCount} MEMBER
        </p>

        <button
          onClick={() => router.push('/teams/my-team')}
          className="mt-6 bg-[#A9198099]  hover:bg-[#e907a999] backdrop-blur-md transition px-5 py-3 rounded-xl font-medium flex items-center gap-2 text-white"
        >
          View Teams
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">

        {/* Create Team Button - with eligibility check */}
        <button
          onClick={handleCreateTeamClick}
          disabled={eligibility.loading}
          className={`block rounded-2xl p-5 border transition text-left ${actBg} disabled:opacity-50`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-3 text-white shadow-md">
            {eligibility.loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={22} />
            )}
          </div>

          <h3 className="font-semibold text-lg">Create Team</h3>
          <p className={`text-sm mt-1 ${mutedText}`}>Start New Team</p>
        </button>

        <Link
          href="/teams/join-team"
          className={`block rounded-2xl p-5 border transition ${actBg}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? "bg-[#252542] text-gray-300" : "bg-gray-100 text-gray-700"}`}>
            <UserPlus size={22} />
          </div>

          <h3 className="font-semibold text-lg">Join Team</h3>
          <p className={`text-sm mt-1 ${mutedText}`}>Find & Join Teams</p>
        </Link>
      </div>

      {/* MY TEAMS SECTION */}
      {teamsData.owned.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Teams You Own</h2>
          <div className="space-y-4 mb-8">
            {teamsData.owned.map((team) => (
              <Link
                key={team._id || team.id}
                href={`/teams/join-team/${team._id || team.id}`}
                className={`rounded-2xl p-4 flex items-center gap-4 border ${cardBg} shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-[#252542]" : "bg-gray-100"}`}>
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <Users size={22} className={mutedText} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[15px]">{team.name}</p>
                  <p className={`text-sm ${mutedText}`}>{team.category_value || team.sport}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {teamsData.joined.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Teams You're a Member Of</h2>
          <div className="space-y-4 mb-8">
            {teamsData.joined.map((team) => (
              <Link
                key={team._id || team.id}
                href={`/teams/${team._id || team.id}`}
                className={`rounded-2xl p-4 flex items-center gap-4 border ${cardBg} shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-[#252542]" : "bg-gray-100"}`}>
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <Users size={22} className={mutedText} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[15px]">{team.name}</p>
                  <p className={`text-sm ${mutedText}`}>{team.category_value || team.sport}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* RECENT ACTIVITY */}
      <h2 className="text-xl font-semibold mb-4 tracking-tight">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((act, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 flex items-center gap-4 border ${cardBg} shadow-sm`}
          >
            <div className={`opacity-80 ${mutedText}`}>
              {act.icon}
            </div>

            <div>
              <p className="font-medium text-[15px]">{act.title}</p>
              {act.time && <p className={`text-sm mt-1 ${mutedText}`}>{act.time}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* KYC MODAL */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-2xl p-6 max-w-sm w-full`}>
            <h2 className="text-xl font-bold mb-2">KYC Verification Required</h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Please complete your KYC verification to create a team.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKycModal(false)}
                className={`flex-1 px-4 py-2 rounded-full border ${isDark ? 'border-zinc-700' : 'border-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowKycModal(false)
                  router.push('/home/settings/kyc')
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
              >
                Complete KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIMIT EXCEEDED MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0  bg-black/50 flex items-center justify-center  z-50 p-4 overflow-auto">
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-2xl p-6 max-w-md w-full my-8`}>
            <h2 className="text-xl font-bold mb-2">Team Limit Reached</h2>
            <p className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              You have reached your team creation limit ({eligibility.teams_created_count}/{eligibility.max_teams_allowed}).
            </p>
            
            {/* Purchased Slots Info */}
            {eligibility.purchased_slots_total > 0 && (
              <div className={`text-sm mb-4 p-3 rounded-xl ${isDark ? 'bg-[#252542]' : 'bg-gray-100'}`}>
                <p className="font-medium">Purchased Slots: {eligibility.purchased_slots_remaining} remaining out of {eligibility.purchased_slots_total}</p>
              </div>
            )}

            {/* Available Packages */}
            {eligibility.slot_addons_available && eligibility.available_packages && eligibility.available_packages.length > 0 && (
              <div className="mb-4">
                <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Purchase Extra Team Slots
                </h3>
                <div className="space-y-2 max-h-48 px-2 overflow-y-auto">
                  {eligibility.available_packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${isDark ? 'border-[#2a2a45] bg-[#1c1c2e]' : 'border-gray-200 bg-gray-50'} ${selectedPackage?._id === pkg._id ? 'ring-2 ring-pink-500 border-pink-500' : ''} ${pkg.is_popular ? 'ring-2 ring-pink-500' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {pkg.name}
                            {pkg.badge_text && (
                              <span className="ml-2 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                                {pkg.badge_text}
                              </span>
                            )}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                            {pkg.slots_granted} slots • {pkg.slots_expiry?.type === 'NEVER' ? 'Never expires' : `Expires in ${pkg.slots_expiry?.value || 0} days`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-yellow-600 '}`}>
                            {pkg.price_coins} coins
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase Button */}
                {selectedPackage && (
                  <button
                    onClick={handlePurchaseSlot}
                    disabled={purchasing}
                    className={`w-full mt-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                      ${purchasing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:opacity-90'
                      }`}
                  >
                    {purchasing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Purchase {selectedPackage.slots_granted} Slots for {selectedPackage.price_coins} coins</>
                    )}
                  </button>
                )}

                {/* Error Message */}
                {purchaseError && (
                  <p className="text-red-500 text-sm mt-2 text-center">{purchaseError}</p>
                )}
              </div>
            )}

<div className="flex justify-center items-center"> <p className={`text-md font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}> OR </p> </div>
            <div className="flex gap-3">

              <button
                onClick={() => setShowLimitModal(false)}
                className={`flex-1 px-4 py-2 rounded-full border ${isDark ? 'border-zinc-700' : 'border-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false)
                  router.push('/home/subscription')
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
