import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SleepSession, Dream, WhoopSleepRecord } from '../constants/Types';
import { SleepDataCard } from './SleepDataCard';
import { DreamVideoView } from './DreamVideoView';
import { DreamInsightsView } from './DreamInsightsView';
import { GeneratingDreamView } from './GeneratingDreamView';
import { FailedDreamView } from './FailedDreamView';
import Colors from '../constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface DayCardProps {
  date: string;
  dateLabel: string;
  sleepSession: SleepSession | WhoopSleepRecord | null;
  dream: Dream | null;
  onGenerate: () => void;
  onDeleteDream?: (dreamId: string) => void;
  isWhoopConnected: boolean;
  isGenerating?: boolean;
}

export function DayCard({
  date,
  dateLabel,
  sleepSession,
  dream,
  onGenerate,
  onDeleteDream,
  isWhoopConnected,
  isGenerating = false,
}: DayCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const scrollToPage = (page: number) => {
    carouselRef.current?.scrollTo({
      x: page * SCREEN_WIDTH,
      animated: true,
    });
  };

  const renderDreamVideoPage = () => {
    if (!dream || dream.status !== 'complete') {
      // Empty state for video page
      return (
        <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
          <View style={styles.pageEmptyState}>
            <Ionicons name="videocam-outline" size={80} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Dream Video</Text>
            <Text style={styles.emptySubtext}>
              {dream?.status === 'generating' 
                ? 'Your dream is being generated...'
                : dream?.status === 'failed'
                ? 'Dream generation failed'
                : 'Generate a dream to see your video'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
        <DreamVideoView dream={dream} />
      </View>
    );
  };

  const renderDreamInsightsPage = () => {
    if (!dream || dream.status !== 'complete') {
      // Empty state for insights page
      return (
        <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
          <View style={styles.pageEmptyState}>
            <Ionicons name="bulb-outline" size={80} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Dream Insights</Text>
            <Text style={styles.emptySubtext}>
              {dream?.status === 'generating' 
                ? 'Insights will appear after generation'
                : dream?.status === 'failed'
                ? 'Unable to generate insights'
                : 'Generate a dream to see insights'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
        <DreamInsightsView dream={dream} onDelete={onDeleteDream} />
      </View>
    );
  };

  const renderSleepDataPage = () => (
    <View style={[styles.contentPage, { width: SCREEN_WIDTH }]}>
      <SleepDataCard
        sleepSession={sleepSession!}
        isWhoopData={isWhoopConnected}
        showGenerateButton={!dream || dream?.status === 'generating'}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />
    </View>
  );

  const renderContent = () => {
    // State 1: Has sleep data - always show carousel with 3 pages
    if (sleepSession) {
      return (
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.carousel}
          >
            {renderDreamVideoPage()}
            {renderDreamInsightsPage()}
            {renderSleepDataPage()}
          </ScrollView>
        </View>
      );
    }

    // State 2: WHOOP connected but no data for this date
    if (isWhoopConnected) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="moon-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Sleep Data</Text>
          <Text style={styles.emptySubtext}>
            No WHOOP sleep data recorded for {dateLabel.toLowerCase()}
          </Text>
        </View>
      );
    }

    // State 3: Not connected - prompt to connect or use demo
    return (
      <View style={styles.emptyState}>
        <Ionicons name="body-outline" size={80} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Connect WHOOP</Text>
        <Text style={styles.emptySubtext}>Connect your WHOOP account to see real sleep data and generate dreams</Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Date Header */}
      <View style={styles.header}>
        {/* Left: Date label */}
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        {/* Right: Segmented control (show when sleep data exists) */}
        {sleepSession && (
          <View style={styles.segmentedControl}>
            {/* Button 1: Video */}
            <TouchableOpacity
              onPress={() => scrollToPage(0)}
              style={[
                styles.segmentButton,
                currentPage === 0 && styles.segmentButtonActive,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="videocam"
                size={20}
                color={currentPage === 0 ? Colors.background : Colors.text}
              />
            </TouchableOpacity>

            {/* Separator 1 */}
            <View style={styles.separator} />

            {/* Button 2: Insights */}
            <TouchableOpacity
              onPress={() => scrollToPage(1)}
              style={[
                styles.segmentButton,
                currentPage === 1 && styles.segmentButtonActive,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="bulb"
                size={20}
                color={currentPage === 1 ? Colors.background : Colors.text}
              />
            </TouchableOpacity>

            {/* Separator 2 */}
            <View style={styles.separator} />

            {/* Button 3: Stats */}
            <TouchableOpacity
              onPress={() => scrollToPage(2)}
              style={[
                styles.segmentButton,
                currentPage === 2 && styles.segmentButtonActive,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="stats-chart"
                size={20}
                color={currentPage === 2 ? Colors.background : Colors.text}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.background,
  },
  safeAreaHeader: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 100,
    height: 36,
    width: 200,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  segmentButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1000,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#8E8E93',
    opacity: 0.3,
  },
  carouselContainer: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  contentPage: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.background,
  },
  dreamPage: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 24,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
});
