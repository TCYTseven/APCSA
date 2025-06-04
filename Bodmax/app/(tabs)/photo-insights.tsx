import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

export default function PhotoInsightsScreen() {
  const [timerDuration, setTimerDuration] = useState(0); // 0, 5, or 10 seconds
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  // Define capturePhoto function before it's used in countdown effect
  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });
      
      if (photo) {
        // Photo captured successfully, navigate to insights
        setShowCamera(false);
        setIsCapturing(false);
        
        // Restore tab bar before navigating
        const parent = navigation.getParent();
        if (parent) {
          parent.setOptions({
            tabBarStyle: undefined,
            tabBarVisible: true,
          });
        }
        
        navigation.setOptions({
          tabBarStyle: undefined,
          tabBarVisible: true,
        });
        
        router.push('/insights');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      setIsCapturing(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCountingDown && countdownNumber > 0) {
      interval = setInterval(() => {
        setCountdownNumber(prev => {
          if (prev <= 1) {
            setIsCountingDown(false);
            capturePhoto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdownNumber]);

  // Alternative approach using focus effect
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      
      // Set initial state based on camera visibility
      if (showCamera) {
        if (parent) {
          parent.setOptions({
            tabBarStyle: { display: 'none' },
            tabBarVisible: false,
          });
        }
        navigation.setOptions({
          tabBarStyle: { display: 'none' },
          tabBarVisible: false,
        });
      }
      
      return () => {
        // Ensure tab bar is restored when screen loses focus
        if (parent) {
          parent.setOptions({
            tabBarStyle: undefined,
            tabBarVisible: true,
          });
        }
        navigation.setOptions({
          tabBarStyle: undefined,
          tabBarVisible: true,
        });
      };
    }, [showCamera, navigation])
  );

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

  const startCamera = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert('Camera Permission', 'Camera permission is required to take photos.');
        return;
      }
    }

    // Hide tab bar immediately
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
        tabBarVisible: false,
      });
    }
    
    // Also set on current navigation
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
      tabBarVisible: false,
    });

    setShowCamera(true);

    // Show timer countdown if needed
    if (timerDuration > 0) {
      setIsCountingDown(true);
      setCountdownNumber(timerDuration);
    } else {
      // Take photo immediately
      setTimeout(() => capturePhoto(), 500); // Small delay to let camera initialize
    }
  };

  const toggleTimer = () => {
    if (isCountingDown || showCamera) return; // Don't allow timer changes during countdown or camera
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
    setShowCamera(false);
    
    // Restore tab bar immediately
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: undefined,
        tabBarVisible: true,
      });
    }
    
    navigation.setOptions({
      tabBarStyle: undefined,
      tabBarVisible: true,
    });
  };

  const closeCamera = () => {
    setShowCamera(false);
    setIsCountingDown(false);
    setCountdownNumber(0);
    
    // Restore tab bar immediately
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: undefined,
        tabBarVisible: true,
      });
    }
    
    navigation.setOptions({
      tabBarStyle: undefined,
      tabBarVisible: true,
    });
  };

  if (showCamera) {
    return (
      <ThemedView style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        >
          {/* Camera overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity onPress={closeCamera} style={styles.closeButton}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              <ThemedText style={styles.cameraTitle}>
                {isCountingDown ? `Taking photo in ${countdownNumber}...` : 'Position yourself'}
              </ThemedText>
              <TouchableOpacity onPress={toggleCamera} style={styles.flipButton}>
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity>
            </View>

            {/* Center countdown */}
            {isCountingDown && (
              <View style={styles.countdownOverlay}>
                <ThemedText style={styles.countdownNumberLarge}>
                  {countdownNumber}
                </ThemedText>
              </View>
            )}

            {/* Bottom bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
              {!isCountingDown && !isCapturing && (
                <TouchableOpacity onPress={capturePhoto} style={styles.captureButton}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}
              {isCountingDown && (
                <TouchableOpacity onPress={cancelCountdown} style={styles.cancelButton}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </ThemedView>
    );
  }

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
          onPress={startCamera}
        >
          <LinearGradient
            colors={['rgba(136, 68, 238, 0.1)', 'rgba(136, 68, 238, 0.05)']}
            style={styles.cameraGradient}
          >
            <Ionicons name="camera" size={48} color="#8844ee" />
            <ThemedText style={styles.cameraText}>
              Tap to start camera{timerDuration > 0 ? ` (${timerDuration}s timer)` : ''}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* Camera Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleTimer}
          >
            <Ionicons name="timer" size={20} color="#8844ee" />
            <ThemedText style={styles.controlText}>
              {timerDuration}s
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleCamera}
          >
            <Ionicons name="camera-reverse" size={20} color="#8844ee" />
            <ThemedText style={styles.controlText}>
              {cameraType === 'front' ? 'Back' : 'Selfie'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.timerExplanation}>
          Tap the camera to open live preview. {timerDuration === 0 ? 'Photo will be taken immediately' : `${timerDuration}-second timer will start before automatic capture`}
        </ThemedText>

        {/* Gallery Button */}
        <TouchableOpacity 
          style={styles.galleryButton} 
          onPress={pickImage}
        >
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  closeButton: {
    padding: 5,
  },
  cameraTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flipButton: {
    padding: 5,
  },
  countdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumberLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  captureButton: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  cancelButton: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 