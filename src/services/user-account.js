import api from "./api";

export const userAccountService = {
  getUserById: (userId) => api.get(`/users/${userId}`),
};

export default userAccountService;