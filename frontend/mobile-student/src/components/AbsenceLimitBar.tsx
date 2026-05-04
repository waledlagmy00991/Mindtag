import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';

interface AbsenceLimitBarProps {
  /** Course display name */
  courseName: string;
  /** Number of absences used */
  absenceUsed: number;
  /** Maximum absences allowed */
  absenceLimit: number;
}

/**
 * Color logic from PRD §9.5:
 * absenceUsed / absenceLimit < 0.4  → cyan (safe)
 * absenceUsed / absenceLimit < 0.8  → orange (warning)
 * absenceUsed / absenceLimit >= 0.8 → red (danger)
 */
function getBarColor(used: number, limit: number): string {
  if (limit <= 0) return COLORS.primary;
  const ratio = used / limit;
  if (ratio >= 0.8) return '#EF4444';  // danger red
  if (ratio >= 0.4) return '#F97316';  // warning orange
  return COLORS.primary;               // safe cyan
}

export const AbsenceLimitBar: React.FC<AbsenceLimitBarProps> = ({
  courseName,
  absenceUsed,
  absenceLimit,
}) => {
  const ratio = absenceLimit > 0 ? Math.min(absenceUsed / absenceLimit, 1) : 0;
  const color = getBarColor(absenceUsed, absenceLimit);

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text style={styles.courseName} numberOfLines={1}>{courseName}</Text>
        <Text style={[styles.ratio, { color }]}>{absenceUsed}/{absenceLimit}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseName: {
    color: COLORS.textDefault,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    flex: 1,
    marginRight: 12,
  },
  ratio: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  track: {
    height: 6,
    backgroundColor: '#060E20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
