import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock data for insights
const insights = [
  {
    title: "Shoulders Development",
    description: "Your shoulders are well-developed. Continue focusing on lateral raises to maintain the balance between front and rear deltoids.",
    icon: "💪",
  },
  {
    title: "Leg Symmetry",
    description: "There's a slight imbalance in your quadriceps development. Consider adding more unilateral exercises like single-leg extensions.",
    icon: "🦵",
  },
  {
    title: "Core Strength",
    description: "Your core could use more definition. Try adding more progressive overload to your ab workouts with weighted exercises.",
    icon: "⚡",
  }
];

const FocusArea = ({ title, description }: { title: string; description: string }) => {
  return (
    <View style={styles.focusAreaContainer}>
      <View style={styles.focusAreaHeader}>
        <ThemedText style={styles.focusAreaTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.focusAreaDescription}>{description}</ThemedText>
    </View>
  );
};

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Body Insights</ThemedText>
        
        {/* Latest Analysis Summary */}
        <View style={styles.summaryContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Latest Analysis</ThemedText>
          <View style={styles.analysisContainer}>
            <ThemedText style={styles.analysisSummary}>
              Your physique is well-balanced with good symmetry. There's potential for further improvement in lower body development.
            </ThemedText>
          </View>
        </View>
        
        {/* AI Insights */}
        <View style={styles.insightsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>AI Coach Insights</ThemedText>
          
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <ThemedText style={styles.insightIcon}>{insight.icon}</ThemedText>
              </View>
              <View style={styles.insightContent}>
                <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
                <ThemedText style={styles.insightDescription}>{insight.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>
        
        {/* Focus Areas */}
        <View style={styles.focusContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recommended Focus Areas</ThemedText>
          
          <FocusArea 
            title="Leg Training" 
            description="Increase quad and hamstring development with higher volume training. Focus on compound movements like squats and Romanian deadlifts to stimulate growth."
          />
          
          <FocusArea 
            title="Back Width" 
            description="Focus on increasing overall back width with pull-ups and wide-grip rows. Add in progressive overload by increasing volume or weight each week."
          />
          
          <FocusArea 
            title="Arms Proportion" 
            description="Develop triceps further to balance arm proportion. Include exercises like close-grip bench press, dips, and overhead extensions for complete triceps development."
          />
        </View>
        
        {/* Get Personalized Plan */}
        <TouchableOpacity 
          style={[styles.planButton, { backgroundColor: accentColor }]}
          onPress={() => {/* Plan functionality would go here */}}>
          <ThemedText style={styles.planButtonText}>Get Personalized Workout Plan</ThemedText>
        </TouchableOpacity>
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
    paddingBottom: 90,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  analysisContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  analysisSummary: {
    lineHeight: 20,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 71, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightIcon: {
    fontSize: 18,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    lineHeight: 20,
    opacity: 0.8,
  },
  focusContainer: {
    marginBottom: 24,
  },
  focusAreaContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  focusAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  focusAreaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  focusAreaDescription: {
    lineHeight: 20,
    opacity: 0.8,
  },
  planButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  planButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 