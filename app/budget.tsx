import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AddBudgetModal from '@/components/add-budget-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgets } from '@/hooks/use-budgets';
import { useCurrency } from '@/context/currency-context';

const BUDGET_COLOR = '#F59E0B';

export default function BudgetScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const tint   = Colors[colorScheme].tint;
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const { budgets, loading, refetch } = useBudgets();
  const { fmt } = useCurrency();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ThemedView style={s.container}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={tint} />
        </Pressable>
        <ThemedText type="defaultSemiBold" style={s.headerTitle}>Budgets</ThemedText>
        <Pressable
          onPress={() => setShowAdd(true)}
          style={[s.newBtn, { backgroundColor: BUDGET_COLOR + '1A' }]}>
          <Ionicons name="add" size={17} color={BUDGET_COLOR} />
          <ThemedText lightColor={BUDGET_COLOR} darkColor={BUDGET_COLOR} style={s.newBtnText}>
            New
          </ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={BUDGET_COLOR} />
        </View>
      ) : budgets.length === 0 ? (
        <View style={s.emptyWrap}>
          <Ionicons name="wallet-outline" size={54} color={BUDGET_COLOR + '55'} />
          <ThemedText type="defaultSemiBold" style={s.emptyTitle}>No budgets yet</ThemedText>
          <ThemedText style={s.emptySub}>
            Set spending limits for your categories to track where your money goes.
          </ThemedText>
          <Pressable
            onPress={() => setShowAdd(true)}
            style={[s.emptyBtn, { backgroundColor: BUDGET_COLOR }]}>
            <Ionicons name="add" size={18} color="#fff" />
            <ThemedText lightColor="#fff" darkColor="#fff" style={s.emptyBtnText}>
              Set First Budget
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <ThemedText style={s.monthLabel}>
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </ThemedText>

          {budgets.map((budget) => {
            const limit = Number(budget.amount);
            const pct   = limit > 0 ? budget.spent / limit : 0;
            const over  = pct > 1;
            const barColor = over ? '#EF4444' : pct > 0.75 ? '#F97316' : budget.category?.color ?? tint;
            const remaining = limit - budget.spent;

            return (
              <View key={budget.id} style={[s.card, { backgroundColor: card, borderColor: border }]}>
                {/* Top row */}
                <View style={s.cardTop}>
                  <View style={[s.iconWrap, { backgroundColor: (budget.category?.color ?? tint) + '1A' }]}>
                    <Ionicons
                      name={(budget.category?.icon ?? 'ellipse-outline') as any}
                      size={20}
                      color={budget.category?.color ?? tint}
                    />
                  </View>
                  <View style={s.cardMid}>
                    <ThemedText type="defaultSemiBold" style={s.catName}>
                      {budget.category?.name ?? 'Unknown'}
                    </ThemedText>
                    <ThemedText style={s.periodTag}>
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                    </ThemedText>
                  </View>
                  <View style={s.amtCol}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[s.spentAmt, over && { color: '#EF4444' }]}>
                      {fmt(budget.spent)}
                    </ThemedText>
                    <ThemedText style={s.limitAmt}>of {fmt(limit)}</ThemedText>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[s.barTrack, { backgroundColor: barColor + '22' }]}>
                  <View
                    style={[
                      s.barFill,
                      { backgroundColor: barColor, width: `${Math.min(pct * 100, 100)}%` },
                    ]}
                  />
                </View>

                {/* Footer */}
                <View style={s.cardFooter}>
                  <ThemedText style={[s.pctText, { color: barColor }]}>
                    {over
                      ? `${Math.round(pct * 100)}% — over budget`
                      : `${Math.round(pct * 100)}% used`}
                  </ThemedText>
                  <ThemedText style={s.remainText}>
                    {over
                      ? `${fmt(Math.abs(remaining))} over`
                      : `${fmt(remaining)} left`}
                  </ThemedText>
                </View>
              </View>
            );
          })}

          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => [
              s.addMoreBtn,
              { borderColor: BUDGET_COLOR, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="add-circle-outline" size={18} color={BUDGET_COLOR} />
            <ThemedText lightColor={BUDGET_COLOR} darkColor={BUDGET_COLOR} style={s.addMoreText}>
              Add Another Budget
            </ThemedText>
          </Pressable>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <AddBudgetModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={refetch}
      />
    </ThemedView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:    { padding: 4 },
  headerTitle: { fontSize: 17 },
  newBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 13, borderRadius: 20 },
  newBtnText: { fontSize: 14, fontWeight: '600' },

  emptyWrap:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 36, gap: 10 },
  emptyTitle:   { fontSize: 18, marginTop: 8 },
  emptySub:     { fontSize: 14, opacity: 0.5, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnText: { fontSize: 15, fontWeight: '600' },

  content:    { padding: 18, paddingBottom: 16 },
  monthLabel: { fontSize: 12, opacity: 0.42, marginBottom: 18, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 },

  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 14,
  },
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardMid:  { flex: 1 },
  catName:  { fontSize: 15, marginBottom: 2 },
  periodTag: { fontSize: 11, opacity: 0.42 },
  amtCol:   { alignItems: 'flex-end' },
  spentAmt: { fontSize: 15 },
  limitAmt: { fontSize: 11, opacity: 0.42 },

  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  barFill:  { height: 8, borderRadius: 4 },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between' },
  pctText:     { fontSize: 12, fontWeight: '600' },
  remainText:  { fontSize: 12, opacity: 0.45 },

  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    marginTop: 4,
  },
  addMoreText: { fontSize: 14, fontWeight: '600' },
});
