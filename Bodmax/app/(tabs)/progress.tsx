import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Image, LayoutChangeEvent, Modal, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

// Mock scan data for calendar
type ScanDay = { date: string; image: string; score: number };
type ScanWithChange = ScanDay & { change: { text: string; color: string }; prevDate: string | null };
const scanData: ScanDay[] = [
  { date: '2024-06-01', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAGkZ6b3g6Qk_OTDYakHzBPaxE3x6YbD4xlA&s', score: 72 },
  { date: '2024-06-03', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAGkZ6b3g6Qk_OTDYakHzBPaxE3x6YbD4xlA&s', score: 74 },
  { date: '2024-06-07', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAGkZ6b3g6Qk_OTDYakHzBPaxE3x6YbD4xlA&s', score: 78 },
  { date: '2024-06-10', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAGkZ6b3g6Qk_OTDYakHzBPaxE3x6YbD4xlA&s', score: 80 },
];

function getScoreChange(currentScore: number, previousScore: number): { text: string; color: string } {
  const diff = currentScore - previousScore;
  if (diff > 0) return { text: `Your score has improved by ${diff} since last scan!`, color: '#4CD964' };
  if (diff < 0) return { text: `Your score has decreased by ${Math.abs(diff)} since last scan!`, color: '#FF3B30' };
  return { text: 'Your score is unchanged since last scan!', color: '#aaa' };
}

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

// Simple Calendar UI (for demo, not a full calendar)
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const Calendar = ({ scanDays, onDayPress }: { scanDays: ScanDay[]; onDayPress: (day: number) => void }) => {
  // Month navigation state
  const [month, setMonth] = useState(5); // 0-indexed, 5 = June
  const [year, setYear] = useState(2024);

  // For demo, only June 2024 has data
  const daysInMonth = 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const scanDates = scanDays
    .filter((d: ScanDay) => {
      const [y, m] = d.date.split('-');
      return parseInt(y) === year && parseInt(m) === month + 1;
    })
    .map((d: ScanDay) => parseInt(d.date.split('-')[2]));

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarArrow}>
          <RNText style={styles.calendarArrowText}>{'<'}</RNText>
        </TouchableOpacity>
        <RNText style={styles.calendarTitle}>{monthNames[month]} {year}</RNText>
        <TouchableOpacity onPress={handleNextMonth} style={styles.calendarArrow}>
          <RNText style={styles.calendarArrowText}>{'>'}</RNText>
        </TouchableOpacity>
      </View>
      
      {/* Day Headers */}
      <View style={styles.dayHeadersContainer}>
        {dayHeaders.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <RNText style={styles.dayHeaderText}>{day}</RNText>
          </View>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {days.map((day: number) => {
          const isScan = scanDates.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.calendarDayRect, isScan && styles.calendarDayRectScan]}
              onPress={() => isScan && onDayPress(day)}
              disabled={!isScan}
            >
              <RNText style={[styles.calendarDayTextRect, isScan && styles.calendarDayTextRectScan]}>{day}</RNText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Confetti/Explosion implementation (adapted from provided code)
const initialTopPosition = 0.5;
const explosionVelocity = 500;
const fallingSpeed = 4000;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const confettieColors = [
  '#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F', '#FF5733', '#FFC300', '#581845', '#33FF57', '#3375FF', '#F033FF',
];
const getRandomValue = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomColor = (colors: string[]) => colors[Math.floor(getRandomValue(0, colors.length))];

const Confetti = ({ contentTransform, transform, opacity, color }: any) => {
  const confettiWidth = getRandomValue(8, 16);
  const confettiHeight = getRandomValue(6, 12);
  const isConfettiRounded = Math.round(getRandomValue(0, 1)) === 1;
  const containerStyle = { transform: contentTransform };
  const confettiStyle = {
    width: confettiWidth,
    height: confettiHeight,
    backgroundColor: color,
    transform,
    opacity,
  };
  return (
    <Animated.View style={[confettiStyles.confetti, containerStyle]} pointerEvents="none">
      <Animated.View style={[isConfettiRounded && confettiStyles.rounded, confettiStyle]} />
    </Animated.View>
  );
};

const Explosion = React.forwardRef(({ count, origin, explosionSpeed = explosionVelocity, fallSpeed = fallingSpeed, colors = confettieColors, fadeOut }: any, ref) => {
  const [confettiItems, setConfettiItems] = useState<any[]>([]);
  const animationValue = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    animationValue.setValue(0);
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: explosionSpeed,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 2,
        duration: fallSpeed,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const stopAnimation = () => {
    animationValue.stopAnimation();
  };

  React.useImperativeHandle(ref, () => ({
    start: startAnimation,
    stop: stopAnimation,
  }));

  React.useEffect(() => {
    const newConfettiItems = Array(count)
      .fill(0)
      .map(() => ({
        leftDelta: getRandomValue(0, 1),
        topDelta: getRandomValue(initialTopPosition, 1),
        swingDelta: getRandomValue(0.2, 1),
        speedDelta: {
          rotateX: getRandomValue(0.3, 1),
          rotateY: getRandomValue(0.3, 1),
          rotateZ: getRandomValue(0.3, 1),
        },
        color: getRandomColor(colors),
      }));
    setConfettiItems(newConfettiItems);
  }, [count, colors]);

  return (
    <View style={confettiStyles.explosionContainer} pointerEvents="none">
      {confettiItems.map((item, index) => {
        const top = animationValue.interpolate({
          inputRange: [0, 1, 1 + item.topDelta, 2],
          outputRange: [origin.y, 2 * origin.y - item.topDelta * screenHeight, 2 * origin.y, 4 * origin.y],
        });
        const left = animationValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [origin.x, item.leftDelta * screenWidth, item.leftDelta * screenWidth],
        });
        const opacity = animationValue.interpolate({
          inputRange: [0, 1, 1.8, 2],
          outputRange: [1, 1, 1, fadeOut ? 0 : 1],
        });
        const translateX = animationValue.interpolate({
          inputRange: [0, 0.4, 1.2, 2],
          outputRange: [0, -(item.swingDelta * 30), item.swingDelta * 30, 0],
        });
        const rotateX = animationValue.interpolate({
          inputRange: [0, 2],
          outputRange: ['0deg', `${item.speedDelta.rotateX * 360 * 10}deg`],
        });
        const rotateY = animationValue.interpolate({
          inputRange: [0, 2],
          outputRange: ['0deg', `${item.speedDelta.rotateY * 360 * 5}deg`],
        });
        const rotateZ = animationValue.interpolate({
          inputRange: [0, 2],
          outputRange: ['0deg', `${item.speedDelta.rotateZ * 360 * 2}deg`],
        });
        const distanceOpacity = animationValue.interpolate({
          inputRange: [1, 2],
          outputRange: [1, 0.5],
          extrapolate: 'clamp',
        });
        const combinedOpacity = Animated.multiply(opacity, distanceOpacity);
        const contentTransform = [{ translateX: left }, { translateY: top }];
        const transform = [{ rotateX }, { rotateY }, { rotate: rotateZ }, { translateX }];
        return (
          <Confetti
            key={index}
            contentTransform={contentTransform}
            transform={transform}
            opacity={combinedOpacity}
            color={item.color}
          />
        );
      })}
    </View>
  );
});

const confettiStyles = StyleSheet.create({
  explosionContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  confetti: {
    position: 'absolute',
    left: 0,
    top: -10,
    zIndex: 1,
  },
  rounded: {
    borderRadius: 100,
  },
});

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const accentColor = Colors[colorScheme ?? 'dark'].tint;
  
  // Calculate recent improvement
  const latestScore = mockData[mockData.length - 1].score;
  const previousScore = mockData[mockData.length - 2].score;
  const improvement = latestScore - previousScore;
  const streakCount = 12; // Mock data
  
  const latestScoreColor = getScoreColor(latestScore);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScan, setSelectedScan] = useState<ScanWithChange | null>(null);
  const explosionRef = useRef<any>(null);
  const [modalImageLayout, setModalImageLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Find previous scan for score change
  function handleDayPress(day: number) {
    const scan = scanData.find((d: ScanDay) => parseInt(d.date.split('-')[2]) === day);
    if (!scan) return;
    const idx = scanData.findIndex((d: ScanDay) => d.date === scan.date);
    const prev = idx > 0 ? scanData[idx - 1] : null;
    setSelectedScan({
      ...scan,
      change: prev ? getScoreChange(scan.score, prev.score) : { text: '', color: '#aaa' },
      prevDate: prev ? prev.date : null,
    });
    setModalVisible(true);
  }

  // Trigger confetti when modal opens and score improved
  React.useEffect(() => {
    if (modalVisible && selectedScan && selectedScan.change.text.includes('improved') && explosionRef.current && modalImageLayout) {
      explosionRef.current.start();
    }
  }, [modalVisible, selectedScan, modalImageLayout]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Progress Tracker</ThemedText>
        
        {/* Current Stats Section (smaller) */}
        <View style={styles.statsContainerSmall}>
          <View style={styles.statCardSmall}>
            <ThemedText style={[styles.statValueSmall, { color: latestScoreColor }]}>{latestScore}</ThemedText>
            <ThemedText style={styles.statLabelSmall}>Current Score</ThemedText>
          </View>
          
          <View style={styles.streakCardSmall}>
            <View style={styles.streakIconContainerSmall}>
              <ThemedText style={styles.fireIconSmall}>🔥</ThemedText>
              <ThemedText style={styles.streakValueSmall}>{streakCount}</ThemedText>
            </View>
            <ThemedText style={styles.streakLabelSmall}>Day Streak</ThemedText>
          </View>
          
          <View style={styles.statCardSmall}>
            <ThemedText style={[styles.statValueSmall, improvement > 0 ? styles.positiveChange : styles.negativeChange]}>
              {improvement > 0 ? '+' : ''}{improvement}
            </ThemedText>
            <ThemedText style={styles.statLabelSmall}>Recent Change</ThemedText>
          </View>
        </View>

        {/* Calendar UI */}
        <Calendar scanDays={scanData} onDayPress={handleDayPress} />

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
          onPress={() => router.push('/insights')}>
          <ThemedText style={styles.compareButtonText}>Improve Your Scores</ThemedText>
        </TouchableOpacity>

        {/* Modal for scan details */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Confetti explosion overlay (only if improved) */}
              {selectedScan && selectedScan.change.text.includes('improved') && modalImageLayout && (
                <Explosion
                  ref={explosionRef}
                  count={120}
                  origin={{
                    x: modalImageLayout.x + modalImageLayout.width / 2,
                    y: modalImageLayout.y + modalImageLayout.height / 2,
                  }}
                  fallSpeed={fallingSpeed}
                  explosionSpeed={explosionVelocity}
                  fadeOut={true}
                />
              )}
              {selectedScan && (
                <>
                  <RNText style={styles.modalDate}>Scan: {selectedScan.date}</RNText>
                  <Image
                    source={{ uri: selectedScan.image }}
                    style={styles.modalImage}
                    onLayout={(e: LayoutChangeEvent) => {
                      const { x, y, width, height } = e.nativeEvent.layout;
                      setModalImageLayout({ x, y, width, height });
                    }}
                  />
                  <View style={[styles.modalTag, { backgroundColor: selectedScan.change.color + '22' }]}> 
                    <RNText style={[styles.modalTagText, { color: selectedScan.change.color }]}>{selectedScan.change.text}</RNText>
                  </View>
                  <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                    <RNText style={styles.modalCloseText}>Close</RNText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  statsContainerSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCardSmall: {
    width: '30%',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabelSmall: {
    fontSize: 10,
    opacity: 0.7,
  },
  streakCardSmall: {
    width: '30%',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  streakIconContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  fireIconSmall: {
    fontSize: 13,
    marginRight: 2,
  },
  streakValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakLabelSmall: {
    fontSize: 10,
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
  calendarContainer: {
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calendarArrow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  calendarArrowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 20,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  dayHeaderCell: {
    width: '14%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 11,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
  },
  calendarDayRect: {
    width: '14%',
    height: 36,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 18,
  },
  calendarDayRectScan: {
    backgroundColor: '#8b5cf6',
  },
  calendarDayTextRect: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTextRectScan: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: 300,
  },
  modalDate: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalTagText: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  modalClose: {
    marginTop: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 