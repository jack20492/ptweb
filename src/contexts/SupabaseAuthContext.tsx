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
    // Initialize admin user on app start
    initializeAdminUser()
    
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

  const initializeAdminUser = async () => {
    try {
      // Check if admin user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@phinpt.com')
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for admin user:', checkError)
        return
      }

      if (!existingUser) {
        // Create admin user through Supabase Auth with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: 'admin@phinpt.com',
          password: 'admin123',
          options: {
            data: {
              username: 'admin',
              full_name: 'Phi Nguyễn PT',
              role: 'admin',
              phone: '0123456789'
            }
          }
        })

        if (authError) {
          console.error('Error creating admin user:', authError)
          return
        }

        if (authData.user) {
          // Call database function to setup admin user properly
          const { error: setupError } = await supabase.rpc('setup_admin_user', {
            user_id: authData.user.id
          })

          if (setupError) {
            console.error('Error setting up admin user:', setupError)
            return
          }

          console.log('Admin user created successfully')
        }
      }
    } catch (error) {
      console.error('Error initializing admin user:', error)
    }
  }

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
      let email = username
      
      // If username doesn't contain @, try to find the email from users table
      if (!username.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', username)
          .maybeSingle()

        if (userError || !userData?.email) {
          return false
        }
        
        email = userData.email
      }

      // Sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
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