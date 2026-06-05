import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { saveProfileLocally } from './dexie';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI"
};

const hasRealFirebaseConfig = Object.values(firebaseConfig).every((value) => {
  const text = String(value ?? '').trim();
  return text.length > 0 && !text.startsWith('SUA_') && !text.startsWith('SEU_');
});

const app = hasRealFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const isFirebaseReady = Boolean(db);

export const saveProfileToCloud = async (userId: string, profile: Record<string, unknown>) => {
  if (!db) {
    throw new Error('Firebase não configurado. Configure as credenciais reais do Firebase para salvar na nuvem.');
  }

  await setDoc(
    doc(db, 'profiles', userId),
    {
      ...profile,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await saveProfileLocally(profile as any);
};

export const loadProfileFromCloud = async (userId: string) => {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'profiles', userId));
  return snapshot.exists() ? snapshot.data() : null;
};

export const savePreferredSportsToCloud = async (userId: string, sports: string[]) => {
  if (!db) {
    throw new Error('Firebase não configurado. Configure as credenciais reais do Firebase para salvar na nuvem.');
  }

  await setDoc(doc(db, 'preferences', userId), { sports, updatedAt: serverTimestamp() }, { merge: true });
};

export const loadPreferredSportsFromCloud = async (userId: string) => {
  if (!db) return null;

  const snapshot = await getDoc(doc(db, 'preferences', userId));
  return snapshot.exists() ? snapshot.data() : null;
};

export const saveSettingsToCloud = async (userId: string, settings: Record<string, unknown>) => {
  if (!db) throw new Error('Firebase não configurado.');
  await setDoc(doc(db, 'settings', userId), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};

export const loadSettingsFromCloud = async (userId: string) => {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'settings', userId));
  return snapshot.exists() ? snapshot.data() : null;
};