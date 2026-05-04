import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Clock, CheckCircle2, Mail, AlertTriangle, Home, Calendar, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Logo } from '../assets/Logo';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { OfflineBanner } from '../components/OfflineBanner';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { scheduleApi } from '../api/scheduleApi';
import { attendanceApi } from '../api/attendanceApi';
import { useSignalR } from '../hooks/useSignalR';
import { useState, useEffect } from 'react';

const CircularProgress = ({ progress }: { progress: number }) => {
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.progressRingContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(45, 52, 73, 0.30)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={COLORS.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.progressContent}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressValue}>{progress}</Text>
          <Text style={styles.progressPercent}>%</Text>
        </View>
        <Text style={styles.progressLabel}>ATTENDANCE</Text>
      </View>
    </View>
  );
};

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [nextLecture, setNextLecture] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // SignalR for student alerts
  const { connection } = useSignalR('student');

  useEffect(() => {
    if (connection) {
      connection.on('NewAnnouncement', (announcement) => {
        console.log('SIGNALR: New Announcement', announcement);
      });
      connection.on('AttendanceUpdate', (data) => {
        console.log('SIGNALR: Attendance Update', data);
        fetchData(); // Refresh summary
      });
    }
  }, [connection]);

  const fetchData = async () => {
    try {
      const isStudent = user?.role === 'Student';
      
      const promises = [
        scheduleApi.getNextLecture().catch(() => ({ data: null }))
      ];

      if (isStudent) {
        promises.push(attendanceApi.getMySummary().catch(() => ({ data: null })));
        promises.push(attendanceApi.getMyAttendance({ limit: 3 }).catch(() => ({ data: null })));
      }

      const [lectureRes, summaryRes, activityRes] = await Promise.all(promises);
      
      setNextLecture(lectureRes?.data);
      if (isStudent) {
        setSummary(summaryRes?.data);
        setRecentActivity(activityRes?.data || []);
      }
    } catch (err) {
      console.error('Home Fetch Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const attendancePercentage = summary?.overallPercentage || 0;
  const presentDays = summary?.totalPresent || 0;
  const missedDays = summary?.totalAbsent || 0;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5DE6FF" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <OfflineBanner />
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <View style={[styles.logoDot, { borderColor: COLORS.purple, borderWidth: 2, borderRadius: 10 }]} />
          </View>
          <Text style={styles.logoText}>Mindtag</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={{ uri: user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'S') }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5DE6FF" />
        }
      >
        {/* Greeting section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>
            {user?.role === 'Student' ? 'Good Morning' : 'Welcome back'}, {user?.fullName?.split(' ')[0] || user?.role || 'User'}
          </Text>
          <Text style={styles.greetingSub}>
            {user?.role === 'Student' 
              ? "You're on track for this semester." 
              : `Logged in as ${user?.role || 'Administrator'}`}
          </Text>
        </View>

        {user?.role === 'Student' && (
          <>
            {/* Circular Progress Card */}
            <TouchableOpacity activeOpacity={0.9} style={styles.overviewCard} onPress={() => navigation.navigate('AttendanceHistory')}>
              <View style={styles.safeBadge}>
                <Text style={styles.safeBadgeText}>SAFE</Text>
              </View>
              
              <CircularProgress progress={attendancePercentage} />
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Present Days</Text>
                  <Text style={styles.statValue}>{presentDays}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Missed</Text>
                  <Text style={styles.statValue}>{missedDays}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Up Next Card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => nextLecture && navigation.navigate('LectureDetails', { lecture: nextLecture })}
        >
          <LinearGradient
            colors={['#1E1B4B', '#2D3449']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upNextCard}
          >
            <Text style={styles.upNextLabel}>UP NEXT</Text>
            <Text style={styles.upNextTitle}>{nextLecture?.subjectName || 'No Classes'}</Text>
            <View style={styles.timeLocationRow}>
              <Clock size={14} color="#8683BA" />
              <Text style={styles.timeLocationText}>
                {nextLecture ? `${nextLecture.startTime} — ${nextLecture.room}` : 'Rest for now'}
              </Text>
            </View>
            
            <TouchableOpacity activeOpacity={0.8} style={styles.scanButtonWrap} onPress={() => navigation.navigate('ScanQR')}>
              <LinearGradient
                colors={[COLORS.purple, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButton}
              >
                <View style={styles.scanIconPlaceholder} />
                <Text style={styles.scanButtonText}>Scan QR to Check-in</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {user?.role === 'Student' && (
          <>
            {/* Absence Limits */}
            <TouchableOpacity activeOpacity={0.9} style={styles.absenceLimitsCard} onPress={() => navigation.navigate('AttendanceHistory', { filter: 'courseId' })}>
              <Text style={styles.sectionHeading}>Absence Limits</Text>
              
              {(summary?.courseAttendance || []).map((course: any, index: number) => (
                <View key={index} style={styles.limitRow}>
                  <View style={styles.limitTextRow}>
                    <Text style={styles.limitCourse}>{course.courseName}</Text>
                    <Text style={styles.limitRatio}>{course.absentCount}/{course.maxAbsences || 5}</Text>
                  </View>
                  <View style={styles.limitTrack}>
                    <View 
                      style={[
                        styles.limitFill, 
                        { 
                          width: `${Math.min((course.absentCount / (course.maxAbsences || 5)) * 100, 100)}%`, 
                          backgroundColor: (course.absentCount / (course.maxAbsences || 5)) > 0.7 ? '#FFB4AB' : COLORS.primary 
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
              {(!summary?.courseAttendance || summary.courseAttendance.length === 0) && (
                <Text style={styles.greetingSub}>No course data available.</Text>
              )}
            </TouchableOpacity>

            {/* Recent Activity */}
            <View style={styles.recentActivitySection}>
              <View style={styles.recentActivityHeader}>
                <Text style={styles.recentActivityTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistory')}>
                  <Text style={styles.viewAllText}>VIEW ALL</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.activityList}>
                {(recentActivity || []).map((activity: any, index: number) => (
                  <TouchableOpacity key={index} style={styles.activityItem} onPress={() => navigation.navigate('AttendanceHistory')}>
                    <View style={styles.activityIconWrap}>
                      <CheckCircle2 size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.status === 'Present' ? 'Checked in' : 'Missed'}: {activity.courseName}</Text>
                      <Text style={styles.activityTime}>{new Date(activity.scannedAt).toLocaleDateString()} at {new Date(activity.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {(!recentActivity || recentActivity.length === 0) && (
                  <Text style={styles.greetingSub}>No recent activity found.</Text>
                )}
              </View>
            </View>
          </>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // Space for tab bar
    gap: 32,
  },
  greetingSection: {
    gap: 8,
  },
  greetingName: {
    color: COLORS.textDefault,
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    lineHeight: 38,
  },
  greetingSub: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  safeBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(93, 230, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(93, 230, 255, 0.20)',
  },
  safeBadgeText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  progressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressValue: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    fontSize: 48,
    lineHeight: 56,
  },
  progressPercent: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    fontSize: 24,
    lineHeight: 34,
    opacity: 0.6,
    marginTop: 6,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  upNextCard: {
    borderRadius: 24,
    padding: 24,
  },
  upNextLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
  },
  upNextTitle: {
    color: '#FFF',
    fontFamily: FONTS.bold,
    fontSize: 24,
    marginBottom: 8,
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  timeLocationText: {
    color: '#8683BA',
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  scanButtonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  scanIconPlaceholder: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2D2A5B',
    borderRadius: 4,
  },
  scanButtonText: {
    color: '#2D2A5B',
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  absenceLimitsCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  sectionHeading: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  limitRow: {
    gap: 8,
  },
  limitTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitCourse: {
    color: COLORS.textDefault,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  limitRatio: {
    color: COLORS.textMuted,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  limitTrack: {
    height: 6,
    backgroundColor: '#060E20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  limitFill: {
    height: '100%',
    borderRadius: 3,
  },
  recentActivitySection: {
    gap: 16,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentActivityTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  viewAllText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  activityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  activityTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  activityTime: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(23, 31, 51, 0.85)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
  },
  tabActiveBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  tabTextActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  tabItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabTextInactive: {
    color: '#94A3B8',
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
});
