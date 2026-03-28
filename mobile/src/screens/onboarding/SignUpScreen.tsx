/**
 * Sign up with email + password (last onboarding step).
 * Creates Supabase account, then immediately creates the profile
 * before auth state change fires — so the chart is ready when MainTabs loads.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius } from '../../theme';
import { supabase, onboarding } from '../../services/api';

type Props = StackScreenProps<OnboardingStackParams, 'SignUp'>;

export default function SignUpScreen({ route }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter your email and a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    // Step 1: Sign up (or sign in if already exists)
    setStatus('Creating account...');
    let token: string | null = null;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          setStatus('');
          return;
        }
        token = signInData.session?.access_token ?? null;
      } else {
        setError(signUpError.message);
        setLoading(false);
        setStatus('');
        return;
      }
    } else {
      token = signUpData.session?.access_token ?? null;
    }

    if (!token) {
      setError('Could not get session token — please try again.');
      setLoading(false);
      setStatus('');
      return;
    }

    // Step 2: Create profile + chart using the token directly (session may not be persisted yet)
    setStatus('Computing your Kundali...');
    try {
      const payload = route.params.profilePayload as Parameters<typeof onboarding.createProfile>[0];
      await onboarding.createProfile(payload, token);
    } catch (err: unknown) {
      console.error('Profile creation failed:', err);
    }

    // Step 3: Auth state change in AppNavigator will now switch to MainTabs
    setStatus('');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.microcopy}>
            Your chart and memories are saved to your account
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={Colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!loading}
          />

          <TextInput
            style={[styles.input, { marginTop: Spacing[3] }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={Colors.muted}
            secureTextEntry
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.surface} style={{ marginRight: Spacing[2] }} />
                <Text style={styles.buttonText}>{status}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Create account →</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[16],
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
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 52,
  },
  error: {
    marginTop: Spacing[3],
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  button: {
    marginTop: Spacing[8],
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
