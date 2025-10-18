import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';

interface DayPageIndicatorProps {
  currentPage: number;
  totalPages: number;
  labels?: string[];
}

export function DayPageIndicator({ currentPage, totalPages, labels }: DayPageIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View key={index} style={styles.dotContainer}>
          <View
            style={[
              styles.dot,
              index === currentPage && styles.activeDot,
            ]}
          />
          {labels && labels[index] && (
            <Text style={[styles.label, index === currentPage && styles.activeLabel]}>
              {labels[index]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  dotContainer: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    opacity: 0.4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    opacity: 1,
    width: 24,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    opacity: 0.6,
  },
  activeLabel: {
    color: Colors.primary,
    opacity: 1,
  },
});
