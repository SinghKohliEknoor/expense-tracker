import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const EXPENSE_COLOR = '#EF4444';

const EXPENSES = [
  { id: '1', title: 'Groceries', amount: 1200, category: 'Food', icon: 'cart-outline' as const, date: 'Today' },
  { id: '2', title: 'Electricity Bill', amount: 2400, category: 'Utilities', icon: 'flash-outline' as const, date: 'May 20' },
  { id: '3', title: 'Netflix', amount: 649, category: 'Entertainment', icon: 'play-circle-outline' as const, date: 'May 18' },
  { id: '4', title: 'Petrol', amount: 3000, category: 'Transport', icon: 'car-outline' as const, date: 'May 16' },
  { id: '5', title: 'Restaurant', amount: 1850, category: 'Food', icon: 'restaurant-outline' as const, date: 'May 15' },
];

const CATEGORIES = [
  { label: 'Food', amount: 3050, pct: 0.44, color: '#F59E0B' },
  { label: 'Transport', amount: 3000, pct: 0.27, color: '#3B82F6' },
  { label: 'Utilities', amount: 2400, pct: 0.20, color: '#8B5CF6' },
  { label: 'Entertainment', amount: 649, pct: 0.06, color: '#EC4899' },
  { label: 'Others', amount: 401, pct: 0.03, color: '#6B7280' },
];

export default function ExpenseScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: EXPENSE_COLOR }]}>
          <ThemedText
            lightColor="rgba(255,255,255,0.78)"
            darkColor="rgba(255,255,255,0.78)"
            style={styles.summaryLabel}>
            Total Expenses — May 2026
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.summaryAmount}>
            ₹ 9,499
          </ThemedText>
          <View style={styles.changeBadge}>
            <Ionicons name="trending-up" size={13} color="#FCA5A5" />
            <ThemedText lightColor="#FCA5A5" darkColor="#FCA5A5" style={styles.changeText}>
              12% more than last month
            </ThemedText>
          </View>
        </View>

        {/* Add Expense CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: EXPENSE_COLOR, opacity: pressed ? 0.82 : 1 },
          ]}>
          <Ionicons name="add" size={20} color="#fff" />
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.addBtnText}>
            Add Expense
          </ThemedText>
        </Pressable>

        {/* Category Breakdown */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          By Category
        </ThemedText>
        <View style={[styles.catCard, { backgroundColor: card, borderColor: border }]}>
          {CATEGORIES.map((cat, i) => (
            <View key={cat.label}>
              <View style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <ThemedText style={styles.catName}>{cat.label}</ThemedText>
                <View style={styles.catBarWrap}>
                  <View style={[styles.catBarTrack, { backgroundColor: cat.color + '28' }]}>
                    <View
                      style={[
                        styles.catBarFill,
                        { backgroundColor: cat.color, width: `${cat.pct * 100}%` },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.catAmount}>
                  ₹{cat.amount.toLocaleString()}
                </ThemedText>
              </View>
              {i < CATEGORIES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: border }]} />
              )}
            </View>
          ))}
        </View>

        {/* All Expenses */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          All Expenses
        </ThemedText>
        <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
          {EXPENSES.map((tx, i) => (
            <View key={tx.id}>
              <Pressable style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: EXPENSE_COLOR + '18' }]}>
                  <Ionicons name={tx.icon} size={20} color={EXPENSE_COLOR} />
                </View>
                <View style={styles.txInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.txTitle}>
                    {tx.title}
                  </ThemedText>
                  <ThemedText style={styles.txMeta}>
                    {tx.category} · {tx.date}
                  </ThemedText>
                </View>
                <ThemedText lightColor={EXPENSE_COLOR} darkColor={EXPENSE_COLOR} style={styles.txAmount}>
                  -₹{tx.amount.toLocaleString()}
                </ThemedText>
              </Pressable>
              {i < EXPENSES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: border, marginLeft: 70 }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },

  summaryCard: { borderRadius: 22, padding: 24, marginBottom: 14 },
  summaryLabel: { fontSize: 13, marginBottom: 6 },
  summaryAmount: { fontSize: 34, fontWeight: '800', marginBottom: 8 },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  changeText: { fontSize: 12 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 26,
  },
  addBtnText: { fontSize: 15, fontWeight: '600' },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  catCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 26,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 10,
  },
  catDot: { width: 9, height: 9, borderRadius: 5 },
  catName: { width: 88, fontSize: 13 },
  catBarWrap: { flex: 1 },
  catBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: 7, borderRadius: 4 },
  catAmount: { fontSize: 13, width: 72, textAlign: 'right' },

  txCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, marginBottom: 2 },
  txMeta: { fontSize: 12, opacity: 0.5 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
});