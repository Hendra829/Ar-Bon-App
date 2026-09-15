import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { EmptyState, FileCard, Screen } from '../../components';
import { Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FolderDetail'>;

export function FolderDetailScreen({ navigation, route }: Props) {
  const { folderId } = route.params;
  const { colors } = useTheme();
  const folders = useAppStore((s) => s.folders);
  const getFolderFiles = useAppStore((s) => s.getFolderFiles);

  const folder = useMemo(
    () => folders.find((item) => item.id === folderId),
    [folderId, folders],
  );
  const files = getFolderFiles(folderId);

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>
        {folder?.name ?? 'Folder'}
      </Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {files.length} file di folder ini
      </Text>

      {files.length === 0 ? (
        <EmptyState
          title="Folder kosong"
          subtitle="Pindahkan file ke folder ini dari layar preview (fitur move via store)."
        />
      ) : (
        files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onPress={() => navigation.navigate('FilePreview', { fileId: file.id })}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
  },
  meta: {
    marginBottom: 16,
  },
});
