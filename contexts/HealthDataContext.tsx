import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { DataSource, SleepSession, Dream, HealthDataContextType, WhoopSleepRecord } from '../constants/Types';
import { DEMO_SLEEP_DATA, DEMO_WHOOP_RECORDS } from '../services/demoData';
import { mapWhoopRecordToSleepSession } from '../utils/whoopSleepMapper';
import { extractDateFromTimestamp, getDateRange } from '../utils/dateUtils';
import { ErrorHandler } from '../utils/errorHandler';
import apiClient from '../services/apiClient';
import dreamStorage from '../services/dreamStorage';

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

const isSleepSessionRecord = (
  session: SleepSession | WhoopSleepRecord | null | undefined,
): session is SleepSession => {
  return !!session && 'remCycles' in session;
};

export const HealthDataProvider = ({ children }: { children: ReactNode }) => {
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [sleepSessions, setSleepSessions] = useState<(SleepSession | WhoopSleepRecord)[]>([
    ...DEMO_SLEEP_DATA,
    ...DEMO_WHOOP_RECORDS,
  ]);
  const [demoWhoopSessions, setDemoWhoopSessions] = useState<SleepSession[]>(DEMO_SLEEP_DATA);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [whoopAccessToken, setWhoopAccessToken] = useState<string | null>(null);
  const [isGeneratingDream, setIsGeneratingDream] = useState(false);

  // Load dreams and WHOOP token from storage on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = useCallback(async () => {
    try {
      const [storedDreams, storedToken] = await Promise.all([
        dreamStorage.getDreams(),
        dreamStorage.getWhoopToken(),
      ]);

      // Clean up any stuck "generating" dreams from previous sessions
      const cleanedDreams = storedDreams.map((dream) => {
        if (dream.status === 'generating') {
          console.log(`Cleaning up stuck dream: ${dream.id}`);
          return {
            ...dream,
            status: 'failed' as const,
            title: 'Dream Generation Interrupted',
            error: 'Generation was interrupted. Please try again.',
          };
        }
        return dream;
      });

      // Save cleaned dreams back to storage
      if (cleanedDreams.some((d, i) => d.status !== storedDreams[i].status)) {
        await Promise.all(
          cleanedDreams
            .filter((d, i) => d.status !== storedDreams[i].status)
            .map((dream) => dreamStorage.saveDream(dream))
        );
      }

      setDreams(cleanedDreams);
      if (storedToken) {
        setWhoopAccessToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  }, []);

  const handleSetWhoopAccessToken = useCallback(async (token: string | null) => {
    setWhoopAccessToken(token);
    if (token) {
      await dreamStorage.saveWhoopToken(token);
    } else {
      await dreamStorage.clearWhoopToken();
    }
  }, []);

  const fetchSleepData = useCallback(async () => {
    try {
      if (dataSource === 'demo') {
        setSleepSessions([...demoWhoopSessions, ...DEMO_WHOOP_RECORDS]);
      } else if (dataSource === 'apple-health') {
        // TODO: Implement Apple Health integration
        ErrorHandler.showAlert('Coming Soon', 'Apple Health integration will be available in a future update.');
      } else if (dataSource === 'whoop') {
        if (!whoopAccessToken) {
          ErrorHandler.showAlert('Not Connected', 'Please connect your WHOOP account first.');
          return;
        }

        const response = await apiClient.fetchWhoopSleep(whoopAccessToken, { limit: 25 });

        if (response.records && response.records.length > 0) {
          setSleepSessions(response.records as WhoopSleepRecord[]);
        } else {
          setSleepSessions([]);
        }

        ErrorHandler.showAlert('Success', `Fetched ${response.records?.length || 0} WHOOP sleep sessions`);
      }
    } catch (error: any) {
      console.error('Error fetching sleep data:', error);
      await ErrorHandler.handleApiError(error, {
        context: 'fetch',
        onTokenExpired: () => handleSetWhoopAccessToken(null),
      });
    }
  }, [dataSource, whoopAccessToken, demoWhoopSessions, handleSetWhoopAccessToken]);

  const generateDream = useCallback(async (sleepSessionId: string) => {
    // Declare generatingDream outside try block so it's accessible in catch
    let generatingDream: Dream | null = null;

    try {
      setIsGeneratingDream(true);

      // Find the sleep session
      const rawSession = sleepSessions.find((s) => s.id === sleepSessionId);
      if (!rawSession) {
        setIsGeneratingDream(false);
        ErrorHandler.showAlert('Error', 'Sleep session not found');
        return;
      }

      // Map WHOOP record to SleepSession if needed
      let sleepSession: SleepSession;
      if (isSleepSessionRecord(rawSession)) {
        sleepSession = rawSession;
      } else {
        // It's a WHOOP record, map it
        try {
          sleepSession = mapWhoopRecordToSleepSession(rawSession as WhoopSleepRecord);
        } catch (error) {
          setIsGeneratingDream(false);
          ErrorHandler.showAlert('Error', 'Unable to process WHOOP sleep data for dream generation');
          return;
        }
      }

      // Create a generating dream placeholder
      generatingDream = {
        id: `dream_${Date.now()}`,
        sleepSessionId: sleepSession.id,
        title: 'Generating Dream...',
        narrative: '',
        mood: 'mysterious',
        emotionalContext: '',
        scenes: [],
        status: 'generating',
        generatedAt: new Date().toISOString(),
      };

      // Add to dreams list
      setDreams((prev) => [generatingDream!, ...prev]);
      await dreamStorage.saveDream(generatingDream);

      // Generate dream via backend API
      const result = await apiClient.generateDream(sleepSession);

      // Update dream with result
      console.log('📦 Dream generation result received:', {
        id: result.id,
        hasVideo: !!result.videoUrl,
        videoUrl: result.videoUrl,
        hasPrediction: !!result.narrative.oneiromancy,
        status: result.status,
      });

      const completedDream: Dream = {
        id: result.id || generatingDream.id,
        sleepSessionId: sleepSession.id,
        title: result.narrative.title,
        narrative: result.narrative.narrative,
        mood: result.narrative.mood,
        emotionalContext: result.narrative.emotionalContext,
        scenes: result.narrative.scenes,
        videoUrl: result.videoUrl,
        status: result.status,
        generatedAt: result.generatedAt,
        error: result.error,
        prediction: result.narrative.oneiromancy,
      };

      console.log('💾 Completed dream object:', {
        id: completedDream.id,
        title: completedDream.title,
        hasVideo: !!completedDream.videoUrl,
        hasPrediction: !!completedDream.prediction,
        status: completedDream.status,
      });

      setDreams((prev) => prev.map((d) => (d.id === generatingDream!.id ? completedDream : d)));
      await dreamStorage.saveDream(completedDream);

      if (completedDream.status === 'complete') {
        ErrorHandler.showAlert('Dream Generated!', `"${completedDream.title}" is ready to view.`);
      } else {
        ErrorHandler.showAlert('Generation Failed', completedDream.error || 'Failed to generate dream');
      }
    } catch (error: any) {
      console.error('Error generating dream:', error);

      // Only create failed dream if we successfully created a generating dream
      if (generatingDream) {
        const failedDream: Dream = {
          ...generatingDream,
          status: 'failed' as const,
          title: 'Dream Generation Failed',
          error: error.message || 'Failed to generate dream',
        };

        // Update the dream to failed status
        setDreams((prev) => prev.map((d) => (d.id === generatingDream!.id ? failedDream : d)));

        // Save the failed dream
        await dreamStorage.saveDream(failedDream);
      }

      ErrorHandler.showAlert('Error', error.message || 'Failed to generate dream');
    } finally {
      setIsGeneratingDream(false);
    }
  }, [sleepSessions]);

  const handleSetDataSource = useCallback((source: DataSource) => {
    setDataSource(source);
    if (source === 'demo') {
      setSleepSessions(DEMO_SLEEP_DATA);
    }
  }, []);

  const handleDeleteDream = useCallback(async (dreamId: string) => {
    try {
      await dreamStorage.deleteDream(dreamId);
      setDreams((prev) => prev.filter((d) => d.id !== dreamId));
    } catch (error: any) {
      console.error('Error deleting dream:', error);
      ErrorHandler.showAlert('Error', 'Failed to delete dream. Please try again.');
    }
  }, []);

  const handleClearAllData = useCallback(async () => {
    try {
      await dreamStorage.clearAllData();
      setDreams([]);
      setWhoopAccessToken(null);
      setDataSource('demo');
      setSleepSessions([...DEMO_SLEEP_DATA, ...DEMO_WHOOP_RECORDS]);
    } catch (error: any) {
      console.error('Error clearing all data:', error);
      ErrorHandler.showAlert('Error', 'Failed to clear data. Please try again.');
    }
  }, []);

  const getSleepSessionByDate = useCallback((date: string): (SleepSession | WhoopSleepRecord) | null => {
    const session = sleepSessions.find((candidate) => {
      if (isSleepSessionRecord(candidate)) {
        return candidate.date === date;
      }

      const candidateDate = extractDateFromTimestamp(candidate.start);
      return candidateDate === date;
    });

    if (!session) {
      return null;
    }

    if (isSleepSessionRecord(session)) {
      return session;
    }

    try {
      return mapWhoopRecordToSleepSession(session as WhoopSleepRecord);
    } catch (error) {
      console.warn('Unable to map WHOOP record to SleepSession', error);
      return session;
    }
  }, [sleepSessions]);

  const getDreamByDate = useCallback((date: string): Dream | null => {
    const dreamForDate = dreams.find((dream) => {
      const session = sleepSessions.find((s) => s.id === dream.sleepSessionId);
      if (!session) {
        return false;
      }

      // Handle SleepSession (demo data)
      if (isSleepSessionRecord(session)) {
        return session.date === date;
      }

      // Handle WhoopSleepRecord (extract date from start timestamp)
      const sessionDate = extractDateFromTimestamp(session.start);
      return sessionDate === date;
    });
    return dreamForDate || null;
  }, [dreams, sleepSessions]);

  const fetchWhoopSleepData = useCallback(async (startDate: string, endDate: string) => {
    if (!whoopAccessToken) {
      console.log('No WHOOP access token available');
      return;
    }

    try {
      console.log(`Fetching WHOOP sleep data from ${startDate} to ${endDate}`);
      const response = await apiClient.fetchWhoopSleep(whoopAccessToken, {
        start: startDate,
        end: endDate,
        limit: 25,
      });

      console.log(`Successfully fetched ${response.records?.length || 0} WHOOP sleep sessions`);

      if (response.records && response.records.length > 0) {
        setSleepSessions(response.records as WhoopSleepRecord[]);
        console.log('Sleep sessions updated with WHOOP data');
      } else {
        console.log('No WHOOP sleep data available for date range');
        setSleepSessions([]);
      }
    } catch (error: any) {
      console.error('Error fetching WHOOP sleep data:', error);
      await ErrorHandler.handleApiError(error, {
        context: 'fetch',
        onTokenExpired: () => handleSetWhoopAccessToken(null),
      });

      // Clear sessions on 404
      if (error.response?.status === 404) {
        setSleepSessions([]);
      }
    }
  }, [whoopAccessToken, handleSetWhoopAccessToken]);

  // Fetch WHOOP data when token becomes available
  useEffect(() => {
    if (whoopAccessToken) {
      setDataSource('whoop');
      const { startISO, endISO } = getDateRange(30);
      fetchWhoopSleepData(startISO, endISO);
    }
  }, [whoopAccessToken, fetchWhoopSleepData]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<HealthDataContextType>(
    () => ({
      dataSource,
      sleepSessions,
      dreams,
      whoopAccessToken,
      setDataSource: handleSetDataSource,
      setWhoopAccessToken: handleSetWhoopAccessToken,
      fetchSleepData,
      generateDream,
      deleteDream: handleDeleteDream,
      clearAllData: handleClearAllData,
      isGeneratingDream,
      getSleepSessionByDate,
      getDreamByDate,
      fetchWhoopSleepData,
    }),
    [
      dataSource,
      sleepSessions,
      dreams,
      whoopAccessToken,
      handleSetDataSource,
      handleSetWhoopAccessToken,
      fetchSleepData,
      generateDream,
      handleDeleteDream,
      handleClearAllData,
      isGeneratingDream,
      getSleepSessionByDate,
      getDreamByDate,
      fetchWhoopSleepData,
    ]
  );

  return <HealthDataContext.Provider value={contextValue}>{children}</HealthDataContext.Provider>;
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

