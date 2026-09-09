import { STORAGE_KEYS } from './config.js';
import { state } from './state.js';

export function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEYS.progress);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.progress = data.progress || {};
      state.confidence = data.confidence || {};
      state.currentPass = data.currentPass || 1;
    } catch {
      state.progress = {};
      state.confidence = {};
    }
    return;
  }

  const legacy = localStorage.getItem(STORAGE_KEYS.legacyProgress);
  if (legacy) {
    try {
      state.progress = JSON.parse(legacy);
    } catch {
      state.progress = {};
    }
  }
}

export function saveProgress() {
  localStorage.setItem(
    STORAGE_KEYS.progress,
    JSON.stringify({
      progress: state.progress,
      confidence: state.confidence,
      currentPass: state.currentPass,
    }),
  );
}

export function cleanupProgressData() {
  const validIds = new Set(state.questions.map((q) => q.id));
  let cleaned = 0;

  for (const key of Object.keys(state.progress)) {
    if (!validIds.has(key)) {
      delete state.progress[key];
      cleaned++;
    }
  }

  for (const key of Object.keys(state.confidence)) {
    if (!validIds.has(key)) {
      delete state.confidence[key];
      cleaned++;
    }
  }

  if (cleaned > 0) saveProgress();
  return cleaned;
}
