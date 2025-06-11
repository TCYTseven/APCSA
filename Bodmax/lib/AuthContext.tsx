import { Session, User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from './auth'
import { UserProfile } from './database.types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (data: {
    email: string
    password: string
    gender: 'male' | 'female'
    height: number
    weight: number
    desired_physique: string
  }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(setSession)

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Load user profile when user signs in
          await loadUserProfile()
        } else {
          // Clear profile when user signs out
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      setProfile(userProfile)
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
    }
  }

  const signUp = async (data: {
    email: string
    password: string
    gender: 'male' | 'female'
    height: number
    weight: number
    desired_physique: string
  }) => {
    try {
      setLoading(true)
      const result = await authService.signUp(data)
      
      // If we got a session, the user is authenticated
      if (result.session) {
        console.log('✅ Signup successful, waiting for profile creation...')
        // Give the database trigger a moment to create the profile
        setTimeout(async () => {
          await loadUserProfile()
        }, 1000)
      }
      
      // Profile will be loaded automatically via auth state change
    } catch (error) {
      console.error('❌ SignUp error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await authService.signIn({ email, password })
      // Session will be set automatically via auth state change
    } catch (error) {
      console.error('❌ SignIn error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      // Session will be cleared automatically via auth state change
    } catch (error) {
      console.error('❌ SignOut error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => {
    try {
      const updatedProfile = await authService.updateUserProfile(updates)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error('❌ Update profile error:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    await loadUserProfile()
  }

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hooks for common patterns
export function useUser() {
  const { user } = useAuth()
  return user
}

export function useProfile() {
  const { profile } = useAuth()
  return profile
}

export function useSession() {
  const { session } = useAuth()
  return session
} 