import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Animation values for scanning effect
  const scanAnimValue = useRef(new Animated.Value(0)).current;
  const opacityAnimValue = useRef(new Animated.Value(0)).current;

  // Start the scanning animation only once when tab is focused
  useFocusEffect(
    useCallback(() => {
      const startScanAnimation = () => {
        // Reset position
        scanAnimValue.setValue(0);
        opacityAnimValue.setValue(0);
        
        // Animate scanning line from top to bottom (one time only)
        Animated.sequence([
          // Small delay before starting
          Animated.delay(500),
          // Fade in and scan down
          Animated.parallel([
            Animated.timing(scanAnimValue, {
              toValue: 1,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnimValue, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          // Fade out
          Animated.timing(opacityAnimValue, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      };

      startScanAnimation();
    }, [scanAnimValue, opacityAnimValue])
  );

  const handleBeginScan = () => {
    router.push('/photo-insights');
  };

  // Calculate the scanning line position
  const scanLineTranslateY = scanAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 240], // Fixed height for mobile
  });

  return (
    <ThemedView style={[styles.container, { 
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 90,
    }]}>
      <ThemedText type="title" style={styles.title}>BodMax</ThemedText>
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            {/* Silhouette Image */}
            <Image
              source={require('@/assets/images/body-silhouette.png')}
              style={styles.bodyImage}
              contentFit="contain"
            />
            
            {/* Scanning Effect Overlay */}
            <View style={styles.scanningOverlay}>
              {/* Scanning Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                    opacity: opacityAnimValue,
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(156, 71, 255, 0.3)',
                    'rgba(156, 71, 255, 0.8)',
                    'rgba(156, 71, 255, 1)',
                    'rgba(156, 71, 255, 0.8)',
                    'rgba(156, 71, 255, 0.3)',
                    'transparent',
                  ]}
                  style={styles.scanLineGradient}
                />
              </Animated.View>
              
              {/* Subtle grid overlay for scanning effect */}
              <View style={styles.gridOverlay}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <ThemedText style={styles.heading}>Physique Analysis</ThemedText>
              <ThemedText style={styles.subheading}>
                Get your ratings and recommendations
              </ThemedText>
            </View>
            
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleBeginScan}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#8844ee', '#6622cc']}
                style={styles.gradient}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Processing..." : "Get Started"}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 24,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
  },
  imageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    position: 'relative',
    overflow: 'hidden',
  },
  bodyImage: {
    width: '80%',
    height: '90%',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    zIndex: 2,
  },
  scanLineGradient: {
    flex: 1,
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(156, 71, 255, 0.3)',
    top: `${12.5 * (Math.floor(Math.random() * 8) + 1)}%`,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  textContainer: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
