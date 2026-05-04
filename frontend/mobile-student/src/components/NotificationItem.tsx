import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Calendar, MessageSquare, Shield, Clock } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

type NotificationType = 'LectureReminder' | 'DailySchedule' | 'Announcement' | 'AttendanceUpdate';

interface NotificationItemProps {
  title: string;
  body: string;
  type: NotificationType;
  /** ISO timestamp */
  createdAt: string;
  isRead: boolean;
  /** Show "NOW" badge for recent notifications */
  isRecent?: boolean;
  onPress?: () => void;
}

const TYPE_ICONS: Record<NotificationType, { Icon: any; color: string }> = {
  LectureReminder: { Icon: Clock, color: COLORS.primary },
  DailySchedule: { Icon: Calendar, color: '#C4C1FB' },
  Announcement: { Icon: MessageSquare, color: '#F97316' },
  AttendanceUpdate: { Icon: Shield, color: '#22C55E' },
};

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  body,
  type,
  createdAt,
  isRead,
  isRecent = false,
  onPress,
}) => {
  const { Icon, color } = TYPE_ICONS[type] || TYPE_ICONS.LectureReminder;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, !isRead && styles.unread]}
      onPress={onPress}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { borderColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>

      {/* Text content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !isRead && styles.titleUnread]} numberOfLines={1}>
            {title}
          </Text>
          {isRecent ? (
            <View style={styles.nowBadge}>
              <Text style={styles.nowText}>NOW</Text>
            </View>
          ) : (
            <Text style={styles.time}>{formatTime(createdAt)}</Text>
          )}
        </View>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </View>

      {/* Unread dot */}
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  unread: {
    backgroundColor: 'rgba(93, 230, 255, 0.03)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textMuted,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
  },
  body: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: COLORS.textPlaceholder,
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  nowBadge: {
    backgroundColor: 'rgba(93, 230, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  nowText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
});
