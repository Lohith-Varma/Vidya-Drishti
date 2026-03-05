import api from './axiosConfig'

// Backend proxies to LeetCode GraphQL to avoid CORS
export const getLeetCodeStats = (username) =>
  api.get(`/integrations/leetcode/${username}`)

export const refreshLeetCodeStats = (username) =>
  api.post(`/integrations/leetcode/${username}/refresh`)
