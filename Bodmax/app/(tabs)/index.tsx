import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const MAX_IMAGES = 5;

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Maximum Images", "You can only select up to 5 images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      Alert.alert("Missing Image", "Please select at least 1 image to analyze.");
      return;
    }

    setIsLoading(true);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to insights page after analysis
      router.push('/insights');
    }, 3000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Physique Analysis</ThemedText>
        <ThemedText style={styles.subtitle}>
          Upload up to 5 photos of your physique for AI analysis
        </ThemedText>

        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}>
                <ThemedText style={styles.removeButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <ThemedText style={styles.addButtonText}>+</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.guidelinesContainer}>
          <ThemedText type="subtitle" style={styles.guidelinesTitle}>
            Photo Guidelines:
          </ThemedText>
          <ThemedText style={styles.guidelineItem}>• Bright, even lighting</ThemedText>
          <ThemedText style={styles.guidelineItem}>• Full-body visible in frame</ThemedText>
          <ThemedText style={styles.guidelineItem}>• Plain/neutral background</ThemedText>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.disabledButton,
            { backgroundColor: Colors[colorScheme ?? 'dark'].tint }
          ]}
          onPress={handleSubmit}
          disabled={isLoading}>
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? "Analyzing..." : "Analyze My Physique"}
          </ThemedText>
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
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 160,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    width: 120,
    height: 160,
    margin: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 40,
    fontWeight: '300',
    color: '#666',
  },
  guidelinesContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  guidelinesTitle: {
    marginBottom: 8,
  },
  guidelineItem: {
    marginBottom: 6,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
