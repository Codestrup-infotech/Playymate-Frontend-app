"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/ThemeContext"
import { ArrowLeft, MapPin, Users, Share2, Menu, Trophy, Star, Swords, Search, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getTeamProfile, getTeamMembers, discoverTeams, searchTeamsByName } from "@/lib/api/teamApi"

const TABS = ["Overview", "Members", "Activities", "Events"]

const DEFAULT_STATS = [
  { label: "Members", value: 0, icon: Users },
  { label: "Events", value: 0, icon: Trophy },
  { label: "Wins", value: 0, icon: Swords },
  { label: "Badges", value: 0, icon: Star },
]

const toSlug = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/\s+/g, "-")
}

const fromSlug = (slug) => {
  if (!slug) return ""
  return slug.replace(/-/g, " ")
}

function JoinTeamContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const pageBg = isDark ? "bg-black" : "bg-gray-50"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const cardBg = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-100"
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500"

  const teamIdFromQuery = searchParams.get("id")
  const teamSlug = params?.slug
  const teamId = teamSlug || teamIdFromQuery

  const [activeTab, setActiveTab] = useState("Overview")
  const [teamData, setTeamData] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [discoverTeamsList, setDiscoverTeamsList] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const isDiscoverMode = !teamId

  useEffect(() => {
    const fetchData = async () => {
      if (teamId) {
        const isSlug = !/^[0-9a-fA-F]{24}$/.test(teamId)
        try {
          let teamData
          let membersArray
          if (isSlug) {
            const searchResults = await searchTeamsByName(fromSlug(teamId))
            const matchedTeam = searchResults.find(t => toSlug(t.name) === teamId)
            if (!matchedTeam) {
              setError("Team not found")
              setLoading(false)
              return
            }
            const actualTeamId = matchedTeam._id || matchedTeam.id
            const [team, members] = await Promise.all([
              getTeamProfile(actualTeamId),
              getTeamMembers(actualTeamId)
            ])
            membersArray = Array.isArray(members) ? members : members?.data || members?.members || []
            teamData = team?.data || team
          } else {
            const [team, members] = await Promise.all([
              getTeamProfile(teamId),
              getTeamMembers(teamId)
            ])
            membersArray = Array.isArray(members) ? members : members?.data || members?.members || []
            teamData = team?.data || team
          }
          setTeamData(teamData)
          setTeamMembers(membersArray)
        } catch (err) {
          console.error("Error fetching team:", err)
          setError("Failed to load team details")
        }
      } else {
        try {
          const teams = await discoverTeams({ limit: 20 })
          const teamsArray = Array.isArray(teams) ? teams : teams?.data || []
          setDiscoverTeamsList(teamsArray)
        } catch (err) {
          console.error("Error fetching teams:", err)
          setError("Failed to load teams")
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [teamId])

  const normalizedTeamData = teamData?.data || teamData
  const stats = normalizedTeamData ? [
    { label: "Members", value: normalizedTeamData.members_count || teamMembers.length || 0, icon: Users },
    { label: "Events", value: normalizedTeamData.events_count || 0, icon: Trophy },
    { label: "Wins", value: normalizedTeamData.wins_count || 0, icon: Swords },
    { label: "Badges", value: normalizedTeamData.badges_count || 0, icon: Star },
  ] : DEFAULT_STATS

  const members = (Array.isArray(teamMembers) ? teamMembers : []).slice(0, 9).map(m =>
    m.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB"
  )

  const upcomingEvents = normalizedTeamData?.upcoming_events || []
  const recentActivity = Array.isArray(normalizedTeamData?.recent_activity)
    ? normalizedTeamData.recent_activity
    : ["No recent activity"]

  const filteredTeams = discoverTeamsList.filter(team =>
    team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.category_value || team.sport || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${mutedText} font-medium`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !teamData) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/teams" className="text-pink-500 font-semibold">Back to Teams</Link>
        </div>
      </div>
    )
  }

  if (isDiscoverMode) {
    return (
      <motion.div
        className={`min-h-screen ${pageBg} px-5 py-6 pb-10 font-Poppins`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
          <Link href="/teams" className={`p-2 hover:bg-gray-200 rounded-full transition-colors ${isDark ? "hover:bg-gray-800" : ""}`}>
            <ArrowLeft size={22} />
          </Link>
          <h1 className={`text-xl tracking-tight ${textColor}`}>Discover Teams</h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className={`flex items-center gap-3 ${cardBg} border ${borderColor} rounded-xl p-3 shadow-sm`}>
            <Search size={18} className={mutedText} />
            <input
              type="text"
              placeholder="Search teams or sports..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm ${textColor} placeholder-gray-400`}
            />
          </div>
        </motion.div>

        {filteredTeams.length > 0 && (
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-4 py-2 text-sm font-semibold text-pink-600">
              <span className="w-2 h-2 bg-pink-500 rounded-full" />
              {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""} found
            </span>
          </motion.div>
        )}

        {filteredTeams.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-center">
              <Users size={32} className="text-pink-500" />
            </div>
            <p className={`text-base font-bold ${textColor}`}>No teams found</p>
            <p className={`text-sm ${mutedText} text-center`}>
              {searchQuery ? `No results for "${searchQuery}"` : "Check back later for new teams"}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredTeams.map((team, i) => (
              <motion.div
                key={team._id || team.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`${cardBg} border ${borderColor} rounded-3xl p-4 shadow-sm`}
              >
                <Link href={`/teams/join-team/${team._id || team.id}`} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-xl font-black text-white shadow-lg">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      team.name?.charAt(0)?.toUpperCase() || "T"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${textColor} truncate`}>{team.name}</p>
                    <p className={`text-xs ${mutedText} flex items-center gap-1 mt-1`}>
                      <span className="w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full" />
                      {team.category_value || team.sport || "Sports"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">
                      {team.members_count || 0}
                    </span>
                    <div className="w-7 h-7 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`min-h-screen ${pageBg} font-Poppins pb-24`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link href="/teams" className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <div className="flex gap-2">
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <Share2 size={18} className="text-white" />
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <Menu size={18} className="text-white" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="px-4 -mt-10 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`${cardBg} border ${borderColor} rounded-3xl p-5 shadow-sm`}
            >
              <div className="flex items-end justify-between">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 p-0.5">
                    <div className={`w-full h-full rounded-2xl ${cardBg} flex items-center justify-center overflow-hidden`}>
                      {teamData?.logo ? (
                        <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black">{teamData?.name?.charAt(0)?.toUpperCase() || "T"}</span>
                      )}
                    </div>
                  </div>
                  {teamData?.level && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {teamData.level}
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold">
                  {teamData?.category_value || teamData?.sport || "Sports"}
                </span>
              </div>
              <div className="mt-4">
                <h2 className={`text-xl font-bold ${textColor}`}>{teamData?.name || "Team Name"}</h2>
                {teamData?.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-pink-500" />
                    <span className={`text-xs ${mutedText}`}>
                      {typeof teamData.location === "string"
                        ? teamData.location
                        : `${teamData.location.city || ""}${teamData.location.area ? `, ${teamData.location.area}` : ""}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
                {stats.map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className={`text-lg font-bold ${textColor}`}>{value}</p>
                    <p className={`text-xs ${mutedText}`}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {teamData?.badges?.length > 0 && (
              <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-3xl p-5 shadow-sm`}>
                <h3 className={`text-sm font-bold ${textColor} mb-3`}>Badges</h3>
                <div className="grid grid-cols-2 gap-3">
                  {teamData.badges.map(({ icon: Icon, label, sub, color, bg }, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${textColor}`}>{label}</p>
                        <p className={`text-[10px] ${mutedText}`}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {teamData?.related_teams?.length > 0 && (
              <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-3xl p-5 shadow-sm`}>
                <h3 className={`text-sm font-bold ${textColor} mb-3`}>Related Teams</h3>
                <div className="flex gap-3 overflow-x-auto">
                  {teamData.related_teams.map(({ label, icon: Icon, color }, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-2 min-w-fit">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Icon size={20} style={{ color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-full p-1 flex gap-1 shadow-sm`}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-0 rounded-full text-xs font-bold transition-all ${activeTab === tab ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md" : "text-gray-500"}`}
                >
                  {tab}
                </button>
              ))}
            </motion.div>

            {activeTab === "Overview" && (
              <>
                <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-4 shadow-sm`}>
                  <h3 className={`text-sm font-bold ${textColor} mb-2`}>About</h3>
                  <p className={`text-xs leading-relaxed ${mutedText}`}>
                    {teamData?.description || "No description available"}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-4 shadow-sm`}>
                  <h3 className={`text-sm font-bold ${textColor} mb-3`}>Members</h3>
                  <div className="flex items-center">
                    <div className="flex">
                      {members.slice(0, 4).map((initials, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full border-2 border-white -ml-2 first:ml-0 flex items-center justify-center text-xs font-bold text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 40 + 10}, 80%, 60%), hsl(${i * 40 + 50}, 80%, 55%))` }}
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    {teamMembers.length > 4 && (
                      <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white -ml-2 flex items-center justify-center text-xs font-bold text-gray-600">
                        {teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-4 shadow-sm`}>
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />
                      <span className={`text-xs ${mutedText}`}>{item}</span>
                    </div>
                  ))}
                </motion.div>

                {upcomingEvents.length > 0 && (
                  <motion.div variants={itemVariants} className="flex flex-col gap-3">
                    <h3 className={`text-sm font-bold ${textColor}`}>Upcoming Events</h3>
                    {upcomingEvents.map((event, i) => (
                      <div key={i} className={`${cardBg} border ${borderColor} rounded-2xl p-3 flex items-center gap-3 shadow-sm`}>
                        <div className="w-12 h-14 rounded-xl bg-gradient-to-br from-pink-500/10 to-orange-400/10 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-pink-500 uppercase">
                            {new Date(event.date).toLocaleString("default", { month: "short" })}
                          </span>
                          <span className="text-lg font-black text-pink-500 leading-none">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${textColor} truncate`}>{event.title}</p>
                          {event.venue && (
                            <p className={`text-[10px] ${mutedText} flex items-center gap-1`}>
                              <MapPin size={10} />{event.venue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {activeTab === "Members" && (
              <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-4 shadow-sm`}>
                <h3 className={`text-sm font-bold ${textColor} mb-3`}>Team Members ({teamMembers.length})</h3>
                <div className="grid grid-cols-4 gap-3">
                  {teamMembers.map((member, i) => (
                    <div key={member._id || member.id || i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg, hsl(${i * 40 + 10}, 80%, 60%), hsl(${i * 40 + 50}, 80%, 55%))` }}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB"
                        )}
                      </div>
                      <span className={`text-[10px] ${mutedText} truncate w-full text-center`}>{member.name?.split(" ")[0] || "Member"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Activities" && (
              <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-4 shadow-sm`}>
                <h3 className={`text-sm font-bold ${textColor} mb-3`}>Recent Activities</h3>
                {recentActivity.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0`}>
                    <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center">
                      <Trophy size={14} className="text-pink-500" />
                    </div>
                    <span className={`text-xs ${mutedText}`}>{item}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "Events" && (
              <div className="flex flex-col gap-3">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className={`${cardBg} border ${borderColor} rounded-2xl p-3 flex items-center gap-3 shadow-sm`}
                  >
                    <div className="w-12 h-14 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase">
                        {new Date(event.date).toLocaleString("default", { month: "short" })}
                      </span>
                      <span className="text-lg font-black text-white leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${textColor}`}>{event.title}</p>
                      {event.venue && (
                        <p className={`text-xs ${mutedText} flex items-center gap-1 mt-1`}>
                          <MapPin size={10} />{event.venue}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <motion.div variants={itemVariants} className={`${cardBg} border ${borderColor} rounded-2xl p-8 text-center shadow-sm`}>
                    <p className={mutedText}>No upcoming events</p>
                  </motion.div>
                )}
              </div>
            )}

            <motion.div variants={itemVariants} className="hidden lg:block">
              <Link
                href={`/teams/join-team/onboarding?teamId=${teamId}`}
                className="block w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-bold text-white text-center shadow-lg"
              >
                Join Team
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent lg:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
      >
        <Link
          href={`/teams/join-team/onboarding?teamId=${teamId}`}
          className="block w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-base font-bold text-white text-center shadow-xl"
        >
          Join Team
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <JoinTeamContent />
    </Suspense>
  )
}
