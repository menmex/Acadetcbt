import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain || 'cbt-master-b1d65.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId || 'cbt-master-b1d65',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket || 'cbt-master-b1d65.firebasestorage.app',
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App safely
let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('[Firebase App Init Warning]:', e);
  app = getApps()[0] || ({} as any);
}

let _dbInstance: Firestore | null = null;
export function getFirebaseDb(): Firestore | null {
  if (!_dbInstance && app) {
    try {
      _dbInstance = getFirestore(app);
    } catch (err) {
      console.warn('[Firebase Firestore Initializer Notice]:', (err as any)?.message || String(err));
    }
  }
  return _dbInstance;
}

let _storageInstance: FirebaseStorage | null = null;
export function getFirebaseStorage(): FirebaseStorage | null {
  if (!_storageInstance && app) {
    try {
      _storageInstance = getStorage(app);
    } catch (err) {
      console.warn('[Firebase Storage Initializer Notice]:', (err as any)?.message || String(err));
    }
  }
  return _storageInstance;
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    const inst = getFirebaseDb();
    if (inst) {
      const val = (inst as any)[prop];
      if (typeof val === 'function') {
        return val.bind(inst);
      }
      return val;
    }
    return undefined;
  },
});

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    const inst = getFirebaseStorage();
    if (inst) {
      const val = (inst as any)[prop];
      if (typeof val === 'function') {
        return val.bind(inst);
      }
      return val;
    }
    return undefined;
  },
});

export { app };

