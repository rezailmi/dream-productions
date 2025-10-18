import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { DataSource, SleepSession, Dream, HealthDataContextType } from '../constants/Types';
import { DEMO_SLEEP_DATA } from '../services/demoData';
import apiClient from '../services/apiClient';
import dreamStorage from '../services/dreamStorage';

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider = ({ children }: { children: ReactNode }) => {
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>(DEMO_SLEEP_DATA);
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

      setDreams(storedDreams);
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
        setSleepSessions(DEMO_SLEEP_DATA);
      } else if (dataSource === 'apple-health') {
        // TODO: Implement Apple Health integration
        Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.');
      } else if (dataSource === 'whoop') {
        if (!whoopAccessToken) {
          Alert.alert('Not Connected', 'Please connect your WHOOP account first.');
          return;
        }

        // Fetch sleep data from WHOOP API
        const response = await apiClient.fetchWhoopSleep(whoopAccessToken, { limit: 10 });

        // Note: WHOOP data would need to be mapped to SleepSession format
        // This would be done in the backend whoopService.mapWhoopToSleepSession
        // For now, we'll show a success message
        Alert.alert('Success', `Fetched ${response.records?.length || 0} sleep sessions from WHOOP`);
      }
    } catch (error: any) {
      console.error('Error fetching sleep data:', error);
      Alert.alert('Error', error.message || 'Failed to fetch sleep data');
    }
  };

  const generateDream = async (sleepSessionId: string) => {
    try {
      setIsGeneratingDream(true);

      // Find the sleep session
      const sleepSession = sleepSessions.find((s) => s.id === sleepSessionId);
      if (!sleepSession) {
        throw new Error('Sleep session not found');
      }

      // Create a generating dream placeholder
      const generatingDream: Dream = {
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
      setDreams((prev) => [generatingDream, ...prev]);
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

      setDreams((prev) => prev.map((d) => (d.id === generatingDream.id ? completedDream : d)));
      await dreamStorage.saveDream(completedDream);

      if (completedDream.status === 'complete') {
        Alert.alert('Dream Generated!', `"${completedDream.title}" is ready to view.`);
      } else {
        Alert.alert('Generation Failed', completedDream.error || 'Failed to generate dream');
      }
    } catch (error: any) {
      console.error('Error generating dream:', error);
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
        isGeneratingDream,
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

