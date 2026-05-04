import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Assuming this exists
import { COLORS, FONTS } from '../theme/theme';
import { X, Book, Clock, MapPin, User, Globe, CheckCircle2, Home, Calendar, Bell } from 'lucide-react-native';

type ScheduleLectureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScheduleLecture'>;

interface Props {
  navigation: ScheduleLectureScreenNavigationProp;
}

export default function ScheduleLectureScreen({ navigation }: Props) {
  const [subjectName, setSubjectName] = useState('');
  const [showSubjectError, setShowSubjectError] = useState(true); // default true just to show UI state from Figma

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        {/* Glow Effects */}
        <View style={[styles.glowOrb, styles.glowOrbTop]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X color="#C8C5D0" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.logoIndicator} />
          <Text style={styles.headerLogoText}>Mindtag</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerRightText}>Lecture Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.subtitleTag}>ACADEMIC MANAGEMENT</Text>
          <Text style={styles.title}>Schedule Lecture</Text>
          <Text style={styles.subtitle}>Organize your academic sessions with precision.</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {/* Subject Name */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputBox, showSubjectError && styles.inputBoxError]}>
              <Book color="#94A3B8" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Subject Name"
                placeholderTextColor="#94A3B8"
                value={subjectName}
                onChangeText={(text) => {
                  setSubjectName(text);
                  setShowSubjectError(text.length === 0);
                }}
              />
            </View>
            {showSubjectError && (
              <Text style={styles.errorText}>PLEASE ENTER A VALID SUBJECT NAME</Text>
            )}
          </View>

          {/* Start Time */}
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.inputBox}>
              <Clock color="#94A3B8" size={20} />
              <View style={styles.inputStack}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <Text style={styles.inputValuePlaceholder}>--:-- --</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* End Time */}
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.inputBox}>
              <Clock color="#94A3B8" size={20} />
              <View style={styles.inputStack}>
                <Text style={styles.inputLabel}>End Time</Text>
                <Text style={styles.inputValuePlaceholder}>--:-- --</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <MapPin color="#94A3B8" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Location (Optional)"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Instructor Name */}
          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <User color="#94A3B8" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Instructor Name (Optional)"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Translation Info Card */}
        <View style={styles.infoCard}>
          <Globe color={COLORS.purple} size={24} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Mindtag supports multi-language inputs. Feel free to use Arabic (عربي) for subject and location names.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={['#A5B4FC', '#22D3EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonBg}
            >
              <CheckCircle2 color="#0F172A" size={20} />
              <Text style={styles.primaryButtonText}>Save Lecture</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Tab Bar (Dummy) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItemActive} onPress={() => navigation.navigate('Schedule')}>
          <Calendar color="#0F172A" size={20} />
          <Text style={styles.tabTextActive}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Bell color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <User color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Profile</Text>
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
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowOrbTop: {
    width: 400,
    height: 400,
    right: -100,
    top: -100,
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#A5B4FC',
  },
  headerLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.extraBold,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerRightText: {
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitleTag: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: FONTS.extraBold,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64, // Matches Figma height approx
    gap: 16,
  },
  inputBoxError: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  inputStack: {
    justifyContent: 'center',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  inputValuePlaceholder: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  errorText: {
    color: '#FCA5A5', // Soft red
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.6)', // Deep purple tint
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    color: '#C4C1FB',
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButtonBg: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
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
    paddingBottom: 32, // Safe area padding manually added
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#0F172A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
