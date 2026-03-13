const API_BASE = "http://localhost:5000/api/v1";

/**
 * Get public subscription page config
 */
export const getSubscriptionPageConfig = async () => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/page-config`, {
      method: "GET",
    });

    const data = await res.json();
    return data?.data?.config || null;
  } catch (error) {
    console.error("Config fetch error:", error);
    throw error;
  }
};


/**
 * Get subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/superadmin/subscriptions?status=ACTIVE`,
      {
        method: "GET",
      }
    );

    const data = await res.json();
    return data?.data?.plans || [];
  } catch (error) {
    console.error("Plans fetch error:", error);
    throw error;
  }
};