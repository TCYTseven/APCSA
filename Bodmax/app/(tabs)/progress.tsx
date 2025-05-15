import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock data for progress chart
const mockData = [
  { date: 'Jan 15', score: 7.2 },
  { date: 'Feb 3', score: 7.4 },
  { date: 'Feb 24', score: 7.8 },
  { date: 'Mar 12', score: 8.0 },
  { date: 'Apr 5', score: 8.3 },
];

const ProgressBar = ({ title, value, color }: { title: string; value: number; color: string }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressLabelContainer}>
        <ThemedText style={styles.progressLabel}>{title}</ThemedText>
        <ThemedText style={styles.progressValue}>{value.toFixed(1)}/10</ThemedText>
      </View>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${value * 10}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  
  // Calculate recent improvement
  const latestScore = mockData[mockData.length - 1].score;
  const previousScore = mockData[mockData.length - 2].score;
  const improvement = latestScore - previousScore;
  const streakCount = 12; // Mock data

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Progress Tracker</ThemedText>
        
        {/* Current Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{latestScore.toFixed(1)}</ThemedText>
            <ThemedText style={styles.statLabel}>Current Score</ThemedText>
          </View>
          
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <ThemedText style={styles.fireIcon}>🔥</ThemedText>
              <ThemedText style={styles.streakValue}>{streakCount}</ThemedText>
            </View>
            <ThemedText style={styles.streakLabel}>Day Streak</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, improvement > 0 ? styles.positiveChange : styles.negativeChange]}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Recent Change</ThemedText>
          </View>
        </View>

        {/* Progress Chart Section - Simple visualization */}
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Progress Chart</ThemedText>
          <View style={styles.chartContent}>
            {mockData.map((point, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.chartBarFill, 
                    { height: `${point.score * 10}%`, backgroundColor: accentColor }
                  ]} 
                />
                <ThemedText style={styles.chartLabel}>{point.date}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Body Areas Section */}
        <View style={styles.bodyAreasContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Body Areas</ThemedText>
          <ProgressBar title="Chest" value={8.5} color="#9C47FF" />
          <ProgressBar title="Legs" value={7.2} color="#9C47FF" />
          <ProgressBar title="Shoulders" value={8.7} color="#9C47FF" />
          <ProgressBar title="Biceps" value={8.9} color="#9C47FF" />
          <ProgressBar title="Triceps" value={8.3} color="#9C47FF" />
          <ProgressBar title="Back" value={7.8} color="#9C47FF" />
        </View>

        {/* Compare Button */}
        <TouchableOpacity 
          style={[styles.compareButton, { backgroundColor: accentColor }]}
          onPress={() => {/* Compare functionality would go here */}}>
          <ThemedText style={styles.compareButtonText}>Compare Before/After</ThemedText>
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
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  streakCard: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  streakIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  fireIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  positiveChange: {
    color: '#4CD964',
  },
  negativeChange: {
    color: '#FF3B30',
  },
  chartContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartContent: {
    height: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  chartBar: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartBarFill: {
    width: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  bodyAreasContainer: {
    marginBottom: 24,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressBackground: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  compareButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  compareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 