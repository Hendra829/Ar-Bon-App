import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Radius, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import { Button, TextField } from '../common';

interface PromptModalProps {
  visible: boolean;
  title: string;
  label: string;
  initialValue?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  visible,
  title,
  label,
  initialValue = '',
  confirmText = 'Simpan',
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TextField label={label} value={value} onChangeText={setValue} autoFocus />
          <View style={styles.actions}>
            <Button title="Batal" variant="ghost" onPress={onCancel} style={styles.btn} />
            <Button
              title={confirmText}
              onPress={() => onConfirm(value)}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
  },
});
