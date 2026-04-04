/**
 * Team API Service
 * Based on PLAYMATE_TEAM_USER_API.postman_collection.json
 * Base URL: /api/v1/teams
 */

// API_BASE should be the base URL WITHOUT /api/v1 (e.g., http://localhost:5000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
  process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '') : 
  "http://localhost:5000";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("playymate_access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("access_token") ||
    null
  );
};

/**
 * Common headers for API requests
 */
const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// ==================== Health Check ====================

/**
 * Check if the team module is running
 * GET /api/v1/teams/health
 */
export async function checkTeamHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/health`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking team health:", error);
    throw error;
  }
}

// ==================== Presigned URLs ====================

/**
 * Generate presigned URL for team media upload
 * POST /api/v1/teams/media/presign
 * @param {Object} params - { purpose: 'logo' | 'banner', file_name: string, mime_type: string }
 */
export async function generatePresignedUrl(params) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/media/presign`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

// ==================== Eligibility ====================

/**
 * Check team creation eligibility
 * GET /api/v1/teams/eligibility
 */
export async function checkEligibility() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/eligibility`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    // Return the data property if it exists, otherwise return the whole response
    return json.data || json;
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  }
}

// ==================== Team Discovery ====================

/**
 * List/Discover teams
 * GET /api/v1/teams
 * @param {Object} params - Query parameters
 */
export async function discoverTeams(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/api/v1/teams?${queryString}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error discovering teams:", error);
    throw error;
  }
}

/**
 * Get team profile by ID
 * GET /api/v1/teams/:teamId
 * @param {string} teamId - Team ID
 */
export async function getTeamProfile(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting team profile:", error);
    throw error;
  }
}

// ==================== My Teams ====================

/**
 * Get all teams user is part of (owned + member)
 * GET /api/v1/teams/mine
 */
export async function getMyTeams() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/mine`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    // Handle nested data structure: { data: { owned: [], member: [] } }
    if (json.data) {
      return {
        owned: json.data.owned || [],
        joined: json.data.member || [],
        invites: json.data.invites || []
      };
    }
    // Handle flat structure: { owned: [], member: [] }
    return {
      owned: json.owned || [],
      joined: json.member || [],
      invites: json.invites || []
    };
  } catch (error) {
    console.error("Error getting my teams:", error);
    throw error;
  }
}

/**
 * Get teams user owns
 * GET /api/v1/teams/mine/created
 */
export async function getMyCreatedTeams() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/mine/created`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting my created teams:", error);
    throw error;
  }
}

/**
 * Get teams user is member of
 * GET /api/v1/teams/mine/joined
 */
export async function getMyJoinedTeams() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/mine/joined`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting my joined teams:", error);
    throw error;
  }
}

// ==================== Team Creation ====================

/**
 * Create a new team
 * POST /api/v1/teams
 * @param {Object} teamData - Team creation data
 */
export async function createTeam(teamData) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(teamData),
    });
    
    // Log the response status and any error details
    console.log("Create team response status:", response.status);
    
    // Try to get response body even for error responses
    const responseBody = await response.json().catch(() => ({}));
    console.log("Create team response body:", responseBody);
    
    // Log validation errors if present
    if (responseBody.data?.errors) {
      console.log("Validation errors:", responseBody.data.errors);
    }
    
    if (!response.ok) {
      // Include the response body message in the error
      const errorMessage = responseBody.data?.errors 
        ? responseBody.data.errors.map(e => e.message || e).join(', ')
        : responseBody.message || responseBody.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return responseBody;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

/**
 * Update team
 * PATCH /api/v1/teams/:teamId
 * @param {string} teamId - Team ID
 * @param {Object} teamData - Team update data
 */
export async function updateTeam(teamId, teamData) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(teamData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
}

/**
 * Archive team (soft delete - owner only)
 * DELETE /api/v1/teams/:teamId
 * @param {string} teamId - Team ID
 */
export async function archiveTeam(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error archiving team:", error);
    throw error;
  }
}

// ==================== Membership ====================

/**
 * Preview membership options
 * GET /api/v1/teams/:teamId/membership/preview
 * @param {string} teamId - Team ID
 */
export async function previewMembership(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/membership/preview`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error previewing membership:", error);
    throw error;
  }
}

/**
 * Initiate membership (join team)
 * POST /api/v1/teams/:teamId/membership/initiate
 * @param {string} teamId - Team ID
 * @param {Object} data - Membership initiation data
 */
export async function initiateMembership(teamId, data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/membership/initiate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error initiating membership:", error);
    throw error;
  }
}

/**
 * Confirm membership
 * POST /api/v1/teams/:teamId/membership/confirm
 * @param {string} teamId - Team ID
 * @param {Object} data - Confirmation data with idempotency key
 */
export async function confirmMembership(teamId, data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/membership/confirm`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error confirming membership:", error);
    throw error;
  }
}

/**
 * Leave team
 * DELETE /api/v1/teams/:teamId/membership
 * @param {string} teamId - Team ID
 */
export async function leaveTeam(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/membership`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error leaving team:", error);
    throw error;
  }
}

// ==================== Members Management ====================

/**
 * Get team members
 * GET /api/v1/teams/:teamId/members
 * @param {string} teamId - Team ID
 */
export async function getTeamMembers(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/members`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting team members:", error);
    throw error;
  }
}

/**
 * Get pending members (owner only)
 * GET /api/v1/teams/:teamId/members/pending
 * @param {string} teamId - Team ID
 */
export async function getPendingMembers(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/members/pending`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting pending members:", error);
    throw error;
  }
}

/**
 * Update member role
 * PATCH /api/v1/teams/:teamId/members/:userId/role
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @param {Object} data - { role: string }
 */
export async function updateMemberRole(teamId, userId, data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/members/${userId}/role`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
}

/**
 * Remove member
 * DELETE /api/v1/teams/:teamId/members/:userId
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 */
export async function removeMember(teamId, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
}

// ==================== Invite System ====================

/**
 * Create invite
 * POST /api/v1/teams/:teamId/invites
 * @param {string} teamId - Team ID
 * @param {Object} data - { invite_type: 'link' | 'direct' | 'qr' }
 */
export async function createInvite(teamId, data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating invite:", error);
    throw error;
  }
}

/**
 * Resolve invite code
 * GET /api/v1/teams/invites/:inviteCode
 * @param {string} inviteCode - Invite code
 */
export async function resolveInviteCode(inviteCode) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/invites/${inviteCode}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error resolving invite code:", error);
    throw error;
  }
}

/**
 * Accept invite
 * POST /api/v1/teams/invites/:inviteCode/accept
 * @param {string} inviteCode - Invite code
 */
export async function acceptInvite(inviteCode) {
  try {
    console.log("acceptInvite: Sending request for code:", inviteCode);
    
    const response = await fetch(`${API_BASE}/api/v1/teams/invites/${inviteCode}/accept`, {
      method: "POST",
      headers: getHeaders(),
    });
    
    console.log("acceptInvite response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("acceptInvite error response:", errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error accepting invite:", error);
    throw error;
  }
}

/**
 * Decline invite
 * POST /api/v1/teams/invites/:inviteCode/decline
 * @param {string} inviteCode - Invite code
 */
export async function declineInvite(inviteCode) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/invites/${inviteCode}/decline`, {
      method: "POST",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error declining invite:", error);
    throw error;
  }
}

/**
 * Revoke invite (owner only)
 * DELETE /api/v1/teams/:teamId/invites/:inviteId
 * @param {string} teamId - Team ID
 * @param {string} inviteId - Invite ID
 */
export async function revokeInvite(teamId, inviteId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites/${inviteId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error revoking invite:", error);
    throw error;
  }
}

// ==================== Payments Dashboard ====================

/**
 * Get team payments (owner only)
 * GET /api/v1/teams/:teamId/payments
 * @param {string} teamId - Team ID
 */
export async function getTeamPayments(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/payments`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting team payments:", error);
    throw error;
  }
}

/**
 * Get payment summary (owner only)
 * GET /api/v1/teams/:teamId/payments/summary
 * @param {string} teamId - Team ID
 * @param {string} period - Period in days (default: 30)
 */
export async function getPaymentSummary(teamId, period = "30") {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/payments/summary?period=${period}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting payment summary:", error);
    throw error;
  }
}

// ==================== Slot Packages ====================

/**
 * List available slot packages
 * GET /api/v1/teams/slot-packages
 */
export async function getSlotPackages() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slot-packages`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting slot packages:", error);
    throw error;
  }
}

/**
 * Get slot package detail
 * GET /api/v1/teams/slot-packages/:packageId
 * @param {string} packageId - Package ID
 */
export async function getSlotPackageDetail(packageId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slot-packages/${packageId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting slot package detail:", error);
    throw error;
  }
}

/**
 * Initiate slot purchase
 * POST /api/v1/teams/slots/initiate
 * @param {Object} data - { package_id: string, idempotency_key: string }
 */
export async function initiateSlotPurchase(data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slots/initiate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    // Try to get response body for error handling
    const responseBody = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = responseBody.message || responseBody.error || `Payment failed (${response.status})`;
      throw new Error(errorMessage);
    }
    
    return responseBody;
  } catch (error) {
    console.error("Error initiating slot purchase:", error);
    throw error;
  }
}

/**
 * Confirm slot purchase
 * POST /api/v1/teams/slots/confirm
 * @param {Object} data - { idempotency_key: string }
 */
export async function confirmSlotPurchase(data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slots/confirm`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error confirming slot purchase:", error);
    throw error;
  }
}

/**
 * Get my slot purchases
 * GET /api/v1/teams/slots/mine
 */
export async function getMySlotPurchases() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slots/mine`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting my slot purchases:", error);
    throw error;
  }
}

/**
 * Get my slot balance
 * GET /api/v1/teams/slots/mine/balance
 */
export async function getMySlotBalance() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slots/mine/balance`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting my slot balance:", error);
    throw error;
  }
}

/**
 * Get user's coin balance for slot purchase
 * GET /api/v1/teams/slots/coin-balance
 */
export async function getCoinBalance() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/slots/coin-balance`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error getting coin balance:", error);
    throw error;
  }
}

// ==================== Team Name Reservation ====================

/**
 * Check name availability
 * GET /api/v1/teams/name-reservation/check?name=teamName
 * @param {string} name - Team name to check
 */
export async function checkNameAvailability(name) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/name-reservation/check?name=${encodeURIComponent(name)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking name availability:", error);
    throw error;
  }
}

/**
 * Get name reservation pricing
 * GET /api/v1/teams/name-reservation/pricing
 */
export async function getNameReservationPricing() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/name-reservation/pricing`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error getting name reservation pricing:", error);
    throw error;
  }
}

/**
 * Get name reservation coin balance
 * GET /api/v1/teams/name-reservation/coin-balance
 */
export async function getNameReservationCoinBalance() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/name-reservation/coin-balance`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error getting name reservation coin balance:", error);
    throw error;
  }
}

/**
 * Reserve team name
 * POST /api/v1/teams/name-reservation/reserve
 * @param {Object} data - { name: string, payment_method: 'COINS' | 'INR', idempotency_key: string }
 */
export async function reserveTeamName(data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/name-reservation/reserve`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    const responseBody = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = responseBody.message || responseBody.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return responseBody;
  } catch (error) {
    console.error("Error reserving team name:", error);
    throw error;
  }
}

/**
 * Get my name reservations
 * GET /api/v1/teams/name-reservation/mine
 */
export async function getMyNameReservations() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/name-reservation/mine`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting my name reservations:", error);
    throw error;
  }
}

// ==================== User Search & Invite ====================

/**
 * Search users to invite to a team
 * GET /api/v1/teams/:teamId/invites/search?query=username
 * @param {string} teamId - Team ID
 * @param {string} query - Search query (username)
 */
export async function searchUsers(teamId, query) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 * Send direct invite to a user
 * POST /api/v1/teams/:teamId/invites
 * @param {string} teamId - Team ID
 * @param {Object} data - { invite_type: 'direct', invited_user_ids: string[] }
 */
export async function sendInvite(teamId, data) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        invite_type: "direct",
        invited_user_ids: Array.isArray(data.invited_user_ids) 
          ? data.invited_user_ids 
          : [data.invited_user_ids || data.user_id],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sending invite:", error);
    throw error;
  }
}

/**
 * Get recent activity/suggested users for a team
 * GET /api/v1/teams/:teamId/invites/suggestions
 * @param {string} teamId - Team ID
 */
export async function getRecentActivity(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites/suggestions`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting recent activity:", error);
    throw error;
  }
}

/**
 * Get team invites (owner only)
 * GET /api/v1/teams/:teamId/invites
 * @param {string} teamId - Team ID
 */
export async function getTeamInvites(teamId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/${teamId}/invites`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting team invites:", error);
    throw error;
  }
}

/**
 * Get my team invites (invitations sent to me)
 * GET /api/v1/teams/invites/mine
 */
export async function getMyInvites() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams/invites/mine`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return {
      invites: json.data?.invites || [],
      count: json.data?.count || 0
    };
  } catch (error) {
    console.error("Error getting my invites:", error);
    throw error;
  }
}

/**
 * Search teams by name (for slug lookup)
 * GET /api/v1/teams?search=name
 * @param {string} name - Team name to search for
 */
export async function searchTeamsByName(name) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/teams?search=${encodeURIComponent(name)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Handle both { data: [...] } and [...] response formats
    const teams = data.data || data;
    return Array.isArray(teams) ? teams : [];
  } catch (error) {
    console.error("Error searching teams:", error);
    throw error;
  }
}

export default {
  checkTeamHealth,
  generatePresignedUrl,
  checkEligibility,
  discoverTeams,
  getTeamProfile,
  getMyTeams,
  getMyCreatedTeams,
  getMyJoinedTeams,
  createTeam,
  updateTeam,
  archiveTeam,
  previewMembership,
  initiateMembership,
  confirmMembership,
  leaveTeam,
  getTeamMembers,
  getPendingMembers,
  updateMemberRole,
  removeMember,
  createInvite,
  resolveInviteCode,
  acceptInvite,
  declineInvite,
  revokeInvite,
  getTeamPayments,
  getPaymentSummary,
  getSlotPackages,
  getSlotPackageDetail,
  initiateSlotPurchase,
  confirmSlotPurchase,
  getMySlotPurchases,
  getMySlotBalance,
  checkNameAvailability,
  reserveTeamName,
  getNameReservationPricing,
  getNameReservationCoinBalance,
  getMyNameReservations,
  searchUsers,
  sendInvite,
  getRecentActivity,
  getTeamInvites,
  getMyInvites,
};
