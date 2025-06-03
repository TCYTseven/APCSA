import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

// You may need to add these icons to your assets
const googleIcon = 'https://www.svgrepo.com/show/303108/google-icon-logo.svg';
const appleIcon = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';

type CreateAccountProps = {
  onComplete: () => void;
  onBack: () => void;
  onUpdateData: (data: { email: string; password: string }) => void;
  userData: {
    gender: string;
    height: string;
    weight: string;
    idealPhysique: string;
    email: string;
    password: string;
  };
};

const CreateAccount = ({ onComplete, onBack, onUpdateData, userData }: CreateAccountProps) => {
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState(userData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const emailLabelAnimation = useRef(new Animated.Value(email ? 1 : 0)).current;
  const passwordLabelAnimation = useRef(new Animated.Value(password ? 1 : 0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateLabel = (animation: Animated.Value, hasValue: boolean, isFocused: boolean) => {
    Animated.timing(animation, {
      toValue: hasValue || isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '#666' };
    if (password.length < 6) return { strength: 1, text: 'Weak', color: '#FF3B30' };
    if (password.length < 8) return { strength: 2, text: 'Fair', color: '#FFCC00' };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { strength: 3, text: 'Strong', color: '#4CD964' };
    }
    return { strength: 2, text: 'Good', color: '#FFCC00' };
  };

  const handleCreateAccount = () => {
    const newErrors = {
      email: !email || !validateEmail(email),
      password: !password || password.length < 6,
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setLoading(true);
      onUpdateData({ email, password });
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 1200);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Background Elements */}
      <View style={{ position: 'absolute', top: -100, right: -100, width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.dark.tint, opacity: 0.1 }} />
      <View style={{ position: 'absolute', bottom: -80, left: -80, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.dark.tint, opacity: 0.08 }} />

      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 20, 
          paddingTop: Math.max(40, height * 0.08), 
          paddingBottom: Math.max(20, height * 0.05),
          minHeight: height
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnimation, flex: 1, justifyContent: 'center' }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ marginBottom: 12 }}>
              <LinearGradient
                colors={[Colors.dark.tint, '#7C3AED']}
                style={{ width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="person-add" size={26} color="white" />
              </LinearGradient>
            </View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 4 }}>
              Create Account
            </Text>
            <Text style={{ fontSize: 15, color: '#9BA1A6', textAlign: 'center' }}>
              Join the fitness revolution
            </Text>
          </View>

          {/* Form Container */}
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            borderRadius: 18, 
            padding: 18, 
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            {/* Email Input */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ position: 'relative' }}>
                <Animated.Text
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: emailLabelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [13, -8],
                    }),
                    fontSize: emailLabelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 12],
                    }),
                    color: errors.email ? '#FF3B30' : focusedInput === 'email' ? Colors.dark.tint : '#9BA1A6',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    paddingHorizontal: 4,
                    zIndex: 1,
                  }}
                >
                  Email Address
                </Animated.Text>
                
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    fontSize: 15,
                    borderWidth: 2,
                    borderColor: errors.email ? '#FF3B30' : focusedInput === 'email' ? Colors.dark.tint : 'rgba(255,255,255,0.15)',
                  }}
                  placeholder=""
                  placeholderTextColor="#666"
                  value={email}
                  onFocus={() => {
                    setFocusedInput('email');
                    animateLabel(emailLabelAnimation, email.length > 0, true);
                  }}
                  onBlur={() => {
                    setFocusedInput('');
                    animateLabel(emailLabelAnimation, email.length > 0, false);
                  }}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: false });
                    animateLabel(emailLabelAnimation, text.length > 0, focusedInput === 'email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                
                {email.length > 0 && (
                  <View style={{ position: 'absolute', right: 16, top: 13 }}>
                    <Ionicons 
                      name={validateEmail(email) ? "checkmark-circle" : "close-circle"} 
                      size={18} 
                      color={validateEmail(email) ? '#4CD964' : '#FF3B30'} 
                    />
                  </View>
                )}
              </View>
              
              {errors.email && (
                <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 4, marginLeft: 4 }}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ position: 'relative' }}>
                <Animated.Text
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: passwordLabelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [13, -8],
                    }),
                    fontSize: passwordLabelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 12],
                    }),
                    color: errors.password ? '#FF3B30' : focusedInput === 'password' ? Colors.dark.tint : '#9BA1A6',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    paddingHorizontal: 4,
                    zIndex: 1,
                  }}
                >
                  Password
                </Animated.Text>
                
                <TextInput
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    paddingRight: 48,
                    fontSize: 15,
                    borderWidth: 2,
                    borderColor: errors.password ? '#FF3B30' : focusedInput === 'password' ? Colors.dark.tint : 'rgba(255,255,255,0.15)',
                  }}
                  placeholder=""
                  placeholderTextColor="#666"
                  value={password}
                  onFocus={() => {
                    setFocusedInput('password');
                    animateLabel(passwordLabelAnimation, password.length > 0, true);
                  }}
                  onBlur={() => {
                    setFocusedInput('');
                    animateLabel(passwordLabelAnimation, password.length > 0, false);
                  }}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: false });
                    animateLabel(passwordLabelAnimation, text.length > 0, focusedInput === 'password');
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: 13 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={18} 
                    color="#9BA1A6" 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password Strength */}
              {password.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ color: '#9BA1A6', fontSize: 10 }}>Password Strength</Text>
                    <Text style={{ color: passwordStrength.color, fontSize: 10, fontWeight: '600' }}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3].map((level) => (
                      <View
                        key={level}
                        style={{
                          flex: 1,
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: passwordStrength.strength >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)'
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {errors.password && (
                <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 4, marginLeft: 4 }}>
                  Password must be at least 6 characters
                </Text>
              )}
            </View>

            {/* Security Note */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'rgba(156,71,255,0.1)', borderRadius: 8 }}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.dark.tint} />
              <Text style={{ color: '#9BA1A6', fontSize: 11, marginLeft: 5 }}>
                Your data is encrypted and secure
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ marginBottom: 18 }}>
            <TouchableOpacity
              onPress={handleCreateAccount}
              disabled={loading}
              style={{ marginBottom: 10 }}
            >
              <LinearGradient
                colors={loading ? ['#666', '#666'] : [Colors.dark.tint, '#7C3AED']}
                style={{ paddingVertical: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={16} color="white" style={{ marginRight: 6 }} />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Create Account</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onBack}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 13 }}
            >
              <Text style={{ color: '#9BA1A6', fontWeight: '600', textAlign: 'center', fontSize: 14 }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <Text style={{ color: '#9BA1A6', paddingHorizontal: 10, fontSize: 11 }}>or continue with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </View>

          {/* Social Login Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <TouchableOpacity style={{ flex: 1 }}>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                paddingVertical: 11,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="logo-google" size={14} color="#4285F4" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6, fontSize: 13 }}>
                  Google
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }}>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                paddingVertical: 11,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="logo-apple" size={14} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6, fontSize: 13 }}>
                  Apple
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={{ paddingHorizontal: 6 }}>
            <Text style={{ color: '#9BA1A6', textAlign: 'center', fontSize: 10, lineHeight: 14 }}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: Colors.dark.tint, fontWeight: '600' }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: Colors.dark.tint, fontWeight: '600' }}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default CreateAccount;