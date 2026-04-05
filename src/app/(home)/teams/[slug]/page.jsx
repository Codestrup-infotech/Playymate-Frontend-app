"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, Trophy, Calendar, ArrowLeft, Crown, MapPin,
  Shield, Star, CheckCircle, Clock, UserPlus, MoreHorizontal,
  DollarSign, Activity, Zap, Award, TrendingUp,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { getTeamProfile, getTeamMembers } from "@/lib/api/teamApi";
import TeamChat from "@/app/(home)/home/components/TeamChat";

function EmptyState({ icon: Icon, label, color, t }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: `${color}1a`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px",
      }}>
        <Icon size={26} style={{ color }} />
      </div>
      <p style={{ fontSize: 14, color: t.textSub, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function TeamProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const teamId = params.slug;

  const t = {
    bg:          isDark ? "#09091a" : "#f2f4fb",
    card:        isDark ? "#11112a" : "#ffffff",
    cardBorder:  isDark ? "#1c1c38" : "#e4e8f2",
    surface:     isDark ? "#18183a" : "#eef0f8",
    surfaceHvr:  isDark ? "#1e1e42" : "#e4e8f4",
    accent:      "#f43f8a",
    orange:      "#f97316",
    text:        isDark ? "#f0f0fa" : "#0d0f1c",
    textSub:     isDark ? "#6060a0" : "#8492b4",
    textMuted:   isDark ? "#38385a" : "#c0cade",
    green:       "#22c55e",
    purple:      "#a855f7",
    blue:        "#3b82f6",
    yellow:      "#eab308",
    red:         "#ef4444",
    gradBtn:     "linear-gradient(135deg,#f43f8a 0%,#f97316 100%)",
    shadow:      isDark ? "0 6px 32px rgba(0,0,0,0.55)" : "0 4px 24px rgba(0,0,0,0.07)",
  };

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => {
    if (!teamId) return;
    console.log("Fetching team with ID:", teamId);
    (async () => {
      try {
        setLoading(true);
        const teamRes = await getTeamProfile(teamId);
        setTeam(teamRes.data || teamRes);

        try {
          const memRes = await getTeamMembers(teamId);
          const memData = memRes.data || memRes;
          setMembers(Array.isArray(memData) ? memData : []);
        } catch {}

        setError(null);
      } catch {
        setError("Failed to load team details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  const fmt$ = (n) => { if (!n) return "₹0"; const v = Number(n); return v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v.toLocaleString("en-IN")}`; };
  const fmtD = (d) => { if (!d) return ""; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };
  const init = (n) => { if (!n) return "?"; return n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0,2); };
  const roleC = (r) => ({ owner: { bg:"rgba(234,179,8,.15)",   cl: t.yellow  },
                       co_captain: { bg:"rgba(168,85,247,.15)",cl: t.purple  },
                       coach:  { bg:"rgba(59,130,246,.15)",   cl: t.blue    },
                       manager:{ bg:"rgba(34,197,94,.15)",    cl: t.green   } }[r] || { bg: t.surface, cl: t.textSub });

  if (loading) return (
    <div style={{ minHeight:"100vh", background: t.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${t.accent}`, borderTopColor:"transparent", animation:"spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background: t.bg, color: t.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ color: t.red, marginBottom:16 }}>{error}</div>
      <button onClick={() => router.back()} style={{ padding:"10px 24px", background: t.gradBtn, color:"#fff", borderRadius:50, border:"none", cursor:"pointer", fontWeight:700 }}>Go Back</button>
    </div>
  );

  if (!team) return (
    <div style={{ minHeight:"100vh", background: t.bg, color: t.textSub, display:"flex", alignItems:"center", justifyContent:"center" }}>
      Team not found
    </div>
  );

  const tabs = [
    { key:"members",  label:"Members",  count: members.length },
    { key:"roles",    label:"Roles"    },
    { key:"activity", label:"Activity" },
  ];

  return (
    <div style={{ minHeight:"100vh", marginBottom:"30px" , background: t.bg, color: t.text, fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .no-scr{overflow-x:auto;scrollbar-width:none}
        .no-scr::-webkit-scrollbar{display:none}
        .hvr-card:hover{background:${t.surfaceHvr} !important;transition:background .15s}
        .tab-pill{transition:all .2s ease}
        @media(min-width:640px){
          .wrap{max-width:640px;margin:0 auto}
        }
      `}</style>

      <div className="wrap" style={{ padding:"1px" }}>

        {/* Top Nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => router.push("/teams")} style={{
              width:38, height:38, borderRadius:12,
              background: t.surface, border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color: t.text,
            }}><ArrowLeft size={18}/></button>
            <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.4px" }}>Team Profile</span>
          </div>
          <button style={{
            width:38, height:38, borderRadius:12,
            background: t.surface, border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", color: t.text,
          }}><MoreHorizontal size={18}/></button>
        </div>

        {/* Banner + Team Card */}
        <div style={{
          borderRadius: 24,
          overflow: "hidden",
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.shadow,
          marginBottom: 24,
        }}>
          {(team.banner_url || team.banner) && (
            <div style={{
              width: "100%",
              height: 190,
              background: isDark ? "#1c1c3a" : "#eef0f8",
            }}>
              <img
                src={team.banner_url || team.banner}
                alt="Team Banner"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              {/* Logo */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 18,
                flexShrink: 0,
                background: isDark ? "#1c1c3a" : "#eef0f8",
                border: `2px solid ${t.cardBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                {team.logo_url || team.logo ? (
                  <img src={team.logo_url || team.logo} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>{init(team.name)}</span>
                )}
              </div>

              {/* Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</span>
                  {team.is_verified && <CheckCircle size={16} style={{ color: t.blue }} />}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                  {(team.category_value || team.sport) && (
                    <span style={{ background: "rgba(244,63,138,.15)", color: t.accent, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 50 }}>
                      {team.category_value || team.sport}
                    </span>
                  )}
                  <span style={{ background: t.surface, color: t.textSub, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 50 }}>
                    {team.visibility === "private" ? "Private" : "Public"}
                  </span>
                  {team.skill_level && (
                    <span style={{ background: "rgba(34,197,94,.15)", color: t.green, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 50, textTransform: "capitalize" }}>
                      {team.skill_level.replace("_", " ")}
                    </span>
                  )}
                </div>

                {team.location?.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: t.textSub }}>
                    <MapPin size={12} />
                    {team.location.area && `${team.location.area}, `}
                    {team.location.city}
                  </div>
                )}
              </div>
            </div>

            {team.description && (
              <p style={{ marginTop: 14, fontSize: 13, color: t.textSub, lineHeight: 1.6 }}>{team.description}</p>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 22 }}>
              {[
                { icon: Users, label: "Members", value: team.member_count || members.length || 0, c: t.blue },
                { icon: Calendar, label: "Events", value: team.events_count || 0, c: t.purple },
                { icon: Trophy, label: "Win Rate", value: team.win_rate || "0%", c: t.yellow },
                { icon: DollarSign, label: "Revenue", value: fmt$(team.total_revenue), c: t.green },
              ].map(({ icon: I, label, value, c }) => (
                <div key={label} style={{ background: t.surface, borderRadius: 18, padding: "18px 14px", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${c}1a`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <I size={24} style={{ color: c }} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 22 }}>{value}</p>
                  <p style={{ fontSize: 14, color: t.textSub }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Membership Info */}
        {team.viewer_membership && (
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: t.textSub, marginBottom: 8, fontWeight: 600 }}>Your Membership</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.purple}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={20} style={{ color: t.purple }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize" }}>{team.viewer_membership.role || "member"}</p>
                  <p style={{ fontSize: 12, color: t.textSub }}>{team.viewer_membership.membership_type || "FREE"}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: t.textSub }}>Joined</p>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{fmtD(team.viewer_membership.joined_at)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Owner Info */}
        {team.owner_user_id && (
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: t.textSub, marginBottom: 8, fontWeight: 600 }}>Team Owner</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: isDark ? "#1c1c3a" : "#eef0f8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {team.owner_user_id.profile_image_url ? (
                  <img src={team.owner_user_id.profile_image_url} alt={team.owner_user_id.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Crown size={22} style={{ color: t.yellow }} />
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{team.owner_user_id.full_name}</p>
                <p style={{ fontSize: 12, color: t.textSub }}>@{team.owner_user_id.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="no-scr" style={{ display:"flex", gap:8, marginBottom:18, paddingBottom:2 }}>
          {tabs.map(({ key, label, count }) => {
            const on = activeTab === key;
            return (
              <button key={key} className="tab-pill" onClick={() => setActiveTab(key)} style={{
                padding:"8px 16px", borderRadius:50, border:"none", cursor:"pointer",
                whiteSpace:"nowrap", fontSize:13, fontWeight:700,
                background: on ? t.gradBtn : t.surface,
                color: on ? "#fff" : t.textSub,
                display:"flex", alignItems:"center", gap:6,
              }}>
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize:10, fontWeight:700,
                    background: on ? "rgba(255,255,255,.25)" : isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
                    color: on ? "#fff" : t.textSub,
                    padding:"1px 7px", borderRadius:50,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {members.length === 0
              ? <EmptyState icon={Users} label="No members yet" color={t.blue} t={t}/>
              : members.map(m => {
                  const rc = roleC(m.role);
                  return (
                    <div key={m._id||m.id} className="hvr-card" style={{
                      background: t.card, border:`1px solid ${t.cardBorder}`,
                      borderRadius:16, padding:"12px 14px",
                      display:"flex", alignItems:"center", gap:12,
                    }}>
                      <div style={{
                        width:46, height:46, borderRadius:14, flexShrink:0,
                        background: isDark ? "#1c1c3a" : "#eef0f8",
                        border:`1.5px solid ${t.cardBorder}`,
                        display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
                      }}>
                        {m.user?.profile_image_url || m.avatar
                          ? <img src={m.user?.profile_image_url || m.avatar} alt={m.user?.full_name || m.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          : <span style={{ fontWeight:800, fontSize:14, color: t.accent }}>{init(m.user?.full_name || m.name || m.user_name)}</span>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {m.user?.full_name || m.name || m.user_name || "Team Member"}
                          </span>
                          {m.role === "owner" && <Crown size={13} style={{ color: t.yellow, flexShrink:0 }}/>}
                        </div>
                        <span style={{ fontSize:12, color: t.textSub, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          @{m.user?.username || m.username || "member"}
                        </span>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:50, background: rc.bg, color: rc.cl, textTransform:"capitalize", whiteSpace:"nowrap" }}>
                        {(m.role||"member").replace("_"," ")}
                      </span>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { role:"owner",      label:"Owner",      desc:"Full access",               icon:Crown,     c: t.yellow },
              { role:"co_captain", label:"Co-Captain", desc:"Manage members & events",   icon:Star,      c: t.purple },
              { role:"coach",      label:"Coach",      desc:"Create & manage events",    icon:Award,     c: t.blue   },
              { role:"manager",    label:"Manager",    desc:"Handle payments",           icon:TrendingUp,c: t.green  },
              { role:"member",     label:"Member",     desc:"Basic team access",         icon:Users,     c: t.textSub},
            ].map(({ role, label, desc, icon:I, c }) => {
              const cnt = members.filter(m => (m.role||"member") === role).length;
              return (
                <div key={role} style={{ background: t.card, border:`1px solid ${t.cardBorder}`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${c}1a`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <I size={18} style={{ color:c }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>{label}</span>
                    <p style={{ fontSize:12, color: t.textSub, marginTop:2 }}>{desc}</p>
                  </div>
                  <span style={{ fontSize:13, fontWeight:800, color:c, background:`${c}18`, padding:"4px 12px", borderRadius:50 }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          !team.recent_activities?.length
            ? <EmptyState icon={Activity} label="No recent activity" color={t.accent} t={t}/>
            : <div style={{ background: t.card, border:`1px solid ${t.cardBorder}`, borderRadius:20, padding:"4px 18px" }}>
                {team.recent_activities.map((a, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"14px 0", borderBottom: i < team.recent_activities.length-1 ? `1px solid ${t.cardBorder}` : "none" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(244,63,138,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      <Activity size={14} style={{ color: t.accent }}/>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500, lineHeight:1.5 }}>{a.text}</p>
                      <p style={{ fontSize:11, color: t.textSub, marginTop:3 }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
        )}

      </div>

      <TeamChat teamId={teamId} />
    </div>
  );
}
