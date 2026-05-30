import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeContextProvider } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CurrencyProvider } from '@/context/currency-context';
import { TransactionRefreshProvider } from '@/context/transaction-refresh-context';
import { NotificationPrefsProvider, useNotificationPrefs } from '@/context/notification-prefs-context';
import { useBudgetAlerts } from '@/hooks/use-budget-alerts';
import { requestNotificationPermission } from '@/lib/notifications';

export const unstable_settings = {
  anchor: 'login',
};

function BudgetAlertsRunner() {
  const { enabled } = useNotificationPrefs();
  useBudgetAlerts(enabled);
  return null;
}

function ThemedApp() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <CurrencyProvider>
    <NotificationPrefsProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BudgetAlertsRunner />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
    </NotificationPrefsProvider>
    </CurrencyProvider>
  );
}

export default function RootLayout() {
  return (
    <TransactionRefreshProvider>
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
    </TransactionRefreshProvider>
  );
}