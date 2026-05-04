import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, FONTS } from '../theme/theme';
import { Home, Calendar, Bell, User, Clock, ChevronRight, CheckCircle2, Shield, Globe, Moon, LogOut, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { authApi } from '../api/authApi';
import * as SecureStore from 'expo-secure-store';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      dispatch(logout());
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIndicator} />
          <Text style={styles.headerLogoText}>Mindtag</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={() => navigation.navigate('Notifications')}>
          <Bell color={COLORS.purple} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card / Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              <View style={styles.avatarPlaceholder} />
            </View>
            <View style={styles.verifiedBadge}>
              <CheckCircle2 color="#0F172A" size={12} fill={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.profileName}>{user?.fullName || 'Student'}</Text>
          <Text style={styles.profileId}>ID: {user?.studentId || '#MT-' + user?.id?.substring(0, 6).toUpperCase()}</Text>
          
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{user?.department?.toUpperCase() || 'COMPUTER SCIENCE'}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{user?.year ? `YEAR ${user.year}` : 'YEAR 1'}</Text>
            </View>
          </View>
        </View>

        {/* Manage Routine Card */}
        <TouchableOpacity style={styles.routineCard} onPress={() => navigation.navigate('WeeklySchedule')}>
          <View style={styles.routineContent}>
            <Text style={styles.routineTag}>MANAGE ROUTINE</Text>
            <Text style={styles.routineTitle}>Edit Weekly Schedule</Text>
            <Text style={styles.routineDesc}>Optimize your class hours and laboratory sessions.</Text>
          </View>
          <View style={styles.routineIconBox}>
            <Calendar color={COLORS.primary} size={24} />
          </View>
        </TouchableOpacity>

        {/* Account Details */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
          
          <TouchableOpacity 
            style={styles.listItem} 
            onPress={() => navigation.navigate('PersonalInformation')}
          >
            <View style={styles.listIconBox}>
              <User color={COLORS.textMuted} size={20} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Personal Information</Text>
              <Text style={styles.listDesc}>Name, email, and contact details</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('SecurityPrivacy')}>
            <View style={styles.listIconBox}>
              <Shield color={COLORS.textMuted} size={20} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Security & Privacy</Text>
              <Text style={styles.listDesc}>2FA, password, and privacy control</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <View style={styles.listIconBox}>
              <Globe color={COLORS.textMuted} size={20} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Language</Text>
              <Text style={styles.listDesc}>English (United States)</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('AppearanceSettings')}
          >
            <View style={styles.listIconBox}>
              <Moon color={COLORS.textMuted} size={20} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Appearance</Text>
              <Text style={styles.listDesc}>Dark mode, theme preference</Text>
            </View>
            <ChevronRight color={COLORS.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#FCA5A5" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>MINDTAG VERSION 2.4.0 (GOLD)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#818CF8',
  },
  headerLogoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  headerRight: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 130, // space for tab bar
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 3,
    marginBottom: 16,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: '#2D3449',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    marginBottom: 4,
  },
  profileId: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(23, 31, 51, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  routineCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.4)', // Dark purple tint
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.1)',
  },
  routineContent: {
    flex: 1,
    paddingRight: 16,
  },
  routineTag: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  routineTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  routineDesc: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  routineIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  listDesc: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
    gap: 12,
  },
  logoutText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  versionText: {
    color: '#475569',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 31, 51, 0.85)',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32, // Safe area
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabIconGradient: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tabTextActive: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});
