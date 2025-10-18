import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataSource, SleepSession, HealthDataContextType } from '../constants/Types';
import { DEMO_SLEEP_DATA } from '../services/demoData';

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider = ({ children }: { children: ReactNode }) => {
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>(DEMO_SLEEP_DATA);

  const fetchSleepData = async () => {
    // Future: Fetch data based on dataSource
    // For now, demo data is already loaded
    if (dataSource === 'demo') {
      setSleepSessions(DEMO_SLEEP_DATA);
    } else if (dataSource === 'apple-health') {
      // TODO: Implement Apple Health integration
      console.log('Apple Health integration coming soon');
    } else if (dataSource === 'whoop') {
      // TODO: Implement Whoop integration
      console.log('Whoop integration coming soon');
    }
  };

  const handleSetDataSource = (source: DataSource) => {
    setDataSource(source);
    if (source === 'demo') {
      setSleepSessions(DEMO_SLEEP_DATA);
    }
  };

  return (
    <HealthDataContext.Provider
      value={{
        dataSource,
        sleepSessions,
        setDataSource: handleSetDataSource,
        fetchSleepData,
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

