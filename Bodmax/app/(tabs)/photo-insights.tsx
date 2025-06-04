import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

export default function PhotoInsightsScreen() {
  const [timerDuration, setTimerDuration] = useState(0); // 0, 5, or 10 seconds
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(0);
  const insets = useSafeAreaInsets();

  // Countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCountingDown && countdownNumber > 0) {
      interval = setInterval(() => {
        setCountdownNumber(prev => {
          if (prev <= 1) {
            setIsCountingDown(false);
            launchCamera();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdownNumber]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      router.push('/insights');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    // Show timer countdown if needed
    if (timerDuration > 0) {
      setIsCountingDown(true);
      setCountdownNumber(timerDuration);
    } else {
      launchCamera();
    }
  };

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
      cameraType: cameraType === 'front' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      router.push('/insights');
    }
  };

  const toggleTimer = () => {
    if (isCountingDown) return; // Don't allow timer changes during countdown
    setTimerDuration(prev => {
      if (prev === 0) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  };

  const toggleCamera = () => {
    if (isCountingDown) return; // Don't allow camera changes during countdown
    setCameraType(prev => prev === 'front' ? 'back' : 'front');
  };

  const cancelCountdown = () => {
    setIsCountingDown(false);
    setCountdownNumber(0);
  };

  return (
    <ThemedView style={[styles.container, {
      paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 20,
    }]}>
      <ThemedText type="title" style={styles.title}>Capture Your Photo</ThemedText>
      
      <View style={[styles.cardContainer, {
        marginBottom: Platform.OS === 'ios' ? insets.bottom + 80 : 80,
      }]}>
        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipRow}>
            <Ionicons name="sunny" size={16} color="#FFD700" />
            <ThemedText style={styles.tipText}>Good lighting</ThemedText>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="resize" size={16} color="#4CAF50" />
            <ThemedText style={styles.tipText}>6-8 feet away</ThemedText>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="shirt" size={16} color="#2196F3" />
            <ThemedText style={styles.tipText}>Form-fitting clothes</ThemedText>
          </View>
        </View>

        {/* Camera Area */}
        <TouchableOpacity 
          style={styles.cameraArea} 
          onPress={isCountingDown ? cancelCountdown : takePhoto}
          disabled={isCountingDown && countdownNumber <= 1}
        >
          <LinearGradient
            colors={isCountingDown ? 
              ['rgba(255, 69, 0, 0.2)', 'rgba(255, 69, 0, 0.1)'] : 
              ['rgba(136, 68, 238, 0.1)', 'rgba(136, 68, 238, 0.05)']}
            style={styles.cameraGradient}
          >
            {isCountingDown ? (
              <>
                <ThemedText style={styles.countdownNumber}>
                  {countdownNumber}
                </ThemedText>
                <ThemedText style={styles.countdownText}>
                  Tap to cancel
                </ThemedText>
              </>
            ) : (
              <>
                <Ionicons name="camera" size={48} color="#8844ee" />
                <ThemedText style={styles.cameraText}>
                  Tap to take photo{timerDuration > 0 ? ` (${timerDuration}s timer)` : ''}
                </ThemedText>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Camera Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlButton, isCountingDown && styles.disabledButton]} 
            onPress={toggleTimer}
            disabled={isCountingDown}
          >
            <Ionicons name="timer" size={20} color={isCountingDown ? "#555" : "#8844ee"} />
            <ThemedText style={[styles.controlText, isCountingDown && styles.disabledText]}>
              {timerDuration}s
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, isCountingDown && styles.disabledButton]} 
            onPress={toggleCamera}
            disabled={isCountingDown}
          >
            <Ionicons name="camera-reverse" size={20} color={isCountingDown ? "#555" : "#8844ee"} />
            <ThemedText style={[styles.controlText, isCountingDown && styles.disabledText]}>
              {cameraType === 'front' ? 'Selfie' : 'Back'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.timerExplanation}>
          {isCountingDown ? 
            `Taking photo in ${countdownNumber} second${countdownNumber !== 1 ? 's' : ''}...` :
            (timerDuration === 0 ? 'the photo will be taken immediately' : `a ${timerDuration}-second timer will start before taking the photo`)
          }
        </ThemedText>

        {/* Gallery Button */}
        <TouchableOpacity 
          style={[styles.galleryButton, isCountingDown && styles.disabledButton]} 
          onPress={pickImage}
          disabled={isCountingDown}
        >
          <LinearGradient
            colors={isCountingDown ? ['#555', '#444'] : ['#8844ee', '#6622cc']}
            style={styles.gradient}
          >
            <Ionicons name="images" size={24} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Choose from Gallery</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    color: 'white',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 28, 0.95)',
    borderRadius: 24,
    padding: 24,
  },
  tipsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  tipRow: {
    alignItems: 'center',
    gap: 6,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  cameraArea: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8844ee',
    borderStyle: 'dashed',
  },
  cameraGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cameraText: {
    fontSize: 16,
    color: '#8844ee',
    textAlign: 'center',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 68, 238, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(136, 68, 238, 0.3)',
  },
  controlText: {
    color: '#8844ee',
    fontSize: 14,
    fontWeight: '600',
  },
  timerExplanation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  galleryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  disabledText: {
    color: 'rgba(128, 128, 128, 0.6)',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
}); 