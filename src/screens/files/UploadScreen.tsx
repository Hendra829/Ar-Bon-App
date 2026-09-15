import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../components';
import { Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

export function UploadScreen(_props: Props) {
  const { colors, brand } = useTheme();
  const uploadDocuments = useAppStore((s) => s.uploadDocuments);
  const uploadMedia = useAppStore((s) => s.uploadMedia);
  const isLoading = useAppStore((s) => s.isLoading);
  const [message, setMessage] = useState('');

  const handleDocs = async () => {
    try {
      const count = await uploadDocuments();
      setMessage(count ? `${count} dokumen berhasil diupload.` : 'Tidak ada file dipilih.');
    } catch (error) {
      Alert.alert('Upload gagal', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleMedia = async () => {
    try {
      const count = await uploadMedia();
      setMessage(count ? `${count} media berhasil diupload.` : 'Tidak ada media dipilih.');
    } catch (error) {
      Alert.alert('Upload gagal', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Upload File</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Pilih dokumen atau media dari perangkat Anda.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="document-attach" size={36} color={brand.primary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Dokumen</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
          PDF, Office, teks, dan file umum lainnya.
        </Text>
        <Button title="Pilih Dokumen" loading={isLoading} onPress={handleDocs} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="images" size={36} color={brand.secondary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Gambar & Video</Text>
        <Text style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
          Ambil dari galeri perangkat.
        </Text>
        <Button title="Pilih Media" variant="secondary" loading={isLoading} onPress={handleMedia} />
      </View>

      {message ? <Text style={[styles.message, { color: brand.success }]}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
  },
  subtitle: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.bodyBold,
    textAlign: 'center',
  },
});
