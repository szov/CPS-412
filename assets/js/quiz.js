import { PASSES } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';
import { shuffleArray, pickRandom } from './utils.js';
import { saveProgress } from './storage.js';
import { updateStats, showEmptyState, updatePassNav } from './stats.js';

export function getFilteredQuestions() {
  let filtered = [...state.questions];

  if (state.currentTopic !== 'all') {
    filtered = filtered.filter((q) => q.topic === state.currentTopic);
  }

  if (state.currentPass === PASSES.FILTER) {
    filtered = filtered.filter((q) => !state.confidence[q.id]);
  } else if (state.currentPass === PASSES.REVIEW) {
    filtered = filtered.filter((q) => {
      const conf = state.confidence[q.id];
      return conf === 'yellow' || conf === 'red';
    });
  } else {
    filtered = shuffleArray(filtered);
  }

  return filtered;
}

export function pickNextQuestion() {
  return pickRandom(getFilteredQuestions());
}

export function loadNextQuestion() {
  const q = pickNextQuestion();
  if (!q) {
    showEmptyState();
    return;
  }
  state.currentQuestion = q;
  displayQuestion(q);
}

export function displayQuestion(q) {
  elements.emptyState.classList.add('hidden');
  elements.quizSection.classList.remove('hidden');
  elements.topicTag.textContent = q.topic;

  const conf = state.confidence[q.id];
  if (conf) {
    elements.confidenceTag.textContent = conf.charAt(0).toUpperCase() + conf.slice(1);
    elements.confidenceTag.className = `tag-confidence tag-${conf}`;
    elements.confidenceTag.classList.remove('hidden');
  } else {
    elements.confidenceTag.classList.add('hidden');
  }

  elements.questionText.textContent = q.question;
  elements.optionsContainer.innerHTML = '';
  elements.feedbackContainer.classList.add('hidden');
  elements.confidenceControls.classList.add('hidden');
  elements.viewReferenceBtn.classList.add('hidden');
  elements.nextQuestion.classList.remove('hidden');

  const shuffled = shuffleArray(q.options.map((text, originalIndex) => ({ text, originalIndex })));
  q._shuffledOptions = shuffled;
  q._shuffledCorrectIndex = shuffled.findIndex((o) => o.originalIndex === q.correctIndex);

  shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.type = 'button';

    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = String.fromCharCode(65 + i);

    const label = document.createElement('span');
    label.textContent = opt.text;

    btn.append(letter, label);
    btn.addEventListener('click', () => handleAnswer(i));
    elements.optionsContainer.appendChild(btn);
  });
}

export function handleAnswer(idx) {
  const q = state.currentQuestion;
  if (!q) return;

  const isCorrect = idx === q._shuffledCorrectIndex;

  if (!state.progress[q.id]) {
    state.progress[q.id] = { correct: 0, incorrect: 0 };
  }
  if (isCorrect) state.progress[q.id].correct++;
  else state.progress[q.id].incorrect++;

  saveProgress();
  showFeedback(isCorrect, idx, q);
  updateStats();

  window.dispatchEvent(new CustomEvent('quiz:answered'));
}

export function showFeedback(isCorrect, idx, q) {
  const btns = elements.optionsContainer.querySelectorAll('.option-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === idx) btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
    if (i === q._shuffledCorrectIndex && !isCorrect) btn.classList.add('correct-answer');
  });

  elements.feedbackContainer.className = `feedback-stage ${isCorrect ? 'correct' : 'incorrect'}`;
  elements.feedbackResult.textContent = isCorrect ? 'Correct' : 'Incorrect';
  elements.explanationText.textContent = q.explanation;
  elements.feedbackContainer.classList.remove('hidden');

  if (state.currentPass === PASSES.FILTER || state.currentPass === PASSES.REVIEW) {
    elements.confidenceControls.classList.remove('hidden');
    elements.nextQuestion.classList.add('hidden');
    elements.viewReferenceBtn.classList.toggle('hidden', state.currentPass !== PASSES.REVIEW);
  } else {
    elements.confidenceControls.classList.add('hidden');
    elements.viewReferenceBtn.classList.add('hidden');
    elements.nextQuestion.classList.remove('hidden');
  }
}

export function setConfidence(level) {
  if (!state.currentQuestion) return;
  state.confidence[state.currentQuestion.id] = level;
  saveProgress();
  updateStats();
  loadNextQuestion();
  window.dispatchEvent(new CustomEvent('quiz:answered'));
}

export function setPass(pass) {
  state.currentPass = pass;
  saveProgress();
  updatePassNav();
  updateStats();
  loadNextQuestion();
}

export function resetFilters() {
  state.currentTopic = 'all';
  document.querySelectorAll('.filter-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.topic === 'all');
  });
  loadNextQuestion();
}

export function viewReference() {
  elements.explanationText.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
