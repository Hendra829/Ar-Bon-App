import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../constants';
import { authService, fileService, settingsService } from '../services';
import type {
  AppSettings,
  FileCategory,
  Folder,
  SortDirection,
  SortOption,
  StorageStats,
  StoredFile,
  ThemeMode,
  User,
  ViewMode,
} from '../types';

interface AppState {
  hydrated: boolean;
  bootstrapping: boolean;
  user: User | null;
  onboardingComplete: boolean;
  settings: AppSettings;
  files: StoredFile[];
  folders: Folder[];
  trash: StoredFile[];
  stats: StorageStats | null;
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDirection: SortDirection;
  isLoading: boolean;
  error: string | null;
  colorSchemeOverride: ThemeMode;

  bootstrap: () => Promise<void>;
  clearError: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSort: (sortBy: SortOption, direction?: SortDirection) => void;
  refreshLibrary: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatarUri'>>) => Promise<void>;
  uploadDocuments: () => Promise<number>;
  uploadMedia: () => Promise<number>;
  renameFile: (id: string, name: string) => Promise<void>;
  moveFile: (id: string, folderId: string | null) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  secureDeleteFile: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setFilePrivate: (id: string, isPrivate: boolean) => Promise<void>;
  createFolder: (name: string, isPrivate?: boolean) => Promise<Folder>;
  shareFile: (id: string) => Promise<void>;
  getFilesByCategory: (category: FileCategory) => StoredFile[];
  getFolderFiles: (folderId: string) => StoredFile[];
}

const emptyStats = (limit: number): StorageStats => ({
  usedBytes: 0,
  totalBytes: limit,
  byCategory: { image: 0, video: 0, document: 0, audio: 0, other: 0 },
  fileCount: 0,
  folderCount: 0,
  trashCount: 0,
});

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  bootstrapping: false,
  user: null,
  onboardingComplete: false,
  settings: DEFAULT_SETTINGS,
  files: [],
  folders: [],
  trash: [],
  stats: null,
  viewMode: DEFAULT_SETTINGS.defaultViewMode,
  sortBy: DEFAULT_SETTINGS.defaultSort,
  sortDirection: DEFAULT_SETTINGS.defaultSortDirection,
  isLoading: false,
  error: null,
  colorSchemeOverride: DEFAULT_SETTINGS.themeMode,

  clearError: () => set({ error: null }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSort: (sortBy, direction) =>
    set((state) => ({
      sortBy,
      sortDirection: direction ?? state.sortDirection,
    })),

  bootstrap: async () => {
    if (get().bootstrapping) {
      return;
    }
    set({ bootstrapping: true, isLoading: true, error: null });
    try {
      const [user, onboardingComplete, settings] = await Promise.all([
        authService.getCurrentUser(),
        settingsService.isOnboardingComplete(),
        settingsService.getSettings(),
      ]);

      set({
        user,
        onboardingComplete,
        settings,
        viewMode: settings.defaultViewMode,
        sortBy: settings.defaultSort,
        sortDirection: settings.defaultSortDirection,
        colorSchemeOverride: settings.themeMode,
      });

      if (user) {
        await get().refreshLibrary();
      } else {
        set({
          files: [],
          folders: [],
          trash: [],
          stats: emptyStats(settings.storageLimitBytes),
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Gagal memuat aplikasi.' });
    } finally {
      set({ hydrated: true, bootstrapping: false, isLoading: false });
    }
  },

  refreshLibrary: async () => {
    const { sortBy, sortDirection, settings } = get();
    const [files, folders, trash, stats] = await Promise.all([
      fileService.listFiles({ sortBy, sortDirection }),
      fileService.listFolders(),
      fileService.listFiles({ includeTrash: true }),
      fileService.getStorageStats(settings.storageLimitBytes),
    ]);

    set({
      files,
      folders,
      trash: trash.filter((file) => Boolean(file.trashedAt)),
      stats,
    });
  },

  login: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login({ email, password, rememberMe });
      set({ user });
      await get().refreshLibrary();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login gagal.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register({ name, email, password, rememberMe });
      set({ user });
      await get().refreshLibrary();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Registrasi gagal.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      files: [],
      folders: [],
      trash: [],
      stats: emptyStats(get().settings.storageLimitBytes),
    });
  },

  completeOnboarding: async () => {
    await settingsService.completeOnboarding();
    set({ onboardingComplete: true });
  },

  updateSettings: async (partial) => {
    const settings = await settingsService.updateSettings(partial);
    set({
      settings,
      colorSchemeOverride: settings.themeMode,
      viewMode: settings.defaultViewMode,
      sortBy: settings.defaultSort,
      sortDirection: settings.defaultSortDirection,
    });
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) {
      return;
    }
    const user = await authService.updateProfile(current.id, updates);
    set({ user });
  },

  uploadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const uploaded = await fileService.pickAndUploadDocuments();
      await get().refreshLibrary();
      return uploaded.length;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Upload dokumen gagal.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadMedia: async () => {
    set({ isLoading: true, error: null });
    try {
      const uploaded = await fileService.pickAndUploadMedia();
      await get().refreshLibrary();
      return uploaded.length;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Upload media gagal.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  renameFile: async (id, name) => {
    await fileService.renameFile(id, name);
    await get().refreshLibrary();
  },

  moveFile: async (id, folderId) => {
    await fileService.moveFile(id, folderId);
    await get().refreshLibrary();
  },

  deleteFile: async (id) => {
    await fileService.softDeleteFile(id);
    await get().refreshLibrary();
  },

  restoreFile: async (id) => {
    await fileService.restoreFile(id);
    await get().refreshLibrary();
  },

  secureDeleteFile: async (id) => {
    await fileService.secureDeleteFile(id);
    await get().refreshLibrary();
  },

  emptyTrash: async () => {
    await fileService.emptyTrash();
    await get().refreshLibrary();
  },

  toggleFavorite: async (id) => {
    await fileService.toggleFavorite(id);
    await get().refreshLibrary();
  },

  setFilePrivate: async (id, isPrivate) => {
    await fileService.setPrivateFlag(id, isPrivate);
    await get().refreshLibrary();
  },

  createFolder: async (name, isPrivate = false) => {
    const folder = await fileService.createFolder(name, null, isPrivate);
    await get().refreshLibrary();
    return folder;
  },

  shareFile: async (id) => {
    await fileService.shareFile(id);
  },

  getFilesByCategory: (category) => get().files.filter((file) => file.category === category),

  getFolderFiles: (folderId) => get().files.filter((file) => file.folderId === folderId),
}));
