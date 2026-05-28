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

const EXPENSE_COLOR = '#EF4444';

export default function ExpenseScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const [showAdd, setShowAdd] = useState(false);
  const { fmt } = useCurrency();

  const monthStart = startOfMonth();
  const { transactions, loading, refetch } = useTransactions({
    type: 'expense',
    startDate: monthStart,
  });

  const total = useMemo(
    () => transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
    [transactions],
  );

  const categoryBreakdown = useMemo(() => {
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

  const maxCat = categoryBreakdown[0]?.total ?? 1;

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={EXPENSE_COLOR} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: EXPENSE_COLOR }]}>
            <ThemedText
              lightColor="rgba(255,255,255,0.78)"
              darkColor="rgba(255,255,255,0.78)"
              style={styles.summaryLabel}>
              Total Expenses — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
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

          {/* Add Expense CTA */}
          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: EXPENSE_COLOR, opacity: pressed ? 0.82 : 1 },
            ]}>
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.addBtnText}>
              Add Expense
            </ThemedText>
          </Pressable>

          {transactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="wallet-outline" size={36} color={EXPENSE_COLOR + '66'} />
              <ThemedText style={styles.emptyText}>No expenses this month.</ThemedText>
              <ThemedText style={styles.emptySubText}>Tap "Add Expense" to record one.</ThemedText>
            </View>
          ) : (
            <>
              {/* Category Breakdown */}
              {categoryBreakdown.length > 0 && (
                <>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    By Category
                  </ThemedText>
                  <View style={[styles.catCard, { backgroundColor: card, borderColor: border }]}>
                    {categoryBreakdown.map((cat, i) => (
                      <View key={cat.name}>
                        <View style={styles.catRow}>
                          <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                          <ThemedText style={styles.catName}>{cat.name}</ThemedText>
                          <View style={styles.catBarWrap}>
                            <View style={[styles.catBarTrack, { backgroundColor: cat.color + '28' }]}>
                              <View
                                style={[
                                  styles.catBarFill,
                                  {
                                    backgroundColor: cat.color,
                                    width: `${(cat.total / maxCat) * 100}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <ThemedText type="defaultSemiBold" style={styles.catAmount}>
                            {fmt(cat.total)}
                          </ThemedText>
                        </View>
                        {i < categoryBreakdown.length - 1 && (
                          <View style={[styles.divider, { backgroundColor: border }]} />
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Transaction List */}
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                All Expenses
              </ThemedText>
              <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
                {transactions.map((tx, i) => (
                  <View key={tx.id}>
                    <Pressable style={styles.txRow}>
                      <View
                        style={[
                          styles.txIcon,
                          { backgroundColor: (tx.category?.color ?? EXPENSE_COLOR) + '18' },
                        ]}>
                        <Ionicons
                          name={(tx.category?.icon ?? 'ellipse-outline') as any}
                          size={20}
                          color={tx.category?.color ?? EXPENSE_COLOR}
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
                      <ThemedText lightColor={EXPENSE_COLOR} darkColor={EXPENSE_COLOR} style={styles.txAmount}>
                        -{fmt(Number(tx.amount))}
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
        type="expense"
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

  catCard: {
    borderRadius: 18, borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden', marginBottom: 26,
  },
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, gap: 10,
  },
  catDot: { width: 9, height: 9, borderRadius: 5 },
  catName: { width: 100, fontSize: 13 },
  catBarWrap: { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: 7, borderRadius: 4 },
  catAmount: { fontSize: 13, width: 72, textAlign: 'right' },

  txCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, marginBottom: 2 },
  txMeta: { fontSize: 12, opacity: 0.5 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
});