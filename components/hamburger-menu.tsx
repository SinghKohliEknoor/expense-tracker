import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.74;

const MENU_ITEMS: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { icon: 'home-outline', label: 'Home' },
  { icon: 'wallet-outline', label: 'Expenses' },
  { icon: 'trending-up-outline', label: 'Income' },
  { icon: 'bar-chart-outline', label: 'Reports' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'information-circle-outline', label: 'About' },
];

type Props = { visible: boolean; onClose: () => void };

export default function HamburgerMenu({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: card, transform: [{ translateX: slideAnim }] },
        ]}>
        {/* Purple header with user info */}
        <View style={[styles.drawerHeader, { backgroundColor: tint }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={30} color={tint} />
          </View>
          <ThemedText
            lightColor="#fff"
            darkColor="#fff"
            type="defaultSemiBold"
            style={styles.drawerName}>
            {displayName}
          </ThemedText>
          <ThemedText
            lightColor="rgba(255,255,255,0.72)"
            darkColor="rgba(255,255,255,0.72)"
            style={styles.drawerEmail}>
            {displayEmail}
          </ThemedText>
        </View>

        {/* Menu items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: tint + '14' },
              ]}
              onPress={onClose}>
              <View style={[styles.menuIconWrap, { backgroundColor: tint + '18' }]}>
                <Ionicons name={item.icon} size={20} color={tint} />
              </View>
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          style={[styles.menuItem, styles.signOutRow, { borderTopColor: border }]}
          onPress={() => { onClose(); signOut(); }}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <ThemedText lightColor="#EF4444" darkColor="#EF4444" style={styles.menuLabel}>
            Sign Out
          </ThemedText>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 22,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  drawerName: {
    fontSize: 17,
    marginBottom: 3,
  },
  drawerEmail: {
    fontSize: 13,
  },
  menuList: {
    flex: 1,
    paddingTop: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
  },
  signOutRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
});