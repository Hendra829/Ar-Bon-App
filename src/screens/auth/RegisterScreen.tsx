import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Button, Screen, TextField } from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { brand, colors } = useTheme();
  const register = useAppStore((s) => s.register);
  const isLoading = useAppStore((s) => s.isLoading);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    try {
      await register(name, email, password, true);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal.');
    }
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Buat akun baru</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Daftar untuk mulai menyimpan file di AR'BON.
      </Text>

      <TextField label="Nama" value={name} onChangeText={setName} placeholder="Nama lengkap" />
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
      />
      <TextField
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Minimal 6 karakter"
      />

      {error ? <Text style={[styles.error, { color: brand.danger }]}>{error}</Text> : null}

      <Button title="Daftar" loading={isLoading} onPress={onSubmit} />

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
        <Text style={{ color: colors.textSecondary }}>
          Sudah punya akun? <Text style={{ color: brand.primary }}>Login</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
  },
  subtitle: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  error: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  linkWrap: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
});
