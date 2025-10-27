import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '@/lib/database';
import { colors } from '@/lib/styles';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <>
      <StatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.lightBg },
        }}
      />
    </>
  );
}
