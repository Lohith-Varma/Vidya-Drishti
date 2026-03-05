import api from './axiosConfig'

export const getAllTests = (params) =>
  api.get('/tests', { params })

export const getTestById = (id) =>
  api.get(`/tests/${id}`)

export const createTest = (data) =>
  api.post('/tests', data)

export const updateTest = (id, data) =>
  api.put(`/tests/${id}`, data)

export const deleteTest = (id) =>
  api.delete(`/tests/${id}`)

export const submitTestSolution = (testId, questionId, data) =>
  api.post(`/tests/${testId}/questions/${questionId}/submit`, data)

export const getTestSubmissions = (testId) =>
  api.get(`/tests/${testId}/submissions`)

export const getTestLeaderboard = (testId) =>
  api.get(`/tests/${testId}/leaderboard`)

export const runCode = (data) =>
  api.post('/tests/run', data)

export const getStudentTestResults = (studentId) =>
  api.get(`/tests/student/${studentId}/results`)
