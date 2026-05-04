import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

interface LectureCardProps {
  courseName: string;
  startTime: string;
  endTime?: string;
  room?: string;
  instructorName?: string;
  /** Show a LIVE NOW badge */
  isLive?: boolean;
  /** Show check-in button */
  showCheckIn?: boolean;
  onPress?: () => void;
  onCheckIn?: () => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  courseName,
  startTime,
  endTime,
  room,
  instructorName,
  isLive = false,
  showCheckIn = false,
  onPress,
  onCheckIn,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Live badge */}
      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE NOW</Text>
        </View>
      )}

      {/* Course name */}
      <Text style={styles.courseName} numberOfLines={2}>{courseName}</Text>

      {/* Instructor */}
      {instructorName && (
        <Text style={styles.instructor}>{instructorName}</Text>
      )}

      {/* Time row */}
      <View style={styles.infoRow}>
        <Clock size={14} color={COLORS.textMuted} />
        <Text style={styles.infoText}>
          {startTime}{endTime ? ` — ${endTime}` : ''}
        </Text>
      </View>

      {/* Room row */}
      {room && (
        <View style={styles.infoRow}>
          <MapPin size={14} color={COLORS.textMuted} />
          <Text style={styles.infoText}>{room}</Text>
        </View>
      )}

      {/* Check-in button */}
      {showCheckIn && (
        <TouchableOpacity activeOpacity={0.8} style={styles.checkInBtn} onPress={onCheckIn}>
          <Text style={styles.checkInText}>Check-in</Text>
        </TouchableOpacity>
      )}

      {/* Chevron */}
      {onPress && !showCheckIn && (
        <View style={styles.chevron}>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    position: 'relative',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#22C55E',
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  courseName: {
    color: COLORS.textDefault,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  instructor: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  checkInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  checkInText: {
    color: COLORS.buttonText,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
  },
});
