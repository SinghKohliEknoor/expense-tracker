import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth } from '@/utils/dates';
import { useAuth } from './use-auth';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';

export function useBalance() {
  const { user } = useAuth();
  const { counter } = useTransactionRefresh();
  const [balance, setBalance] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      const [{ data: allTx, error: e1 }, { data: monthTx, error: e2 }] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id),
        supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startOfMonth()),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;

      setBalance(
        (allTx ?? []).reduce(
          (acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
          0,
        ),
      );

      setMonthIncome(
        (monthTx ?? [])
          .filter((t) => t.type === 'income')
          .reduce((a, t) => a + Number(t.amount), 0),
      );

      setMonthExpenses(
        (monthTx ?? [])
          .filter((t) => t.type === 'expense')
          .reduce((a, t) => a + Number(t.amount), 0),
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, counter]);

  useEffect(() => { load(); }, [load]);

  return { balance, monthIncome, monthExpenses, loading, error, refetch: load };
}
