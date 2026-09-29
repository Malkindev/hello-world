const DB_NAME = "market-rise-digital";
const DB_VERSION = 1;
const OBJECT_STORE = "app";
const RECORD_KEY = "store-v2";

let dbPromise: Promise<IDBDatabase | null> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(OBJECT_STORE)) {
          request.result.createObjectStore(OBJECT_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

function getFromIndexedDb<T>(db: IDBDatabase): Promise<T | null> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(OBJECT_STORE, "readonly");
      const request = tx.objectStore(OBJECT_STORE).get(RECORD_KEY);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
    } catch (error) {
      reject(error);
    }
  });
}

function putIntoIndexedDb<T>(db: IDBDatabase, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(OBJECT_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB write aborted"));
      tx.objectStore(OBJECT_STORE).put(value, RECORD_KEY);
    } catch (error) {
      reject(error);
    }
  });
}

export async function readPersistedStore<T>(legacyKey: string): Promise<T | null> {
  if (typeof window === "undefined") return null;

  const db = await openDatabase();
  if (db) {
    try {
      const value = await getFromIndexedDb<T>(db);
      if (value !== null) return value;
    } catch (error) {
      console.warn("[Persistence] IndexedDB read failed; checking legacy storage.", error);
    }
  }

  try {
    const raw = window.localStorage.getItem(legacyKey);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn("[Persistence] Legacy localStorage read failed.", error);
    return null;
  }
}

export function writePersistedStore<T>(legacyKey: string, value: T): Promise<void> {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      if (typeof window === "undefined") return;

      const db = await openDatabase();
      if (db) {
        try {
          await putIntoIndexedDb(db, value);
          try {
            window.localStorage.removeItem(legacyKey);
          } catch {
            // The legacy copy is optional once the IndexedDB write succeeds.
          }
          return;
        } catch (error) {
          console.warn("[Persistence] IndexedDB write failed; using localStorage fallback.", error);
        }
      }

      window.localStorage.setItem(legacyKey, JSON.stringify(value));
    });

  return writeQueue;
}
