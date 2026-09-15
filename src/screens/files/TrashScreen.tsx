import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Button,
  ConfirmModal,
  EmptyState,
  FileCard,
  Screen,
} from '../../components';
import { Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Trash'>;

export function TrashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const trash = useAppStore((s) => s.trash);
  const restoreFile = useAppStore((s) => s.restoreFile);
  const secureDeleteFile = useAppStore((s) => s.secureDeleteFile);
  const emptyTrash = useAppStore((s) => s.emptyTrash);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Trash</Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {trash.length} item di recycle bin
      </Text>

      {trash.length > 0 ? (
        <Button
          title="Kosongkan Trash"
          variant="danger"
          onPress={() => setConfirmEmpty(true)}
          style={{ marginBottom: Spacing.md }}
        />
      ) : null}

      {trash.length === 0 ? (
        <EmptyState icon="trash-outline" title="Trash kosong" />
      ) : (
        trash.map((file) => (
          <React.Fragment key={file.id}>
            <FileCard
              file={file}
              onPress={() => navigation.navigate('FilePreview', { fileId: file.id })}
            />
            <Button
              title="Restore"
              variant="secondary"
              onPress={() => restoreFile(file.id)}
              style={{ marginBottom: 8 }}
            />
            <Button
              title="Hapus Permanen"
              variant="danger"
              onPress={() => secureDeleteFile(file.id)}
              style={{ marginBottom: 16 }}
            />
          </React.Fragment>
        ))
      )}

      <ConfirmModal
        visible={confirmEmpty}
        title="Kosongkan Trash"
        message="Semua file di trash akan dihapus permanen."
        danger
        confirmText="Kosongkan"
        onCancel={() => setConfirmEmpty(false)}
        onConfirm={async () => {
          setConfirmEmpty(false);
          await emptyTrash();
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
});
