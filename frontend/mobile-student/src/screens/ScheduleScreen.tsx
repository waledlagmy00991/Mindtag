import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Plus, ChevronRight, Home, Calendar, User, Clock, MonitorPlay, BrainCircuit, Code2 } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

export const ScheduleScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://placehold.co/100x100/2D3449/DAE2FD?text=A' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Schedule Header */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
          <Text style={styles.scheduleMonth}>OCTOBER 2023</Text>
        </View>

        {/* Days Slider */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          <View style={styles.dayCardInactive}>
            <Text style={styles.dayNameInactive}>MON</Text>
            <Text style={styles.dayNumInactive}>14</Text>
          </View>
          <View style={styles.dayCardInactive}>
            <Text style={styles.dayNameInactive}>TUE</Text>
            <Text style={styles.dayNumInactive}>15</Text>
          </View>
          
          <LinearGradient
            colors={['#A5B4FC', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dayCardActive}
          >
            <Text style={styles.dayNameActive}>WED</Text>
            <Text style={styles.dayNumActive}>16</Text>
          </LinearGradient>

          <View style={styles.dayCardInactive}>
            <Text style={styles.dayNameInactive}>THU</Text>
            <Text style={styles.dayNumInactive}>17</Text>
          </View>
          <View style={styles.dayCardInactive}>
            <Text style={styles.dayNameInactive}>FRI</Text>
            <Text style={styles.dayNumInactive}>18</Text>
          </View>
        </ScrollView>

        {/* Live Now Section */}
        <View style={styles.liveNowHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE NOW</Text>
        </View>

        <LinearGradient
          colors={['#171F33', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.liveCard}
        >
          <Text style={styles.liveLocation}>Lecture Hall B-12</Text>
          <Text style={styles.liveCourseTitle}>Advanced Neural{'\n'}Networks</Text>
          
          <View style={styles.liveTimeRow}>
            <Clock size={12} color="#94A3B8" />
            <Text style={styles.liveTimeText}>09:00 AM — 10:30 AM</Text>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.checkInBtnWrap} onPress={() => navigation.navigate('ScanQR')}>
            <LinearGradient
              colors={['#A5B4FC', '#5DE6FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkInBtn}
            >
              <Text style={styles.checkInBtnText}>Check-in</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Remaining Today */}
        <Text style={styles.remainingTitle}>REMAINING TODAY</Text>

        <View style={styles.remainingList}>
          {/* Course 1 */}
          <TouchableOpacity
            style={styles.courseItem}
            onPress={() => navigation.navigate('LectureDetails', {
              lecture: {
                courseName: 'Data Structures',
                instructorName: 'Dr. Ahmed Samir',
                startTime: '11:00 AM',
                endTime: '12:30 PM',
                location: 'Room 404',
              },
            })}
          >
            <View style={styles.courseIconWrap}>
              <MonitorPlay size={20} color={COLORS.purple} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>Data Structures</Text>
              <Text style={styles.courseDetail}>11:00 AM • Room 404</Text>
            </View>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>

          {/* Course 2 */}
          <TouchableOpacity
            style={styles.courseItem}
            onPress={() => navigation.navigate('LectureDetails', {
              lecture: {
                courseName: 'Ethics in AI',
                instructorName: 'Dr. Lina Adel',
                startTime: '02:00 PM',
                endTime: '03:30 PM',
                location: 'Seminar Hall',
              },
            })}
          >
            <View style={styles.courseIconWrap}>
              <BrainCircuit size={20} color={COLORS.primary} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>Ethics in AI</Text>
              <Text style={styles.courseDetail}>02:00 PM • Seminar Hall</Text>
            </View>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>

          {/* Course 3 */}
          <TouchableOpacity
            style={styles.courseItem}
            onPress={() => navigation.navigate('LectureDetails', {
              lecture: {
                courseName: 'Software Engineering',
                instructorName: 'Dr. Omar Nabil',
                startTime: '04:30 PM',
                endTime: '06:00 PM',
                location: 'Lab 2',
              },
            })}
          >
            <View style={styles.courseIconWrap}>
              <Code2 size={20} color="#F1BC91" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>Software Engineering</Text>
              <Text style={styles.courseDetail}>04:30 PM • Lab 2</Text>
            </View>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabContainer} activeOpacity={0.9} onPress={() => navigation.navigate('ScheduleLecture')}>
        <LinearGradient
          colors={['#A5B4FC', '#5DE6FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Plus color="#0B1326" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
          <Home size={20} color="#94A3B8" />
          <Text style={styles.tabTextInactive}>HOME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemActive}>
          <LinearGradient
            colors={['#A5B4FC', '#22D3EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabActiveBg}
          >
            <Calendar size={18} color="#0F172A" />
            <Text style={styles.tabTextActive}>SCHEDULE</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Notifications' }] })}>
          <Bell size={20} color="#94A3B8" />
          <Text style={styles.tabTextInactive}>ALERTS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemInactive} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Profile' }] })}>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingBottom: 130, // Space for FAB + Tabs
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  scheduleTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  scheduleMonth: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  daysScroll: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  dayCardInactive: {
    width: 64,
    height: 80,
    backgroundColor: '#1E2336', // subtle lighter than baground
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayCardActive: {
    width: 64,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayNameInactive: {
    color: COLORS.textMuted,
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },
  dayNumInactive: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  dayNameActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  dayNumActive: {
    color: '#0F172A',
    fontFamily: FONTS.black,
    fontSize: 20,
  },
  liveNowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB4AB', // slightly reddish/pinkish indicated in design
  },
  liveText: {
    color: '#C8C5D0',
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  liveCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  liveLocation: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    marginBottom: 8,
  },
  liveCourseTitle: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 12,
  },
  liveTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  liveTimeText: {
    color: '#94A3B8',
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  checkInBtnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkInBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInBtnText: {
    color: '#0B1326',
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  remainingTitle: {
    paddingHorizontal: 24,
    color: '#C8C5D0',
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  remainingList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2336',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  courseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2D3449',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  courseDetail: {
    color: '#94A3B8',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    shadowColor: '#5DE6FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20, // Rounded squircle looking shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(11, 19, 38, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
  },
  tabActiveBg: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  tabTextActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
  tabItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabTextInactive: {
    color: '#94A3B8',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
});
