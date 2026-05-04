import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Assuming this exists
import { COLORS, FONTS } from '../theme/theme';
import { BookOpen, MapPin, Search, Filter, Home, Calendar, Bell, User, Clock, QrCode, Shield, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react-native';
import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { attendanceApi } from '../api/attendanceApi';
import { useEffect, useState } from 'react';

type ScanQRScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScanQR'>;

interface Props {
  navigation: ScanQRScreenNavigationProp;
}

export default function ScanQRScreen({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ professor: string; course: string; room: string } | null>(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && locationStatus === 'granted');
    };
    getPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // 1. Parse QR Data
      let qrPayload;
      try {
        console.log('Raw QR Data:', data);
        qrPayload = JSON.parse(data);
        
        // Handle potential double-stringification (just in case web-doctor was slow to update)
        if (typeof qrPayload === 'string') {
          console.log('Double-stringified QR detected, parsing again...');
          qrPayload = JSON.parse(qrPayload);
        }

        if (qrPayload && qrPayload.professorName) {
           setSessionInfo({
             professor: qrPayload.professorName,
             course: qrPayload.courseCode,
             room: qrPayload.room
           });
        }
      } catch (e) {
        console.error('QR Parse Error:', e);
        throw { response: { data: { error: { code: 'QR_INVALID' } } } };
      }

      // 2. Get Location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // 3. Scan Attendance
      console.log('Sending Attendance Scan Request...', {
        sessionId: qrPayload.sessionId,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      });
      
      const response = await attendanceApi.scanAttendance({
        qrToken: data,
        sessionId: qrPayload.sessionId || '', 
        studentLat: loc.coords.latitude,
        studentLng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? 999,
        isMockLocation: (loc as any).mocked ?? false,
      });

      // 4. Success -> Navigate to success or show overlay
      setErrorState('ALREADY_CHECK_IN'); // Using this for success feedback in this UI state
      setTimeout(() => navigation.goBack(), 2000);
    } catch (err: any) {
      console.error('Scan Error Object:', JSON.stringify(err, null, 2));
      const errorCode = err.response?.data?.error?.code || 'GENERIC_ERROR';
      setErrorState(errorCode);
      
      // Allow re-scanning after 3s if it wasn't a permanent error
      if (errorCode === 'INVALID_CODE' || errorCode === 'EXPIRED_SESSION') {
        setTimeout(() => setScanned(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderErrorOverlay = () => {
    if (!errorState) return null;

    const errorContent: Record<string, { title: string; sub: string; color: string }> = {
      OUT_OF_RANGE: { title: 'Out of Range', sub: 'You must be physically present in the lecture hall.', color: '#EF4444' },
      NOT_ENROLLED: { title: 'Not Enrolled', sub: 'You are not registered for this specific course.', color: '#F59E0B' },
      ALREADY_CHECK_IN: { title: 'Already Logged', sub: 'Your attendance for this session is already recorded.', color: COLORS.primary },
      INVALID_CODE: { title: 'Invalid Code', sub: 'The QR code is not recognized by Mindtag.', color: '#EF4444' },
      EXPIRED_SESSION: { title: 'Session Expired', sub: 'This QR code is no longer valid.', color: '#94A3B8' },
      DEVICE_MISMATCH: { title: 'Security Alert', sub: 'Device ID does not match registered account.', color: '#EF4444' },
      NO_PERMISSION: { title: 'Access Denied', sub: 'Account lacks permission for this action.', color: '#EF4444' },
      SESSION_NOT_FOUND: { title: 'Session Ended', sub: 'This attendance session is no longer active.', color: '#EF4444' },
      SESSION_NOT_ACTIVE: { title: 'Inactive Session', sub: 'The professor has stopped attendance collection.', color: '#F59E0B' },
      QR_INVALID: { title: 'Invalid Scan', sub: 'This QR code is not recognized by Mindtag.', color: '#EF4444' },
      QR_EXPIRED: { title: 'QR Expired', sub: 'This specific flash has expired. Wait for the next one.', color: '#94A3B8' },
      QR_ALREADY_USED: { title: 'Security Warning', sub: 'This QR code flash was already used by another student.', color: '#EF4444' },
      ALREADY_CHECKED_IN: { title: 'Attendance Logged', sub: 'Your attendance for this session is already recorded.', color: COLORS.primary },
      ATTENDANCE_WINDOW_CLOSED: { title: 'Window Closed', sub: 'Attendance is only allowed within the first 30 mins.', color: '#EF4444' },
      OFFLINE: { title: 'Offline Mode', sub: 'Attendance will be synced once connected.', color: '#6366F1' },
      GENERIC_ERROR: { title: 'System Error', sub: 'An unexpected issue occurred. Try again.', color: '#EF4444' },
    };

    const current = errorContent[errorState] || errorContent.GENERIC_ERROR;

    return (
      <TouchableOpacity 
        style={styles.errorOverlay} 
        activeOpacity={1} 
        onPress={() => setErrorState(null)}
      >
        <View style={[styles.errorCard, { borderColor: current.color }]}>
          <AlertTriangle color={current.color} size={40} style={{ marginBottom: 16 }} />
          <Text style={[styles.errorTitle, { color: current.color }]}>{current.title}</Text>
          <Text style={styles.errorSubText}>{current.sub}</Text>
          <TouchableOpacity 
            style={[styles.closeErrorBtn, { backgroundColor: current.color }]} 
            onPress={() => setErrorState(null)}
          >
            <Text style={styles.closeErrorText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        {/* Glow Effects */}
        <View style={[styles.glowOrb, styles.glowOrbTop]} />
        <View style={[styles.glowOrb, styles.glowOrbCenter]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={COLORS.surface} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR</Text>
        </View>
        <Shield color={COLORS.purple} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Secure Session Pill */}
        <View style={styles.securePillContainer}>
          <View style={styles.securePill}>
            <View style={styles.secureDot} />
            <Text style={styles.secureText}>SECURE SESSION</Text>
          </View>
        </View>

        {/* Titles */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleRegular}>Scan QR for </Text>
          <Text style={styles.titleHighlight}>{sessionInfo?.course || 'Current Lecture'}</Text>
          <Text style={styles.subtitle}>Align the code within the frame to log attendance</Text>
        </View>

        {/* QR Frame */}
        <View style={styles.qrFrameContainer}>
          <View style={styles.qrFrame}>
            {/* Corners */}
            <View style={[styles.corner, styles.topLeftCorner]} />
            <View style={[styles.corner, styles.topRightCorner]} />
            <View style={[styles.corner, styles.bottomLeftCorner]} />
            <View style={[styles.corner, styles.bottomRightCorner]} />
            
            {/* Center Camera Overlay */}
            <View style={styles.cameraPlaceholder}>
              {hasPermission === null ? (
                <ActivityIndicator color={COLORS.primary} size="large" />
              ) : hasPermission === false ? (
                <Text style={{ color: '#EF4444', textAlign: 'center', padding: 20 }}>No access to camera or location</Text>
              ) : (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                />
              )}
              
              {loading && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }]}>
                  <Loader2 color={COLORS.primary} size={48} />
                  <Text style={{ color: '#FFF', marginTop: 12, fontFamily: FONTS.bold }}>Validating Presence...</Text>
                </View>
              )}

              {/* Scan Laser Line */}
              {!loading && !scanned && <View style={styles.laserLine} />}
            </View>
          </View>
        </View>

        {/* Bottom Info Card */}
        <TouchableOpacity style={styles.infoCard} onPress={() => setErrorState('OUT_OF_RANGE')}>
          <View style={styles.infoCardLeft}>
            <View style={styles.iconBox}>
              <User color={COLORS.purple} size={22} />
            </View>
            <View>
              <Text style={styles.infoLabel}>CURRENT PROFESSOR</Text>
              <Text style={styles.infoValue}>{sessionInfo?.professor || 'Discovering...'}</Text>
            </View>
          </View>
          <View style={styles.infoCardRight}>
            <Text style={styles.infoLabelRight}>ROOM</Text>
            <Text style={styles.infoValueRight}>{sessionInfo?.room || '--'}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {renderErrorOverlay()}

      {/* Bottom Tab Bar (Dummy for now until React Navigation setup) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItemActive} onPress={() => navigation.navigate('Home')}>
          <Home color="#0F172A" size={20} />
          <Text style={styles.tabTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Schedule')}>
          <Calendar color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <User color="#94A3B8" size={20} />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowOrbTop: {
    width: 400,
    height: 400,
    left: -100,
    top: -50,
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
  },
  glowOrbCenter: {
    width: 300,
    height: 300,
    left: '10%',
    top: 300,
    backgroundColor: 'rgba(93, 230, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  securePillContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 52, 73, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.2)',
    gap: 8,
  },
  secureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  secureText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  titleRegular: {
    color: '#DAE2FD',
    fontSize: 24,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  titleHighlight: {
    color: COLORS.purple,
    fontSize: 24,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 16,
  },
  qrFrameContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  qrFrame: {
    width: 256,
    height: 256,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 8,
  },
  cameraIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(93, 230, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(19, 27, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 79, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  infoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#C8C5D0',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  infoCardRight: {
    alignItems: 'flex-end',
  },
  infoLabelRight: {
    color: '#C8C5D0',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValueRight: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 31, 51, 0.85)',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32, // Safe area padding manually added
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary, // using simple primary as fallback for gradient
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#0F172A',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 19, 38, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 100,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#1E2336',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: FONTS.black,
    marginBottom: 8,
  },
  errorSubText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  closeErrorBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  closeErrorText: {
    color: '#0F172A',
    fontFamily: FONTS.black,
    fontSize: 14,
  },
});
