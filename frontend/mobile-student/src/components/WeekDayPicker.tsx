import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';

interface DayInfo {
  /** Day label (e.g. "MON", "TUE") */
  label: string;
  /** Day number (e.g. 14, 15, 16) */
  date: number;
  /** Full date string for identification (e.g. "2023-10-16") */
  dateKey: string;
}

interface WeekDayPickerProps {
  /** Array of 7 day objects */
  days: DayInfo[];
  /** Currently selected day key */
  selectedKey: string;
  /** Called when a day is tapped */
  onDayPress: (day: DayInfo) => void;
}

export const WeekDayPicker: React.FC<WeekDayPickerProps> = ({
  days,
  selectedKey,
  onDayPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => {
        const isSelected = day.dateKey === selectedKey;
        return (
          <TouchableOpacity
            key={day.dateKey}
            activeOpacity={0.7}
            style={[styles.dayItem, isSelected && styles.dayItemSelected]}
            onPress={() => onDayPress(day)}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {day.label}
            </Text>
            <View style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
              <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                {day.date}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Generate a week of DayInfo objects starting from the given date's week.
 */
export function getWeekDays(referenceDate: Date = new Date()): DayInfo[] {
  const start = new Date(referenceDate);
  // Go to Sunday of this week
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      label: DAY_LABELS[i],
      date: d.getDate(),
      dateKey: d.toISOString().slice(0, 10), // "YYYY-MM-DD"
    };
  });
}

/**
 * Get today's date key in the same format.
 */
export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dayItem: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dayItemSelected: {
    backgroundColor: 'rgba(93, 230, 255, 0.08)',
  },
  dayLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dayLabelSelected: {
    color: COLORS.primary,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dateCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  dateTextSelected: {
    color: COLORS.buttonText,
  },
});
