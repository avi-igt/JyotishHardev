/**
 * Step 3 — Time of Birth
 * AM/PM time picker + prominent "I don't know" button. Progress 3/5.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../../theme';
import ProgressBar from '../../components/ProgressBar';
import ScrollWheelPicker from '../../components/ScrollWheelPicker';

type Props = StackScreenProps<OnboardingStackParams, 'TOB'>;

const HOURS = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  value: i + 1,
}));

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: i,
}));

export default function TOBScreen({ route, navigation }: Props) {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [showUnknownConfirm, setShowUnknownConfirm] = useState(false);

  const handleNext = () => {
    // Convert to 24h
    let hour24 = hour;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
    else if (ampm === 'PM' && hour !== 12) hour24 = hour + 12;

    const tobStr = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    navigation.navigate('Tradition', {
      ...route.params,
      tob: tobStr,
      tob_unknown: false,
    });
  };

  const handleUnknown = () => {
    setShowUnknownConfirm(true);
  };

  const confirmUnknown = () => {
    setShowUnknownConfirm(false);
    navigation.navigate('Tradition', {
      ...route.params,
      tob: undefined,
      tob_unknown: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressBar step={3} total={5} />

      <View style={styles.content}>
        <Text style={styles.heading}>What time were you born?</Text>
        <Text style={styles.microcopy}>
          Your birth time determines your ascendant (Lagna)
        </Text>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Hour</Text>
            <ScrollWheelPicker
              items={HOURS}
              selectedValue={hour}
              onValueChange={(val) => setHour(val as number)}
              accessibilityLabel="Hour of birth"
            />
          </View>

          <View style={styles.pickerSep}>
            <Text style={styles.pickerSepText}>:</Text>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Minute</Text>
            <ScrollWheelPicker
              items={MINUTES}
              selectedValue={minute}
              onValueChange={(val) => setMinute(val as number)}
              accessibilityLabel="Minute of birth"
            />
          </View>

          <View style={styles.ampmContainer}>
            {(['AM', 'PM'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.ampmButton, ampm === period && styles.ampmButtonActive]}
                onPress={() => setAmpm(period)}
                accessibilityRole="radio"
                accessibilityState={{ checked: ampm === period }}
                accessibilityLabel={period}
              >
                <Text
                  style={[styles.ampmText, ampm === period && styles.ampmTextActive]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue with this birth time"
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>

        {/* Prominent secondary action — NOT hidden */}
        <TouchableOpacity
          style={styles.unknownButton}
          onPress={handleUnknown}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="I don't know my birth time"
        >
          <Text style={styles.unknownButtonText}>I don't know my birth time</Text>
        </TouchableOpacity>

        <Text style={styles.unknownHint}>
          Don't know your exact time? We'll use noon and note the uncertainty.
        </Text>
      </View>

      {/* Confirmation dialog for unknown time */}
      <Modal
        visible={showUnknownConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnknownConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Using noon chart</Text>
            <Text style={styles.modalBody}>
              We'll use noon as your birth time and note the uncertainty on your
              chart. Your Lagna (rising sign) may be less accurate, but all other
              planetary positions will be precise.
            </Text>
            <TouchableOpacity
              style={styles.modalConfirm}
              onPress={confirmUnknown}
              accessibilityRole="button"
              accessibilityLabel="Confirm using noon chart"
            >
              <Text style={styles.modalConfirmText}>Continue with noon chart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowUnknownConfirm(false)}
              accessibilityRole="button"
              accessibilityLabel="Go back and enter time"
            >
              <Text style={styles.modalCancelText}>I'll try to find it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing[2],
  },
  microcopy: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing[8],
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    ...Shadow.card,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginBottom: Spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerSep: {
    paddingTop: 24,
    paddingHorizontal: Spacing[1],
  },
  pickerSepText: {
    fontSize: FontSize.xl,
    color: Colors.muted,
    fontWeight: '300',
  },
  ampmContainer: {
    marginLeft: Spacing[4],
    gap: Spacing[2],
  },
  ampmButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 44,
    alignItems: 'center',
  },
  ampmButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ampmText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
  ampmTextActive: {
    color: Colors.surface,
  },
  nextButton: {
    marginTop: Spacing[8],
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  unknownButton: {
    marginTop: Spacing[4],
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    minHeight: 48,
    justifyContent: 'center',
  },
  unknownButtonText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  unknownHint: {
    marginTop: Spacing[3],
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[6],
    width: '100%',
    ...Shadow.modal,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  modalBody: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing[6],
  },
  modalConfirm: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  modalConfirmText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  modalCancel: {
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
});
