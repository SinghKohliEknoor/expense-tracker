import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TRANSACTIONS = [
  { id: '1', title: 'Groceries', amount: -1200, icon: 'cart-outline' as const, date: 'Today' },
  { id: '2', title: 'Salary', amount: 85000, icon: 'briefcase-outline' as const, date: 'Yesterday' },
  { id: '3', title: 'Electricity Bill', amount: -2400, icon: 'flash-outline' as const, date: 'May 20' },
  { id: '4', title: 'Freelance Work', amount: 12000, icon: 'laptop-outline' as const, date: 'May 19' },
];

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Add\nExpense', color: '#EF4444' },
  { icon: 'trending-up-outline' as const, label: 'Add\nIncome', color: '#22C55E' },
  { icon: 'bar-chart-outline' as const, label: 'Reports', color: '#7C3AED' },
  { icon: 'wallet-outline' as const, label: 'Budget', color: '#F59E0B' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetRow}>
          <View>
            <ThemedText style={styles.greetSub}>Good morning,</ThemedText>
            <ThemedText type="subtitle" style={styles.greetName}>
              John Doe 👋
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
            ₹ 1,23,400.00
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
                  ₹ 97,000
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
                  ₹ 26,400
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
        <View style={[styles.txCard, { backgroundColor: card, borderColor: border }]}>
          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.txRow,
                  pressed && { backgroundColor: tint + '0A' },
                ]}>
                <View style={[styles.txIcon, { backgroundColor: tint + '18' }]}>
                  <Ionicons name={tx.icon} size={20} color={tint} />
                </View>
                <View style={styles.txInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.txTitle}>
                    {tx.title}
                  </ThemedText>
                  <ThemedText style={styles.txDate}>{tx.date}</ThemedText>
                </View>
                <ThemedText
                  lightColor={tx.amount > 0 ? '#22C55E' : '#EF4444'}
                  darkColor={tx.amount > 0 ? '#22C55E' : '#EF4444'}
                  style={styles.txAmount}>
                  {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                </ThemedText>
              </Pressable>
              {i < TRANSACTIONS.length - 1 && (
                <View style={[styles.txDivider, { backgroundColor: border }]} />
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

  greetRow: { marginBottom: 22 },
  greetSub: { fontSize: 13, opacity: 0.55, marginBottom: 2 },
  greetName: { fontSize: 22 },

  balanceCard: {
    borderRadius: 22,
    padding: 24,
    marginBottom: 26,
  },
  balanceLabel: { fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 34, fontWeight: '800', marginBottom: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, marginBottom: 1 },
  statAmount: { fontSize: 15, fontWeight: '600' },
  statDivider: { width: 1, height: 34, marginHorizontal: 14 },

  sectionTitle: { fontSize: 16, marginBottom: 12 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500', lineHeight: 15 },

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
  txDate: { fontSize: 12, opacity: 0.48 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  txDivider: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
});