"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTeamProfile } from "@/lib/api/teamApi"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const teamId = searchParams?.get?.("teamId") || null

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      if (teamId) {
        try {
          const team = await getTeamProfile(teamId)
          setTeamData(team)
        } catch (err) {
          console.error("Error fetching team:", err)
        }
      }
      setLoading(false)
    }

    fetchTeam()
  }, [teamId])

  // Clear session storage after successful join
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingTeamId")
      sessionStorage.removeItem("membershipIdempotencyKey")
      sessionStorage.removeItem("pendingMembershipData")
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 flex flex-col items-center justify-center">

      {/* SUCCESS ICON */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-white" />
      </div>

      {/* SUCCESS MESSAGE */}
      <h1 className="text-2xl font-bold mb-2 text-center">Welcome to the Team!</h1>
      <p className="text-zinc-400 text-center mb-8">
        You have successfully joined {teamData?.name || "the team"}
      </p>

      {/* TEAM INFO CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center overflow-hidden">
            {teamData?.logo ? (
              <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-cover" />
            ) : (
              <Trophy size={28} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{teamData?.name || "Team"}</h3>
            <p className="text-sm text-zinc-400">
              {teamData?.category_value || teamData?.sport || "Sports"} • {teamData?.visibility === "private" ? "Private" : "Public"} Team
            </p>
          </div>
        </div>
      </div>

      {/* WHAT'S NEXT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm mb-8">
        <h3 className="font-semibold mb-4">What's Next?</h3>
        <ul className="space-y-3 text-sm text-zinc-400">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            Check out upcoming events
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            Introduce yourself to the team
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            Join the team chat
          </li>
        </ul>
      </div>

      {/* GO TO TEAMS BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams"
          className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
        >
          Go to Teams
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
