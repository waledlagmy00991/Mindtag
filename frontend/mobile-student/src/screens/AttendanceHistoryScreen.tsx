import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Filter, ChevronRight, Home, Calendar, Bell, User } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type AttendanceHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AttendanceHistory'>;

import { RouteProp } from '@react-navigation/native';
import { attendanceApi } from '../api/attendanceApi';
import { useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { Loader2 } from 'lucide-react-native';

type AttendanceHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceHistory'>;

interface Props {
  navigation: AttendanceHistoryScreenNavigationProp;
  route: AttendanceHistoryScreenRouteProp;
}

export default function AttendanceHistoryScreen({ navigation, route }: Props) {
  const initialFilter = route.params?.filter || 'ALL';
  const [activeFilter, setActiveFilter] = useState(initialFilter === 'courseId' ? 'COMPUTER SCIENCE' : 'ALL');
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [historyRes, summaryRes] = await Promise.all([
        attendanceApi.getMyAttendance({ page: 1, limit: 100 }),
        attendanceApi.getMySummary()
      ]);
      setHistory(historyRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('History Fetch Error:', err);
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

  const filteredHistory = history.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.courseName?.toUpperCase().includes(activeFilter);
  });
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#5DE6FF" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Attendance History</Text>
        
        <TouchableOpacity style={styles.headerBtn}>
          <Filter color="#C8C5D0" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>OVERALL</Text>
            <Text style={[styles.statValue, { color: '#5DE6FF' }]}>
              {summary ? Math.round(summary.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / (summary.length || 1)) : 0}%
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>PRESENT</Text>
            <Text style={[styles.statValue, { color: '#F1F5F9' }]}>
              {summary ? summary.reduce((acc: number, curr: any) => acc + curr.attended, 0) : 0}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>MISSED</Text>
            <Text style={[styles.statValue, { color: '#FFB4AB' }]}>
              {summary ? summary.reduce((acc: number, curr: any) => acc + curr.missed, 0) : 0}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity onPress={() => setActiveFilter('ALL')}>
            <LinearGradient
              colors={activeFilter === 'ALL' ? ['#5DE6FF', '#5DE6FF'] : ['#1E2336', '#1E2336']}
              style={activeFilter === 'ALL' ? styles.filterChipActive : styles.filterChipInactive}
            >
              <Text style={activeFilter === 'ALL' ? styles.filterTextActive : styles.filterTextInactive}>ALL COURSES</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setActiveFilter('COMPUTER SCIENCE')}>
            <LinearGradient
              colors={activeFilter === 'COMPUTER SCIENCE' ? ['#5DE6FF', '#5DE6FF'] : ['#1E2336', '#1E2336']}
              style={activeFilter === 'COMPUTER SCIENCE' ? styles.filterChipActive : styles.filterChipInactive}
            >
              <Text style={activeFilter === 'COMPUTER SCIENCE' ? styles.filterTextActive : styles.filterTextInactive}>COMPUTER SCIENCE</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={[styles.filterChipInactive, { width: 32 }]} />
        </ScrollView>

        {/* Dynamic History List */}
        {Object.entries(
          filteredHistory.reduce((groups: any, item: any) => {
            const date = new Date(item.scannedAt);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
            if (!groups[month]) groups[month] = [];
            groups[month].push(item);
            return groups;
          }, {})
        ).map(([month, items]: [string, any]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthHeader}>{month}</Text>
            
            {items.map((item: any, idx: number) => {
              const statusColor = item.status === 'Present' ? '#5DE6FF' : item.status === 'Late' ? '#FDBA74' : '#FFB4AB';
              const statusBg = item.status === 'Present' ? 'rgba(93, 230, 255, 0.15)' : item.status === 'Late' ? 'rgba(253, 186, 116, 0.15)' : 'rgba(255, 180, 171, 0.15)';
              
              return (
                <View key={idx} style={styles.historyCard}>
                  <View style={[styles.cardBorderLeft, { backgroundColor: statusColor }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.dateTimeText}>
                        {new Date(item.scannedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    
                    <View style={styles.courseRow}>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseName}>{item.courseName}</Text>
                        <Text style={styles.locationText}>👤 {item.professorName}</Text>
                      </View>
                      <ChevronRight color="#C8C5D0" size={20} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {filteredHistory.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: COLORS.textMuted, fontFamily: FONTS.medium }}>No attendance records found.</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#131B2E',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: '#928F9A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.black,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filtersScroll: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterChipActive: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTextActive: {
    color: '#0F172A',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  filterChipInactive: {
    backgroundColor: '#1E2336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTextInactive: {
    color: '#C8C5D0',
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  monthSection: {
    marginBottom: 32,
  },
  monthHeader: {
    color: '#928F9A',
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardBorderLeft: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  dateTimeText: {
    color: '#C8C5D0',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  locationText: {
    color: '#928F9A',
    fontSize: 12,
    fontFamily: FONTS.regular,
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
  tabText: {
    color: '#94A3B8',
    fontFamily: FONTS.bold,
    fontSize: 9,
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
    backgroundColor: 'rgba(93, 230, 255, 0.1)',
    borderRadius: 16,
    gap: 4,
  },
  profileTextActive: {
    color: '#5DE6FF',
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
});
