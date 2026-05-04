import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, PlusCircle, MoreVertical, Clock, MapPin, ChevronLeft, Home, Calendar, Bell, User, FlaskConical, TerminalSquare } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useState, useEffect, useMemo } from 'react';
import { scheduleApi } from '../api/scheduleApi';
import { ActivityIndicator, RefreshControl } from 'react-native';

type WeeklyScheduleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WeeklySchedule'>;

interface Props {
  navigation: WeeklyScheduleScreenNavigationProp;
}

export default function WeeklyScheduleScreen({ navigation }: Props) {
  const [schedule, setSchedule] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  const fetchSchedule = async () => {
    try {
      const response = await scheduleApi.getWeekly();
      setSchedule(response.data);
    } catch (err) {
      console.error('Fetch Schedule Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const currentDayLectures = schedule[selectedDay] || [];

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveHeaderBtn}
          >
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
        
        <TouchableOpacity style={styles.headerRightBtn} onPress={() => navigation.goBack()}>
          <ArrowRight color="#F1F5F9" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Date Slider */}
        <View style={styles.datesRow}>
          {days.map(day => (
            <TouchableOpacity 
              key={day} 
              style={selectedDay === day ? styles.dateCardActive : styles.dateCardInactive}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={selectedDay === day ? styles.dateColNameActive : styles.dateColName}>
                {day.substring(0, 3).toUpperCase()}
              </Text>
              <Text style={selectedDay === day ? styles.dateColNumActive : styles.dateColNum}>
                {/* Simplified date for UI example */}
                {day.length} 
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title & Add Button Row */}
        <View style={styles.sectionTitleRow}>
          <TouchableOpacity 
            style={styles.addLectureBtn}
            onPress={() => navigation.navigate('ScheduleLecture')}
          >
            <Text style={styles.addLectureText}>+ Add{'\n'}Lecture</Text>
            <PlusCircle color="#5DE6FF" size={16} />
          </TouchableOpacity>
          <View style={styles.sectionTitleTextWrap}>
            <Text style={styles.sectionTitle}>{selectedDay} Lectures</Text>
            <Text style={styles.sectionSubtitle}>Manage your academic{'\n'}sessions for today</Text>
          </View>
        </View>

        {/* Lectures List */}
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 50 }} />
        ) : currentDayLectures.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: COLORS.textMuted, fontFamily: FONTS.medium }}>No lectures scheduled for {selectedDay}.</Text>
          </View>
        ) : (
          currentDayLectures.map((lecture: any, idx: number) => (
            <TouchableOpacity key={idx} style={styles.lectureCard} onPress={() => navigation.navigate('LectureDetails', { lecture })}>
              <View style={styles.lectureCardHeader}>
                <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <MoreVertical color="#C8C5D0" size={20} />
                </TouchableOpacity>
                <View style={[styles.lectureIconBox, { backgroundColor: 'rgba(93, 230, 255, 0.1)' }]}>
                  {lecture.isLab ? (
                    <FlaskConical color="#C4C1FB" size={24} />
                  ) : (
                    <TerminalSquare color="#5DE6FF" size={24} />
                  )}
                </View>
              </View>
              
              <View style={styles.lectureInfo}>
                <Text style={styles.lectureTitle}>{lecture.subjectName || lecture.courseName}</Text>
                <Text style={styles.lectureProf}>{lecture.instructorName || 'TBA'}</Text>
                
                <View style={styles.lectureTags}>
                  <View style={styles.lectureTag}>
                    <Text style={styles.lectureTagText}>{lecture.startTime} - {lecture.endTime}</Text>
                    <Clock size={12} color="#C8C5D0" />
                  </View>
                  <View style={styles.lectureTag}>
                    <Text style={styles.lectureTagText}>{lecture.location || 'N/A'}</Text>
                    <MapPin size={12} color="#C8C5D0" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Other Days Summary */}
        {days.filter(d => d !== selectedDay).map(day => (
          <TouchableOpacity 
            key={day} 
            style={styles.collapsedDayCard}
            onPress={() => setSelectedDay(day)}
          >
            <ChevronLeft color="#C8C5D0" size={20} />
            <View style={styles.collapsedDayInfo}>
              <Text style={styles.collapsedDayTitle}>{day}</Text>
              <Text style={styles.collapsedDayDesc}>{schedule[day]?.length || 0} Lectures Scheduled</Text>
            </View>
            <View style={styles.collapsedDayBadge}>
              <Text style={styles.collapsedDayBadgeText}>{day.substring(0, 3).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Bottom Tab Bar Dummy */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#94A3B8" size={20} />
          <Text style={styles.tabText}>HOME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemActive}>
          <View style={styles.tabIconActive}>
            <Calendar color="#C8C5D0" size={20} />
          </View>
          <Text style={styles.tabTextActive}>SCHEDULE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.alertIconWrap}>
            <Bell color="#94A3B8" size={20} />
            <View style={styles.alertBadge} />
          </View>
          <Text style={styles.tabText}>ALERTS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemActiveGradient} onPress={() => navigation.navigate('Profile')}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileActiveBg}
          >
            <User color="#0F172A" size={20} fill="#0F172A" />
            <Text style={styles.profileTextActive}>PROFILE</Text>
          </LinearGradient>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderBtnText: {
    color: '#2D2A5B',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  headerTitle: {
    color: '#DAE2FD',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  headerRightBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dateCardInactive: {
    width: 64,
    height: 80,
    backgroundColor: '#1E2336',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dateCardActive: {
    width: 64,
    height: 80,
    backgroundColor: '#222A3D',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#5DE6FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dateColName: {
    color: '#928F9A',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  dateColNum: {
    color: '#C8C5D0',
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  dateColNameActive: {
    color: '#5DE6FF',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  dateColNumActive: {
    color: '#5DE6FF',
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addLectureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  addLectureText: {
    color: '#5DE6FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
    lineHeight: 16,
  },
  sectionTitleTextWrap: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: '#DAE2FD',
    fontSize: 22,
    fontFamily: FONTS.black,
  },
  sectionSubtitle: {
    color: '#928F9A',
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: 'right',
    marginTop: 4,
  },
  lectureCard: {
    backgroundColor: '#171F33',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  lectureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lectureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lectureInfo: {
    alignItems: 'flex-end',
  },
  lectureTitle: {
    color: '#DAE2FD',
    fontSize: 18,
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  lectureProf: {
    color: '#928F9A',
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'right',
  },
  lectureTags: {
    gap: 8,
    alignItems: 'flex-end',
  },
  lectureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222A3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  lectureTagText: {
    color: '#C8C5D0',
    fontSize: 10,
    fontFamily: FONTS.medium,
  },
  collapsedDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2336',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
  },
  collapsedDayInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
  },
  collapsedDayTitle: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  collapsedDayDesc: {
    color: '#928F9A',
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  collapsedDayBadge: {
    backgroundColor: '#2D3449',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedDayBadgeText: {
    color: '#C8C5D0',
    fontSize: 12,
    fontFamily: FONTS.bold,
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIconActive: {
    marginBottom: 2,
  },
  tabTextActive: {
    color: '#C8C5D0',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
  tabText: {
    color: '#94A3B8',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
  alertIconWrap: {
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#FFB4AB',
    borderRadius: 4,
  },
  tabItemActiveGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileActiveBg: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  profileTextActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
});
