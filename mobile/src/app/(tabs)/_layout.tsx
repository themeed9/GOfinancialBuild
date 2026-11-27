import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { BottomBar } from '@/components/BottomBar';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const { settings } = useAppData();

  // First run: choose a username (and optionally a budget) before the dashboard.
  if (settings.username === null) return <Redirect href="/setup/username" />;

  return (
    <Tabs
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.background } }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insight' }} />
    </Tabs>
  );
}
