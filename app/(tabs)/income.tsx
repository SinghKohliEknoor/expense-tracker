import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const INCOME_COLOR = '#22C55E';

const INCOMES = [
  { id: '1', title: 'Salary', amount: 85000, source: 'Employment', icon: 'briefcase-outline' as const, date: 'May 1' },
  { id: '2', title: 'Freelance Work', amount: 12000, source: 'Freelance', icon: 'laptop-outline' as const, date: 'May 10' },
  { id: '3', title: 'Stock Dividend', amount: 3200, source: 'Investments', icon: 'trending-up-outline' as const, date: 'May 14' },
  { id: '4', title: 'Rental Income', amount: 15000, source: 'Property', icon: 'home-outline' as const, date: 'May 5' },
  { id: '5', title: 'Bonus', amount: 20000, source: 'Employment', icon: 'gift-outline' as const, date: 'May 3' },
];

const SOURCES = [
  { label: 'Employment', amount: 105000, pct: 0.78, color: '#22C55E' },
  { label: 'Property', amount: 15000, pct: 0.11, color: '#3B82F6' },
  { label: 'Freelance', amount: 12000, pct: 0.09, color: '#A78BFA' },
  { label: 'Investments', amount: 3200, pct: 0.02, color: '#F59E0B' },
];

export default function IncomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: INCOME_COLOR }]}>
          <ThemedText
            lightColor="rgba(255,255,255,0.78)"
            darkColor="rgba(255,255,255,0.78)"
            style={styles.summaryLabel}>
            Total Income — May 2026
          </ThemedText>
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.summaryAmount}>
            ₹ 1,35,200
          </ThemedText>
          <View style={styles.changeBadge}>
            <Ionicons name="trending-up" size={13} color="rgba(255,255,255,0.8)" />
            <ThemedText
              lightColor="rgba(255,255,255,0.82)"
              darkColor="rgba(255,255,255,0.82)"
              style={styles.changeText}>
              8% more than last month
            </ThemedText>
          </View>
        </View>

        {/* Add Income CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: INCOME_COLOR, opacity: pressed ? 0.82 : 1 },
          ]}>
          <Ionicons name="add" size={20} color="#fff" />
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.addBtnText}>
            Add Income
          </ThemedText>
        </Pressable>

        {/* Sources Breakdown */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          By Source
        </ThemedText>
        <View style={[styles.sourceCard, { backgroundColor: card, borderColor: border }]}>
          {SOURCES.map((src, i) => (
            <View key={src.label}>
              <View style={styles.sourceRow}>
                <View style={[styles.sourceDot, { backgroundColor: src.color }]} />
                <ThemedText style={styles.sourceName}>{src.label}</ThemedText>
                <View style={styles.barWrap}>
                  <View style={[styles.barTrack, { backgroundColor: src.color + '28' }]}>
                    <View
                      style={[
                        styles.barFill,
                        { backgroundColor: src.color, width: `${src.pct * 100}%` },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.sourceAmount}>
                  ₹{src.amount.toLocaleString()}
                </ThemedText>
              </View>
              {i < SOURCES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: border }]} />
              )}
            </View>
          ))}
        </View>

        {/* All Income */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          All Income
        </ThemedText>
        <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
          {INCOMES.map((tx, i) => (
            <View key={tx.id}>
              <Pressable style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: INCOME_COLOR + '18' }]}>
                  <Ionicons name={tx.icon} size={20} color={INCOME_COLOR} />
                </View>
                <View style={styles.txInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.txTitle}>
                    {tx.title}
                  </ThemedText>
                  <ThemedText style={styles.txMeta}>
                    {tx.source} · {tx.date}
                  </ThemedText>
                </View>
                <ThemedText lightColor={INCOME_COLOR} darkColor={INCOME_COLOR} style={styles.txAmount}>
                  +₹{tx.amount.toLocaleString()}
                </ThemedText>
              </Pressable>
              {i < INCOMES.length - 1 && (
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

  sourceCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 26,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 10,
  },
  sourceDot: { width: 9, height: 9, borderRadius: 5 },
  sourceName: { width: 88, fontSize: 13 },
  barWrap: { flex: 1 },
  barTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  sourceAmount: { fontSize: 13, width: 80, textAlign: 'right' },

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