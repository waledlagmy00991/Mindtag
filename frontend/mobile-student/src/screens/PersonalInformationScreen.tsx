import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, FONTS } from '../theme/theme';
import { ArrowLeft, Home, Calendar, Bell, User, Edit2, Lock, BadgeCheck, ChevronDown, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { authApi } from '../api/authApi';
import { ActivityIndicator, Alert } from 'react-native';

type PersonalInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalInformation'>;

interface Props {
  navigation: PersonalInformationScreenNavigationProp;
}

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Masters'];

export default function PersonalInformationScreen({ navigation }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [activeYear, setActiveYear] = useState(user?.year || 'Year 1');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = { name, year: activeYear };
      await authApi.updateProfile(updatedData);
      dispatch(updateUser(updatedData));
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity style={styles.headerRight} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Setup */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              <View style={styles.avatarPlaceholder} />
            </View>
            <TouchableOpacity style={styles.cameraBadge}>
              <Camera color="#0F172A" size={14} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>STUDENT PROFILE PHOTO</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#94A3B8"
              />
              <Edit2 color="#94A3B8" size={18} />
            </View>
          </View>
 
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>UNIVERSITY EMAIL</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={user?.email || ''}
                placeholderTextColor="#94A3B8"
                editable={false}
              />
              <Lock color="#94A3B8" size={18} />
            </View>
          </View>
 
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>STUDENT ID</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={user?.studentId || ''}
                placeholderTextColor="#94A3B8"
                editable={false}
              />
              <BadgeCheck color="#94A3B8" size={18} />
            </View>
          </View>
 
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DEPARTMENT</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>{user?.department || 'Unassigned'}</Text>
              <Lock color="#94A3B8" size={18} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ACADEMIC YEAR</Text>
            <View style={styles.yearsGrid}>
              {YEARS.map(year => {
                const isActive = year === activeYear;
                return (
                  <TouchableOpacity 
                    key={year}
                    style={[styles.yearPill, isActive && styles.yearPillActive]}
                    onPress={() => setActiveYear(year)}
                  >
                    <Text style={[styles.yearPillText, isActive && styles.yearPillTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <LinearGradient
            colors={['#A5B4FC', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButtonBg}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Tab Bar Dummy */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Schedule')}>
          <Calendar color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItemActive} onPress={() => navigation.navigate('Profile')}>
          <LinearGradient
            colors={['#A5B4FC', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabIconGradient}
          >
            <User color="#0F172A" size={24} fill="#0F172A" />
          </LinearGradient>
          <Text style={styles.tabTextActive}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  headerRight: {
    padding: 4,
  },
  saveText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 130, // space for tab bar
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FCA5A5', // In Figma image it looked kind of amber/coral or cyan gradient. Actually looked cyan/coral gradient but fall back to coral.
    padding: 3,
    marginBottom: 16,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: '#FDBA74', // Phone mockup bg
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#FFEDD5',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  avatarLabel: {
    color: '#DAE2FD',
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  formContainer: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#DAE2FD',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#C8C5D0', // It looks slightly greyed out
    fontSize: 16,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  inputText: {
    flex: 1,
    color: '#C8C5D0',
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  yearPill: {
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  yearPillActive: {
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  yearPillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  yearPillTextActive: {
    color: COLORS.primary,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 16,
  },
  gradientButtonBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
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
});
