import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

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
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      // Simulate async for demo; replace with real async if needed
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 1200);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ backgroundColor: Colors.dark.background }}>
      <View style={styles.container}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up or log in</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                focusedInput === 'email' && styles.inputFocused,
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput('')}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: false });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
                focusedInput === 'password' && styles.inputFocused,
              ]}
              placeholder="Create a password"
              placeholderTextColor="#aaa"
              value={password}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput('')}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: false });
              }}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>Password must be at least 6 characters</Text>
            )}
          </View>
        </View>

        <View style={styles.securityContainer}>
          <Text style={styles.securityText}>
            <Text style={styles.lockIcon}>🔒</Text> Your information is securely stored
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={[styles.socialButton, styles.socialButtonCompact, { marginBottom: 8 }]}>
          <Image source={{ uri: googleIcon }} style={styles.socialIconCompact} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.socialButtonCompact]}>
          <Image source={{ uri: appleIcon }} style={styles.socialIconCompact} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#f9f9f9',
    marginBottom: 18,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
  },
  socialButtonCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 32,
    minWidth: 0,
    borderRadius: 10,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  socialIconCompact: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: 'contain',
  },
  socialButtonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#aaa',
    fontSize: 12,
  },
  formContainer: {
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#f9f9f9',
  },
  input: {
    backgroundColor: Colors.dark.card,
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    marginBottom: 6,
  },
  inputError: {
    borderColor: Colors.dark.tint,
  },
  inputFocused: {
    borderColor: '#8b5cf6',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
    fontSize: 12,
  },
  termsContainer: {
    marginBottom: 18,
    marginTop: 10,
  },
  termsText: {
    fontSize: 11,
    color: '#f9f9f9',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#8b5cf6',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 0,
    gap: 10,
  },
  backButton: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    color: Colors.dark.icon,
    fontWeight: '700',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  securityContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  securityText: {
    color: '#8b5cf6',
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 13,
    marginRight: 4,
  },
});

export default CreateAccount;