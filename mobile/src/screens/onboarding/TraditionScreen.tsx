/**
 * Step 4 — Tradition
 * ⚠️ Permanent warning + two choice cards (Parashara/Jaimini). Progress 4/5.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../../theme';
import ProgressBar from '../../components/ProgressBar';

type Props = StackScreenProps<OnboardingStackParams, 'Tradition'>;
type Tradition = 'parashara' | 'jaimini';

export default function TraditionScreen({ route, navigation }: Props) {
  const [selected, setSelected] = useState<Tradition | null>(null);

  const handleNext = () => {
    if (!selected) return;
    navigation.navigate('DPDPA', {
      ...route.params,
      tradition: selected,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressBar step={4} total={5} />

      <View style={styles.content}>
        <Text style={styles.heading}>Choose your tradition</Text>

        {/* Permanent warning — shown clearly, not buried */}
        <View style={styles.warningCard} accessibilityRole="alert">
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            This choice is permanent. You won't be able to change it later.
            Choose the tradition your astrologer uses.
          </Text>
        </View>

        {/* Parashara card */}
        <TouchableOpacity
          style={[styles.traditionCard, selected === 'parashara' && styles.traditionCardSelected]}
          onPress={() => setSelected('parashara')}
          activeOpacity={0.85}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'parashara' }}
          accessibilityLabel="Parashara tradition — recommended"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Parashara</Text>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            The most widely practiced system — your astrologer likely uses this
          </Text>
          {selected === 'parashara' && (
            <Text style={styles.selectedIndicator}>✓ Selected</Text>
          )}
        </TouchableOpacity>

        {/* Jaimini card */}
        <TouchableOpacity
          style={[styles.traditionCard, selected === 'jaimini' && styles.traditionCardSelected]}
          onPress={() => setSelected('jaimini')}
          activeOpacity={0.85}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'jaimini' }}
          accessibilityLabel="Jaimini tradition — advanced"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Jaimini</Text>
            <View style={styles.advancedBadge}>
              <Text style={styles.advancedText}>Advanced</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            An advanced system — ask your astrologer before choosing this
          </Text>
          {selected === 'jaimini' && (
            <Text style={styles.selectedIndicator}>✓ Selected</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue to privacy consent"
          accessibilityState={{ disabled: !selected }}
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    marginBottom: Spacing[4],
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#E8C95A',
    borderRadius: Radius.card,
    padding: Spacing[4],
    marginBottom: Spacing[6],
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: FontSize.md,
    marginRight: Spacing[2],
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  traditionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  traditionCardSelected: {
    borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[2],
    gap: Spacing[2],
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
  },
  recommendedBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: Radius.chip,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  advancedBadge: {
    backgroundColor: Colors.muted + '20',
    borderRadius: Radius.chip,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  advancedText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 20,
  },
  selectedIndicator: {
    marginTop: Spacing[2],
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: Spacing[4],
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
