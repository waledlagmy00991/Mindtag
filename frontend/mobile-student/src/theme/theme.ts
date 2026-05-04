import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#0B1326',
  surface: '#171F33',
  inputBg: '#222A3D',
  primary: '#5DE6FF',
  purple: '#C4C1FB',
  textDefault: '#DAE2FD',
  textMuted: '#C8C5D0',
  textPlaceholder: '#928F9A',
  buttonText: '#2D2A5B',
  transparentPurple: 'rgba(196, 193, 251, 0.1)',
  transparentCyan: 'rgba(93, 230, 255, 0.05)',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
