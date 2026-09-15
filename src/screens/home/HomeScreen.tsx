import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryCard, EmptyState, FileCard, Screen, StorageBar } from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { FileCategory, MainTabParamList, RootStackParamList } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES: FileCategory[] = ['image', 'video', 'document', 'audio', 'other'];

export function HomeScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const user = useAppStore((s) => s.user);
  const files = useAppStore((s) => s.files);
  const stats = useAppStore((s) => s.stats);
  const getFilesByCategory = useAppStore((s) => s.getFilesByCategory);

  const recent = useMemo(() => files.slice(0, 5), [files]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.hello, { color: colors.textSecondary }]}>Halo,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? 'Pengguna'}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="settings-outline" size={20} color={brand.primary} />
        </Pressable>
      </View>

      <StorageBar
        usedBytes={stats?.usedBytes ?? 0}
        totalBytes={stats?.totalBytes ?? 1}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategori</Text>
        <Pressable onPress={() => navigation.navigate('Categories')}>
          <Text style={{ color: brand.primary }}>Lihat semua</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            count={getFilesByCategory(category).length}
            sizeBytes={stats?.byCategory[category] ?? 0}
            onPress={() => navigation.navigate('Categories')}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Terbaru</Text>
        <Pressable onPress={() => navigation.navigate('Files')}>
          <Text style={{ color: brand.primary }}>Semua file</Text>
        </Pressable>
      </View>

      {recent.length === 0 ? (
        <EmptyState
          title="Belum ada file"
          subtitle="Mulai upload file pertama Anda dari tab Upload."
        />
      ) : (
        recent.map((file) => (
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  hello: {
    ...Typography.caption,
  },
  name: {
    ...Typography.h2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
