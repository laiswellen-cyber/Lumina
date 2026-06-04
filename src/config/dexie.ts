import Dexie, { Table } from 'dexie';

export type ProfileRecord = {
  id?: number;
  name: string;
  email: string;
  password?: string;
  residence?: string;
  sports: string;
  dance: string;
  updatedAt?: number;
};

class LuminaDB extends Dexie {
  profiles!: Table<ProfileRecord, number>;

  constructor() {
    super('lumina-db');
    this.version(1).stores({
      profiles: '++id, email, updatedAt'
    });
  }
}

export const db = new LuminaDB();

export const saveProfileLocally = async (profile: ProfileRecord) => {
  await db.profiles.put({ ...profile, updatedAt: Date.now() });
};

export const loadProfileLocally = async () => {
  return (await db.profiles.toArray()).at(-1) ?? null;
};
