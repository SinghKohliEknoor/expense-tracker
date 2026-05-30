import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { sendLocalNotification } from '@/lib/notifications';
import { useAuth } from './use-auth';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';
import { startOfMonth } from '@/utils/dates';

const NOTIFIED_KEY = 'budget_notified';

export function useBudgetAlerts(notificationsEnabled: boolean) {
  const { user } = useAuth();
  const { counter } = useTransactionRefresh();
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the very first render — only fire after a new transaction is saved
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const userId = user?.id;
    if (!userId || !notificationsEnabled) return;

    async function check() {
      const [{ data: budgetRows }, { data: txRows }] = await Promise.all([
        (supabase.from('budgets') as any)
          .select('*, category:categories(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        (supabase.from('transactions') as any)
          .select('amount, category_id')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .gte('date', startOfMonth()),
      ]);

      if (!budgetRows) return;

      const spendMap = new Map<string, number>();
      (txRows ?? []).forEach((tx: { category_id: string | null; amount: number | string }) => {
        if (!tx.category_id) return;
        spendMap.set(tx.category_id, (spendMap.get(tx.category_id) ?? 0) + Number(tx.amount));
      });

      const monthKey = new Date().toISOString().slice(0, 7);
      const stored = await AsyncStorage.getItem(NOTIFIED_KEY);
      const notified: Record<string, boolean> = stored ? JSON.parse(stored) : {};
      let changed = false;

      for (const budget of budgetRows) {
        const spent = spendMap.get(budget.category_id) ?? 0;
        const pct = Number(budget.amount) > 0 ? spent / Number(budget.amount) : 0;
        const catName: string = budget.category?.name ?? 'Budget';

        if (pct >= 1.0) {
          const key = `${budget.id}_${monthKey}_100`;
          if (!notified[key]) {
            await sendLocalNotification(
              '🚨 Budget Exceeded',
              `Your ${catName} budget has been exceeded (${Math.round(pct * 100)}% spent).`,
            );
            notified[key] = true;
            notified[`${budget.id}_${monthKey}_80`] = true;
            changed = true;
          }
        } else if (pct >= 0.8) {
          const key = `${budget.id}_${monthKey}_80`;
          if (!notified[key]) {
            await sendLocalNotification(
              '⚠️ Budget Warning',
              `${catName} is at ${Math.round(pct * 100)}% of your monthly budget.`,
            );
            notified[key] = true;
            changed = true;
          }
        }
      }

      if (changed) {
        await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
      }
    }

    check();
  }, [counter]); // eslint-disable-line react-hooks/exhaustive-deps
}