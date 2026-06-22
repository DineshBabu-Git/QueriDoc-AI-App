import apiClient from './api'

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
}

export const documentService = {
  uploadDocument: (formData) => apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minute timeout for large files
  }),
  getUserDocuments: () => apiClient.get('/documents'),
  getDocument: (id) => apiClient.get(`/documents/${id}`),
  updateDocument: (id, data) => apiClient.put(`/documents/${id}`, data),
  deleteDocument: (id) => apiClient.delete(`/documents/${id}`),
}

export const chatService = {
  sendMessage: (data) => apiClient.post('/chat/message', data),
  getChatHistory: (documentId) => apiClient.get(`/chat/history/${documentId}`),
  getUserChats: () => apiClient.get('/chat'),
}
