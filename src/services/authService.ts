import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';
import type { AuthCredentials, RegisterPayload, User } from '../types';
import { createId, isEmailValid } from '../utils';
import { getJson, getString, removeKey, setJson, setString } from './storageService';

interface StoredUser extends User {
  password: string;
}

async function getUsers(): Promise<StoredUser[]> {
  return getJson<StoredUser[]>(STORAGE_KEYS.users, []);
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await setJson(STORAGE_KEYS.users, users);
}

export async function register(payload: RegisterPayload): Promise<User> {
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim();
  const password = payload.password;

  if (!name) {
    throw new Error('Nama wajib diisi.');
  }
  if (!isEmailValid(email)) {
    throw new Error('Format email tidak valid.');
  }
  if (password.length < 6) {
    throw new Error('Password minimal 6 karakter.');
  }

  const users = await getUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error('Email sudah terdaftar.');
  }

  const user: StoredUser = {
    id: createId('user'),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveUsers(users);
  await setSession(user.id);

  if (payload.rememberMe) {
    await setString(STORAGE_KEYS.rememberedEmail, email);
  } else {
    await removeKey(STORAGE_KEYS.rememberedEmail);
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function login(credentials: AuthCredentials): Promise<User> {
  const email = credentials.email.trim().toLowerCase();
  const users = await getUsers();
  const matched = users.find(
    (user) => user.email === email && user.password === credentials.password,
  );

  if (!matched) {
    throw new Error('Email atau password salah.');
  }

  await setSession(matched.id);

  if (credentials.rememberMe) {
    await setString(STORAGE_KEYS.rememberedEmail, email);
  } else {
    await removeKey(STORAGE_KEYS.rememberedEmail);
  }

  const { password: _password, ...safeUser } = matched;
  return safeUser;
}

export async function logout(): Promise<void> {
  await removeKey(STORAGE_KEYS.session);
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionUserId = await getString(STORAGE_KEYS.session);
  if (!sessionUserId) {
    return null;
  }

  const users = await getUsers();
  const matched = users.find((user) => user.id === sessionUserId);
  if (!matched) {
    await removeKey(STORAGE_KEYS.session);
    return null;
  }

  const { password: _password, ...safeUser } = matched;
  return safeUser;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  if (!isEmailValid(normalized)) {
    throw new Error('Format email tidak valid.');
  }

  const users = await getUsers();
  const matched = users.find((user) => user.email === normalized);
  if (!matched) {
    // Avoid account enumeration for demo safety messaging
    return 'Jika email terdaftar, instruksi reset telah disimulasikan.';
  }

  return `Reset password disimulasikan untuk ${matched.email}. Gunakan password lama atau daftar ulang di mode demo.`;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'avatarUri'>>,
): Promise<User> {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  users[index] = {
    ...users[index],
    ...updates,
    name: updates.name?.trim() || users[index].name,
  };
  await saveUsers(users);

  const { password: _password, ...safeUser } = users[index];
  return safeUser;
}

export async function getRememberedEmail(): Promise<string | null> {
  return getString(STORAGE_KEYS.rememberedEmail);
}

export async function setAppPin(pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN harus 4-6 digit angka.');
  }
  await SecureStore.setItemAsync(STORAGE_KEYS.appPin, pin);
}

export async function verifyAppPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(STORAGE_KEYS.appPin);
  return Boolean(stored && stored === pin);
}

export async function clearAppPin(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.appPin);
}

async function setSession(userId: string): Promise<void> {
  await setString(STORAGE_KEYS.session, userId);
}
