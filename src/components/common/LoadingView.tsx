import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = 'Memuat...' }: LoadingViewProps) {
  const { colors, brand } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={brand.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  message: {
    ...Typography.body,
  },
});
