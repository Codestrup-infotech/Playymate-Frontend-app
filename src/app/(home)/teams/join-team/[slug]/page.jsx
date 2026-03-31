"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getTeamProfile, getTeamMembers, searchTeamsByName } from "@/lib/api/teamApi"
import Link from "next/link"
import { Users, Trophy, Star, Swords, ArrowLeft, MapPin, Share2 } from "lucide-react"

// Helper functions to convert between team name and URL slug
const toSlug = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/\s+/g, "-")
}

const fromSlug = (slug) => {
  if (!slug) return ""
  return slug.replace(/-/g, " ")
}

const DEFAULT_STATS = [
  { label: "Members", value: 0, icon: Users },
  { label: "Events", value: 0, icon: Trophy },
  { label: "Wins", value: 0, icon: Swords },
  { label: "Badges", value: 0, icon: Star },
]

export default function JoinTeamBySlugPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug
  
  const [activeTab, setActiveTab] = useState("Overview")
  const [teamData, setTeamData] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (slug) {
        try {
          // Search teams by name to find the team with matching slug
          const searchResults = await searchTeamsByName(fromSlug(slug))
          const matchedTeam = searchResults.find(t => toSlug(t.name) === slug)
          
          if (!matchedTeam) {
            setError("Team not found")
            setLoading(false)
            return
          }
          
          // Get the actual team ID
          const actualTeamId = matchedTeam._id || matchedTeam.id
          const [team, members] = await Promise.all([
            getTeamProfile(actualTeamId),
            getTeamMembers(actualTeamId)
          ])
          
          const membersArray = Array.isArray(members) 
            ? members 
            : members?.data || members?.members || []
          const teamResult = team?.data || team
          
          setTeamData(teamResult)
          setTeamMembers(membersArray)
        } catch (err) {
          console.error("Error fetching team:", err)
          setError("Failed to load team details")
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [slug])

  // Handle both direct array and { data: [...] } response formats for teamData
  const normalizedTeamData = teamData?.data || teamData
  const stats = normalizedTeamData ? [
    { label: "Members", value: normalizedTeamData.members_count || teamMembers.length || 0, icon: Users },
    { label: "Events", value: normalizedTeamData.events_count || 0, icon: Trophy },
    { label: "Wins", value: normalizedTeamData.wins_count || 0, icon: Swords },
    { label: "Badges", value: normalizedTeamData.badges_count || 0, icon: Star },
  ] : DEFAULT_STATS

  const upcomingEvents = normalizedTeamData?.upcoming_events || []
  const recentActivity = normalizedTeamData?.recent_activity || ["No recent activity"]

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
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/teams" className="text-pink-500 mt-4 inline-block">Go to Teams</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/teams" className="flex items-center gap-2 text-white">
            <ArrowLeft size={24} />
            <span>Back to Teams</span>
          </Link>
          <button className="p-2">
            <Share2 size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-3xl font-bold">
            {normalizedTeamData?.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{normalizedTeamData?.name || "Team"}</h1>
            {normalizedTeamData?.category_value && (
              <p className="text-white/80">{normalizedTeamData.category_value}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="flex justify-around bg-white rounded-xl p-4 shadow-sm">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-5 h-5 mx-auto text-pink-500 mb-1" />
              <p className="font-bold text-lg">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {normalizedTeamData?.description && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-700">{normalizedTeamData.description}</p>
          </div>
        </div>
      )}

      {/* Location */}
      {normalizedTeamData?.location && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-500" />
            <span>
              {typeof normalizedTeamData.location === 'string' 
                ? normalizedTeamData.location 
                : normalizedTeamData.location.city || normalizedTeamData.location.area || ''}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <div className="flex border-b border-gray-200">
          {["Overview", "Members", "Activities", "Events"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === tab ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-500"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "Overview" && (
          <div className="space-y-4">
            {/* Members */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Members ({teamMembers.length})</h3>
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 9).map((m, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                    {m.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB"}
                  </div>
                ))}
                {teamMembers.length > 9 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                    +{teamMembers.length - 9}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Recent Activities</h3>
              {recentActivity.map((item, i) => (
                <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Upcoming Events</h3>
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                    <p className="font-medium">{event.title || event.name}</p>
                    <p className="text-sm text-gray-500">{event.date || event.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Button */}
      <div className=" bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-xl font-medium">
          Join Team
        </button>
      </div>
    </div>
  )
}

