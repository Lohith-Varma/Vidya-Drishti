import api from "./axiosConfig";

export const getLeetCodeStats = async (username) => {
  const res = await api.get(`/leetcode/${username}`);
  return res.data;
};
