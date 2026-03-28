/**
 * Dashboard screen.
 *
 * Layout:
 * - Identity strip (Lagna · Moon sign) — always visible, small
 * - PRIMARY: Milestone timeline (confidence bars + domain icons)
 * - SECONDARY: South Indian Kundali chart (4×4 grid, collapsible)
 * - PINNED: "💬 Ask your astrologer..." chat entry at bottom
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import {
  onboarding,
  predictions,
  type Profile,
  type Kundali,
  type Prediction,
} from '../services/api';
import {
  Colors,
  Fonts,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  DomainIcon,
  PlanetAbbrev,
  SOUTH_INDIAN_GRID,
} from '../theme';
import type { MainTabParams } from '../navigation/AppNavigator';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_SIZE = Math.max(320, SCREEN_WIDTH - Spacing[6] * 2);

type NavProp = BottomTabNavigationProp<MainTabParams, 'Dashboard'>;

// ─── Milestone row ──────────────────────────────────────────────────────────────

function MilestoneRow({ prediction }: { prediction: Prediction }) {
  const icon = DomainIcon[prediction.domain] ?? '◎';
  const yearRange =
    prediction.predicted_year_start === prediction.predicted_year_end
      ? String(prediction.predicted_year_start)
      : `${prediction.predicted_year_start}–${prediction.predicted_year_end}`;

  return (
    <View
      style={styles.milestoneRow}
      accessible
      accessibilityLabel={`${prediction.domain} — ${yearRange} — ${Math.round(prediction.confidence_score * 100)}% confidence. ${prediction.text}`}
      accessibilityRole="text"
    >
      <Text style={styles.milestoneYear}>{yearRange}</Text>

      <View style={styles.milestoneBar}>
        <View
          style={[
            styles.milestoneBarFill,
            { width: `${prediction.confidence_score * 100}%` },
          ]}
        />
      </View>

      <View style={styles.milestoneRight}>
        <Text style={styles.milestoneDomain} accessibilityElementsHidden>
          {icon}
        </Text>
        <Text style={styles.milestoneDomainText} numberOfLines={1}>
          {prediction.domain.charAt(0).toUpperCase() + prediction.domain.slice(1)}
        </Text>
      </View>
    </View>
  );
}

// ─── Skeleton loaders ────────────────────────────────────────────────────────────

function MilestoneSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.milestoneRow, styles.skeleton]}>
          <View style={[styles.skeletonBlock, { width: 48, height: 16 }]} />
          <View style={[styles.milestoneBar, styles.skeletonBar]} />
          <View style={[styles.skeletonBlock, { width: 40, height: 16 }]} />
        </View>
      ))}
    </>
  );
}

// ─── South Indian chart ──────────────────────────────────────────────────────────

interface ChartProps {
  chartJson: Record<string, unknown>;
}

function SouthIndianChart({ chartJson }: ChartProps) {
  const positions = chartJson.positions as Record<string, { sign: string }> | undefined;
  const lagna = chartJson.lagna as string | undefined;

  // Map sign name → house number (Lagna = house 1)
  const SIGNS = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
    'Simha', 'Kanya', 'Tula', 'Vrishchika',
    'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ];

  const lagnaSignIdx = lagna ? SIGNS.indexOf(lagna) : 0;

  // Build house contents: houseNum → [planet abbreviations]
  const houseContents: Record<number, string[]> = {};
  if (positions) {
    for (const [planet, data] of Object.entries(positions)) {
      const signIdx = SIGNS.indexOf(data.sign);
      if (signIdx >= 0) {
        const houseNum = ((signIdx - lagnaSignIdx + 12) % 12) + 1;
        if (!houseContents[houseNum]) houseContents[houseNum] = [];
        houseContents[houseNum].push(PlanetAbbrev[planet] ?? planet.slice(0, 2));
      }
    }
  }

  // Add Lagna marker
  if (!houseContents[1]) houseContents[1] = [];
  if (!houseContents[1].includes('Lg')) houseContents[1].unshift('Lg');

  const cellSize = CHART_SIZE / 4;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={[styles.chartGrid, { width: CHART_SIZE, height: CHART_SIZE }]}
        accessible
        accessibilityLabel="South Indian Kundali chart"
      >
        {SOUTH_INDIAN_GRID.map((row, rowIdx) =>
          row.map((houseNum, colIdx) => {
            const isEmpty = houseNum === null;
            const planets = houseNum ? (houseContents[houseNum] ?? []) : [];

            return (
              <View
                key={`${rowIdx}-${colIdx}`}
                style={[
                  styles.chartCell,
                  { width: cellSize, height: cellSize },
                  isEmpty && styles.chartCellEmpty,
                ]}
                accessible={!isEmpty}
                accessibilityLabel={
                  isEmpty
                    ? undefined
                    : `House ${houseNum}: ${planets.join(', ') || 'empty'}`
                }
              >
                {!isEmpty && (
                  <>
                    <Text style={styles.chartHouseNum}>{houseNum}</Text>
                    <Text style={styles.chartPlanets} numberOfLines={3}>
                      {planets.join(' ')}
                    </Text>
                  </>
                )}
              </View>
            );
          }),
        )}
      </View>
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kundali, setKundali] = useState<Kundali | null>(null);
  const [predictionList, setPredictionList] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timelineError, setTimelineError] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const [meData, predData] = await Promise.all([
        onboarding.getMe(),
        predictions.list(),
      ]);
      setProfile(meData.profile);
      setKundali(meData.kundali);
      setPredictionList(predData);
      setTimelineError(false);
    } catch {
      setTimelineError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const identityStrip = profile
    ? `${profile.lagna ?? '?'} Lagna · ${profile.moon_sign ?? '?'} 🌙`
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Identity strip */}
      {identityStrip ? (
        <View style={styles.identityStrip} accessibilityRole="header">
          <Text style={styles.identityText}>{identityStrip}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Milestone Timeline — PRIMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Life Timeline</Text>

          {loading ? (
            <MilestoneSkeleton />
          ) : timelineError ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>
                Timeline unavailable
              </Text>
              <TouchableOpacity
                onPress={load}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Reload timeline"
              >
                <Text style={styles.retryText}>Tap to reload</Text>
              </TouchableOpacity>
            </View>
          ) : predictionList.length === 0 ? (
            <View style={styles.generatingNote}>
              <ActivityIndicator color={Colors.primary} size="small" />
              <Text style={styles.generatingText}>
                Hardev is preparing your timeline...
              </Text>
            </View>
          ) : (
            <>
              {predictionList.slice(0, 5).map((p) => (
                <MilestoneRow key={p.id} prediction={p} />
              ))}
              {predictionList.length > 5 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  accessibilityRole="button"
                  accessibilityLabel="See full timeline"
                >
                  <Text style={styles.seeMoreText}>
                    See full timeline ({predictionList.length} milestones) →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Kundali Chart — SECONDARY, collapsible */}
        {kundali?.chart_json && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setChartVisible(!chartVisible)}
              style={styles.chartToggle}
              accessibilityRole="button"
              accessibilityLabel={chartVisible ? 'Collapse Kundali chart' : 'Show Kundali chart'}
              accessibilityState={{ expanded: chartVisible }}
            >
              <Text style={styles.sectionTitle}>Kundali Chart</Text>
              <Text style={styles.chartToggleIcon}>
                {chartVisible ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {chartVisible && (
              <View style={styles.chartContainer}>
                <SouthIndianChart
                  chartJson={kundali.chart_json as Record<string, unknown>}
                />
                {(kundali.chart_json as Record<string, unknown>).tob_unknown && (
                  <Text style={styles.tobDisclaimer}>
                    * Lagna based on noon chart — birth time unknown
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Pinned chat CTA */}
      <TouchableOpacity
        style={styles.chatCta}
        onPress={() => navigation.navigate('Conversation')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Ask your astrologer Hardev a question"
      >
        <Text style={styles.chatCtaIcon}>💬</Text>
        <Text style={styles.chatCtaText}>Ask your astrologer...</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  identityStrip: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.primary,
  },
  identityText: {
    fontSize: FontSize.sm,
    color: Colors.surface,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Spacing[6],
    paddingHorizontal: Spacing[6],
  },
  section: {
    marginBottom: Spacing[6],
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    ...Shadow.card,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.primary,
    marginBottom: Spacing[4],
  },
  // Milestone timeline
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
    minHeight: 44,
  },
  milestoneYear: {
    width: 80,
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  milestoneBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: Spacing[3],
  },
  milestoneBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  milestoneRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    justifyContent: 'flex-end',
    gap: 4,
  },
  milestoneDomain: {
    fontSize: FontSize.md,
  },
  milestoneDomainText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    maxWidth: 44,
  },
  // Skeleton
  skeleton: {
    opacity: 0.5,
  },
  skeletonBlock: {
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  skeletonBar: {
    backgroundColor: Colors.border,
  },
  errorRow: {
    padding: Spacing[4],
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing[2],
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  generatingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[4],
  },
  generatingText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  seeMoreButton: {
    paddingTop: Spacing[3],
    minHeight: 44,
    justifyContent: 'center',
  },
  seeMoreText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  // Chart
  chartToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  chartToggleIcon: {
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  chartContainer: {
    alignItems: 'center',
    paddingTop: Spacing[3],
  },
  chartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chartCell: {
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  chartCellEmpty: {
    backgroundColor: Colors.primary + '0A',
  },
  chartHouseNum: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginBottom: 2,
  },
  chartPlanets: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 16,
  },
  tobDisclaimer: {
    marginTop: Spacing[2],
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontStyle: 'italic',
  },
  // Pinned CTA
  chatCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
    minHeight: 64,
  },
  chatCtaIcon: {
    fontSize: FontSize.lg,
  },
  chatCtaText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.surface,
    fontWeight: '500',
  },
});
