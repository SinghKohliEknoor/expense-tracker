import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AddTransactionModal from '@/components/add-transaction-modal';
import TransactionRow from '@/components/transaction-row';
import SearchFilterBar from '@/components/search-filter-bar';
import FilterSheet, { type FilterState, EMPTY_FILTER } from '@/components/filter-sheet';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useTransactions } from '@/hooks/use-transactions';
import { startOfMonth } from '@/utils/dates';
import { useCurrency } from '@/context/currency-context';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';
import { supabase } from '@/lib/supabase';
import type { TransactionWithCategory } from '@/types/database';

const EXPENSE_COLOR = '#EF4444';

export default function ExpenseScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const { user }      = useAuth();
  const { fmt }       = useCurrency();
  const { invalidate } = useTransactionRefresh();

  const [showAdd,    setShowAdd]    = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionWithCategory | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState<FilterState>(EMPTY_FILTER);

  const monthStart = startOfMonth();
  // When a date range filter is active, use those dates; otherwise default to current month
  const queryStart = filter.startDate ?? monthStart;
  const queryEnd   = filter.endDate   ?? undefined;

  const { transactions, loading, refetch } = useTransactions({
    type: 'expense',
    startDate: queryStart,
    endDate: queryEnd,
  });

  async function handleDelete(tx: TransactionWithCategory) {
    const { error } = await (supabase.from('transactions') as any).delete().eq('id', tx.id).eq('user_id', user!.id);
    if (error) { Alert.alert('Error', error.message); return; }
    invalidate();
  }

  // Client-side keyword + category filter
  const filtered = useMemo(() => {
    let result = transactions;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(tx =>
        tx.category?.name?.toLowerCase().includes(q) ||
        (tx.note ?? '').toLowerCase().includes(q) ||
        String(tx.amount).includes(q),
      );
    }
    if (filter.categoryIds.length > 0) {
      result = result.filter(tx => tx.category_id && filter.categoryIds.includes(tx.category_id));
    }
    return result;
  }, [transactions, search, filter.categoryIds]);

  const total = useMemo(
    () => filtered.reduce((sum, tx) => sum + Number(tx.amount), 0),
    [filtered],
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; color: string; icon: string; total: number }>();
    filtered.forEach(tx => {
      if (!tx.category) return;
      const key = tx.category.id;
      if (!map.has(key)) {
        map.set(key, { name: tx.category.name, color: tx.category.color, icon: tx.category.icon, total: 0 });
      }
      map.get(key)!.total += Number(tx.amount);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const maxCat = categoryBreakdown[0]?.total ?? 1;

  const isFiltering = search.trim().length > 0 || filter.categoryIds.length > 0 || !!filter.startDate || !!filter.endDate;
  const hasActiveFilters = filter.categoryIds.length > 0 || !!filter.startDate || !!filter.endDate;

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
              {isFiltering
                ? `Filtered Expenses`
                : `Total Expenses — ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`}
            </ThemedText>
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.summaryAmount}>
              {fmt(total)}
            </ThemedText>
            <ThemedText
              lightColor="rgba(255,255,255,0.7)"
              darkColor="rgba(255,255,255,0.7)"
              style={styles.summaryCount}>
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              {isFiltering && transactions.length !== filtered.length
                ? ` of ${transactions.length}`
                : ''}
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

          {/* Search + Filter */}
          <SearchFilterBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => setShowFilter(true)}
            hasActiveFilters={hasActiveFilters}
            accentColor={EXPENSE_COLOR}
          />

          {filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons
                name={isFiltering ? 'search-outline' : 'wallet-outline'}
                size={36}
                color={EXPENSE_COLOR + '66'}
              />
              <ThemedText style={styles.emptyText}>
                {isFiltering ? 'No results found.' : 'No expenses this month.'}
              </ThemedText>
              <ThemedText style={styles.emptySubText}>
                {isFiltering ? 'Try a different search or filter.' : 'Tap "Add Expense" to record one.'}
              </ThemedText>
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
                                  { backgroundColor: cat.color, width: `${(cat.total / maxCat) * 100}%` },
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
                {isFiltering ? 'Results' : 'All Expenses'}
              </ThemedText>
              <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
                {filtered.map((tx, i) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    accentColor={EXPENSE_COLOR}
                    amountPrefix="-"
                    fmt={fmt}
                    onEdit={t => setEditTarget(t)}
                    onDelete={handleDelete}
                    isLast={i === filtered.length - 1}
                  />
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
      <AddTransactionModal
        visible={!!editTarget}
        type="expense"
        editTransaction={editTarget ?? undefined}
        onClose={() => setEditTarget(null)}
        onSaved={refetch}
      />
      <FilterSheet
        visible={showFilter}
        type="expense"
        accentColor={EXPENSE_COLOR}
        filter={filter}
        onApply={setFilter}
        onClose={() => setShowFilter(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:   { padding: 20, paddingBottom: 32 },

  summaryCard:   { borderRadius: 22, padding: 24, marginBottom: 14 },
  summaryLabel:  { fontSize: 13, marginBottom: 6 },
  summaryAmount: { fontSize: 34, fontWeight: '800', lineHeight: 44, marginBottom: 4 },
  summaryCount:  { fontSize: 12 },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14, marginBottom: 14,
  },
  addBtnText: { fontSize: 15, fontWeight: '600' },

  emptyCard: {
    borderRadius: 18, borderWidth: StyleSheet.hairlineWidth,
    padding: 36, alignItems: 'center', gap: 8,
  },
  emptyText:    { fontSize: 15, fontWeight: '600', marginTop: 4 },
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
  catDot:     { width: 9, height: 9, borderRadius: 5 },
  catName:    { width: 100, fontSize: 13 },
  catBarWrap: { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill:  { height: 7, borderRadius: 4 },
  catAmount:   { fontSize: 13, width: 72, textAlign: 'right' },

  txCard:  { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth },
});