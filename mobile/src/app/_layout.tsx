import { useFonts } from 'expo-font';
import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { DATABASE_NAME, migrate } from '@/data/db';
import { AppDataProvider, useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';
import { FONT_FILES } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const theme = useTheme();
  const { status } = useAppData();
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const ready = status !== 'loading' && (fontsLoaded || fontError !== null);

  // Keep the splash screen up until data and fonts are ready, so the
  // dashboard never flashes an empty total.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="settings" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="setup/username" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="setup/budget" options={{ gestureEnabled: false }} />
        <Stack.Screen name="account/create" />
        <Stack.Screen name="account/sign-in" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrate}>
      <AppDataProvider>
        <Navigator />
      </AppDataProvider>
    </SQLiteProvider>
  );
}
