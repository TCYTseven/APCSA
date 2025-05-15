import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

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

// Mock data for progress chart - converted to 100-based scale
const mockData = [
  { date: 'Jan 15', score: 72 },
  { date: 'Feb 3', score: 74 },
  { date: 'Feb 24', score: 78 },
  { date: 'Mar 12', score: 80 },
  { date: 'Apr 5', score: 83 },
  { date: 'Apr 20', score: 79 },
  { date: 'May 8', score: 85 },
];

const ProgressBar = ({ title, value }: { title: string; value: number }) => {
  const scoreColor = getScoreColor(value);
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressLabelContainer}>
        <ThemedText style={styles.progressLabel}>{title}</ThemedText>
        <ThemedText style={[styles.progressValue, { color: scoreColor }]}>{value}/100</ThemedText>
      </View>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${value}%`, backgroundColor: scoreColor }
          ]} 
        />
      </View>
    </View>
  );
};

// LineChart component
const LineChart = ({ data }: { data: Array<{ date: string; score: number }> }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 64; // Accounting for container padding
  const chartHeight = 180;
  const paddingBottom = 30; // Space for date labels
  
  // Calculate x positions for each data point
  const pointGap = chartWidth / (data.length - 1);
  
  // Calculate data points
  const points = data.map((item, index) => ({
    x: index * pointGap,
    y: chartHeight - (item.score / 100) * (chartHeight - paddingBottom),
    score: item.score,
    date: item.date,
    // Determine if score increased or decreased from previous
    direction: index > 0 ? (item.score > data[index - 1].score ? 'up' : 
                           (item.score < data[index - 1].score ? 'down' : 'same')) : 'same'
  }));

  return (
    <View style={styles.chartWrapper}>
      <Svg height={chartHeight} width={chartWidth}>
        {/* Connect points with white lines */}
        {points.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = points[index - 1];
          return (
            <Line
              key={`line-${index}`}
              x1={prevPoint.x}
              y1={prevPoint.y}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Draw points (red for decrease, green for increase) */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={point.direction === 'down' ? '#FF3B30' : 
                 point.direction === 'up' ? '#4CD964' : '#FFFFFF'}
          />
        ))}
      </Svg>
      
      {/* Date labels */}
      <View style={styles.dateLabelsContainer}>
        {points.map((point, index) => (
          <ThemedText key={`date-${index}`} style={[styles.dateLabel, { left: point.x - 20 }]}>
            {point.date}
          </ThemedText>
        ))}
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
  
  const latestScoreColor = getScoreColor(latestScore);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Progress Tracker</ThemedText>
        
        {/* Current Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: latestScoreColor }]}>{latestScore}</ThemedText>
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
              {improvement > 0 ? '+' : ''}{improvement}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Recent Change</ThemedText>
          </View>
        </View>

        {/* Progress Chart Section - Line chart */}
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Progress Chart</ThemedText>
          <LineChart data={mockData} />
        </View>

        {/* Body Areas Section */}
        <View style={styles.bodyAreasContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Body Areas</ThemedText>
          <ProgressBar title="Chest" value={85} />
          <ProgressBar title="Legs" value={72} />
          <ProgressBar title="Shoulders" value={87} />
          <ProgressBar title="Biceps" value={89} />
          <ProgressBar title="Triceps" value={83} />
          <ProgressBar title="Back" value={78} />
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartWrapper: {
    height: 210,
    alignItems: 'center',
  },
  dateLabelsContainer: {
    position: 'relative',
    width: '100%',
    height: 20,
  },
  dateLabel: {
    position: 'absolute',
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
    width: 40,
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
    fontWeight: '600',
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