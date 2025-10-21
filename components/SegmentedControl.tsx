import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export interface SegmentItem {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
}

interface SegmentedControlProps {
  items: SegmentItem[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  width?: number;
  height?: number;
}

export const SegmentedControl = React.memo<SegmentedControlProps>(({
  items,
  selectedIndex,
  onIndexChange,
  width = 200,
  height = 36,
}) => {
  return (
    <View style={[styles.container, { height, width }]}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <View style={styles.separator} />}
          <TouchableOpacity
            onPress={() => onIndexChange(index)}
            style={[
              styles.button,
              selectedIndex === index && styles.buttonActive,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={selectedIndex === index ? Colors.background : Colors.text}
            />
            {item.label && (
              <Text
                style={[
                  styles.label,
                  { color: selectedIndex === index ? Colors.background : Colors.text },
                ]}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
});

SegmentedControl.displayName = 'SegmentedControl';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  button: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1000,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    gap: 6,
  },
  buttonActive: {
    backgroundColor: Colors.primary,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#8E8E93',
    opacity: 0.3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
