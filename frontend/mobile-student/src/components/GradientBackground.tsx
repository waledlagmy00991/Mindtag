import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme/theme';

const { width } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

export const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Top Right Glow */}
      <View style={styles.topRightGlow} />
      
      {/* Bottom Left Glow */}
      <View style={styles.bottomLeftGlow} />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topRightGlow: {
    position: 'absolute',
    top: -96,
    right: -100, // Approximate x=230 equivalent
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: COLORS.purple,
    opacity: 0.1,
  },
  bottomLeftGlow: {
    position: 'absolute',
    bottom: -100, // Approximate y=525 equivalent
    left: -128,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
});
