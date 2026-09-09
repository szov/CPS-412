import { PASSES } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';

export function updateStats() {
  const total = state.questions.length;
  if (total === 0) return;

  let green = 0;
  let yellow = 0;
  let red = 0;

  for (const q of state.questions) {
    const conf = state.confidence[q.id];
    if (conf === 'green') green++;
    else if (conf === 'yellow') yellow++;
    else if (conf === 'red') red++;
  }

  if (elements.masteryPercent && elements.masteryLabel) {
    if (state.currentPass === PASSES.FILTER) {
      elements.masteryPercent.textContent = `${green}/${total}`;
      elements.masteryLabel.textContent = 'Mastered';
    } else if (state.currentPass === PASSES.REVIEW) {
      elements.masteryPercent.textContent = String(yellow + red);
      elements.masteryLabel.textContent = 'To Review';
    } else {
      elements.masteryPercent.textContent = `${Math.round((green / total) * 100)}%`;
      elements.masteryLabel.textContent = 'Mastery';
    }
  }

  if (elements.greenCount) elements.greenCount.textContent = String(green);
  if (elements.yellowCount) elements.yellowCount.textContent = String(yellow);
  if (elements.redCount) elements.redCount.textContent = String(red);

  updateTopicProgress();
}

export function updateTopicProgress() {
  const container = elements.topicProgress;
  if (!container) return;

  container.innerHTML = '';
  const topics = [...new Set(state.questions.map((q) => q.topic))];

  for (const topic of topics) {
    if (state.currentTopic !== 'all' && topic !== state.currentTopic) continue;

    const qs = state.questions.filter((q) => q.topic === topic);
    if (qs.length === 0) continue;

    let green = 0;
    let yellow = 0;
    let red = 0;
    for (const q of qs) {
      const conf = state.confidence[q.id];
      if (conf === 'green') green++;
      else if (conf === 'yellow') yellow++;
      else if (conf === 'red') red++;
    }

    const count = qs.length;
    const greenPct = (green / count) * 100;
    const yellowPct = (yellow / count) * 100;
    const redPct = (red / count) * 100;

    const item = document.createElement('div');
    item.className = 'topic-progress-item';

    const nameRow = document.createElement('div');
    nameRow.className = 'topic-name';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = topic;

    const countSpan = document.createElement('span');
    countSpan.textContent = `${green}/${count}`;

    const bar = document.createElement('div');
    bar.className = 'confidence-bar';

    const greenFill = document.createElement('div');
    greenFill.className = 'confidence-fill green';
    greenFill.style.width = `${greenPct}%`;

    const yellowFill = document.createElement('div');
    yellowFill.className = 'confidence-fill yellow';
    yellowFill.style.width = `${yellowPct}%`;
    yellowFill.style.left = `${greenPct}%`;

    const redFill = document.createElement('div');
    redFill.className = 'confidence-fill red';
    redFill.style.width = `${redPct}%`;
    redFill.style.left = `${greenPct + yellowPct}%`;

    nameRow.append(nameSpan, countSpan);
    bar.append(greenFill, yellowFill, redFill);
    item.append(nameRow, bar);
    container.appendChild(item);
  }
}

export function showEmptyState() {
  elements.quizSection.classList.add('hidden');
  elements.emptyState.classList.remove('hidden');

  const title = elements.emptyState.querySelector('h2');
  const text = elements.emptyState.querySelector('p');

  if (state.currentPass === PASSES.REVIEW) {
    title.textContent = 'All caught up!';
    text.textContent = 'No more yellow or red questions. Move to Pass 3!';
  } else if (state.currentPass === PASSES.SIMULATION) {
    title.textContent = 'Simulation Complete!';
    text.textContent = "You've reviewed all questions in Pass 3.";
  } else {
    title.textContent = 'All categorized!';
    text.textContent = 'All questions have been categorized. Move to Pass 2!';
  }
}

export function updatePassNav() {
  document.querySelectorAll('.pass-btn').forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.pass, 10) === state.currentPass);
  });

  document.querySelectorAll('.pass-description').forEach((desc, idx) => {
    desc.classList.toggle('active', idx + 1 === state.currentPass);
  });
}
