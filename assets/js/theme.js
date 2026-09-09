import { STORAGE_KEYS } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';

export function loadTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  if (elements.themeToggle) {
    elements.themeToggle.textContent = state.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

export function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  if (elements.themeToggle) {
    elements.themeToggle.textContent = state.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}
