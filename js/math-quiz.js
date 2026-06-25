// 通用數學測驗元件：加法測驗、減法測驗共用同一套引擎，差異只在 operator（+/-）跟資料內容。
// problemsInput 給 { chick, snake, tiger } 三層物件時，會先顯示「選擇難度」畫面（小雞/蛇/老虎），
// 選完才進入測驗；給單一陣列（如錯題複習單題重練）時，直接跳過難度選擇進入測驗。
// 一題一個算式 4 選 1，答錯立刻揭曉正確答案、不能重試，按「下一題」前進，
// 答錯的題目會記錄到 forkid:mistakes 共用錯題本。
const MATH_QUIZ_DIFFICULTY_META = {
  chick: { icon: "🐥", title: "小雞　簡單", desc2: { "+": "兩位數 + 一位數", "-": "兩位數 − 一位數" } },
  snake: { icon: "🐍", title: "蛇　中等", desc2: { "+": "兩位數 + 兩位數", "-": "兩位數 − 兩位數" } },
  tiger: { icon: "🐯", title: "老虎　困難", desc2: { "+": "三位數 + 三位數", "-": "三位數 − 三位數" } }
};

function initMathQuiz(root, problemsInput, { operator = "+", icon = "🔢", categoryLabel, subjectId, onBack, onHome } = {}) {
  const isTiered = !Array.isArray(problemsInput);
  const state = {
    view: isTiered ? "select" : "quiz",
    pools: isTiered ? problemsInput : null,
    difficulty: null,
    questions: isTiered ? null : shuffle([...problemsInput]),
    index: 0,
    correctCount: 0,
    answered: false,
    selectedValue: null
  };

  if (!isTiered) prepareQuestion();
  render();

  function startDifficulty(level) {
    state.difficulty = level;
    state.questions = shuffle([...state.pools[level]]);
    state.index = 0;
    state.correctCount = 0;
    state.answered = false;
    state.selectedValue = null;
    state.view = "quiz";
    prepareQuestion();
    render();
  }

  function prepareQuestion() {
    const q = state.questions[state.index];
    const correct = operator === "-" ? q.a - q.b : q.a + q.b;
    state.correct = correct;
    state.options = buildChoices(correct);
  }

  function buildChoices(correct) {
    const hints = operator === "-" ? [correct + 10, correct - 1, correct + 1] : [correct - 10, correct - 1, correct + 1];
    const set = new Set();
    hints.forEach((v) => { if (v !== correct && v >= 0) set.add(v); });
    let extra = 2;
    while (set.size < 3) {
      if (correct - extra >= 0) set.add(correct - extra);
      if (set.size < 3) set.add(correct + extra);
      extra += 1;
    }
    return shuffle([correct, ...[...set].slice(0, 3)]);
  }

  function render() {
    if (state.view === "select") {
      renderDifficultySelect();
      return;
    }
    if (state.index >= state.questions.length) {
      renderResult();
      return;
    }
    renderQuestion();
  }

  function renderDifficultySelect() {
    root.innerHTML = `
      <button class="back-pill" id="mq-back">◀ 返回</button>
      <h2 class="section-heading">選擇難度</h2>
      <p class="section-subtitle">選一個你想挑戰的難度！</p>
      <div class="category-list">
        ${Object.keys(MATH_QUIZ_DIFFICULTY_META).map((level) => {
          const meta = MATH_QUIZ_DIFFICULTY_META[level];
          return `
            <button class="category-button cat-${level}" data-level="${level}">
              <span class="row-icon">${meta.icon}</span>
              <span class="row-text">
                <span class="row-title">${meta.title}</span>
                <span class="row-subtitle">${meta.desc2[operator]}</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>
    `;
    root.querySelector("#mq-back").addEventListener("click", () => onBack && onBack());
    root.querySelectorAll(".category-button").forEach((btn) => {
      btn.addEventListener("click", () => startDifficulty(btn.dataset.level));
    });
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const progressPct = Math.round((state.index / state.questions.length) * 100);

    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="mq-back">◀</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="quiz-counter-pill">${state.index + 1} / ${state.questions.length}</div>
      </div>
      <div class="quiz-meta-row">
        <span class="quiz-cat-chip">${icon} ${categoryLabel}</span>
        <span class="quiz-score">⭐ ${state.correctCount} 分</span>
      </div>
      <div class="quiz-prompt">
        <span class="prompt-text">${q.a} ${operator} ${q.b} = ?</span>
        ${state.answered ? renderCaption() : `<span class="prompt-caption">選出正確答案</span>`}
      </div>
      <div class="quiz-options">
        ${state.options.map((v) => `<button class="option-button${optionClass(v)}" data-value="${v}" ${state.answered ? "disabled" : ""}>
          <span class="option-text">${v}</span>
        </button>`).join("")}
      </div>
      ${state.answered ? `<button class="next-button" id="mq-next">${state.index + 1 >= state.questions.length ? "查看結果 🏆" : "下一題 →"}</button>` : ""}
    `;

    root.querySelector("#mq-back").addEventListener("click", () => {
      if (isTiered) {
        state.view = "select";
        render();
      } else if (onBack) {
        onBack();
      }
    });

    if (state.answered) {
      root.querySelector("#mq-next").addEventListener("click", () => {
        state.index += 1;
        state.answered = false;
        state.selectedValue = null;
        if (state.index < state.questions.length) prepareQuestion();
        render();
      });
    } else {
      root.querySelectorAll(".option-button").forEach((btn) => {
        btn.addEventListener("click", () => handleAnswer(Number(btn.dataset.value), q));
      });
    }
  }

  function optionClass(value) {
    if (!state.answered) return "";
    if (value === state.correct) return " correct";
    if (value === state.selectedValue) return " wrong";
    return " dim";
  }

  function renderCaption() {
    const isCorrect = state.selectedValue === state.correct;
    return isCorrect
      ? `<span class="prompt-caption is-correct">🎉 答對了！太棒了！</span>`
      : `<span class="prompt-caption is-wrong">💡 正確答案：<span class="prompt-answer">${state.correct}</span></span>`;
  }

  function handleAnswer(selected, q) {
    if (state.answered) return;
    state.answered = true;
    state.selectedValue = selected;
    const isCorrect = selected === state.correct;
    if (isCorrect) {
      state.correctCount += 1;
    } else {
      logMistake(subjectId, { id: q.id, letter: q.id, correctAnswer: String(state.correct) }, String(selected));
    }
    render();
    if (isCorrect) {
      spawnConfetti(root.querySelector(".quiz-prompt"));
      playCorrectSound();
    } else {
      playWrongSound();
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

    root.innerHTML = `
      <div class="result-box">
        <div class="result-stars">${"⭐".repeat(stars)}</div>
        <div class="result-score-circle">
          <span class="score-num">${state.correctCount}</span>
          <span class="score-total">/ ${total}</span>
        </div>
        <div class="result-message">${message}</div>
        <span class="quiz-cat-chip">${icon} ${categoryLabel}</span>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="mq-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="mq-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#mq-retry").addEventListener("click", () => {
      state.questions = shuffle([...(isTiered ? state.pools[state.difficulty] : problemsInput)]);
      state.index = 0;
      state.correctCount = 0;
      state.answered = false;
      state.selectedValue = null;
      prepareQuestion();
      render();
    });
    root.querySelector("#mq-home").addEventListener("click", () => onHome && onHome());
  }
}
