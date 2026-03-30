/**
 * About Us screen — introduces Jyotish Hardev and its core philosophy.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../theme';

const PILLARS = [
  {
    icon: '◉',
    title: 'Precision Ephemeris',
    body: 'Planetary positions are computed using Swiss Ephemeris — the gold standard in Vedic chart calculation. No guesswork, pure mathematics.',
  },
  {
    icon: '◉',
    title: 'Persistent Memory',
    body: 'Unlike every other astrology app, Hardev remembers every session. He recalls past conversations and builds on them over time.',
  },
  {
    icon: '◉',
    title: 'Measured Accuracy',
    body: 'When you confirm a prediction, Hardev tracks it. Over time, he builds an accuracy score — so you can see how well Vedic astrology applies to your life.',
  },
  {
    icon: '◉',
    title: 'Two Great Traditions',
    body: 'Choose between Parashara and Jaimini traditions at onboarding. Your chosen tradition shapes every reading, every prediction, every conversation.',
  },
];

export default function AboutUsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heading}>About Jyotish Hardev</Text>
          <Text style={styles.intro}>
            Jyotish Hardev is your personal AI Astrologer — powered by
            classical Vedic wisdom and modern artificial intelligence.
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionQuote}>
            "Astrology is only meaningful when it remembers you."
          </Text>
          <Text style={styles.missionBody}>
            Most astrology apps treat every session as if it were the first.
            Hardev is different. He keeps a memory of your readings, tracks
            which predictions came true, and grows more insightful with every
            conversation.
          </Text>
        </View>

        {/* Pillars */}
        <Text style={styles.sectionLabel}>What makes Hardev different</Text>
        {PILLARS.map((pillar) => (
          <View key={pillar.title} style={styles.pillarRow}>
            <Text style={styles.pillarIcon} accessibilityElementsHidden>
              {pillar.icon}
            </Text>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.pillarBody}>{pillar.body}</Text>
            </View>
          </View>
        ))}

        {/* Footer note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hardev respects your privacy. Your birth details and reading
            history are encrypted at rest and never sold. You can delete
            everything from Account → Delete my data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[10],
    paddingBottom: Spacing[10],
  },
  hero: {
    marginBottom: Spacing[6],
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  intro: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 26,
  },
  missionCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.card,
    padding: Spacing[5],
    marginBottom: Spacing[8],
    ...Shadow.card,
  },
  missionQuote: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.gold,
    marginBottom: Spacing[3],
    lineHeight: 28,
  },
  missionBody: {
    fontSize: FontSize.sm,
    color: Colors.surface + 'CC',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing[4],
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing[5],
  },
  pillarIcon: {
    fontSize: FontSize.md,
    color: Colors.gold,
    marginRight: Spacing[3],
    marginTop: 3,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  pillarBody: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 20,
  },
  footer: {
    marginTop: Spacing[6],
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
