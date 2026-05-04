import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Clock, Brain, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { courseApi } from '../api/courseApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const FindCoursesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.auth.user);

  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  const fetchCourses = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await courseApi.getCourses(params);
      const body = response.data;
      console.log('FindCourses raw response:', JSON.stringify(body, null, 2));
      let items: any[] = [];
      
      if (body?.data?.items) {
        items = body.data.items;
      } else if (body?.data && Array.isArray(body.data)) {
        items = body.data;
      } else if (Array.isArray(body)) {
        items = body;
      }
      
      console.log(`FindCourses: Found ${items.length} courses`);
      setCourses(items);
    } catch (err: any) {
      console.error('FindCourses fetch error:', err?.response?.status, err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  const fetchMyEnrollments = useCallback(async () => {
    try {
      const response = await courseApi.getMyEnrollments();
      const body = response.data;
      let items: any[] = [];
      
      if (body?.data?.items) items = body.data.items;
      else if (body?.data && Array.isArray(body.data)) items = body.data;
      else if (Array.isArray(body)) items = body;
      
      const ids = new Set<string>(items.map((c: any) => c.id || c.courseId));
      setEnrolledIds(ids);
    } catch (err) {
      console.log('Fetch enrollments skipped:', err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchCourses();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
    fetchMyEnrollments();
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      if (enrolledIds.has(courseId)) {
        await courseApi.unenroll(courseId);
        setEnrolledIds(prev => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      } else {
        await courseApi.enroll(courseId);
        setEnrolledIds(prev => new Set(prev).add(courseId));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update enrollment.';
      Alert.alert('Error', msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const displayedCourses = activeTab === 'my' 
    ? courses.filter(c => enrolledIds.has(c.id))
    : courses;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <View style={[styles.logoDot, { borderColor: COLORS.purple, borderWidth: 2, borderRadius: 10 }]} />
          </View>
          <Text style={styles.logoText}>Mindtag</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5DE6FF" />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search color="#94A3B8" size={20} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Find a course..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity 
            style={activeTab === 'all' ? styles.mainTabActiveContainer : styles.mainTabInactiveContainer}
            onPress={() => setActiveTab('all')}
          >
            {activeTab === 'all' ? (
              <LinearGradient
                colors={['#A5B4FC', '#22D3EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainTabActive}
              >
                <Text style={styles.mainTabTextActive}>All Courses</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.mainTabTextInactive}>All Courses</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={activeTab === 'my' ? styles.mainTabActiveContainer : styles.mainTabInactiveContainer}
            onPress={() => setActiveTab('my')}
          >
            {activeTab === 'my' ? (
              <LinearGradient
                colors={['#A5B4FC', '#22D3EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainTabActive}
              >
                <Text style={styles.mainTabTextActive}>My Courses</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.mainTabTextInactive}>My Courses</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Course List */}
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#5DE6FF" />
          </View>
        ) : displayedCourses.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <BookOpen color={COLORS.textMuted} size={48} />
            <Text style={styles.emptyText}>
              {activeTab === 'my' 
                ? "You haven't enrolled in any courses yet." 
                : "No courses found."}
            </Text>
          </View>
        ) : (
          <View style={styles.courseList}>
            {displayedCourses.map((course: any) => {
              const isEnrolled = enrolledIds.has(course.id);
              const isEnrolling = enrollingId === course.id;

              return (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseCardHeader}>
                    <View style={styles.courseIconWrap}>
                      <Brain size={24} color={COLORS.primary} />
                    </View>
                    {course.code && (
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>{course.code}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.courseContent}>
                    <Text style={styles.courseCategory}>
                      {course.department || 'COURSE'}
                    </Text>
                    <Text style={styles.courseTitle}>{course.name}</Text>
                    {course.description ? (
                      <Text style={styles.courseDescription} numberOfLines={2}>
                        {course.description}
                      </Text>
                    ) : null}
                    <View style={styles.courseMetaRow}>
                      <Clock size={14} color="#94A3B8" />
                      <Text style={styles.courseMetaText}>
                        {course.creditHours || 3} Credit Hours
                        {course.locationName ? ` • ${course.locationName}` : ''}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={() => handleEnroll(course.id)}
                    disabled={isEnrolling}
                  >
                    {isEnrolled ? (
                      <View style={styles.enrolledButton}>
                        {isEnrolling ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <>
                            <CheckCircle2 size={18} color={COLORS.primary} />
                            <Text style={styles.enrolledButtonText}>Enrolled</Text>
                          </>
                        )}
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#A5B4FC', '#5DE6FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.enrollButton}
                      >
                        {isEnrolling ? (
                          <ActivityIndicator size="small" color="#0B1326" />
                        ) : (
                          <Text style={styles.enrollButtonText}>Enroll Now</Text>
                        )}
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {
    width: 14,
    height: 14,
  },
  logoText: {
    color: '#FFF',
    fontFamily: FONTS.black,
    fontSize: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 110,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.2)',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 52,
    color: COLORS.textDefault,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  mainTabActiveContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainTabActive: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  mainTabTextActive: {
    color: '#0B1326',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  mainTabInactiveContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  mainTabTextInactive: {
    color: COLORS.textMuted,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  courseList: {
    paddingHorizontal: 24,
    gap: 20,
  },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  courseIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(93, 230, 255, 0.15)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  codeText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  courseContent: {
    marginBottom: 24,
  },
  courseCategory: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  courseTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 22,
    marginBottom: 8,
    lineHeight: 28,
  },
  courseDescription: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseMetaText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  enrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  enrollButtonText: {
    color: '#0B1326',
    fontFamily: FONTS.black,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  enrolledButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    gap: 8,
  },
  enrolledButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
