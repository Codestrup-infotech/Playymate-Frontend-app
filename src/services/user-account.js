import api from "./api";

export const userAccountService = {
  // Get user by ID
  getUserById: (userId) =>
    api.get(`/api/v1/users/${userId}`),
};

export default userAccountService;