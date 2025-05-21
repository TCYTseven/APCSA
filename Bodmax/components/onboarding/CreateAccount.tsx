import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      onUpdateData({ email, password });
      onComplete();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ backgroundColor: Colors.dark.background }}>
      <View style={styles.container}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Log in or sign up for free</Text>

        <TouchableOpacity style={styles.socialButton}>
          <Image source={{ uri: googleIcon }} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={{ uri: appleIcon }} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
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
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Create a password"
              placeholderTextColor="#aaa"
              value={password}
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

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
            <Text style={styles.createButtonText}>Create Account</Text>
          </TouchableOpacity>
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
    padding: 24,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
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
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 16,
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialButtonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#aaa',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#ccc',
  },
  input: {
    backgroundColor: Colors.dark.card,
    color: 'white',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    marginBottom: 8,
  },
  inputError: {
    borderColor: Colors.dark.tint,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    fontSize: 14,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#8b5cf6',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    flex: 1,
  },
  backButtonText: {
    color: Colors.dark.icon,
    fontWeight: '700',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
    flex: 1,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreateAccount; 