/**
 * Kundali generation loading screen.
 *
 * Planetary animation: each planet placed one by one (~3-5s total).
 * Respects prefers-reduced-motion — fallback: progress bar.
 * After complete: navigate to Dashboard.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, PlanetAbbrev } from '../../theme';
import { onboarding } from '../../services/api';

type Props = StackScreenProps<OnboardingStackParams, 'KundaliGenerating'>;

const PLANET_SEQUENCE = [
  { name: 'Sun',     abbrev: 'Su', sign: '' },
  { name: 'Moon',    abbrev: 'Mo', sign: '' },
  { name: 'Mars',    abbrev: 'Ma', sign: '' },
  { name: 'Mercury', abbrev: 'Bu', sign: '' },
  { name: 'Jupiter', abbrev: 'Gu', sign: '' },
  { name: 'Venus',   abbrev: 'Sk', sign: '' },
  { name: 'Saturn',  abbrev: 'Sa', sign: '' },
  { name: 'Rahu',    abbrev: 'Ra', sign: '' },
  { name: 'Ketu',    abbrev: 'Ke', sign: '' },
];

const STEP_DURATION = 400; // ms per planet

export default function KundaliGeneratingScreen({ route, navigation }: Props) {
  const { profilePayload } = route.params ?? {};

  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [placedPlanets, setPlacedPlanets] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [planetSigns, setPlanetSigns] = useState<Record<string, string>>({});
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((isReduced) => {
      setReducedMotion(isReduced);
    });
  }, []);

  useEffect(() => {
    // Create the profile via API
    const createProfile = async () => {
      try {
        const payload = profilePayload as Parameters<typeof onboarding.createProfile>[0];
        const result = await onboarding.createProfile(payload);

        // Extract planet signs from chart_json for the animation
        if (result.kundali?.chart_json) {
          const chart = result.kundali.chart_json as Record<string, unknown>;
          const positions = chart.positions as Record<string, { sign: string }> | undefined;
          if (positions) {
            const signs: Record<string, string> = {};
            for (const [planet, data] of Object.entries(positions)) {
              signs[planet] = data.sign;
            }
            setPlanetSigns(signs);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      }
    };

    createProfile();
  }, []);

  // Animate planets one by one
  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: instant progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        handleComplete();
      });
      return;
    }

    if (currentPlanet >= PLANET_SEQUENCE.length) {
      // All planets placed — navigate
      setTimeout(() => handleComplete(), 500);
      return;
    }

    const timer = setTimeout(() => {
      const planet = PLANET_SEQUENCE[currentPlanet];
      setPlacedPlanets((prev) => [...prev, planet.name]);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: (currentPlanet + 1) / PLANET_SEQUENCE.length,
        duration: STEP_DURATION,
        useNativeDriver: false,
      }).start();

      setCurrentPlanet((prev) => prev + 1);
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [currentPlanet, reducedMotion]);

  const handleComplete = () => {
    // Navigate to the main app — no intermediate "success" screen
    // Auth state change in AppNavigator will transition to MainTabs automatically
    // No explicit reset needed here
  };

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>We hit a snag</Text>
          <Text style={styles.errorBody}>
            Computing your chart ran into an issue. Your details are saved —
            tap to try again.
          </Text>
          <Text style={styles.errorRetry} onPress={() => setError('')}>
            Try again →
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Computing your Kundali</Text>
        <Text style={styles.subtitle}>
          Each planet is being placed in its exact position
        </Text>

        {/* Progress bar — always visible */}
        <View style={styles.progressTrack} accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: PLANET_SEQUENCE.length,
            now: placedPlanets.length,
          }}
        >
          <Animated.View
            style={[styles.progressFill, { width: progressBarWidth }]}
          />
        </View>

        {/* Planet placement list — only shown when not reduced motion */}
        {!reducedMotion && (
          <View style={styles.planetList}>
            {PLANET_SEQUENCE.map((planet, idx) => {
              const isPlaced = placedPlanets.includes(planet.name);
              const isPlacing = idx === currentPlanet;
              const sign = planetSigns[planet.name] || '';

              return (
                <View
                  key={planet.name}
                  style={styles.planetRow}
                  accessible
                  accessibilityLabel={
                    isPlaced
                      ? `${planet.name} placed in ${sign || 'position'}`
                      : isPlacing
                      ? `Placing ${planet.name}...`
                      : planet.name
                  }
                >
                  <Text
                    style={[
                      styles.planetAbbrev,
                      isPlaced && styles.planetAbbrevPlaced,
                      isPlacing && styles.planetAbbrevPlacing,
                    ]}
                  >
                    {planet.abbrev}
                  </Text>
                  <Text
                    style={[
                      styles.planetName,
                      isPlaced && styles.planetNamePlaced,
                    ]}
                  >
                    {isPlacing
                      ? `Placing ${planet.name}...`
                      : isPlaced
                      ? `${planet.name}${sign ? ` · ${sign}` : ''}`
                      : planet.name}
                  </Text>
                  {isPlaced && (
                    <Text style={styles.planetCheck} accessibilityElementsHidden>
                      ✓
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {reducedMotion && (
          <Text style={styles.reducedMotionText}>
            Placing all 9 planets...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[16],
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.surface + 'AA',
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.surface + '33',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing[8],
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  planetList: {
    width: '100%',
    maxWidth: 320,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface + '1A',
    minHeight: 44,
  },
  planetAbbrev: {
    width: 36,
    fontSize: FontSize.sm,
    color: Colors.surface + '66',
    fontWeight: '600',
  },
  planetAbbrevPlaced: {
    color: Colors.gold,
  },
  planetAbbrevPlacing: {
    color: Colors.surface,
  },
  planetName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.surface + '66',
  },
  planetNamePlaced: {
    color: Colors.surface,
  },
  planetCheck: {
    fontSize: FontSize.md,
    color: Colors.gold,
    marginLeft: Spacing[2],
  },
  reducedMotionText: {
    fontSize: FontSize.md,
    color: Colors.surface + 'AA',
    textAlign: 'center',
  },
  // Error state
  errorContainer: {
    flex: 1,
    padding: Spacing[6],
    justifyContent: 'center',
  },
  errorTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  errorBody: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing[4],
  },
  errorRetry: {
    fontSize: FontSize.md,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
