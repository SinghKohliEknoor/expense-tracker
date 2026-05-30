import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import type { CategoryType } from '@/types/database';

export type FilterState = {
  categoryIds: string[];
  startDate: string | null;
  endDate: string | null;
};

export const EMPTY_FILTER: FilterState = { categoryIds: [], startDate: null, endDate: null };

type Props = {
  visible: boolean;
  type: CategoryType;
  accentColor: string;
  filter: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
};

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

function formatShort(str: string): string {
  return dateFromString(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function FilterSheet({ visible, type, accentColor, filter, onApply, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const card   = Colors[colorScheme].card;
  const border = Colors[colorScheme].border;
  const icon   = Colors[colorScheme].icon;
  const bg     = Colors[colorScheme].background;
  const text   = Colors[colorScheme].text;

  const { categories } = useCategories(type);

  const [local, setLocal]               = useState<FilterState>(filter);
  const [showStart, setShowStart]       = useState(false);
  const [showEnd, setShowEnd]           = useState(false);

  // Sync local state from parent whenever sheet opens
  useEffect(() => {
    if (visible) {
      setLocal(filter);
      setShowStart(false);
      setShowEnd(false);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCategory(id: string) {
    setLocal(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(c => c !== id)
        : [...prev.categoryIds, id],
    }));
  }

  function handleApply() {
    onApply(local);
    onClose();
  }

  function handleClear() {
    setLocal(EMPTY_FILTER);
    onApply(EMPTY_FILTER);
    onClose();
  }

  const activeCount =
    (local.categoryIds.length > 0 ? 1 : 0) +
    (local.startDate ? 1 : 0) +
    (local.endDate ? 1 : 0);

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

        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>Filter</ThemedText>
          <Pressable onPress={handleClear} hitSlop={8}>
            <ThemedText lightColor={accentColor} darkColor={accentColor} style={styles.clearAll}>
              Clear All
            </ThemedText>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={24} color={border} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Category */}
          <ThemedText style={styles.sectionLabel}>Category</ThemedText>
          <View style={styles.chipWrap}>
            {categories.map(cat => {
              const sel = local.categoryIds.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    {
                      borderColor: sel ? cat.color : border,
                      backgroundColor: sel ? cat.color + '1A' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleCategory(cat.id)}>
                  <Ionicons name={cat.icon as any} size={13} color={cat.color} />
                  <ThemedText style={[styles.chipText, sel && { color: cat.color, fontWeight: '600' }]}>
                    {cat.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Date Range */}
          <ThemedText style={styles.sectionLabel}>Date Range</ThemedText>
          <View style={styles.dateRow}>

            {/* From */}
            <View style={styles.datePart}>
              <ThemedText style={styles.datePartLabel}>From</ThemedText>
              <Pressable
                style={[styles.dateTrigger, { borderColor: border, backgroundColor: bg }]}
                onPress={() => { setShowStart(p => !p); setShowEnd(false); }}>
                <Ionicons name="calendar-outline" size={14} color={accentColor} />
                <ThemedText style={[styles.dateTriggerText, { color: local.startDate ? text : icon }]}>
                  {local.startDate ? formatShort(local.startDate) : 'Any'}
                </ThemedText>
                {local.startDate && (
                  <Pressable
                    hitSlop={6}
                    onPress={() => { setLocal(p => ({ ...p, startDate: null })); setShowStart(false); }}>
                    <Ionicons name="close-circle" size={14} color={icon} />
                  </Pressable>
                )}
              </Pressable>
            </View>

            <View style={[styles.dateSep, { backgroundColor: border }]} />

            {/* To */}
            <View style={styles.datePart}>
              <ThemedText style={styles.datePartLabel}>To</ThemedText>
              <Pressable
                style={[styles.dateTrigger, { borderColor: border, backgroundColor: bg }]}
                onPress={() => { setShowEnd(p => !p); setShowStart(false); }}>
                <Ionicons name="calendar-outline" size={14} color={accentColor} />
                <ThemedText style={[styles.dateTriggerText, { color: local.endDate ? text : icon }]}>
                  {local.endDate ? formatShort(local.endDate) : 'Any'}
                </ThemedText>
                {local.endDate && (
                  <Pressable
                    hitSlop={6}
                    onPress={() => { setLocal(p => ({ ...p, endDate: null })); setShowEnd(false); }}>
                    <Ionicons name="close-circle" size={14} color={icon} />
                  </Pressable>
                )}
              </Pressable>
            </View>
          </View>

          {/* Start date picker */}
          {showStart && Platform.OS === 'android' && (
            <DateTimePicker
              value={local.startDate ? dateFromString(local.startDate) : new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_e, d) => {
                setShowStart(false);
                if (d) setLocal(p => ({ ...p, startDate: dateToString(d) }));
              }}
            />
          )}
          {showStart && Platform.OS === 'ios' && (
            <DateTimePicker
              value={local.startDate ? dateFromString(local.startDate) : new Date()}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              accentColor={accentColor}
              themeVariant={colorScheme}
              onChange={(_e, d) => {
                if (d) setLocal(p => ({ ...p, startDate: dateToString(d) }));
              }}
              style={styles.iosPicker}
            />
          )}

          {/* End date picker */}
          {showEnd && Platform.OS === 'android' && (
            <DateTimePicker
              value={local.endDate ? dateFromString(local.endDate) : new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_e, d) => {
                setShowEnd(false);
                if (d) setLocal(p => ({ ...p, endDate: dateToString(d) }));
              }}
            />
          )}
          {showEnd && Platform.OS === 'ios' && (
            <DateTimePicker
              value={local.endDate ? dateFromString(local.endDate) : new Date()}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              accentColor={accentColor}
              themeVariant={colorScheme}
              onChange={(_e, d) => {
                if (d) setLocal(p => ({ ...p, endDate: dateToString(d) }));
              }}
              style={styles.iosPicker}
            />
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Apply */}
        <Pressable
          style={({ pressed }) => [
            styles.applyBtn,
            { backgroundColor: accentColor, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleApply}>
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.applyText}>
            {activeCount > 0 ? `Apply (${activeCount})` : 'Apply'}
          </ThemedText>
        </Pressable>

        <View style={{ height: 28 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 8,
  },
  title:    { fontSize: 18, flex: 1 },
  clearAll: { fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.48,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  datePart: { flex: 1 },
  datePartLabel: { fontSize: 11, opacity: 0.48, marginBottom: 6 },
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateTriggerText: { flex: 1, fontSize: 13 },
  dateSep: { width: StyleSheet.hairlineWidth, height: 36, marginTop: 18 },
  iosPicker: { marginBottom: 8, marginHorizontal: -8 },

  applyBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  applyText: { fontSize: 16, fontWeight: '700' },
});