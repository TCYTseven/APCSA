import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleBeginScan = () => {
    router.push('/photo-insights');
  };

  return (
    <ThemedView style={styles.container}>
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
          </View>
          
          <View style={styles.contentContainer}>
            <ThemedText style={styles.heading}>Physique Analysis</ThemedText>
            <ThemedText style={styles.subheading}>
              Get your ratings and recommendations
            </ThemedText>
            
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleBeginScan}
              disabled={isLoading}>
              <LinearGradient
                colors={['#8844ee', '#6622cc']}
                style={styles.gradient}>
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Processing..." : "Get Started"}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pagination}>
            <View style={[styles.dot, selectedTab === 0 && styles.activeDot]} />
            <View style={[styles.dot, selectedTab === 1 && styles.activeDot]} />
            <View style={[styles.dot, selectedTab === 2 && styles.activeDot]} />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 50,
    marginLeft: 24,
    marginBottom: 20,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    height: height * 0.65,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
  },
  imageContainer: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 16,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
});
