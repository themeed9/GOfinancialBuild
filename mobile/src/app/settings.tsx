import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChevronIcon, CloseIcon, PathIcon, PencilIcon, PersonIcon } from '@/components/icons';
import { ICONS, PRIVACY, TERMS } from '@/components/settings/content';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { getCurrency } from '@/core/currencies';
import { transactionsToCsv } from '@/core/export';
import { normalizeUsername, validateUsername } from '@/core/username';
import { useAppData } from '@/state/AppDataProvider';
import { useTheme } from '@/theme';

type Tab = 'profile' | 'settings' | 'terms' | 'privacy';
const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
  { key: 'terms', label: 'Terms' },
  { key: 'privacy', label: 'Privacy' },
];

/** Settings sheet (V2) with Profile / Settings / Terms / Privacy tabs. */
export default function SettingsSheet() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.key === params.tab) ? (params.tab as Tab) : 'settings');

  return (
    <View style={styles.root}>
      <Pressable style={styles.scrim} onPress={() => router.back()} accessibilityLabel="Close settings" />
      <View style={[styles.sheet, { backgroundColor: theme.colors.background, marginTop: insets.top + 12, paddingBottom: insets.bottom }]}>
        <View style={[styles.titleRow, { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl }]}>
          <AppText variant="headlineSmall" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
            Settings
          </AppText>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.close, { backgroundColor: theme.colors.surfaceContainer }]}>
            <CloseIcon color={theme.colors.onSurface} />
          </Pressable>
        </View>
        <View accessibilityRole="tablist" style={[styles.tabs, { marginHorizontal: theme.spacing.xl, borderBottomColor: theme.colors.outlineVariant }]}>
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.tab, { borderBottomColor: on ? theme.colors.primary : 'transparent' }]}>
                <AppText variant="bodyLarge" color={on ? 'primary' : 'onSurfaceVariant'}>
                  {t.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          {tab === 'profile' && <ProfileTab />}
          {tab === 'settings' && <SettingsTab onLegal={() => setTab('terms')} />}
          {tab === 'terms' && <Doc items={TERMS} />}
          {tab === 'privacy' && <Doc items={PRIVACY} />}
        </ScrollView>
      </View>
    </View>
  );
}

function ProfileTab() {
  const theme = useTheme();
  const { settings, updateSettings, memberSince } = useAppData();
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const currency = getCurrency(settings.currency);
  const rows: { icon: string; label: string; value: string; onPress?(): void }[] = [
    { icon: ICONS.currency, label: 'Currency', value: `${currency.code} · ${currency.name}`, onPress: () => setPicking(true) },
    { icon: ICONS.globe, label: 'Locale', value: settings.locale },
    {
      icon: ICONS.calendar,
      label: 'Member since',
      value: memberSince ? new Intl.DateTimeFormat(settings.locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(memberSince) : '—',
    },
  ];

  return (
    <>
      <View style={[styles.center, { gap: theme.spacing.lg }]}>
        <View style={[styles.bigAvatar, { backgroundColor: theme.colors.primaryContainer }]}>
          <PersonIcon color={theme.colors.onPrimaryContainer} size={48} />
        </View>
        <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel={`Username ${settings.username}. Edit`} style={styles.nameRow}>
          <AppText variant="headlineSmall" style={{ fontFamily: theme.font('600') }}>
            {settings.username ? settings.username.charAt(0).toUpperCase() + settings.username.slice(1) : ''}
          </AppText>
          <PencilIcon color={theme.colors.primary} size={18} />
        </Pressable>
      </View>
      <View style={[styles.card, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceContainerLowest }]}>
        {rows.map((r, i) => {
          const content = (
            <>
              <PathIcon d={r.icon} color={theme.colors.primary} size={20} />
              <View style={styles.flex}>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  {r.label}
                </AppText>
                <AppText variant="titleMedium" style={{ fontFamily: theme.font('500') }}>
                  {r.value}
                </AppText>
              </View>
              {r.onPress && <ChevronIcon color={theme.colors.outline} />}
            </>
          );
          const style = [styles.infoRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }];
          return r.onPress ? (
            <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" accessibilityLabel={`${r.label}: ${r.value}. Change`} style={style}>
              {content}
            </Pressable>
          ) : (
            <View key={r.label} style={style} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
              {content}
            </View>
          );
        })}
      </View>
      <EditUsername visible={editing} initial={settings.username ?? ''} onClose={() => setEditing(false)} onSave={(u) => updateSettings({ username: u })} />
      <CurrencyPicker visible={picking} value={settings.currency} onSelect={(code) => updateSettings({ currency: code })} onClose={() => setPicking(false)} />
    </>
  );
}

function EditUsername({ visible, initial, onClose, onSave }: { visible: boolean; initial: string; onClose(): void; onSave(u: string): Promise<void> }) {
  const theme = useTheme();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    const r = validateUsername(value);
    if (!r.ok) return setError(r.error);
    await onSave(r.username);
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => setValue(initial)}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialog, { backgroundColor: theme.colors.background, gap: theme.spacing.md }]}>
          <AppText variant="titleLarge" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
            Edit username
          </AppText>
          <View style={[styles.inputRow, { borderBottomColor: error ? theme.colors.error : theme.colors.primary }]}>
            <AppText variant="titleLarge" color="onSurfaceVariant">
              @
            </AppText>
            <TextInput
              value={value}
              onChangeText={(t) => {
                setError(null);
                setValue(normalizeUsername(t));
              }}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Username"
              style={[theme.text.titleLarge, styles.flex, { color: theme.colors.onSurface }]}
            />
          </View>
          {error && (
            <AppText variant="bodySmall" color="error" accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <View style={styles.dialogActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} />
            <Button label="Save" onPress={save} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SettingsTab({ onLegal }: { onLegal(): void }) {
  const theme = useTheme();
  const { settings, updateSettings, transactions, deleteAllData } = useAppData();
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && theme.dark);

  const exportData = async () => {
    try {
      await Share.share({ title: 'GOfinancial export', message: transactionsToCsv(transactions) });
    } catch {
      Alert.alert('Export failed', 'Please try again.');
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete all data?', 'This removes every expense, your budget and your username from this phone. Export first if you want a copy.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          router.dismissAll();
          router.replace('/setup/username');
        },
      },
    ]);

  return (
    <>
      <SettingsRow
        icon={ICONS.globe}
        title="Language"
        subtitle="More languages are coming"
        right={
          <View style={[styles.select, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.background }]}>
            <AppText variant="bodyMedium">English</AppText>
          </View>
        }
      />
      <SettingsRow
        icon={ICONS.sun}
        title="Dark Mode"
        subtitle={settings.theme === 'system' ? 'Following your phone' : dark ? 'On' : 'Off'}
        right={
          <Switch
            value={dark}
            onValueChange={(on) => updateSettings({ theme: on ? 'dark' : 'light' })}
            accessibilityLabel="Dark mode"
            trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceContainerHigh }}
          />
        }
      />
      <SettingsRow icon={ICONS.info} title="About GOfinancial" subtitle={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`} />
      <SettingsRow icon={ICONS.download} title="Export Data" subtitle="Download your expenses as CSV" action="Export" onPress={exportData} />
      <SettingsRow
        icon={ICONS.wallet}
        title="Budget"
        subtitle="Track against a goal"
        action="Set Budget"
        onPress={() => router.push({ pathname: '/setup/budget', params: { mode: 'edit' } })}
      />
      <SettingsRow icon={ICONS.gavel} title="Legal" subtitle="Terms & Privacy" onPress={onLegal} />
      <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
      <Pressable
        onPress={confirmDelete}
        accessibilityRole="button"
        style={[styles.danger, { backgroundColor: theme.colors.errorContainer }]}>
        <PathIcon d={ICONS.trash} color={theme.colors.onErrorContainer} size={20} />
        <AppText variant="titleMedium" color="onErrorContainer" style={{ fontFamily: theme.font('700') }}>
          Delete all data
        </AppText>
      </Pressable>
    </>
  );
}

function Doc({ items }: { items: { heading: string; body: string }[] }) {
  const theme = useTheme();
  return (
    <>
      {items.map((s) => (
        <View key={s.heading} style={{ gap: theme.spacing.xxs }}>
          <AppText variant="titleMedium" accessibilityRole="header" style={{ fontFamily: theme.font('600') }}>
            {s.heading}
          </AppText>
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ lineHeight: 22 }}>
            {s.body}
          </AppText>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 12 },
  tab: { paddingHorizontal: 12, minHeight: 48, justifyContent: 'center', borderBottomWidth: 2 },
  center: { alignItems: 'center' },
  bigAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 14, minHeight: 64 },
  select: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  divider: { height: 1, marginVertical: 4 },
  danger: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderRadius: 12, paddingHorizontal: 20 },
  dialogScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dialog: { borderRadius: 24, padding: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, paddingBottom: 4 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
