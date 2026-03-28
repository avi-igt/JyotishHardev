import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, TiroDevanagariHindi_400Regular as TiroDevanagari_400Regular } from '@expo-google-fonts/tiro-devanagari-hindi';
import { View, ActivityIndicator } from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    TiroDevanagari_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
