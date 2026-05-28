import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category, CategoryType } from '@/types/database';
import { useAuth } from './use-auth';

export function useCategories(type?: CategoryType) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    let q = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    if (type) q = q.eq('type', type);
    const { data } = await q;
    setCategories(data ?? []);
    setLoading(false);
  }, [user?.id, type]);

  useEffect(() => { load(); }, [load]);

  return { categories, loading, refetch: load };
}
