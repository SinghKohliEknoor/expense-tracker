import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ThemePreference } from '@/context/theme-context';

type Props = {
  visible: boolean;
  current: ThemePreference;
  onSelect: (p: ThemePreference) => void;
  onClose: () => void;
};

const OPTIONS: { key: ThemePreference; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; sub: string }[] = [
  { key: 'light',  label: 'Light',  icon: 'sunny-outline',  sub: 'Always use light theme' },
  { key: 'dark',   label: 'Dark',   icon: 'moon-outline',   sub: 'Always use dark theme' },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline', sub: 'Follow device setting' },
];

export default function SelectThemeModal({ visible, current, onSelect, onClose }: Props) {
  const colorScheme = useColorScheme();
  const tint   = Colors[colorScheme].tint;
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: card }]}>
        <View style={[styles.handle, { backgroundColor: border }]} />
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>Appearance</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={24} color={border} />
          </Pressable>
        </View>

        {OPTIONS.map((opt, i) => {
          const selected = current === opt.key;
          return (
            <View key={opt.key}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: tint + '0C' }]}
                onPress={() => { onSelect(opt.key); onClose(); }}>
                <View style={[styles.iconWrap, { backgroundColor: selected ? tint + '18' : border + '44' }]}>
                  <Ionicons name={opt.icon} size={20} color={selected ? tint : Colors[colorScheme].icon} />
                </View>
                <View style={styles.rowText}>
                  <ThemedText style={[styles.rowLabel, selected && { color: tint, fontWeight: '600' }]}>
                    {opt.label}
                  </ThemedText>
                  <ThemedText style={styles.rowSub}>{opt.sub}</ThemedText>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={tint} />}
              </Pressable>
              {i < OPTIONS.length - 1 && <View style={[styles.divider, { backgroundColor: border, marginLeft: 68 }]} />}
            </View>
          );
        })}

        <View style={{ height: 36 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 10, paddingHorizontal: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:  { fontSize: 18 },

  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, gap: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  rowText:  { flex: 1 },
  rowLabel: { fontSize: 15, marginBottom: 2 },
  rowSub:   { fontSize: 12, opacity: 0.48 },
  divider:  { height: StyleSheet.hairlineWidth },
});