import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  FileCard,
  PromptModal,
  Screen,
} from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { MainTabParamList, RootStackParamList, SortOption } from '../../types';
import { sortFiles } from '../../utils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Files'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function FilesScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const files = useAppStore((s) => s.files);
  const folders = useAppStore((s) => s.folders);
  const viewMode = useAppStore((s) => s.viewMode);
  const sortBy = useAppStore((s) => s.sortBy);
  const sortDirection = useAppStore((s) => s.sortDirection);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setSort = useAppStore((s) => s.setSort);
  const createFolder = useAppStore((s) => s.createFolder);

  const [folderModal, setFolderModal] = useState(false);

  const sorted = useMemo(
    () => sortFiles(files, sortBy, sortDirection),
    [files, sortBy, sortDirection],
  );

  const cycleSort = () => {
    const order: SortOption[] = ['date', 'name', 'size'];
    const next = order[(order.indexOf(sortBy) + 1) % order.length];
    setSort(next, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Files</Text>
        <View style={styles.actions}>
          <Pressable onPress={cycleSort} style={styles.actionBtn}>
            <Ionicons name="swap-vertical" size={20} color={brand.primary} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.actionBtn}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={20}
              color={brand.primary}
            />
          </Pressable>
          <Pressable onPress={() => setFolderModal(true)} style={styles.actionBtn}>
            <Ionicons name="folder-open" size={20} color={brand.primary} />
          </Pressable>
        </View>
      </View>

      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        Sort: {sortBy} · {sortDirection}
      </Text>

      {folders.length > 0 ? (
        <View style={styles.folderWrap}>
          {folders.map((folder) => (
            <Pressable
              key={folder.id}
              onPress={() => navigation.navigate('FolderDetail', { folderId: folder.id })}
              style={[styles.folderChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="folder" size={16} color={brand.secondary} />
              <Text style={{ color: colors.text }}>{folder.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState title="Tidak ada file" subtitle="Upload file untuk mulai mengorganisasi." />
      ) : (
        <View style={viewMode === 'grid' ? styles.grid : undefined}>
          {sorted.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              viewMode={viewMode}
              onPress={() => navigation.navigate('FilePreview', { fileId: file.id })}
            />
          ))}
        </View>
      )}

      <PromptModal
        visible={folderModal}
        title="Buat Folder"
        label="Nama folder"
        onCancel={() => setFolderModal(false)}
        onConfirm={async (name) => {
          setFolderModal(false);
          if (name.trim()) {
            await createFolder(name.trim());
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
  meta: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  folderWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
