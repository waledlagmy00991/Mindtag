import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../components/GradientBackground';
import { GradientButton } from '../components/GradientButton';
import { COLORS, FONTS } from '../theme/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { courseApi } from '../api/courseApi';

type ProfileSetupStep2RouteProp = RouteProp<RootStackParamList, 'ProfileSetupStep2'>;

export const ProfileSetupStep2Screen = () => {
  const route = useRoute<ProfileSetupStep2RouteProp>();
  const { registrationData, academicData } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from:', `${require('../api/client').BASE_URL}/courses`);
      console.log('Department filter:', academicData.department);
      const response = await courseApi.getCourses({ department: academicData.department, limit: 100 });
      console.log('Courses API raw response:', JSON.stringify(response.data, null, 2));
      
      // Backend returns { success: true, data: { items: [...], totalCount, ... } }
      const body = response.data;
      let courses: any[] = [];
      
      if (body?.data?.items) {
        // Standard paginated response
        courses = body.data.items;
      } else if (body?.data && Array.isArray(body.data)) {
        // Direct array response
        courses = body.data;
      } else if (Array.isArray(body)) {
        // Raw array
        courses = body;
      }
      
      console.log(`Loaded ${courses.length} courses`);
      setAllCourses(courses);
    } catch (err: any) {
      console.error('=== COURSES FETCH ERROR ===');
      console.error('Error type:', err?.constructor?.name);
      console.error('Error message:', err?.message);
      console.error('Error code:', err?.code);
      console.error('Response status:', err?.response?.status);
      console.error('Response data:', JSON.stringify(err?.response?.data));
      console.error('Request URL:', err?.config?.url);
      console.error('Request baseURL:', err?.config?.baseURL);
      console.error('=== END ERROR ===');
      
      let errorDetail = 'Network Error';
      if (err?.code === 'ECONNABORTED') {
        errorDetail = 'Request timed out - server may be slow';
      } else if (err?.code === 'ERR_NETWORK') {
        errorDetail = 'Cannot reach server - check internet or HTTP cleartext settings';
      } else if (err?.response?.status) {
        errorDetail = `Server error: ${err.response.status}`;
      } else if (err?.message) {
        errorDetail = err.message;
      }
      
      Alert.alert('Error', `Failed to load courses: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const toggleCourse = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter(c => c !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const filteredCourses = allCourses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCoursesData = allCourses.filter(c => selectedCourseIds.includes(c.id));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Progress Header */}
              <View style={styles.progressContainer}>
                <View style={styles.dotsRow}>
                  <View style={styles.dotInactive} />
                  <View style={styles.dotActiveContainer}>
                    <LinearGradient
                      colors={[COLORS.purple, COLORS.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.dotActive}
                    />
                  </View>
                  <View style={styles.dotInactive} />
                </View>
                <Text style={styles.stepText}>STEP 2 OF 3</Text>
              </View>

              {/* Titles */}
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Add your courses</Text>
                <Text style={styles.subtitle}>
                  Select the courses you're currently tracking. We'll synchronize your schedule and alerts automatically.
                </Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Search size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search course code or name..."
                  placeholderTextColor="rgba(200, 197, 208, 0.50)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Added Courses */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ADDED ({selectedCourseIds.length})</Text>
                <View style={styles.addedContainer}>
                  {selectedCoursesData.map((course) => (
                    <TouchableOpacity 
                      key={course.id} 
                      style={styles.addedPill} 
                      activeOpacity={0.8}
                      onPress={() => toggleCourse(course.id)}
                    >
                      <Text style={styles.addedCode}>{course.code}</Text>
                      <Text style={styles.addedName}>{course.name}</Text>
                      <X size={12} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                  {selectedCourseIds.length === 0 && (
                    <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>No courses added yet.</Text>
                  )}
                </View>
              </View>

              {/* Suggested Courses */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SUGGESTED COURSES</Text>
                <View style={styles.suggestedContainer}>
                  {filteredCourses.filter(c => !selectedCourseIds.includes(c.id)).map((course) => (
                    <TouchableOpacity 
                      key={course.id} 
                      style={styles.suggestedCard} 
                      activeOpacity={0.9}
                      onPress={() => toggleCourse(course.id)}
                    >
                      <View style={styles.suggestedLeft}>
                        <View style={styles.deptBox}>
                          <Text style={styles.deptText}>{course.code.substring(0, 3)}</Text>
                        </View>
                        <View>
                          <Text style={styles.suggestedCode}>{course.code}</Text>
                          <Text style={styles.suggestedName}>{course.name}</Text>
                        </View>
                      </View>
                      <View style={styles.addBox}>
                        <Plus size={16} color={COLORS.textMuted} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <GradientButton 
                  title="Continue" 
                  onPress={() => navigation.navigate('ProfileSetupStep3', {
                    registrationData,
                    academicData,
                    selectedCourses: selectedCourseIds
                  })} 
                />
                <TouchableOpacity style={styles.skipContainer} activeOpacity={0.7} onPress={() => navigation.replace('Home')}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    color: COLORS.textDefault,
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222A3D',
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 32,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textDefault,
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  addedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.40)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.20)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addedCode: {
    color: '#C4C1FB',
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginRight: 8,
  },
  addedName: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  suggestedContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131B2E',
    borderRadius: 24,
    padding: 16,
  },
  suggestedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deptBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#2D3449',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  suggestedCode: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  suggestedName: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  addBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    gap: 16,
    marginTop: 8,
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
