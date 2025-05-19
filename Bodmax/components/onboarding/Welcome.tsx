import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

type WelcomeProps = {
  onNext: () => void;
};

const Welcome = ({ onNext }: WelcomeProps) => {
  return (
    <LinearGradient
      colors={['#111112', '#23232a']}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.purpleAccent} />
      <View style={styles.headerRow}>
        <Image source={require('../../assets/Bodmax Logo.png')} style={styles.logoSmall} />
        <Text style={styles.brandText}>Bodmax</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.splashText}>
          <Text style={styles.splashTextFaint}>Get ready to{"\n"}</Text>
          <Text style={styles.splashTextBright}>gamify your progress tracking{"\n"}</Text>
          <Text style={styles.splashTextFaint}>and transform how you conquer your fitness goals.</Text>
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onNext}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    fontFamily: 'Prompt',
  },
  purpleAccent: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(156,71,255,0.12)',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
    marginLeft: 28,
    zIndex: 2,
  },
  logoSmall: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: 'contain',
  },
  brandText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Prompt',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 40,
    zIndex: 2,
  },
  splashText: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'left',
    marginBottom: 24,
    fontFamily: 'Prompt',
  },
  splashTextFaint: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    fontFamily: 'Prompt',
  },
  splashTextBright: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Prompt',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
    zIndex: 2,
  },
  getStartedButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 32,
    width: '80%',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Prompt',
    letterSpacing: 1,
  },
});

export default Welcome; 