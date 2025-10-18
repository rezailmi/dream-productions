import React, { useMemo } from 'react';
import { FlatList, Dimensions, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHealthData } from '../../contexts/HealthDataContext';
import { DayCard } from '../../components/DayCard';
import { generateDateArray, formatDateLabel } from '../../utils/dateHelpers';
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
  } = useHealthData();

  // Generate array of dates (today going backwards 30 days)
  const dateArray = useMemo(() => generateDateArray(30), []);

  const handleGenerate = async (date: string) => {
    const sleepSession = getSleepSessionByDate(date);
    if (sleepSession) {
      await generateDream(sleepSession.id);
    }
  };

  const renderDay = ({ item: date, index }: { item: string; index: number }) => {
    const sleepSession = getSleepSessionByDate(date);
    const dream = getDreamByDate(date);
    const dateLabel = formatDateLabel(date, index);

    return (
      <DayCard
        date={date}
        dateLabel={dateLabel}
        sleepSession={sleepSession}
        dream={dream}
        onGenerate={() => handleGenerate(date)}
        onDeleteDream={deleteDream}
        isWhoopConnected={dataSource === 'whoop'}
        isGenerating={dream?.status === 'generating'}
      />
    );
  };

  return (
    <>
      <StatusBar style="light" />
      <FlatList
        data={dateArray}
        renderItem={renderDay}
        keyExtractor={(item) => item}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        style={styles.container}
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
