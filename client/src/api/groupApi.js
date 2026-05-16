import apiClient from "./apiClient";

export const getMyGroups = async () => {
  const response = await apiClient.get("/api/group/my-groups");
  return response.data;
};

export const getGroup = async (groupId) => {
  const response = await apiClient.get(`/api/group/${groupId}`);
  return response.data;
};

export const createGroup = async (payload) => {
  const response = await apiClient.post("/api/group/create", payload);
  return response.data;
};

export const joinGroup = async (payload) => {
  const response = await apiClient.post("/api/group/join", payload);
  return response.data;
};

export const getJoinCode = async (groupId) => {
  const response = await apiClient.get(`/api/group/${groupId}/code`);
  return response.data;
};

export const addProposal = async (groupId, payload) => {
  const response = await apiClient.post(`/api/group/${groupId}/proposal`, payload);
  return response.data;
};

export const voteProposal = async (groupId, payload) => {
  const response = await apiClient.post(`/api/group/${groupId}/vote`, payload);
  return response.data;
};

export const approveProposal = async (groupId, payload) => {
  const response = await apiClient.post(`/api/group/${groupId}/approve`, payload);
  return response.data;
};

export const rejectProposal = async (groupId, payload) => {
  const response = await apiClient.post(`/api/group/${groupId}/reject`, payload);
  return response.data;
};

export const applyApprovedProposals = async (groupId) => {
  const response = await apiClient.post(`/api/group/${groupId}/apply`);
  return response.data;
};
