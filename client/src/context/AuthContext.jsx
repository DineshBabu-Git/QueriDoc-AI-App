import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'
import {
  getToken, setToken, removeToken,
  getUser, setUser, removeUser,
} from '../utils/helpers'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On mount: verify the stored token with the server.
  // Reading from localStorage alone is not safe — the token may be expired
  // or the secret may have rotated.  A quick /auth/me call confirms validity
  // and also returns fresh user data.
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken()
      const savedUser = getUser()

      if (token && savedUser) {
        try {
          const response = await authService.getCurrentUser()
          const freshUser = response.data.user
          setUser(freshUser)           // keep localStorage in sync
          setAuthUser(freshUser)
        } catch {
          // Token is invalid or expired — clear everything
          removeToken()
          removeUser()
          setAuthUser(null)
        }
      }

      setLoading(false)
    }

    verifyAuth()
  }, [])

  const register = async (data) => {
    try {
      setError(null)
      const response = await authService.register(data)
      const { token, user: registeredUser } = response.data

      setToken(token)
      setUser(registeredUser)
      setAuthUser(registeredUser)

      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const login = async (data) => {
    try {
      setError(null)
      const response = await authService.login(data)
      const { token, user: loggedInUser } = response.data

      setToken(token)
      setUser(loggedInUser)
      setAuthUser(loggedInUser)

      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    removeToken()
    removeUser()
    setAuthUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
