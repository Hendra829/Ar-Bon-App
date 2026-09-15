import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME, APP_TAGLINE, Spacing, Typography } from '../../constants';
import { useTheme } from '../../hooks';
import type { RootStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { delay } from '../../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { brand, colors } = useTheme();
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await delay(900);
      if (!active || !hydrated) {
        return;
      }
      if (!onboardingComplete) {
        navigation.replace('Onboarding');
        return;
      }
      if (!user) {
        navigation.replace('Auth');
        return;
      }
      navigation.replace('Main');
    };
    run();
    return () => {
      active = false;
    };
  }, [hydrated, navigation, onboardingComplete, user]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.logo, { backgroundColor: brand.primary }]}>
        <Text style={styles.logoText}>A</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{APP_NAME}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{APP_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
  },
  title: {
    ...Typography.h1,
  },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
