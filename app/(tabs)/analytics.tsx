import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Mock data ────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year';

const DATA: Record<Period, { labels: string[]; values: number[]; income: number; expenses: number; total: string; avg: string }> = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values:  [1200,  890,  2100,  650,  1850, 3200,  750],
    income: 12000, expenses: 10640, total: '₹10,640', avg: '₹1,520/day',
  },
  month: {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
    values:  [8200, 12400, 4800, 9499, 3200],
    income: 97000, expenses: 38099, total: '₹38,099', avg: '₹1,236/day',
  },
  year: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values:  [18000, 22000, 19500, 25000, 26400, 21000, 0, 0, 0, 0, 0, 0],
    income: 135200, expenses: 131900, total: '₹1,31,900', avg: '₹21,983/mo',
  },
};

const CATEGORIES = [
  { label: 'Food & Dining', amount: 8200, color: '#F59E0B', icon: 'restaurant-outline' as const },
  { label: 'Transport', amount: 6300, color: '#3B82F6', icon: 'car-outline' as const },
  { label: 'Utilities', amount: 5100, color: '#7C3AED', icon: 'flash-outline' as const },
  { label: 'Entertainment', amount: 3800, color: '#EC4899', icon: 'game-controller-outline' as const },
  { label: 'Shopping', amount: 2900, color: '#F97316', icon: 'bag-outline' as const },
  { label: 'Health', amount: 1800, color: '#22C55E', icon: 'heart-outline' as const },
];

const MONTHLY_NET = [
  { label: 'Dec', income: 92000, expense: 71000 },
  { label: 'Jan', income: 95000, expense: 84000 },
  { label: 'Feb', income: 88000, expense: 76000 },
  { label: 'Mar', income: 102000, expense: 89000 },
  { label: 'Apr', income: 110000, expense: 95000 },
  { label: 'May', income: 135200, expense: 38099 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PeriodToggle({
  value,
  onChange,
  tint,
  card,
  border,
}: {
  value: Period;
  onChange: (p: Period) => void;
  tint: string;
  card: string;
  border: string;
}) {
  return (
    <View style={[styles.toggleWrap, { backgroundColor: card, borderColor: border }]}>
      {(['week', 'month', 'year'] as Period[]).map((p) => (
        <Pressable
          key={p}
          style={[styles.toggleBtn, value === p && { backgroundColor: tint }]}
          onPress={() => onChange(p)}>
          <ThemedText
            lightColor={value === p ? '#fff' : undefined}
            darkColor={value === p ? '#fff' : undefined}
            style={[styles.toggleLabel, value === p && styles.toggleLabelActive]}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function BarChart({
  labels,
  values,
  tint,
}: {
  labels: string[];
  values: number[];
  tint: string;
}) {
  const max = Math.max(...values, 1);
  const BAR_MAX_H = 88;
  const peakIdx = values.indexOf(Math.max(...values));

  return (
    <View style={styles.barChart}>
      {values.map((val, i) => {
        const barH = val > 0 ? Math.max((val / max) * BAR_MAX_H, 6) : 3;
        const isPeak = i === peakIdx;
        return (
          <View key={i} style={styles.barCol}>
            {val > 0 && (
              <ThemedText
                style={[styles.barValue, { opacity: isPeak ? 1 : 0 }]}
                lightColor={tint}
                darkColor={tint}>
                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </ThemedText>
            )}
            <View style={[styles.barTrack, { height: BAR_MAX_H }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: barH,
                    backgroundColor: val === 0 ? tint + '18' : isPeak ? tint : tint + '55',
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.barLabel}>{labels[i]}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

function ComparisonBar({
  income,
  expenses,
  tint,
  border,
}: {
  income: number;
  expenses: number;
  tint: string;
  border: string;
}) {
  const total = income + expenses;
  const incomePct = income / total;
  const expensePct = expenses / total;

  return (
    <View style={styles.compSection}>
      <View style={styles.compRow}>
        <View style={[styles.compDot, { backgroundColor: '#22C55E' }]} />
        <ThemedText style={styles.compLabel}>Income</ThemedText>
        <View style={styles.compBarWrap}>
          <View style={[styles.compBar, { backgroundColor: '#22C55E22' }]}>
            <View
              style={[styles.compBarFill, { backgroundColor: '#22C55E', width: `${incomePct * 100}%` }]}
            />
          </View>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.compAmount}>
          ₹{(income / 1000).toFixed(0)}k
        </ThemedText>
      </View>

      <View style={[styles.compDivider, { backgroundColor: border }]} />

      <View style={styles.compRow}>
        <View style={[styles.compDot, { backgroundColor: '#EF4444' }]} />
        <ThemedText style={styles.compLabel}>Expenses</ThemedText>
        <View style={styles.compBarWrap}>
          <View style={[styles.compBar, { backgroundColor: '#EF444422' }]}>
            <View
              style={[styles.compBarFill, { backgroundColor: '#EF4444', width: `${expensePct * 100}%` }]}
            />
          </View>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.compAmount}>
          ₹{(expenses / 1000).toFixed(0)}k
        </ThemedText>
      </View>

      {/* Savings rate */}
      <View style={[styles.savingsRow, { backgroundColor: '#22C55E10', borderRadius: 10, marginTop: 12 }]}>
        <Ionicons name="leaf-outline" size={14} color="#22C55E" />
        <ThemedText lightColor="#22C55E" darkColor="#22C55E" style={styles.savingsText}>
          Saving {Math.max(0, Math.round(((income - expenses) / income) * 100))}% of income —{' '}
          ₹{Math.max(0, income - expenses).toLocaleString()} saved
        </ThemedText>
      </View>
    </View>
  );
}

function CategoryBreakdown({ card, border, tint }: { card: string; border: string; tint: string }) {
  const max = CATEGORIES[0].amount;
  return (
    <View style={[styles.catCard, { backgroundColor: card, borderColor: border }]}>
      {CATEGORIES.map((cat, i) => (
        <View key={cat.label}>
          <View style={styles.catRow}>
            <View style={[styles.catIconWrap, { backgroundColor: cat.color + '1A' }]}>
              <Ionicons name={cat.icon} size={16} color={cat.color} />
            </View>
            <ThemedText style={styles.catLabel}>{cat.label}</ThemedText>
            <View style={styles.catBarWrap}>
              <View style={[styles.catBarTrack, { backgroundColor: cat.color + '22' }]}>
                <View
                  style={[
                    styles.catBarFill,
                    { backgroundColor: cat.color, width: `${(cat.amount / max) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.catAmount}>
              ₹{cat.amount.toLocaleString()}
            </ThemedText>
          </View>
          {i < CATEGORIES.length - 1 && (
            <View style={[styles.divider, { backgroundColor: border, marginLeft: 56 }]} />
          )}
        </View>
      ))}
    </View>
  );
}

function NetWorthTrend({ tint, card, border }: { tint: string; card: string; border: string }) {
  const maxVal = Math.max(...MONTHLY_NET.map((m) => m.income));

  return (
    <View style={[styles.netCard, { backgroundColor: card, borderColor: border }]}>
      {/* Grouped bars */}
      <View style={styles.netChart}>
        {MONTHLY_NET.map((m) => {
          const incH = Math.max((m.income / maxVal) * 80, 4);
          const expH = Math.max((m.expense / maxVal) * 80, 4);
          return (
            <View key={m.label} style={styles.netCol}>
              <View style={[styles.netBarGroup, { height: 80 }]}>
                <View style={[styles.netBar, { height: incH, backgroundColor: '#22C55E99' }]} />
                <View style={[styles.netBar, { height: expH, backgroundColor: tint + 'AA' }]} />
              </View>
              <ThemedText style={styles.netLabel}>{m.label}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.netLegend}>
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
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;
  const [period, setPeriod] = useState<Period>('month');

  const d = DATA[period];
  const savings = Math.max(0, d.income - d.expenses);
  const savingsPct = d.income > 0 ? Math.round((savings / d.income) * 100) : 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period toggle */}
        <PeriodToggle value={period} onChange={setPeriod} tint={tint} card={card} border={border} />

        {/* Summary stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="wallet-outline" size={20} color="#EF4444" />
            <ThemedText style={styles.statValue}>{d.total}</ThemedText>
            <ThemedText style={styles.statSub}>Spent</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="trending-up-outline" size={20} color="#22C55E" />
            <ThemedText style={styles.statValue}>₹{(d.income / 1000).toFixed(0)}k</ThemedText>
            <ThemedText style={styles.statSub}>Earned</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="leaf-outline" size={20} color={tint} />
            <ThemedText style={styles.statValue}>{savingsPct}%</ThemedText>
            <ThemedText style={styles.statSub}>Saved</ThemedText>
          </View>
        </View>

        {/* Spending bar chart */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Spending Overview
        </ThemedText>
        <View style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.chartHeader}>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.chartAmount}>{d.total}</ThemedText>
              <ThemedText style={styles.chartSub}>{d.avg}</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: '#EF444418' }]}>
              <Ionicons name="trending-up" size={13} color="#EF4444" />
              <ThemedText lightColor="#EF4444" darkColor="#EF4444" style={styles.trendText}>
                +12%
              </ThemedText>
            </View>
          </View>
          <BarChart labels={d.labels} values={d.values} tint={tint} />
        </View>

        {/* Income vs Expenses */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Income vs Expenses
        </ThemedText>
        <View style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}>
          <ComparisonBar income={d.income} expenses={d.expenses} tint={tint} border={border} />
        </View>

        {/* Top Categories */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Top Categories
        </ThemedText>
        <CategoryBreakdown card={card} border={border} tint={tint} />

        {/* 6-Month Trend */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          6-Month Trend
        </ThemedText>
        <NetWorthTrend tint={tint} card={card} border={border} />
      </ScrollView>
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },

  // Period toggle
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  toggleLabel: { fontSize: 13, fontWeight: '500' },
  toggleLabelActive: { fontWeight: '700' },

  // Summary stat cards
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 14, fontWeight: '700' },
  statSub: { fontSize: 11, opacity: 0.5 },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  // Chart card container
  chartCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  chartAmount: { fontSize: 22 },
  chartSub: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  trendText: { fontSize: 12, fontWeight: '600' },

  // Bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barValue: { fontSize: 9, fontWeight: '700' },
  barTrack: { justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  barFill: {
    width: '72%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barLabel: { fontSize: 9, opacity: 0.55, textAlign: 'center' },

  // Comparison bars
  compSection: {},
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  compDot: { width: 10, height: 10, borderRadius: 5 },
  compLabel: { width: 60, fontSize: 13 },
  compBarWrap: { flex: 1 },
  compBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  compBarFill: { height: 10, borderRadius: 5 },
  compAmount: { fontSize: 13, width: 44, textAlign: 'right' },
  compDivider: { height: StyleSheet.hairlineWidth },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  savingsText: { fontSize: 12, fontWeight: '500' },

  // Category breakdown
  catCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 24,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catLabel: { fontSize: 13, width: 100 },
  catBarWrap: { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: 7, borderRadius: 4 },
  catAmount: { fontSize: 13, width: 68, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth },

  // Net trend chart
  netCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 8,
  },
  netChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 10,
  },
  netCol: { flex: 1, alignItems: 'center', gap: 6 },
  netBarGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    width: '100%',
    justifyContent: 'center',
  },
  netBar: {
    width: 9,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  netLabel: { fontSize: 9, opacity: 0.55 },
  netLegend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, opacity: 0.65 },
});