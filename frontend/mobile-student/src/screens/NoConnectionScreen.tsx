import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff, RefreshCcw, Box } from 'lucide-react-native';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NoConnectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoConnection'>;

interface Props {
  navigation: NoConnectionScreenNavigationProp;
}

export default function NoConnectionScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Left Gradient Blur Background */}
      <View style={styles.blurLeft} />
      
      {/* Bottom Right Gradient Blur Background */}
      <View style={styles.blurRight} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircleBg}>
            <View style={styles.iconSquare}>
              <WifiOff size={48} color="#928F9A" />
            </View>
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>No Connection</Text>
          <Text style={styles.subtitle}>
            Please check your internet connection{'\n'}to continue with Mindtag.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
            <LinearGradient
              colors={['#C4C1FB', '#5DE6FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButton}
            >
              <RefreshCcw size={16} color="#2D2A5B" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.cachedText}>USING CACHED DATA</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoIcon}
          >
            <Box size={16} color="#2D2A5B" />
          </LinearGradient>
          <Text style={styles.logoText}>Mindtag</Text>
        </View>
        <Text style={styles.sloganText}>INTELLIGENT ATMOSPHERE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  blurLeft: {
    position: 'absolute',
    width: 195,
    height: 442,
    left: -39,
    top: -88,
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderRadius: 100,
  },
  blurRight: {
    position: 'absolute',
    width: 195,
    height: 442,
    right: -39,
    bottom: -88,
    backgroundColor: 'rgba(0, 203, 230, 0.15)',
    borderRadius: 100,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBg: {
    width: 192,
    height: 192,
    backgroundColor: 'rgba(34, 42, 61, 0.20)',
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquare: {
    width: 128,
    height: 128,
    backgroundColor: '#222A3D',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  textSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#DAE2FD',
    fontSize: 30,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    color: '#C8C5D0',
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 26,
  },
  actionSection: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#5DE6FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 4,
    minWidth: 200,
  },
  retryButtonText: {
    color: '#2D2A5B',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  cachedText: {
    color: '#5DE6FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#C4C1FB',
    fontSize: 24,
    fontFamily: FONTS.black,
  },
  sloganText: {
    color: '#928F9A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
