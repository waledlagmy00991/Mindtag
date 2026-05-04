import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/authApi';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      // Persist tokens
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      // Update Redux state
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      
      // Navigation is handled by RootNavigator in App.tsx
    } catch (err: any) {
      console.error('Login error details:', err.response?.data || err.message);
      const message = err.response?.data?.error?.message 
        || (err.response?.data?.errors ? 'Validation Error: ' + JSON.stringify(err.response.data.errors) : null)
        || 'Invalid email or password';
      setError(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradients */}
      <View style={styles.blurLeft} />
      <View style={styles.blurRight} />

      <View style={styles.content}>
        {/* Header Logo */}
        <View style={styles.logoRow}>
          <LinearGradient colors={['#C4C1FB', '#5DE6FF']} style={styles.logoIcon}>
            <Box size={16} color="#0F172A" />
          </LinearGradient>
          <Text style={styles.logoText}>Mindtag</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Begin your intelligent journey.</Text>
          <Text style={styles.subtitle}>Join the next generation of academic presence.</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <ShieldCheck color="#5DE6FF" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoCardTitle}>VERIFIED INSTITUTION</Text>
            <Text style={styles.infoCardText}>Connecting with University ID</Text>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="University Email"
              placeholderTextColor="#928F9A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {error && (!email || !email.includes('.edu')) && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#928F9A"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#928F9A" size={20} /> : <Eye color="#928F9A" size={20} />}
            </TouchableOpacity>
          </View>
          {error && !password && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Text style={styles.warningText}>This device can only be linked to one account</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#C4C1FB', '#5DE6FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.loginBtn, loading && { opacity: 0.7 }]}>
            {loading ? (
              <ActivityIndicator color="#0D1117" />
            ) : (
              <Text style={styles.loginBtnText}>Log In →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.registerText}>Don't have an account? <Text style={{ color: '#5DE6FF' }}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  blurLeft: {
    position: 'absolute',
    width: 200, height: 200, left: -50, top: -50,
    backgroundColor: 'rgba(30, 27, 75, 0.4)', borderRadius: 100,
  },
  blurRight: {
    position: 'absolute',
    width: 200, height: 200, right: -50, bottom: -50,
    backgroundColor: 'rgba(0, 203, 230, 0.1)', borderRadius: 100,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    color: '#F1F5F9', fontSize: 18, fontFamily: FONTS.black,
  },
  headerTextWrap: {
    gap: 8,
    marginBottom: 32,
  },
  title: {
    color: '#DAE2FD', fontSize: 32, fontFamily: FONTS.black, lineHeight: 40,
  },
  subtitle: {
    color: '#928F9A', fontSize: 14, fontFamily: FONTS.medium,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(93, 230, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
  },
  infoCardTitle: {
    color: '#5DE6FF', fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 1,
  },
  infoCardText: {
    color: '#F1F5F9', fontSize: 12, fontFamily: FONTS.medium, marginTop: 4,
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2336',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: -8,
    marginLeft: 8,
  },
  warningText: {
    color: '#928F9A', fontSize: 12, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8,
  },
  loginBtn: {
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginBtnText: {
    color: '#0D1117', fontSize: 16, fontFamily: FONTS.bold,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: '#C8C5D0', fontSize: 14, fontFamily: FONTS.medium,
  },
});
