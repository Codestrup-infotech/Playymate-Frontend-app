"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { ArrowLeft, MapPin, Users, Share2, Menu, Trophy, Flame, TrendingUp, Star, Dumbbell, CircleDot, Swords, ShoppingBag, Search, ChevronRight, Compass } from "lucide-react"
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

// Gradient pairs matching the payment page pink→purple→orange palette
const TEAM_GRADIENTS = [
  ["#f472b6", "#a855f7"],
  ["#fb923c", "#f472b6"],
  ["#a855f7", "#6366f1"],
  ["#f472b6", "#fb923c"],
  ["#6366f1", "#a855f7"],
  ["#fb923c", "#facc15"],
]

function JoinTeamContent() {
  const searchParams = useSearchParams()
  const params = useParams()

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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "4px solid #f472b6", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#9ca3af", fontWeight: 500 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error && !teamData) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>
          <Link href="/teams" style={{ color: "#f472b6", fontWeight: 600 }}>Back to Teams</Link>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // ENHANCED DISCOVER MODE
  // ─────────────────────────────────────────────
  if (isDiscoverMode) {
    return (
      <>
        <style>{`
          @keyframes dt-spin { to { transform: rotate(360deg); } }

          @keyframes dt-fadein {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes dt-blob {
            0%, 100% { transform: scale(1); opacity: 0.18; }
            50%       { transform: scale(1.14) translate(6px, -6px); opacity: 0.26; }
          }
          @keyframes dt-card-in {
            from { opacity: 0; transform: translateY(22px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes dt-shine {
            0%   { left: -80%; }
            100% { left: 130%; }
          }

          .dt-root {
            min-height: 100vh;
            background: #ffffff;
            font-family: 'DM Sans', 'Nunito', sans-serif;
            position: relative;
            overflow-x: hidden;
            padding-bottom: 48px;
          }

          /* Ambient background blobs */
          .dt-blob-1, .dt-blob-2, .dt-blob-3 {
            position: fixed; border-radius: 50%;
            filter: blur(80px); pointer-events: none; z-index: 0;
            animation: dt-blob 7s ease-in-out infinite;
          }
          .dt-blob-1 {
            width: 300px; height: 300px; top: -90px; left: -70px;
            background: radial-gradient(circle, #f472b6cc, #a855f744);
            animation-delay: 0s;
          }
          .dt-blob-2 {
            width: 240px; height: 240px; top: -50px; right: -50px;
            background: radial-gradient(circle, #fb923caa, #facc1555);
            animation-delay: 2.5s;
          }
          .dt-blob-3 {
            width: 220px; height: 180px; bottom: 60px; left: 50%;
            transform: translateX(-50%);
            background: radial-gradient(ellipse, #a855f766, #f472b655);
            animation-delay: 5s;
          }

          /* Header */
          .dt-header {
            position: relative; z-index: 10;
            padding: 54px 20px 0;
            animation: dt-fadein 0.45s ease both;
          }
          .dt-back-btn {
            width: 40px; height: 40px; border-radius: 14px;
            background: #f9fafb; border: 1.5px solid #f3f4f6;
            display: inline-flex; align-items: center; justify-content: center;
            text-decoration: none; margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: background 0.2s;
          }
          .dt-back-btn:hover { background: #f3f4f6; }

          .dt-title-row {
            display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
          }
          .dt-compass {
            width: 38px; height: 38px; border-radius: 13px;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #f472b6, #a855f7, #fb923c);
            box-shadow: 0 4px 16px rgba(244,114,182,0.4);
            flex-shrink: 0;
          }
          .dt-heading {
            font-size: 28px; font-weight: 900; letter-spacing: -0.6px; margin: 0; color: #111827;
          }
          .dt-heading-accent {
            background: linear-gradient(90deg, #f472b6, #a855f7, #fb923c);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .dt-subheading {
            font-size: 13px; color: #9ca3af; font-weight: 500;
            margin: 0; padding-left: 2px;
          }

          /* Search */
          .dt-search-wrap {
            position: relative; z-index: 10;
            padding: 18px 20px 0;
            animation: dt-fadein 0.45s 0.08s ease both;
          }
          .dt-search-inner {
            display: flex; align-items: center; gap: 10px;
            background: #f9fafb; border: 1.5px solid #f3f4f6;
            border-radius: 18px; padding: 12px 16px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .dt-search-inner:focus-within {
            border-color: #f472b6;
            box-shadow: 0 0 0 3px rgba(244,114,182,0.13);
          }
          .dt-search-input {
            flex: 1; border: none; background: transparent;
            font-size: 14px; font-weight: 500; color: #111827;
            outline: none; font-family: inherit;
          }
          .dt-search-input::placeholder { color: #d1d5db; }

          /* Count pill */
          .dt-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: linear-gradient(135deg, #fdf2f8, #faf5ff);
            border: 1px solid #f9a8d4; border-radius: 20px;
            padding: 5px 13px; margin: 16px 0 0 20px;
            font-size: 12px; font-weight: 700; color: #a855f7;
            animation: dt-fadein 0.45s 0.14s ease both;
          }
          .dt-pill-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: linear-gradient(135deg, #f472b6, #fb923c);
          }

          /* Cards grid */
          .dt-grid {
            padding: 14px 20px 40px;
            display: flex; flex-direction: column; gap: 12px;
            position: relative; z-index: 10;
          }

          /* Team card */
          .dt-card {
            background: #fff; border-radius: 22px;
            padding: 14px; display: flex; align-items: center; gap: 14px;
            border: 1.5px solid #f3f4f6;
            box-shadow: 0 3px 16px rgba(0,0,0,0.06);
            text-decoration: none;
            transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s;
            animation: dt-card-in 0.4s ease both;
            position: relative; overflow: hidden;
          }
          .dt-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(244,114,182,0.16);
            border-color: #f9a8d4;
          }
          .dt-card:active { transform: scale(0.98); }

          /* Shine sweep on hover */
          .dt-card::after {
            content: "";
            position: absolute; top: 0; left: -80%;
            width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
            transform: skewX(-18deg);
            transition: none;
          }
          .dt-card:hover::after {
            animation: dt-shine 0.55s ease forwards;
          }

          .dt-avatar {
            width: 58px; height: 58px; border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 800; color: #fff;
            flex-shrink: 0; overflow: hidden;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
          }
          .dt-card-name {
            font-size: 15px; font-weight: 800; color: #111827; margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .dt-card-sport {
            font-size: 12px; color: #9ca3af; font-weight: 500;
            margin: 3px 0 0; display: flex; align-items: center; gap: 5px;
          }
          .dt-sport-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: linear-gradient(135deg, #f472b6, #fb923c);
            flex-shrink: 0;
          }
          .dt-card-right {
            display: flex; flex-direction: column;
            align-items: flex-end; gap: 7px; flex-shrink: 0;
          }
          .dt-members-chip {
            display: flex; align-items: center; gap: 4px;
            background: #f9fafb; border: 1px solid #f3f4f6;
            border-radius: 10px; padding: 4px 9px;
            font-size: 11px; font-weight: 700; color: #374151;
          }
          .dt-arrow {
            width: 28px; height: 28px; border-radius: 9px;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #f472b6, #a855f7);
            box-shadow: 0 3px 10px rgba(244,114,182,0.4);
          }

          /* Empty state */
          .dt-empty {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 64px 20px; gap: 12px;
            animation: dt-fadein 0.4s ease both;
            position: relative; z-index: 10;
          }
          .dt-empty-icon {
            width: 72px; height: 72px; border-radius: 24px;
            background: linear-gradient(135deg, #fdf2f8, #faf5ff);
            border: 1.5px solid #f9a8d4;
            display: flex; align-items: center; justify-content: center;
          }

          @media (min-width: 640px) {
            .dt-header { padding: 56px 28px 0; }
            .dt-search-wrap { padding: 18px 28px 0; }
            .dt-pill { margin-left: 28px; }
            .dt-grid { padding: 14px 28px 40px; gap: 14px; }
          }
          @media (min-width: 768px) {
            .dt-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 14px;
            }
          }
          @media (min-width: 1024px) {
            .dt-root { max-width: 1100px; margin: 0 auto; }
            .dt-header { padding: 60px 40px 0; }
            .dt-search-wrap { padding: 18px 40px 0; }
            .dt-pill { margin-left: 40px; }
            .dt-grid {
              padding: 14px 40px 60px;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
            }
          }
        `}</style>

        <div className="dt-root">
          {/* Blobs */}
          <div className="dt-blob-1" />
          <div className="dt-blob-2" />
          <div className="dt-blob-3" />

          {/* Header */}
          <div className="dt-header">
            <Link href="/teams" className="dt-back-btn">
              <ArrowLeft size={18} color="#374151" />
            </Link>
            <div className="dt-title-row">
              <div className="dt-compass">
                <Compass size={19} color="#fff" />
              </div>
              <h1 className="dt-heading">
                Discover{" "}
                <span className="dt-heading-accent">Teams</span>
              </h1>
            </div>
            <p className="dt-subheading">Find your squad and join the action</p>
          </div>

          {/* Search */}
          <div className="dt-search-wrap">
            <div className="dt-search-inner">
              <Search size={17} color="#d1d5db" />
              <input
                className="dt-search-input"
                placeholder="Search teams or sports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Count pill */}
          {filteredTeams.length > 0 && (
            <div className="dt-pill">
              <span className="dt-pill-dot" />
              {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""} found
            </div>
          )}

          {/* Cards */}
          {filteredTeams.length === 0 ? (
            <div className="dt-empty">
              <div className="dt-empty-icon">
                <Users size={32} color="#f472b6" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No teams found</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, textAlign: "center" }}>
                {searchQuery ? `No results for "${searchQuery}"` : "Check back later for new teams"}
              </p>
            </div>
          ) : (
            <div className="dt-grid">
              {filteredTeams.map((team, i) => {
                const [g1, g2] = TEAM_GRADIENTS[i % TEAM_GRADIENTS.length]
                return (
                  <Link
                    key={team._id || team.id}
                    href={`/teams/join-team/${team._id || team.id}`}
                    className="dt-card"
                    style={{ animationDelay: `${i * 0.055}s` }}
                  >
                    <div
                      className="dt-avatar"
                      style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                    >
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        team.name?.charAt(0)?.toUpperCase() || "T"
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="dt-card-name">{team.name}</p>
                      <p className="dt-card-sport">
                        <span className="dt-sport-dot" />
                        {team.category_value || team.sport || "Sports"}
                      </p>
                    </div>

                    <div className="dt-card-right">
                      <div className="dt-members-chip">
                        <Users size={11} color="#9ca3af" />
                        {team.members_count || 0}
                      </div>
                      <div className="dt-arrow">
                        <ChevronRight size={14} color="#fff" strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </>
    )
  }

  // ─────────────────────────────────────────────
  // TEAM DETAIL (unchanged)
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .jt-root {
          min-height: 100vh; background: #f8f9fc;
          font-family: 'DM Sans', 'Nunito', sans-serif; padding-bottom: 100px;
        }
        .jt-cover { position: relative; height: 200px; overflow: hidden; }
        .jt-cover-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%);
        }
        .jt-cover-arch1 {
          position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
          width: 130%; height: 100px; border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.07);
        }
        .jt-cover-arch2 {
          position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%);
          width: 110%; height: 90px; border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.05);
        }
        .jt-cover-header {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 48px 16px 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .jt-icon-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; text-decoration: none;
        }
        .jt-layout { padding: 0 16px; margin-top: -40px; position: relative; z-index: 10; }
        .jt-left-col { display: flex; flex-direction: column; gap: 16px; }
        .jt-right-col { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
        .jt-profile-card { background: #fff; border-radius: 24px; padding: 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .jt-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; }
        .jt-avatar-wrap { position: relative; margin-top: -28px; }
        .jt-avatar-ring { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #ec4899, #f97316); padding: 3px; box-shadow: 0 4px 16px rgba(236,72,153,0.3); }
        .jt-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #ffecd2, #fcb69f); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #fff; font-size: 28px; }
        .jt-avatar-badge { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #ec4899, #f97316); display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: 700; border: 2px solid #fff; }
        .jt-sport-badge { margin-top: -8px; padding: 4px 14px; border-radius: 20px; background: linear-gradient(135deg, #ec4899, #f97316); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
        .jt-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 16px; padding: 12px 0; border-top: 1px solid #f3f4f6; }
        .jt-stat-item { text-align: center; }
        .jt-stat-val { font-size: 18px; font-weight: 800; color: #111827; margin: 0; }
        .jt-stat-lbl { font-size: 10px; color: #9ca3af; margin: 0; margin-top: 1px; }
        .jt-section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
        .jt-badges-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .jt-badges-scroll::-webkit-scrollbar { display: none; }
        .jt-badge-card { min-width: 110px; background: #fff; border-radius: 16px; padding: 14px 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f3f4f6; flex-shrink: 0; }
        .jt-badge-icon-wrap { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
        .jt-teams-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .jt-teams-scroll::-webkit-scrollbar { display: none; }
        .jt-team-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0; }
        .jt-team-icon-wrap { width: 60px; height: 60px; border-radius: 18px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.07); border: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: center; }
        .jt-tabs-wrap { background: #fff; border-radius: 40px; padding: 4px; display: flex; gap: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .jt-tab-btn { flex: 1; padding: 8px 0; border-radius: 36px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s ease; font-family: inherit; }
        .jt-tab-btn.active { background: linear-gradient(135deg, #ec4899, #f97316); color: #fff; box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
        .jt-tab-btn.inactive { background: transparent; color: #9ca3af; }
        .jt-card { background: #fff; border-radius: 16px; padding: 14px 16px; border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .jt-event-card { background: #fff; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 14px; border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .jt-members-flex { display: flex; flex-wrap: wrap; gap: 10px; }
        .jt-join-fixed { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; padding: 12px 16px 24px; background: linear-gradient(to top, #f8f9fc 70%, transparent); z-index: 100; }
        .jt-join-static { display: none; }
        .jt-join-btn { width: 100%; padding: 16px 0; border-radius: 40px; border: none; background: linear-gradient(135deg, #ec4899, #f97316); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 24px rgba(236,72,153,0.35); letter-spacing: 0.3px; transition: opacity 0.2s; font-family: inherit; display: block; text-decoration: none; text-align: center; line-height: 1; }
        .jt-join-btn:hover { opacity: 0.9; }
        @media (min-width: 640px) {
          .jt-layout { padding: 0 24px; } .jt-cover { height: 240px; } .jt-cover-header { padding: 56px 24px 0; }
          .jt-avatar-ring { width: 80px; height: 80px; } .jt-avatar-inner { font-size: 32px; } .jt-avatar-wrap { margin-top: -32px; }
          .jt-stat-val { font-size: 20px; } .jt-stat-lbl { font-size: 11px; }
          .jt-badge-card { min-width: 130px; padding: 16px 14px; } .jt-team-icon-wrap { width: 68px; height: 68px; }
          .jt-tab-btn { font-size: 13px; padding: 10px 0; } .jt-join-fixed { max-width: 640px; }
        }
        @media (min-width: 1024px) {
          .jt-root { padding-bottom: 0; } .jt-cover { height: 280px; }
          .jt-cover-header { padding: 56px 40px 0; max-width: 1200px; margin: 0 auto; }
          .jt-layout { max-width: 1200px; margin: -60px auto 0; padding: 0 40px 60px; display: grid; grid-template-columns: 360px 1fr; gap: 28px; align-items: start; }
          .jt-left-col { grid-column: 1; position: sticky; top: 24px; gap: 20px; }
          .jt-right-col { grid-column: 2; margin-top: 0; gap: 18px; }
          .jt-avatar-ring { width: 88px; height: 88px; } .jt-avatar-inner { font-size: 36px; } .jt-avatar-wrap { margin-top: -36px; }
          .jt-avatar-badge { width: 24px; height: 24px; font-size: 10px; }
          .jt-badges-scroll { display: grid; grid-template-columns: repeat(2, 1fr); overflow-x: unset; gap: 10px; }
          .jt-badge-card { min-width: unset; }
          .jt-teams-scroll { flex-wrap: wrap; overflow-x: unset; gap: 14px; }
          .jt-tab-btn { font-size: 13px; padding: 10px 4px; }
          .jt-events-desktop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .jt-join-fixed { display: none !important; } .jt-join-static { display: block; margin-top: 4px; }
          .jt-join-btn { font-size: 16px; padding: 18px 0; }
        }
        @media (min-width: 1280px) {
          .jt-layout { grid-template-columns: 400px 1fr; padding: 0 60px 60px; }
          .jt-cover-header { padding: 64px 60px 0; }
        }
      `}</style>

      <div className="jt-root">
        <div className="jt-cover">
          <div className="jt-cover-bg" />
          <div className="jt-cover-arch1" />
          <div className="jt-cover-arch2" />
          <div className="jt-cover-header">
            <Link href="/teams" className="jt-icon-btn" style={{ textDecoration: "none" }}>
              <ArrowLeft size={18} color="#fff" />
            </Link>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="jt-icon-btn"><Share2 size={18} color="#fff" /></div>
              <div className="jt-icon-btn"><Menu size={18} color="#fff" /></div>
            </div>
          </div>
        </div>

        <div className="jt-layout">
          <div className="jt-left-col">
            <div className="jt-profile-card">
              <div className="jt-avatar-row">
                <div className="jt-avatar-wrap">
                  <div className="jt-avatar-ring">
                    <div className="jt-avatar-inner">
                      {teamData?.logo
                        ? <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-cover" />
                        : teamData?.name?.charAt(0)?.toUpperCase() || "T"
                      }
                    </div>
                  </div>
                  {teamData?.level && <div className="jt-avatar-badge">🔥{teamData.level}</div>}
                </div>
                <span className="jt-sport-badge">{teamData?.category_value || teamData?.sport || "Sports"}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.3 }}>
                  {teamData?.name || "Team Name"}
                </h2>
                {teamData?.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <MapPin size={12} color="#ec4899" />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {typeof teamData.location === "string"
                        ? teamData.location
                        : `${teamData.location.city || ""}${teamData.location.area ? `, ${teamData.location.area}` : ""}`}
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

            {teamData?.related_teams?.length > 0 && (
              <div>
                <h3 className="jt-section-title">Related Teams</h3>
                <div className="jt-teams-scroll">
                  {teamData.related_teams.map(({ label, icon: Icon, color }) => (
                    <div key={label} className="jt-team-item">
                      <div className="jt-team-icon-wrap"><Icon size={24} color={color} /></div>
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="jt-right-col">
            <div className="jt-tabs-wrap">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`jt-tab-btn ${activeTab === tab ? "active" : "inactive"}`}>{tab}</button>
              ))}
            </div>

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
                        <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${i*40+10},80%,60%), hsl(${i*40+50},80%,55%))`, border: "2.5px solid #f8f9fc", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>{initials}</div>
                      ))}
                    </div>
                    {teamMembers.length > 4 && (
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f3f4f6", border: "2.5px solid #f8f9fc", marginLeft: -10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#374151" }}>{teamMembers.length - 4}</div>
                    )}
                  </div>
                </div>
                <div className="jt-card">
                  {recentActivity.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f9fafb" : "none" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #f97316)", flexShrink: 0 }} />
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
                          <div style={{ minWidth: 46, height: 52, borderRadius: 12, background: "linear-gradient(135deg, #ec489922, #f9731644)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#ec4899", textTransform: "uppercase" }}>{new Date(event.date).toLocaleString("default", { month: "short" })}</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: "#ec4899", lineHeight: 1.1 }}>{new Date(event.date).getDate()}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{event.title}</p>
                            {event.venue && <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} color="#9ca3af" />{event.venue}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "Members" && (
              <div className="jt-card">
                <h3 className="jt-section-title">Team Members ({teamMembers.length})</h3>
                <div className="jt-members-flex">
                  {teamMembers.map((member, i) => (
                    <div key={member._id || member.id || i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${i*40+10},80%,60%), hsl(${i*40+50},80%,55%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" /> : member.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MB"}
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>{member.name?.split(" ")[0] || "Member"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Activities" && (
              <div className="jt-card">
                <h3 className="jt-section-title">Recent Activities</h3>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #ec489922, #f9731622)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trophy size={16} color="#ec4899" />
                    </div>
                    <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Events" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 14, border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ minWidth: 52, height: 60, borderRadius: 14, background: "linear-gradient(135deg, #ec4899, #f97316bb)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{new Date(event.date).toLocaleString("default", { month: "short" })}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{new Date(event.date).getDate()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{event.title}</p>
                      {event.venue && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color="#9ca3af" />{event.venue}</p>}
                    </div>
                  </div>
                )) : (
                  <div className="jt-card" style={{ textAlign: "center", padding: "32px 16px" }}>
                    <p style={{ color: "#9ca3af" }}>No upcoming events</p>
                  </div>
                )}
              </div>
            )}

            <div className="jt-join-static">
              <Link href={`/teams/join-team/onboarding?teamId=${teamId}`} className="jt-join-btn">Join Team</Link>
            </div>
          </div>
        </div>

        <div className="jt-join-fixed">
          <Link href={`/teams/join-team/onboarding?teamId=${teamId}`} className="jt-join-btn">Join Team</Link>
        </div>
      </div>
    </>
  )
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid #f472b6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9ca3af", fontWeight: 500 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <JoinTeamContent />
    </Suspense>
  )
}
