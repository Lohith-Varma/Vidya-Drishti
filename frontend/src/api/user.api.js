import api from './axiosConfig'

export const getUserProfile = () =>
  api.get('/users/profile')

export const updateUserProfile = (data) =>
  api.put('/users/profile', data)

export const uploadAvatar = (formData) =>
  api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const deleteAccount = () =>
  api.delete('/users/profile')
