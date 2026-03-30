"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyReports, withdrawReport } from "@/app/user/mute";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const targetTypeLabels = {
  post: "Post",
  user: "User",
  comment: "Comment",
  story: "Story",
  reel: "Reel",
};

const reasonLabels = {
  harassment: "Harassment or bullying",
  violence: "Violence or harmful behavior",
  nudity: "Adult or inappropriate content",
  spam: "Spam or misleading",
  misinformation: "False or incorrect info",
  other: "Other",
};

export default function WithdrawReportPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log("Fetching user's reports...");
      const response = await getMyReports(1, 50);
      console.log("Get reports response:", response);
      const reportsData = response?.data?.data || response?.data || [];
      console.log("Total reports fetched:", reportsData.length);
      setReports(reportsData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (reportId) => {
    try {
      console.log("Starting withdraw for report ID:", reportId);
      setWithdrawingId(reportId);
      await withdrawReport(reportId);
      console.log("Report withdrawn successfully:", reportId);
      // Remove the withdrawn report from the list
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      console.log("Report removed from list");
    } catch (err) {
      console.error("Error withdrawing report:", err);
      alert("Failed to withdraw report. You can only withdraw pending reports.");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:px-20 lg:py-10 ">
      <h1 className="text-xl font-semibold mb-6">My Reports</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>You haven't submitted any reports yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[report.status] || statusColors.pending}`}>
                    {report.status || "pending"}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {targetTypeLabels[report.target_type] || report.target_type}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {report.created_at ? new Date(report.created_at).toLocaleDateString() : ""}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reason:</span> {reasonLabels[report.reason] || report.reason}
                </p>
                {report.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {report.description}
                  </p>
                )}
              </div>

              {report.status === "pending" && (
                <button
                  onClick={() => handleWithdraw(report._id)}
                  disabled={withdrawingId === report._id}
                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  {withdrawingId === report._id ? "Withdrawing..." : "Withdraw Report"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}