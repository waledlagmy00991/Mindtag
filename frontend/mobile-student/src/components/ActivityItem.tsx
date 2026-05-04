import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Mail, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

type ActivityType = 'checkin' | 'absence' | 'alert' | 'default';

interface ActivityItemProps {
  /** Activity title (e.g. "Checked in: Studio Workshop") */
  title: string;
  /** Subtitle or timestamp (e.g. "Yesterday at 2:15 PM") */
  subtitle: string;
  /** Type determines the icon displayed */
  type?: ActivityType;
  /** Custom icon (overrides type-based icon) */
  icon?: React.ReactNode;
  onPress?: () => void;
}

const TYPE_ICONS: Record<ActivityType, { Icon: any; color: string }> = {
  checkin: { Icon: CheckCircle2, color: COLORS.primary },
  absence: { Icon: Mail, color: '#F97316' },
  alert: { Icon: AlertTriangle, color: '#EF4444' },
  default: { Icon: CheckCircle2, color: COLORS.textMuted },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  subtitle,
  type = 'default',
  icon,
  onPress,
}) => {
  const { Icon, color } = TYPE_ICONS[type] || TYPE_ICONS.default;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconWrap}>
        {icon || <Icon size={22} color={color} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      {onPress && <ChevronRight size={18} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    padding: 16,
    borderRadius: 20,
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
});
