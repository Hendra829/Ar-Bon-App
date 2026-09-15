import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio, Video, ResizeMode } from 'expo-av';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  ConfirmModal,
  PromptModal,
  Screen,
} from '../../components';
import { CATEGORY_LABELS, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { fileService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../types';
import { formatBytes, formatDate } from '../../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'FilePreview'>;

export function FilePreviewScreen({ navigation, route }: Props) {
  const { fileId } = route.params;
  const { colors, brand } = useTheme();
  const files = useAppStore((s) => s.files);
  const trash = useAppStore((s) => s.trash);
  const folders = useAppStore((s) => s.folders);
  const renameFile = useAppStore((s) => s.renameFile);
  const moveFile = useAppStore((s) => s.moveFile);
  const deleteFile = useAppStore((s) => s.deleteFile);
  const secureDeleteFile = useAppStore((s) => s.secureDeleteFile);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setFilePrivate = useAppStore((s) => s.setFilePrivate);
  const shareFile = useAppStore((s) => s.shareFile);

  const file = useMemo(
    () => files.find((item) => item.id === fileId) ?? trash.find((item) => item.id === fileId),
    [fileId, files, trash],
  );

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    fileService.markAccessed(fileId).catch(() => undefined);
    return () => {
      sound?.unloadAsync().catch(() => undefined);
    };
  }, [fileId, sound]);

  if (!file) {
    return (
      <Screen>
        <Text style={{ color: colors.text }}>File tidak ditemukan.</Text>
        <Button title="Kembali" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  const playAudio = async () => {
    const { sound: nextSound } = await Audio.Sound.createAsync({ uri: file.uri });
    setSound(nextSound);
    await nextSound.playAsync();
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>{file.name}</Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {CATEGORY_LABELS[file.category]} · {formatBytes(file.size)} · {formatDate(file.createdAt)}
      </Text>

      <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {file.category === 'image' ? (
          <Image source={{ uri: file.uri }} style={styles.image} resizeMode="contain" />
        ) : null}
        {file.category === 'video' ? (
          <Video
            style={styles.video}
            source={{ uri: file.uri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : null}
        {file.category === 'audio' ? (
          <Button title="Putar Audio" onPress={playAudio} />
        ) : null}
        {file.category === 'document' || file.category === 'other' ? (
          <View style={styles.docBox}>
            <Ionicons name="document-text" size={48} color={brand.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
              Preview native terbatas. Buka dengan aplikasi eksternal.
            </Text>
            <Button
              title="Buka File"
              variant="secondary"
              onPress={() => Linking.openURL(file.uri)}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button title="Share" onPress={() => shareFile(file.id).catch((e) => Alert.alert('Share', e.message))} />
        <Button title="Rename" variant="secondary" onPress={() => setRenameOpen(true)} />
        <Button
          title="Pindah Folder"
          variant="ghost"
          onPress={() => {
            const buttons = [
              ...folders.map((folder) => ({
                text: folder.name,
                onPress: () => {
                  moveFile(file.id, folder.id).catch((error) =>
                    Alert.alert('Gagal', error instanceof Error ? error.message : 'Move gagal'),
                  );
                },
              })),
              {
                text: 'Tanpa folder (root)',
                onPress: () => {
                  moveFile(file.id, null).catch((error) =>
                    Alert.alert('Gagal', error instanceof Error ? error.message : 'Move gagal'),
                  );
                },
              },
              { text: 'Batal', style: 'cancel' as const },
            ];
            Alert.alert('Pindahkan ke folder', 'Pilih tujuan file', buttons);
          }}
        />
        <Button
          title={file.isFavorite ? 'Unfavorite' : 'Favorite'}
          variant="ghost"
          onPress={() => toggleFavorite(file.id)}
        />
        <Button
          title={file.isPrivate ? 'Buka Privat' : 'Jadikan Privat'}
          variant="ghost"
          onPress={() => setFilePrivate(file.id, !file.isPrivate)}
        />
        <Button title="Hapus ke Trash" variant="danger" onPress={() => setDeleteOpen(true)} />
        <Button
          title="Secure Delete"
          variant="danger"
          onPress={() =>
            Alert.alert('Secure Delete', 'Hapus permanen file ini?', [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Hapus',
                style: 'destructive',
                onPress: async () => {
                  await secureDeleteFile(file.id);
                  navigation.goBack();
                },
              },
            ])
          }
        />
      </View>

      <PromptModal
        visible={renameOpen}
        title="Rename File"
        label="Nama baru"
        initialValue={file.name}
        onCancel={() => setRenameOpen(false)}
        onConfirm={async (name) => {
          setRenameOpen(false);
          await renameFile(file.id, name);
        }}
      />

      <ConfirmModal
        visible={deleteOpen}
        title="Hapus File"
        message="File akan dipindahkan ke Trash."
        danger
        confirmText="Hapus"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteOpen(false);
          await deleteFile(file.id);
          navigation.goBack();
        }}
      />

      </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
  },
  meta: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  image: {
    width: '100%',
    height: 260,
  },
  video: {
    width: '100%',
    height: 260,
  },
  docBox: {
    alignItems: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
});
