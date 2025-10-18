import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Dream } from '../constants/Types';
import Colors from '../constants/Colors';

interface DateHeaderProps {
  dateLabel: string;
  dream: Dream | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function DateHeader({ dateLabel, dream, currentPage, onPageChange }: DateHeaderProps) {
  const handleShare = async () => {
    if (!dream || dream.status !== 'complete') return;

    try {
      const shareContent = {
        title: dream.title || 'My Dream',
        message: `Check out my dream: "${dream.title}"\n\n${dream.narrative.substring(0, 200)}...`,
        url: dream.videoUrl,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {/* Left: Date label */}
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>

        {/* Center: Action icons (only show when dream is complete) */}
        {dream && dream.status === 'complete' && (
          <View style={styles.headerCenter}>
            <TouchableOpacity
              onPress={() => onPageChange(0)}
              style={styles.actionIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="videocam"
                size={20}
                color={currentPage === 0 ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPageChange(1)}
              style={styles.actionIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="bulb"
                size={20}
                color={currentPage === 1 ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPageChange(2)}
              style={styles.actionIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="stats-chart"
                size={20}
                color={currentPage === 2 ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Right: Share button (only when dream is complete) */}
        {dream && dream.status === 'complete' && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
  },
  actionIcon: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  dateLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
});
