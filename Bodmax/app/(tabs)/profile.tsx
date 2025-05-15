import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#4CD964'; // Green for high scores
  if (score >= 75) return '#73D945'; // Green-yellow
  if (score >= 65) return '#A0D636'; // Yellow-green
  if (score >= 55) return '#FFD60A'; // Yellow
  if (score >= 45) return '#FFA500'; // Orange
  if (score >= 35) return '#FF7643'; // Orange-red
  return '#FF3B30'; // Red for low scores
};

// Mock user data - converted to 100-based scale
const userData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  physique: {
    overall: 78,
    ratings: [
      { name: 'Chest', rating: 82 },
      { name: 'Legs', rating: 65 },
      { name: 'Shoulders', rating: 76 },
      { name: 'Biceps', rating: 84 },
      { name: 'Triceps', rating: 79 },
      { name: 'Back', rating: 73 },
    ],
    type: 'Toned',
    streak: 12,
  },
};

// Component for the rating bars
const RatingBar = ({ name, rating }: { name: string; rating: number }) => {
  const scoreColor = getScoreColor(rating);
  
  return (
    <View style={styles.ratingBarContainer}>
      <View style={styles.ratingBarHeader}>
        <ThemedText style={styles.ratingBarName}>{name}</ThemedText>
        <ThemedText style={[styles.ratingValue, { color: scoreColor }]}>{rating}</ThemedText>
      </View>
      <View style={styles.ratingBarBg}>
        <View 
          style={[
            styles.ratingBarFill, 
            { width: `${rating}%`, backgroundColor: scoreColor }
          ]} 
        />
      </View>
    </View>
  );
};

// Component for profile settings
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
  
  const [userPhysique] = useState(userData.physique);
  const overallScoreColor = getScoreColor(userPhysique.overall);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            // This would navigate to login screen in a real app
            Alert.alert("Logged Out", "You have been logged out successfully.");
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: "https://picsum.photos/seed/user123/300/300" }} 
            style={styles.profileImage}
            contentFit="cover"
          />
          <ThemedText type="title" style={styles.userName}>{userData.name}</ThemedText>
          <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
          
          <View style={styles.overallScoreContainer}>
            <View style={[styles.overallScoreCircle, { borderColor: overallScoreColor }]}>
              <ThemedText style={[styles.overallScoreText, { color: overallScoreColor }]}>
                {userPhysique.overall}
              </ThemedText>
            </View>
            <ThemedText style={styles.overallScoreLabel}>Overall Rating</ThemedText>
          </View>
        </View>
        
        <View style={styles.physiqueContainer}>
          <View style={styles.physiqueHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Physique Rating</ThemedText>
            <View style={[styles.physiqueTypeContainer, { backgroundColor: `${overallScoreColor}20` }]}>
              <ThemedText style={[styles.physiqueTypeText, { color: overallScoreColor }]}>{userPhysique.type}</ThemedText>
            </View>
          </View>
          
          <View style={styles.ratingsContainer}>
            {userPhysique.ratings.map((item, index) => (
              <RatingBar key={index} name={item.name} rating={item.rating} />
            ))}
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
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 20,
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  overallScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overallScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  overallScoreLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  physiqueContainer: {
    marginBottom: 24,
  },
  physiqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  physiqueTypeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  physiqueTypeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  ratingBarContainer: {
    marginBottom: 12,
  },
  ratingBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingBarName: {
    fontWeight: 'bold',
  },
  ratingValue: {
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
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingsText: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    fontWeight: 'bold',
  },
}); 