import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, PromptModal, Screen, StorageBar } from '../../components';
import { APP_VERSION, Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { MainTabParamList, RootStackParamList } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const logout = useAppStore((s) => s.logout);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Screen scroll>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: brand.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'A'}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
      </View>

      <StorageBar usedBytes={stats?.usedBytes ?? 0} totalBytes={stats?.totalBytes ?? 1} />

      <View style={styles.menu}>
        <Button title="Edit Profil" variant="secondary" onPress={() => setEditOpen(true)} />
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
        <Button title="Trash" variant="ghost" onPress={() => navigation.navigate('Trash')} />
        <Button
          title="Logout"
          variant="danger"
          onPress={async () => {
            await logout();
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }}
        />
      </View>

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={16} color={brand.secondary} />
        <Text style={{ color: colors.textSecondary }}>AR'BON v{APP_VERSION}</Text>
      </View>

      <PromptModal
        visible={editOpen}
        title="Edit Nama"
        label="Nama"
        initialValue={user?.name ?? ''}
        onCancel={() => setEditOpen(false)}
        onConfirm={async (name) => {
          setEditOpen(false);
          await updateProfile({ name });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    ...Typography.h3,
  },
  menu: {
    gap: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
});
