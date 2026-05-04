import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Inbox, Calendar, Bell, BookOpen } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

type EmptyStateVariant = 'schedule' | 'notifications' | 'attendance' | 'courses' | 'generic';

interface EmptyStateProps {
  /** Pre-defined visual variant */
  variant?: EmptyStateVariant;
  /** Custom title (overrides variant default) */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Custom icon (overrides variant icon) */
  icon?: React.ReactNode;
  /** CTA button text (if provided, button is shown) */
  ctaText?: string;
  /** CTA button handler */
  onCtaPress?: () => void;
}

const VARIANT_CONFIG: Record<EmptyStateVariant, { Icon: any; title: string; subtitle: string }> = {
  schedule: {
    Icon: Calendar,
    title: 'No Lectures Today',
    subtitle: 'Your schedule is clear. Enjoy your free time!',
  },
  notifications: {
    Icon: Bell,
    title: 'All Clear',
    subtitle: "You're all caught up. No new notifications.",
  },
  attendance: {
    Icon: Inbox,
    title: 'No Records Yet',
    subtitle: 'Your attendance history will appear here after your first check-in.',
  },
  courses: {
    Icon: BookOpen,
    title: 'No Courses Enrolled',
    subtitle: 'Enroll in your first course to get started.',
  },
  generic: {
    Icon: Inbox,
    title: 'Nothing Here',
    subtitle: 'Check back later for updates.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic',
  title,
  subtitle,
  icon,
  ctaText,
  onCtaPress,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.generic;
  const { Icon } = config;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {icon || <Icon size={40} color={COLORS.textMuted} strokeWidth={1.5} />}
      </View>
      <Text style={styles.title}>{title || config.title}</Text>
      <Text style={styles.subtitle}>{subtitle || config.subtitle}</Text>
      {ctaText && onCtaPress && (
        <TouchableOpacity activeOpacity={0.8} style={styles.ctaButton} onPress={onCtaPress}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  ctaText: {
    color: COLORS.buttonText,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
