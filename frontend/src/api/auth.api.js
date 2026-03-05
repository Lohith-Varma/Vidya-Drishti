import api from './axiosConfig'

export const loginUser = (credentials) =>
  api.post('/auth/login', credentials)

export const registerUser = (data) =>
  api.post('/auth/register', data)

export const logoutUser = () =>
  api.post('/auth/logout')

export const getMe = () =>
  api.get('/auth/me')

export const changePassword = (data) =>
  api.put('/auth/change-password', data)
