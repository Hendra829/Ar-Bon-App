import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { STORAGE_KEYS } from '../constants';
import type {
  FileCategory,
  Folder,
  SortDirection,
  SortOption,
  StorageStats,
  StoredFile,
} from '../types';
import { categorizeMimeType, createId, sortFiles } from '../utils';
import { getJson, setJson } from './storageService';

const FILES_DIR = `${FileSystem.documentDirectory ?? ''}arbon-files/`;

async function ensureFilesDir(): Promise<void> {
  if (!FileSystem.documentDirectory) {
    return;
  }
  const info = await FileSystem.getInfoAsync(FILES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FILES_DIR, { intermediates: true });
  }
}

async function getFiles(): Promise<StoredFile[]> {
  return getJson<StoredFile[]>(STORAGE_KEYS.files, []);
}

async function saveFiles(files: StoredFile[]): Promise<void> {
  await setJson(STORAGE_KEYS.files, files);
}

async function getFolders(): Promise<Folder[]> {
  return getJson<Folder[]>(STORAGE_KEYS.folders, []);
}

async function saveFolders(folders: Folder[]): Promise<void> {
  await setJson(STORAGE_KEYS.folders, folders);
}

function activeFiles(files: StoredFile[]): StoredFile[] {
  return files.filter((file) => !file.trashedAt);
}

export async function listFiles(options?: {
  folderId?: string | null;
  category?: FileCategory;
  includeTrash?: boolean;
  query?: string;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
}): Promise<StoredFile[]> {
  const files = await getFiles();
  let result = options?.includeTrash ? files : activeFiles(files);

  if (options?.folderId !== undefined) {
    result = result.filter((file) => file.folderId === options.folderId);
  }
  if (options?.category) {
    result = result.filter((file) => file.category === options.category);
  }
  if (options?.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    result = result.filter((file) => file.name.toLowerCase().includes(q));
  }

  return sortFiles(
    result,
    options?.sortBy ?? 'date',
    options?.sortDirection ?? 'desc',
  );
}

export async function getFileById(id: string): Promise<StoredFile | null> {
  const files = await getFiles();
  return files.find((file) => file.id === id) ?? null;
}

export async function listFolders(): Promise<Folder[]> {
  return getFolders();
}

export async function createFolder(
  name: string,
  parentId: string | null = null,
  isPrivate = false,
): Promise<Folder> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Nama folder wajib diisi.');
  }

  const folders = await getFolders();
  const folder: Folder = {
    id: createId('folder'),
    name: trimmed,
    parentId,
    isPrivate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  folders.push(folder);
  await saveFolders(folders);
  return folder;
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const folders = await getFolders();
  const index = folders.findIndex((folder) => folder.id === id);
  if (index < 0) {
    throw new Error('Folder tidak ditemukan.');
  }
  folders[index] = {
    ...folders[index],
    name: name.trim() || folders[index].name,
    updatedAt: new Date().toISOString(),
  };
  await saveFolders(folders);
  return folders[index];
}

export async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  await saveFolders(folders.filter((folder) => folder.id !== id));

  const files = await getFiles();
  const now = new Date().toISOString();
  await saveFiles(
    files.map((file) =>
      file.folderId === id ? { ...file, folderId: null, trashedAt: file.trashedAt ?? now } : file,
    ),
  );
}

async function persistPickedAsset(asset: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
}): Promise<StoredFile> {
  await ensureFilesDir();

  const id = createId('file');
  const originalName = asset.name?.trim() || `file-${Date.now()}`;
  const extension = originalName.includes('.')
    ? `.${originalName.split('.').pop()}`
    : '';
  const targetUri = FileSystem.documentDirectory
    ? `${FILES_DIR}${id}${extension}`
    : asset.uri;

  if (FileSystem.documentDirectory) {
    await FileSystem.copyAsync({ from: asset.uri, to: targetUri });
  }

  let size = asset.size ?? 0;
  if (!size && FileSystem.documentDirectory) {
    const info = await FileSystem.getInfoAsync(targetUri);
    size = info.exists && 'size' in info ? Number(info.size ?? 0) : 0;
  }

  const now = new Date().toISOString();
  const file: StoredFile = {
    id,
    name: originalName,
    originalName,
    uri: targetUri,
    mimeType: asset.mimeType || 'application/octet-stream',
    size,
    category: categorizeMimeType(asset.mimeType),
    folderId: null,
    isPrivate: false,
    isEncrypted: false,
    isFavorite: false,
    trashedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const files = await getFiles();
  files.unshift(file);
  await saveFiles(files);
  return file;
}

export async function pickAndUploadDocuments(): Promise<StoredFile[]> {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return [];
  }

  const uploaded: StoredFile[] = [];
  for (const asset of result.assets) {
    uploaded.push(
      await persistPickedAsset({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      }),
    );
  }
  return uploaded;
}

export async function pickAndUploadMedia(
  mediaTypes: ImagePicker.MediaTypeOptions = ImagePicker.MediaTypeOptions.All,
): Promise<StoredFile[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin galeri diperlukan untuk upload media.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (result.canceled) {
    return [];
  }

  const uploaded: StoredFile[] = [];
  for (const asset of result.assets) {
    const extension = asset.uri.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg');
    uploaded.push(
      await persistPickedAsset({
        uri: asset.uri,
        name: asset.fileName || `media-${Date.now()}.${extension}`,
        mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        size: asset.fileSize,
      }),
    );
  }
  return uploaded;
}

export async function renameFile(id: string, name: string): Promise<StoredFile> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    throw new Error('File tidak ditemukan.');
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Nama file wajib diisi.');
  }

  files[index] = {
    ...files[index],
    name: trimmed,
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
  return files[index];
}

export async function moveFile(id: string, folderId: string | null): Promise<StoredFile> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    throw new Error('File tidak ditemukan.');
  }

  files[index] = {
    ...files[index],
    folderId,
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
  return files[index];
}

export async function toggleFavorite(id: string): Promise<StoredFile> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    throw new Error('File tidak ditemukan.');
  }
  files[index] = {
    ...files[index],
    isFavorite: !files[index].isFavorite,
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
  return files[index];
}

export async function softDeleteFile(id: string): Promise<void> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    return;
  }
  files[index] = {
    ...files[index],
    trashedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
}

export async function restoreFile(id: string): Promise<void> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    return;
  }
  files[index] = {
    ...files[index],
    trashedAt: null,
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
}

export async function secureDeleteFile(id: string): Promise<void> {
  const files = await getFiles();
  const target = files.find((file) => file.id === id);
  if (!target) {
    return;
  }

  if (FileSystem.documentDirectory && target.uri.startsWith(FileSystem.documentDirectory)) {
    try {
      await FileSystem.deleteAsync(target.uri, { idempotent: true });
    } catch {
      // Ignore missing file on disk
    }
  }

  await saveFiles(files.filter((file) => file.id !== id));
}

export async function emptyTrash(): Promise<void> {
  const files = await getFiles();
  const trash = files.filter((file) => file.trashedAt);
  for (const file of trash) {
    await secureDeleteFile(file.id);
  }
}

export async function shareFile(id: string): Promise<void> {
  const file = await getFileById(id);
  if (!file) {
    throw new Error('File tidak ditemukan.');
  }
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Fitur share tidak tersedia di perangkat ini.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: file.mimeType,
    dialogTitle: `Bagikan ${file.name}`,
  });
}

export async function markAccessed(id: string): Promise<void> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    return;
  }
  files[index] = {
    ...files[index],
    lastAccessedAt: new Date().toISOString(),
  };
  await saveFiles(files);
}

export async function getStorageStats(limitBytes: number): Promise<StorageStats> {
  const files = activeFiles(await getFiles());
  const folders = await getFolders();
  const trash = (await getFiles()).filter((file) => file.trashedAt);

  const byCategory: Record<FileCategory, number> = {
    image: 0,
    video: 0,
    document: 0,
    audio: 0,
    other: 0,
  };

  let usedBytes = 0;
  for (const file of files) {
    usedBytes += file.size;
    byCategory[file.category] += file.size;
  }

  return {
    usedBytes,
    totalBytes: limitBytes,
    byCategory,
    fileCount: files.length,
    folderCount: folders.length,
    trashCount: trash.length,
  };
}

export async function setPrivateFlag(id: string, isPrivate: boolean): Promise<StoredFile> {
  const files = await getFiles();
  const index = files.findIndex((file) => file.id === id);
  if (index < 0) {
    throw new Error('File tidak ditemukan.');
  }
  files[index] = {
    ...files[index],
    isPrivate,
    isEncrypted: isPrivate,
    updatedAt: new Date().toISOString(),
  };
  await saveFiles(files);
  return files[index];
}
