import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FlatList, Dimensions, StyleSheet, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHealthData } from '../../contexts/HealthDataContext';
import { DayCard } from '../../components/DayCard';
import { DreamReadySheet } from '../../components/DreamReadySheet';
import { generateDateArray, formatDateLabel, getToday } from '../../utils/dateHelpers';
import { Dream } from '../../constants/Types';
import Colors from '../../constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Configure screen options for Expo Router
export const unstable_settings = {
  headerShown: false,
};

export default function HomeScreen() {
  const {
    whoopAccessToken,
    dataSource,
    getSleepSessionByDate,
    getDreamByDate,
    generateDream,
    deleteDream,
    isGeneratingDream,
    dreams,
  } = useHealthData();

  const [showDreamReadySheet, setShowDreamReadySheet] = useState(false);
  const [readyDream, setReadyDream] = useState<Dream | null>(null);
  const [today, setToday] = useState(getToday());
  const [visibleDateIndex, setVisibleDateIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const previousDreamsRef = useRef<Dream[]>([]);

  // Check for date changes when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const newToday = getToday();
        if (newToday !== today) {
          setToday(newToday);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [today]);

  // Generate array of dates (today going backwards 30 days)
  // Recalculates when 'today' changes (i.e., when the day changes)
  const dateArray = useMemo(() => generateDateArray(30), [today]);

  // Watch for newly completed dreams
  useEffect(() => {
    const newlyCompletedDream = dreams.find((dream) => {
      const wasGenerating = previousDreamsRef.current.find(
        (d) => d.id === dream.id && d.status === 'generating'
      );
      return wasGenerating && dream.status === 'complete';
    });

    if (newlyCompletedDream) {
      setReadyDream(newlyCompletedDream);
      setShowDreamReadySheet(true);
    }

    previousDreamsRef.current = dreams;
  }, [dreams]);

  const handleGenerate = async (date: string) => {
    const sleepSession = getSleepSessionByDate(date);
    if (sleepSession) {
      await generateDream(sleepSession.id);
    }
  };

  const handlePlayDream = () => {
    setShowDreamReadySheet(false);
    if (readyDream) {
      // Find the index of the date for this dream
      const dreamIndex = dateArray.findIndex((date) => {
        const dream = getDreamByDate(date);
        return dream?.id === readyDream.id;
      });

      if (dreamIndex !== -1) {
        flatListRef.current?.scrollToIndex({
          index: dreamIndex,
          animated: true,
        });
      }
    }
  };

  const handleCloseDreamSheet = () => {
    setShowDreamReadySheet(false);
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setVisibleDateIndex(visibleItem.index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderDay = ({ item: date, index }: { item: string; index: number }) => {
    const sleepSession = getSleepSessionByDate(date);
    const dream = getDreamByDate(date);
    const dateLabel = formatDateLabel(date, index);
    const isVisible = index === visibleDateIndex;

    return (
      <DayCard
        date={date}
        dateLabel={dateLabel}
        sleepSession={sleepSession}
        dream={dream}
        onGenerate={() => handleGenerate(date)}
        onDeleteDream={deleteDream}
        isWhoopConnected={dataSource === 'whoop'}
        isGenerating={isGeneratingDream || dream?.status === 'generating'}
        isVisible={isVisible}
      />
    );
  };

  return (
    <>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={dateArray}
        renderItem={renderDay}
        keyExtractor={(item) => item}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialScrollIndex={0}
        contentContainerStyle={{ paddingTop: 0 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.container}
      />

      <DreamReadySheet
        visible={showDreamReadySheet}
        dream={readyDream}
        onClose={handleCloseDreamSheet}
        onPlayDream={handlePlayDream}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
