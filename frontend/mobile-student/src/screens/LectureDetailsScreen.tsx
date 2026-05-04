import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MoreVertical, Calendar, MapPin, ScanLine, Home, Bell, User } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

export const LectureDetailsScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const lecture = route?.params?.lecture || {
    courseName: 'Advanced UI/UX Design',
    instructorName: 'Dr. Sarah Jenkins',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    location: 'Hall B-12',
    attendanceRate: 94,
    totalSessions: 24,
    attendedSessions: 22,
    missedSessions: 2
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#F0F0F7" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lecture Details</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical color="#F0F0F7" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Course Info Section */}
        <View style={styles.heroSection}>
          {lecture.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE NOW</Text>
            </View>
          )}
          
          <Text style={styles.courseTitle}>{lecture.subjectName || lecture.courseName}</Text>
          
          <View style={styles.doctorInfoRow}>
            <View style={styles.doctorAvatarContainer}>
              <View style={[styles.doctorAvatar, { backgroundColor: '#2D3449', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                  {lecture.instructorName?.split(' ').map((n: any) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <View style={styles.verifiedInner} />
              </View>
            </View>
            <View style={styles.doctorTextColumn}>
              <Text style={styles.doctorName}>{lecture.instructorName}</Text>
              <Text style={styles.doctorRole}>Faculty Instructor</Text>
            </View>
          </View>
        </View>

        {/* Details Cards */}
        <View style={styles.detailsRow}>
          <View style={styles.detailCard}>
            <View style={styles.detailIconWrapTop}>
              <Calendar color={COLORS.primary} size={20} />
            </View>
            <View>
              <Text style={styles.detailLabel}>SCHEDULE</Text>
              <Text style={styles.detailValue}>{lecture.day || 'Today'}, {lecture.startTime} —{'\n'}{lecture.endTime}</Text>
            </View>
          </View>
          
          <View style={styles.detailCard}>
            <View style={styles.detailIconWrapTop}>
              <MapPin color={COLORS.purple} size={20} />
            </View>
            <View>
              <Text style={styles.detailLabel}>LOCATION</Text>
              <Text style={styles.detailValue}>{lecture.location || 'Science Block'}</Text>
            </View>
          </View>
        </View>

        {/* Attendance Rate Dial */}
        <View style={styles.attendanceCard}>
          <View style={styles.dialContainer}>
            <View style={[styles.dialRing, styles.dialRingBackground]} />
            <View style={[styles.dialRing, styles.dialRingForeground, { borderColor: (lecture.attendanceRate || 0) >= 75 ? COLORS.primary : '#FFB4AB' }]} />
            
            <View style={styles.dialContent}>
              <Text style={styles.dialValue}>{lecture.attendanceRate || 0}%</Text>
              <Text style={styles.dialLabel}>RATE</Text>
            </View>
          </View>
          
          <View style={styles.attendanceStats}>
            <View style={styles.statColumn}>
              <Text style={styles.statTopLabel}>TOTAL</Text>
              <Text style={[styles.statBottomValue, { color: COLORS.textDefault }]}>{lecture.totalSessions || 0}</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statTopLabel}>ATTENDED</Text>
              <Text style={[styles.statBottomValue, { color: COLORS.primary }]}>{lecture.attendedSessions || 0}</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statTopLabel}>MISSED</Text>
              <Text style={[styles.statBottomValue, { color: '#FFB4AB' }]}>{lecture.missedSessions || 0}</Text>
            </View>
          </View>
        </View>

        {/* Scan QR Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.scanButtonContainer}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <LinearGradient
            colors={[COLORS.purple, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButtonGradient}
          >
            <ScanLine color="#0B1326" size={20} />
            <Text style={styles.scanButtonText}>SCAN QR TO ATTEND</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Bar (Matching Image) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItemActive} onPress={() => navigation.navigate('Home')}>
          <LinearGradient
            colors={['#A5B4FC', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabActiveBg}
          >
            <Home size={18} color="#0F172A" />
            <Text style={styles.tabTextActive}>HOME</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.navigate('Schedule')}>
          <Calendar size={20} color="#94A3B8" />
          <Text style={styles.tabTextInactive}>SCHEDULE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={20} color="#94A3B8" />
          <Text style={styles.tabTextInactive}>ALERTS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.navigate('Profile')}>
          <User size={20} color="#94A3B8" />
          <Text style={styles.tabTextInactive}>PROFILE</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 19, 38, 0.9)',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F0F0F7',
    fontFamily: FONTS.semiBold,
    fontSize: 18,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 130, // Space for tab bar
    gap: 32,
  },
  heroSection: {
    gap: 16,
    marginTop: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(93, 230, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(93, 230, 255, 0.20)',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  courseTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    fontSize: 36,
    lineHeight: 45,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  doctorAvatarContainer: {
    position: 'relative',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(196, 193, 251, 0.20)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  verifiedInner: {
    width: 8,
    height: 8,
    backgroundColor: '#2D2A5B',
    borderRadius: 4,
  },
  doctorTextColumn: {
    justifyContent: 'center',
    gap: 4,
  },
  doctorName: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  doctorRole: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: 'column', // In user's code, it flex-direction: column
    gap: 16,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  detailIconWrapTop: {
    alignSelf: 'flex-start',
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.textDefault,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  attendanceCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    gap: 32,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.10)',
  },
  dialContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dialRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
  },
  dialRingBackground: {
    borderColor: '#2D3449',
    opacity: 0.3,
  },
  dialRingForeground: {
    // A trick to show arc without SVG: absolute rotated square clip or border colors
    // But since we installed Svg in HomeScreen, we can just use simple border for now
    // wait I'll use simple border coloring mimicking 90%
    borderColor: COLORS.primary,
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    borderBottomColor: COLORS.primary,
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  dialContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    fontSize: 30,
  },
  dialLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statColumn: {
    alignItems: 'center',
    gap: 4,
  },
  statTopLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statBottomValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  scanButtonContainer: {
    marginVertical: 10,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  scanButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.black,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2.8,
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
