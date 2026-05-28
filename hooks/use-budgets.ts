import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BudgetWithCategory } from '@/types/database';
import { startOfMonth } from '@/utils/dates';
import { useAuth } from './use-auth';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';

export type BudgetWithSpend = BudgetWithCategory & { spent: number };

export function useBudgets() {
  const { user } = useAuth();
  const { counter } = useTransactionRefresh();
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const [{ data: budgetRows }, { data: txRows }] = await Promise.all([
      supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startOfMonth()),
    ]);

    const spendMap = new Map<string, number>();
    (txRows ?? []).forEach((tx) => {
      if (!tx.category_id) return;
      spendMap.set(tx.category_id, (spendMap.get(tx.category_id) ?? 0) + Number(tx.amount));
    });

    setBudgets(
      (budgetRows ?? []).map((b) => ({
        ...(b as BudgetWithCategory),
        spent: spendMap.get(b.category_id) ?? 0,
      })),
    );
    setLoading(false);
  }, [user?.id, counter]);

  useEffect(() => { load(); }, [load]);

  return { budgets, loading, refetch: load };
}
