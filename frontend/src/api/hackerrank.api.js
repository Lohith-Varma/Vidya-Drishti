import api from "./axiosConfig";

export const getHackerRankStats = async (username) => {
  const res = await api.get(`/hackerrank/${username}`);
  return res.data;
};
