import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for user data
export interface UserProfile {
  id: string;
  email: string;
  gender: 'male' | 'female';
  height: number; // in inches
  weight: number; // in pounds
  desiredPhysique: string;
  createdAt: string;
  updatedAt: string;
}

export interface MuscleGroupScore {
  [muscleGroup: string]: number;
}

export interface PhysiqueRecord {
  id: string;
  userId: string;
  imageUri: string;
  scores: MuscleGroupScore;
  identifiedParts: string[];
  advice: string;
  createdAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  PHYSIQUE_RECORDS: 'physique_records',
  CURRENT_SCORES: 'current_scores',
} as const;

class DataStore {
  // User Profile Management
  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      ...profile,
      id: 'user_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    return userProfile;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<UserProfile | null> {
    const currentProfile = await this.getUserProfile();
    if (!currentProfile) {
      throw new Error('No user profile found to update');
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  // Physique Records Management
  async savePhysiqueRecord(record: Omit<PhysiqueRecord, 'id' | 'createdAt'>): Promise<PhysiqueRecord> {
    const newRecord: PhysiqueRecord = {
      ...record,
      id: 'record_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Get existing records
    const existingRecords = await this.getPhysiqueRecords(record.userId);
    const updatedRecords = [...existingRecords, newRecord];

    // Save updated records
    await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_RECORDS, JSON.stringify(updatedRecords));

    // Update current scores
    await this.updateCurrentScores(record.scores);

    return newRecord;
  }

  async getPhysiqueRecords(userId: string): Promise<PhysiqueRecord[]> {
    try {
      const recordsData = await AsyncStorage.getItem(STORAGE_KEYS.PHYSIQUE_RECORDS);
      const allRecords: PhysiqueRecord[] = recordsData ? JSON.parse(recordsData) : [];
      
      // Filter records for the specific user
      return allRecords.filter(record => record.userId === userId);
    } catch (error) {
      console.error('Error getting physique records:', error);
      return [];
    }
  }

  async getLatestPhysiqueRecord(userId: string): Promise<PhysiqueRecord | null> {
    const records = await this.getPhysiqueRecords(userId);
    if (records.length === 0) return null;

    // Sort by creation date and return the most recent
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  async deletePhysiqueRecord(recordId: string): Promise<boolean> {
    try {
      const recordsData = await AsyncStorage.getItem(STORAGE_KEYS.PHYSIQUE_RECORDS);
      if (!recordsData) return false;
      
      const allRecords: PhysiqueRecord[] = JSON.parse(recordsData);
      const recordIndex = allRecords.findIndex(record => record.id === recordId);
      
      if (recordIndex === -1) return false;
      
      // Remove the record
      allRecords.splice(recordIndex, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_RECORDS, JSON.stringify(allRecords));
      
      console.log('🗑️ Deleted physique record:', recordId);
      return true;
    } catch (error) {
      console.error('Error deleting physique record:', error);
      return false;
    }
  }

  // Current Scores Management
  async getCurrentScores(): Promise<MuscleGroupScore> {
    try {
      const userProfile = await this.getUserProfile();
      if (!userProfile) {
        return this.getDefaultScores();
      }
      
      const userScoresKey = `${STORAGE_KEYS.CURRENT_SCORES}_${userProfile.id}`;
      const scoresData = await AsyncStorage.getItem(userScoresKey);
      return scoresData ? JSON.parse(scoresData) : this.getDefaultScores();
    } catch (error) {
      console.error('Error getting current scores:', error);
      return this.getDefaultScores();
    }
  }

  async updateCurrentScores(newScores: MuscleGroupScore): Promise<void> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) {
      console.error('No user profile found, cannot update scores');
      return;
    }

    // Get existing scores first
    const currentScores = await this.getCurrentScores();
    
    // Merge new scores with existing scores (only update recognized muscle groups)
    const updatedScores = { ...currentScores };
    Object.entries(newScores).forEach(([muscle, score]) => {
      if (score > 0) { // Only update if score is positive (recognized by AI)
        updatedScores[muscle] = score;
      }
    });
    
    console.log('📊 Updating scores - Previous:', currentScores);
    console.log('📊 Updating scores - New:', newScores);
    console.log('📊 Updating scores - Final:', updatedScores);
    
    const userScoresKey = `${STORAGE_KEYS.CURRENT_SCORES}_${userProfile.id}`;
    await AsyncStorage.setItem(userScoresKey, JSON.stringify(updatedScores));
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
    };
  }

  // Progress Calculation
  async getProgressData(userId: string): Promise<Array<{ date: string; score: number }>> {
    const records = await this.getPhysiqueRecords(userId);
    
    return records.map(record => {
      // Calculate average score across all muscle groups
      const scores = Object.values(record.scores);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      return {
        date: new Date(record.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        score: Math.round(averageScore),
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    const userProfile = await this.getUserProfile();
    const keysToRemove: string[] = [
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.PHYSIQUE_RECORDS,
      STORAGE_KEYS.CURRENT_SCORES,
    ];
    
    // Also remove user-specific scores if user exists
    if (userProfile) {
      keysToRemove.push(`${STORAGE_KEYS.CURRENT_SCORES}_${userProfile.id}`);
    }
    
    await AsyncStorage.multiRemove(keysToRemove);
  }

  async exportData(): Promise<string> {
    const profile = await this.getUserProfile();
    const records = profile ? await this.getPhysiqueRecords(profile.id) : [];
    const scores = await this.getCurrentScores();

    return JSON.stringify({
      profile,
      records,
      scores,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  // Development/Testing helpers
  async seedMockData(): Promise<void> {
    // Create mock user profile
    const mockProfile: UserProfile = {
      id: 'user_mock',
      email: 'test@example.com',
      gender: 'male',
      height: 68,
      weight: 165,
      desiredPhysique: 'bodybuilder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(mockProfile));

    // Create mock physique records
    const mockRecords: PhysiqueRecord[] = [
      {
        id: 'record_1',
        userId: 'user_mock',
        imageUri: 'mock_image_1',
        scores: {
          "Deltoids": 70,
          "Chest": 75,
          "Biceps": 71,
          "Abs": 74,
          "Quadriceps": 69,
          "Forearm": 65,
        },
        identifiedParts: ["Deltoids", "Chest", "Biceps", "Abs", "Quadriceps", "Forearm"],
        advice: "Great progress! Focus on triceps development.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        id: 'record_2',
        userId: 'user_mock',
        imageUri: 'mock_image_2',
        scores: {
          "Deltoids": 73,
          "Chest": 78,
          "Biceps": 74,
          "Triceps": 71,
          "Abs": 76,
          "Quadriceps": 72,
          "Upper back": 70,
          "Trapezius": 75,
        },
        identifiedParts: ["Deltoids", "Chest", "Biceps", "Triceps", "Abs", "Quadriceps", "Upper back", "Trapezius"],
        advice: "Excellent improvement! Keep up the consistent training.",
        createdAt: new Date().toISOString(),
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.PHYSIQUE_RECORDS, JSON.stringify(mockRecords));
    await this.updateCurrentScores(mockRecords[mockRecords.length - 1].scores);
  }
}

// Export singleton instance
export const dataStore = new DataStore();
export default DataStore; 