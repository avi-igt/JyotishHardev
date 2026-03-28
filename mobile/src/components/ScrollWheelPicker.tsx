/**
 * Scroll-wheel picker component.
 * Wraps the native scroll to simulate the drum-roll picker.
 * Each item is 44px tall (touch target minimum).
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface PickerItem {
  label: string;
  value: number | string;
}

interface Props {
  items: PickerItem[];
  selectedValue: number | string;
  onValueChange: (value: number | string) => void;
  accessibilityLabel?: string;
}

export default function ScrollWheelPicker({
  items,
  selectedValue,
  onValueChange,
  accessibilityLabel,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const selectedIndex = items.findIndex((item) => item.value === selectedValue);

  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    if (items[clampedIndex]) {
      onValueChange(items[clampedIndex].value);
    }
  };

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        text: items[selectedIndex]?.label,
      }}
    >
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top padding — center the first item */}
        <View style={{ height: ITEM_HEIGHT }} />

        {items.map((item, index) => {
          const isSelected = item.value === selectedValue;
          return (
            <View key={String(item.value)} style={styles.item}>
              <Text
                style={[styles.itemText, isSelected && styles.itemTextSelected]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}

        {/* Bottom padding */}
        <View style={{ height: ITEM_HEIGHT }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gold,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scroll: {
    height: PICKER_HEIGHT,
  },
  scrollContent: {
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
  },
  itemText: {
    fontSize: FontSize.md,
    color: Colors.muted,
    textAlign: 'center',
  },
  itemTextSelected: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
});
