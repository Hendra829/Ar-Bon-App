import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, PromptModal, Screen } from '../../components';
import { Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { authService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList, ThemeMode } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const { colors, brand } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [pinModal, setPinModal] = useState(false);

  const setTheme = async (themeMode: ThemeMode) => {
    await updateSettings({ themeMode });
  };

  const toggleBiometrics = async (enabled: boolean) => {
    if (enabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert('Biometrik', 'Perangkat tidak mendukung atau belum mengatur biometrik.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Aktifkan App Lock AR'BON",
      });
      if (!result.success) {
        return;
      }
    }
    await updateSettings({
      biometricsEnabled: enabled,
      appLockEnabled: enabled || settings.pinEnabled,
    });
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <Text style={[styles.section, { color: colors.textSecondary }]}>Tampilan</Text>
      <View style={styles.rowWrap}>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
          const active = settings.themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setTheme(mode)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? brand.primary : colors.surface,
                  borderColor: active ? brand.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? '#FFF' : colors.text }}>{mode}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}>Auto Backup (demo flag)</Text>
          <Switch
            value={settings.autoBackup}
            onValueChange={(autoBackup) => updateSettings({ autoBackup })}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}>Biometric Lock</Text>
          <Switch value={settings.biometricsEnabled} onValueChange={toggleBiometrics} />
        </View>
        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}>PIN Lock</Text>
          <Switch
            value={settings.pinEnabled}
            onValueChange={async (pinEnabled) => {
              if (pinEnabled) {
                setPinModal(true);
                return;
              }
              await authService.clearAppPin();
              await updateSettings({
                pinEnabled: false,
                appLockEnabled: settings.biometricsEnabled,
              });
            }}
          />
        </View>
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Cloud backup/sync pada versi ini disimpan sebagai pengaturan lokal (demo). Integrasi
        backend cloud dapat ditambahkan kemudian.
      </Text>

      <Button
        title="Set Default View: Grid"
        variant="ghost"
        onPress={() => updateSettings({ defaultViewMode: 'grid' })}
      />
      <Button
        title="Set Default View: List"
        variant="ghost"
        onPress={() => updateSettings({ defaultViewMode: 'list' })}
      />

      <PromptModal
        visible={pinModal}
        title="Set PIN"
        label="PIN 4-6 digit"
        onCancel={() => setPinModal(false)}
        onConfirm={async (pin) => {
          try {
            await authService.setAppPin(pin);
            await updateSettings({ pinEnabled: true, appLockEnabled: true });
            setPinModal(false);
          } catch (error) {
            Alert.alert('PIN', error instanceof Error ? error.message : 'Gagal set PIN');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  section: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
});
