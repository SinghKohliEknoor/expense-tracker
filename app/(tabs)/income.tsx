import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AddTransactionModal from '@/components/add-transaction-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactions } from '@/hooks/use-transactions';
import { formatDisplayDate, startOfMonth } from '@/utils/dates';
import { useCurrency } from '@/context/currency-context';

const INCOME_COLOR = '#22C55E';

export default function IncomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const [showAdd, setShowAdd] = useState(false);
  const { fmt } = useCurrency();

  const monthStart = startOfMonth();
  const { transactions, loading, refetch } = useTransactions({
    type: 'income',
    startDate: monthStart,
  });

  const total = useMemo(
    () => transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
    [transactions],
  );

  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; color: string; icon: string; total: number }>();
    transactions.forEach((tx) => {
      if (!tx.category) return;
      const key = tx.category.id;
      if (!map.has(key)) {
        map.set(key, { name: tx.category.name, color: tx.category.color, icon: tx.category.icon, total: 0 });
      }
      map.get(key)!.total += Number(tx.amount);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const maxSource = sourceBreakdown[0]?.total ?? 1;

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={INCOME_COLOR} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: INCOME_COLOR }]}>
            <ThemedText
              lightColor="rgba(255,255,255,0.78)"
              darkColor="rgba(255,255,255,0.78)"
              style={styles.summaryLabel}>
              Total Income — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </ThemedText>
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.summaryAmount}>
              {fmt(total)}
            </ThemedText>
            <ThemedText
              lightColor="rgba(255,255,255,0.7)"
              darkColor="rgba(255,255,255,0.7)"
              style={styles.summaryCount}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>

          {/* Add Income CTA */}
          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: INCOME_COLOR, opacity: pressed ? 0.82 : 1 },
            ]}>
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.addBtnText}>
              Add Income
            </ThemedText>
          </Pressable>

          {transactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="trending-up-outline" size={36} color={INCOME_COLOR + '66'} />
              <ThemedText style={styles.emptyText}>No income this month.</ThemedText>
              <ThemedText style={styles.emptySubText}>Tap "Add Income" to record one.</ThemedText>
            </View>
          ) : (
            <>
              {/* Source Breakdown */}
              {sourceBreakdown.length > 0 && (
                <>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    By Source
                  </ThemedText>
                  <View style={[styles.sourceCard, { backgroundColor: card, borderColor: border }]}>
                    {sourceBreakdown.map((src, i) => (
                      <View key={src.name}>
                        <View style={styles.sourceRow}>
                          <View style={[styles.sourceDot, { backgroundColor: src.color }]} />
                          <ThemedText style={styles.sourceName}>{src.name}</ThemedText>
                          <View style={styles.barWrap}>
                            <View style={[styles.barTrack, { backgroundColor: src.color + '28' }]}>
                              <View
                                style={[
                                  styles.barFill,
                                  {
                                    backgroundColor: src.color,
                                    width: `${(src.total / maxSource) * 100}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <ThemedText type="defaultSemiBold" style={styles.sourceAmount}>
                            {fmt(src.total)}
                          </ThemedText>
                        </View>
                        {i < sourceBreakdown.length - 1 && (
                          <View style={[styles.divider, { backgroundColor: border }]} />
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Transaction List */}
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                All Income
              </ThemedText>
              <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
                {transactions.map((tx, i) => (
                  <View key={tx.id}>
                    <Pressable style={styles.txRow}>
                      <View
                        style={[
                          styles.txIcon,
                          { backgroundColor: (tx.category?.color ?? INCOME_COLOR) + '18' },
                        ]}>
                        <Ionicons
                          name={(tx.category?.icon ?? 'ellipse-outline') as any}
                          size={20}
                          color={tx.category?.color ?? INCOME_COLOR}
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
                      <ThemedText lightColor={INCOME_COLOR} darkColor={INCOME_COLOR} style={styles.txAmount}>
                        +{fmt(Number(tx.amount))}
                      </ThemedText>
                    </Pressable>
                    {i < transactions.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: border, marginLeft: 70 }]} />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      <AddTransactionModal
        visible={showAdd}
        type="income"
        onClose={() => setShowAdd(false)}
        onSaved={refetch}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 32 },

  summaryCard: { borderRadius: 22, padding: 24, marginBottom: 14 },
  summaryLabel: { fontSize: 13, marginBottom: 6 },
  summaryAmount: { fontSize: 34, fontWeight: '800', marginBottom: 4 },
  summaryCount: { fontSize: 12 },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14, marginBottom: 26,
  },
  addBtnText: { fontSize: 15, fontWeight: '600' },

  emptyCard: {
    borderRadius: 18, borderWidth: StyleSheet.hairlineWidth,
    padding: 36, alignItems: 'center', gap: 8,
  },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  emptySubText: { fontSize: 13, opacity: 0.5 },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  sourceCard: {
    borderRadius: 18, borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden', marginBottom: 26,
  },
  sourceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, gap: 10,
  },
  sourceDot: { width: 9, height: 9, borderRadius: 5 },
  sourceName: { width: 100, fontSize: 13 },
  barWrap: { flex: 1 },
  barTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  sourceAmount: { fontSize: 13, width: 72, textAlign: 'right' },

  txCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, marginBottom: 2 },
  txMeta: { fontSize: 12, opacity: 0.5 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
});