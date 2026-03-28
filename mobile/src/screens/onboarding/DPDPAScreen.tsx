/**
 * Step 5 — DPDPA Consent
 * 3 plain-language bullets + checkbox + [Generate my Kundali] CTA. Progress 5/5.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../../theme';
import ProgressBar from '../../components/ProgressBar';

type Props = StackScreenProps<OnboardingStackParams, 'DPDPA'>;

const DATA_BULLETS = [
  {
    icon: '◉',
    title: 'Your birth details',
    body: 'We store your name, date, time, and place of birth to compute your Kundali. This is encrypted at rest and never sold.',
  },
  {
    icon: '◉',
    title: 'Your reading history',
    body: 'We keep summaries of your sessions with Hardev so he can remember past conversations and improve over time.',
  },
  {
    icon: '◉',
    title: 'Anonymized accuracy data',
    body: 'When you confirm a prediction, only the prediction domain (not your identity) is added to our aggregate accuracy index.',
  },
];

export default function DPDPAScreen({ route, navigation }: Props) {
  const [consented, setConsented] = useState(false);
  const [showShake, setShowShake] = useState(false);

  const handleGenerate = () => {
    if (!consented) {
      // Subtle accessibility cue — shake effect would be animated in full implementation
      setShowShake(true);
      setTimeout(() => setShowShake(false), 600);
      return;
    }

    navigation.navigate('SignUp', {
      profilePayload: {
        ...route.params,
        dpdpa_consent: true,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressBar step={5} total={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Your data, your chart</Text>
        <Text style={styles.subheading}>
          What we store and why — in plain language
        </Text>

        {DATA_BULLETS.map((bullet) => (
          <View key={bullet.title} style={styles.bulletRow}>
            <Text style={styles.bulletIcon} accessibilityElementsHidden>
              {bullet.icon}
            </Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>{bullet.title}</Text>
              <Text style={styles.bulletBody}>{bullet.body}</Text>
            </View>
          </View>
        ))}

        {/* Consent checkbox */}
        <TouchableOpacity
          style={[styles.checkboxRow, showShake && styles.checkboxRowError]}
          onPress={() => setConsented(!consented)}
          activeOpacity={0.85}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consented }}
          accessibilityLabel="I consent to JyotishHardev storing my birth details and reading history"
        >
          <View style={[styles.checkbox, consented && styles.checkboxChecked]}>
            {consented && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I consent to JyotishHardev storing my birth details and reading
            history as described above.
          </Text>
        </TouchableOpacity>

        {showShake && (
          <Text style={styles.consentRequired}>
            Please check the box above to continue
          </Text>
        )}

        {/* Privacy policy link */}
        <TouchableOpacity
          onPress={() => Linking.openURL('https://jyotishhardev.com/privacy')}
          accessibilityRole="link"
          accessibilityLabel="Read full privacy policy"
          style={styles.privacyLink}
        >
          <Text style={styles.privacyLinkText}>Read full privacy policy →</Text>
        </TouchableOpacity>

        {/* CTA — blocked until checkbox checked */}
        <TouchableOpacity
          style={[styles.ctaButton, !consented && styles.ctaButtonDisabled]}
          onPress={handleGenerate}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Generate my Kundali"
          accessibilityState={{ disabled: !consented }}
        >
          <Text style={styles.ctaButtonText}>Generate my Kundali</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          You may withdraw consent at any time from Account → Delete my data.
          This permanently deletes all stored information.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[8],
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    marginBottom: Spacing[2],
  },
  subheading: {
    fontSize: FontSize.md,
    color: Colors.muted,
    marginBottom: Spacing[6],
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
    alignItems: 'flex-start',
  },
  bulletIcon: {
    fontSize: FontSize.md,
    color: Colors.gold,
    marginRight: Spacing[3],
    marginTop: 2,
  },
  bulletContent: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  bulletBody: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  checkboxRowError: {
    borderColor: Colors.error,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: Spacing[3],
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxTick: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  consentRequired: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing[2],
  },
  privacyLink: {
    marginBottom: Spacing[6],
    minHeight: 44,
    justifyContent: 'center',
  },
  privacyLinkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    ...Shadow.card,
  },
  ctaButtonDisabled: {
    opacity: 0.4,
  },
  ctaButtonText: {
    color: Colors.surface,
    fontSize: FontSize.lg,
    fontWeight: '600',
    fontFamily: Fonts.heading,
  },
  footerNote: {
    marginTop: Spacing[4],
    fontSize: FontSize.xs,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
