import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { COLORS, FONTS } from '../theme/theme';
import { ArrowLeft, Globe, Check } from 'lucide-react-native';

type LanguageSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSettings'>;

interface Props {
  navigation: LanguageSettingsScreenNavigationProp;
}

const LANGUAGES = [
  { id: 'en', name: 'English (US)', flag: '🇺🇸' },
  { id: 'ar', name: 'العربية (Arabic)', flag: '🇪🇬' },
  { id: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { id: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
];

export default function LanguageSettingsScreen({ navigation }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>SELECT LANGUAGE</Text>
        
        {LANGUAGES.map((lang) => (
          <TouchableOpacity 
            key={lang.id} 
            style={styles.langItem}
            onPress={() => setSelectedLanguage(lang.id)}
          >
            <View style={styles.langInfo}>
              <Text style={styles.flagText}>{lang.flag}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
            </View>
            {selectedLanguage === lang.id && (
              <Check color={COLORS.primary} size={20} />
            )}
          </TouchableOpacity>
        ))}
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
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  langInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flagText: {
    fontSize: 24,
  },
  langName: {
    color: '#DAE2FD',
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
});
