"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Trophy, Calendar, ArrowLeft, Clock, CheckCircle, X, MapPin, Star } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { resolveInviteCode, acceptInvite, declineInvite } from "@/lib/api/teamApi";
import TeamInvitationCard from "@/app/(home)/home/components/TeamInvitationCard";

export default function InviteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const inviteCode = params.inviteCode;
  
  const pageBg = isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#12121c] border-[#2a2a45]" : "bg-white border-gray-200";
  const mutedText = isDark ? "text-zinc-400" : "text-gray-500";

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!inviteCode) return;
      
      try {
        const response = await resolveInviteCode(inviteCode);
        setInviteData(response.data);
      } catch (err) {
        console.error("Error fetching invite details:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteCode]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptInvite(inviteCode);
      router.push("/teams/my-team?tab=member");
    } catch (error) {
      console.error("Error accepting invite:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await declineInvite(inviteCode);
      router.push("/teams/my-team?tab=invites");
    } catch (error) {
      console.error("Error declining invite:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className={`min-h-screen ${pageBg} px-5 py-6`}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-[#1a1a2e]" : "bg-gray-100"}`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Invitation Details</h1>
        </div>
        <div className="text-center py-12">
          <p className={mutedText}>{error || "Invitation not found"}</p>
        </div>
      </div>
    );
  }

  const team = {
    id: inviteData.team_id,
    name: inviteData.team_name,
    username: inviteData.team_name?.toLowerCase().replace(/\s+/g, ""),
    members: inviteData.member_count,
    capacity: `${inviteData.member_count}/${inviteData.max_members}`,
    skill: inviteData.skill_level || "Any",
    logo_url: inviteData.logo_url,
  };

  return (
    <div className={`min-h-screen ${pageBg} px-5 py-6`}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-full ${isDark ? "bg-[#1a1a2e]" : "bg-gray-100"}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Invitation Details</h1>
      </div>

      <TeamInvitationCard team={team} />

      <div className={`mt-6 rounded-2xl p-4 ${cardBg}`}>
        <h3 className="font-semibold text-lg mb-4">Team Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={mutedText}>Category</span>
            <span className="font-medium">{inviteData.category_value || inviteData.category_type}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={mutedText}>Visibility</span>
            <span className="font-medium capitalize">{inviteData.visibility}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={mutedText}>Skill Level</span>
            <span className="font-medium capitalize">{inviteData.skill_level || "Any"}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={mutedText}>Age Group</span>
            <span className="font-medium capitalize">{inviteData.age_group?.replace("_", " ") || "All"}</span>
          </div>

          {inviteData.location?.city && (
            <div className="flex justify-between items-center">
              <span className={mutedText}>Location</span>
              <span className="font-medium">{inviteData.location.city}</span>
            </div>
          )}
        </div>

        {inviteData.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Description</h4>
            <p className={`text-sm ${mutedText}`}>{inviteData.description}</p>
          </div>
        )}

        {inviteData.membership && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Membership</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={mutedText}>Fee</span>
                <span className="font-medium">
                  {inviteData.membership.is_paid ? `₹${inviteData.membership.fee_amount}` : "Free"}
                </span>
              </div>
              {inviteData.membership.welcome_bonus_coins > 0 && (
                <div className="flex justify-between items-center">
                  <span className={mutedText}>Welcome Bonus</span>
                  <span className="font-medium text-green-400">{inviteData.membership.welcome_bonus_coins} Coins</span>
                </div>
              )}
              {inviteData.membership.gold_coin_discount_pct > 0 && (
                <div className="flex justify-between items-center">
                  <span className={mutedText}>Gold Coin Discount</span>
                  <span className="font-medium text-yellow-400">{inviteData.membership.gold_coin_discount_pct}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {inviteData.invite_valid && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDecline}
            disabled={actionLoading}
            className="flex-1 py-3 rounded-xl border border-red-500 text-red-500 font-semibold disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={20} />
                Accept
              </>
            )}
          </button>
        </div>
      )}

      {!inviteData.invite_valid && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/20 text-red-400 text-center">
          This invitation has expired or is no longer valid
        </div>
      )}
    </div>
  );
}