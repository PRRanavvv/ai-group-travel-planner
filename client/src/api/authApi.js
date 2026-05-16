import apiClient from "./apiClient";

export const login = async (credentials) => {
  const response = await apiClient.post("/api/auth/login", credentials);
  return response.data;
};

export const signup = async (payload) => {
  const response = await apiClient.post("/api/auth/signup", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
};
