"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { ArrowLeft, MapPin, Users, Share2, Menu, Trophy, Flame, TrendingUp, Star, Dumbbell, CircleDot, Swords, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { getTeamProfile, getTeamMembers, discoverTeams, searchTeamsByName } from "@/lib/api/teamApi"

const TABS = ["Overview", "Members", "Activities", "Events"]

const BADGES = [
  { icon: Trophy, label: "First WIN", sub: "Won Your First Prediction", color: "#f97316", bg: "#fff7ed" },
  { icon: Flame, label: "Streak King", sub: "7-Days Login Streak", color: "#ec4899", bg: "#fdf2f8" },
  { icon: TrendingUp, label: "Top 10", sub: "Ranked In Top 10", color: "#8b5cf6", bg: "#f5f3ff" },
  { icon: Star, label: "Super Fan", sub: "Watched 5 Live", color: "#f59e0b", bg: "#fffbeb" },
]

const ACTIVITY_TEAMS = [
  { label: "Gym", icon: Dumbbell, color: "#f97316" },
  { label: "Cricket", icon: CircleDot, color: "#ec4899" },
  { label: "Football", icon: Swords, color: "#8b5cf6" },
  { label: "Basketball", icon: ShoppingBag, color: "#f59e0b" },
  { label: "Badminton", icon: Star, color: "#10b981" },
]

const DEFAULT_STATS = [
  { label: "Members", value: 0, icon: Users },
  { label: "Events", value: 0, icon: Trophy },
  { label: "Wins", value: 0, icon: Swords },
  { label: "Badges", value: 0, icon: Star },
]

// Helper functions to convert between team name and URL slug
const toSlug = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/\s+/g, "-")
}

const fromSlug = (slug) => {
  if (!slug) return ""
  return slug.replace(/-/g, " ")
}

export default function JoinTeamPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  
  // Support both query param (?id=xxx) and slug (/teams/join-team/team-slug)
  const teamIdFromQuery = searchParams.get("id")
  const teamSlug = params?.slug
  
  // Determine the team identifier (prefer slug if available, fallback to id query param)
  const teamId = teamSlug || teamIdFromQuery
  
  const [activeTab, setActiveTab] = useState("Overview")
  const [teamData, setTeamData] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [discoverTeamsList, setDiscoverTeamsList] = useState([])

  // If no team ID, show discover teams list
  const isDiscoverMode = !teamId

  useEffect(() => {
    const fetchData = async () => {
      if (teamId) {
        // Fetch specific team - check if teamId is a slug (contains no MongoDB ObjectId pattern)
        const isSlug = !/^[0-9a-fA-F]{24}$/.test(teamId)
        
        try {
          let teamData
          let membersArray
          
          if (isSlug) {
            // teamId is a slug - search by name to get the team
            const searchResults = await searchTeamsByName(fromSlug(teamId))
            const matchedTeam = searchResults.find(t => toSlug(t.name) === teamId)
            
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
            membersArray = Array.isArray(members) 
              ? members 
              : members?.data || members?.members || []
            teamData = team?.data || team
          } else {
            // teamId is an ObjectId - use directly
            const [team, members] = await Promise.all([
              getTeamProfile(teamId),
              getTeamMembers(teamId)
            ])
            membersArray = Array.isArray(members) 
              ? members 
              : members?.data || members?.members || []
            teamData = team?.data || team
          }
          
          setTeamData(teamData)
          setTeamMembers(membersArray)
        } catch (err) {
          console.error("Error fetching team:", err)
          setError("Failed to load team details")
        }
      } else {
        // Fetch discover teams
        try {
          const teams = await discoverTeams({ limit: 20 })
          // Handle both direct array and { data: [...] } response formats
          const teamsArray = Array.isArray(teams) 
            ? teams 
            : teams?.data || []
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

  // Handle both direct array and { data: [...] } response formats for teamData
  const normalizedTeamData = teamData?.data || teamData
  const stats = normalizedTeamData ? [
    { label: "Members", value: normalizedTeamData.members_count || teamMembers.length || 0, icon: Users },
    { label: "Events", value: normalizedTeamData.events_count || 0, icon: Trophy },
    { label: "Wins", value: normalizedTeamData.wins_count || 0, icon: Swords },
    { label: "Badges", value: normalizedTeamData.badges_count || 0, icon: Star },
  ] : DEFAULT_STATS

  const members = (Array.isArray(teamMembers) ? teamMembers : []).slice(0, 9).map(m => m.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB")

  const upcomingEvents = normalizedTeamData?.upcoming_events || []
  const recentActivity = (Array.isArray(normalizedTeamData?.recent_activity) ? normalizedTeamData.recent_activity : ["No recent activity"])

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

  if (error && !teamData) {
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

  // Discover mode - show list of teams
  if (isDiscoverMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/teams" className="text-gray-900">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-xl font-semibold">Discover Teams</h1>
          </div>

          {discoverTeamsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No teams found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {discoverTeamsList.map((team) => (
                <Link
                  key={team._id || team.id}
                  href={`/teams/join-team/${team._id || team.id}`}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      team.name?.charAt(0)?.toUpperCase() || "T"
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.category_value || team.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{team.members_count || 0} members</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .jt-root {
          min-height: 100vh;
          background: #f8f9fc;
          font-family: 'DM Sans', 'Nunito', sans-serif;
          padding-bottom: 100px;
        }

        /* ── COVER ── */
        .jt-cover {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .jt-cover-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%);
        }
        .jt-cover-arch1 {
          position: absolute;
          bottom: -40px; left: 50%;
          transform: translateX(-50%);
          width: 130%; height: 100px;
          border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.07);
        }
        .jt-cover-arch2 {
          position: absolute;
          bottom: -60px; left: 50%;
          transform: translateX(-50%);
          width: 110%; height: 90px;
          border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.05);
        }
        .jt-cover-header {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 48px 16px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .jt-icon-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          text-decoration: none;
        }

        /* ── MAIN CONTENT LAYOUT ── */
        .jt-layout {
          padding: 0 16px;
          margin-top: -40px;
          position: relative;
          z-index: 10;
        }

        .jt-left-col { display: flex; flex-direction: column; gap: 16px; }
        .jt-right-col { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }

        /* ── PROFILE CARD ── */
        .jt-profile-card {
          background: #fff;
          border-radius: 24px;
          padding: 0 16px 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .jt-avatar-row {
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .jt-avatar-wrap { position: relative; margin-top: -28px; }
        .jt-avatar-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f97316);
          padding: 3px;
          box-shadow: 0 4px 16px rgba(236,72,153,0.3);
        }
        .jt-avatar-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffecd2, #fcb69f);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; border: 2px solid #fff;
          font-size: 28px;
        }
        .jt-avatar-badge {
          position: absolute; bottom: 0; right: 0;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f97316);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: #fff; font-weight: 700;
          border: 2px solid #fff;
        }
        .jt-sport-badge {
          margin-top: -8px;
          padding: 4px 14px;
          border-radius: 20px;
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
        }
        .jt-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 16px;
          padding: 12px 0;
          border-top: 1px solid #f3f4f6;
        }
        .jt-stat-item { text-align: center; }
        .jt-stat-val { font-size: 18px; font-weight: 800; color: #111827; margin: 0; }
        .jt-stat-lbl { font-size: 10px; color: #9ca3af; margin: 0; margin-top: 1px; }

        /* ── SECTION TITLE ── */
        .jt-section-title {
          font-size: 14px; font-weight: 700; color: #111827;
          margin: 0 0 12px 0;
        }

        /* ── BADGES ── */
        .jt-badges-scroll {
          display: flex; gap: 10px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .jt-badges-scroll::-webkit-scrollbar { display: none; }
        .jt-badge-card {
          min-width: 110px;
          background: #fff; border-radius: 16px;
          padding: 14px 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #f3f4f6;
          flex-shrink: 0;
        }
        .jt-badge-icon-wrap {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }

        /* ── ACTIVITY TEAMS ── */
        .jt-teams-scroll {
          display: flex; gap: 12px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .jt-teams-scroll::-webkit-scrollbar { display: none; }
        .jt-team-item {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          cursor: pointer; flex-shrink: 0;
        }
        .jt-team-icon-wrap {
          width: 60px; height: 60px; border-radius: 18px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border: 1px solid #f3f4f6;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── TABS ── */
        .jt-tabs-wrap {
          background: #fff; border-radius: 40px;
          padding: 4px; display: flex; gap: 4px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .jt-tab-btn {
          flex: 1; padding: 8px 0; border-radius: 36px;
          border: none; cursor: pointer;
          font-size: 12px; font-weight: 700;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .jt-tab-btn.active {
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: #fff;
          box-shadow: 0 4px 12px rgba(236,72,153,0.3);
        }
        .jt-tab-btn.inactive { background: transparent; color: #9ca3af; }

        /* ── GENERIC CARD ── */
        .jt-card {
          background: #fff; border-radius: 16px;
          padding: 14px 16px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ── EVENT CARD ── */
        .jt-event-card {
          background: #fff; border-radius: 16px;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 14px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ── MEMBERS GRID ── */
        .jt-members-flex { display: flex; flex-wrap: wrap; gap: 10px; }

        /* ── JOIN BUTTON ── */
        .jt-join-fixed {
          position: fixed; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 100%; max-width: 430px;
          padding: 12px 16px 24px;
          background: linear-gradient(to top, #f8f9fc 70%, transparent);
          z-index: 100;
        }
        .jt-join-static { display: none; }
        .jt-join-btn {
          width: 100%; padding: 16px 0; border-radius: 40px;
          border: none;
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: #fff; font-size: 15px; font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(236,72,153,0.35);
          letter-spacing: 0.3px; transition: opacity 0.2s;
          font-family: inherit;
          display: block; text-decoration: none;
          text-align: center; line-height: 1;
        }
        .jt-join-btn:hover { opacity: 0.9; }

        @media (min-width: 640px) {
          .jt-layout { padding: 0 24px; }
          .jt-cover { height: 240px; }
          .jt-cover-header { padding: 56px 24px 0; }
          .jt-avatar-ring { width: 80px; height: 80px; }
          .jt-avatar-inner { font-size: 32px; }
          .jt-avatar-wrap { margin-top: -32px; }
          .jt-stat-val { font-size: 20px; }
          .jt-stat-lbl { font-size: 11px; }
          .jt-badge-card { min-width: 130px; padding: 16px 14px; }
          .jt-team-icon-wrap { width: 68px; height: 68px; }
          .jt-tab-btn { font-size: 13px; padding: 10px 0; }
          .jt-join-fixed { max-width: 640px; }
        }

        @media (min-width: 1024px) {
          .jt-root { padding-bottom: 0; }
          .jt-cover { height: 280px; }
          .jt-cover-header {
            padding: 56px 40px 0;
            max-width: 1200px;
            margin: 0 auto;
          }

          .jt-layout {
            max-width: 1200px;
            margin: -60px auto 0;
            padding: 0 40px 60px;
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 28px;
            align-items: start;
          }

          .jt-left-col {
            grid-column: 1;
            position: sticky;
            top: 24px;
            gap: 20px;
          }

          .jt-right-col {
            grid-column: 2;
            margin-top: 0;
            gap: 18px;
          }

          .jt-avatar-ring { width: 88px; height: 88px; }
          .jt-avatar-inner { font-size: 36px; }
          .jt-avatar-wrap { margin-top: -36px; }
          .jt-avatar-badge { width: 24px; height: 24px; font-size: 10px; }

          .jt-badges-scroll {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            overflow-x: unset;
            gap: 10px;
          }
          .jt-badge-card { min-width: unset; }

          .jt-teams-scroll {
            flex-wrap: wrap;
            overflow-x: unset;
            gap: 14px;
          }

          .jt-tab-btn { font-size: 13px; padding: 10px 4px; }

          .jt-events-desktop-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .jt-join-fixed { display: none !important; }
          .jt-join-static { display: block; margin-top: 4px; }
          .jt-join-btn { font-size: 16px; padding: 18px 0; }
        }

        @media (min-width: 1280px) {
          .jt-layout {
            grid-template-columns: 400px 1fr;
            padding: 0 60px 60px;
          }
          .jt-cover-header { padding: 64px 60px 0; }
        }
      `}</style>

      <div className="jt-root">

        {/* ── COVER ── */}
        <div className="jt-cover">
          <div className="jt-cover-bg" />
          <div className="jt-cover-arch1" />
          <div className="jt-cover-arch2" />
          <div className="jt-cover-header">
            <Link href="/teams" className="jt-icon-btn" style={{ textDecoration: "none" }}>
              <ArrowLeft size={18} color="#fff" />
            </Link>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="jt-icon-btn">
                <Share2 size={18} color="#fff" />
              </div>
              <div className="jt-icon-btn">
                <Menu size={18} color="#fff" />
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="jt-layout">

          {/* ════ LEFT COLUMN ════ */}
          <div className="jt-left-col">

            {/* PROFILE CARD */}
            <div className="jt-profile-card">
              <div className="jt-avatar-row">
                <div className="jt-avatar-wrap">
                  <div className="jt-avatar-ring">
                    <div className="jt-avatar-inner">
                      {teamData?.logo ? (
                        <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-cover" />
                      ) : (
                        teamData?.name?.charAt(0)?.toUpperCase() || "T"
                      )}
                    </div>
                  </div>
                  {teamData?.level && (
                    <div className="jt-avatar-badge">🔥{teamData.level}</div>
                  )}
                </div>
                <span className="jt-sport-badge">
                  {teamData?.category_value || teamData?.sport || "Sports"}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.3 }}>
                  {teamData?.name || "Team Name"}
                </h2>
                {teamData?.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <MapPin size={12} color="#ec4899" />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {typeof teamData.location === 'string' 
                        ? teamData.location 
                        : `${teamData.location.city || ''}${teamData.location.area ? `, ${teamData.location.area}` : ''}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="jt-stats-grid">
                {stats.map(({ label, value }) => (
                  <div key={label} className="jt-stat-item">
                    <p className="jt-stat-val">{value}</p>
                    <p className="jt-stat-lbl">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BADGES */}
            {teamData?.badges?.length > 0 && (
              <div>
                <h3 className="jt-section-title">Badges</h3>
                <div className="jt-badges-scroll">
                  {teamData.badges.map(({ icon: Icon, label, sub, color, bg }) => (
                    <div key={label} className="jt-badge-card">
                      <div className="jt-badge-icon-wrap" style={{ background: bg }}>
                        <Icon size={20} color={color} />
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0", lineHeight: 1.3 }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVITY TEAMS */}
            {teamData?.related_teams?.length > 0 && (
              <div>
                <h3 className="jt-section-title">Related Teams</h3>
                <div className="jt-teams-scroll">
                  {teamData.related_teams.map(({ label, icon: Icon, color }) => (
                    <div key={label} className="jt-team-item">
                      <div className="jt-team-icon-wrap">
                        <Icon size={24} color={color} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          {/* END LEFT COLUMN */}

          {/* ════ RIGHT COLUMN ════ */}
          <div className="jt-right-col">

            {/* TABS */}
            <div className="jt-tabs-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`jt-tab-btn ${activeTab === tab ? "active" : "inactive"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === "Overview" && (
              <>
                <div>
                  <h3 className="jt-section-title">About</h3>
                  <div className="jt-card">
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                      {teamData?.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="jt-section-title">Members</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex" }}>
                      {members.slice(0, 4).map((initials, i) => (
                        <div key={i} style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: `linear-gradient(135deg, hsl(${i * 40 + 10},80%,60%), hsl(${i * 40 + 50},80%,55%))`,
                          border: "2.5px solid #f8f9fc",
                          marginLeft: i > 0 ? -10 : 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}>{initials}</div>
                      ))}
                    </div>
                    {teamMembers.length > 4 && (
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: "#f3f4f6", border: "2.5px solid #f8f9fc", marginLeft: -10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "#374151",
                      }}>{teamMembers.length - 4}</div>
                    )}
                  </div>
                </div>

                <div className="jt-card">
                  {recentActivity.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "5px 0",
                      borderBottom: i < recentActivity.length - 1 ? "1px solid #f9fafb" : "none",
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="jt-section-title">Upcoming Events</h3>
                    <div className="jt-events-desktop-grid" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {upcomingEvents.map((event, i) => (
                        <div key={i} className="jt-event-card">
                          <div style={{
                            minWidth: 46, height: 52, borderRadius: 12,
                            background: `linear-gradient(135deg, #ec489922, #f9731644)`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#ec4899", textTransform: "uppercase" }}>
                              {new Date(event.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: "#ec4899", lineHeight: 1.1 }}>
                              {new Date(event.date).getDate()}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{event.title}</p>
                            {event.venue && (
                              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
                                <MapPin size={10} color="#9ca3af" />{event.venue}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── MEMBERS TAB ── */}
            {activeTab === "Members" && (
              <div className="jt-card">
                <h3 className="jt-section-title">Team Members ({teamMembers.length})</h3>
                <div className="jt-members-flex">
                  {teamMembers.map((member, i) => (
                    <div key={member._id || member.id || i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: "50%",
                        background: `linear-gradient(135deg, hsl(${i * 40 + 10},80%,60%), hsl(${i * 40 + 50},80%,55%))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#fff",
                      }}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB"
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>{member.name?.split(" ")[0] || "Member"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTIVITIES TAB ── */}
            {activeTab === "Activities" && (
              <div className="jt-card">
                <h3 className="jt-section-title">Recent Activities</h3>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: i < recentActivity.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "linear-gradient(135deg, #ec489922, #f9731622)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trophy size={16} color="#ec4899" />
                    </div>
                    <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── EVENTS TAB ── */}
            {activeTab === "Events" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 16, padding: 14,
                    display: "flex", alignItems: "center", gap: 14,
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{
                      minWidth: 52, height: 60, borderRadius: 14,
                      background: `linear-gradient(135deg, #ec4899, #f97316bb)`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{event.title}</p>
                      {event.venue && (
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} color="#9ca3af" />{event.venue}
                        </p>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="jt-card text-center py-8">
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            )}

            {/* JOIN BUTTON — static, desktop only */}
            <div className="jt-join-static">
              <Link 
                href={`/teams/join-team/onboarding?teamId=${teamId}`} 
                className="jt-join-btn"
              >
                Join Team
              </Link>
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
        {/* END LAYOUT */}

        {/* JOIN BUTTON — fixed, mobile only */}
        <div className="jt-join-fixed">
          <Link 
            href={`/teams/join-team/onboarding?teamId=${teamId}`} 
            className="jt-join-btn"
          >
            Join Team
          </Link>
        </div>

      </div>
    </>
  )
}
