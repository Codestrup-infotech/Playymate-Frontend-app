const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

/**
 * Get public subscription page config
 */
export const getSubscriptionPageConfig = async () => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/page-config`);

    if (!res.ok) {
      throw new Error(`Config API failed: ${res.status}`);
    }

    const data = await res.json();

    return data?.data?.config || null;
  } catch (error) {
    console.error("Config fetch error:", error);
    return null;
  }
};


/**
 * Get subscription plans
 */
import api from '../lib/api/client.js';

export const getSubscriptionPlans = async (duration = 'ALL') => {
  try {
    const res = await api.get(`/subscriptions/plans?duration=${duration}`);
    return res?.data?.plans || [];
  } catch (error) {
    console.error("Public plans fetch error:", error);
    return [];
  }
};
