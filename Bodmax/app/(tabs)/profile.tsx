import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/AuthContext';
import { MuscleGroupScore } from '@/lib/database.types';
import { supabaseDataStore } from '@/lib/supabaseDataStore';

const getScoreColor = (score: number): string => {
  if (score === 0) return '#666666'; // Gray for no data
  if (score >= 90) return '#4CE05C'; // Bright Green (90-100)
  if (score >= 80) return '#AEEA00'; // Muted Green-Yellow (80-90)
  if (score >= 70) return '#FFEB3B'; // Yellow (70-80)
  if (score >= 60) return '#FF9800'; // Yellow-Orange (60-70)
  return '#F44336'; // Red (below 60)
};

const RatingBar = ({ name, rating }: { name: string; rating: number }) => {
  const scoreColor = getScoreColor(rating);
  
  return (
    <View style={styles.ratingBarContainer}>
      <View style={styles.ratingBarHeader}>
        <ThemedText style={styles.ratingBarName}>{name}</ThemedText>
        <ThemedText style={[styles.ratingValue, { color: scoreColor }]}>{rating || 0}</ThemedText>
      </View>
      <View style={styles.ratingBarBg}>
        <View 
          style={[
            styles.ratingBarFill, 
            { width: `${rating || 0}%`, backgroundColor: scoreColor }
          ]} 
        />
      </View>
    </View>
  );
};

const SettingsItem = ({ icon, text, onPress }: { icon?: string; text: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      {icon && <ThemedText style={styles.settingsIcon}>{icon}</ThemedText>}
      <ThemedText style={styles.settingsText}>{text}</ThemedText>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  const insets = useSafeAreaInsets();
  
  const { profile, signOut } = useAuth();
  const [bestScores, setBestScores] = useState<MuscleGroupScore>({});
  const [loading, setLoading] = useState(true);

  // Calculate overall score from best scores
  const calculateOverallScore = (scores: MuscleGroupScore): number => {
    const validScores = Object.values(scores).filter(score => score > 0);
    if (validScores.length === 0) return 0;
    
    // Use weighted average with emphasis on major muscle groups
    const weights = {
      'Trapezius': 1.0,
      'Triceps': 1.0,
      'Forearm': 0.7,
      'Calves': 0.8,
      'Deltoids': 1.1,
      'Chest': 1.2,
      'Biceps': 1.0,
      'Abs': 1.3,
      'Quadriceps': 1.2,
      'Upper back': 1.1,
      'Lower back': 1.0,
      'Hamstring': 1.0,
      'Gluteal': 1.0,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([muscle, score]) => {
      if (score > 0) {
        const weight = weights[muscle as keyof typeof weights] || 1.0;
        totalWeightedScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  };

  // Convert muscle group names to display names
  const getDisplayName = (muscleGroup: string): string => {
    const nameMap: { [key: string]: string } = {
      'Deltoids': 'Shoulders',
      'Upper back': 'Back',
      'Lower back': 'Lower Back',
      'Quadriceps': 'Legs',
      'Gluteal': 'Glutes',
    };
    return nameMap[muscleGroup] || muscleGroup;
  };

  // Get display physique type based on overall score
  const getPhysiqueType = (score: number): string => {
    if (score >= 85) return 'Elite';
    if (score >= 75) return 'Advanced';
    if (score >= 65) return 'Intermediate';
    if (score >= 50) return 'Beginner';
    return 'Starting';
  };

  // Load best scores from Supabase
  useFocusEffect(
    useCallback(() => {
      console.log('👤 Profile screen focused, loading data...');
      
      const loadBestScores = async () => {
        try {
          console.log('👤 Starting profile data load...');
          setLoading(true);
          
          // Add timeout wrapper
          const timeoutPromise = (promise: Promise<any>, name: string, timeoutMs = 10000) => {
            return Promise.race([
              promise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
              )
            ]);
          };
          
          console.log('👤 Loading best scores...');
          const scores = await timeoutPromise(
            supabaseDataStore.getBestScores(),
            'getBestScores',
            10000
          );
          setBestScores(scores);
          console.log('✅ Profile data loading completed successfully!');
        } catch (error) {
          console.error('❌ Failed to load best scores:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
            name: error instanceof Error ? error.name : 'Unknown'
          });
          
          // Set fallback data to prevent infinite loading
          setBestScores({});
        } finally {
          setLoading(false);
        }
      };
      
      loadBestScores();
    }, []) // Empty deps - always run fresh when focused
  );

  const overallScore = calculateOverallScore(bestScores);
  const overallScoreColor = getScoreColor(overallScore);
  const physiqueType = getPhysiqueType(overallScore);

  // Filter and sort muscle groups for display (show only those with scores > 0)
  const displayedMuscleGroups = Object.entries(bestScores)
    .filter(([_, score]) => score > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6); // Show top 6 muscle groups

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleShareProfile = () => {
    Alert.alert("Share Profile", "This feature would allow you to share your physique ratings with others.");
  };

  const handleSettings = () => {
    Alert.alert("Settings", "This would open app settings.");
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 20, paddingHorizontal: 24 }]}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading your all-time highs...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {
      paddingTop: insets.top + 20,
      paddingHorizontal: 24,
    }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: insets.bottom + 100,
        }]}
      >
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: "https://example.com/profile.jpg" }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <ThemedText type="title" style={styles.userName}>
            {profile?.email?.split('@')[0] || 'User'}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{profile?.email || 'No email'}</ThemedText>
          
          <View style={styles.overallScoreContainer}>
            <View style={[styles.overallScoreCircle, { borderColor: overallScoreColor }]}>
              <ThemedText style={[styles.overallScoreText, { color: overallScoreColor }]}>
                {overallScore}
              </ThemedText>
            </View>
            <ThemedText style={styles.overallScoreLabel}>Overall Rating</ThemedText>
            <ThemedText style={styles.allTimeHighLabel}>All Time High</ThemedText>
          </View>
        </View>
        
        <View style={styles.physiqueContainer}>
          <View style={styles.physiqueHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>All Time Highs</ThemedText>
            <View style={[styles.physiqueTypeContainer, { backgroundColor: `${overallScoreColor}20` }]}>
              <ThemedText style={[styles.physiqueTypeText, { color: overallScoreColor }]}>
                {physiqueType}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.ratingsContainer}>
            {displayedMuscleGroups.length > 0 ? (
              displayedMuscleGroups.map(([muscleGroup, score], index) => (
                <RatingBar 
                  key={index} 
                  name={getDisplayName(muscleGroup)} 
                  rating={score} 
                />
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <ThemedText style={styles.noDataText}>
                  No physique data yet. Take your first photo to see your all-time highs!
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.settingsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>
          
          <SettingsItem 
            text="Share Profile" 
            onPress={handleShareProfile}
          />
          
          <SettingsItem 
            text="Settings & Privacy" 
            onPress={handleSettings}
          />
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  overallScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  overallScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overallScoreLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  allTimeHighLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  physiqueContainer: {
    marginBottom: 32,
  },
  physiqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  physiqueTypeContainer: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  physiqueTypeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
  },
  ratingBarContainer: {
    marginBottom: 16,
  },
  ratingBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingBarName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
  },
  settingsContainer: {
    marginBottom: 32,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 20,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingsText: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 