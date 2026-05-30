import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-categories';
import { useCurrency } from '@/context/currency-context';
import { supabase } from '@/lib/supabase';
import type { BudgetPeriod } from '@/types/database';

const ACCENT = '#F59E0B';

const PERIODS: { label: string; value: BudgetPeriod }[] = [
  { label: 'Weekly',  value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly',  value: 'yearly' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddBudgetModal({ visible, onClose, onSaved }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;
  const tint   = Colors[colorScheme].tint;

  const { user } = useAuth();
  const { categories } = useCategories('expense');
  const { currency } = useCurrency();

  const [amount, setAmount]         = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [period, setPeriod]         = useState<BudgetPeriod>('monthly');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setCategoryId(null);
      setPeriod('monthly');
      setError(null);
      setSaving(false);
    }
  }, [visible]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  async function handleSave() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0) { setError('Enter a valid amount.'); return; }
    if (!categoryId)      { setError('Select a category.');   return; }
    if (!user) return;

    setSaving(true);
    setError(null);
    const { error: err } = await (supabase.from('budgets') as any).insert({
      user_id: user.id,
      category_id: categoryId,
      amount: num,
      period,
    });
    setSaving(false);

    if (err) { setError(err.message); return; }
    onSaved();
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}>
        <View style={[s.sheet, { backgroundColor: card }]}>
          <View style={[s.handle, { backgroundColor: border }]} />

          <View style={s.header}>
            <ThemedText type="defaultSemiBold" style={s.title}>Set Budget</ThemedText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={26} color={border} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Amount */}
            <View style={[s.amountRow, { borderBottomColor: border }]}>
              <ThemedText style={[s.rupee, { color: ACCENT }]}>{currency.symbol}</ThemedText>
              <TextInput
                style={[s.amountInput, { color: ACCENT }]}
                placeholder="0"
                placeholderTextColor={ACCENT + '44'}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus={visible}
              />
            </View>

            {/* Category */}
            <ThemedText style={s.label}>Category</ThemedText>
            <View style={s.chipGroup}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.hScroll}>
                {categories.map((cat) => {
                  const sel = cat.id === categoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[
                        s.chip,
                        {
                          borderColor: sel ? cat.color : border,
                          backgroundColor: sel ? cat.color + '1A' : 'transparent',
                        },
                      ]}
                      onPress={() => setCategoryId(cat.id)}>
                      <Ionicons name={cat.icon as any} size={15} color={cat.color} />
                      <ThemedText
                        style={[s.chipText, sel && { color: cat.color, fontWeight: '600' }]}>
                        {cat.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Period */}
            <ThemedText style={s.label}>Period</ThemedText>
            <View style={[s.chipGroup, s.periodRow]}>
              {PERIODS.map((p) => {
                const sel = p.value === period;
                return (
                  <Pressable
                    key={p.value}
                    style={[
                      s.chip,
                      s.periodChip,
                      {
                        borderColor: sel ? tint : border,
                        backgroundColor: sel ? tint + '1A' : 'transparent',
                      },
                    ]}
                    onPress={() => setPeriod(p.value)}>
                    <ThemedText
                      style={[s.chipText, sel && { color: tint, fontWeight: '600' }]}>
                      {p.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {error ? <ThemedText style={s.error}>{error}</ThemedText> : null}

            <Pressable
              style={({ pressed }) => [
                s.saveBtn,
                { backgroundColor: ACCENT, opacity: saving || pressed ? 0.8 : 1 },
              ]}
              onPress={handleSave}
              disabled={saving}>
              <ThemedText lightColor="#fff" darkColor="#fff" style={s.saveTxt}>
                {saving ? 'Saving…' : 'Save Budget'}
              </ThemedText>
            </Pressable>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  kav:      { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 22,
    maxHeight: '90%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title:  { fontSize: 18 },

  amountRow:   { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 14, marginBottom: 28 },
  rupee:       { fontSize: 28, fontWeight: '700', paddingBottom: 7, marginRight: 4 },
  amountInput: { fontSize: 52, fontWeight: '800', flex: 1, paddingVertical: 0 },

  label:     { fontSize: 11, fontWeight: '600', opacity: 0.48, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chipGroup: { marginBottom: 24 },
  hScroll:   { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  periodRow:  { flexDirection: 'row', gap: 8 },
  periodChip: { flex: 1, justifyContent: 'center' },
  chipText:   { fontSize: 13 },

  error:   { color: '#EF4444', fontSize: 13, marginBottom: 14, textAlign: 'center' },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 6 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
