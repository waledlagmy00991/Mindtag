import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Bell, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import WeeklyScheduleScreen from '../screens/WeeklyScheduleScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, FONTS } from '../theme/theme';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#171F33',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.bold,
          fontSize: 10,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={WeeklyScheduleScreen} 
        options={{
          tabBarLabel: 'SCHEDULE',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="AlertsTab" 
        component={NotificationsScreen} 
        options={{
          tabBarLabel: 'ALERTS',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
