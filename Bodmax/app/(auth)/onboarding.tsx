import { dataStore } from '@/lib/dataStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AboutYou from '../../components/onboarding/AboutYou';
import CreateAccount from '../../components/onboarding/CreateAccount';
import IdealPhysique from '../../components/onboarding/IdealPhysique';
import Welcome from '../../components/onboarding/Welcome';

type UserData = {
  gender: string;
  height: string;
  weight: string;
  idealPhysique: string;
  email: string;
  password: string;
}

const steps = ['welcome', 'aboutYou', 'idealPhysique', 'createAccount'];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [userData, setUserData] = useState<UserData>({
    gender: '',
    height: '',
    weight: '',
    idealPhysique: '',
    email: '',
    password: '',
  });

  const insets = useSafeAreaInsets();

  const handleNext = (step: string) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleUpdateUserData = (data: Partial<UserData>) => {
    setUserData({ ...userData, ...data });
  };

  const parseHeight = (heightString: string): number => {
    // Convert height from "5'10"" format to inches
    const parts = heightString.split("'");
    if (parts.length === 2) {
      const feet = parseInt(parts[0]) || 0;
      const inches = parseInt(parts[1].replace('"', '')) || 0;
      return feet * 12 + inches;
    }
    return parseInt(heightString) || 68; // Default to 68 inches if parsing fails
  };

  const handleComplete = async () => {
    try {
      // Convert and save user profile to data store
      const userProfile = {
        email: userData.email,
        gender: userData.gender as 'male' | 'female',
        height: parseHeight(userData.height),
        weight: parseInt(userData.weight) || 150,
        desiredPhysique: userData.idealPhysique,
      };

      await dataStore.saveUserProfile(userProfile);
      
      console.log('User profile saved:', userProfile);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error saving user profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onNext={() => handleNext('aboutYou')} />;
      case 'aboutYou':
        return (
          <AboutYou
            onNext={() => handleNext('idealPhysique')}
            onBack={handleBack}
            onUpdateData={handleUpdateUserData}
            userData={userData}
          />
        );
      case 'idealPhysique':
        return (
          <IdealPhysique
            onNext={() => handleNext('createAccount')}
            onBack={handleBack}
            onUpdateData={handleUpdateUserData}
            userData={userData}
          />
        );
      case 'createAccount':
        return (
          <CreateAccount
            onComplete={handleComplete}
            onBack={handleBack}
            onUpdateData={handleUpdateUserData}
            userData={userData}
          />
        );
      default:
        return <Welcome onNext={() => handleNext('aboutYou')} />;
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
    }}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1 }} edges={Platform.OS === 'ios' ? ['left', 'right'] : ['top', 'left', 'right']}>
        <View style={{ flex: 1 }}>
        {renderStep()}
      </View>
    </SafeAreaView>
    </View>
  );
} 