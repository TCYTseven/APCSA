import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PhotoInsightsScreen() {
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

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      router.push('/insights');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Quick Tips</ThemedText>
      
      <View style={styles.tipsContainer}>
        <View style={styles.tipRow}>
          <Ionicons name="sunny" size={20} color="#FFD700" style={styles.icon} />
          <ThemedText style={styles.tipText}>Good lighting, avoid shadows</ThemedText>
        </View>

        <View style={styles.tipRow}>
          <Ionicons name="resize" size={20} color="#4CAF50" style={styles.icon} />
          <ThemedText style={styles.tipText}>Stand 6-8 feet from camera</ThemedText>
        </View>

        <View style={styles.tipRow}>
          <Ionicons name="shirt" size={20} color="#2196F3" style={styles.icon} />
          <ThemedText style={styles.tipText}>Wear form-fitting clothes</ThemedText>
        </View>
      </View>

      <View style={styles.uploadContainer}>
        <View style={styles.uploadArea}>
          <Ionicons name="camera" size={48} color="#8844ee" />
          <ThemedText style={styles.uploadText}>
            Choose how to capture your photo
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={pickImage}>
            <LinearGradient
              colors={['#8844ee', '#6622cc']}
              style={styles.gradient}>
              <Ionicons name="images" size={24} color="white" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>Choose from Gallery</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={takePhoto}>
            <LinearGradient
              colors={['#8844ee', '#6622cc']}
              style={styles.gradient}>
              <Ionicons name="camera" size={24} color="white" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 32,
  },
  tipsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  icon: {
    marginRight: 12,
  },
  tipText: {
    fontSize: 15,
    opacity: 0.9,
  },
  uploadContainer: {
    flex: 1,
    gap: 24,
  },
  uploadArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 68, 238, 0.1)',
    borderWidth: 2,
    borderColor: '#8844ee',
    borderStyle: 'dashed',
    borderRadius: 16,
    marginBottom: 16,
  },
  uploadText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8844ee',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  cameraButton: {
    marginTop: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 