import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Assuming this exists
import { COLORS, FONTS } from '../theme/theme';
import { ArrowLeft, Share2, Download, Clock, CheckCircle2, MessageCircle, Bookmark, FileText, FileArchive, BookOpen } from 'lucide-react-native';

type AnnouncementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Announcement'>;

interface Props {
  navigation: AnnouncementScreenNavigationProp;
}

export default function AnnouncementScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        {/* Glow Effects */}
        <View style={[styles.glowOrb, styles.glowOrbTop]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color="#C8C5D0" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcement</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 color="#C8C5D0" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleActionButton}>
            <Download color="#0F172A" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Course Pill */}
        <View style={styles.coursePill}>
          <BookOpen color={COLORS.purple} size={12} />
          <Text style={styles.coursePillText}>CS301</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Mid-Term Project Requirements Updated</Text>

        {/* Meta Info */}
        <View style={styles.metaInfoRow}>
          <Clock color={COLORS.textMuted} size={14} />
          <Text style={styles.metaInfoText}>Posted Oct 24, 2023 • 10:45 AM</Text>
        </View>

        {/* Author Card */}
        <View style={styles.authorCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <UserPlaceholder />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>Prof. Sarah Jenkins</Text>
            <Text style={styles.authorRole}>Lead Instructor • Computer Science</Text>
          </View>
        </View>

        {/* Highlight Text */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightText}>
            "Please review the following updates carefully as they impact the final submission criteria for the CS301 Mid-Term project."
          </Text>
        </View>

        {/* Body Text */}
        <Text style={styles.bodyText}>
          Hello students, I have decided to refine the requirements for our upcoming Mid-Term project to better reflect the industry standards discussed in our last lecture. These changes are designed to give you more creative freedom while ensuring the core technical competencies are met.
        </Text>

        {/* Key Updates Card */}
        <View style={styles.updatesCard}>
          <View style={styles.updatesHeader}>
            <CheckCircle2 color={COLORS.purple} size={20} />
            <Text style={styles.updatesTitle}>Key Updates</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletHighlight}>Database Schema:</Text> The requirement for normalization up to 3NF is now optional for the prototype phase but remains a bonus for final grading.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletHighlight}>API Documentation:</Text> You must now include a basic README.md detailing at least 3 core endpoints.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletHighlight}>Deadline Extension:</Text> Due to the complexity of these refinements, the submission window is extended by 48 hours.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.bodyText}>
          The updated rubric has been uploaded to the course dashboard under "Resources &gt; Mid-Term &gt; Revised_Rubric_V2.pdf". I highly recommend you download this and cross-reference it with your current progress.
        </Text>
        
        <Text style={styles.bodyText}>
          If you have questions regarding these changes, please attend the extra office hours session scheduled for this Friday at 3:00 PM via the standard virtual classroom link.
        </Text>

        <Text style={styles.signOff}>
          Best regards,
          {'\n'}
          <Text style={styles.signOffName}>Prof. Jenkins</Text>
        </Text>

        {/* Attachments Section */}
        <Text style={styles.attachmentsHeader}>ATTACHED FILES (2)</Text>
        
        <View style={styles.attachmentCard}>
          <View style={[styles.attachmentIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <FileText color="#EF4444" size={20} />
          </View>
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName}>Revised_Rubric_V2.pdf</Text>
            <Text style={styles.attachmentSize}>2.4 MB</Text>
          </View>
        </View>

        <View style={styles.attachmentCard}>
          <View style={[styles.attachmentIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <FileArchive color="#3B82F6" size={20} />
          </View>
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName}>Project_Templates.zip</Text>
            <Text style={styles.attachmentSize}>15.8 MB</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={['#A5B4FC', '#22D3EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonBg}
            >
              <MessageCircle color="#0F172A" size={18} />
              <Text style={styles.primaryButtonText}>Join Discussion</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Bookmark color="#C8C5D0" size={18} />
            <Text style={styles.secondaryButtonText}>Save for Later</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Temporary SVG Placeholder for Avatar
const UserPlaceholder = () => (
  <View style={{ width: '100%', height: '100%', backgroundColor: '#2D3449', borderRadius: 20 }} />
);

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
    width: 300,
    height: 300,
    right: -100,
    top: -50,
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
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34D399', // A greenish color based on Figma
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 64,
  },
  coursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 193, 251, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  coursePillText: {
    color: COLORS.purple,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    lineHeight: 36,
    marginBottom: 16,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  metaInfoText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#171F33',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  authorRole: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  highlightCard: {
    backgroundColor: 'rgba(19, 27, 46, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  highlightText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  bodyText: {
    color: '#C8C5D0',
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    marginBottom: 24,
  },
  updatesCard: {
    backgroundColor: 'rgba(23, 31, 51, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  updatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  updatesTitle: {
    color: '#C4C1FB',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  bulletList: {
    gap: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  bulletHighlight: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  signOff: {
    color: '#C8C5D0',
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    marginBottom: 32,
  },
  signOffName: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  attachmentsHeader: {
    color: '#C8C5D0',
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  attachmentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    color: '#DAE2FD',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  attachmentSize: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  actionButtonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButtonBg: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(23, 31, 51, 0.6)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#C8C5D0',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
