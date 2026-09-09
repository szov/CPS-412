import { FIREBASE_CONFIG } from './config.js';

let api = null;
let initAttempted = false;

export async function initFirebase() {
  if (initAttempted) return api;
  initAttempted = true;

  try {
    const [{ initializeApp }, { getDatabase, ref, set, get }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js'),
    ]);

    const app = initializeApp(FIREBASE_CONFIG);
    const db = getDatabase(app);
    api = { db, ref, set, get };
  } catch {
    api = null;
  }

  return api;
}

export function getFirebase() {
  return api;
}
