import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock user data
const userData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  physique: {
    overall: 8.4,
    ratings: [
      { name: 'Chest', rating: 8.5 },
      { name: 'Legs', rating: 7.2 },
      { name: 'Shoulders', rating: 8.7 },
      { name: 'Biceps', rating: 8.9 },
      { name: 'Triceps', rating: 8.3 },
      { name: 'Back', rating: 7.8 },
    ],
    type: 'Toned',
    streak: 12,
  },
};

// Component for the rating bars
const RatingBar = ({ name, rating }: { name: string; rating: number }) => {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  
  return (
    <View style={styles.ratingBarContainer}>
      <View style={styles.ratingBarHeader}>
        <ThemedText style={styles.ratingBarName}>{name}</ThemedText>
        <ThemedText style={styles.ratingValue}>{rating.toFixed(1)}</ThemedText>
      </View>
      <View style={styles.ratingBarBg}>
        <View 
          style={[
            styles.ratingBarFill, 
            { width: `${rating * 10}%`, backgroundColor: accentColor }
          ]} 
        />
      </View>
    </View>
  );
};

// Component for profile settings
const SettingsItem = ({ icon, text, onPress }: { icon: string; text: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <ThemedText style={styles.settingsIcon}>{icon}</ThemedText>
      <ThemedText style={styles.settingsText}>{text}</ThemedText>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  
  const [userPhysique] = useState(userData.physique);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // Delete account logic would go here
            Alert.alert("Account Deleted", "Your account has been deleted successfully.");
            // This would navigate to login screen in a real app
          }
        }
      ]
    );
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
            <View style={[styles.overallScoreCircle, { borderColor: accentColor }]}>
              <ThemedText style={[styles.overallScoreText, { color: accentColor }]}>
                {userPhysique.overall.toFixed(1)}
              </ThemedText>
            </View>
            <ThemedText style={styles.overallScoreLabel}>Overall Rating</ThemedText>
          </View>
        </View>
        
        <View style={styles.physiqueContainer}>
          <View style={styles.physiqueHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Physique Rating</ThemedText>
            <View style={styles.physiqueTypeContainer}>
              <ThemedText style={styles.physiqueTypeText}>{userPhysique.type}</ThemedText>
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
            icon="🔄" 
            text="Share Profile" 
            onPress={handleShareProfile}
          />
          
          <SettingsItem 
            icon="⚙️" 
            text="Settings & Privacy" 
            onPress={handleSettings}
          />
          
          <SettingsItem 
            icon="🚪" 
            text="Logout" 
            onPress={handleLogout}
          />
          
          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <ThemedText style={styles.deleteAccountText}>Delete Account</ThemedText>
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
    backgroundColor: 'rgba(156, 71, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  physiqueTypeText: {
    color: '#9C47FF',
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
    opacity: 0.7,
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
  deleteAccountButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteAccountText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
}); 