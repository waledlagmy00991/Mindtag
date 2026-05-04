import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';

export const OfflineBanner = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  // In a real app, this would use NetInfo to detect offline status
  // For the prototype, we can toggle it with a global variable or leave it hidden by default
  
  if (!isVisible) return null;

  return (
    <View style={styles.banner}>
      <WifiOff color="#EF4444" size={14} />
      <Text style={styles.bannerText}>Offline Mode — Changes will sync later</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
    zIndex: 1000,
  },
  bannerText: {
    color: '#EF4444',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
});
