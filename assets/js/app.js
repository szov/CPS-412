import { bindElements } from './dom.js';
import { loadProgress } from './storage.js';
import { loadTheme } from './theme.js';
import { loadData } from './data.js';
import { setupEventListeners } from './events.js';
import { initFirebase } from './firebase.js';
import { checkSyncStatus, initSyncBridge } from './sync.js';

async function init() {
  bindElements();
  loadTheme();
  loadProgress();
  setupEventListeners();
  initSyncBridge();
  checkSyncStatus();
  await initFirebase();
  await loadData();
}

init();
