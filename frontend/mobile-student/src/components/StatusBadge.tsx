import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';

type BadgeStatus = 'Safe' | 'Warning' | 'Danger';

interface StatusBadgeProps {
  status: BadgeStatus;
  /** Optional custom label — defaults to status name uppercased */
  label?: string;
}

const BADGE_CONFIG: Record<BadgeStatus, { bg: string; border: string; text: string }> = {
  Safe: {
    bg: 'rgba(93, 230, 255, 0.10)',
    border: 'rgba(93, 230, 255, 0.20)',
    text: COLORS.primary,
  },
  Warning: {
    bg: 'rgba(249, 115, 22, 0.10)',
    border: 'rgba(249, 115, 22, 0.20)',
    text: '#F97316',
  },
  Danger: {
    bg: 'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.20)',
    text: '#EF4444',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = BADGE_CONFIG[status] || BADGE_CONFIG.Safe;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {(label || status).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
});
