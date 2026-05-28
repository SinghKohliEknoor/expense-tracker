import { createContext, useCallback, useContext, useState } from 'react';

type ContextValue = {
  counter: number;
  invalidate: () => void;
};

const TransactionRefreshContext = createContext<ContextValue>({
  counter: 0,
  invalidate: () => {},
});

export function TransactionRefreshProvider({ children }: { children: React.ReactNode }) {
  const [counter, setCounter] = useState(0);
  const invalidate = useCallback(() => setCounter((n) => n + 1), []);
  return (
    <TransactionRefreshContext.Provider value={{ counter, invalidate }}>
      {children}
    </TransactionRefreshContext.Provider>
  );
}

export function useTransactionRefresh() {
  return useContext(TransactionRefreshContext);
}
