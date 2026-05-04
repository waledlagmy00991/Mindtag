import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, FONTS } from '../theme/theme';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react-native';

type AppearanceSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppearanceSettings'>;

interface Props {
  navigation: AppearanceSettingsScreenNavigationProp;
}

export default function AppearanceSettingsScreen({ navigation }: Props) {
  const [theme, setTheme] = useState('dark');
  const [autoTheme, setAutoTheme] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>THEME PREFERENCE</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Monitor color={COLORS.textMuted} size={20} />
            <View>
              <Text style={styles.settingTitle}>Match System</Text>
              <Text style={styles.settingDesc}>Sync theme with OS settings</Text>
            </View>
          </View>
          <Switch 
            value={autoTheme} 
            onValueChange={setAutoTheme}
            trackColor={{ false: '#2D3449', true: '#312E81' }}
            thumbColor={autoTheme ? '#A5B4FC' : '#f4f3f4'}
          />
        </View>

        {!autoTheme && (
          <View style={styles.themeGrid}>
            <TouchableOpacity 
              style={[styles.themeCard, theme === 'light' && styles.themeCardActive]}
              onPress={() => setTheme('light')}
            >
              <Sun color={theme === 'light' ? COLORS.primary : COLORS.textMuted} size={32} />
              <Text style={[styles.themeCardText, theme === 'light' && styles.themeCardTextActive]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeCard, theme === 'dark' && styles.themeCardActive]}
              onPress={() => setTheme('dark')}
            >
              <Moon color={theme === 'dark' ? COLORS.primary : COLORS.textMuted} size={32} />
              <Text style={[styles.themeCardText, theme === 'dark' && styles.themeCardTextActive]}>Dark</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerLeft: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingTitle: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  themeCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(93, 230, 255, 0.05)',
  },
  themeCardText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  themeCardTextActive: {
    color: COLORS.primary,
  },
});
