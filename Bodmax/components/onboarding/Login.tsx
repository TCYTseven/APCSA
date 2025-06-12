import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../lib/AuthContext';

type LoginProps = {
  onBack: () => void;
};

const Login = ({ onBack }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  // Animation values
  const emailLabelAnimation = useRef(new Animated.Value(0)).current;
  const passwordLabelAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const toastAnimation = useRef(new Animated.Value(0)).current;

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

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    
    // Animate toast in
    Animated.timing(toastAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(toastAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        setToastMessage('');
      });
    }, 3000);
  };

  const handleLogin = async () => {
    const newErrors = {
      email: !email || !validateEmail(email),
      password: !password || password.length < 6,
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setLoading(true);
      try {
        await signIn(email, password);
        
        // Navigate to main app after successful login
        router.push('/(tabs)');
      } catch (error) {
        console.error('❌ Login error:', error);
        
        // Show temporary toast instead of alert
        const errorMessage = error instanceof Error ? error.message : 'Invalid email or password. Please try again.';
        showToastMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Elements */}
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.dark.tint, '#7C3AED']}
              style={styles.iconGradient}
            >
              <Ionicons name="log-in" size={26} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
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
                  size={20} 
                  color="#9BA1A6" 
                />
              </TouchableOpacity>
            </View>
            
            {errors.password && (
              <Text style={styles.errorText}>
                Password must be at least 6 characters
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            <LinearGradient
              colors={loading ? ['#666', '#666'] : [Colors.dark.tint, '#7C3AED']}
              style={styles.loginButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in" size={16} color="white" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View 
          style={[
            styles.toast,
            {
              opacity: toastAnimation,
              transform: [{
                translateY: toastAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons name="warning" size={18} color="#FF3B30" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
  },
  actionButtons: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    marginBottom: 16,
  },
  loginButtonGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: Colors.dark.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

export default Login; 