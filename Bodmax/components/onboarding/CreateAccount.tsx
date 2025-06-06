import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

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

  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Elements */}
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { 
          paddingBottom: insets.bottom + 20,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.dark.tint, '#7C3AED']}
                style={styles.iconGradient}
              >
                <Ionicons name="person-add" size={26} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the fitness revolution</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: emailLabelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [13, -8],
                      }),
                      fontSize: emailLabelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 12],
                      }),
                      color: errors.email ? '#FF3B30' : focusedInput === 'email' ? Colors.dark.tint : '#9BA1A6',
                    }
                  ]}
                >
                  Email Address
                </Animated.Text>
                
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: errors.email ? '#FF3B30' : focusedInput === 'email' ? Colors.dark.tint : 'rgba(255,255,255,0.15)',
                    }
                  ]}
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
                  <View style={styles.validationIcon}>
                    <Ionicons 
                      name={validateEmail(email) ? "checkmark-circle" : "close-circle"} 
                      size={18} 
                      color={validateEmail(email) ? '#4CD964' : '#FF3B30'} 
                    />
                  </View>
                )}
              </View>
              
              {errors.email && (
                <Text style={styles.errorText}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: passwordLabelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [13, -8],
                      }),
                      fontSize: passwordLabelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 12],
                      }),
                      color: errors.password ? '#FF3B30' : focusedInput === 'password' ? Colors.dark.tint : '#9BA1A6',
                    }
                  ]}
                >
                  Password
                </Animated.Text>
                
                <TextInput
                  style={[
                    styles.textInput,
                    styles.passwordInput,
                    {
                      borderColor: errors.password ? '#FF3B30' : focusedInput === 'password' ? Colors.dark.tint : 'rgba(255,255,255,0.15)',
                    }
                  ]}
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
                  style={styles.passwordToggle}
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
                <View style={styles.passwordStrength}>
                  <View style={styles.passwordStrengthHeader}>
                    <Text style={styles.passwordStrengthLabel}>Password Strength</Text>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                  <View style={styles.passwordStrengthBars}>
                    {[1, 2, 3].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.passwordStrengthBar,
                          {
                            backgroundColor: passwordStrength.strength >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)'
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {errors.password && (
                <Text style={styles.errorText}>
                  Password must be at least 6 characters
                </Text>
              )}
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.dark.tint} />
              <Text style={styles.securityText}>
                Your data is encrypted and secure
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleCreateAccount}
              disabled={loading}
              style={styles.createButton}
            >
              <LinearGradient
                colors={loading ? ['#666', '#666'] : [Colors.dark.tint, '#7C3AED']}
                style={styles.createButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={16} color="white" style={styles.buttonIcon} />
                    <Text style={styles.createButtonText}>Create Account</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialButtonContent}>
                <Ionicons name="logo-google" size={14} color="#4285F4" />
                <Text style={styles.socialButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialButtonContent}>
                <Ionicons name="logo-apple" size={14} color="white" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.tint,
    opacity: 0.1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.dark.tint,
    opacity: 0.08,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 2,
  },
  passwordInput: {
    paddingRight: 48,
  },
  validationIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  passwordStrength: {
    marginTop: 8,
  },
  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  passwordStrengthLabel: {
    color: '#9BA1A6',
    fontSize: 10,
  },
  passwordStrengthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  passwordStrengthBars: {
    flexDirection: 'row',
    gap: 2,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(156,71,255,0.1)',
    borderRadius: 8,
    marginTop: 4,
  },
  securityText: {
    color: '#9BA1A6',
    fontSize: 11,
    marginLeft: 6,
  },
  actionButtons: {
    marginBottom: 24,
  },
  createButton: {
    marginBottom: 12,
  },
  createButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  backButtonText: {
    color: '#9BA1A6',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dividerText: {
    color: '#9BA1A6',
    paddingHorizontal: 12,
    fontSize: 11,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
  },
  socialButtonContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 13,
  },
  terms: {
    paddingHorizontal: 8,
  },
  termsText: {
    color: '#9BA1A6',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 14,
  },
  termsLink: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
});

export default CreateAccount;