import { STORAGE_KEYS } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';
import { saveProgress, cleanupProgressData } from './storage.js';
import { loadNextQuestion } from './quiz.js';
import { updateStats } from './stats.js';
import { showToast } from './toast.js';
import { getFirebase } from './firebase.js';

function setButtonState(btn, enabled, text) {
  if (!btn) return;
  btn.disabled = !enabled;
  btn.textContent = text;
}

export function openSyncModal() {
  const savedCode = localStorage.getItem(STORAGE_KEYS.syncCode);
  const remember = localStorage.getItem(STORAGE_KEYS.rememberSyncCode) === 'true';
  const autosave = localStorage.getItem(STORAGE_KEYS.autosave) !== 'false';

  if (savedCode) elements.syncCodeInput.value = savedCode;
  elements.rememberSyncCode.checked = remember;
  elements.autosaveEnabled.checked = autosave;

  updateSyncModalStatus();
  elements.syncModal.classList.remove('hidden');
}

export function closeSyncModal() {
  elements.syncModal.classList.add('hidden');
}

export function updateSyncModalStatus() {
  elements.localProgressCount.textContent = `${Object.keys(state.confidence).length} answered`;

  const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
  elements.lastSyncedTime.textContent = lastSync
    ? new Date(parseInt(lastSync, 10)).toLocaleString()
    : 'Never';
}

export function saveSyncCodeToStorage() {
  const code = elements.syncCodeInput.value.trim();
  if (!code) return;
  localStorage.setItem(STORAGE_KEYS.syncCode, code);
  localStorage.setItem(STORAGE_KEYS.rememberSyncCode, elements.rememberSyncCode.checked);
  showToast('Sync code saved', 'success');
}

export async function uploadProgress() {
  const syncCode = elements.syncCodeInput.value.trim();
  if (!syncCode) {
    showToast('Please enter a sync code', 'warning');
    return;
  }

  const fb = getFirebase();
  if (!fb) {
    showToast('Sync is unavailable right now', 'error');
    return;
  }

  try {
    setButtonState(elements.uploadBtn, false, 'Uploading...');

    await fb.set(fb.ref(fb.db, `progress/${syncCode}`), {
      progress: state.progress,
      confidence: state.confidence,
      currentPass: state.currentPass,
      lastSync: Date.now(),
    });

    localStorage.setItem(STORAGE_KEYS.lastSync, String(Date.now()));
    updateSyncModalStatus();
    updateSyncStatusIndicator('synced');
    showToast('Progress uploaded successfully!', 'success');

    if (elements.rememberSyncCode.checked) {
      localStorage.setItem(STORAGE_KEYS.syncCode, syncCode);
      localStorage.setItem(STORAGE_KEYS.rememberSyncCode, 'true');
    }
  } catch {
    showToast('Upload failed. Please try again.', 'error');
  } finally {
    setButtonState(elements.uploadBtn, true, 'Save to Cloud');
  }
}

export async function downloadProgress() {
  const syncCode = elements.syncCodeInput.value.trim();
  if (!syncCode) {
    showToast('Please enter a sync code', 'warning');
    return;
  }

  const fb = getFirebase();
  if (!fb) {
    showToast('Sync is unavailable right now', 'error');
    return;
  }

  try {
    setButtonState(elements.downloadBtn, false, 'Downloading...');

    const snapshot = await fb.get(fb.ref(fb.db, `progress/${syncCode}`));
    if (!snapshot.exists()) {
      showToast('No saved progress found for this code', 'warning');
      return;
    }

    const data = snapshot.val();
    state.progress = data.progress || {};
    state.confidence = data.confidence || {};
    state.currentPass = data.currentPass || 1;

    const cleaned = cleanupProgressData();
    saveProgress();
    updateStats();
    loadNextQuestion();

    localStorage.setItem(STORAGE_KEYS.lastSync, String(data.lastSync || Date.now()));
    updateSyncModalStatus();
    updateSyncStatusIndicator('synced');

    const count = Object.keys(state.confidence).length;
    showToast(
      cleaned > 0
        ? `Downloaded ${count} questions! (${cleaned} old entries cleaned)`
        : `Downloaded ${count} questions!`,
      'success',
    );

    if (elements.rememberSyncCode.checked) {
      localStorage.setItem(STORAGE_KEYS.syncCode, syncCode);
      localStorage.setItem(STORAGE_KEYS.rememberSyncCode, 'true');
    }
  } catch {
    showToast('Download failed. Please try again.', 'error');
  } finally {
    setButtonState(elements.downloadBtn, true, 'Load from Cloud');
  }
}

export async function autosaveProgress() {
  if (localStorage.getItem(STORAGE_KEYS.autosave) === 'false') return;

  const fb = getFirebase();
  if (!fb) return;

  const syncCode = localStorage.getItem(STORAGE_KEYS.syncCode);
  if (!syncCode) return;

  try {
    await fb.set(fb.ref(fb.db, `progress/${syncCode}`), {
      progress: state.progress,
      confidence: state.confidence,
      currentPass: state.currentPass,
      lastSync: Date.now(),
    });

    localStorage.setItem(STORAGE_KEYS.lastSync, String(Date.now()));
    updateSyncStatusIndicator('synced');
    showToast('Progress auto-saved', 'success', 2000);
  } catch {
    updateSyncStatusIndicator('unsaved');
  }
}

export function updateSyncStatusIndicator(status) {
  const dot = elements.syncStatusDot;
  const text = elements.syncStatusText;
  if (!dot || !text) return;

  dot.classList.remove('synced', 'unsaved');

  if (status === 'synced') {
    dot.classList.add('synced');
    text.textContent = 'Synced';
  } else if (status === 'unsaved') {
    dot.classList.add('unsaved');
    text.textContent = 'Unsaved';
  } else {
    text.textContent = 'Sync';
  }
}

export function checkSyncStatus() {
  const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
  const answered = Object.keys(state.confidence).length;

  if (answered > 0 && !lastSync) updateSyncStatusIndicator('unsaved');
  else if (lastSync) updateSyncStatusIndicator('synced');
}

export function initSyncBridge() {
  let pending = false;

  window.addEventListener('quiz:answered', () => {
    updateSyncStatusIndicator('unsaved');
    if (pending) return;
    pending = true;
    queueMicrotask(async () => {
      pending = false;
      await autosaveProgress();
    });
  });
}
