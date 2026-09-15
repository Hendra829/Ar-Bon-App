import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants';
import { useAppStore } from '../store/useAppStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.colorSchemeOverride);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [systemScheme, themeMode]);

  const colors = isDark ? Colors.dark : Colors.light;

  return {
    isDark,
    colors,
    brand: {
      primary: Colors.primary,
      secondary: Colors.secondary,
      accent: Colors.accent,
      danger: Colors.danger,
      warning: Colors.warning,
      success: Colors.success,
      info: Colors.info,
    },
  };
}
