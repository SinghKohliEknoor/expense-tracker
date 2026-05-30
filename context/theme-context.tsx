import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

type ThemeContextType = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  colorScheme: ColorScheme;
};

const ThemeContext = createContext<ThemeContextType>({
  preference: 'system',
  setPreference: () => {},
  colorScheme: 'light',
});

const PREF_KEY = 'theme_preference';

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const systemScheme = (useSystemColorScheme() ?? 'light') as ColorScheme;
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then(v => {
      if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v);
    });
  }, []);

  function setPreference(p: ThemePreference) {
    setPreferenceState(p);
    AsyncStorage.setItem(PREF_KEY, p);
  }

  const colorScheme: ColorScheme = preference === 'system' ? systemScheme : preference;

  return (
    <ThemeContext.Provider value={{ preference, setPreference, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}