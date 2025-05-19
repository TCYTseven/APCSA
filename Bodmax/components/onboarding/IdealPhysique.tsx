import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Ideal Physique</Text>
        <Text style={styles.subtitle}>
          Select the physique that best matches your fitness goals
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
                <Image source={option.image} style={styles.physiqueImage} />
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>Please select your ideal physique</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleContinue}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    borderWidth: 2,
    borderColor: Colors.dark.card,
    borderRadius: 14,
    marginBottom: 16,
    padding: 18,
    backgroundColor: Colors.dark.background,
  },
  selectedOption: {
    borderColor: Colors.dark.tint,
    backgroundColor: '#1a0026',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  physiqueImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: Colors.dark.card,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: 'white',
  },
  optionDescription: {
    color: Colors.dark.icon,
    fontSize: 15,
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
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IdealPhysique; 