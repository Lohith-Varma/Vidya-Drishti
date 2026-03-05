import api from './axiosConfig'

export const getHackerRankStats = (username) =>
  api.get(`/integrations/hackerrank/${username}`)

export const refreshHackerRankStats = (username) =>
  api.post(`/integrations/hackerrank/${username}/refresh`)
