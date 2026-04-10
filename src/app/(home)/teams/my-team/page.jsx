"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Plus, 
  Trophy, 
  Calendar, 
  UserPlus, 
  ArrowLeft, 
  MoreVertical,
  Trash2,
  Shield,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { getMyTeams, getMyCreatedTeams, getMyJoinedTeams, archiveTeam, getMyInvites, acceptInvite, declineInvite } from "@/lib/api/teamApi";

export default function MyTeamPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? " text-white" : " text-gray-900";
  const cardBg = isDark ? "bg-[#12121c] border-[#2a2a45]" : "bg-white border-gray-200";
  const actBg = isDark ? "bg-[#12121c] border-[#2a2a45] hover:bg-[#1c1c2e]" : "bg-white border-gray-200 hover:bg-gray-50";
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500";

  // State for team data
  const [teamsData, setTeamsData] = useState({
    owned: [],
    joined: [],
    invites: [],
    loading: true,
    error: null,
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("owned");

  // Invites state for invites tab
  const [invitesData, setInvitesData] = useState({
    invites: [],
    loading: false,
    error: null,
  });

  // Invite action loading state
  const [inviteActionLoading, setInviteActionLoading] = useState(null);

  // Invite filter state
  const [inviteFilter, setInviteFilter] = useState("all");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch teams data on mount
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const response = await getMyTeams();
        
        setTeamsData({
          owned: response.owned || [],
          joined: response.joined || [],
          invites: response.invites || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamsData({
          owned: [],
          joined: [],
          invites: [],
          loading: false,
          error: "Failed to load teams",
        });
      }
    };

    fetchTeamsData();
  }, []);

  // Fetch invites when switching to invites tab
  useEffect(() => {
    if (activeTab === "invites" && invitesData.invites.length === 0 && !invitesData.loading) {
      const fetchInvites = async () => {
        setInvitesData(prev => ({ ...prev, loading: true }));
        try {
          const response = await getMyInvites();
          setInvitesData({
            invites: response.invites || [],
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching invites:", error);
          setInvitesData({
            invites: [],
            loading: false,
            error: "Failed to load invites",
          });
        }
      };
      fetchInvites();
    }
    // Reset invite filter when switching to invites tab
    if (activeTab === "invites") {
      setInviteFilter("all");
    }
  }, [activeTab, invitesData]);

  // Handle delete team
  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeleting(true);
    try {
      const response = await archiveTeam(teamToDelete._id || teamToDelete.id);
      console.log("Archive team response:", response);
      
      // Remove the deleted team from the owned list
      setTeamsData(prev => ({
        ...prev,
        owned: prev.owned.filter(team => (team._id || team.id) !== (teamToDelete._id || teamToDelete.id))
      }));
      
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (team, e) => {
    e.stopPropagation();
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  // Get teams based on active tab
  const getCurrentTeams = () => {
    let teams = [];
    switch (activeTab) {
      case "owned":
        teams = teamsData.owned;
        break;
      case "member":
        teams = teamsData.joined;
        break;
      case "invites":
        teams = invitesData.invites;
        break;
      
      default:
        return [];
    }

    // Filter and sort invites by status
    if (activeTab === "invites") {
      let filteredTeams = teams;
      if (inviteFilter !== "all") {
        filteredTeams = teams.filter(invite => invite.status === inviteFilter);
      }
      return filteredTeams.slice().sort((a, b) => {
        const statusOrder = { pending: 0, accepted: 1 };
        const statusA = statusOrder[a.status] ?? 2;
        const statusB = statusOrder[b.status] ?? 2;
        if (statusA !== statusB) return statusA - statusB;
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
    }

    // Sort by created_at descending (newest first)
    return teams.slice().sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const currentTeams = getCurrentTeams();

  // Render team card
  const renderTeamCard = (team, isOwned = false) => {
    const teamId = team._id || team.id;
    const teamName = team.name;
    
    
    // Helper to convert team name to URL slug
    const toSlug = (name) => {
      if (!name) return ""
      return name.toLowerCase().replace(/\s+/g, "-")
    }
    
    return (
     <div
  key={teamId}
  className={`flex w-80 lg:w-full items-center justify-between border rounded-2xl p-4 ${cardBg} shadow-sm cursor-pointer hover:opacity-90 transition`}
  onClick={() => router.push(`/teams/my-team/${teamId}`)}
>
  {/* LEFT SIDE */}
  <div className="lg:flex items-center gap-4 flex-1 min-w-0">
    
    {/* Avatar */}
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? "bg-[#252542]" : "bg-gray-100"} overflow-hidden`}>
      {team.logo_url || team.logo ? (
        <img src={team.logo_url || team.logo} alt={team.name} className="w-full h-full object-cover" />
      ) : (
        <Users size={24} className={mutedText} />
      )}
    </div>

    {/* Info */}
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-lg truncate">{team.name}</h2>

        {isOwned && (
          <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
            Owner
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
        {team.category_value || team.sport ? (
          <span className="bg-purple-600/20 text-purple-400 px-2 py-[2px] rounded-full text-xs">
            {team.category_value || team.sport}
          </span>
        ) : null}

        <span className="flex items-center gap-1">
          <Users size={12} />
          {team.members_count || team.member_count || team.members?.length || 0} members
        </span>

        {team.is_active !== false && (
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Active
          </span>
        )}
      </div>
    </div>
  </div>

  {/* RIGHT SIDE DELETE BUTTON */}
  {isOwned && (
    <button
      onClick={(e) => openDeleteModal(team, e)}
      className={`p-2 rounded-full ${isDark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"} transition`}
    >
      <Trash2 size={18} />
    </button>
  )}
</div>
    );
  };

  // Render invite card
  const renderInviteCard = (invite) => {
    const team = invite.team;
    const inviteCode = invite.invite_code;
    const isLoading = inviteActionLoading === inviteCode;
    const isAccepted = invite.status === "accepted";

    const handleViewDetails = () => {
      router.push(`/teams/my-team/join-invite-team/${inviteCode}`);
    };

    const handleAccept = async () => {
      setInviteActionLoading(inviteCode);
      try {
        console.log("handleAccept called with inviteCode:", inviteCode);
        const response = await acceptInvite(inviteCode);
        console.log("Accept invite response:", response);
        setInvitesData(prev => ({
          ...prev,
          invites: prev.invites.map(i => 
            i.invite_code === inviteCode ? { ...i, status: "accepted" } : i
          )
        }));
      } catch (error) {
        console.error("Error accepting invite:", error);
        console.log("Error message:", error.message);
        // If already a member, update status and show Join Now
        const errorMsg = error.message || "";
        if (errorMsg.includes("already a member") || errorMsg.includes("TEAM_ALREADY_MEMBER")) {
          console.log("User is already a member, updating status to accepted");
          setInvitesData(prev => ({
            ...prev,
            invites: prev.invites.map(i => 
              i.invite_code === inviteCode ? { ...i, status: "accepted" } : i
            )
          }));
        } else {
          alert(error.message || "Failed to accept invitation. Please try again.");
        }
      } finally {
        setInviteActionLoading(null);
      }
    };

    const handleDecline = async () => {
      setInviteActionLoading(inviteCode);
      try {
        await declineInvite(inviteCode);
        setInvitesData(prev => ({
          ...prev,
          invites: prev.invites.filter(i => i.invite_code !== inviteCode)
        }));
      } catch (error) {
        console.error("Error declining invite:", error);
      } finally {
        setInviteActionLoading(null);
      }
    };

    return (
      <div
        key={invite.invite_id}
        className={`flex items-center gap-4 border rounded-2xl p-4 ${cardBg} shadow-sm`}
      >
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? "bg-[#252542]" : "bg-gray-100"} overflow-hidden`}>
          {team?.logo_url || team?.logo ? (
            <img src={team?.logo_url || team?.logo} alt={team?.name} className="w-full h-full object-cover" />
          ) : (
            <Users size={24} className={mutedText} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg truncate">{team?.name || invite.name}</h2>
          </div>

          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Shield size={12} />
              {invite.invite_type || "direct"} invite
            </span>
            
            <span className={`flex items-center gap-1 ${isAccepted ? "text-green-400" : "text-yellow-400"}`}>
              <Clock size={12} />
              {isAccepted ? "Accepted" : "Pending"}
            </span>
          </div>
        </div>

        {/* Actions - Show Join Now if accepted, otherwise show Accept/Decline */}
        <div className="flex gap-2">
          {isAccepted ? (
            <button
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium text-sm hover:opacity-90 transition"
              onClick={() => router.push(`/teams/my-team/join-invite-team/${inviteCode}`)}
            >
              Join Now     
            </button>          
          ) : (
            <>
              <button
                className="p-2 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition"
                onClick={handleViewDetails}
                title="View Details"
              >
                <Users size={18} />
              </button>
              <button
                className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                onClick={handleAccept}
                disabled={isLoading}
              >
                <CheckCircle size={18} />
              </button>
              <button
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                onClick={handleDecline}
                disabled={isLoading}
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (teamsData.loading) {
    return (
      <div className={`min-h-screen ${pageBg}  flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg} lg:px-20 px-3 py-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/teams')}
          className={`p-2 rounded-full ${isDark ? "bg-[#1a1a2e]" : "bg-gray-100"}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">My Teams</h1>
      </div>

      {/* Create Team Button */}
    

      

      {/* Tabs */}
      <div className="flex  dark:bg-[#1a1a1a] bg-gray-200 rounded-full p-1 mb-5">
        {[
          { key: "owned", label: "Owned", count: teamsData.owned.length },
          { key: "member", label: "Member", count: teamsData.joined.length },
          { key: "invites", label: "Invites", count: invitesData.invites.filter(i => i.status !== "accepted").length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 ${activeTab === tab.key ? "bg-white/20" : isDark ? "bg-zinc-700" : "bg-gray-300"} text-xs px-2 py-[2px] rounded-full`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invite Filter */}
      {activeTab === "invites" && invitesData.invites.length > 0 && (
        <div className="flex gap-2 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "accepted", label: "Accepted" }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setInviteFilter(filter.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                inviteFilter === filter.key
                  ? "bg-pink-500 text-white"
                  : isDark ? "bg-[#1a1a2e] text-gray-400" : "bg-gray-200 text-gray-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Team List */}
      {teamsData.error ? (
        <div className={`text-center py-8 ${mutedText}`}>
          <p>{teamsData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-pink-500 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : currentTeams.length === 0 ? (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? "bg-[#1a1a2e]" : "bg-gray-100"}`}>
            <Users size={32} className={mutedText} />
          </div>
<h3 className="font-semibold text-lg mb-2">
             {activeTab === "owned" && "No Teams Owned"}
             {activeTab === "member" && "No Team Memberships"}
             {activeTab === "invites" && inviteFilter === "all" && "No Invites"}
             {activeTab === "invites" && inviteFilter === "pending" && "No Pending Invites"}
             {activeTab === "invites" && inviteFilter === "accepted" && "No Accepted Invites"}
             
           </h3>
           <p className={`text-sm ${mutedText} mb-4`}>
             {activeTab === "owned" && "Create your first team to get started"}
             {activeTab === "member" && "Join a team to see it here"}
             {activeTab === "invites" && "Team invitations will appear here"}
             
           </p>
          
          {activeTab === "owned" && (
            <Link
              href="/teams/create-team"
              className="inline-flex items-center gap-2 text-pink-500 font-medium"
            >
              <Plus size={18} />
              Create Team
            </Link>
          )}
          
          {activeTab === "member" && (
            <Link
              href="/teams/join-team"
              className="inline-flex items-center gap-2 text-pink-500 font-medium"
            >
              <UserPlus size={18} />
              Find Teams
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "invites" 
            ? currentTeams.map(renderInviteCard)
            : currentTeams.map((team) => renderTeamCard(team, activeTab === "owned" || activeTab === "archived"))
          }
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-2xl p-6 max-w-sm w-full`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Delete Team</h2>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>This action cannot be undone</p>
              </div>
            </div>
            
            <p className={`mb-6 ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <strong>{teamToDelete?.name}</strong>? 
              All team members will be removed and this action cannot be reversed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTeamToDelete(null);
                }}
                disabled={deleting}
                className={`flex-1 px-4 py-2 rounded-full border ${isDark ? 'border-zinc-700' : 'border-gray-300'} disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
