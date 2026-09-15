import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { formatBytes } from '../../utils';

interface StorageBarProps {
  usedBytes: number;
  totalBytes: number;
}

export function StorageBar({ usedBytes, totalBytes }: StorageBarProps) {
  const { colors, brand } = useTheme();
  const ratio = totalBytes > 0 ? Math.min(usedBytes / totalBytes, 1) : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.text }]}>Penggunaan Storage</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: ratio > 0.85 ? brand.danger : brand.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.bodyBold,
  },
  meta: {
    ...Typography.caption,
  },
  track: {
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
