import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Dimensions, Image, LayoutChangeEvent, Modal, Platform, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/AuthContext';
import { dataStore, type LegacyPhysiqueRecord, type MuscleGroupScore } from '@/lib/dataStore';

// Helper function to get color based on score with new color scheme
const getScoreColor = (score: number): string => {
  if (score === 0) return '#666666'; // Gray for no data
  if (score >= 90) return '#4CE05C'; // Bright Green (90-100)
  if (score >= 80) return '#AEEA00'; // Muted Green-Yellow (80-90)
  if (score >= 70) return '#FFEB3B'; // Yellow (70-80)
  if (score >= 60) return '#FF9800'; // Yellow-Orange (60-70)
  return '#F44336'; // Red (below 60)
};

// Helper function to format date as mm/dd/yy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
  return `${month}/${day}/${year}`;
};

// Real data is loaded from dataStore

// Types for calendar and modal functionality
type ScanDay = { date: string; image: string; score: number; recordId: string };
type ScanWithChange = ScanDay & { change: { text: string; color: string }; prevDate: string | null };
type DayScans = { date: string; scans: ScanWithChange[]; currentIndex: number };

function getScoreChange(currentScore: number, previousScore: number): { text: string; color: string } {
  const diff = currentScore - previousScore;
  if (diff > 0) return { text: `Your score has improved by ${diff} since last scan!`, color: '#4CD964' };
  if (diff < 0) return { text: `Your score has decreased by ${Math.abs(diff)} since last scan!`, color: '#FF3B30' };
  return { text: 'Your score is unchanged since last scan!', color: '#aaa' };
}

const ProgressBar = ({ title, value }: { title: string; value: number }) => {
  const roundedValue = Math.round(value);
  const scoreColor = getScoreColor(roundedValue);
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressLabelContainer}>
        <ThemedText style={styles.progressLabel}>{title}</ThemedText>
        <ThemedText style={[styles.progressValue, { color: scoreColor }]}>{roundedValue}/100</ThemedText>
      </View>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${roundedValue}%`, backgroundColor: scoreColor }
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
  // Month navigation state - default to current month/year
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth()); // 0-indexed
  const [year, setYear] = useState(currentDate.getFullYear());
  
  // Navigate to month with most recent scan when scanDays change
  React.useEffect(() => {
    if (scanDays.length > 0) {
      // Get the most recent scan date
      const mostRecentScan = scanDays.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      });
      
      const scanDate = new Date(mostRecentScan.date);
      const scanMonth = scanDate.getMonth();
      const scanYear = scanDate.getFullYear();
      
      setMonth(scanMonth);
      setYear(scanYear);
    }
  }, [scanDays.length]); // Only trigger when the number of scans changes

  // Get the number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Filter scan days for current month/year and extract day numbers
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
      
      {/* Calendar Grid */}
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
  const insets = useSafeAreaInsets();
  const { user, profile, loading: authLoading, initialized, debugAuthState } = useAuth();
  
  // Debug auth state on every render
  React.useEffect(() => {
    console.log('📊 PROGRESS PAGE - Auth state:', {
      userExists: !!user,
      profileExists: !!profile,
      authLoading,
      initialized,
      userEmail: user?.email
    });
  });
  
  // State for real data
  const [progressData, setProgressData] = useState<Array<{ date: string; score: number }>>([]);
  const [currentScores, setCurrentScores] = useState<MuscleGroupScore>({});
  const [physiqueRecords, setPhysiqueRecords] = useState<LegacyPhysiqueRecord[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  
  // Function to calculate overall score using same method as insights page
  const calculateOverallScore = (scores: MuscleGroupScore): number => {
    const validScores = Object.values(scores).filter(score => score > 0);
    if (validScores.length === 0) return 0;
    
    // Use weighted average with emphasis on major muscle groups (same as insights)
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

  // Calculate recent improvement using current scores (same as insights page)
  const latestScore = calculateOverallScore(currentScores);
  const previousScore = progressData.length > 1 ? Math.round(progressData[progressData.length - 2].score) : 0;
  const improvement = latestScore - previousScore;
  const streakCount = physiqueRecords.length; // Number of scans taken
  
  const latestScoreColor = getScoreColor(latestScore);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayScans, setSelectedDayScans] = useState<DayScans | null>(null);
  const explosionRef = useRef<any>(null);
  const [modalImageLayout, setModalImageLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Load data when screen is focused - but only if not already loaded
  useFocusEffect(
    useCallback(() => {
      // Don't reload if we already have data (no time expiration unless explicitly refreshed)
      if (dataLoaded && !isLoading && (progressData.length > 0 || Object.keys(currentScores).length > 0)) {
        console.log('📊 Progress data already loaded, skipping reload');
        return;
      }
      
      // Don't load if currently loading
      if (isLoading) {
        console.log('📊 Already loading progress data, skipping...');
        return;
      }
      
      console.log('📊 Progress screen focused, loading data...');
      
      const loadData = async () => {
        if (isLoading) {
          console.log('📊 Already loading, skipping...');
          return;
        }
        
        setIsLoading(true);
        try {
          console.log('📊 Starting data load process...');
          console.log('🔐 Auth state:', { 
            userExists: !!user, 
            profileExists: !!profile, 
            authLoading, 
            initialized 
          });
          
          // If auth is not initialized or still loading, wait a bit
          if (!initialized || authLoading) {
            console.log('⏳ Auth still initializing, waiting...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Use AuthContext data instead of calling auth service directly
          if (!user) {
            console.log('❌ No authenticated user found in context');
            // Set empty states instead of mock data
            setProgressData([]);
            setCurrentScores({});
            setPhysiqueRecords([]);
            setUserProfile(null);
            return;
          }
          
          // Add timeout wrapper for each step
          const timeoutPromise = (promise: Promise<any>, name: string, timeoutMs = 8000) => {
            return Promise.race([
              promise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
              )
            ]);
          };
          
          // Step 1: Use profile from AuthContext
          console.log('📊 Step 1: Using profile from AuthContext...');
          const contextProfile = profile || { id: user.id, email: user.email };
          setUserProfile(contextProfile);
          console.log('👤 User profile from context:', contextProfile?.email);
          
          // Step 2: Load current scores with fallback
          console.log('📊 Step 2: Loading current scores...');
          try {
            const scores = await timeoutPromise(
              dataStore.getCurrentScores(),
              'getCurrentScores',
              15000
            );
            console.log('🎯 Current scores loaded:', Object.keys(scores).length, 'muscle groups');
            setCurrentScores(scores);
          } catch (error) {
            console.warn('⚠️ getCurrentScores failed:', error);
            setCurrentScores({});
          }
          
          // Step 3: Load physique records with fallback
          if (contextProfile?.id) {
            console.log('📊 Step 3: Loading physique records...');
            try {
              const records = await timeoutPromise(
                dataStore.getPhysiqueRecords(contextProfile.id),
                'getPhysiqueRecords',
                10000
              );
        console.log('📸 Physique records loaded:', records.length, 'records');
        setPhysiqueRecords(records);
            } catch (error) {
              console.warn('⚠️ getPhysiqueRecords failed:', error);
              setPhysiqueRecords([]);
            }
            
            console.log('📊 Step 4: Loading progress data...');
            try {
              const progress = await timeoutPromise(
                dataStore.getProgressData(contextProfile.id),
                'getProgressData',
                8000
              );
        console.log('📈 Progress data loaded:', progress.length, 'data points');
        setProgressData(progress);
            } catch (error) {
              console.warn('⚠️ getProgressData failed:', error);
              setProgressData([]);
            }
          } else {
            console.log('⚠️ No valid profile ID');
            setPhysiqueRecords([]);
            setProgressData([]);
          }
          
          console.log('✅ Data loading completed successfully!');
          setDataLoaded(true);
          setLastLoadTime(Date.now());
    } catch (error) {
      console.error('❌ Error loading data:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
            name: error instanceof Error ? error.name : 'Unknown'
          });
          
          // Set empty states on error - no mock data
          setUserProfile(null);
          setPhysiqueRecords([]);
          setProgressData([]);
          setCurrentScores({});
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }, [user?.id, initialized, authLoading]) // Re-run when auth state actually changes
  );

  // Handle day press with support for multiple images per day
  function handleDayPress(day: number) {
    const scanDays = physiqueRecords.map(record => {
      console.log('🔍 Physique record imageUri:', record.imageUri);
      return {
        date: record.createdAt.split('T')[0],
        image: record.imageUri,
        score: Math.round(Object.values(record.scores).reduce((sum: number, score: number) => sum + score, 0) / Object.values(record.scores).length),
        recordId: record.id
      };
    });
    
    // Get all scans for the selected day
    const dayScans = scanDays.filter((d: ScanDay) => parseInt(d.date.split('-')[2]) === day);
    if (dayScans.length === 0) return;
    
    // Sort by creation time (most recent first)
    dayScans.sort((a, b) => {
      const recordA = physiqueRecords.find(r => r.id === a.recordId);
      const recordB = physiqueRecords.find(r => r.id === b.recordId);
      return new Date(recordB!.createdAt).getTime() - new Date(recordA!.createdAt).getTime();
    });
    
    // Find previous scan for comparison
    const allScansChronological = scanDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentDayIndex = allScansChronological.findIndex(d => d.date === dayScans[0].date);
    const prevScan = currentDayIndex > 0 ? allScansChronological[currentDayIndex - 1] : null;
    
    // Create scans with change information
    const scansWithChange: ScanWithChange[] = dayScans.map(scan => ({
      ...scan,
      change: prevScan ? getScoreChange(scan.score, prevScan.score) : { text: 'First scan recorded!', color: '#4CD964' },
      prevDate: prevScan ? prevScan.date : null,
    }));
    
    setSelectedDayScans({
      date: dayScans[0].date,
      scans: scansWithChange,
      currentIndex: 0
    });
    setModalVisible(true);
  }

  // Trigger confetti when modal opens and score improved
  React.useEffect(() => {
    if (modalVisible && selectedDayScans && selectedDayScans.scans[selectedDayScans.currentIndex]?.change.text.includes('improved') && explosionRef.current && modalImageLayout) {
      explosionRef.current.start();
    }
  }, [modalVisible, selectedDayScans, modalImageLayout]);

  return (
    <ThemedView style={[styles.container, {
      paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10,
    }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 120 : 120,
        }]}
      >
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
        <Calendar scanDays={physiqueRecords.map(record => ({
          date: record.createdAt.split('T')[0],
          image: record.imageUri,
          score: Math.round(Object.values(record.scores).reduce((sum: number, score: number) => sum + score, 0) / Object.values(record.scores).length),
          recordId: record.id
        }))} onDayPress={handleDayPress} />

        {/* Progress Chart Section - Line chart */}
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Progress Chart</ThemedText>
          {progressData.length > 0 ? (
            <LineChart data={progressData.map(item => ({ ...item, score: Math.round(item.score) }))} />
          ) : (
            <View style={styles.noDataContainer}>
              <ThemedText style={styles.noDataText}>📊 No scan data yet</ThemedText>
              <ThemedText style={styles.noDataSubtext}>Take your first physique photo to see progress!</ThemedText>
            </View>
          )}
        </View>

        {/* Body Areas Section */}
        <View style={styles.bodyAreasContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Body Areas</ThemedText>
                  {Object.entries(currentScores).map(([muscleGroup, score]) => (
          <ProgressBar key={muscleGroup} title={muscleGroup} value={Math.round(score)} />
        ))}
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
              {selectedDayScans && selectedDayScans.scans[selectedDayScans.currentIndex]?.change.text.includes('improved') && modalImageLayout && (
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
              {selectedDayScans && (
                <>
                  <View style={styles.modalHeader}>
                    <RNText style={styles.modalDate}>
                      Scan: {formatDate(selectedDayScans.date)}
                      {selectedDayScans.scans.length > 1 && (
                        <RNText style={styles.modalCounter}> ({selectedDayScans.currentIndex + 1}/{selectedDayScans.scans.length})</RNText>
                      )}
                    </RNText>
                  </View>

                  {/* Image with side navigation arrows */}
                  <View style={styles.imageContainer}>
                    {selectedDayScans.scans.length > 1 && (
                      <TouchableOpacity 
                        style={[styles.sideNavButton, styles.leftNavButton, selectedDayScans.currentIndex === 0 && styles.sideNavButtonDisabled]}
                        onPress={() => {
                          if (selectedDayScans.currentIndex > 0) {
                            setSelectedDayScans({
                              ...selectedDayScans,
                              currentIndex: selectedDayScans.currentIndex - 1
                            });
                          }
                        }}
                        disabled={selectedDayScans.currentIndex === 0}
                      >
                        <RNText style={[styles.sideNavButtonText, selectedDayScans.currentIndex === 0 && styles.sideNavButtonTextDisabled]}>‹</RNText>
                      </TouchableOpacity>
                    )}
                    
                    <Image
                      source={{ uri: selectedDayScans.scans[selectedDayScans.currentIndex].image }}
                      style={styles.modalImage}
                      onLayout={(e: LayoutChangeEvent) => {
                        const { x, y, width, height } = e.nativeEvent.layout;
                        setModalImageLayout({ x, y, width, height });
                      }}
                      onError={(error) => {
                        console.error('❌ Image load error:', error.nativeEvent.error);
                        console.log('🖼️ Image URI:', selectedDayScans.scans[selectedDayScans.currentIndex].image);
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', selectedDayScans.scans[selectedDayScans.currentIndex].image);
                      }}
                    />
                    
                    {selectedDayScans.scans.length > 1 && (
                      <TouchableOpacity 
                        style={[styles.sideNavButton, styles.rightNavButton, selectedDayScans.currentIndex === selectedDayScans.scans.length - 1 && styles.sideNavButtonDisabled]}
                        onPress={() => {
                          if (selectedDayScans.currentIndex < selectedDayScans.scans.length - 1) {
                            setSelectedDayScans({
                              ...selectedDayScans,
                              currentIndex: selectedDayScans.currentIndex + 1
                            });
                          }
                        }}
                        disabled={selectedDayScans.currentIndex === selectedDayScans.scans.length - 1}
                      >
                        <RNText style={[styles.sideNavButtonText, selectedDayScans.currentIndex === selectedDayScans.scans.length - 1 && styles.sideNavButtonTextDisabled]}>›</RNText>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={[styles.modalTag, { backgroundColor: selectedDayScans.scans[selectedDayScans.currentIndex].change.color + '22' }]}> 
                    <RNText style={[styles.modalTagText, { color: selectedDayScans.scans[selectedDayScans.currentIndex].change.color }]}>
                      {selectedDayScans.scans[selectedDayScans.currentIndex].change.text}
                    </RNText>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  calendarDayRectScan: {
    backgroundColor: '#4CD964', // Green background for scan days
    borderColor: '#ffffff',
    borderWidth: 2,
    shadowColor: '#4CD964',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
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
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  noDataSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.5,
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  modalCounter: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sideNavButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    transform: [{ translateY: -20 }],
  },
  leftNavButton: {
    left: -25,
  },
  rightNavButton: {
    right: -25,
  },
  sideNavButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sideNavButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sideNavButtonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
}); 