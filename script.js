const challengeCards = [...document.querySelectorAll('.challenge-card')];
const progress = document.querySelector('#progress');
const progressMessage = document.querySelector('#progress-message');
const completedList = document.querySelector('#completed-list');
const resetBtn = document.querySelector('#reset-btn');
const successModal = document.querySelector('#success-modal');
const closeModalBtn = document.querySelector('#close-modal');
const constellation = document.querySelector('#my-constellation');
const stars = [...document.querySelectorAll('.constellation-stars circle')];
const links = [...document.querySelectorAll('.constellation-links line')];
const STORAGE_KEY = 'routineager-completed';
const MAX_CHALLENGES = 5;
let completedIds = [];
let lastFocusedElement = null;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(saved)) {
    completedIds = [...new Set(saved.filter(id =>
      Number.isInteger(id) && id >= 0 && id < challengeCards.length
    ))].slice(0, MAX_CHALLENGES);
  }
} catch (error) {
  completedIds = [];
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  } catch (error) {
    console.warn('진행 상황을 저장할 수 없습니다.', error);
  }
}

function openModal() {
  lastFocusedElement = document.activeElement;
  successModal.hidden = false;
  closeModalBtn.focus();
}

function closeModal() {
  successModal.hidden = true;
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function render() {
  const count = completedIds.length;
  challengeCards.forEach((card, index) => {
    const done = completedIds.includes(index);
    card.classList.toggle('completed', done);
    card.setAttribute('aria-pressed', String(done));
    card.disabled = !done && count >= MAX_CHALLENGES;
  });

  progress.textContent = `${count} / ${MAX_CHALLENGES} 완료`;
  constellation.setAttribute('aria-label', `다섯 개의 도전으로 완성하는 별자리. 현재 완료 ${count}개`);
  stars.forEach((star, index) => star.classList.toggle('lit', index < count));
  links.forEach((link, index) => link.classList.toggle('lit', index < count - 1 || count === MAX_CHALLENGES && index === MAX_CHALLENGES - 1));

  completedList.replaceChildren();
  if (count === 0) {
    const li = document.createElement('li');
    li.className = 'empty-message';
    li.textContent = '아직 완료한 챌린지가 없어요.';
    completedList.append(li);
    progressMessage.textContent = '첫 번째 작은 도전을 시작해 볼까요?';
  } else {
    completedIds.forEach(id => {
      const li = document.createElement('li');
      li.textContent = challengeCards[id].dataset.challenge;
      completedList.append(li);
    });
    progressMessage.textContent = count === MAX_CHALLENGES
      ? '✦ 다섯 개의 작은 실천으로 별자리를 완성했어요!'
      : `별 ${count}개가 빛나고 있어요. ${MAX_CHALLENGES - count}개가 남았어요.`;
  }
}

challengeCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    const wasComplete = completedIds.length === MAX_CHALLENGES;
    if (completedIds.includes(index)) {
      completedIds = completedIds.filter(id => id !== index);
    } else if (completedIds.length < MAX_CHALLENGES) {
      completedIds.push(index);
    }
    saveProgress();
    render();
    if (!wasComplete && completedIds.length === MAX_CHALLENGES) openModal();
  });
});

resetBtn.addEventListener('click', () => {
  completedIds = [];
  saveProgress();
  render();
  if (!successModal.hidden) closeModal();
});
closeModalBtn.addEventListener('click', closeModal);
successModal.addEventListener('click', event => {
  if (event.target === successModal) closeModal();
});
document.addEventListener('keydown', event => {
  if (successModal.hidden) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    event.preventDefault();
    closeModalBtn.focus();
  }
});
render();
