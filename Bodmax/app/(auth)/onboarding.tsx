import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const steps = ['welcome', 'gender', 'height', 'weight', 'idealPhysique', 'createAccount'];

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

  const handleComplete = () => {
    // In a real app, this would submit data to the backend
    console.log('User data collected:', userData);
    router.push('/(tabs)');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onNext={() => handleNext('gender')} />;
      case 'gender':
        return (
          <AboutYou
            step="gender"
            onNext={() => handleNext('height')}
            onBack={handleBack}
            onUpdateData={handleUpdateUserData}
            userData={userData}
          />
        );
      case 'height':
        return (
          <AboutYou
            step="height"
            onNext={() => handleNext('weight')}
            onBack={handleBack}
            onUpdateData={handleUpdateUserData}
            userData={userData}
          />
        );
      case 'weight':
        return (
          <AboutYou
            step="weight"
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
        return <Welcome onNext={() => handleNext('gender')} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {renderStep()}
      </View>
    </SafeAreaView>
  );
} 