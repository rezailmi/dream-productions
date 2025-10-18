import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SleepSession, Dream } from '../constants/Types';
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
  sleepSession: SleepSession | null;
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

  const renderDreamVideoPage = () => {
    if (!dream) return null;

    return (
      <View style={[styles.dreamPage, { width: SCREEN_WIDTH }]}>
        <DreamVideoView dream={dream} />
      </View>
    );
  };

  const renderDreamInsightsPage = () => {
    if (!dream) return null;

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
        showGenerateButton={!dream}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />
    </View>
  );

  const renderContent = () => {
    // State 1: Has sleep data
    if (sleepSession) {
      // If dream exists and is complete, show 3-page carousel
      if (dream && dream.status === 'complete') {
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

      // Dream is generating - show generating state
      if (dream && dream.status === 'generating') {
        return <GeneratingDreamView />;
      }

      // Dream failed - show failed state with retry
      if (dream && dream.status === 'failed') {
        return <FailedDreamView error={dream.error} onRetry={onGenerate} />;
      }

      // No dream yet - just show sleep data with generate button
      return renderSleepDataPage();
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
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>

        {/* Center: Action icons (only show when dream is complete) */}
        {dream && dream.status === 'complete' && (
          <View style={styles.headerCenter}>
            <TouchableOpacity
              onPress={() => scrollToPage(0)}
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
              onPress={() => scrollToPage(1)}
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
              onPress={() => scrollToPage(2)}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  dateSubtext: {
    fontSize: 12,
    color: Colors.textSubtle,
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
