import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Megaphone, ClipboardList, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../components/GradientBackground';
import { GradientButton } from '../components/GradientButton';
import { COLORS, FONTS } from '../theme/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/authApi';
import * as SecureStore from 'expo-secure-store';

type ProfileSetupStep3RouteProp = RouteProp<RootStackParamList, 'ProfileSetupStep3'>;

const FEATURES = [
  {
    id: 1,
    title: 'Lecture Reminders',
    subtitle: 'Never miss the start of a session.',
    icon: <Clock size={20} color={COLORS.primary} />
  },
  {
    id: 2,
    title: 'Professor Announcements',
    subtitle: 'Real-time updates from your faculty.',
    icon: <Megaphone size={20} color={COLORS.primary} />
  },
  {
    id: 3,
    title: 'Attendance Alerts',
    subtitle: 'Instant confirmation of your presence.',
    icon: <ClipboardList size={20} color={COLORS.primary} />
  }
];

export const ProfileSetupStep3Screen = () => {
  const route = useRoute<ProfileSetupStep3RouteProp>();
  const { registrationData, academicData, selectedCourses } = route.params;
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const handleFinish = async () => {
    setLoading(true);
    try {
      const yearMap: { [key: string]: number } = {
        '1st Year': 1,
        '2nd Year': 2,
        '3rd Year': 3,
        '4th Year': 4,
        'Masters': 5
      };
      
      const registrationPayload = {
        ...registrationData,
        ...academicData,
        year: yearMap[academicData.year] || 1,
        role: 'Student',
        courseIds: selectedCourses,
      };

      console.log('Finalizing Registration with payload:', JSON.stringify(registrationPayload, null, 2));
      
      const response = await authApi.register(registrationPayload);
      const { user, accessToken, refreshToken } = response.data;

      // Notification setup is skipped in Expo Go (SDK 53+ removed remote notification support).
      // In a production/dev build, we would request permissions and register FCM token here.
      console.log('Registration successful — notification setup deferred to production build.');

      // Persist tokens
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      // Update Redux state
      dispatch(setCredentials({ 
        user: { ...user, isProfileComplete: true }, 
        accessToken, 
        refreshToken 
      }));
      
      // RootNavigator will handle navigation to Home because isAuthenticated becomes true
    } catch (err: any) {
      console.error('Registration Finalization Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error?.message 
        || (err.response?.data?.errors ? 'Validation Error: ' + JSON.stringify(err.response.data.errors) : null)
        || 'Registration failed at the last step. Please try again.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Progress Header */}
            <View style={styles.progressContainer}>
              <View style={styles.dotsRow}>
                <View style={styles.dotInactive} />
                <View style={styles.dotInactive} />
                <View style={styles.dotActiveContainer}>
                  <LinearGradient
                    colors={[COLORS.purple, COLORS.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dotActive}
                  />
                </View>
              </View>
              <Text style={styles.stepText}>STEP 3 OF 3</Text>
            </View>

            {/* Titles */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Stay on top of your classes</Text>
            </View>

            {/* Big Bell Icon */}
            <View style={styles.heroIconContainer}>
              <View style={styles.heroGlow}>
                <Bell size={64} fill={COLORS.primary} color={COLORS.primary} />
              </View>
            </View>

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              {FEATURES.map(feature => (
                <View key={feature.id} style={styles.featureCard}>
                  <View style={styles.iconBox}>{feature.icon}</View>
                  <View style={styles.featureTexts}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Footer Actions */}
            <View style={styles.footer}>
              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <Lock size={12} color={COLORS.textMuted} />
                <Text style={styles.securityText}>YOUR DATA IS ENCRYPTED AND PRIVATE</Text>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <GradientButton 
                  title="Enable Notifications & Finish" 
                  onPress={handleFinish} 
                />
              )}
              
              <TouchableOpacity 
                style={styles.skipContainer} 
                activeOpacity={0.7} 
                onPress={handleFinish}
                disabled={loading}
              >
                <Text style={styles.skipText}>Not now, just finish</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D3449',
  },
  dotActiveContainer: {
    width: 24,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotActive: {
    flex: 1,
  },
  stepText: {
    color: '#D1D5DB',
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textDefault,
    fontFamily: FONTS.extraBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  heroIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  heroGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(93, 230, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2D3449',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTexts: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  featureSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    gap: 16,
    marginTop: 'auto',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.40)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 8,
  },
  securityText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  skipText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
});
