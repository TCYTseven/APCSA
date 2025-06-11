import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';
import { MuscleGroupScore } from './database.types';
import { supabaseDataStore } from './supabaseDataStore';

// Legacy interfaces for AsyncStorage data
interface LegacyUserProfile {
  id: string;
  email: string;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  desiredPhysique: string;
  createdAt: string;
  updatedAt: string;
}

interface LegacyPhysiqueRecord {
  id: string;
  userId: string;
  imageUri: string;
  scores: MuscleGroupScore;
  identifiedParts: string[];
  advice: string;
  createdAt: string;
}

const LEGACY_STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  PHYSIQUE_RECORDS: 'physique_records',
  CURRENT_SCORES: 'current_scores',
} as const;

export interface MigrationResult {
  success: boolean;
  profileMigrated: boolean;
  recordsCount: number;
  errors: string[];
}

class MigrationService {
  async migrateFromAsyncStorage(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      profileMigrated: false,
      recordsCount: 0,
      errors: []
    }

    try {
      console.log('📦 Starting migration from AsyncStorage to Supabase...')

      // Check if user is authenticated
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated to migrate data')
      }

      // 1. Migrate user profile
      await this.migrateUserProfile(result)

      // 2. Migrate physique records
      await this.migratePhysiqueRecords(result)

      // 3. Clean up AsyncStorage after successful migration
      if (result.errors.length === 0) {
        await this.cleanupAsyncStorage()
        result.success = true
        console.log('✅ Migration completed successfully!')
      } else {
        console.log('⚠️ Migration completed with errors:', result.errors)
      }

      return result
    } catch (error) {
      console.error('❌ Migration failed:', error)
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  private async migrateUserProfile(result: MigrationResult): Promise<void> {
    try {
      console.log('👤 Migrating user profile...')

      const profileData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.USER_PROFILE)
      if (!profileData) {
        console.log('No legacy profile found to migrate')
        return
      }

      const legacyProfile: LegacyUserProfile = JSON.parse(profileData)
      
      // Check if profile already exists in Supabase
      const existingProfile = await supabaseDataStore.getUserProfile()
      if (existingProfile) {
        console.log('Profile already exists in Supabase, skipping migration')
        result.profileMigrated = true
        return
      }

      // Convert legacy profile to new format
      const profileUpdate = {
        email: legacyProfile.email,
        gender: legacyProfile.gender,
        height: legacyProfile.height,
        weight: legacyProfile.weight,
        desired_physique: legacyProfile.desiredPhysique,
      }

      await authService.updateUserProfile(profileUpdate)
      result.profileMigrated = true
      console.log('✅ User profile migrated successfully')
    } catch (error) {
      console.error('❌ Profile migration error:', error)
      result.errors.push(`Profile migration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async migratePhysiqueRecords(result: MigrationResult): Promise<void> {
    try {
      console.log('📊 Migrating physique records...')

      const recordsData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PHYSIQUE_RECORDS)
      if (!recordsData) {
        console.log('No legacy records found to migrate')
        return
      }

      const legacyRecords: LegacyPhysiqueRecord[] = JSON.parse(recordsData)
      console.log(`Found ${legacyRecords.length} legacy records to migrate`)

      for (const legacyRecord of legacyRecords) {
        try {
          // Convert legacy record to new format
          const newRecord = {
            user_id: '', // Will be set by supabaseDataStore
            image_url: legacyRecord.imageUri, // This will be uploaded to Supabase Storage
            scores: legacyRecord.scores,
            identified_parts: legacyRecord.identifiedParts,
            advice: legacyRecord.advice,
          }

          await supabaseDataStore.savePhysiqueRecord(newRecord)
          result.recordsCount++
          console.log(`✅ Migrated record ${result.recordsCount}/${legacyRecords.length}`)
        } catch (recordError) {
          console.error('❌ Error migrating record:', recordError)
          result.errors.push(`Record ${legacyRecord.id}: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`)
        }
      }

      console.log(`✅ Migrated ${result.recordsCount} physique records`)
    } catch (error) {
      console.error('❌ Records migration error:', error)
      result.errors.push(`Records migration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async cleanupAsyncStorage(): Promise<void> {
    try {
      console.log('🧹 Cleaning up AsyncStorage after successful migration...')

      await AsyncStorage.removeItem(LEGACY_STORAGE_KEYS.USER_PROFILE)
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEYS.PHYSIQUE_RECORDS)
      
      // Get user profile to clear user-specific current scores
      const profile = await supabaseDataStore.getUserProfile()
      if (profile) {
        await AsyncStorage.removeItem(`${LEGACY_STORAGE_KEYS.CURRENT_SCORES}_${profile.id}`)
      }

      console.log('✅ AsyncStorage cleaned up successfully')
    } catch (error) {
      console.error('❌ AsyncStorage cleanup error:', error)
      // Don't throw here as migration was successful
    }
  }

  // Check if there's legacy data that needs migration
  async hasLegacyData(): Promise<boolean> {
    try {
      const profile = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.USER_PROFILE)
      const records = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PHYSIQUE_RECORDS)
      
      return !!(profile || records)
    } catch (error) {
      console.error('❌ Error checking for legacy data:', error)
      return false
    }
  }

  // Preview what would be migrated (for user confirmation)
  async previewMigration(): Promise<{
    hasProfile: boolean;
    recordsCount: number;
    profileEmail?: string;
  }> {
    try {
      const profileData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.USER_PROFILE)
      const recordsData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PHYSIQUE_RECORDS)

      let hasProfile = false
      let profileEmail: string | undefined
      let recordsCount = 0

      if (profileData) {
        const profile: LegacyUserProfile = JSON.parse(profileData)
        hasProfile = true
        profileEmail = profile.email
      }

      if (recordsData) {
        const records: LegacyPhysiqueRecord[] = JSON.parse(recordsData)
        recordsCount = records.length
      }

      return {
        hasProfile,
        recordsCount,
        profileEmail,
      }
    } catch (error) {
      console.error('❌ Error previewing migration:', error)
      return {
        hasProfile: false,
        recordsCount: 0,
      }
    }
  }
}

export const migrationService = new MigrationService() 