import { UserProfile } from './database.types'
import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  gender: 'male' | 'female'
  height: number
  weight: number
  desired_physique: string
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      console.log('🔐 Signing up user:', data.email)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            gender: data.gender,
            height: data.height,
            weight: data.weight,
            desired_physique: data.desired_physique,
          }
        }
      })

      if (authError) {
        console.error('❌ Auth signup error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('No user returned from signup')
      }

      console.log('✅ User signed up successfully:', authData.user.id)
      
      // Profile will be automatically created by the database trigger
      // Wait a moment for the trigger to complete
      if (authData.session) {
        console.log('✅ User authenticated, profile will be created automatically')
      }
      
      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('❌ SignUp error:', error)
      throw error
    }
  }

  // Sign in existing user
  async signIn(data: SignInData) {
    try {
      console.log('🔐 Signing in user:', data.email)
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('❌ SignIn error:', error)
        throw error
      }

      console.log('✅ User signed in successfully:', authData.user?.id)
      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('❌ SignIn error:', error)
      throw error
    }
  }

  // Sign out user
  async signOut() {
    try {
      console.log('🔐 Signing out user')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ SignOut error:', error)
        throw error
      }

      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ SignOut error:', error)
      throw error
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Get session error:', error)
        throw error
      }

      return session
    } catch (error) {
      console.error('❌ Get session error:', error)
      throw error
    }
  }

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Get user error:', error)
        throw error
      }

      return user
    } catch (error) {
      console.error('❌ Get user error:', error)
      throw error
    }
  }

  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Get profile error:', error)
        throw error
      }

      return data as UserProfile
    } catch (error) {
      console.error('❌ Get profile error:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile | null> {
    try {
      const user = await this.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update profile error:', error)
        throw error
      }

      console.log('✅ Profile updated successfully')
      return data as UserProfile
    } catch (error) {
      console.error('❌ Update profile error:', error)
      throw error
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService() 