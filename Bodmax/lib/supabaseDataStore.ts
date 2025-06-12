import { authService } from './auth'
import { MuscleGroupScore, PhysiqueRecord, UserProfile } from './database.types'
import { storageService } from './storage'
import { supabase } from './supabase'

class SupabaseDataStore {
  // User Profile Management
  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      // Check if user is authenticated
      const user = await authService.getUser()
      
      if (!user) {
        // If no authenticated user, this should be handled during signup
        throw new Error('User must be authenticated to save profile. Use signup flow instead.')
      }
      
      // Update existing profile
      return await authService.updateUserProfile(profile) || {
        id: user.id,
        created_at: null,
        updated_at: null,
        ...profile
      }
    } catch (error) {
      console.error('❌ Save user profile error:', error)
      throw error
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return await authService.getUserProfile()
  }

  async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile | null> {
    return await authService.updateUserProfile(updates)
  }

  // Physique Records Management
  async savePhysiqueRecord(record: Omit<PhysiqueRecord, 'id' | 'created_at'>): Promise<PhysiqueRecord> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated to save physique records')
      }

      console.log('💾 Saving physique record to Supabase')

      // Upload image first
      let imageUrl = record.image_url
      if (record.image_url && !record.image_url.startsWith('http')) {
        // This is a local image URI, upload it
        const uploadResult = await storageService.uploadPhysiqueImage(record.image_url)
        imageUrl = uploadResult.url
      }

      // Insert record into database
      const { data, error } = await supabase
        .from('physique_records')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          scores: record.scores,
          identified_parts: record.identified_parts,
          advice: record.advice,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Save physique record error:', error)
        throw error
      }

      console.log('✅ Physique record saved successfully:', data.id)

      return {
        id: data.id,
        user_id: data.user_id,
        image_url: data.image_url,
        scores: data.scores as MuscleGroupScore,
        identified_parts: data.identified_parts,
        advice: data.advice,
        created_at: data.created_at,
      }
    } catch (error) {
      console.error('❌ Save physique record error:', error)
      throw error
    }
  }

  async getPhysiqueRecords(userId?: string): Promise<PhysiqueRecord[]> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated')
      }

      const { data, error } = await supabase
        .from('physique_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Get physique records error:', error)
        throw error
      }

      return data.map(record => ({
        id: record.id,
        user_id: record.user_id,
        image_url: record.image_url,
        scores: record.scores as MuscleGroupScore,
        identified_parts: record.identified_parts,
        advice: record.advice,
        created_at: record.created_at,
      }))
    } catch (error) {
      console.error('❌ Get physique records error:', error)
      return []
    }
  }

  async getLatestPhysiqueRecord(userId?: string): Promise<PhysiqueRecord | null> {
    try {
      const records = await this.getPhysiqueRecords(userId)
      return records.length > 0 ? records[0] : null
    } catch (error) {
      console.error('❌ Get latest physique record error:', error)
      return null
    }
  }

  async deletePhysiqueRecord(recordId: string): Promise<boolean> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated')
      }

      console.log('🗑️ Deleting physique record:', recordId)

      // First get the record to get the image path
      const { data: record, error: fetchError } = await supabase
        .from('physique_records')
        .select('image_url')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !record) {
        console.error('❌ Record not found:', fetchError)
        return false
      }

      // Delete the record from database
      const { error: deleteError } = await supabase
        .from('physique_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('❌ Delete record error:', deleteError)
        throw deleteError
      }

      // Delete the image from storage
      const imagePath = storageService.extractPathFromUrl(record.image_url)
      if (imagePath) {
        await storageService.deleteImage(imagePath)
      }

      console.log('✅ Physique record deleted successfully')
      return true
    } catch (error) {
      console.error('❌ Delete physique record error:', error)
      return false
    }
  }

  // Current Scores Management
  async getCurrentScores(): Promise<MuscleGroupScore> {
    try {
      const user = await authService.getUser()
      if (!user) {
        return this.getDefaultScores()
      }

      const { data, error } = await supabase
        .from('current_scores')
        .select('scores')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no current scores exist, return default
        if (error.code === 'PGRST116') {
          return this.getDefaultScores()
        }
        console.error('❌ Get current scores error:', error)
        throw error
      }

      return (data.scores as MuscleGroupScore) || this.getDefaultScores()
    } catch (error) {
      console.error('❌ Get current scores error:', error)
      return this.getDefaultScores()
    }
  }

  async updateCurrentScores(newScores: MuscleGroupScore): Promise<void> {
    try {
      const user = await authService.getUser()
      if (!user) {
        console.error('No user authenticated, cannot update scores')
        return
      }

      // Note: This is automatically handled by the database trigger
      // when new physique records are inserted. But we can also manually update if needed.
      
      console.log('📊 Current scores will be automatically updated by database trigger')
    } catch (error) {
      console.error('❌ Update current scores error:', error)
    }
  }

  private getDefaultScores(): MuscleGroupScore {
    return {
      "Trapezius": 0,
      "Triceps": 0,
      "Forearm": 0,
      "Calves": 0,
      "Deltoids": 0,
      "Chest": 0,
      "Biceps": 0,
      "Abs": 0,
      "Quadriceps": 0,
      "Upper back": 0,
      "Lower back": 0,
      "Hamstring": 0,
      "Gluteal": 0,
    }
  }

  // Progress and Analytics
  async getProgressData(userId?: string): Promise<Array<{ date: string; score: number }>> {
    try {
      const user = await authService.getUser()
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) {
        console.error('❌ Get progress data error:', error)
        return []
      }

      return data.map(item => ({
        date: item.date || '',
        score: item.avg_score || 0,
      }))
    } catch (error) {
      console.error('❌ Get progress data error:', error)
      return []
    }
  }

  async getBestScores(): Promise<MuscleGroupScore> {
    try {
      const user = await authService.getUser()
      if (!user) {
        return this.getDefaultScores()
      }

      const { data, error } = await supabase
        .from('user_best_scores')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Get best scores error:', error)
        return this.getDefaultScores()
      }

      const bestScores: MuscleGroupScore = this.getDefaultScores()
      data.forEach(item => {
        if (item.muscle_group && item.best_score) {
          bestScores[item.muscle_group] = item.best_score
        }
      })

      return bestScores
    } catch (error) {
      console.error('❌ Get best scores error:', error)
      return this.getDefaultScores()
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated')
      }

      console.log('🗑️ Clearing all user data from Supabase')

      // Delete all physique records (which will also clean up storage via our delete method)
      const records = await this.getPhysiqueRecords()
      for (const record of records) {
        await this.deletePhysiqueRecord(record.id)
      }

      // Delete current scores
      await supabase
        .from('current_scores')
        .delete()
        .eq('user_id', user.id)

      console.log('✅ All user data cleared successfully')
    } catch (error) {
      console.error('❌ Clear all data error:', error)
      throw error
    }
  }

  async exportData(): Promise<string> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated')
      }

      const profile = await this.getUserProfile()
      const records = await this.getPhysiqueRecords()
      const currentScores = await this.getCurrentScores()

      const exportData = {
        profile,
        records,
        currentScores,
        exportedAt: new Date().toISOString(),
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('❌ Export data error:', error)
      throw error
    }
  }

  // Migration helper (to be used once)
  async migrateFromAsyncStorage(): Promise<void> {
    // This would be implemented to read from AsyncStorage and migrate to Supabase
    // For now, we'll leave this as a placeholder for manual migration
    console.log('📦 Migration from AsyncStorage would be implemented here')
  }
}

export const supabaseDataStore = new SupabaseDataStore() 