import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SettingRow = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
};

const ACCOUNT_SETTINGS: SettingRow[] = [
  { icon: 'person-outline', label: 'Account Information' },
  { icon: 'key-outline', label: 'Change Password' },
  { icon: 'phone-portrait-outline', label: 'Device' },
  { icon: 'business-outline', label: 'Connect to Banks' },
];

const APP_SETTINGS: SettingRow[] = [
  { icon: 'settings-outline', label: 'Preferences' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'color-palette-outline', label: 'Appearance' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'information-circle-outline', label: 'About' },
];

function SettingItem({
  item,
  isLast,
  border,
  tint,
}: {
  item: SettingRow;
  isLast: boolean;
  border: string;
  tint: string;
}) {
  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.settingRow,
          pressed && { backgroundColor: tint + '0C' },
        ]}>
        <View style={[styles.settingIconWrap, { backgroundColor: tint + '18' }]}>
          <Ionicons name={item.icon} size={18} color={item.danger ? '#EF4444' : tint} />
        </View>
        <ThemedText
          style={styles.settingLabel}
          lightColor={item.danger ? '#EF4444' : undefined}
          darkColor={item.danger ? '#EF4444' : undefined}>
          {item.label}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={item.danger ? '#EF4444' : border} />
      </Pressable>
      {!isLast && <View style={[styles.rowDivider, { backgroundColor: border, marginLeft: 64 }]} />}
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const card = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: tint + '20' }]}>
            <Ionicons name="person" size={32} color={tint} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="defaultSemiBold" style={styles.profileName}>
              John Doe
            </ThemedText>
            <ThemedText style={styles.profileEmail}>johndoe@email.com</ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.editBtn,
              { backgroundColor: tint + '18', opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText lightColor={tint} darkColor={tint} style={styles.editBtnText}>
              Edit
            </ThemedText>
          </Pressable>
        </View>

        {/* Premium Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.premiumBanner,
            { backgroundColor: tint, opacity: pressed ? 0.88 : 1 },
          ]}>
          <View style={styles.premiumLeft}>
            <View style={styles.premiumIconWrap}>
              <Ionicons name="diamond-outline" size={22} color={tint} />
            </View>
            <View>
              <ThemedText lightColor="#fff" darkColor="#fff" type="defaultSemiBold" style={styles.premiumTitle}>
                Premium Account
              </ThemedText>
              <ThemedText
                lightColor="rgba(255,255,255,0.75)"
                darkColor="rgba(255,255,255,0.75)"
                style={styles.premiumSub}>
                Enjoy your premium features
              </ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>

        {/* Account Settings */}
        <ThemedText style={styles.sectionLabel}>Account Settings</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: card, borderColor: border }]}>
          {ACCOUNT_SETTINGS.map((item, i) => (
            <SettingItem
              key={item.label}
              item={item}
              isLast={i === ACCOUNT_SETTINGS.length - 1}
              border={border}
              tint={tint}
            />
          ))}
        </View>

        {/* App Settings */}
        <ThemedText style={styles.sectionLabel}>Settings</ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: card, borderColor: border }]}>
          {APP_SETTINGS.map((item, i) => (
            <SettingItem
              key={item.label}
              item={item}
              isLast={i === APP_SETTINGS.length - 1}
              border={border}
              tint={tint}
            />
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            { backgroundColor: card, borderColor: border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <ThemedText lightColor="#EF4444" darkColor="#EF4444" style={styles.signOutText}>
            Sign Out
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
    marginBottom: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, marginBottom: 3 },
  profileEmail: { fontSize: 13, opacity: 0.55 },
  editBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editBtnText: { fontSize: 14, fontWeight: '600' },

  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    padding: 18,
    marginBottom: 26,
  },
  premiumLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: { fontSize: 15, marginBottom: 2 },
  premiumSub: { fontSize: 12 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 22,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: { flex: 1, fontSize: 15 },
  rowDivider: { height: StyleSheet.hairlineWidth },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 15,
  },
  signOutText: { fontSize: 15, fontWeight: '600' },
});