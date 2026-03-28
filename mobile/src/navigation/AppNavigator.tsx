/**
 * Root navigator for JyotishHardev.
 *
 * Unauthenticated: OnboardingStack (5 screens + generation loading)
 * Authenticated:   MainTabs (Dashboard | Conversation | Events | Account)
 */
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { auth } from '../services/api';
import { Colors, FontSize, Spacing } from '../theme';

// ─── Onboarding screens ─────────────────────────────────────────────────────────
import POBScreen from '../screens/onboarding/POBScreen';
import DOBScreen from '../screens/onboarding/DOBScreen';
import TOBScreen from '../screens/onboarding/TOBScreen';
import TraditionScreen from '../screens/onboarding/TraditionScreen';
import DPDPAScreen from '../screens/onboarding/DPDPAScreen';
import KundaliGeneratingScreen from '../screens/onboarding/KundaliGeneratingScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';

// ─── Main app screens ────────────────────────────────────────────────────────────
import DashboardScreen from '../screens/DashboardScreen';
import ConversationScreen from '../screens/ConversationScreen';
import EventsScreen from '../screens/EventsScreen';
import AccountScreen from '../screens/AccountScreen';

// ─── Stack + Tab types ──────────────────────────────────────────────────────────

export type OnboardingStackParams = {
  POB: undefined;
  DOB: { pob: string; pob_lat: number; pob_lon: number; pob_timezone: string; pob_timezone_offset: number };
  TOB: { pob: string; pob_lat: number; pob_lon: number; pob_timezone: string; pob_timezone_offset: number; dob: string };
  Tradition: { pob: string; pob_lat: number; pob_lon: number; pob_timezone: string; pob_timezone_offset: number; dob: string; tob?: string; tob_unknown: boolean };
  DPDPA: OnboardingStackParams['Tradition'] & { tradition: 'parashara' | 'jaimini' };
  SignUp: { profilePayload: Record<string, unknown> };
  KundaliGenerating: { profilePayload: Record<string, unknown> };
};

export type MainTabParams = {
  Dashboard: undefined;
  Conversation: undefined;
  Events: undefined;
  Account: undefined;
};

const OnboardingStack = createStackNavigator<OnboardingStackParams>();
const MainTab = createBottomTabNavigator<MainTabParams>();

// ─── Onboarding navigator ───────────────────────────────────────────────────────

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
        gestureEnabled: true,
      }}
    >
      <OnboardingStack.Screen name="POB" component={POBScreen} />
      <OnboardingStack.Screen name="DOB" component={DOBScreen} />
      <OnboardingStack.Screen name="TOB" component={TOBScreen} />
      <OnboardingStack.Screen name="Tradition" component={TraditionScreen} />
      <OnboardingStack.Screen name="DPDPA" component={DPDPAScreen} />
      <OnboardingStack.Screen name="SignUp" component={SignUpScreen} />
      <OnboardingStack.Screen
        name="KundaliGenerating"
        component={KundaliGeneratingScreen}
        options={{ gestureEnabled: false }}
      />
    </OnboardingStack.Navigator>
  );
}

// ─── Main tab navigator ─────────────────────────────────────────────────────────

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '◎',
    Conversation: '✉',
    Events: '◈',
    Account: '○',
  };
  return (
    <Text style={{ fontSize: 20, color: focused ? Colors.primary : Colors.muted }}>
      {icons[label] ?? '○'}
    </Text>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ tabBarLabel: 'Hardev' }}
      />
      <MainTab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <MainTab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: 'Account' }}
      />
    </MainTab.Navigator>
  );
}

// ─── Root navigator ─────────────────────────────────────────────────────────────

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });

    // Listen for auth changes
    const { data: listener } = auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    // Loading state — show cream background with indigo spinner
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}
