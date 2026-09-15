import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';
import type { AppSettings } from '../types';
import { getJson, setJson, getString, setString } from './storageService';

export async function getSettings(): Promise<AppSettings> {
  const settings = await getJson<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setJson(STORAGE_KEYS.settings, settings);
}

export async function updateSettings(
  partial: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await getSettings();
  const next = { ...current, ...partial };
  await saveSettings(next);
  return next;
}

export async function isOnboardingComplete(): Promise<boolean> {
  return (await getString(STORAGE_KEYS.onboardingComplete)) === 'true';
}

export async function completeOnboarding(): Promise<void> {
  await setString(STORAGE_KEYS.onboardingComplete, 'true');
}
