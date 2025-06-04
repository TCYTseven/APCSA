import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RESPONSIVE_DIMENSIONS, getSpacingScale, getTypographyScale } from '@/lib/responsive';

const { width, height } = Dimensions.get('window');
const typography = getTypographyScale();
const spacing = getSpacingScale();

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#4CD964'; 
  if (score >= 75) return '#73D945'; 
  if (score >= 65) return '#A0D636'; 
  if (score >= 55) return '#FFD60A'; 
  if (score >= 45) return '#FFA500'; 
  if (score >= 35) return '#FF7643'; 
  return '#FF3B30'; 
};


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
    <ThemedView style={[styles.container, {
      paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10,
      paddingHorizontal: RESPONSIVE_DIMENSIONS.screenPadding,
    }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 100 : 100,
        }]}
      >
        <View style={[styles.profileHeader, {
          marginTop: Math.max(20, height * 0.025),
          marginBottom: spacing.lg,
        }]}>
          <Image 
            source={{ uri: "https://example.com/profile.jpg" }}
            style={[styles.profileImage, {
              width: Math.min(100, width * 0.25),
              height: Math.min(100, width * 0.25),
              borderRadius: Math.min(50, width * 0.125),
            }]}
            contentFit="cover"
          />
          <ThemedText type="title" style={[styles.userName, {
            fontSize: typography.h2,
            marginBottom: spacing.xs,
          }]}>{userData.name}</ThemedText>
          <ThemedText style={[styles.userEmail, {
            fontSize: typography.body,
            marginBottom: spacing.md,
          }]}>{userData.email}</ThemedText>
          
          <View style={styles.overallScoreContainer}>
            <View style={[styles.overallScoreCircle, { 
              borderColor: overallScoreColor,
              width: Math.min(60, width * 0.15),
              height: Math.min(60, width * 0.15),
              borderRadius: Math.min(30, width * 0.075),
            }]}>
              <ThemedText style={[styles.overallScoreText, { 
                color: overallScoreColor,
                fontSize: typography.h3,
              }]}>
                {userPhysique.overall}
              </ThemedText>
            </View>
            <ThemedText style={[styles.overallScoreLabel, {
              fontSize: typography.caption,
            }]}>Overall Rating</ThemedText>
          </View>
        </View>
        
        <View style={[styles.physiqueContainer, {
          marginBottom: spacing.lg,
        }]}>
          <View style={[styles.physiqueHeader, {
            marginBottom: spacing.md,
          }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, {
              fontSize: typography.h3,
            }]}>Physique Rating</ThemedText>
            <View style={[styles.physiqueTypeContainer, { 
              backgroundColor: `${overallScoreColor}20`,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            }]}>
              <ThemedText style={[styles.physiqueTypeText, { 
                color: overallScoreColor,
                fontSize: typography.caption,
              }]}>{userPhysique.type}</ThemedText>
            </View>
          </View>
          
          <View style={styles.ratingsContainer}>
            {userPhysique.ratings.map((item, index) => (
              <RatingBar key={index} name={item.name} rating={item.rating} />
            ))}
          </View>
        </View>
        
        <View style={styles.settingsContainer}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, {
            fontSize: typography.h3,
            marginBottom: spacing.md,
          }]}>Account</ThemedText>
          
          <SettingsItem 
            text="Share Profile" 
            onPress={handleShareProfile}
          />
          
          <SettingsItem 
            text="Settings & Privacy" 
            onPress={handleSettings}
          />
          
          <TouchableOpacity style={[styles.logoutButton, {
            paddingVertical: RESPONSIVE_DIMENSIONS.buttonHeight * 0.3,
            marginTop: spacing.lg,
          }]} onPress={handleLogout}>
            <ThemedText style={[styles.logoutButtonText, {
              fontSize: typography.body,
            }]}>Log Out</ThemedText>
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
    // Responsive padding is added dynamically
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImage: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
  },
  userEmail: {
    opacity: 0.7,
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  overallScoreCircle: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overallScoreText: {
    fontWeight: 'bold',
  },
  overallScoreLabel: {
    opacity: 0.7,
  },
  sectionTitle: {
    // fontSize is now applied dynamically
  },
  physiqueContainer: {
    // marginBottom is now applied dynamically
  },
  physiqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom is now applied dynamically
  },
  physiqueTypeContainer: {
    borderRadius: 16,
    // padding is now applied dynamically
  },
  physiqueTypeText: {
    fontWeight: 'bold',
    // fontSize is now applied dynamically
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
    // marginBottom is now applied dynamically
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    // marginTop and paddingVertical are now applied dynamically
  },
  logoutButtonText: {
    fontWeight: 'bold',
    // fontSize is now applied dynamically
  },
}); 