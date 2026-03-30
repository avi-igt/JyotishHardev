/**
 * Home screen — landing page for the main app.
 * Shows the app tagline and quick-access cards to core features.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../theme';
import type { MainTabParams } from '../navigation/AppNavigator';

type NavProp = BottomTabNavigationProp<MainTabParams, 'Home'>;

const QUICK_LINKS = [
  {
    icon: '◎',
    title: 'My Kundali',
    body: 'View your birth chart and life timeline predictions.',
    tab: 'Dashboard' as keyof MainTabParams,
  },
  {
    icon: '✉',
    title: 'Ask Hardev',
    body: 'Chat with your personal Vedic astrologer about any topic.',
    tab: 'Conversation' as keyof MainTabParams,
  },
  {
    icon: '◈',
    title: 'Track Events',
    body: 'Log life events and measure prediction accuracy over time.',
    tab: 'Events' as keyof MainTabParams,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.appName}>Jyotish Hardev</Text>
          <Text style={styles.tagline}>Your personal AI Vedic Astrologer</Text>
          <Text style={styles.subtitle}>
            Precision chart computation. Persistent memory. Predictions that
            build accuracy over time.
          </Text>
        </View>

        {/* Quick-access cards */}
        <Text style={styles.sectionLabel}>Explore</Text>
        {QUICK_LINKS.map((link) => (
          <TouchableOpacity
            key={link.title}
            style={styles.card}
            onPress={() => navigation.navigate(link.tab)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={link.title}
          >
            <Text style={styles.cardIcon} accessibilityElementsHidden>
              {link.icon}
            </Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{link.title}</Text>
              <Text style={styles.cardBody}>{link.body}</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: Spacing[10],
  },
  appName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['3xl'] ?? 32,
    color: Colors.primary,
    marginBottom: Spacing[2],
  },
  tagline: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.gold,
    marginBottom: Spacing[3],
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.muted,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    ...Shadow.card,
  },
  cardIcon: {
    fontSize: 22,
    color: Colors.primary,
    marginRight: Spacing[4],
    width: 28,
    textAlign: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: Colors.primary,
    marginBottom: 2,
  },
  cardBody: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: FontSize.md,
    color: Colors.muted,
    marginLeft: Spacing[2],
  },
});
