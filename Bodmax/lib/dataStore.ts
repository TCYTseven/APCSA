// MIGRATION NOTICE: This file now uses Supabase instead of AsyncStorage
// The old AsyncStorage implementation has been moved to dataStore.legacy.ts
// This maintains backward compatibility while using the new Supabase backend

import { authService } from './auth';
import type { MuscleGroupScore, UserProfile } from './database.types';
import { supabaseDataStore } from './supabaseDataStore';

// Re-export types for backward compatibility
export type { MuscleGroupScore, PhysiqueRecord, UserProfile } from './database.types';

// Legacy interface mapping for backward compatibility
export interface LegacyPhysiqueRecord {
  id: string;
  userId: string;
  imageUri: string;
  scores: MuscleGroupScore;
  identifiedParts: string[];
  advice: string;
  createdAt: string;
}

class DataStore {
  // User Profile Management - Now uses Supabase
  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      // Check if we're in a signup flow (no authenticated user yet)
      const user = await authService.getUser()
      
      if (!user) {
        // During signup, profile creation is handled by the database trigger
        // Return a placeholder that matches the expected format
        console.log('📝 Profile will be created automatically during signup')
        return {
          id: 'pending',
          created_at: null,
          updated_at: null,
          ...profile
        }
      }
      
      // For authenticated users, update the profile
      return await supabaseDataStore.saveUserProfile(profile)
    } catch (error) {
      console.error('❌ Legacy saveUserProfile error:', error)
      // Return a placeholder to maintain compatibility
      return {
        id: 'error',
        created_at: null,
        updated_at: null,
        ...profile
      }
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return await supabaseDataStore.getUserProfile()
  }

  async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile | null> {
    return await supabaseDataStore.updateUserProfile(updates)
  }

  // Physique Records Management - Now uses Supabase with backward compatibility
  async savePhysiqueRecord(record: Omit<LegacyPhysiqueRecord, 'id' | 'createdAt'>): Promise<LegacyPhysiqueRecord> {
    // Convert legacy format to new format
    const newRecord = {
      user_id: record.userId,
      image_url: record.imageUri,
      scores: record.scores,
      identified_parts: record.identifiedParts,
      advice: record.advice,
    }

    const savedRecord = await supabaseDataStore.savePhysiqueRecord(newRecord)

    // Convert back to legacy format
    return {
      id: savedRecord.id,
      userId: savedRecord.user_id,
      imageUri: savedRecord.image_url,
      scores: savedRecord.scores,
      identifiedParts: savedRecord.identified_parts,
      advice: savedRecord.advice,
      createdAt: savedRecord.created_at || new Date().toISOString(),
    }
  }

  async getPhysiqueRecords(userId: string): Promise<LegacyPhysiqueRecord[]> {
    const records = await supabaseDataStore.getPhysiqueRecords()
    
    // Convert to legacy format and generate signed URLs for images
    const recordsWithSignedUrls = await Promise.all(
      records.map(async (record) => {
        let imageUri = record.image_url;
        
        // If the image_url is a Supabase storage URL, create a signed URL
        if (record.image_url && record.image_url.includes('/storage/v1/object/')) {
          try {
            // Add timeout to signed URL generation
            const signedUrlPromise = (async () => {
              // Extract the file path more robustly
              let path: string | null = null;
              
              // Handle both public and signed URLs
              if (record.image_url.includes('/physique-images/')) {
                const parts = record.image_url.split('/physique-images/');
                if (parts.length > 1) {
                  path = parts[1].split('?')[0]; // Remove any existing query parameters
                }
              }
              
              if (path) {
                console.log('🔗 Creating signed URL for path:', path);
                const { storageService } = await import('./storage');
                const signedUrl = await storageService.getSignedUrl(path, 3600); // 1 hour expiry
                console.log('✅ Signed URL created successfully');
                return signedUrl;
              } else {
                console.warn('⚠️ Could not extract path from image URL:', record.image_url);
                return record.image_url;
              }
            })();
            
            // Race against timeout
            imageUri = await Promise.race([
              signedUrlPromise,
              new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Signed URL generation timeout')), 5000)
              )
            ]);
          } catch (error) {
            console.error('❌ Failed to create signed URL:', error);
            console.log('🔄 Falling back to original URL:', record.image_url);
            // Fall back to original URL
          }
        }
        
        return {
          id: record.id,
          userId: record.user_id,
          imageUri,
          scores: record.scores,
          identifiedParts: record.identified_parts,
          advice: record.advice,
          createdAt: record.created_at || new Date().toISOString(),
        };
      })
    );
    
    return recordsWithSignedUrls;
  }

  async getLatestPhysiqueRecord(userId: string): Promise<LegacyPhysiqueRecord | null> {
    const record = await supabaseDataStore.getLatestPhysiqueRecord()
    
    if (!record) return null

    // Convert to legacy format and generate signed URL for image
    let imageUri = record.image_url;
    
    // If the image_url is a Supabase storage URL, create a signed URL
    if (record.image_url && record.image_url.includes('/storage/v1/object/')) {
      try {
        // Extract the file path more robustly
        let path: string | null = null;
        
        // Handle both public and signed URLs
        if (record.image_url.includes('/physique-images/')) {
          const parts = record.image_url.split('/physique-images/');
          if (parts.length > 1) {
            path = parts[1].split('?')[0]; // Remove any existing query parameters
          }
        }
        
        if (path) {
          console.log('🔗 Creating signed URL for path:', path);
          const { storageService } = await import('./storage');
          imageUri = await storageService.getSignedUrl(path, 3600); // 1 hour expiry
          console.log('✅ Signed URL created successfully');
        } else {
          console.warn('⚠️ Could not extract path from image URL:', record.image_url);
        }
      } catch (error) {
        console.error('❌ Failed to create signed URL:', error);
        console.log('🔄 Falling back to original URL:', record.image_url);
        // Fall back to original URL
      }
    }

    return {
      id: record.id,
      userId: record.user_id,
      imageUri,
      scores: record.scores,
      identifiedParts: record.identified_parts,
      advice: record.advice,
      createdAt: record.created_at || new Date().toISOString(),
    }
  }

  async deletePhysiqueRecord(recordId: string): Promise<boolean> {
    return await supabaseDataStore.deletePhysiqueRecord(recordId)
  }

  // Current Scores Management - Now uses Supabase
  async getCurrentScores(): Promise<MuscleGroupScore> {
    return await supabaseDataStore.getCurrentScores()
  }

  async updateCurrentScores(newScores: MuscleGroupScore): Promise<void> {
    return await supabaseDataStore.updateCurrentScores(newScores)
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

  // Progress Data - Now uses Supabase analytics
  async getProgressData(userId: string): Promise<Array<{ date: string; score: number }>> {
    return await supabaseDataStore.getProgressData()
  }

  // Utility Methods - Now uses Supabase
  async clearAllData(): Promise<void> {
    return await supabaseDataStore.clearAllData()
  }

  async exportData(): Promise<string> {
    return await supabaseDataStore.exportData()
  }

  // Mock data seeding - Updated for Supabase
  async seedMockData(): Promise<void> {
    console.log('🌱 Seeding mock data in Supabase...')
    
    const user = await authService.getUser()
    if (!user) {
      console.error('❌ No authenticated user for seeding data')
      return
    }

         // Create mock physique records
     const mockRecords = [
       {
         user_id: user.id,
         image_url: 'https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Mock+Photo+1',
         scores: {
           "Chest": 75,
           "Biceps": 68,
           "Abs": 72,
           "Deltoids": 70,
           "Quadriceps": 65,
           "Triceps": 60,
         } as MuscleGroupScore,
         identified_parts: ["Chest", "Biceps", "Abs", "Deltoids", "Quadriceps", "Triceps"],
         advice: "Great progress on upper body development! Focus on increasing training intensity for triceps and quadriceps to achieve better overall balance.",
       },
       {
         user_id: user.id,
         image_url: 'https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Mock+Photo+2',
         scores: {
           "Chest": 78,
           "Biceps": 72,
           "Abs": 75,
           "Deltoids": 73,
           "Quadriceps": 68,
           "Triceps": 65,
           "Upper back": 70,
         } as MuscleGroupScore,
         identified_parts: ["Chest", "Biceps", "Abs", "Deltoids", "Quadriceps", "Triceps", "Upper back"],
         advice: "Excellent improvement across all muscle groups! Your consistency is paying off. Consider adding more posterior chain exercises.",
       },
       {
         user_id: user.id,
         image_url: 'https://via.placeholder.com/400x600/45B7D1/FFFFFF?text=Mock+Photo+3',
         scores: {
           "Chest": 80,
           "Biceps": 75,
           "Abs": 78,
           "Deltoids": 76,
           "Quadriceps": 72,
           "Triceps": 68,
           "Upper back": 73,
           "Calves": 60,
         } as MuscleGroupScore,
         identified_parts: ["Chest", "Biceps", "Abs", "Deltoids", "Quadriceps", "Triceps", "Upper back", "Calves"],
         advice: "Outstanding physique development! You're showing excellent muscle definition and symmetry. Consider adding calf-specific exercises to round out your development.",
       }
     ]

    try {
      for (let i = 0; i < mockRecords.length; i++) {
        const record = mockRecords[i]
        await supabaseDataStore.savePhysiqueRecord(record)
        console.log(`✅ Seeded mock record ${i + 1}/${mockRecords.length}`)
        
        // Add small delay between records
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      console.log('🎉 Mock data seeding completed successfully!')
    } catch (error) {
      console.error('❌ Error seeding mock data:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dataStore = new DataStore()

// Export the class for testing
export { DataStore };

