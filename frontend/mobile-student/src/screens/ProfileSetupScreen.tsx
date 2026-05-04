import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Animated, Dimensions, TextInput, KeyboardAvoidingView } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';
import { GradientBackground } from '../components/GradientBackground';
import { Input } from '../components/Input';
import { GradientButton } from '../components/GradientButton';
import { Lock, ChevronDown, Info, Search, X, Plus, Bell, Clock, Megaphone, ClipboardList } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { courseApi } from '../api/courseApi';
import { authApi } from '../api/authApi';
import { updateUser } from '../store/authSlice';
import { useEffect } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

const { width } = Dimensions.get('window');
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'];

type ProfileSetupRouteProp = RouteProp<RootStackParamList, 'ProfileSetup'>;

const DEPARTMENTS = [
  'Engineering', 
  'Computer Science', 
  'Medicine', 
  'Dentistry', 
  'Pharmacy', 
  'Business Administration'
];

export const ProfileSetupScreen = () => {
  const route = useRoute<ProfileSetupRouteProp>();
  const { registrationData } = route.params;
  
  const [selectedYear, setSelectedYear] = useState('1st Year');
  const [studentId, setStudentId] = useState('');
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[1]); // Default to CS
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const handleContinue = async () => {
    if (!studentId) {
      Alert.alert('Error', 'Please enter your Student ID');
      return;
    }

    setLoading(true);
    // Accumulate data and move to course selection
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ProfileSetupStep2', {
        registrationData,
        academicData: {
          studentId,
          department: selectedDept,
          year: selectedYear
        }
      });
    }, 500);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <Text style={styles.navLogo}>Mindtag</Text>
          <TouchableOpacity onPress={() => dispatch(updateUser({ isProfileComplete: true }))}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
          <Text style={styles.stepText}>STEP 1 OF 3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.stepContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about{'\n'}yourself</Text>
            <Text style={styles.subtitle}>Let's set up your academic profile to personalize your experience.</Text>
          </View>
          <View style={styles.form}>
            <Input 
              label="STUDENT ID" 
              placeholder="#MT-000000"
              value={studentId} 
              onChangeText={setStudentId}
              rightIcon={<Lock color={COLORS.textMuted} size={20} />} 
            />
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>DEPARTMENT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptPillWrapper}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity 
                    key={dept} 
                    style={[styles.pill, selectedDept === dept && styles.pillActive]} 
                    onPress={() => setSelectedDept(dept)}
                  >
                    <Text style={[styles.pillText, selectedDept === dept && styles.pillTextActive]}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.yearContainer}>
              <Text style={styles.yearLabel}>ACADEMIC YEAR</Text>
              <View style={styles.pillWrapper}>
                {YEARS.map((year) => (
                  <TouchableOpacity key={year} style={[styles.pill, selectedYear === year && styles.pillActive]} onPress={() => setSelectedYear(year)}>
                    <Text style={[styles.pillText, selectedYear === year && styles.pillTextActive]}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.securityBox}>
            <Info color={COLORS.primary} size={20} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Security & Privacy</Text>
              <Text style={styles.securitySubtitle}>Your Student ID is verified against the university database. This information remains private.</Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <GradientButton title="Continue" onPress={handleContinue} />
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  navLogo: { color: '#A5B4FC', fontSize: 20, fontFamily: FONTS.black },
  skipText: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semiBold, textTransform: 'uppercase' },
  progressContainer: { alignItems: 'center', marginVertical: 20 },
  progressBarWrapper: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  progressSegment: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#2D3449' },
  progressActive: { backgroundColor: COLORS.primary },
  stepText: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1 },
  slidesWrapper: { flex: 1, overflow: 'hidden' },
  slidesContainer: { flexDirection: 'row', width: width * 3 },
  stepContainer: { width: width, paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  title: { color: COLORS.textDefault, fontSize: 32, fontFamily: FONTS.extraBold, lineHeight: 40, marginBottom: 12 },
  subtitle: { color: COLORS.textMuted, fontSize: 16, fontFamily: FONTS.regular, lineHeight: 24 },
  subtitleSmall: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.regular, lineHeight: 22 },
  form: { marginBottom: 32 },
  fieldContainer: { marginTop: 16, marginBottom: 8 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.bold, marginBottom: 8 },
  deptPillWrapper: { gap: 10, paddingRight: 20 },
  yearContainer: { marginTop: 16 },
  yearLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.bold, marginBottom: 12 },
  pillWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.inputBg },
  pillActive: { backgroundColor: 'rgba(93, 230, 255, 0.1)', borderWidth: 1, borderColor: COLORS.primary },
  pillText: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.medium },
  pillTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  securityBox: { flexDirection: 'row', backgroundColor: '#131B2E', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(93, 230, 255, 0.2)' },
  securityTitle: { color: COLORS.textDefault, fontSize: 14, fontFamily: FONTS.bold, marginBottom: 4 },
  securitySubtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular, lineHeight: 18 },
  headerContainer: { marginBottom: 24 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222A3D', borderRadius: 20, paddingHorizontal: 16, height: 50, marginBottom: 24 },
  searchInput: { flex: 1, color: COLORS.textDefault, fontFamily: FONTS.regular, fontSize: 15, marginLeft: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.bold, marginBottom: 12 },
  addedContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 27, 75, 0.4)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(71, 70, 79, 0.2)' },
  addedCode: { color: '#C4C1FB', fontSize: 11, fontFamily: FONTS.bold, marginRight: 6 },
  addedName: { color: COLORS.textMuted, fontSize: 11 },
  suggestedContainer: { gap: 10 },
  suggestedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#131B2E', borderRadius: 20, padding: 12 },
  suggestedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deptBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#2D3449', justifyContent: 'center', alignItems: 'center' },
  deptText: { color: COLORS.primary, fontSize: 10, fontFamily: FONTS.bold },
  suggestedCode: { color: COLORS.textDefault, fontSize: 13, fontFamily: FONTS.bold },
  suggestedName: { color: COLORS.textMuted, fontSize: 11 },
  heroIconContainer: { alignItems: 'center', marginVertical: 30 },
  heroGlow: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(93, 230, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  featuresContainer: { gap: 12, marginBottom: 30 },
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 20, padding: 16, gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2D3449', justifyContent: 'center', alignItems: 'center' },
  featureTitle: { color: COLORS.textDefault, fontSize: 14, fontFamily: FONTS.bold },
  featureSubtitle: { color: COLORS.textMuted, fontSize: 12 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  securityTextShort: { color: COLORS.textMuted, fontSize: 9, fontFamily: FONTS.bold },
  footer: { padding: 24, gap: 12 },
  backLink: { alignSelf: 'center', padding: 8 },
  backLinkText: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.medium },
});
