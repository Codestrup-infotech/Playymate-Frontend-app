"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, Trophy, Calendar, UserPlus, ArrowLeft,
  Shield, CheckCircle, Clock, X, Crown, DollarSign,
  Settings, Copy, Check, MapPin, Zap, CreditCard,
  Activity, MoreHorizontal, Star, Award, TrendingUp,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import {
  getTeamProfile, getTeamMembers, getPendingMembers,
  getTeamPayments, getPaymentSummary, createInvite,
  removeMember, updateMemberRole, acceptInvite, declineInvite,
  getTeamInvites,
} from "@/lib/api/teamApi";
import InvitePlayers from "@/app/(home)/home/components/InvitePlayers";

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function Modal({ title, onClose, children, t, isDark }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }}>
      <div style={{
        background: isDark ? "#14142a" : "#ffffff",
        borderRadius: 24, padding: 24,
        maxWidth: 360, width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{title}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: "none",
            background: t.surface, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: t.textSub,
          }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const teamId = params.teamId;

  // ── Theme tokens ──
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

  // ── State ──
  const [team,           setTeam]           = useState(null);
  const [members,        setMembers]        = useState([]);
  const [pending,        setPending]        = useState([]);
  const [invites,        setInvites]        = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeTab,      setActiveTab]      = useState("members");
  const [userRole,       setUserRole]       = useState("owner");
  const [inviteLink,     setInviteLink]     = useState("");
  const [showInvite,     setShowInvite]     = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [removeTarget,   setRemoveTarget]   = useState(null);
  const [removing,       setRemoving]       = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ── Fetch ──
  useEffect(() => {
    if (!teamId) return;
    (async () => {
      try {
        setLoading(true);
        const teamRes = await getTeamProfile(teamId);
        const teamData = teamRes.data || teamRes;
        setTeam(teamData);
        
        if (teamData.members && Array.isArray(teamData.members)) {
          setMembers(teamData.members);
        } else {
          const memRes = await getTeamMembers(teamId);
          const memData = memRes.data || memRes;
          setMembers(Array.isArray(memData) ? memData : []);
        }

        try {
          const pendRes = await getPendingMembers(teamId);
          const pendData = pendRes.data || pendRes;
          setPending(Array.isArray(pendData) ? pendData : []);
        } catch {}

        try {
          const invRes = await getTeamInvites(teamId);
          const invData = invRes.data || invRes;
          setInvites(Array.isArray(invData) ? invData : []);
        } catch {}

        try {
          const payRes  = await getTeamPayments(teamId);
          const payData = payRes.data || payRes;
          setPayments(Array.isArray(payData) ? payData : []);
          const sumRes  = await getPaymentSummary(teamId, "30");
          setPaymentSummary(sumRes.data || sumRes);
        } catch {}

        setError(null);
      } catch {
        setError("Failed to load team details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  // ── Helpers ──
  const fmt$  = (n) => { if (!n) return "₹0"; const v = Number(n); return v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v.toLocaleString("en-IN")}`; };
  const fmtD  = (d) => { if (!d) return ""; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };
  const init  = (n) => { if (!n) return "?"; return n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0,2); };
  const canMg = userRole === "owner" || userRole === "co_captain";
  const roleC = (r) => ({ owner: { bg:"rgba(234,179,8,.15)",   cl: t.yellow  },
                           co_captain: { bg:"rgba(168,85,247,.15)",cl: t.purple  },
                           coach:  { bg:"rgba(59,130,246,.15)", cl: t.blue    },
                           manager:{ bg:"rgba(34,197,94,.15)",  cl: t.green   } }[r] || { bg: t.surface, cl: t.textSub });

  // ── Actions ──
  const doInvite = () => {
    setShowInviteModal(true);
  };

  const copyLink = () => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const doRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeMember(teamId, removeTarget._id || removeTarget.id);
      setMembers(p => p.filter(m => (m._id||m.id) !== (removeTarget._id||removeTarget.id)));
      setRemoveTarget(null);
    } catch { alert("Failed to remove member"); }
    finally { setRemoving(false); }
  };

  const doAccept  = async (id) => { try { await acceptInvite(teamId, id);  setPending(p => p.filter(m => (m._id||m.id) !== id)); } catch {} };
  const doDecline = async (id) => { 
    try { 
      await revokeInvite(teamId, id); 
      setInvites(p => p.filter(inv => (inv._id||inv.id||inv.invite_id) !== id)); 
    } catch {} 
  };

  // ── Loading / Error ──
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

  // ── Tabs config ──
  const tabs = [
    { key:"members",  label:"Members",  count: members.length },
    { key:"invites",  label:"Invites",  count: pending.length },
    { key:"request",  label:"Request"  },
    { key:"roles",    label:"Roles"    },
    { key:"payments", label:"Payments" },
    { key:"activity", label:"Activity" },
  ];

  // ── Quick Actions ──
  const actions = [
    { icon: Zap,      label: "Host Event", color: t.accent,  fn: () => {} },
    { icon: UserPlus, label: "Invite",     color: t.purple,  fn: doInvite },
    { icon: Users,    label: "Members",    color: t.blue,    fn: () => setActiveTab("members") },
    { icon: CreditCard,label:"Payments",  color: t.green,   fn: () => setActiveTab("payments") },
  ];

  return (
    <div style={{ minHeight:"100vh", background: t.bg, color: t.text, fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .no-scr{overflow-x:auto;scrollbar-width:none}
        .no-scr::-webkit-scrollbar{display:none}
        .hvr-card:hover{background:${t.surfaceHvr} !important;transition:background .15s}
        .hvr-act:hover{transform:translateY(-2px);transition:transform .15s}
        .tab-pill{transition:all .2s ease}
        @media(min-width:640px){
          .wrap{max-width:640px;margin:0 auto}
        }
        @media(min-width:1024px){
          .wrap{max-width:1000px}
          .stats4{grid-template-columns:repeat(4,1fr)!important}
          .act4{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>

      <div className="wrap" style={{ padding:"20px " }}>

        {/* ── Top Nav ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => router.push("/teams/my-team")} style={{
              width:38, height:38, borderRadius:12,
              background: t.surface, border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color: t.text,
            }}><ArrowLeft size={18}/></button>
            <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.4px" }}>Team Details</span>
          </div>
          <button style={{
            width:38, height:38, borderRadius:12,
            background: t.surface, border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", color: t.text,
          }}><MoreHorizontal size={18}/></button>
        </div>

       {/* ── Combined Banner + Team Card (Single Box) ── */}
<div
  style={{
    borderRadius: 24,
    overflow: "hidden",
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    boxShadow: t.shadow,
    marginBottom: 32,
  }}
>
  
  {/* ── Banner (Top Attached) ── */}
  {(team.banner_url || team.banner) && (
    <div
      style={{
        width: "100%",
        height: 190,
        background: isDark ? "#1c1c3a" : "#eef0f8",
      }}
    >
      <img
        src={team.banner_url || team.banner}
        alt="Team Banner"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  )}

  {/* ── Content (Bottom Attached) ── */}
  <div style={{ padding: 24 }}>
    
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      
      {/* Logo */}
      <div
        style={{
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
        }}
      >
        {team.logo_url || team.logo ? (
          <img
            src={team.logo_url || team.logo}
            alt={team.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: t.accent,
            }}
          >
            {init(team.name)}
          </span>
        )}
      </div>

      {/* Meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {team.name}
          </span>

          {team.is_verified && (
            <CheckCircle size={16} style={{ color: t.blue }} />
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {(team.category_value || team.sport) && (
            <span
              style={{
                background: "rgba(244,63,138,.15)",
                color: t.accent,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 50,
              }}
            >
              {team.category_value || team.sport}
            </span>
          )}

          <span
            style={{
              background: t.surface,
              color: t.textSub,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 50,
            }}
          >
            {team.visibility === "private" ? "Private" : "Public"}
          </span>

          {team.skill_level && (
            <span
              style={{
                background: "rgba(34,197,94,.15)",
                color: t.green,
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 50,
                textTransform: "capitalize",
              }}
            >
              {team.skill_level.replace("_", " ")}
            </span>
          )}
        </div>

        {team.location?.city && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: t.textSub,
            }}
          >
            <MapPin size={12} />
            {team.location.area && `${team.location.area}, `}
            {team.location.city}
          </div>
        )}
      </div>
    </div>

    {team.description && (
      <p
        style={{
          marginTop: 14,
          fontSize: 13,
          color: t.textSub,
          lineHeight: 1.6,
        }}
      >
        {team.description}
      </p>
    )}

    {/* Stats */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 14,
        marginTop: 22,
      }}
    >
      {[
        {
          icon: Users,
          label: "Members",
          value: team.members_count || members.length || 0,
          c: t.blue,
        },
        {
          icon: Calendar,
          label: "Events",
          value: team.events_count || 0,
          c: t.purple,
        },
        {
          icon: Trophy,
          label: "Win Rate",
          value: team.win_rate || "0%",
          c: t.yellow,
        },
        {
          icon: DollarSign,
          label: "Revenue",
          value: fmt$(team.revenue),
          c: t.green,
        },
      ].map(({ icon: I, label, value, c }) => (
        <div
          key={label}
          style={{
            background: t.surface,
            borderRadius: 18,
            padding: "18px 14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${c}1a`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <I size={24} style={{ color: c }} />
          </div>

          <p style={{ fontWeight: 800, fontSize: 22 }}>{value}</p>
          <p style={{ fontSize: 14, color: t.textSub }}>{label}</p>
        </div>
      ))}
    </div>
  </div>
</div>

        {/* ── Quick Actions ── */}
        <div className="act4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          {actions.map(({ icon:I, label, color, fn }) => (
            <button key={label} className="hvr-act" onClick={fn} style={{
              background: t.card, border:`1px solid ${t.cardBorder}`,
              borderRadius:22, padding:"18px 10px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:10, color: t.text,
            }}>
              <div style={{ width:56, height:56, borderRadius:16, background:`${color}1a`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I size={26} style={{ color }}/>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color: t.textSub }}>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tabs ── */}
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

        {/* ── Members Tab ── */}
        {activeTab === "members" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {members.length === 0
              ? <EmptyState icon={Users} label="No members yet" color={t.blue} t={t}/>
              : members.map(m => {
                  const rc = roleC(m.role);
                  const userObj = m.user || {};
                  const memberName = userObj.full_name || userObj.name || userObj.username || "Unknown";
                  const memberAvatar = userObj.profile_image_url || userObj.avatar || null;
                  const memberUsername = userObj.username || "";
                  const memberUserId = m.user_id || m.userId || null;
                  return (
                    <div key={m._id||m.id} className="hvr-card" style={{
                      background: t.card, border:`1px solid ${t.cardBorder}`,
                      borderRadius:16, padding:"12px 14px",
                      display:"flex", alignItems:"center", gap:12,
                    }}>
                      <div 
                        onClick={() => memberUserId && router.push(`/home/profile/${memberUserId}`)}
                        style={{
                          width:46, height:46, borderRadius:14, flexShrink:0,
                          background: isDark ? "#1c1c3a" : "#eef0f8",
                          border:`1.5px solid ${t.cardBorder}`,
                          display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
                          cursor: memberUserId ? "pointer" : "default",
                        }}>
                        {memberAvatar
                          ? <img src={memberAvatar} alt={memberName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          : <span style={{ fontWeight:800, fontSize:14, color: t.accent }}>{init(memberName)}</span>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span 
                            onClick={() => memberUserId && router.push(`/home/profile/${memberUserId}`)}
                            style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor: memberUserId ? "pointer" : "default" }}
                          >
                            {memberName}
                          </span>
                          {m.role === "owner" && <Crown size={13} style={{ color: t.yellow, flexShrink:0 }}/>}
                        </div>
                        <span style={{ fontSize:12, color: t.textSub, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {memberUsername || "Team Member"}
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:50, background: rc.bg, color: rc.cl, textTransform:"capitalize", whiteSpace:"nowrap" }}>
                          {(m.role||"member").replace("_"," ")}
                        </span>
                        {canMg && m.role !== "owner" && (
                          <button onClick={() => setRemoveTarget(m)} style={{
                            width:30, height:30, borderRadius:8, border:"none",
                            background:"rgba(239,68,68,.12)", color: t.red,
                            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                          }}><X size={14}/></button>
                        )}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── Invites Tab ── */}
        {activeTab === "invites" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <span style={{ fontSize:13, color: t.textSub, fontWeight:500 }}>
                {invites.length} pending invite{invites.length !== 1 ? "s" : ""}
              </span>
              <button onClick={doInvite} style={{
                padding:"7px 14px", borderRadius:50, border:"none",
                background: t.gradBtn, color:"#fff",
                fontSize:12, fontWeight:700, cursor:"pointer",
                display:"flex", alignItems:"center", gap:5,
              }}><UserPlus size={13}/> New Invite</button>
            </div>
            {invites.length === 0
              ? <EmptyState icon={Clock} label="No pending invites" color={t.purple} t={t}/>
              : invites.map(inv => {
                  const invId = inv._id || inv.id || inv.invite_id;
                  const invUser = inv.invited_user || inv.user || {};
                  const userName = invUser.name || invUser.user_name || invUser.username || "Invited User";
                  const userAvatar = invUser.avatar || invUser.profile_image_url || null;
                  const inviteCode = inv.invite_code || inv.code || "";
                  const inviteLink = inv.invite_link || (inviteCode ? `https://playymate.app/join/${inviteCode}` : "");
                  const status = inv.status || "pending";
                  
                  return (
                    <div key={invId} style={{
                      background: t.card, border:`1px solid ${t.cardBorder}`,
                      borderRadius:16, padding:"12px 14px",
                      display:"flex", alignItems:"center", gap:12,
                    }}>
                      <div style={{ width:46, height:46, borderRadius:14, flexShrink:0, background: isDark ? "#1c1c3a" : "#eef0f8", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                        {userAvatar
                          ? <img src={userAvatar} alt={userName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          : <span style={{ fontWeight:800, fontSize:14, color: t.accent }}>{init(userName)}</span>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>{userName}</span>
                        {inviteLink && (
                          <p style={{ fontSize:11, color: t.textSub, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inviteLink}</p>
                        )}
                        <p style={{ fontSize:10, color: t.textMuted, marginTop:2 }}>Status: {status}</p>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }} style={{ width:34, height:34, borderRadius:10, border:"none", background:"rgba(59,130,246,.15)", color: t.blue, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} title="Copy Link">
                          {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                        </button>
                        <button onClick={() => doDecline(invId)} style={{ width:34, height:34, borderRadius:10, border:"none", background:"rgba(239,68,68,.12)", color: t.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} title="Revoke Invite"><X size={16}/></button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── Request Tab ── */}
        {activeTab === "request" && (
          <EmptyState icon={UserPlus} label="No join requests" color={t.orange} t={t}/>
        )}

        {/* ── Roles Tab ── */}
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

        {/* ── Payments Tab ── */}
        {activeTab === "payments" && (
          <div>
            {paymentSummary && (
              <div style={{ background: t.card, border:`1px solid ${t.cardBorder}`, borderRadius:20, padding:24, marginBottom:14 }}>
                <p style={{ fontSize:12, color: t.textSub, marginBottom:4, fontWeight:500 }}>Last 30 days</p>
                <p style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.5px", color: t.green }}>{fmt$(paymentSummary.total_collected)}</p>
                <div style={{ display:"flex", gap:24, marginTop:14 }}>
                  <div>
                    <p style={{ fontSize:11, color: t.textSub, marginBottom:2 }}>Pending</p>
                    <p style={{ fontWeight:800, fontSize:16, color: t.yellow }}>{fmt$(paymentSummary.total_pending)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:11, color: t.textSub, marginBottom:2 }}>Transactions</p>
                    <p style={{ fontWeight:800, fontSize:16 }}>{paymentSummary.transaction_count || 0}</p>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {payments.length === 0
                ? <EmptyState icon={CreditCard} label="No payment records" color={t.green} t={t}/>
                : payments.map(p => (
                    <div key={p._id||p.id} style={{ background: t.card, border:`1px solid ${t.cardBorder}`, borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background: p.status === "completed" ? "rgba(34,197,94,.15)" : "rgba(234,179,8,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <CreditCard size={18} style={{ color: p.status === "completed" ? t.green : t.yellow }}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>{p.description || "Payment"}</span>
                        <p style={{ fontSize:12, color: t.textSub }}>{fmtD(p.created_at)}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontWeight:800, fontSize:15, color: p.status === "completed" ? t.green : t.yellow }}>{fmt$(p.amount)}</p>
                        <span style={{ fontSize:10, fontWeight:600, color: p.status === "completed" ? t.green : t.yellow, textTransform:"capitalize" }}>{p.status||"pending"}</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* ── Activity Tab ── */}
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

      {/* ── Invite Players Modal ── */}
      {showInviteModal && (
        <div 
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInviteModal(false);
            }
          }}
        >
          <div style={{
            background: isDark ? "#14142a" : "#ffffff",
            borderRadius: 24, padding: 0,
            width: "100%", maxWidth: 420,
            maxHeight: "90vh", overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}>
            <InvitePlayers 
              teamId={teamId} 
              onClose={() => setShowInviteModal(false)} 
            />
          </div>
        </div>
      )}

      {/* ── Remove Modal ── */}
      {removeTarget && (
        <Modal title="Remove Member" onClose={() => setRemoveTarget(null)} t={t} isDark={isDark}>
          <p style={{ fontSize:13, color: t.textSub, marginBottom:24, lineHeight:1.65 }}>
            Are you sure you want to remove <strong style={{ color: t.text }}>{(removeTarget.user?.full_name || removeTarget.user?.name || removeTarget.user?.username || removeTarget.name || "this member")}</strong> from the team?
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setRemoveTarget(null)} disabled={removing} style={{ flex:1, padding:12, borderRadius:50, border:`1.5px solid ${t.cardBorder}`, background:"transparent", color: t.text, fontWeight:700, fontSize:14, cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={doRemove} disabled={removing} style={{ flex:1, padding:12, borderRadius:50, border:"none", background: t.red, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity: removing ? 0.6 : 1 }}>
              {removing ? "Removing…" : "Remove"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}