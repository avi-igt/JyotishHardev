/**
 * Account screen — profile info, subscription, data deletion.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, onboarding, type Profile } from '../services/api';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../theme';

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    onboarding.getMe().then((me) => setProfile(me.profile)).catch(() => {});
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => auth.signOut() },
    ]);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete my data',
      'This permanently deletes your Kundali, chat history, and all personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            // TODO: call DELETE /api/v1/account endpoint (Phase 1 DPDPA requirement)
            auth.signOut();
          },
        },
      ],
    );
  };

  const trialExpiresDate = profile
    ? new Date(profile.trial_expires_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isTrialActive = profile
    ? new Date() < new Date(profile.trial_expires_at)
    : false;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Account</Text>

        {profile && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Name</Text>
            <Text style={styles.cardValue}>{profile.name}</Text>

            <View style={styles.divider} />

            <Text style={styles.cardLabel}>Tradition</Text>
            <Text style={styles.cardValue}>
              {profile.tradition.charAt(0).toUpperCase() + profile.tradition.slice(1)}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.cardLabel}>Rising sign (Lagna)</Text>
            <Text style={styles.cardValue}>{profile.lagna ?? 'Unknown'}</Text>

            <View style={styles.divider} />

            <Text style={styles.cardLabel}>Moon sign</Text>
            <Text style={styles.cardValue}>{profile.moon_sign ?? 'Unknown'}</Text>
          </View>
        )}

        {/* Subscription */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {profile?.subscription_active ? (
            <View style={styles.activeRow}>
              <Text style={styles.activeText}>✓ Active — unlimited messages</Text>
              <Text style={styles.providerText}>
                via {profile.subscription_provider ?? 'payment provider'}
              </Text>
            </View>
          ) : isTrialActive ? (
            <>
              <Text style={styles.trialText}>
                Free trial · expires {trialExpiresDate}
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to continue with Hardev"
              >
                <Text style={styles.upgradeButtonText}>Continue with Hardev →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.expiredText}>Trial expired</Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to continue with Hardev"
              >
                <Text style={styles.upgradeButtonText}>Continue with Hardev →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Share */}
        {profile?.share_token && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Share your timeline</Text>
            <Text style={styles.shareUrl}>
              jyotishhardev.com/share/{profile.share_token}
            </Text>
            <Text style={styles.shareNote}>
              Only your first name and milestone timeline are visible. No birth details.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.actionText}>Sign out</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteData}
            accessibilityRole="button"
            accessibilityLabel="Delete my data — DPDPA right to erasure"
          >
            <Text style={[styles.actionText, styles.destructiveText]}>
              Delete my data
            </Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          JyotishHardev v1.0 · DPDPA 2023 compliant · Your data is never sold
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing[6] },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    marginBottom: Spacing[6],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    ...Shadow.card,
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    marginBottom: Spacing[4],
    ...Shadow.card,
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[3],
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  activeRow: {},
  activeText: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  trialText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing[3],
  },
  expiredText: {
    fontSize: FontSize.md,
    color: Colors.error,
    marginBottom: Spacing[3],
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  shareUrl: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontFamily: 'monospace' as unknown as string,
    marginBottom: Spacing[2],
  },
  shareNote: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    minHeight: 52,
  },
  actionText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  destructiveText: {
    color: Colors.error,
  },
  actionArrow: {
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  footer: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing[4],
  },
});
