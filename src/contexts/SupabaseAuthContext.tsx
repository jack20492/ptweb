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
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      setLoading(true)
      
      // Check if there's a stored user session
      const storedUser = localStorage.getItem('current_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        // Verify user still exists in database
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
        
        if (!error && data && data.length > 0) {
          setUser(data[0])
        } else {
          localStorage.removeItem('current_user')
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
      localStorage.removeItem('current_user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Try to find user in database by username or email
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)

      if (error) {
        console.error('Database error:', error)
        return false
      }

      if (!userData || userData.length === 0) {
        console.error('User not found')
        return false
      }

      const user = userData[0]

      // Simple password check (in production, use proper hashing)
      if (user.password_hash === password) {
        setUser(user)
        localStorage.setItem('current_user', JSON.stringify(user))
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
    localStorage.removeItem('current_user')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}