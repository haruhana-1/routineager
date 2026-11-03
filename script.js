
const challengeCards = document.querySelectorAll(".challenge-card");
const progress = document.querySelector("#progress");
const handImage = document.querySelector("#hand-image");
const progressMessage = document.querySelector("#progress-message");
const completedList = document.querySelector("#completed-list");
const resetBtn = document.querySelector("#reset-btn");

const successModal = document.querySelector("#success-modal");
const closeModalBtn = document.querySelector("#close-modal");

// 브라우저에 저장할 때 사용하는 이름
const STORAGE_KEY = "routineager-completed";

// 저장된 챌린지 번호 불러오기
let completedIds = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (Array.isArray(saved)) {
    completedIds = saved.filter(
      (id) => Number.isInteger(id) &&
              id >= 0 &&
              id < challengeCards.length
    );

    completedIds = [...new Set(completedIds)].slice(0, 5);
  }
} catch (error) {
  completedIds = [];
}

// 진행 상황 저장
function saveProgress() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(completedIds)
  );
}

// 축하 팝업 열기
function openModal() {
  successModal.hidden = false;
}

// 축하 팝업 닫기
function closeModal() {
  successModal.hidden = true;
}

// 화면 전체 갱신
function render() {
  const count = completedIds.length;

  challengeCards.forEach((card, index) => {
    const isCompleted = completedIds.includes(index);

    card.classList.toggle("completed", isCompleted);
    card.setAttribute("aria-pressed", String(isCompleted));
  });

  progress.textContent = `${count} / 5 완료`;

  handImage.src = `hand-${count}.png`;
  handImage.alt = `${count}개 완료, 손가락 ${5 - count}개 남음`;

  completedList.innerHTML = "";

  if (count === 0) {
    const li = document.createElement("li");
    li.className = "empty-message";
    li.textContent = "아직 완료한 챌린지가 없어요.";
    completedList.appendChild(li);

    progressMessage.textContent =
      "첫 번째 작은 도전을 시작해 볼까요?";
  } else {
    completedIds.forEach((id) => {
      const li = document.createElement("li");
      li.textContent = challengeCards[id].dataset.challenge;
      completedList.appendChild(li);
    });

    if (count === 5) {
      progressMessage.textContent =
        "🎉 다섯 개의 도전을 모두 완료했어요!";
    } else {
      progressMessage.textContent =
        `좋아요! 앞으로 ${5 - count}개만 더 완료하면 돼요.`;
    }
  }
}

// 챌린지 카드 클릭
challengeCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (completedIds.includes(index)) {
      return;
    }

    if (completedIds.length >= 5) {
      return;
    }

    completedIds.push(index);

    saveProgress();
    render();

    if (completedIds.length === 5) {
      openModal();
    }
  });
});

// 팝업 닫기 버튼
closeModalBtn.addEventListener("click", closeModal);

// 팝업 바깥쪽 클릭
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) {
    closeModal();
  }
});

// 초기화 버튼
resetBtn.addEventListener("click", () => {
  completedIds = [];

  localStorage.removeItem(STORAGE_KEY);

  render();
  closeModal();
});

// 페이지를 열었을 때 저장된 상태 복원
render();
