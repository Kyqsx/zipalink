import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadCurrentUser() {
    if (!getToken()) {
      setLoading(false)
      return
    }
    try {
      const me = await api.get('/api/users/me', { auth: true })
      setUser(me)
    } catch {
      // token expirado/inválido
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCurrentUser()
  }, [])

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const data = await api.post('/api/auth/register', { name, email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return ctx
}
