import { STORAGE_KEYS } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';
import { toggleTheme } from './theme.js';
import {
  handleAnswer,
  loadNextQuestion,
  resetFilters,
  setConfidence,
  setPass,
  viewReference,
} from './quiz.js';
import {
  openSyncModal,
  closeSyncModal,
  saveSyncCodeToStorage,
  uploadProgress,
  downloadProgress,
} from './sync.js';

export function setupEventListeners() {
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.nextQuestion.addEventListener('click', loadNextQuestion);
  elements.resetFilters.addEventListener('click', resetFilters);
  elements.viewReferenceBtn.addEventListener('click', viewReference);

  elements.confGreen.addEventListener('click', () => setConfidence('green'));
  elements.confYellow.addEventListener('click', () => setConfidence('yellow'));
  elements.confRed.addEventListener('click', () => setConfidence('red'));

  document.querySelectorAll('.pass-btn').forEach((btn) => {
    btn.addEventListener('click', () => setPass(parseInt(btn.dataset.pass, 10)));
  });

  elements.studyControls.addEventListener('click', (e) => {
    const target = e.target.closest('.filter-link');
    if (!target) return;
    document.querySelectorAll('.filter-link').forEach((b) => b.classList.remove('active'));
    target.classList.add('active');
    state.currentTopic = target.dataset.topic;
    loadNextQuestion();
  });

  document.addEventListener('keydown', handleKeyboard);

  elements.syncBtn.addEventListener('click', openSyncModal);
  elements.closeModal.addEventListener('click', closeSyncModal);
  elements.saveSyncCode.addEventListener('click', saveSyncCodeToStorage);
  elements.uploadBtn.addEventListener('click', uploadProgress);
  elements.downloadBtn.addEventListener('click', downloadProgress);

  elements.syncModal.addEventListener('click', (e) => {
    if (e.target === elements.syncModal) closeSyncModal();
  });

  elements.autosaveEnabled.addEventListener('change', (e) => {
    localStorage.setItem(STORAGE_KEYS.autosave, e.target.checked);
  });
}

export function handleKeyboard(e) {
  if (e.key === 'Escape') {
    if (!elements.syncModal.classList.contains('hidden')) {
      e.preventDefault();
      closeSyncModal();
    }
    return;
  }

  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const feedbackShown = !elements.feedbackContainer.classList.contains('hidden');
  const confidenceShown = !elements.confidenceControls.classList.contains('hidden');

  if (!feedbackShown) {
    if (e.key >= '1' && e.key <= '9') {
      const btns = elements.optionsContainer.querySelectorAll('.option-btn');
      const btn = btns[parseInt(e.key, 10) - 1];
      if (btn && !btn.disabled) {
        e.preventDefault();
        handleAnswer(parseInt(e.key, 10) - 1);
      }
    }
    return;
  }

  if (confidenceShown) {
    if (e.key === '1') {
      e.preventDefault();
      setConfidence('green');
    } else if (e.key === '2') {
      e.preventDefault();
      setConfidence('yellow');
    } else if (e.key === '3') {
      e.preventDefault();
      setConfidence('red');
    }
    return;
  }

  if (e.key === 'Enter' || e.key === ' ') {
    // Let focused buttons activate natively to avoid double-handling.
    if (e.target.closest('button')) return;
    e.preventDefault();
    loadNextQuestion();
    return;
  }

  if (state.currentPass === 2 && (e.key === 'h' || e.key === 'H')) {
    if (!elements.viewReferenceBtn.classList.contains('hidden')) {
      e.preventDefault();
      viewReference();
    }
  }
}
