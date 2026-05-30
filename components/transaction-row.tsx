import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDisplayDate } from '@/utils/dates';
import type { TransactionWithCategory } from '@/types/database';

type Props = {
  transaction: TransactionWithCategory;
  accentColor: string;
  amountPrefix: '+' | '-';
  fmt: (n: number) => string;
  onEdit: (tx: TransactionWithCategory) => void;
  onDelete: (tx: TransactionWithCategory) => void;
  isLast?: boolean;
};

export default function TransactionRow({
  transaction: tx,
  accentColor,
  amountPrefix,
  fmt,
  onEdit,
  onDelete,
  isLast,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const border = Colors[colorScheme].border;

  function handleLongPress() {
    Alert.alert(
      tx.category?.name ?? 'Transaction',
      `${amountPrefix}${fmt(Number(tx.amount))}`,
      [
        { text: 'Edit', onPress: () => onEdit(tx) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete Transaction', 'This action cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(tx) },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.txRow, pressed && { opacity: 0.7 }]}
        onLongPress={handleLongPress}
        delayLongPress={300}>
        <View style={[styles.txIcon, { backgroundColor: (tx.category?.color ?? accentColor) + '18' }]}>
          <Ionicons
            name={(tx.category?.icon ?? 'ellipse-outline') as any}
            size={20}
            color={tx.category?.color ?? accentColor}
          />
        </View>
        <View style={styles.txInfo}>
          <ThemedText type="defaultSemiBold" style={styles.txTitle}>
            {tx.category?.name ?? 'Uncategorised'}
          </ThemedText>
          <ThemedText style={styles.txMeta}>
            {tx.note ? `${tx.note} · ` : ''}{formatDisplayDate(tx.date)}
          </ThemedText>
        </View>
        <ThemedText lightColor={accentColor} darkColor={accentColor} style={styles.txAmount}>
          {amountPrefix}{fmt(Number(tx.amount))}
        </ThemedText>
      </Pressable>
      {!isLast && <View style={[styles.divider, { backgroundColor: border, marginLeft: 70 }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, marginBottom: 2 },
  txMeta: { fontSize: 12, opacity: 0.5 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
});