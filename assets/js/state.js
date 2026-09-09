import { STORAGE_KEYS } from './config.js';

export const state = {
  questions: [],
  answers: {},
  progress: {},
  confidence: {},
  currentQuestion: null,
  currentTopic: 'all',
  currentPass: 1,
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
};
