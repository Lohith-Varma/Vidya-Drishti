import api from './axiosConfig'

export const getAllStudents = (params) =>
  api.get('/students', { params })

export const getStudentById = (id) =>
  api.get(`/students/${id}`)

export const getStudentStats = (id) =>
  api.get(`/students/${id}/stats`)

export const updateStudentProfile = (id, data) =>
  api.put(`/students/${id}`, data)

export const getStudentSubmissions = (id) =>
  api.get(`/students/${id}/submissions`)

export const getLeaderboard = (params) =>
  api.get('/students/leaderboard', { params })

export const searchStudents = (query) =>
  api.get('/students/search', { params: { q: query } })
