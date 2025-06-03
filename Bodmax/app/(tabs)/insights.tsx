import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import MuscleBodyGraph from '@/components/MuscleBodyGraph';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

// Mock user muscle group scores (0-100)
const muscleGroupScores = {
  chest: 85,
  deltoids: 78, // shoulders -> deltoids (proper muscle name)
  biceps: 89,
  triceps: 83,
  forearm: 75,
  abs: 68,
  'upper-back': 72,
  obliques: 74,
  quadriceps: 65,
  hamstring: 58,
  calves: 92,
  gluteal: 61,
};

// Function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4CD964'; // Green for strengths
  if (score >= 70) return '#FFD60A'; // Yellow for average
  return '#FF3B30'; // Red for areas to improve
};

// Function to get intensity based on score (1-3 scale for the body highlighter)
const getIntensity = (score: number): number => {
  if (score >= 80) return 3; // Highest intensity (green)
  if (score >= 70) return 2; // Medium intensity (yellow)
  return 1; // Lowest intensity (red)
};

// Convert muscle scores to body highlighter format
const convertToBodyHighlighter = (scores: typeof muscleGroupScores) => {
  return Object.entries(scores).map(([muscle, score]) => ({
    slug: muscle as any, // Cast to avoid TypeScript issues with specific slug types
    intensity: getIntensity(score),
  }));
};

// Quick Insight Card Component
const InsightCard = ({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) => (
  <View style={styles.insightCard}>
    <View style={[styles.insightIconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.insightContent}>
      <ThemedText style={styles.insightTitle}>{title}</ThemedText>
      <ThemedText style={styles.insightDescription}>{description}</ThemedText>
    </View>
  </View>
);

// Score Legend Component
const ScoreLegend = () => (
  <View style={styles.legendContainer}>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: '#4CD964' }]} />
      <ThemedText style={styles.legendText}>Strengths (80+)</ThemedText>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: '#FFD60A' }]} />
      <ThemedText style={styles.legendText}>Good (70-79)</ThemedText>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
      <ThemedText style={styles.legendText}>Focus Area (Below 70)</ThemedText>
    </View>
  </View>
);

// Muscle Group Grid Component
const MuscleGroupGrid = ({ scores }: { scores: typeof muscleGroupScores }) => (
  <View style={styles.muscleGridContainer}>
    {Object.entries(scores).map(([muscle, score]) => (
      <View key={muscle} style={styles.muscleGridItem}>
        <View style={[styles.muscleScoreCircle, { backgroundColor: getScoreColor(score) }]}>
          <ThemedText style={styles.muscleScoreNumber}>{score}</ThemedText>
        </View>
        <ThemedText style={styles.muscleName}>
          {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('-', ' ')}
        </ThemedText>
      </View>
    ))}
  </View>
);

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [bodyView, setBodyView] = useState<{ side: 'front' | 'back', gender: 'male' | 'female' }>({
    side: 'front',
    gender: 'male'
  });

  // Calculate overall insights
  const scores = Object.values(muscleGroupScores);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const strengths = Object.entries(muscleGroupScores).filter(([_, score]) => score >= 80);
  const focusAreas = Object.entries(muscleGroupScores).filter(([_, score]) => score < 70);

  const handleBodyPartPress = (slug: string, side?: 'left' | 'right') => {
    setSelectedMuscle(slug);
    console.log('Pressed muscle:', slug, side ? `(${side} side)` : '');
  };

  const toggleBodyView = () => {
    setBodyView(prev => ({ ...prev, side: prev.side === 'front' ? 'back' : 'front' }));
  };

  const toggleGender = () => {
    setBodyView(prev => ({ ...prev, gender: prev.gender === 'male' ? 'female' : 'male' }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Body Insights</ThemedText>
        
        {/* Overall Score */}
        <View style={styles.overallScoreContainer}>
          <LinearGradient
            colors={[accentColor, '#8b5cf6']}
            style={styles.scoreCircle}
          >
            <ThemedText style={styles.scoreText}>{averageScore}</ThemedText>
            <ThemedText style={styles.scoreLabel}>Overall</ThemedText>
          </LinearGradient>
        </View>

        {/* Body Diagram */}
        <View style={styles.diagramSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Physique Map</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Tap muscle groups to see details</ThemedText>
          
          {/* Body View Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleBodyView}>
              <Ionicons name="swap-horizontal" size={16} color="white" />
              <ThemedText style={styles.controlText}>{bodyView.side}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleGender}>
              <Ionicons name="person" size={16} color="white" />
              <ThemedText style={styles.controlText}>{bodyView.gender}</ThemedText>
            </TouchableOpacity>
          </View>

          <MuscleBodyGraph
            highlightedMuscles={convertToBodyHighlighter(muscleGroupScores)}
            gender={bodyView.gender}
            side={bodyView.side}
            onBodyPartPress={handleBodyPartPress}
            scale={1.4}
            colors={['#FF3B30', '#FFD60A', '#4CD964']}
            border="rgba(255,255,255,0.3)"
          />
          
          <ScoreLegend />
        </View>

        {/* Selected Muscle Info */}
        {selectedMuscle && (
          <View style={styles.selectedMuscleContainer}>
            <View style={styles.muscleHeader}>
              <ThemedText style={styles.muscleTitle}>
                {selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1).replace('-', ' ')}
              </ThemedText>
              <View style={[styles.muscleScore, { backgroundColor: getScoreColor(muscleGroupScores[selectedMuscle as keyof typeof muscleGroupScores] || 0) }]}>
                <ThemedText style={styles.muscleScoreText}>
                  {muscleGroupScores[selectedMuscle as keyof typeof muscleGroupScores] || 0}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.muscleAdvice}>
              {(() => {
                const score = muscleGroupScores[selectedMuscle as keyof typeof muscleGroupScores] || 0;
                if (score >= 80) return "Excellent development! Maintain with current routine.";
                if (score >= 70) return "Good progress. Consider increasing volume slightly.";
                return "Focus area. Increase training frequency and volume.";
              })()}
            </ThemedText>
          </View>
        )}

        {/* Muscle Group Scores */}
        <View style={styles.muscleScoresSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Muscle Group Scores</ThemedText>
          <MuscleGroupGrid scores={muscleGroupScores} />
        </View>

        {/* Quick Insights */}
        <View style={styles.quickInsightsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Insights</ThemedText>
          
          <InsightCard
            icon="trending-up"
            title={`${strengths.length} Strong Areas`}
            description={strengths.map(([name]) => name.replace('-', ' ')).join(', ')}
            color="#4CD964"
          />
          
          <InsightCard
            icon="fitness"
            title={`${focusAreas.length} Focus Areas`}
            description={focusAreas.map(([name]) => name.replace('-', ' ')).join(', ')}
            color="#FF3B30"
          />
          
          <InsightCard
            icon="analytics"
            title="AI Recommendation"
            description="Focus on leg development for balanced physique"
            color={accentColor}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: accentColor }]}>
          <LinearGradient
            colors={[accentColor, '#8b5cf6']}
            style={styles.buttonGradient}
          >
            <Ionicons name="rocket" size={20} color="white" style={{ marginRight: 8 }} />
            <ThemedText style={styles.buttonText}>Get Personalized Plan</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
    color: 'white',
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  diagramSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  selectedMuscleContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  muscleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  muscleScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  muscleScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  muscleAdvice: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  muscleScoresSection: {
    marginBottom: 24,
  },
  muscleGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  muscleGridItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  muscleScoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  muscleScoreNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  muscleName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  quickInsightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  insightDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 