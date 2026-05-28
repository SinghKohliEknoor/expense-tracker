import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactions } from '@/hooks/use-transactions';
import {
  MONTH_LABELS,
  nMonthsAgo,
  startOfMonth,
  startOfWeek,
  startOfYear,
  today,
} from '@/utils/dates';
import { useCurrency } from '@/context/currency-context';
import type { TransactionWithCategory } from '@/types/database';

// ─── Types & helpers ──────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year';

function getPeriodRange(p: Period): { startDate: string; endDate: string } {
  const end = today();
  switch (p) {
    case 'week':  return { startDate: startOfWeek(), endDate: end };
    case 'month': return { startDate: startOfMonth(), endDate: end };
    case 'year':  return { startDate: startOfYear(), endDate: end };
  }
}

function buildBarData(
  txs: TransactionWithCategory[],
  period: Period,
): { labels: string[]; values: number[] } {
  const expenses = txs.filter((t) => t.type === 'expense');

  if (period === 'week') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = new Array(7).fill(0);
    expenses.forEach((tx) => {
      const day = new Date(tx.date + 'T00:00:00').getDay(); // 0=Sun
      const idx = day === 0 ? 6 : day - 1;
      values[idx] += Number(tx.amount);
    });
    return { labels, values };
  }

  if (period === 'month') {
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const values = new Array(5).fill(0);
    expenses.forEach((tx) => {
      const day = new Date(tx.date + 'T00:00:00').getDate();
      values[Math.min(Math.floor((day - 1) / 7), 4)] += Number(tx.amount);
    });
    return { labels, values };
  }

  // year — 12 monthly buckets
  const values = new Array(12).fill(0);
  expenses.forEach((tx) => {
    values[new Date(tx.date + 'T00:00:00').getMonth()] += Number(tx.amount);
  });
  return { labels: MONTH_LABELS.map((l) => l.slice(0, 3)), values };
}

function buildTrend(txs: TransactionWithCategory[]) {
  const map = new Map<string, { income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, { income: 0, expense: 0 });
  }
  txs.forEach((tx) => {
    const key = tx.date.slice(0, 7);
    if (!map.has(key)) return;
    const entry = map.get(key)!;
    if (tx.type === 'income') entry.income += Number(tx.amount);
    else entry.expense += Number(tx.amount);
  });
  return Array.from(map.entries()).map(([key, val]) => ({
    label: MONTH_LABELS[parseInt(key.slice(5, 7)) - 1].slice(0, 3),
    ...val,
  }));
}

function buildCategoryBreakdown(txs: TransactionWithCategory[]) {
  const map = new Map<string, { name: string; color: string; icon: string; total: number }>();
  txs.filter((t) => t.type === 'expense').forEach((tx) => {
    if (!tx.category) return;
    const key = tx.category.id;
    if (!map.has(key))
      map.set(key, { name: tx.category.name, color: tx.category.color, icon: tx.category.icon, total: 0 });
    map.get(key)!.total += Number(tx.amount);
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PeriodToggle({
  value, onChange, tint, card, border,
}: { value: Period; onChange: (p: Period) => void; tint: string; card: string; border: string }) {
  return (
    <View style={[tog.wrap, { backgroundColor: card, borderColor: border }]}>
      {(['week', 'month', 'year'] as Period[]).map((p) => (
        <Pressable
          key={p}
          style={[tog.btn, value === p && { backgroundColor: tint }]}
          onPress={() => onChange(p)}>
          <ThemedText
            lightColor={value === p ? '#fff' : undefined}
            darkColor={value === p ? '#fff' : undefined}
            style={[tog.label, value === p && { fontWeight: '700' }]}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
const tog = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 4, marginBottom: 20 },
  btn:  { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '500' },
});

function BarChart({ labels, values, tint }: { labels: string[]; values: number[]; tint: string }) {
  const max = Math.max(...values, 1);
  const BAR_H = 88;
  const peakIdx = values.indexOf(Math.max(...values));
  return (
    <View style={bc.chart}>
      {values.map((val, i) => {
        const h = val > 0 ? Math.max((val / max) * BAR_H, 6) : 3;
        const isPeak = i === peakIdx && val > 0;
        return (
          <View key={i} style={bc.col}>
            <ThemedText style={[bc.val, { opacity: isPeak ? 1 : 0 }]} lightColor={tint} darkColor={tint}>
              {val >= 1000 ? `${Math.round(val / 1000)}k` : Math.round(val)}
            </ThemedText>
            <View style={[bc.track, { height: BAR_H }]}>
              <View style={[bc.fill, { height: h, backgroundColor: val === 0 ? tint + '18' : isPeak ? tint : tint + '55' }]} />
            </View>
            <ThemedText style={bc.lbl}>{labels[i]}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}
const bc = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  col:   { flex: 1, alignItems: 'center', gap: 5 },
  val:   { fontSize: 9, fontWeight: '700' },
  track: { justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  fill:  { width: '70%', borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  lbl:   { fontSize: 9, opacity: 0.55 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint  = Colors[colorScheme].tint;
  const card  = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const { currency, fmt } = useCurrency();
  const [period, setPeriod] = useState<Period>('month');
  const { startDate, endDate } = getPeriodRange(period);

  // Period transactions (bar chart, comparison, category breakdown)
  const { transactions: periodTx, loading: loadingPeriod } = useTransactions({ startDate, endDate });

  // Last 6 months for trend (always fixed range)
  const trendStart = nMonthsAgo(6);
  const { transactions: trendTx, loading: loadingTrend } = useTransactions({ startDate: trendStart });

  const loading = loadingPeriod || loadingTrend;

  const barData      = useMemo(() => buildBarData(periodTx, period), [periodTx, period]);
  const categories   = useMemo(() => buildCategoryBreakdown(periodTx), [periodTx]);
  const trend        = useMemo(() => buildTrend(trendTx), [trendTx]);

  const periodIncome   = useMemo(() => periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [periodTx]);
  const periodExpenses = useMemo(() => periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [periodTx]);
  const savings        = Math.max(0, periodIncome - periodExpenses);
  const savingsPct     = periodIncome > 0 ? Math.round((savings / periodIncome) * 100) : 0;

  const maxCat   = categories[0]?.total ?? 1;
  const maxTrend = Math.max(...trend.map((m) => Math.max(m.income, m.expense)), 1);

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={tint} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PeriodToggle value={period} onChange={setPeriod} tint={tint} card={card} border={border} />

          {/* Stat cards */}
          <View style={styles.statsRow}>
            {[
              { icon: 'wallet-outline' as const,      color: '#EF4444', value: fmt(periodExpenses), label: 'Spent' },
              { icon: 'trending-up-outline' as const, color: '#22C55E', value: fmt(periodIncome),   label: 'Earned' },
              { icon: 'leaf-outline' as const,        color: tint,      value: `${savingsPct}%`,              label: 'Saved' },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <ThemedText style={styles.statVal}>{s.value}</ThemedText>
                <ThemedText style={styles.statLbl}>{s.label}</ThemedText>
              </View>
            ))}
          </View>

          {/* Spending bar chart */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Spending Overview</ThemedText>
          <View style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}>
            <View style={styles.chartHeader}>
              <View>
                <ThemedText type="defaultSemiBold" style={styles.chartAmt}>{fmt(periodExpenses)}</ThemedText>
                <ThemedText style={styles.chartSub}>total expenses</ThemedText>
              </View>
              {periodTx.length === 0 && (
                <ThemedText style={styles.noDataLabel}>No data yet</ThemedText>
              )}
            </View>
            <BarChart labels={barData.labels} values={barData.values} tint={tint} />
          </View>

          {/* Income vs Expenses */}
          {(periodIncome > 0 || periodExpenses > 0) && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Income vs Expenses</ThemedText>
              <View style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}>
                {[
                  { label: 'Income',   amt: periodIncome,   color: '#22C55E' },
                  { label: 'Expenses', amt: periodExpenses, color: '#EF4444' },
                ].map((row, i) => {
                  const total = periodIncome + periodExpenses;
                  const pct = total > 0 ? row.amt / total : 0;
                  return (
                    <View key={row.label}>
                      <View style={styles.compRow}>
                        <View style={[styles.compDot, { backgroundColor: row.color }]} />
                        <ThemedText style={styles.compLabel}>{row.label}</ThemedText>
                        <View style={styles.compBarWrap}>
                          <View style={[styles.compBarTrack, { backgroundColor: row.color + '22' }]}>
                            <View style={[styles.compBarFill, { backgroundColor: row.color, width: `${pct * 100}%` }]} />
                          </View>
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.compAmt}>
                          {row.amt >= 1000 ? `${currency.symbol}${Math.round(row.amt / 1000)}k` : fmt(row.amt)}
                        </ThemedText>
                      </View>
                      {i === 0 && <View style={[styles.divider, { backgroundColor: border }]} />}
                    </View>
                  );
                })}
                {periodIncome > 0 && (
                  <View style={[styles.savingsBadge, { backgroundColor: '#22C55E10' }]}>
                    <Ionicons name="leaf-outline" size={13} color="#22C55E" />
                    <ThemedText lightColor="#22C55E" darkColor="#22C55E" style={styles.savingsText}>
                      Saving {savingsPct}% — {fmt(savings)} saved this period
                    </ThemedText>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Category breakdown */}
          {categories.length > 0 && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Top Categories</ThemedText>
              <View style={[styles.catCard, { backgroundColor: card, borderColor: border }]}>
                {categories.map((cat, i) => (
                  <View key={cat.name}>
                    <View style={styles.catRow}>
                      <View style={[styles.catIconWrap, { backgroundColor: cat.color + '1A' }]}>
                        <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                      </View>
                      <ThemedText style={styles.catName}>{cat.name}</ThemedText>
                      <View style={styles.catBarWrap}>
                        <View style={[styles.catBarTrack, { backgroundColor: cat.color + '22' }]}>
                          <View style={[styles.catBarFill, { backgroundColor: cat.color, width: `${(cat.total / maxCat) * 100}%` }]} />
                        </View>
                      </View>
                      <ThemedText type="defaultSemiBold" style={styles.catAmt}>{fmt(cat.total)}</ThemedText>
                    </View>
                    {i < categories.length - 1 && <View style={[styles.divider, { backgroundColor: border, marginLeft: 56 }]} />}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* 6-Month trend */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>6-Month Trend</ThemedText>
          <View style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}>
            <View style={styles.trendChart}>
              {trend.map((m) => {
                const incH = m.income > 0  ? Math.max((m.income  / maxTrend) * 72, 4) : 3;
                const expH = m.expense > 0 ? Math.max((m.expense / maxTrend) * 72, 4) : 3;
                return (
                  <View key={m.label} style={styles.trendCol}>
                    <View style={[styles.trendGroup, { height: 72 }]}>
                      <View style={[styles.trendBar, { height: incH, backgroundColor: '#22C55E99' }]} />
                      <View style={[styles.trendBar, { height: expH, backgroundColor: tint + 'AA' }]} />
                    </View>
                    <ThemedText style={styles.trendLabel}>{m.label}</ThemedText>
                  </View>
                );
              })}
            </View>
            <View style={styles.trendLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#22C55E99' }]} />
                <ThemedText style={styles.legendText}>Income</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tint + 'AA' }]} />
                <ThemedText style={styles.legendText}>Expenses</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:   { padding: 20, paddingBottom: 36 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
    padding: 14, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statVal: { fontSize: 13, fontWeight: '700' },
  statLbl: { fontSize: 11, opacity: 0.5 },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  chartCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 18, marginBottom: 24 },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  chartAmt: { fontSize: 20 },
  chartSub: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  noDataLabel: { fontSize: 12, opacity: 0.45 },

  compRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  compDot: { width: 10, height: 10, borderRadius: 5 },
  compLabel: { width: 62, fontSize: 13 },
  compBarWrap: { flex: 1 },
  compBarTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  compBarFill: { height: 10, borderRadius: 5 },
  compAmt: { fontSize: 13, width: 46, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, marginTop: 10 },
  savingsText: { fontSize: 12, fontWeight: '500', flex: 1 },

  catCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', marginBottom: 24 },
  catRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  catIconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 13, width: 100 },
  catBarWrap: { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: 7, borderRadius: 4 },
  catAmt: { fontSize: 13, width: 68, textAlign: 'right' },

  trendChart:  { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 10 },
  trendCol:    { flex: 1, alignItems: 'center', gap: 6 },
  trendGroup:  { flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%', justifyContent: 'center' },
  trendBar:    { width: 9, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  trendLabel:  { fontSize: 9, opacity: 0.55 },
  trendLegend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendText:  { fontSize: 12, opacity: 0.65 },
});