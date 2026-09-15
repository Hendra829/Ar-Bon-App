import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS, Radius, Shadows, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import type { StoredFile, ViewMode } from '../../types';
import { formatBytes, formatDate } from '../../utils';

interface FileCardProps {
  file: StoredFile;
  viewMode?: ViewMode;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function FileCard({
  file,
  viewMode = 'list',
  onPress,
  onLongPress,
}: FileCardProps) {
  const { colors, brand } = useTheme();
  const iconName = CATEGORY_ICONS[file.category] as keyof typeof Ionicons.glyphMap;

  if (viewMode === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.card]}
      >
        {file.category === 'image' ? (
          <Image source={{ uri: file.uri }} style={styles.gridImage} />
        ) : (
          <View style={[styles.gridIconWrap, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name={iconName} size={28} color={brand.primary} />
          </View>
        )}
        <Text numberOfLines={2} style={[styles.gridTitle, { color: colors.text }]}>
          {file.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {formatBytes(file.size)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.listIcon, { backgroundColor: colors.surfaceSecondary }]}>
        {file.category === 'image' ? (
          <Image source={{ uri: file.uri }} style={styles.listThumb} />
        ) : (
          <Ionicons name={iconName} size={22} color={brand.primary} />
        )}
      </View>
      <View style={styles.listContent}>
        <Text numberOfLines={1} style={[styles.listTitle, { color: colors.text }]}>
          {file.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {formatBytes(file.size)} · {formatDate(file.createdAt)}
        </Text>
      </View>
      {file.isFavorite ? <Ionicons name="star" size={16} color={brand.warning} /> : null}
      {file.isPrivate ? <Ionicons name="lock-closed" size={16} color={brand.accent} /> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listThumb: {
    width: 44,
    height: 44,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    ...Typography.bodyBold,
  },
  meta: {
    ...Typography.caption,
  },
  gridCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  gridImage: {
    width: '100%',
    height: 100,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  gridIconWrap: {
    height: 100,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  gridTitle: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
