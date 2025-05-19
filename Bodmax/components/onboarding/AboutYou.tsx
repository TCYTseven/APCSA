import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

type AboutYouProps = {
  onNext: () => void;
  onBack: () => void;
  onUpdateData: (data: {
    gender: string;
    height: string;
    weight: string;
  }) => void;
  userData: {
    gender: string;
    height: string;
    weight: string;
    idealPhysique: string;
    email: string;
    password: string;
  };
  step: 'gender' | 'height' | 'weight';
};

const AboutYou = ({ onNext, onBack, onUpdateData, userData }: AboutYouProps) => {
  const [gender, setGender] = useState(userData.gender || '');
  const [height, setHeight] = useState(userData.height || '');
  const [errors, setErrors] = useState({
    gender: false,
    height: false,
  });

  const validateAndContinue = () => {
    setErrors({
      gender: !gender,
      height: !height,
    });
    if (gender && height) {
      onUpdateData({
        gender,
        height,
        weight: userData.weight || '',
      });
      onNext();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ backgroundColor: Colors.dark.background }}>
      <View style={styles.container}>
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>Let's get to know you better</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderPill,
                  gender === g && styles.genderPillSelected,
                ]}
                onPress={() => setGender(g)}
              >
                <Text style={[
                  styles.genderPillText,
                  gender === g && styles.genderPillTextSelected,
                ]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && !gender && <Text style={styles.errorText}>Please select a gender</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Height</Text>
          <TextInput
            style={[
              styles.input,
              errors.height && !height && styles.inputError,
            ]}
            placeholder="Height in cm or ft/in"
            placeholderTextColor={Colors.dark.icon}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          {errors.height && !height && <Text style={styles.errorText}>Please enter your height</Text>}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={validateAndContinue}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    fontFamily: 'Prompt',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Prompt',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Prompt',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: 'white',
    fontFamily: 'Prompt',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  genderPill: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.card,
  },
  genderPillSelected: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  genderPillText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Prompt',
    fontWeight: '500',
  },
  genderPillTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.dark.card,
    color: 'white',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.card,
    fontFamily: 'Prompt',
  },
  inputError: {
    borderColor: Colors.dark.tint,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Prompt',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  backButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: Colors.dark.icon,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Prompt',
  },
  nextButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Prompt',
  },
});

export default AboutYou; 