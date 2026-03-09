import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUserById = async (userId) => {
  const response = await axios.get(
    `${API_BASE}/api/v1/users/${userId}`
  );
  return response.data;
};