import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { DashboardIcon, HistoryIcon, InsightIcon, PlusIcon } from './icons';

const TAB_ICONS: Record<string, ComponentType<{ color: string; size?: number }>> = {
  index: DashboardIcon,
  history: HistoryIcon,
  insights: InsightIcon,
};

/**
 * The mockup's bottom bar: a prominent "Add" pill (Quick Add is the
 * product's centre) followed by the three tabs.
 */
export function BottomBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <Pressable
        onPress={() => router.push('/add')}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        style={({ pressed }) => [
          styles.add,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            boxShadow: theme.elevation.lg,
            opacity: pressed ? 0.85 : 1,
            gap: theme.spacing.xs,
          },
        ]}>
        <AppText variant="titleMedium" color="onPrimary" style={{ fontFamily: theme.font('600') }}>
          Add
        </AppText>
        <PlusIcon color={theme.colors.onPrimary} />
      </Pressable>

      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;
          const Icon = TAB_ICONS[route.name] ?? DashboardIcon;
          const color = focused ? theme.colors.primary : theme.colors.outline;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={styles.tab}>
              <Icon color={color} />
              <AppText
                variant="labelSmall"
                style={{ color, fontFamily: theme.font(focused ? '600' : '400') }}
                numberOfLines={1}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center' },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 28 },
  tabs: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { alignItems: 'center', justifyContent: 'center', minWidth: 64, minHeight: 52, gap: 2 },
});
