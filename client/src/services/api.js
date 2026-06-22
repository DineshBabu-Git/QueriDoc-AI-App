import axios from 'axios'
import { API_BASE_URL, getToken } from '../utils/helpers'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for large files
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`)

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[API] Request error:', error.message)
    return Promise.reject(error)
  }
)

// Handle responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}: ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[API] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    })

    if (error.response?.status === 401) {
      // Do NOT redirect if the failing request is itself an auth endpoint.
      // login/register return 401 for bad credentials — that error must be
      // shown in the UI, not swallowed by a silent page reload.
      const requestUrl = error.config?.url || ''
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register')

      if (!isAuthEndpoint) {
        console.warn('[API] Session expired — redirecting to login')
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
