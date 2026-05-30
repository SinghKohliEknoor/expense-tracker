import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationPrefsContextType = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

const NotificationPrefsContext = createContext<NotificationPrefsContextType>({
  enabled: true,
  setEnabled: () => {},
});

const PREF_KEY = 'notifications_enabled';

export function NotificationPrefsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then(v => {
      if (v !== null) setEnabledState(v === 'true');
    });
  }, []);

  function setEnabled(v: boolean) {
    setEnabledState(v);
    AsyncStorage.setItem(PREF_KEY, String(v));
  }

  return (
    <NotificationPrefsContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </NotificationPrefsContext.Provider>
  );
}

export function useNotificationPrefs() {
  return useContext(NotificationPrefsContext);
}