import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS, CATEGORY_LABELS, Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import type { FileCategory } from '../../types';
import { formatBytes } from '../../utils';

interface CategoryCardProps {
  category: FileCategory;
  count: number;
  sizeBytes: number;
  onPress?: () => void;
}

export function CategoryCard({ category, count, sizeBytes, onPress }: CategoryCardProps) {
  const { colors, brand } = useTheme();
  const icon = CATEGORY_ICONS[category] as keyof typeof Ionicons.glyphMap;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name={icon} size={22} color={brand.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{CATEGORY_LABELS[category]}</Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {count} file · {formatBytes(sizeBytes)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.bodyBold,
  },
  meta: {
    ...Typography.caption,
    marginTop: 2,
  },
});
