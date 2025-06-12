import { Picker } from '@react-native-picker/picker';
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
};

const AboutYou = ({ onNext, onBack, onUpdateData, userData }: AboutYouProps) => {
  const [gender, setGender] = useState(userData.gender || '');
  const [heightFeet, setHeightFeet] = useState(userData.height.split("'")[0] || '');
  const [heightInches, setHeightInches] = useState(userData.height.split("'")[1] || '');
  const [weight, setWeight] = useState(userData.weight || '');
  const [errors, setErrors] = useState({
    gender: false,
    height: false,
    weight: false,
  });

  const handleFeetChange = (value: string) => {
    setHeightFeet(value);
    if (value && heightInches) setErrors(e => ({ ...e, height: false }));
  };

  const handleInchesChange = (value: string) => {
    setHeightInches(value);
    if (heightFeet && value) setErrors(e => ({ ...e, height: false }));
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    if (value) setErrors(e => ({ ...e, weight: false }));
  };

  const validateAndContinue = () => {
    const newErrors = {
      gender: !gender,
      height: !(heightFeet && heightInches),
      weight: !weight,
    };

    setErrors(newErrors);

    if (gender && heightFeet && heightInches && weight) {
      onUpdateData({
        gender,
        height: `${heightFeet}'${heightInches}\"`,
        weight,
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
                onPress={() => {
                  setGender(g);
                  setErrors(e => ({ ...e, gender: false }));
                }}
              >
                <Text style={[
                  styles.genderPillText,
                  gender === g && styles.genderPillTextSelected,
                ]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.errorText}>Please select a gender</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Height</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Picker
                selectedValue={heightFeet}
                onValueChange={handleFeetChange}
                style={styles.picker}
              >
                <Picker.Item label="ft" value="" />
                {[4,5,6,7].map(f => (
                  <Picker.Item key={f} label={`${f} ft`} value={f.toString()} />
                ))}
              </Picker>
            </View>
            <View style={{ flex: 1 }}>
              <Picker
                selectedValue={heightInches}
                onValueChange={handleInchesChange}
                style={styles.picker}
              >
                <Picker.Item label="in" value="" />
                {[...Array(12).keys()].map(i => (
                  <Picker.Item key={i} label={`${i} in`} value={i.toString()} />
                ))}
              </Picker>
            </View>
          </View>
          {errors.height && <Text style={styles.errorText}>Please enter your height</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            placeholder="Enter weight (lbs)"
            placeholderTextColor={Colors.dark.icon}
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
          />
          {errors.weight && <Text style={styles.errorText}>Please enter your weight</Text>}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: 'white',
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
  },
  inputError: {
    borderColor: Colors.dark.tint,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    fontSize: 14,
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
  },
  picker: {
    backgroundColor: Colors.dark.card,
    color: 'white',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.card,
  },
});

export default AboutYou; 