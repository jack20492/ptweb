import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      setLoading(true)
      
      // For demo purposes, check if there's a stored user
      const storedUser = localStorage.getItem('demo_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simple demo login - check against our known admin user
      if ((username === 'admin' || username === 'admin@phinpt.com') && password === 'admin123') {
        const adminUser: User = {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'admin',
          email: 'admin@phinpt.com',
          full_name: 'Admin User',
          phone: '0123456789',
          role: 'admin',
          avatar: null,
          start_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setUser(adminUser)
        localStorage.setItem('demo_user', JSON.stringify(adminUser))
        return true
      }
      
      // Try to find user in database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .single()

      if (error || !userData) {
        return false
      }

      // Simple password check (in production, use proper hashing)
      if (userData.password_hash === password) {
        setUser(userData)
        localStorage.setItem('demo_user', JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('demo_user')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}