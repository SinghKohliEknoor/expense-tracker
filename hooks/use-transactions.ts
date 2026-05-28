import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoryType, TransactionWithCategory } from '@/types/database';
import { useAuth } from './use-auth';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';

export type TransactionFilter = {
  type?: CategoryType;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

export function useTransactions({
  type,
  startDate,
  endDate,
  limit,
}: TransactionFilter = {}) {
  const { user } = useAuth();
  const { counter } = useTransactionRefresh();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let q = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (type)      q = q.eq('type', type);
    if (startDate) q = q.gte('date', startDate);
    if (endDate)   q = q.lte('date', endDate);
    if (limit)     q = q.limit(limit);

    const { data, error: err } = await q;
    if (err) setError(err.message);
    else setTransactions((data as TransactionWithCategory[]) ?? []);
    setLoading(false);
  }, [user?.id, type, startDate, endDate, limit, counter]);

  useEffect(() => { load(); }, [load]);

  return { transactions, loading, error, refetch: load };
}
