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
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-categories';
import { useCurrency } from '@/context/currency-context';
import { useTransactionRefresh } from '@/context/transaction-refresh-context';
import { supabase } from '@/lib/supabase';
import type { CategoryType } from '@/types/database';
import { today } from '@/utils/dates';

const ACCENT: Record<CategoryType, string> = { expense: '#EF4444', income: '#22C55E' };

function dateFromString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToString(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
}

type Props = {
  visible: boolean;
  type: CategoryType;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddTransactionModal({ visible, type, onClose, onSaved }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const card      = Colors[colorScheme].card;
  const border    = Colors[colorScheme].border;
  const textColor = Colors[colorScheme].text;
  const iconColor = Colors[colorScheme].icon;
  const bgColor   = Colors[colorScheme].background;
  const accent    = ACCENT[type];

  const { user } = useAuth();
  const { categories } = useCategories(type);
  const { currency } = useCurrency();
  const { invalidate } = useTransactionRefresh();

  const [amount, setAmount]               = useState('');
  const [categoryId, setCategoryId]       = useState<string | null>(null);
  const [date, setDate]                   = useState(today());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote]                   = useState('');
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Reset form on open
  useEffect(() => {
    if (visible) {
      setAmount('');
      setCategoryId(null);
      setDate(today());
      setShowDatePicker(false);
      setNote('');
      setError(null);
      setSaving(false);
    }
  }, [visible]);

  // Auto-select first category when list loads
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  function handleDateChange(_event: any, selectedDate?: Date) {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(dateToString(selectedDate));
  }

  async function handleSave() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0) { setError('Enter a valid amount.'); return; }
    if (!categoryId)      { setError('Select a category.');   return; }
    if (!user) return;

    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: num,
      type,
      category_id: categoryId,
      note: note.trim() || null,
      date,
    });
    setSaving(false);

    if (err) { setError(err.message); return; }
    invalidate();
    onSaved();
    onClose();
  }

  const displayDate = dateFromString(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

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
          {/* Drag handle */}
          <View style={[s.handle, { backgroundColor: border }]} />

          {/* Header */}
          <View style={s.header}>
            <ThemedText type="defaultSemiBold" style={s.title}>
              {type === 'expense' ? 'Add Expense' : 'Add Income'}
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={26} color={border} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Amount */}
            <View style={[s.amountRow, { borderBottomColor: border }]}>
              <ThemedText style={[s.rupee, { color: accent }]}>{currency.symbol}</ThemedText>
              <TextInput
                style={[s.amountInput, { color: accent }]}
                placeholder="0"
                placeholderTextColor={accent + '44'}
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

            {/* Date */}
            <ThemedText style={s.label}>Date</ThemedText>

            {Platform.OS === 'android' ? (
              <>
                <Pressable
                  style={[s.dateTrigger, { borderColor: border, backgroundColor: bgColor }]}
                  onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color={accent} />
                  <ThemedText style={[s.dateTriggerText, { color: textColor }]}>
                    {displayDate}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={16} color={iconColor} />
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateFromString(date)}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </>
            ) : (
              <DateTimePicker
                value={dateFromString(date)}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                accentColor={accent}
                themeVariant={colorScheme}
                onChange={handleDateChange}
                style={s.iosPicker}
              />
            )}

            {/* Note */}
            <ThemedText style={s.label}>Note (optional)</ThemedText>
            <View style={[s.noteBox, { borderColor: border, backgroundColor: bgColor }]}>
              <TextInput
                style={[s.noteInput, { color: textColor }]}
                placeholder="What's this for?"
                placeholderTextColor={iconColor}
                value={note}
                onChangeText={setNote}
                maxLength={120}
                multiline
              />
            </View>

            {error ? <ThemedText style={s.error}>{error}</ThemedText> : null}

            <Pressable
              style={({ pressed }) => [
                s.saveBtn,
                { backgroundColor: accent, opacity: saving || pressed ? 0.8 : 1 },
              ]}
              onPress={handleSave}
              disabled={saving}>
              <ThemedText lightColor="#fff" darkColor="#fff" style={s.saveTxt}>
                {saving ? 'Saving…' : type === 'expense' ? 'Save Expense' : 'Save Income'}
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
    maxHeight: '92%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },

  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title:   { fontSize: 18 },

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
  chipText: { fontSize: 13 },

  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 24,
  },
  dateTriggerText: { flex: 1, fontSize: 15 },
  iosPicker: { marginBottom: 16, marginHorizontal: -10 },

  noteBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 22,
    minHeight: 52,
  },
  noteInput: { fontSize: 14 },

  error:   { color: '#EF4444', fontSize: 13, marginBottom: 14, textAlign: 'center' },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 6 },
  saveTxt: { fontSize: 16, fontWeight: '700' },
});
