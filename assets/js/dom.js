export const elements = {};

export function bindElements() {
  const ids = [
    'loadingSection',
    'quizSection',
    'emptyState',
    'themeToggle',
    'syncBtn',
    'syncStatusDot',
    'syncStatusText',
    'topicTag',
    'confidenceTag',
    'questionText',
    'optionsContainer',
    'feedbackContainer',
    'feedbackResult',
    'explanationText',
    'nextQuestion',
    'resetFilters',
    'confidenceControls',
    'viewReferenceBtn',
    'syncModal',
    'closeModal',
    'syncCodeInput',
    'saveSyncCode',
    'rememberSyncCode',
    'lastSyncedTime',
    'localProgressCount',
    'uploadBtn',
    'downloadBtn',
    'autosaveEnabled',
    'toastContainer',
    'studyControls',
    'topicProgress',
    'masteryPercent',
    'masteryLabel',
    'greenCount',
    'yellowCount',
    'redCount',
  ];

  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }

  elements.confGreen = document.getElementById('confGreen');
  elements.confYellow = document.getElementById('confYellow');
  elements.confRed = document.getElementById('confRed');

  return elements;
}
