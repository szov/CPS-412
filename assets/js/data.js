import { TOPIC_DISPLAY_NAMES } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';
import { cleanupProgressData } from './storage.js';
import { loadNextQuestion } from './quiz.js';
import { updatePassNav, updateStats } from './stats.js';

export function processAnswers(data) {
  if (!data.quizzes) return;

  for (const [topic, questions] of Object.entries(data.quizzes)) {
    state.answers[topic] = {};
    for (const q of questions) {
      state.answers[topic][q.question_number] = {
        correctIndex: q.correct_option_index,
        explanation: q.explanation,
      };
    }
  }
}

export function processQuestions(data) {
  const topic = data.quiz_title;
  for (const q of data.questions) {
    const answerData = state.answers[topic]?.[q.question_number];
    state.questions.push({
      id: `${topic}_${q.question_number}`,
      topic,
      questionNumber: q.question_number,
      question: q.question,
      options: q.options,
      correctIndex: answerData?.correctIndex ?? 0,
      explanation: answerData?.explanation ?? 'No explanation available.',
    });
  }
}

export function buildTopicNav(topics) {
  const nav = elements.studyControls;
  if (!nav) return;
  nav.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-link active';
  allBtn.dataset.topic = 'all';
  allBtn.textContent = 'All';
  nav.appendChild(allBtn);

  for (const topic of topics) {
    const btn = document.createElement('button');
    btn.className = 'filter-link';
    btn.dataset.topic = topic;
    btn.textContent = TOPIC_DISPLAY_NAMES[topic] || topic;
    nav.appendChild(btn);
  }
}

export async function loadData() {
  try {
    const answersResponse = await fetch('./data/answers.json');
    const answersData = await answersResponse.json();

    processAnswers(answersData);
    state.questions = [];

    const topics = Object.keys(answersData.quizzes || {});
    buildTopicNav(topics);

    const topicDatas = await Promise.all(
      topics.map((topic) => fetch(`./data/${topic}.json`).then((r) => r.json())),
    );
    topicDatas.forEach(processQuestions);

    cleanupProgressData();

    elements.loadingSection.classList.add('hidden');
    updatePassNav();
    updateStats();
    loadNextQuestion();
  } catch {
    elements.loadingSection.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'status-box';

    const msg = document.createElement('p');
    msg.textContent = 'Failed to load quiz data.';

    const retry = document.createElement('button');
    retry.className = 'btn-action';
    retry.type = 'button';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => location.reload());

    box.append(msg, retry);
    elements.loadingSection.appendChild(box);
  }
}
