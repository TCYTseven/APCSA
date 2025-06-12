import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import { Database } from './database.types'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  'https://pjtmkogayctrelrhlmti.supabase.co'

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdG1rb2dheWN0cmVscmhsbXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTY1MDUsImV4cCI6MjA2NDc5MjUwNX0.ouQ2r9zuv01JhNSw-hHqmuX2WrRzBzgc-1B6VTCVYl0'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic refresh handling since we'll manage this manually in React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
})

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey.substring(0, 20) + '...',
}

console.log('🔌 Supabase initialized:', supabaseConfig) 