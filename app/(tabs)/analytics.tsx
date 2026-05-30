import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

type Period = 'week' | 'month' | 'year' | 'custom';

function dateFromString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatShort(str: string): string {
  return dateFromString(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getPeriodRange(
  p: Period,
  customStart: string,
  customEnd: string,
): { startDate: string; endDate: string } {
  if (p === 'custom') return { startDate: customStart, endDate: customEnd };
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
  customStart: string,
  customEnd: string,
): { labels: string[]; values: number[] } {
  const expenses = txs.filter((t) => t.type === 'expense');

  if (period === 'week') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = new Array(7).fill(0);
    expenses.forEach((tx) => {
      const day = new Date(tx.date + 'T00:00:00').getDay();
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

  if (period === 'year') {
    const values = new Array(12).fill(0);
    expenses.forEach((tx) => {
      values[new Date(tx.date + 'T00:00:00').getMonth()] += Number(tx.amount);
    });
    return { labels: MONTH_LABELS.map((l) => l.slice(0, 3)), values };
  }

  // custom — auto-bucket by range length
  const start = dateFromString(customStart);
  const end   = dateFromString(customEnd);
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (diffDays <= 14) {
    // Daily buckets
    const labels: string[] = [];
    const values = new Array(diffDays).fill(0);
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      labels.push(String(d.getDate()));
    }
    expenses.forEach((tx) => {
      const idx = Math.round((dateFromString(tx.date).getTime() - start.getTime()) / 86400000);
      if (idx >= 0 && idx < diffDays) values[idx] += Number(tx.amount);
    });
    return { labels, values };
  }

  if (diffDays <= 84) {
    // Weekly buckets
    const weekCount = Math.ceil(diffDays / 7);
    const labels = Array.from({ length: weekCount }, (_, i) => `W${i + 1}`);
    const values = new Array(weekCount).fill(0);
    expenses.forEach((tx) => {
      const offset = Math.round((dateFromString(tx.date).getTime() - start.getTime()) / 86400000);
      const idx = Math.min(Math.floor(offset / 7), weekCount - 1);
      if (idx >= 0) values[idx] += Number(tx.amount);
    });
    return { labels, values };
  }

  // Monthly buckets
  const monthMap = new Map<string, number>();
  const monthLabels: string[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, 0);
    monthLabels.push(MONTH_LABELS[cursor.getMonth()].slice(0, 3));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  expenses.forEach((tx) => {
    const key = tx.date.slice(0, 7);
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + Number(tx.amount));
  });
  return { labels: monthLabels, values: Array.from(monthMap.values()) };
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
  const options: { key: Period; label: string }[] = [
    { key: 'week',   label: 'Week' },
    { key: 'month',  label: 'Month' },
    { key: 'year',   label: 'Year' },
    { key: 'custom', label: 'Custom' },
  ];
  return (
    <View style={[tog.wrap, { backgroundColor: card, borderColor: border }]}>
      {options.map(({ key, label }) => (
        <Pressable
          key={key}
          style={[tog.btn, value === key && { backgroundColor: tint }]}
          onPress={() => onChange(key)}>
          <ThemedText
            lightColor={value === key ? '#fff' : undefined}
            darkColor={value === key ? '#fff' : undefined}
            style={[tog.label, value === key && { fontWeight: '700' }]}>
            {label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
const tog = StyleSheet.create({
  wrap:  { flexDirection: 'row', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 4, marginBottom: 14 },
  btn:   { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '500' },
});

function CustomDateRow({
  startDate, endDate,
  onChangeStart, onChangeEnd,
  tint, border, bg, icon: iconColor, text: textColor,
  colorScheme,
}: {
  startDate: string; endDate: string;
  onChangeStart: (d: string) => void; onChangeEnd: (d: string) => void;
  tint: string; border: string; bg: string; icon: string; text: string;
  colorScheme: 'light' | 'dark';
}) {
  const [showFrom, setShowFrom] = useState(false);
  const [showTo,   setShowTo]   = useState(false);

  return (
    <View style={cdr.wrap}>
      {/* From */}
      <View style={cdr.part}>
        <ThemedText style={cdr.partLabel}>From</ThemedText>
        <Pressable
          style={[cdr.trigger, { borderColor: border, backgroundColor: bg }]}
          onPress={() => { setShowFrom(p => !p); setShowTo(false); }}>
          <Ionicons name="calendar-outline" size={14} color={tint} />
          <ThemedText style={[cdr.triggerText, { color: textColor }]}>{formatShort(startDate)}</ThemedText>
        </Pressable>
      </View>

      <View style={[cdr.sep, { backgroundColor: border }]} />

      {/* To */}
      <View style={cdr.part}>
        <ThemedText style={cdr.partLabel}>To</ThemedText>
        <Pressable
          style={[cdr.trigger, { borderColor: border, backgroundColor: bg }]}
          onPress={() => { setShowTo(p => !p); setShowFrom(false); }}>
          <Ionicons name="calendar-outline" size={14} color={tint} />
          <ThemedText style={[cdr.triggerText, { color: textColor }]}>{formatShort(endDate)}</ThemedText>
        </Pressable>
      </View>

      {/* From pickers */}
      {showFrom && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateFromString(startDate)}
          mode="date"
          display="default"
          maximumDate={dateFromString(endDate)}
          onChange={(_e, d) => { setShowFrom(false); if (d) onChangeStart(dateToString(d)); }}
        />
      )}
      {showFrom && Platform.OS === 'ios' && (
        <DateTimePicker
          value={dateFromString(startDate)}
          mode="date"
          display="inline"
          maximumDate={dateFromString(endDate)}
          accentColor={tint}
          themeVariant={colorScheme}
          onChange={(_e, d) => { if (d) onChangeStart(dateToString(d)); }}
          style={cdr.iosPicker}
        />
      )}

      {/* To pickers */}
      {showTo && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateFromString(endDate)}
          mode="date"
          display="default"
          minimumDate={dateFromString(startDate)}
          maximumDate={new Date()}
          onChange={(_e, d) => { setShowTo(false); if (d) onChangeEnd(dateToString(d)); }}
        />
      )}
      {showTo && Platform.OS === 'ios' && (
        <DateTimePicker
          value={dateFromString(endDate)}
          mode="date"
          display="inline"
          minimumDate={dateFromString(startDate)}
          maximumDate={new Date()}
          accentColor={tint}
          themeVariant={colorScheme}
          onChange={(_e, d) => { if (d) onChangeEnd(dateToString(d)); }}
          style={cdr.iosPicker}
        />
      )}
    </View>
  );
}
const cdr = StyleSheet.create({
  wrap:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 },
  part:        { flex: 1 },
  partLabel:   { fontSize: 11, opacity: 0.48, marginBottom: 6 },
  trigger:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 },
  triggerText: { flex: 1, fontSize: 12 },
  sep:         { width: StyleSheet.hairlineWidth, height: 36, marginTop: 22 },
  iosPicker:   { marginBottom: 8, marginHorizontal: -8 },
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
  const tint   = Colors[colorScheme].tint;
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;
  const bg     = Colors[colorScheme].background;
  const icon   = Colors[colorScheme].icon;
  const text   = Colors[colorScheme].text;

  const { currency, fmt } = useCurrency();
  const [period,      setPeriod]      = useState<Period>('month');
  const [customStart, setCustomStart] = useState<string>(startOfMonth());
  const [customEnd,   setCustomEnd]   = useState<string>(today());

  const { startDate, endDate } = getPeriodRange(period, customStart, customEnd);

  const { transactions: periodTx, loading: loadingPeriod } = useTransactions({ startDate, endDate });
  const trendStart = nMonthsAgo(6);
  const { transactions: trendTx, loading: loadingTrend } = useTransactions({ startDate: trendStart });

  const loading = loadingPeriod || loadingTrend;

  const barData    = useMemo(() => buildBarData(periodTx, period, customStart, customEnd), [periodTx, period, customStart, customEnd]);
  const categories = useMemo(() => buildCategoryBreakdown(periodTx), [periodTx]);
  const trend      = useMemo(() => buildTrend(trendTx), [trendTx]);

  const periodIncome   = useMemo(() => periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [periodTx]);
  const periodExpenses = useMemo(() => periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [periodTx]);
  const savings        = Math.max(0, periodIncome - periodExpenses);
  const savingsPct     = periodIncome > 0 ? Math.round((savings / periodIncome) * 100) : 0;

  const maxCat   = categories[0]?.total ?? 1;
  const maxTrend = Math.max(...trend.map((m) => Math.max(m.income, m.expense)), 1);

  const chartSubLabel = period === 'custom'
    ? `${formatShort(customStart)} – ${formatShort(customEnd)}`
    : 'total expenses';

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={tint} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PeriodToggle value={period} onChange={setPeriod} tint={tint} card={card} border={border} />

          {period === 'custom' && (
            <CustomDateRow
              startDate={customStart}
              endDate={customEnd}
              onChangeStart={setCustomStart}
              onChangeEnd={setCustomEnd}
              tint={tint}
              border={border}
              bg={bg}
              icon={icon}
              text={text}
              colorScheme={colorScheme}
            />
          )}

          {/* Stat cards */}
          <View style={styles.statsRow}>
            {[
              { icon: 'wallet-outline' as const,      color: '#EF4444', value: fmt(periodExpenses), label: 'Spent' },
              { icon: 'trending-up-outline' as const, color: '#22C55E', value: fmt(periodIncome),   label: 'Earned' },
              { icon: 'leaf-outline' as const,        color: tint,      value: `${savingsPct}%`,    label: 'Saved' },
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
                <ThemedText style={styles.chartSub}>{chartSubLabel}</ThemedText>
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

  chartCard:   { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 18, marginBottom: 24 },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  chartAmt:    { fontSize: 20 },
  chartSub:    { fontSize: 12, opacity: 0.5, marginTop: 2 },
  noDataLabel: { fontSize: 12, opacity: 0.45 },

  compRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  compDot:      { width: 10, height: 10, borderRadius: 5 },
  compLabel:    { width: 62, fontSize: 13 },
  compBarWrap:  { flex: 1 },
  compBarTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  compBarFill:  { height: 10, borderRadius: 5 },
  compAmt:      { fontSize: 13, width: 46, textAlign: 'right' },
  divider:      { height: StyleSheet.hairlineWidth },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, marginTop: 10 },
  savingsText:  { fontSize: 12, fontWeight: '500', flex: 1 },

  catCard:     { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', marginBottom: 24 },
  catRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  catIconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  catName:     { fontSize: 13, width: 100 },
  catBarWrap:  { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill:  { height: 7, borderRadius: 4 },
  catAmt:      { fontSize: 13, width: 68, textAlign: 'right' },

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