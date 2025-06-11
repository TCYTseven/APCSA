import { useAuth } from '@/lib/AuthContext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AboutYou from '../../components/onboarding/AboutYou';
import CreateAccount from '../../components/onboarding/CreateAccount';
import IdealPhysique from '../../components/onboarding/IdealPhysique';
import Login from '../../components/onboarding/Login';
import Welcome from '../../components/onboarding/Welcome';

type UserData = {
  gender: string;
  height: string;
  weight: string;
  idealPhysique: string;
  email: string;
  password: string;
}

const steps = ['welcome', 'aboutYou', 'idealPhysique', 'createAccount', 'login'];

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

  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNext = (step: string) => {
    setCurrentStep(step);
  };

  const handleLogin = () => {
    setCurrentStep('login');
  };

  const handleBackToWelcome = () => {
    setCurrentStep('welcome');
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
      console.log('🚀 Starting Supabase signup process...');
      
      // Use Supabase authentication signup
      await signUp({
        email: userData.email,
        password: userData.password,
        gender: userData.gender as 'male' | 'female',
        height: parseHeight(userData.height),
        weight: parseInt(userData.weight) || 150,
        desired_physique: userData.idealPhysique,
      });

      console.log('✅ User signup completed successfully');
      
      // Navigate to main app - user is now authenticated
      router.push('/(tabs)');
    } catch (error) {
      console.error('❌ Error during signup:', error);
      Alert.alert(
        'Signup Error', 
        error instanceof Error ? error.message : 'Failed to create your account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onNext={() => handleNext('aboutYou')} onLogin={handleLogin} />;
      case 'login':
        return <Login onBack={handleBackToWelcome} />;
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
        return <Welcome onNext={() => handleNext('aboutYou')} onLogin={handleLogin} />;
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