import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CURRENCIES, type CurrencyInfo } from '@/constants/currencies';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/context/currency-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SelectCurrencyModal({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;
  const tint   = Colors[colorScheme].tint;

  const { currency, setCurrency } = useCurrency();

  async function handleSelect(c: CurrencyInfo) {
    await setCurrency(c);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { backgroundColor: card }]}>
        <View style={[s.handle, { backgroundColor: border }]} />

        <View style={s.header}>
          <ThemedText type="defaultSemiBold" style={s.title}>Select Currency</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={26} color={border} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
          {CURRENCIES.map((c, i) => {
            const selected = c.code === currency.code;
            return (
              <View key={c.code}>
                <Pressable
                  style={({ pressed }) => [
                    s.row,
                    pressed && { backgroundColor: tint + '0C' },
                    selected && { backgroundColor: tint + '0F' },
                  ]}
                  onPress={() => handleSelect(c)}>
                  <ThemedText style={s.flag}>{c.flag}</ThemedText>
                  <View style={s.info}>
                    <ThemedText type="defaultSemiBold" style={s.name}>{c.name}</ThemedText>
                    <ThemedText style={s.code}>{c.code}</ThemedText>
                  </View>
                  <ThemedText
                    style={[s.symbol, selected && { color: tint }]}
                    lightColor={selected ? tint : undefined}
                    darkColor={selected ? tint : undefined}>
                    {c.symbol}
                  </ThemedText>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color={tint} style={s.check} />
                  )}
                </Pressable>
                {i < CURRENCIES.length - 1 && (
                  <View style={[s.divider, { backgroundColor: border, marginLeft: 68 }]} />
                )}
              </View>
            );
          })}
          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  title: { fontSize: 18 },
  list:  { paddingHorizontal: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 12,
  },
  flag:   { fontSize: 26, width: 36, textAlign: 'center' },
  info:   { flex: 1 },
  name:   { fontSize: 15, marginBottom: 2 },
  code:   { fontSize: 12, opacity: 0.45 },
  symbol: { fontSize: 16, fontWeight: '600', minWidth: 32, textAlign: 'right' },
  check:  { marginLeft: 4 },
  divider: { height: StyleSheet.hairlineWidth },
});
