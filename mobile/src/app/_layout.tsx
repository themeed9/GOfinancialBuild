import { Tabs } from 'expo-router/js-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { DATABASE_NAME, migrate } from '@/data/db';
import { AppDataProvider, useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

function AppTabs() {
  const theme = useTheme();
  const { status } = useAppData();

  // Keep the splash screen up until stored data has loaded, so the
  // dashboard never flashes an empty total.
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

  // Placeholder tab bar. The design's custom bar (Add pill + three tabs)
  // replaces it when the dashboard screen is built.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insight' }} />
    </Tabs>
  );
}

export default function RootLayout() {
  const theme = useTheme();

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrate}>
      <AppDataProvider>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <AppTabs />
      </AppDataProvider>
    </SQLiteProvider>
  );
}
