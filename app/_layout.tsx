import React from 'react';
import { Slot } from 'expo-router';
import { HealthDataProvider } from '../contexts/HealthDataContext';

export default function RootLayout() {
  return (
    <HealthDataProvider>
      <Slot />
    </HealthDataProvider>
  );
}

