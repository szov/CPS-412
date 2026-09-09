export const STORAGE_KEYS = {
  progress: 'cps412_progress_v2',
  legacyProgress: 'cps412_progress',
  theme: 'theme',
  syncCode: 'cps412_sync_code',
  rememberSyncCode: 'cps412_remember_sync_code',
  autosave: 'cps412_autosave',
  lastSync: 'cps412_last_sync',
};

export const PASSES = {
  FILTER: 1,
  REVIEW: 2,
  SIMULATION: 3,
};

export const TOPIC_DISPLAY_NAMES = {
  'ACM Code of Ethics': 'ACM Ethics',
  'CS as a Catalyst': 'Catalyst',
  'Computer Security': 'Security',
  'Green computing': 'Green Comp.',
  'Intellectual Property': 'Int. Prop.',
  'Networked Communications': 'Networked',
};

// Firebase browser config. These keys are public by design (same as any
// client-side Firebase app) and are locked down via Realtime Database rules,
// not secrecy. See README for the recommended rules.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBS45zUzZIyGSs9Il1x7cwRPv3alZ38J1I',
  authDomain: 'ethics-mastery.firebaseapp.com',
  databaseURL: 'https://ethics-mastery-default-rtdb.firebaseio.com',
  projectId: 'ethics-mastery',
  storageBucket: 'ethics-mastery.firebasestorage.app',
  messagingSenderId: '730214166940',
  appId: '1:730214166940:web:0cf5789b9f34b4b5869859',
};
