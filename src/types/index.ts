export type FileCategory = 'image' | 'video' | 'document' | 'audio' | 'other';

export type ThemeMode = 'light' | 'dark' | 'system';

export type SortOption = 'name' | 'date' | 'size';

export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'grid' | 'list';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUri?: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface StoredFile {
  id: string;
  name: string;
  originalName: string;
  uri: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  folderId: string | null;
  isPrivate: boolean;
  isEncrypted: boolean;
  isFavorite: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  autoBackup: boolean;
  appLockEnabled: boolean;
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  defaultViewMode: ViewMode;
  defaultSort: SortOption;
  defaultSortDirection: SortDirection;
  storageLimitBytes: number;
}

export interface StorageStats {
  usedBytes: number;
  totalBytes: number;
  byCategory: Record<FileCategory, number>;
  fileCount: number;
  folderCount: number;
  trashCount: number;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  FilePreview: { fileId: string };
  FolderDetail: { folderId: string };
  Upload: undefined;
  Trash: undefined;
  Settings: undefined;
  Categories: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Files: undefined;
  UploadTab: undefined;
  Search: undefined;
  Profile: undefined;
};
