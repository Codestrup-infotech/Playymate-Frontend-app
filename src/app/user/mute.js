// src/app/user/mute.js

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth token
const getAuthToken = () => {
  try {
    return sessionStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
};

// 🔹 Withdraw Report API
export const withdrawReport = async (reportId) => {
  try {
    console.log("Withdrawing report with ID:", reportId);
    
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();
    console.log("Withdraw report response:", data);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to withdraw report");
    }

    return data;
  } catch (error) {
    console.error("Withdraw Report Error:", error);
    throw error;
  }
};

// 🔹 Get My Reports (optional if needed in withdraw page)
export const getMyReports = async (page = 1, limit = 20) => {
  try {
    console.log("Getting my reports, page:", page, "limit:", limit);
    
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${BASE_URL}/reports/my?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await res.json();
    console.log("Get my reports response:", data);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to fetch reports");
    }

    return data;
  } catch (error) {
    console.error("Get Reports Error:", error);
    throw error;
  }
};