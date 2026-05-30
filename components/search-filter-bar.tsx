import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  hasActiveFilters: boolean;
  accentColor: string;
};

export default function SearchFilterBar({
  value,
  onChangeText,
  onFilterPress,
  hasActiveFilters,
  accentColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const border = Colors[colorScheme].border;
  const text   = Colors[colorScheme].text;
  const card   = Colors[colorScheme].card;
  const icon   = Colors[colorScheme].icon;

  return (
    <View style={styles.row}>
      <View style={[styles.searchBox, { backgroundColor: card, borderColor: border }]}>
        <Ionicons name="search-outline" size={16} color={icon} />
        <TextInput
          style={[styles.input, { color: text }]}
          placeholder="Search by name, note or amount…"
          placeholderTextColor={icon}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={icon} />
          </Pressable>
        )}
      </View>

      <Pressable
        style={[
          styles.filterBtn,
          {
            backgroundColor: hasActiveFilters ? accentColor : card,
            borderColor: hasActiveFilters ? accentColor : border,
          },
        ]}
        onPress={onFilterPress}>
        <Ionicons
          name="options-outline"
          size={18}
          color={hasActiveFilters ? '#fff' : icon}
        />
        {hasActiveFilters && <View style={styles.dot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 44,
  },
  input: { flex: 1, fontSize: 14 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});