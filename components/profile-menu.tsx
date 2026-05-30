import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

type Action = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
};

const ACTIONS: Action[] = [
  { icon: 'person-outline', label: 'Edit Profile' },
  { icon: 'shield-checkmark-outline', label: 'My Account' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'log-out-outline', label: 'Sign Out', danger: true },
];

type Props = { visible: boolean; onClose: () => void };

export default function ProfileMenu({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  const router = useRouter();
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View
        style={[
          styles.menu,
          { backgroundColor: card, borderColor: border, shadowColor: '#000' },
        ]}>
        {/* Profile row */}
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: tint + '20' }]}>
            <Ionicons name="person" size={22} color={tint} />
          </View>
          <View style={styles.profileText}>
            <ThemedText type="defaultSemiBold" style={styles.profileName}>
              {displayName}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{displayEmail}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        {ACTIONS.map((action, i) => (
          <View key={action.label}>
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && { backgroundColor: tint + '10' },
              ]}
              onPress={async () => { onClose(); if (action.label === 'Sign Out') { await signOut(); router.replace('/login'); } }}>
              <Ionicons
                name={action.icon}
                size={18}
                color={action.danger ? '#EF4444' : tint}
              />
              <ThemedText
                lightColor={action.danger ? '#EF4444' : undefined}
                darkColor={action.danger ? '#EF4444' : undefined}
                style={styles.actionLabel}>
                {action.label}
              </ThemedText>
            </Pressable>
            {i === ACTIONS.length - 2 && (
              <View style={[styles.divider, { backgroundColor: border }]} />
            )}
          </View>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  menu: {
    position: 'absolute',
    top: 72,
    right: 12,
    width: 218,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    marginBottom: 1,
  },
  profileEmail: {
    fontSize: 11,
    opacity: 0.55,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 14,
  },
});