"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getAccountStatus, 
  deactivateAccount, 
  reactivateAccount, 
  requestAccountDeletion, 
  cancelDeletionRequest,
  ACCOUNT_ERROR_CODES 
} from "@/app/user/delete-my-account";
import { AlertTriangle, Shield, AlertCircle, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";

export default function DeleteMyAccountPage() {
  const router = useRouter();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await getAccountStatus();
      
      if (response.success) {
        setAccountStatus(response.data);
        console.log('[DeleteAccount] Account status set:', response.data);
        console.log('[DeleteAccount] Account status value:', response.data.account_status);
      } else if (response.requiresAuth) {
        // Handle forbidden - may need to re-authenticate
        setError("Session expired. Please log in again.");
        // Optionally auto-redirect to login
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to load account status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for deactivation");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      console.log('[DeleteAccount] Calling deactivateAccount API with reason:', reason);
      const response = await deactivateAccount(reason);
      console.log('[DeleteAccount] Deactivate response:', response);
      
      if (response.success) {
        console.log('[DeleteAccount] Deactivation successful, message:', response.message);
        setSuccess(response.message);
        setShowDeactivateModal(false);
        setReason("");
        // Refresh account status (don't logout immediately - user may want to reactivate)
        await fetchAccountStatus();
      } else {
        console.log('[DeleteAccount] Deactivation failed with code:', response.code);
        // Handle specific error codes
        if (response.code === ACCOUNT_ERROR_CODES.ALREADY_DEACTIVATED) {
          setError("Your account is already deactivated");
        } else if (response.code === ACCOUNT_ERROR_CODES.ACCOUNT_NOT_ACTIVE) {
          setError("Only active accounts can be deactivated");
        } else {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('[DeleteAccount] Deactivation error:', err);
      setError("Failed to deactivate account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setSubmitting(true);
      setError(null);
      console.log('[DeleteAccount] Calling reactivateAccount API...');
      const response = await reactivateAccount();
      console.log('[DeleteAccount] Reactivate response:', response);
      
      if (response.success) {
        console.log('[DeleteAccount] Reactivation successful, message:', response.message);
        setSuccess(response.message);
        // Refresh account status
        await fetchAccountStatus();
      } else {
        console.log('[DeleteAccount] Reactivation failed:', response.error);
        setError(response.error);
      }
    } catch (err) {
      console.error('[DeleteAccount] Reactivation error:', err);
      setError("Failed to reactivate account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (reason.trim().length < 5) {
      setError("Reason must be at least 5 characters");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      console.log('[DeleteAccount] Calling requestAccountDeletion API with reason:', reason);
      const response = await requestAccountDeletion(reason);
      console.log('[DeleteAccount] Delete request response:', response);
      console.log('[DeleteAccount] Delete request data:', response.data);
      console.log('[DeleteAccount] Deletion scheduled at:', response.data?.deletion_scheduled_at);
      console.log('[DeleteAccount] Grace period days:', response.data?.grace_period_days);
      
      if (response.success) {
        console.log('[DeleteAccount] Deletion request successful, message:', response.message);
        setSuccess(response.message);
        setShowDeleteModal(false);
        setReason("");
        // Refresh account status (don't logout - allow user to cancel the request)
        await fetchAccountStatus();
      } else {
        console.log('[DeleteAccount] Deletion request failed with code:', response.code);
        // Handle specific error codes
        if (response.code === ACCOUNT_ERROR_CODES.ALREADY_DELETED) {
          setError("Your account has already been deleted");
        } else if (response.code === ACCOUNT_ERROR_CODES.DELETION_ALREADY_REQUESTED) {
          setError("A deletion request is already pending");
        } else if (response.code === ACCOUNT_ERROR_CODES.REASON_REQUIRED) {
          setError("Please provide a reason (minimum 5 characters)");
        } else {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('[DeleteAccount] Deletion request error:', err);
      setError("Failed to request account deletion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setSubmitting(true);
      setError(null);
      console.log('[DeleteAccount] Calling cancelDeletionRequest API...');
      const response = await cancelDeletionRequest();
      console.log('[DeleteAccount] Cancel deletion response:', response);
      
      if (response.success) {
        console.log('[DeleteAccount] Cancel deletion successful, message:', response.message);
        setSuccess(response.message);
        // Refresh account status
        await fetchAccountStatus();
      } else {
        console.log('[DeleteAccount] Cancel deletion failed:', response.error);
        setError(response.error);
      }
    } catch (err) {
      console.error('[DeleteAccount] Cancel deletion error:', err);
      setError("Failed to cancel deletion request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Clear all storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    // Redirect to login
    router.push('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      deactivated: { color: "bg-yellow-100 text-yellow-800", label: "Deactivated" },
      deleted: { color: "bg-red-100 text-red-800", label: "Deleted" },
      pending_deletion: { color: "bg-orange-100 text-orange-800", label: "Pending Deletion" }
    };
    return statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if there's a permission error (requires re-authentication)
  if (error && (error.includes("permission") || error.includes("Session expired") || error.includes("logged in"))) {
    return (
      <div className="max-w-2xl mx-auto ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delete My Account</h1>
          <p className="text-gray-600 mt-1">Manage your account status and deletion options</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-800">Authentication Required</h3>
              <p className="text-sm text-yellow-700 mt-2">
                {error}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setError(null);
                    fetchAccountStatus();
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  Log In Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = accountStatus?.account_status;
  const isDeactivated = accountStatus?.is_deactivated;
  const hasPendingDeletion = accountStatus?.has_pending_deletion === true;
  const hasDeletionRequest = currentStatus === 'pending_deletion' || currentStatus === 'deleted' || hasPendingDeletion;
  
  // Calculate days remaining until deletion
  const getDaysRemaining = () => {
    if (!accountStatus?.deletion_scheduled_at) return null;
    const scheduledDate = new Date(accountStatus.deletion_scheduled_at);
    const now = new Date();
    const diffTime = scheduledDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="max-w-2xl mx-auto  lg:pb-20 lg:py-8 lg:px-10 ">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete My Account</h1>
        <p className="text-gray-600 mt-1">Manage your account status and deletion options</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <XCircle size={20} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-0.5" size={20} />
          <div>
            <p className="text-green-700 font-medium">Success</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            <XCircle size={20} />
          </button>
        </div>
      )}

      {/* Account Status Card */}
      <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Current Account Status
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusBadge(currentStatus).color}`}>
              {getStatusBadge(currentStatus).label}
            </span>
          </div>
          
          {isDeactivated && accountStatus?.deactivated_at && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Deactivated On</p>
              <p className="text-gray-900 font-medium">{formatDate(accountStatus.deactivated_at)}</p>
            </div>
          )}
        </div>

        {accountStatus?.deactivation_reason && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Deactivation Reason</p>
            <p className="text-gray-700 mt-1">{accountStatus.deactivation_reason}</p>
          </div>
        )}

        {/* Show deletion scheduled info if there's a pending deletion */}
        {hasPendingDeletion && accountStatus?.deletion_scheduled_at && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-orange-600" size={20} />
              <h3 className="font-semibold text-orange-800">Your Account Deletion is Scheduled</h3>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              If you wish to continue using your account, you can cancel this request before the deletion date. 
              Once the deletion is completed, your account and all associated data cannot be recovered.
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-orange-600">
                <span className="font-medium">Scheduled Deletion Date:</span> {formatDate(accountStatus.deletion_scheduled_at)}
              </p>
              <p className="text-sm font-medium text-orange-700">
                {getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'} remaining
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Actions Based on Status */}
      
      {/* Active Account - Show Deactivate and Request Deletion options (hide if has pending deletion) */}
      {currentStatus === 'active' && !hasPendingDeletion && (
        <div className="space-y-4">
          {/* Deactivate Account Card */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Deactivate Account</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Temporarily deactivate your account. You can reactivate it anytime by simply logging back in.
                </p>
                <button
                  onClick={() => {
                    setReason("");
                    setError(null);
                    setShowDeactivateModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  Deactivate My Account
                </button>
              </div>
            </div>
          </div>

          {/* Request Permanent Deletion Card */}
          <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Request Permanent Deletion</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete your account after a 30-day grace period. This action cannot be undone.
                  You can cancel the request anytime before the deletion date.
                </p>
                <button
                  onClick={() => {
                    setReason("");
                    setError(null);
                    setShowDeleteModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active account with pending deletion - Show cancel button */}
      {currentStatus === 'active' && hasPendingDeletion && (
        <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Deletion Request Pending</h3>
              <p className="text-sm text-gray-600 mt-1">
                If you wish to continue using your account, you can cancel this request before the deletion date. 
                Once the deletion is completed, your account and all associated data cannot be recovered.
              </p>
              
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">Scheduled Deletion Date:</span> {formatDate(accountStatus?.deletion_scheduled_at)}
                  <span className="ml-3 font-medium text-orange-800">({getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'} remaining)</span>
                </p>
              </div>
              
              <button
                onClick={handleCancelDeletion}
                disabled={submitting}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Cancelling..." : "Cancel the Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivated Account - Show Reactivate option */}
      {currentStatus === 'deactivated' && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Reactivate Your Account</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your account is currently deactivated. Reactivate it now to regain full access to Playymate.
              </p>
              <button
                onClick={handleReactivate}
                disabled={submitting}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Reactivating..." : "Reactivate My Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Deletion - Show Cancel option (for deactivated status) */}
      {hasDeletionRequest && currentStatus !== 'deleted' && currentStatus !== 'active' && (
        <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Deletion Request Pending</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your account is scheduled for permanent deletion. You can cancel this request anytime before the deletion date.
              </p>
              
              {accountStatus?.deletion_scheduled_at && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600">
                    Scheduled Deletion Date: <span className="font-semibold">{formatDate(accountStatus.deletion_scheduled_at)}</span>
                    <span className="ml-2 font-medium text-orange-800">({getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'} remaining)</span>
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCancelDeletion}
                disabled={submitting}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Cancelling..." : "Cancel Deletion Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deleted Account */}
      {currentStatus === 'deleted' && (
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Account Permanently Deleted</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your account has been permanently deleted and cannot be recovered. 
                If you wish to use Playymate again, you'll need to create a new account.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Deactivate Account</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to deactivate your account? You can reactivate it anytime by logging back in.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deactivation (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why you're leaving..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Request Account Deletion</h3>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Your account will be permanently deleted after 30 days. 
                You can cancel this request anytime before the deletion date.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please tell us why you want to delete your account..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 5 characters required</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={submitting || reason.trim().length < 5}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Request Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}