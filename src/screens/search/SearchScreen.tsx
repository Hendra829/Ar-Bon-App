import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, FileCard, Screen, TextField } from '../../components';
import { CATEGORY_LABELS, Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { FileCategory, MainTabParamList, RootStackParamList } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FILTERS: Array<FileCategory | 'all'> = [
  'all',
  'image',
  'video',
  'document',
  'audio',
  'other',
];

export function SearchScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const files = useAppStore((s) => s.files);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FileCategory | 'all'>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchQuery = !q || file.name.toLowerCase().includes(q);
      const matchCategory = category === 'all' || file.category === category;
      return matchQuery && matchCategory;
    });
  }, [category, files, query]);

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Cari File</Text>
      <TextField
        label="Kata kunci"
        value={query}
        onChangeText={setQuery}
        placeholder="Cari berdasarkan nama file"
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const active = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? brand.primary : colors.surface,
                  borderColor: active ? brand.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? '#FFF' : colors.text }}>
                {item === 'all' ? 'Semua' : CATEGORY_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {results.length} hasil
      </Text>

      {results.length === 0 ? (
        <EmptyState icon="search" title="Tidak ditemukan" subtitle="Coba kata kunci lain." />
      ) : (
        results.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onPress={() => navigation.navigate('FilePreview', { fileId: file.id })}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  meta: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
});
