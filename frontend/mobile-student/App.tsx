import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen';
import { ProfileSetupStep2Screen } from './src/screens/ProfileSetupStep2Screen';
import { ProfileSetupStep3Screen } from './src/screens/ProfileSetupStep3Screen';
import { LectureDetailsScreen } from './src/screens/LectureDetailsScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { FindCoursesScreen } from './src/screens/FindCoursesScreen';
import ScanQRScreen from './src/screens/ScanQRScreen';
import AnnouncementScreen from './src/screens/AnnouncementScreen';
import ScheduleLectureScreen from './src/screens/ScheduleLectureScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PersonalInformationScreen from './src/screens/PersonalInformationScreen';
import NoConnectionScreen from './src/screens/NoConnectionScreen';
import SecurityPrivacyScreen from './src/screens/SecurityPrivacyScreen';
import WeeklyScheduleScreen from './src/screens/WeeklyScheduleScreen';
import AttendanceHistoryScreen from './src/screens/AttendanceHistoryScreen';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import AppearanceSettingsScreen from './src/screens/AppearanceSettingsScreen';
import { View, ActivityIndicator } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/store';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { authApi } from './src/api/authApi';
import { useEffect } from 'react';


export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Registration: undefined;
  ProfileSetup: { registrationData: any };
  ProfileSetupStep2: { registrationData: any, academicData: any };
  ProfileSetupStep3: { registrationData: any, academicData: any, selectedCourses: string[] };
  LectureDetails: { lecture: any };
  Schedule: undefined;
  FindCourses: undefined;
  ScanQR: undefined;
  Announcement: undefined;
  ScheduleLecture: undefined;
  Notifications: undefined;
  Profile: undefined;
  PersonalInformation: undefined;
  NoConnection: undefined;
  SecurityPrivacy: undefined;
  WeeklySchedule: undefined;
  AttendanceHistory: { filter?: string } | undefined;
  LanguageSettings: undefined;
  AppearanceSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root Navigator that checks auth state
const RootNavigator = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="NoConnection" component={NoConnectionScreen} />
      
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
          {/* Onboarding flow accessible during registration */}
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="ProfileSetupStep2" component={ProfileSetupStep2Screen} />
          <Stack.Screen name="ProfileSetupStep3" component={ProfileSetupStep3Screen} />
        </>
      ) : (
        <>
          {/* Force student onboarding ONLY for students with incomplete profiles */}
          {user?.role === 'Student' && !user?.isProfileComplete ? (
            <>
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              <Stack.Screen name="ProfileSetupStep2" component={ProfileSetupStep2Screen} />
              <Stack.Screen name="ProfileSetupStep3" component={ProfileSetupStep3Screen} />
            </>
          ) : (
            <>
              {/* Stable Tab Navigation for Core Screens */}
              <Stack.Screen name="Home" component={MainTabNavigator} />
              
              {/* Individual Stack Screens (Modals or Push) */}
              <Stack.Screen name="LectureDetails" component={LectureDetailsScreen} />
              <Stack.Screen name="FindCourses" component={FindCoursesScreen} />
              <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ presentation: 'modal' }} />
              <Stack.Screen name="Announcement" component={AnnouncementScreen} />
              <Stack.Screen name="ScheduleLecture" component={ScheduleLectureScreen} options={{ presentation: 'modal' }} />
              <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
              <Stack.Screen name="SecurityPrivacy" component={SecurityPrivacyScreen} />
              <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
              <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
              <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1326' }}>
        <ActivityIndicator size="large" color="#5DE6FF" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
