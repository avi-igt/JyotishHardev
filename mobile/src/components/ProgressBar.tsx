/**
 * Onboarding progress bar (1/5, 2/5, ...).
 * Dots style — shows proximity to reward.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize } from '../theme';

interface Props {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: Props) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.container}>
      {canGoBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dotsContainer} accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: step }}
        accessibilityLabel={`Step ${step} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i + 1 <= step ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.stepLabel}>{step}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
  },
  backButton: {
    marginRight: Spacing[4],
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: FontSize.xl,
    color: Colors.primary,
  },
  dotsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    backgroundColor: Colors.border,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginLeft: Spacing[4],
  },
});
