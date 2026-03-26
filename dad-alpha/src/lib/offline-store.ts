/**
 * IndexedDB-powered offline storage for Dad.alpha PWA.
 */

const DB_NAME = "dad-alpha-offline";
const DB_VERSION = 1;
const CACHE_STORE = "cache";
const QUEUE_STORE = "offline_queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface CachedData<T> { key: string; data: T; updatedAt: string; }

export async function cacheData<T>(key: string, data: T): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CACHE_STORE, "readwrite");
  tx.objectStore(CACHE_STORE).put({ key, data, updatedAt: new Date().toISOString() });
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

export async function getCachedData<T>(key: string): Promise<CachedData<T> | null> {
  const db = await openDB();
  const tx = db.transaction(CACHE_STORE, "readonly");
  const req = tx.objectStore(CACHE_STORE).get(key);
  return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result ?? null); req.onerror = () => reject(req.error); });
}

export interface QueuedOperation {
  id?: number;
  method: "POST" | "PUT" | "DELETE";
  path: string;
  body?: string;
  createdAt: string;
}

export async function enqueueOperation(op: Omit<QueuedOperation, "id" | "createdAt">): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).add({ ...op, createdAt: new Date().toISOString() });
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readonly");
  const req = tx.objectStore(QUEUE_STORE).getAll();
  return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result ?? []); req.onerror = () => reject(req.error); });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).clear();
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).delete(id);
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

export async function replayQueue(onProgress?: (synced: number, total: number) => void): Promise<{ synced: number; failed: number }> {
  const ops = await getQueuedOperations();
  if (ops.length === 0) return { synced: 0, failed: 0 };

  const token = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("dad-alpha-auth") ?? "{}")?.state?.token
    : null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  let synced = 0;
  let failed = 0;

  for (const op of ops) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}${op.path}`, { method: op.method, headers, body: op.body });
      if (res.ok && op.id != null) { await removeFromQueue(op.id); synced++; } else { failed++; }
    } catch { failed++; }
    onProgress?.(synced, ops.length);
  }

  return { synced, failed };
}
