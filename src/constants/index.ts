import type { AppSettings, FileCategory } from '../types';

export const APP_NAME = "AR'BON";
export const APP_TAGLINE = 'Simpan Semua File Anda dengan Aman';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  users: '@arbon/users',
  session: '@arbon/session',
  files: '@arbon/files',
  folders: '@arbon/folders',
  settings: '@arbon/settings',
  onboardingComplete: '@arbon/onboarding_complete',
  rememberedEmail: '@arbon/remembered_email',
  appPin: 'arbon_app_pin',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  autoBackup: false,
  appLockEnabled: false,
  biometricsEnabled: false,
  pinEnabled: false,
  defaultViewMode: 'grid',
  defaultSort: 'date',
  defaultSortDirection: 'desc',
  storageLimitBytes: 5 * 1024 * 1024 * 1024, // 5 GB virtual quota
};

export const CATEGORY_LABELS: Record<FileCategory, string> = {
  image: 'Gambar',
  video: 'Video',
  document: 'Dokumen',
  audio: 'Audio',
  other: 'Lainnya',
};

export const CATEGORY_ICONS: Record<FileCategory, string> = {
  image: 'image',
  video: 'videocam',
  document: 'document-text',
  audio: 'musical-notes',
  other: 'folder',
};

export const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Simpan Semua File',
    description:
      'Upload gambar, video, dokumen, dan audio dalam satu tempat yang rapi dan aman.',
    icon: 'cloud-upload' as const,
  },
  {
    id: '2',
    title: 'Organisasi Cerdas',
    description:
      'Kategori otomatis, folder custom, pencarian cepat, dan filter sesuai kebutuhan Anda.',
    icon: 'albums' as const,
  },
  {
    id: '3',
    title: 'Keamanan Prioritas',
    description:
      'App lock, folder privat, dan kontrol penuh atas file penting Anda.',
    icon: 'shield-checkmark' as const,
  },
];

export const MIME_CATEGORY_MAP: Array<{ test: RegExp; category: FileCategory }> = [
  { test: /^image\//, category: 'image' },
  { test: /^video\//, category: 'video' },
  { test: /^audio\//, category: 'audio' },
  {
    test: /^(application\/(pdf|msword|vnd\.|json|zip|x-zip)|text\/)/,
    category: 'document',
  },
];

export { Colors, Spacing, Radius, Typography, Shadows } from './theme';
