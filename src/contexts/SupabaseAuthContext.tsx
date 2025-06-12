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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First, try to find the user by username or email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .or(`username.eq.${username},email.eq.${username}`)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      // If no user found, return false
      if (userError || !userData) {
        return false
      }

      // Sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password
      })

      return !error
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}