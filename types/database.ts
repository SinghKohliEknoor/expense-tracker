export type CategoryType = 'expense' | 'income';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

// ─── Row types ────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_default: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: CategoryType;
  category_id: string | null;
  note: string | null;
  date: string;
  created_at: string;
};

export type TransactionWithCategory = Transaction & {
  category: Category | null;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  created_at: string;
};

export type BudgetWithCategory = Budget & {
  category: Category | null;
};

// ─── Insert types (omit server-generated fields) ──────────────────────────────

export type TransactionInsert = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
export type CategoryInsert = Omit<Category, 'id' | 'user_id' | 'created_at'>;
export type BudgetInsert = Omit<Budget, 'id' | 'user_id' | 'created_at'>;

// ─── Supabase Database schema type (used by the client for type inference) ────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at'>;
        Update: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
};