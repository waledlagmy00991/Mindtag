import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme/theme';
import { ArrowRight } from 'lucide-react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  showIcon?: boolean;
}

export const GradientButton: React.FC<ButtonProps> = ({ title, showIcon = true, style, ...props }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[COLORS.purple, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>{title}</Text>
        {showIcon && <ArrowRight color={COLORS.buttonText} size={20} style={styles.icon} />}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontFamily: FONTS.black,
  },
  icon: {
    marginLeft: 8,
  },
});
