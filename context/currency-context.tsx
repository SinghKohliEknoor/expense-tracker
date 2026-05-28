import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CURRENCIES, type CurrencyInfo } from '@/constants/currencies';

const STORAGE_KEY = '@currency_code';

type CurrencyContextValue = {
  currency: CurrencyInfo;
  setCurrency: (c: CurrencyInfo) => Promise<void>;
  fmt: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: CURRENCIES[0],
  setCurrency: async () => {},
  fmt: (amount) => CURRENCIES[0].symbol + Math.abs(amount).toLocaleString(CURRENCIES[0].locale),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCIES[0]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((code) => {
      if (code) {
        const found = CURRENCIES.find((c) => c.code === code);
        if (found) setCurrencyState(found);
      }
    });
  }, []);

  const setCurrency = useCallback(async (c: CurrencyInfo) => {
    setCurrencyState(c);
    await AsyncStorage.setItem(STORAGE_KEY, c.code);
  }, []);

  const fmt = useCallback(
    (amount: number) =>
      currency.symbol + Math.abs(amount).toLocaleString(currency.locale),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
