/**
 * Step 2 — Date of Birth
 * Scroll-wheel date picker, progress 2/5.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../../theme';
import ProgressBar from '../../components/ProgressBar';
import ScrollWheelPicker from '../../components/ScrollWheelPicker';

type Props = StackScreenProps<OnboardingStackParams, 'DOB'>;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export default function DOBScreen({ route, navigation }: Props) {
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1985);

  const days = Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1);
  const months = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse();

  const handleNext = () => {
    // Clamp day in case month/year changed it out of range
    const maxDay = daysInMonth(month, year);
    const safeDay = Math.min(day, maxDay);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;

    navigation.navigate('TOB', {
      ...route.params,
      dob: dateStr,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressBar step={2} total={5} />

      <View style={styles.content}>
        <Text style={styles.heading}>When were you born?</Text>
        <Text style={styles.microcopy}>
          Your birth date shapes your planetary periods
        </Text>

        <View style={styles.pickerContainer} accessibilityLabel="Date of birth picker">
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Day</Text>
            <ScrollWheelPicker
              items={days.map((d) => ({ label: String(d), value: d }))}
              selectedValue={day}
              onValueChange={(val) => setDay(val as number)}
              accessibilityLabel="Day of birth"
            />
          </View>

          <View style={[styles.pickerColumn, styles.pickerMonthColumn]}>
            <Text style={styles.pickerLabel}>Month</Text>
            <ScrollWheelPicker
              items={months}
              selectedValue={month}
              onValueChange={(val) => setMonth(val as number)}
              accessibilityLabel="Month of birth"
            />
          </View>

          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Year</Text>
            <ScrollWheelPicker
              items={years.map((y) => ({ label: String(y), value: y }))}
              selectedValue={year}
              onValueChange={(val) => setYear(val as number)}
              accessibilityLabel="Year of birth"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue to time of birth"
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
    marginBottom: Spacing[2],
  },
  microcopy: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing[8],
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    ...Shadow.card,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerMonthColumn: {
    flex: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  pickerLabel: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginBottom: Spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});
