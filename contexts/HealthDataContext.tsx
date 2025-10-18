import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { DataSource, SleepSession, Dream, HealthDataContextType, WhoopSleepRecord } from '../constants/Types';
import { DEMO_SLEEP_DATA, DEMO_WHOOP_RECORDS } from '../services/demoData';
import { mapWhoopRecordToSleepSession } from '../utils/whoopSleepMapper';
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

  const loadStoredData = async () => {
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
  };

  const fetchSleepData = async () => {
    try {
      if (dataSource === 'demo') {
        setSleepSessions([...demoWhoopSessions, ...DEMO_WHOOP_RECORDS]);
      } else if (dataSource === 'apple-health') {
        // TODO: Implement Apple Health integration
        Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.');
      } else if (dataSource === 'whoop') {
        if (!whoopAccessToken) {
          Alert.alert('Not Connected', 'Please connect your WHOOP account first.');
          return;
        }

        const response = await apiClient.fetchWhoopSleep(whoopAccessToken, { limit: 25 });

        if (response.records && response.records.length > 0) {
          setSleepSessions(response.records as WhoopSleepRecord[]);
        } else {
          setSleepSessions([]);
        }

        Alert.alert('Success', `Fetched ${response.records?.length || 0} WHOOP sleep sessions`);
      }
    } catch (error: any) {
      console.error('Error fetching sleep data:', error);

      // Handle token expiration (401/403 errors)
      if (error.response?.status === 401 || error.response?.status === 403) {
        await handleSetWhoopAccessToken(null);
        Alert.alert(
          'WHOOP Connection Expired',
          'Your WHOOP connection has expired. Please reconnect in the Profile tab.'
        );
        return;
      }

      // Handle 404 errors with helpful message
      if (error.response?.status === 404) {
        const message = error.response?.data?.message || 'No sleep data found in your WHOOP account. Make sure you have been wearing your device during sleep.';
        Alert.alert('No Sleep Data', message);
        return;
      }

      // Generic error handling
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sleep data from WHOOP. Please check your connection and try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const generateDream = async (sleepSessionId: string) => {
    // Declare generatingDream outside try block so it's accessible in catch
    let generatingDream: Dream | null = null;

    try {
      setIsGeneratingDream(true);

      // Find the sleep session
      const sleepSession = sleepSessions.find((s) => s.id === sleepSessionId);
      if (!sleepSession || !isSleepSessionRecord(sleepSession)) {
        setIsGeneratingDream(false);
        Alert.alert('Error', 'Sleep session not found or not supported for dream generation');
        return;
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
      };

      setDreams((prev) => prev.map((d) => (d.id === generatingDream!.id ? completedDream : d)));
      await dreamStorage.saveDream(completedDream);

      if (completedDream.status === 'complete') {
        Alert.alert('Dream Generated!', `"${completedDream.title}" is ready to view.`);
      } else {
        Alert.alert('Generation Failed', completedDream.error || 'Failed to generate dream');
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

      Alert.alert('Error', error.message || 'Failed to generate dream');
    } finally {
      setIsGeneratingDream(false);
    }
  };

  const handleSetDataSource = (source: DataSource) => {
    setDataSource(source);
    if (source === 'demo') {
      setSleepSessions(DEMO_SLEEP_DATA);
    }
  };

  const handleSetWhoopAccessToken = async (token: string | null) => {
    setWhoopAccessToken(token);
    if (token) {
      await dreamStorage.saveWhoopToken(token);
    } else {
      await dreamStorage.clearWhoopToken();
    }
  };

  const handleDeleteDream = async (dreamId: string) => {
    try {
      await dreamStorage.deleteDream(dreamId);
      setDreams((prev) => prev.filter((d) => d.id !== dreamId));
    } catch (error: any) {
      console.error('Error deleting dream:', error);
      Alert.alert('Error', 'Failed to delete dream. Please try again.');
    }
  };

  const getSleepSessionByDate = (date: string): (SleepSession | WhoopSleepRecord) | null => {
    const session = sleepSessions.find((candidate) => {
      if (isSleepSessionRecord(candidate)) {
        return candidate.date === date;
      }

      try {
        return new Date(candidate.start).toISOString().split('T')[0] === date;
      } catch (error) {
        console.warn('Unable to parse WHOOP sleep date', error);
        return false;
      }
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
  };

  const getDreamByDate = (date: string): Dream | null => {
    const dreamForDate = dreams.find((dream) => {
      const session = sleepSessions.find((s) => s.id === dream.sleepSessionId);
      if (!session || !isSleepSessionRecord(session)) {
        return false;
      }
      return session.date === date;
    });
    return dreamForDate || null;
  };

  const fetchWhoopSleepData = async (startDate: string, endDate: string) => {
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
      // Handle token expiration (401/403 errors)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('WHOOP token expired or invalid, clearing token');
        await handleSetWhoopAccessToken(null);
        Alert.alert(
          'WHOOP Connection Expired',
          'Your WHOOP connection has expired. Please reconnect in the Profile tab.'
        );
        return;
      }

      // Handle 404 (no data available)
      if (error.response?.status === 404) {
        console.log('No WHOOP sleep data available for date range');
        Alert.alert(
          'No WHOOP Data Found',
          'No sleep data was found in your WHOOP account for the last 30 days. Make sure you\'ve been wearing your WHOOP device during sleep.'
        );
        setSleepSessions([]);
        return;
      }

      // Other errors - log but don't show alert
      console.error('Error fetching WHOOP sleep data:', error);
    }
  };

  // Fetch WHOOP data when token becomes available
  useEffect(() => {
    if (whoopAccessToken) {
      setDataSource('whoop');

      // Fetch last 30 days of sleep data with proper ISO 8601 format
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Format as ISO 8601 with timestamp (WHOOP API v2 requirement)
      const startISO = startDate.toISOString(); // e.g., "2025-09-18T12:34:56.789Z"
      const endISO = endDate.toISOString(); // e.g., "2025-10-18T12:34:56.789Z"

      fetchWhoopSleepData(startISO, endISO);
    }
  }, [whoopAccessToken]);

  return (
    <HealthDataContext.Provider
      value={{
        dataSource,
        sleepSessions,
        dreams,
        whoopAccessToken,
        setDataSource: handleSetDataSource,
        setWhoopAccessToken: handleSetWhoopAccessToken,
        fetchSleepData,
        generateDream,
        deleteDream: handleDeleteDream,
        isGeneratingDream,
        getSleepSessionByDate,
        getDreamByDate,
        fetchWhoopSleepData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

