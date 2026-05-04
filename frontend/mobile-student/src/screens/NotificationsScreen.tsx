import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, FONTS } from '../theme/theme';
import { Bell, Clock, MessageCircle, ShieldCheck, History } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { notificationApi } from '../api/notificationApi';
import { RefreshControl } from 'react-native';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

interface Props {
  navigation: NotificationsScreenNavigationProp;
}

export default function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();
      // Backend returns { success, data: { items: [...], total } }
      // notificationApi already does return response.data, so response = { success, data: { items, total } }
      const items = response?.data?.items || response?.data || [];
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Fetch Notifications Error:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5DE6FF" />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIndicator} />
          <Text style={styles.headerLogoText}>Mindtag</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Bell color={COLORS.purple} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5DE6FF" />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with your academic flow.</Text>
        </View>

        {notifications.length === 0 && !loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Bell color={COLORS.textMuted} size={48} />
            <Text style={[styles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
              No notifications yet.{'\n'}You'll see alerts and updates here.
            </Text>
          </View>
        ) : (
          <>
            {/* Group notifications by date */}
            {(() => {
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              
              const grouped: { [key: string]: any[] } = {};
              notifications.forEach((n: any) => {
                const dateStr = new Date(n.createdAt).toDateString();
                const label = dateStr === today ? 'TODAY' 
                  : dateStr === yesterday ? 'YESTERDAY' 
                  : new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!grouped[label]) grouped[label] = [];
                grouped[label].push(n);
              });

              return Object.entries(grouped).map(([label, items]) => (
                <View key={label} style={styles.section}>
                  <Text style={styles.sectionTitle}>{label}</Text>
                  {items.map((notif: any) => (
                    <TouchableOpacity 
                      key={notif.id} 
                      style={[styles.card, !notif.isRead && { borderLeftWidth: 3, borderLeftColor: COLORS.primary }]} 
                      activeOpacity={0.8}
                      onPress={async () => {
                        if (!notif.isRead) {
                          try { await notificationApi.markAsRead(notif.id); } catch {}
                        }
                      }}
                    >
                      <View style={[styles.iconBox, { 
                        backgroundColor: notif.type === 'Announcement' ? '#1E1B4B' 
                          : notif.type === 'Attendance' ? 'rgba(217, 119, 6, 0.2)' 
                          : 'rgba(0, 203, 230, 0.2)' 
                      }]}>
                        {notif.type === 'Announcement' ? (
                          <MessageCircle color={COLORS.purple} size={20} />
                        ) : notif.type === 'Attendance' ? (
                          <ShieldCheck color="#F59E0B" size={20} />
                        ) : (
                          <Clock color={COLORS.primary} size={20} />
                        )}
                      </View>
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <Text style={[styles.cardTitle, { flex: 1, paddingRight: 8 }]}>{notif.title}</Text>
                          <Text style={styles.timeText}>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={styles.cardDescription}>{notif.body}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ));
            })()}
          </>
        )}

        {/* View Archive Button */}
        <TouchableOpacity style={styles.archiveButton} onPress={() => navigation.navigate('AttendanceHistory')}>
          <Text style={styles.archiveButtonText}>View Archive</Text>
          <History color={COLORS.primary} size={14} />
        </TouchableOpacity>
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
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.background, // Match background
    zIndex: 10,
    // Note: Figma showed a slight box shadow here for the header sometimes, but we usually keep it flat since it's same color
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#818CF8',
  },
  headerLogoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  headerRight: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120, // space for tab bar
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    color: '#DAE2FD',
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: 'rgba(93, 230, 255, 0.70)',
    fontSize: 12,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2D3449',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  nowBadge: {
    backgroundColor: 'rgba(0, 203, 230, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  nowText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  cardDescription: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  archiveButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.3)',
    marginTop: 8,
  },
  archiveButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 0.35,
  },
});
