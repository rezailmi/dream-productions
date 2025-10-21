import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SleepSession, Dream, WhoopSleepRecord } from '../constants/Types';
import { SleepDataCard } from './SleepDataCard';
import { DreamVideoView } from './DreamVideoView';
import { DreamInsightsView } from './DreamInsightsView';
import { EmptyState } from './EmptyState';
import { SegmentedControl, SegmentItem } from './SegmentedControl';
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
  isVisible?: boolean;
}

// Segmented control items (memoized outside component to prevent recreation)
const SEGMENT_ITEMS: SegmentItem[] = [
  { icon: 'videocam' },
  { icon: 'bulb' },
  { icon: 'stats-chart' },
];

export const DayCard = React.memo<DayCardProps>(({
  date,
  dateLabel,
  sleepSession,
  dream,
  onGenerate,
  onDeleteDream,
  isWhoopConnected,
  isGenerating = false,
  isVisible = false,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  }, []);

  const scrollToPage = useCallback((page: number) => {
    carouselRef.current?.scrollTo({
      x: page * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  const getEmptyVideoMessage = useCallback(() => {
    if (dream?.status === 'generating') return 'Your dream is being generated...';
    if (dream?.status === 'failed') return 'Dream generation failed';
    return 'Generate a dream to see your video';
  }, [dream?.status]);

  const getEmptyInsightsMessage = useCallback(() => {
    if (dream?.status === 'generating') return 'Insights will appear after generation';
    if (dream?.status === 'failed') return 'Unable to generate insights';
    return 'Generate a dream to see insights';
  }, [dream?.status]);

  const renderDreamVideoPage = useCallback(() => {
    if (!dream || dream.status !== 'complete') {
      return (
        <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
          <EmptyState
            icon="videocam-outline"
            title="No Dream Video"
            subtitle={getEmptyVideoMessage()}
          />
        </View>
      );
    }

    return (
      <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
        <DreamVideoView dream={dream} autoPlay={isVisible && currentPage === 0} />
      </View>
    );
  }, [dream, isVisible, currentPage, getEmptyVideoMessage]);

  const renderDreamInsightsPage = useCallback(() => {
    if (!dream || dream.status !== 'complete') {
      return (
        <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
          <EmptyState
            icon="bulb-outline"
            title="No Dream Insights"
            subtitle={getEmptyInsightsMessage()}
          />
        </View>
      );
    }

    return (
      <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
        <DreamInsightsView dream={dream} onDelete={onDeleteDream} />
      </View>
    );
  }, [dream, onDeleteDream, getEmptyInsightsMessage]);

  const renderSleepDataPage = useCallback(() => (
    <View style={[styles.contentPage, { width: SCREEN_WIDTH }]}>
      <SleepDataCard
        sleepSession={sleepSession!}
        isWhoopData={isWhoopConnected}
        showGenerateButton={!dream || dream?.status === 'generating' || dream?.status === 'failed'}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />
    </View>
  ), [sleepSession, isWhoopConnected, dream, onGenerate, isGenerating]);

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
        <EmptyState
          icon="moon-outline"
          title="No Sleep Data"
          subtitle={`No WHOOP sleep data recorded for ${dateLabel.toLowerCase()}`}
        />
      );
    }

    // State 3: Not connected - prompt to connect or use demo
    return (
      <EmptyState
        icon="body-outline"
        title="Connect WHOOP"
        subtitle="Connect your WHOOP account to see real sleep data and generate dreams"
        actionLabel="Go to Profile"
        onAction={() => {
          router.push('/(tabs)/profile');
        }}
      />
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
          <SegmentedControl
            items={SEGMENT_ITEMS}
            selectedIndex={currentPage}
            onIndexChange={scrollToPage}
            width={200}
            height={36}
          />
        )}
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
});

DayCard.displayName = 'DayCard';

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
});
