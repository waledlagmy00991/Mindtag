import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, Smartphone, ShieldCheck, EyeOff } from 'lucide-react-native';
import * as Device from 'expo-device';
import { COLORS, FONTS } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SecurityPrivacyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SecurityPrivacy'>;

interface Props {
  navigation: SecurityPrivacyScreenNavigationProp;
}

export default function SecurityPrivacyScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F1F5F9" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security & Privacy</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={() => navigation.goBack()}>
          {/* Note: The image shows an icon resembling a phone or save in the header */}
          <View style={styles.saveIconBox}>
            <Save color="#0F172A" size={16} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            style={styles.sectionIndicator}
          />
          <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#928F9A"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#928F9A"
                secureTextEntry
              />
            </View>
            <View style={styles.passwordRules}>
              <View style={styles.ruleRow}>
                <View style={[styles.ruleDot, { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 8 }]} />
                <Text style={styles.ruleTextGreen}>8+ CHARACTERS</Text>
              </View>
              <View style={styles.ruleRow}>
                <View style={[styles.ruleDot, { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 8 }]} />
                <Text style={styles.ruleTextGreen}>SPECIAL CHAR</Text>
              </View>
              <View style={styles.ruleRow}>
                <View style={styles.ruleDotDark} />
                <Text style={styles.ruleTextDark}>UPPER CASE</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#928F9A"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 16 }}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.changePasswordBtn}
          >
            <Text style={styles.changePasswordBtnText}>CHANGE PASSWORD</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Device Security Section */}
        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
          <LinearGradient
            colors={['#C4C1FB', '#5DE6FF']}
            style={styles.sectionIndicator}
          />
          <Text style={styles.sectionTitle}>DEVICE SECURITY</Text>
        </View>

        <View style={styles.deviceCard}>
          <View style={styles.deviceHeaderRow}>
            <View style={styles.deviceInfoRow}>
              <View style={styles.deviceIconWrap}>
                <Smartphone color="#5DE6FF" size={24} />
              </View>
              <View style={styles.deviceTextWrap}>
                <Text style={styles.deviceName}>{Device.modelName || Device.deviceName || 'Unknown Device'}</Text>
                <View style={styles.activeRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>ACTIVE NOW</Text>
                </View>
              </View>
            </View>
            <View style={styles.lastSyncWrap}>
              <Text style={styles.lastSyncTitle}>LAST SYNC</Text>
              <Text style={styles.lastSyncTime}>2 mins{'\n'}ago</Text>
            </View>
          </View>
          
          <View style={styles.deviceDivider} />
          
          <Text style={styles.deviceDesc}>
            This device is currently authorized to access your secure attendance logs and biometric signatures.
          </Text>

          <TouchableOpacity style={styles.requestDeviceBtn}>
            <Text style={styles.requestDeviceBtnText}>REQUEST DEVICE CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <View style={[styles.settingItem, { borderLeftColor: '#C4C1FB' }]}>
            <ShieldCheck color="#C4C1FB" size={24} />
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>2FA Security</Text>
              <Text style={styles.settingDesc}>Your account is protected with multi-factor authentication.</Text>
            </View>
          </View>

          <View style={[styles.settingItem, { borderLeftColor: '#5DE6FF' }]}>
            <EyeOff color="#5DE6FF" size={24} />
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Privacy Mode</Text>
              <Text style={styles.settingDesc}>Location data is only shared during active shift tracking.</Text>
            </View>
          </View>
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#131B2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // As seen in image
  },
  saveIconBox: {
    // Just putting the icon directly
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  sectionTitle: {
    color: '#C8C5D0',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 1.4,
  },
  formContainer: {
    backgroundColor: '#171F33',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 12,
  },
  inputContainer: {
    backgroundColor: '#222A3D',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  input: {
    color: '#F1F5F9',
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  passwordRules: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ruleTextGreen: {
    color: '#C8C5D0',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  ruleDotDark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D3449',
  },
  ruleTextDark: {
    color: '#928F9A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  changePasswordBtn: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5DE6FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  changePasswordBtnText: {
    color: '#2D2A5B',
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 1.6,
  },
  deviceCard: {
    backgroundColor: '#131B2E',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  deviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deviceIconWrap: {
    width: 56,
    height: 56,
    backgroundColor: '#2D3449',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceTextWrap: {
    gap: 4,
  },
  deviceName: {
    color: '#DAE2FD',
    fontSize: 18,
    fontFamily: FONTS.bold,
    lineHeight: 24,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  activeText: {
    color: '#34D399',
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  lastSyncWrap: {
    alignItems: 'flex-end',
  },
  lastSyncTitle: {
    color: '#928F9A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  lastSyncTime: {
    color: '#C8C5D0',
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    textAlign: 'right',
  },
  deviceDivider: {
    height: 1,
    backgroundColor: 'rgba(71, 70, 79, 0.2)',
  },
  deviceDesc: {
    color: '#C8C5D0',
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  requestDeviceBtn: {
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  requestDeviceBtnText: {
    color: '#5DE6FF',
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 1.2,
  },
  settingsList: {
    marginTop: 24,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222A3D',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderLeftWidth: 4,
  },
  settingTextWrap: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  settingDesc: {
    color: '#C8C5D0',
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
});
