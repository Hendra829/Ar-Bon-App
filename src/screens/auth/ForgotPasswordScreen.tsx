import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Screen, TextField } from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { authService } from '../../services';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { brand, colors } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await authService.requestPasswordReset(email);
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Lupa Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Masukkan email akun Anda. Mode demo akan mensimulasikan proses reset.
      </Text>

      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
      />

      {error ? <Text style={[styles.feedback, { color: brand.danger }]}>{error}</Text> : null}
      {message ? <Text style={[styles.feedback, { color: brand.success }]}>{message}</Text> : null}

      <Button title="Kirim Instruksi" loading={loading} onPress={onSubmit} />
      <Button
        title="Kembali ke Login"
        variant="ghost"
        onPress={() => navigation.navigate('Login')}
        style={styles.back}
      />
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
  feedback: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  back: {
    marginTop: Spacing.sm,
  },
});
