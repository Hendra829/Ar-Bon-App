import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoadingView } from '../components';
import { useTheme } from '../hooks';
import { CategoriesScreen } from '../screens/files/CategoriesScreen';
import { FilePreviewScreen } from '../screens/files/FilePreviewScreen';
import { FolderDetailScreen } from '../screens/files/FolderDetailScreen';
import { TrashScreen } from '../screens/files/TrashScreen';
import { UploadScreen } from '../screens/files/UploadScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isDark, colors, brand } = useTheme();
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!hydrated) {
    return <LoadingView message="Menyiapkan AR'BON..." />;
  }

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: brand.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="FilePreview"
          component={FilePreviewScreen}
          options={{ title: 'Preview' }}
        />
        <Stack.Screen
          name="FolderDetail"
          component={FolderDetailScreen}
          options={{ title: 'Folder' }}
        />
        <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Upload' }} />
        <Stack.Screen name="Trash" component={TrashScreen} options={{ title: 'Trash' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Kategori' }}
        />
      </Stack.Navigator>

      {/* Keep auth/main in sync when session changes after splash */}
      <SessionGate user={user} />
    </NavigationContainer>
  );
}

function SessionGate({ user }: { user: unknown }) {
  // Placeholder component reserved for future global locks (PIN/biometric gate).
  // Currently navigation decisions are handled by Splash and auth actions.
  void user;
  return null;
}
