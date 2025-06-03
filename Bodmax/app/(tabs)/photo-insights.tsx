import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

export default function PhotoInsightsScreen() {
  const [timerDuration, setTimerDuration] = useState(0); // 0, 5, or 10 seconds
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');

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
      // Here you would implement the timer countdown UI
      setTimeout(() => {
        launchCamera();
      }, timerDuration * 1000);
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
    setTimerDuration(prev => {
      if (prev === 0) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === 'front' ? 'back' : 'front');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Capture Your Photo</ThemedText>
      
      <View style={styles.cardContainer}>
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
        <TouchableOpacity style={styles.cameraArea} onPress={takePhoto}>
          <LinearGradient
            colors={['rgba(136, 68, 238, 0.1)', 'rgba(136, 68, 238, 0.05)']}
            style={styles.cameraGradient}
          >
            <Ionicons name="camera" size={48} color="#8844ee" />
            <ThemedText style={styles.cameraText}>
              Tap to take photo{timerDuration > 0 ? ` (${timerDuration}s timer)` : ''}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* Camera Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleTimer}>
            <Ionicons name="timer" size={20} color="#8844ee" />
            <ThemedText style={styles.controlText}>{timerDuration}s</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
            <Ionicons name="camera-reverse" size={20} color="#8844ee" />
            <ThemedText style={styles.controlText}>
              {cameraType === 'front' ? 'Selfie' : 'Back'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.timerExplanation}>
          Once you tap the camera, {timerDuration === 0 ? 'the photo will be taken immediately' : `a ${timerDuration}-second timer will start before taking the photo`}
        </ThemedText>

        {/* Gallery Button */}
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <LinearGradient
            colors={['#8844ee', '#6622cc']}
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
    marginTop: 60,
    marginBottom: 24,
    color: 'white',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 28, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 100,
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
    marginBottom: 24,
    lineHeight: 18,
  },
  galleryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
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
}); 