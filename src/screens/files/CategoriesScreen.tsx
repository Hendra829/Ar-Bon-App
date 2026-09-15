import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CategoryCard, EmptyState, FileCard, Screen } from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { FileCategory, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

const CATEGORIES: FileCategory[] = ['image', 'video', 'document', 'audio', 'other'];

export function CategoriesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const stats = useAppStore((s) => s.stats);
  const getFilesByCategory = useAppStore((s) => s.getFilesByCategory);
  const [selected, setSelected] = useState<FileCategory | null>(null);

  const selectedFiles = useMemo(
    () => (selected ? getFilesByCategory(selected) : []),
    [getFilesByCategory, selected],
  );

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Kategori</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            count={getFilesByCategory(category).length}
            sizeBytes={stats?.byCategory[category] ?? 0}
            onPress={() => setSelected(category)}
          />
        ))}
      </View>

      {selected ? (
        <>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            File pada kategori terpilih
          </Text>
          {selectedFiles.length === 0 ? (
            <EmptyState title="Kosong" subtitle="Belum ada file di kategori ini." />
          ) : (
            selectedFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPress={() => navigation.navigate('FilePreview', { fileId: file.id })}
              />
            ))
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subtitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
});
