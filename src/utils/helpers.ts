import { MIME_CATEGORY_MAP } from '../constants';
import type { FileCategory, SortDirection, SortOption, StoredFile } from '../types';

export function createId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function categorizeMimeType(mimeType?: string | null): FileCategory {
  if (!mimeType) {
    return 'other';
  }
  const match = MIME_CATEGORY_MAP.find((item) => item.test.test(mimeType));
  return match?.category ?? 'other';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / k ** i;
  return `${value.toFixed(decimals)} ${sizes[i]}`;
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function getFileExtension(name: string): string {
  const parts = name.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts.pop()?.toLowerCase() ?? '';
}

export function sortFiles(
  files: StoredFile[],
  sortBy: SortOption,
  direction: SortDirection,
): StoredFile[] {
  const sorted = [...files].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
      case 'size':
        return a.size - b.size;
      case 'date':
      default:
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
