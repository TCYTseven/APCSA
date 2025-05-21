import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PhysiqueOption = {
  id: string;
  title: string;
  description: string;
  image: any;
};

type IdealPhysiqueProps = {
  onNext: () => void;
  onBack: () => void;
  onUpdateData: (data: { idealPhysique: string }) => void;
  userData: {
    gender: string;
    height: string;
    weight: string;
    idealPhysique: string;
    email: string;
    password: string;
  };
};

const physiqueOptions: PhysiqueOption[] = [
  {
    id: 'athletic',
    title: 'Athletic',
    description: 'Moderate muscle definition, low body fat, balanced look.',
    image: require('../../assets/images/athletic.png'),
  },
  {
    id: 'toned',
    title: 'Toned',
    description: 'Very low body fat, high muscle definition and vascularity.',
    image: require('../../assets/images/toned.png'),
  },
  {
    id: 'powerlifter',
    title: 'Powerlifter',
    description: 'Thick, dense muscle mass with strength-focused proportions.',
    image: require('../../assets/images/powerlifter.png'),
  },
  {
    id: 'bodybuilder',
    title: 'Bodybuilder',
    description: 'Symmetrical, highly developed muscles with stage-ready aesthetics.',
    image: require('../../assets/images/bodybuilder.png'),
  },
];

const IdealPhysique = ({ onNext, onBack, onUpdateData, userData }: IdealPhysiqueProps) => {
  const [selectedPhysique, setSelectedPhysique] = useState(userData.idealPhysique || '');
  const [error, setError] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedPhysique(id);
    setError(false);
  };

  const handleContinue = () => {
    if (!selectedPhysique) {
      setError(true);
      return;
    }

    onUpdateData({ idealPhysique: selectedPhysique });
    onNext();
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: '#000000' }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Goal</Text>
        <Text style={styles.subtitle}>
          Select the physique that best matches your fitness aspirations
        </Text>

        <View style={styles.optionsContainer}>
          {physiqueOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                selectedPhysique === option.id && styles.selectedOption,
                error && !selectedPhysique && styles.errorBorder,
              ]}
              onPress={() => handleSelect(option.id)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.imageContainer,
                  selectedPhysique === option.id && styles.selectedImageContainer
                ]}>
                  <Image source={option.image} style={styles.physiqueImage} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedPhysique === option.id && styles.selectedOptionTitle
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedPhysique === option.id && styles.selectedOptionDescription
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>Please select your ideal physique</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleContinue}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    borderWidth: 2,
    borderColor: '#1f1f1f',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#0a0a0a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedOption: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a0026',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedImageContainer: {
    backgroundColor: '#8b5cf6',
  },
  physiqueImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#ffffff',
  },
  selectedOptionTitle: {
    color: '#8b5cf6',
  },
  optionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  selectedOptionDescription: {
    color: '#c4b5fd',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 16,
  },
  backButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IdealPhysique; 