import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store/authSlice';
import { authApi } from '../api/authApi';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Logo } from '../assets/Logo';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
}

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    // Show a reset button if it takes too long (8s)
    const resetTimer = setTimeout(() => {
      setShowReset(true);
    }, 8000);

    const checkAuth = async () => {
      console.log('SplashScreen: Starting checkAuth...');
      const timeout = setTimeout(() => {
        console.log('SplashScreen: Timeout reached, clearing session and forcing Login.');
        dispatch(logout());
        navigation.replace('Login');
      }, 10000);

      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        console.log('SplashScreen: Tokens retrieved:', { 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken 
        });

        if (!accessToken) {
          console.log('SplashScreen: No access token, skipping auth check.');
          clearTimeout(timeout);
          navigation.replace('Login');
          return;
        }

        console.log('SplashScreen: Verifying token with /users/me...');
        const response = await authApi.getMe();
        const userData = response.data;
        console.log('SplashScreen: Auto-login success for:', userData.email);

        clearTimeout(timeout);
        
        // Derive isProfileComplete from backend data (DTO doesn't include it directly)
        // A student has a complete profile if they have a studentId
        const isProfileComplete = userData.role === 'Student' 
          ? !!userData.studentId 
          : true;

        console.log('SplashScreen: isProfileComplete =', isProfileComplete);

        // Dispatch credentials — React Navigation's conditional rendering in App.tsx 
        // will automatically show the correct screen based on isAuthenticated + isProfileComplete
        dispatch(setCredentials({ 
          user: { ...userData, isProfileComplete }, 
          accessToken: accessToken as string, 
          refreshToken: refreshToken as string 
        }));
        
        // Wait for React Navigation to re-render with the new auth state,
        // THEN navigate. Without this delay, the screen doesn't exist yet.
        setTimeout(() => {
          if (isProfileComplete) {
            navigation.replace('Home');
          } else {
            navigation.replace('ProfileSetup', {
              registrationData: {
                email: userData.email || '',
                fullName: userData.fullName || '',
              }
            });
          }
        }, 200);
      } catch (err: any) {
        clearTimeout(timeout);
        console.log('SplashScreen: Auto-login failed:', err?.message || err);
        navigation.replace('Login');
      }
    };

    checkAuth();
    return () => {
      clearTimeout(resetTimer);
    };
  }, [navigation, dispatch]);

  const handleManualReset = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      dispatch(logout());
      navigation.replace('Login');
    } catch (err) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size={80} />
        <Text style={styles.appName}>Mindtag</Text>
        <Text style={styles.tagline}>Smart Academic Presence</Text>
      </View>
      
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        {showReset && (
          <TouchableOpacity 
            style={styles.resetBtn} 
            onPress={handleManualReset}
          >
            <Text style={styles.resetText}>Stuck? Press to Reset & Log In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontFamily: FONTS.black,
    color: '#FFF',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 20,
  },
  resetBtn: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
  }
});
