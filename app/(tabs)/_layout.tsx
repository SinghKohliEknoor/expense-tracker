import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import HamburgerMenu from '@/components/hamburger-menu';
import ProfileMenu from '@/components/profile-menu';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const text = Colors[colorScheme].text;
  const border = Colors[colorScheme].border;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tint,
          tabBarInactiveTintColor: Colors[colorScheme].icon,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: border,
            height: 62,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerStyle: { backgroundColor: card },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: text,
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerBtn}
              onPress={() => setMenuOpen(true)}
              hitSlop={8}>
              <Ionicons name="menu" size={26} color={text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={styles.headerBtn}
              onPress={() => setProfileOpen(true)}
              hitSlop={8}>
              <View style={[styles.avatarBtn, { backgroundColor: tint + '20' }]}>
                <Ionicons name="person" size={18} color={tint} />
              </View>
            </Pressable>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expense"
          options={{
            title: 'Expense',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="income"
          options={{
            title: 'Income',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'trending-up' : 'trending-up-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'bar-chart' : 'bar-chart-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        {/* Hide the old explore screen from the tab bar */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <ProfileMenu visible={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginHorizontal: 14,
    padding: 2,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});