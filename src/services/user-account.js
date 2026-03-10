import api from "./api";

export const userAccountService = {
  getUserById: () => api.get(`/users/me`),
};

export default userAccountService;