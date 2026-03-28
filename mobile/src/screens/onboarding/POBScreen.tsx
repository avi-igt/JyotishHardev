/**
 * Step 1 — Place of Birth
 * City search input (Google Places autocomplete style), progress 1/5.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import Constants from 'expo-constants';
import type { OnboardingStackParams } from '../../navigation/AppNavigator';
import { Colors, Fonts, FontSize, Spacing, Radius, Shadow } from '../../theme';
import ProgressBar from '../../components/ProgressBar';

const PLACES_KEY: string =
  (Constants.expoConfig?.extra?.googlePlacesApiKey as string) || '';

type Props = StackScreenProps<OnboardingStackParams, 'POB'>;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  lat: number;
  lng: number;
  timezone: string;
  timezone_offset: number;
  formatted_address: string;
}

// Fetch place suggestions from Google Places API (via backend proxy or direct)
async function fetchSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    // In production: proxy through backend to protect the API key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${PLACES_KEY}`,
    );
    const data = await response.json();
    return data.predictions ?? [];
  } catch {
    return [];
  }
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${PLACES_KEY}`,
    );
    const data = await response.json();
    const location = data.result?.geometry?.location;
    if (!location) return null;

    // Fetch timezone
    const ts = Math.floor(Date.now() / 1000);
    const tzResponse = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${ts}&key=${PLACES_KEY}`,
    );
    const tzData = await tzResponse.json();

    return {
      lat: location.lat,
      lng: location.lng,
      timezone: tzData.timeZoneId ?? 'UTC',
      timezone_offset: ((tzData.rawOffset ?? 0) + (tzData.dstOffset ?? 0)) / 3600,
      formatted_address: data.result?.formatted_address ?? '',
    };
  } catch {
    return null;
  }
}

export default function POBScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    setError('');

    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(async () => {
      setLoading(true);
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setLoading(false);
    }, 350);
    setSearchTimeout(timeout);
  };

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setQuery(suggestion.description);
    setSuggestions([]);
    setLoading(true);

    const details = await fetchPlaceDetails(suggestion.place_id);
    setLoading(false);

    if (!details) {
      setError('Location not found — try a nearby city');
      return;
    }

    navigation.navigate('DOB', {
      pob: suggestion.structured_formatting.main_text,
      pob_lat: details.lat,
      pob_lon: details.lng,
      pob_timezone: details.timezone,
      pob_timezone_offset: details.timezone_offset,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ProgressBar step={1} total={5} />

        <View style={styles.content}>
          <Text style={styles.heading}>Where were you born?</Text>
          <Text style={styles.microcopy}>
            Where you were born determines your rising sign
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={handleChange}
              placeholder="Search city..."
              placeholderTextColor={Colors.muted}
              autoFocus
              autoCorrect={false}
              accessibilityLabel="City of birth search"
              returnKeyType="search"
            />
            {loading && (
              <ActivityIndicator
                style={styles.inputSpinner}
                color={Colors.primary}
                size="small"
              />
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {suggestions.length > 0 && (
            <View style={styles.suggestionList}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.description}
                  >
                    <Text style={styles.suggestionMain}>
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.suggestionSub}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
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
    marginBottom: Spacing[6],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing[4],
    minHeight: 52,
    ...Shadow.card,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing[3],
  },
  inputSpinner: {
    marginLeft: Spacing[2],
  },
  errorText: {
    marginTop: Spacing[2],
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  suggestionList: {
    marginTop: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 280,
    ...Shadow.card,
  },
  suggestionItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  suggestionMain: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  suggestionSub: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginTop: 2,
  },
});
