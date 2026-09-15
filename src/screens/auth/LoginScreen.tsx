import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen, TextField } from '../../components';
import { APP_NAME, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { authService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { brand, colors } = useTheme();
  const login = useAppStore((s) => s.login);
  const isLoading = useAppStore((s) => s.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authService.getRememberedEmail().then((value) => {
      if (value) {
        setEmail(value);
      }
    });
  }, []);

  const onSubmit = async () => {
    setError('');
    try {
      await login(email, password, rememberMe);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    }
  };

  return (
    <Screen scroll>
      <Text style={[styles.brand, { color: brand.primary }]}>{APP_NAME}</Text>
      <Text style={[styles.title, { color: colors.text }]}>Masuk ke akun Anda</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Kelola file dengan aman di perangkat Anda.
      </Text>

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

      <Pressable style={styles.rememberRow} onPress={() => setRememberMe((v) => !v)}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: brand.primary,
              backgroundColor: rememberMe ? brand.primary : 'transparent',
            },
          ]}
        />
        <Text style={{ color: colors.text }}>Ingat saya</Text>
      </Pressable>

      {error ? <Text style={[styles.error, { color: brand.danger }]}>{error}</Text> : null}

      <Button title="Login" loading={isLoading} onPress={onSubmit} />

      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkWrap}>
        <Text style={{ color: brand.primary }}>Lupa password?</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
        <Text style={{ color: colors.textSecondary }}>
          Belum punya akun? <Text style={{ color: brand.primary }}>Daftar</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
  },
  subtitle: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
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
