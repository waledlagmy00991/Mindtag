import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { Input } from '../components/Input';
import { GradientButton } from '../components/GradientButton';
import { COLORS, FONTS } from '../theme/theme';
import { Logo } from '../assets/Logo';
import { ShieldCheck, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/authApi';
import { setCredentials } from '../store/authSlice';

export const RegistrationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate email domain (support .edu, .edu.eg, etc.)
    const emailDomain = email.split('@').pop()?.toLowerCase() || '';
    const isUniversityEmail = emailDomain.includes('.edu');
    if (!isUniversityEmail) {
      Alert.alert('Invalid Email', 'Please use your university email (e.g. name@nmu.edu.eg)');
      return;
    }
    if (!firstName || !lastName || !password) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters with 1 uppercase letter and 1 digit.');
      return;
    }

    setLoading(true);
    try {
      // Get device info required by backend
      const { getDevicePayload } = require('../utils/device');
      const devicePayload = await getDevicePayload();

      setLoading(false);
      navigation.navigate('ProfileSetup', { 
        registrationData: {
          email,
          password,
          fullName: `${firstName} ${lastName}`,
          ...devicePayload,
        }
      });
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Could not prepare registration. Please try again.');
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Logo />
            <Text style={styles.title}>Begin your{'\n'}intelligent journey.</Text>
            <Text style={styles.subtitle}>Join the next generation of academic{'\n'}presence.</Text>
          </View>

          {/* Verification Badge */}
          <View style={styles.verificationBadge}>
            <ShieldCheck color={COLORS.primary} size={24} style={styles.badgeIcon} />
            <View>
              <Text style={styles.badgeTitle}>VERIFIED INSTITUTION</Text>
              <Text style={styles.badgeSubtitle}>Connecting with University ID</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input 
              label="University Email" 
              placeholder="student@university.edu" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              value={email}
              onChangeText={setEmail}
            />
            <Input 
              label="First Name" 
              placeholder="e.g. John" 
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input 
              label="Last Name" 
              placeholder="e.g. Doe" 
              value={lastName}
              onChangeText={setLastName}
            />
            <Input 
              label="Create Password" 
              placeholder="••••••••" 
              isPassword 
              value={password}
              onChangeText={setPassword}
            />
            
            <View style={styles.infoBox}>
              <Info color={COLORS.textMuted} size={16} />
              <Text style={styles.infoText}>
                This device can only be linked to one account for{'\n'}security and compliance purposes.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" />
              ) : (
                <GradientButton title="Create Account" style={styles.button} onPress={handleRegister} />
              )}
            </View>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 30,
    lineHeight: 37.5,
    color: COLORS.textDefault,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textMuted,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  badgeIcon: {
    marginRight: 16,
  },
  badgeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.textDefault,
  },
  form: {
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 8,
    paddingRight: 16,
  },
  infoText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  button: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 32,
    minHeight: 56,
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});
