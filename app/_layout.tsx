import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { CurrencyProvider } from '@/context/currency-context';
import { TransactionRefreshProvider } from '@/context/transaction-refresh-context';

export const unstable_settings = {
  anchor: 'index',
};

function AuthGuard() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inTabs = segments[0] === '(tabs)';

    if (session && !inTabs) {
      // Signed in but on auth screen → go to app
      router.replace('/(tabs)');
    } else if (!session && inTabs) {
      // Signed out but still inside tabs → back to sign-in
      router.replace('/');
    }
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TransactionRefreshProvider>
    <CurrencyProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </CurrencyProvider>
    </TransactionRefreshProvider>
  );
}