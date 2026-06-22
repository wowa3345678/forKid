// 通用選擇題元件：吃 questions 陣列（schema 見 data/english-mc.js），渲染 prompt + 4 個選項。
// 之後國語/數學的選擇題只要準備同樣 schema 的資料，呼叫 initQuiz 即可重用。
const CATEGORY_META = {
  fruits: { emoji: "🍎", label: "水果" },
  animals: { emoji: "🐶", label: "動物" },
  objects: { emoji: "🧸", label: "其它" }
};

function initQuiz(root, questions, { onBack, onHome, subjectId = "english-mc" } = {}) {
  const state = {
    questions: shuffle([...questions]),
    index: 0,
    correctCount: 0,
    answered: false,
    selectedValue: null,
    options: []
  };

  render();

  function render() {
    if (state.index >= state.questions.length) {
      renderResult();
      return;
    }
    const q = state.questions[state.index];
    if (!state.answered) {
      state.options = shuffle([...q.options]);
    }
    const progressPct = Math.round((state.index / state.questions.length) * 100);
    const meta = CATEGORY_META[q.category] || { emoji: "🧩", label: "綜合" };

    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="quiz-back">◀</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="quiz-counter-pill">${state.index + 1} / ${state.questions.length}</div>
      </div>
      <div class="quiz-meta-row">
        <span class="quiz-cat-chip">${meta.emoji} ${meta.label}</span>
        <span class="quiz-score">⭐ ${state.correctCount} 分</span>
      </div>
      <div class="quiz-prompt">
        ${renderPrompt(q.prompt)}
        <span class="prompt-caption">這是什麼？What is this?</span>
      </div>
      ${state.answered ? renderFeedback(q) : ""}
      <div class="quiz-options">
        ${state.options.map((opt) => `<button class="option-button${optionClass(opt, q)}" data-value="${escapeHtml(opt)}" ${state.answered ? "disabled" : ""}>${escapeHtml(opt)}</button>`).join("")}
      </div>
      ${state.answered ? `<button class="next-button" id="quiz-next">${state.index + 1 >= state.questions.length ? "查看結果 🏆" : "下一題 →"}</button>` : ""}
    `;

    root.querySelector("#quiz-back").addEventListener("click", () => onBack && onBack());

    if (state.answered) {
      root.querySelector("#quiz-next").addEventListener("click", () => {
        state.index += 1;
        state.answered = false;
        state.selectedValue = null;
        render();
      });
    } else {
      root.querySelectorAll(".option-button").forEach((btn) => {
        btn.addEventListener("click", () => handleAnswer(btn.dataset.value, q));
      });
    }
  }

  function optionClass(opt, question) {
    if (!state.answered) return "";
    if (opt === question.correctAnswer) return " correct";
    if (opt === state.selectedValue) return " wrong";
    return " dim";
  }

  function renderFeedback(question) {
    const isCorrect = state.selectedValue === question.correctAnswer;
    if (isCorrect) {
      return `<div class="feedback-banner is-correct">🎉 ✨ 💥<br>答對了！太棒了！</div>`;
    }
    return `<div class="feedback-banner is-wrong">💡 正確答案是：<span class="feedback-answer">${escapeHtml(question.correctAnswer)}</span></div>`;
  }

  function handleAnswer(selected, question) {
    if (state.answered) return;
    state.answered = true;
    state.selectedValue = selected;
    if (selected === question.correctAnswer) {
      state.correctCount += 1;
    } else {
      logMistake(subjectId, question, selected);
    }
    render();
    if (selected === question.correctAnswer) {
      spawnConfetti(root.querySelector(".quiz-prompt"));
    }
  }

  function renderResult() {
    const total = state.questions.length;
    const pct = total === 0 ? 0 : state.correctCount / total;
    const stars = pct === 1 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    const message = pct === 1
      ? "太完美了！你是天才！🌟"
      : pct >= 0.6
        ? "做得很好！繼續加油！💪"
        : "再接再厲，多練習就會更好！🌱";
    const categories = new Set(state.questions.map((q) => q.category));
    const meta = categories.size === 1 ? CATEGORY_META[[...categories][0]] : { emoji: "🌈", label: "綜合" };

    root.innerHTML = `
      <div class="result-box">
        <div class="result-stars">${"⭐".repeat(stars)}</div>
        <div class="result-score-circle">
          <span class="score-num">${state.correctCount}</span>
          <span class="score-total">/ ${total}</span>
        </div>
        <div class="result-message">${message}</div>
        <span class="quiz-cat-chip">${meta.emoji} ${meta.label}</span>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="quiz-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="quiz-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#quiz-retry").addEventListener("click", () => {
      state.questions = shuffle([...questions]);
      state.index = 0;
      state.correctCount = 0;
      state.answered = false;
      state.selectedValue = null;
      render();
    });
    root.querySelector("#quiz-home").addEventListener("click", () => onHome && onHome());
  }

  function renderPrompt(prompt) {
    if (prompt.type === "emoji") {
      const url = twemojiUrl(prompt.value);
      return `<img class="prompt-emoji-img" src="${url}" alt="${escapeHtml(prompt.value)}" onerror="this.outerHTML='<span class=&quot;prompt-emoji&quot;>${prompt.value}</span>'">`;
    }
    if (prompt.type === "text") {
      return `<span class="prompt-text">${escapeHtml(prompt.value)}</span>`;
    }
    return "";
  }
}

// Twemoji（CC-BY 4.0 開源 emoji 圖庫）圖片網址，讓圖案在所有裝置/瀏覽器上長得一致，
// 不依賴系統字型是否收錄該 emoji（例如 Windows 10 沒有 🩻 的字型圖案）。
function twemojiUrl(emoji) {
  const codepoints = Array.from(emoji)
    .map((c) => c.codePointAt(0))
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${codepoints}.png`;
}

// 把答錯的題目記到 localStorage，之後不管哪個科目（國語/數學）共用這一份錯題本。
const MISTAKES_KEY = "forkid:mistakes";

function logMistake(subjectId, question, selectedWrong) {
  let log = [];
  try {
    log = JSON.parse(localStorage.getItem(MISTAKES_KEY)) || [];
  } catch (e) {
    log = [];
  }
  log.push({
    subject: subjectId,
    questionId: question.id,
    letter: question.letter,
    correctAnswer: question.correctAnswer,
    selectedWrong,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(log));
}

function spawnConfetti(container) {
  if (!container) return;
  const pieces = ["✨", "⭐", "🎉"];
  for (let i = 0; i < 5; i++) {
    const span = document.createElement("span");
    span.className = "confetti-piece";
    span.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    span.style.left = `${10 + Math.random() * 80}%`;
    span.style.animationDelay = `${Math.random() * 0.2}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), 900);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
