import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AddTransactionModal from '@/components/add-transaction-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import { formatDisplayDate } from '@/utils/dates';
import { useCurrency } from '@/context/currency-context';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const tint   = Colors[colorScheme].tint;
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const { user } = useAuth();
  const { fmt } = useCurrency();
  const { balance, monthIncome, monthExpenses, loading: loadingBalance, refetch: refetchBalance } = useBalance();
  const { transactions: recent, loading: loadingTx, refetch: refetchTx } = useTransactions({ limit: 5 });

  const [showExpense, setShowExpense] = useState(false);
  const [showIncome, setShowIncome]   = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there';

  const loading = loadingBalance || loadingTx;

  function handleSaved() {
    refetchBalance();
    refetchTx();
  }

  const QUICK_ACTIONS = [
    { icon: 'add-circle-outline' as const, label: 'Add\nExpense', color: '#EF4444', onPress: () => setShowExpense(true) },
    { icon: 'trending-up-outline' as const, label: 'Add\nIncome',  color: '#22C55E', onPress: () => setShowIncome(true) },
    { icon: 'bar-chart-outline' as const,  label: 'Reports',       color: '#7C3AED', onPress: () => router.push('/(tabs)/analytics') },
    { icon: 'wallet-outline' as const,     label: 'Budget',        color: '#F59E0B', onPress: () => router.push('/budget') },
  ];

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Greeting */}
          <View style={styles.greetRow}>
            <View>
              <ThemedText style={styles.greetSub}>Good morning,</ThemedText>
              <ThemedText type="subtitle" style={styles.greetName}>
                {firstName} 👋
              </ThemedText>
            </View>
          </View>

          {/* Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: tint }]}>
            <ThemedText
              lightColor="rgba(255,255,255,0.78)"
              darkColor="rgba(255,255,255,0.78)"
              style={styles.balanceLabel}>
              Total Balance
            </ThemedText>
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.balanceAmount}>
              {fmt(balance)}
            </ThemedText>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="arrow-down-outline" size={13} color="#22C55E" />
                </View>
                <View>
                  <ThemedText
                    lightColor="rgba(255,255,255,0.68)"
                    darkColor="rgba(255,255,255,0.68)"
                    style={styles.statLabel}>
                    Income
                  </ThemedText>
                  <ThemedText lightColor="#fff" darkColor="#fff" style={styles.statAmount}>
                    {fmt(monthIncome)}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.28)' }]} />

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="arrow-up-outline" size={13} color="#F87171" />
                </View>
                <View>
                  <ThemedText
                    lightColor="rgba(255,255,255,0.68)"
                    darkColor="rgba(255,255,255,0.68)"
                    style={styles.statLabel}>
                    Expenses
                  </ThemedText>
                  <ThemedText lightColor="#fff" darkColor="#fff" style={styles.statAmount}>
                    {fmt(monthExpenses)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: card, opacity: pressed ? 0.72 : 1 },
                ]}>
                <View style={[styles.actionIconWrap, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Recent Transactions */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Recent Transactions
          </ThemedText>

          {recent.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="receipt-outline" size={36} color={tint + '66'} />
              <ThemedText style={styles.emptyText}>No transactions yet.</ThemedText>
              <ThemedText style={styles.emptySubText}>Add your first expense or income!</ThemedText>
            </View>
          ) : (
            <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
              {recent.map((tx, i) => (
                <View key={tx.id}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.txRow,
                      pressed && { backgroundColor: tint + '0A' },
                    ]}>
                    <View
                      style={[
                        styles.txIcon,
                        { backgroundColor: (tx.category?.color ?? tint) + '18' },
                      ]}>
                      <Ionicons
                        name={(tx.category?.icon ?? 'ellipse-outline') as any}
                        size={20}
                        color={tx.category?.color ?? tint}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.txTitle}>
                        {tx.category?.name ?? 'Uncategorised'}
                      </ThemedText>
                      <ThemedText style={styles.txDate}>
                        {tx.note ? `${tx.note} · ` : ''}{formatDisplayDate(tx.date)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      lightColor={tx.type === 'income' ? '#22C55E' : '#EF4444'}
                      darkColor={tx.type === 'income' ? '#22C55E' : '#EF4444'}
                      style={styles.txAmount}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(Number(tx.amount))}
                    </ThemedText>
                  </Pressable>
                  {i < recent.length - 1 && (
                    <View style={[styles.txDivider, { backgroundColor: border }]} />
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <AddTransactionModal
        visible={showExpense}
        type="expense"
        onClose={() => setShowExpense(false)}
        onSaved={handleSaved}
      />
      <AddTransactionModal
        visible={showIncome}
        type="income"
        onClose={() => setShowIncome(false)}
        onSaved={handleSaved}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 32 },

  greetRow: { marginBottom: 22 },
  greetSub: { fontSize: 13, opacity: 0.55, marginBottom: 2 },
  greetName: { fontSize: 22 },

  balanceCard: { borderRadius: 22, padding: 24, marginBottom: 26 },
  balanceLabel: { fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 34, fontWeight: '800', marginBottom: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },
  statLabel: { fontSize: 11, marginBottom: 1 },
  statAmount: { fontSize: 15, fontWeight: '600' },
  statDivider: { width: 1, height: 34, marginHorizontal: 14 },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  actionBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  actionIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500', lineHeight: 15 },

  emptyCard: {
    borderRadius: 18, borderWidth: StyleSheet.hairlineWidth,
    padding: 36, alignItems: 'center', gap: 8,
  },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  emptySubText: { fontSize: 13, opacity: 0.5 },

  txCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, marginBottom: 2 },
  txDate: { fontSize: 12, opacity: 0.48 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  txDivider: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
});
