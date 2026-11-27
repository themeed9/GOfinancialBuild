import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CURRENCIES } from '@/core/currencies';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { ModalHeader } from './ModalHeader';

interface Props {
  visible: boolean;
  value: string;
  onSelect(code: string): void;
  onClose(): void;
}

/** Display currency. Past entries keep the currency they were logged in. */
export function CurrencyPicker({ visible, value, onSelect, onClose }: Props) {
  const theme = useTheme();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View>
          <ModalHeader title="Currency" onClose={onClose} />
        </View>
        <AppText variant="bodySmall" color="onSurfaceVariant" style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
          Totals show entries in the chosen currency. Past entries keep the currency they were logged in.
        </AppText>
        <FlatList
          data={CURRENCIES}
          keyExtractor={(c) => c.code}
          renderItem={({ item }) => {
            const selected = item.code === value;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.code);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[styles.row, { paddingHorizontal: theme.spacing.md, backgroundColor: selected ? theme.colors.primaryContainer : 'transparent' }]}>
                <AppText variant="titleMedium" style={[styles.symbol, { fontFamily: theme.font('600') }]}>
                  {item.symbol}
                </AppText>
                <AppText variant="bodyLarge" style={styles.name}>
                  {item.name}
                </AppText>
                <AppText variant="labelLarge" color="onSurfaceVariant">
                  {item.code}
                </AppText>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  symbol: { width: 48 },
  name: { flex: 1 },
});
