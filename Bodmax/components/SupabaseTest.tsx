import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const { user, profile, signOut, loading } = useAuth();
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      console.log('🔌 Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        Alert.alert('Connection Failed', error.message);
      } else {
        console.log('✅ Supabase connection successful');
        Alert.alert('Success', 'Supabase connection is working!');
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  const testSignup = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing signup with dummy data...');
      
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'test123456';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            gender: 'male',
            height: 68,
            weight: 150,
            desired_physique: 'athletic'
          }
        }
      });

      if (error) {
        console.error('❌ Test signup failed:', error);
        Alert.alert('Signup Test Failed', error.message);
      } else {
        console.log('✅ Test signup successful:', data.user?.id);
        Alert.alert('Success', 'Test signup worked! User created: ' + data.user?.email);
        
        // Clean up - sign out the test user
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('❌ Test signup error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Test Panel</Text>
      
      <View style={styles.status}>
        <Text style={styles.statusText}>
          Loading: {loading ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.statusText}>
          User: {user ? user.email : 'Not signed in'}
        </Text>
        <Text style={styles.statusText}>
          Profile: {profile ? 'Loaded' : 'None'}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testSignup}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Signup'}
        </Text>
      </TouchableOpacity>

      {user && (
        <TouchableOpacity 
          style={[styles.button, styles.signOutButton]} 
          onPress={signOut}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  status: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 