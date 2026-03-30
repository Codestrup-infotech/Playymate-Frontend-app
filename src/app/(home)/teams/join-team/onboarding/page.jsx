"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getTeamProfile, previewMembership } from "@/lib/api/teamApi"

export default function JoinPaymentPage() {
  const searchParams = useSearchParams()
  const teamId = searchParams.get("teamId")

  const [teamData, setTeamData] = useState(null)
  const [membershipData, setMembershipData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load team details")
      }
      setLoading(false)
    }

    fetchData()
  }, [teamId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/teams" className="text-pink-500 hover:underline">
            Back to Teams
          </Link>
        </div>
      </div>
    )
  }

  // Store teamId in session for payment page
  if (typeof window !== "undefined" && teamId) {
    sessionStorage.setItem("pendingTeamId", teamId)
  }

  const membershipOptions = membershipData?.options || []
  const walletBalances = membershipData?.wallet_balances || {}

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* COVER */}
      <div className="relative h-52 w-full bg-[url('/stadium.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>

        {/* HEADER */}
        <div className="absolute top-4 left-4 z-10">
          <Link href={`/teams/join-team?id=${teamId}`} className="text-white">
            <ArrowLeft size={22} />
          </Link>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="-mt-16 px-4">
        <div className="bg-white rounded-[28px] shadow-xl border border-gray-200 p-6">

          {/* PROFILE */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md -mt-12 overflow-hidden">
              {teamData?.logo ? (
                <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-2xl font-bold text-white">
                  {teamData?.name?.charAt(0)?.toUpperCase() || "T"}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mt-3">{teamData?.name || "Team Name"}</h2>
          </div>

          {/* INFO CARD */}
          <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 divide-y">
            <div className="flex justify-between px-4 py-4">
              <span className="text-gray-500">Sport</span>
              <span className="font-medium">{teamData?.category_value || teamData?.sport || "N/A"}</span>
            </div>
            {teamData?.membership?.is_paid && (
              <>
                <div className="flex justify-between px-4 py-4">
                  <span className="text-gray-500">Join Fee</span>
                  <span className="font-medium">₹{teamData.membership.fee_amount || 0}</span>
                </div>
                {teamData.membership.default_duration_type && (
                  <div className="flex justify-between px-4 py-4">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{teamData.membership.default_duration_type}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* MEMBERSHIP OPTIONS */}
          {membershipOptions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-gray-500 font-medium mb-3">Select Membership Duration</h3>
              <div className="space-y-2">
                {membershipOptions.map((option) => (
                  <div 
                    key={option.type}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{option.type}</p>
                      {option.duration_label && (
                        <p className="text-xs text-gray-500">{option.duration_label}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-pink-500">₹{option.price || 0}</p>
                      {option.discount && (
                        <p className="text-xs text-green-500">Save {option.discount}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WALLET BALANCES */}
          {(walletBalances.gold_coins > 0 || walletBalances.diamonds > 0) && (
            <div className="mt-6">
              <h3 className="text-gray-500 font-medium mb-3">Your Balance</h3>
              <div className="flex gap-4">
                {walletBalances.gold_coins > 0 && (
                  <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-yellow-600 font-semibold">{walletBalances.gold_coins}</p>
                    <p className="text-xs text-gray-500">Gold Coins</p>
                  </div>
                )}
                {walletBalances.diamonds > 0 && (
                  <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-blue-600 font-semibold">{walletBalances.diamonds}</p>
                    <p className="text-xs text-gray-500">Diamonds</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WHAT YOU GET */}
          <div className="mt-6">
            <h3 className="text-gray-500 font-medium mb-3">What You Get</h3>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y">
              {[
                "Team Chat Access",
                "Exclusive Events",
                "Member Discounts",
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-4">
                  <span className="font-medium">{item}</span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href={`/teams/join-team/payment?teamId=${teamId}`}
          className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
        >
          Continue {teamData?.membership?.is_paid ? `- ₹${teamData.membership.fee_amount || 0}` : "- Join Free"}
        </Link>
      </div>
    </div>
  )
}