import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS } from '../theme/theme';

interface AttendanceRingProps {
  /** Percentage 0–100 */
  percentage: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Ring stroke width */
  strokeWidth?: number;
  /** Label text below the percentage (default: "ATTENDANCE") */
  label?: string;
  /** Status determines stroke color */
  status?: 'Safe' | 'Warning' | 'Danger';
}

const STATUS_COLORS = {
  Safe: COLORS.primary,     // cyan
  Warning: '#F97316',       // orange
  Danger: '#EF4444',        // red
};

export const AttendanceRing: React.FC<AttendanceRingProps> = ({
  percentage,
  size = 200,
  strokeWidth = 14,
  label = 'ATTENDANCE',
  status = 'Safe',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;
  const color = STATUS_COLORS[status] || COLORS.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          stroke="rgba(45, 52, 73, 0.30)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.content}>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { fontSize: size * 0.22 }]}>
            {Math.round(clampedPercent * 10) / 10}
          </Text>
          <Text style={[styles.percent, { fontSize: size * 0.12 }]}>%</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  value: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    lineHeight: undefined,
  },
  percent: {
    color: COLORS.textDefault,
    fontFamily: FONTS.black,
    opacity: 0.6,
    marginTop: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4,
  },
});
