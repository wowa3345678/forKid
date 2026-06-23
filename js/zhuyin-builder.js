// 注音拼音點選積木元件：吃 data/zhuyin-syllables.js 的 ZHUYIN_SYLLABLES，每題上方顯示一個國字，
// 下方「聲母／韻母／聲調」各一排小積木（聲母／韻母 5 選 1，正解+4 干擾選項；聲調固定 4 個），
// 這個字不需要聲母或韻母時（如「四」沒有韻母、「鴨」沒有聲母）直接不顯示那一排，不用選「空」這種怪選項，
// 點選後可隨時換選，按「確認」評分（即使三排沒選滿也能按，由答題者自己決定），
// 答對/答錯流程跟 initQuiz 一樣是「答錯立刻揭曉、不能重試」，重用同一批音效/彩花/語音/錯題本函式。
const TONE_MARKS = { 1: "", 2: "ˊ", 3: "ˇ", 4: "ˋ" };
const TONE_DISPLAY = { 1: "ˉ", 2: "ˊ", 3: "ˇ", 4: "ˋ" };

function initZhuyinBuilder(root, syllables, { onBack, onHome, subjectId = "zhuyin-builder" } = {}) {
  const state = {
    questions: shuffle([...syllables]),
    index: 0,
    correctCount: 0,
    answered: false,
    selected: { initial: "", final: "", tone: null }
  };

  prepareQuestion();
  render();

  function prepareQuestion() {
    const q = state.questions[state.index];
    state.selected = { initial: "", final: "", tone: null };
    state.initialOptions = q.initial ? buildOptions(q.initial, window.ZHUYIN_INITIALS) : [];
    state.finalOptions = q.final ? buildOptions(q.final, window.ZHUYIN_FINALS) : [];
    state.toneOptions = [1, 2, 3, 4];
  }

  function buildOptions(correct, pool) {
    const distractors = shuffle(pool.filter((v) => v !== correct)).slice(0, 4);
    return shuffle([correct, ...distractors]);
  }

  function render() {
    if (state.index >= state.questions.length) {
      renderResult();
      return;
    }
    const q = state.questions[state.index];
    const progressPct = Math.round((state.index / state.questions.length) * 100);
    const meta = (window.ZHUYIN_BUILDER_CATEGORY_META || {})[q.category] || { emoji: "🈶", label: "注音" };
    const url = twemojiUrl(q.emoji);

    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="zb-back">◀</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="quiz-counter-pill">${state.index + 1} / ${state.questions.length}</div>
      </div>
      <div class="quiz-meta-row">
        <span class="quiz-cat-chip">${meta.emoji} ${meta.label}</span>
        <span class="quiz-score">⭐ ${state.correctCount} 分</span>
      </div>
      <div class="quiz-prompt">
        <img class="prompt-emoji-img" src="${url}" alt="${escapeHtml(q.emoji)}" onerror="this.outerHTML='<span class=&quot;prompt-emoji&quot;>${q.emoji}</span>'">
        <span class="zb-target-char">${escapeHtml(q.char)}</span>
        <span class="prompt-caption">請選出這個字的注音</span>
      </div>
      ${state.answered ? renderFeedback(q) : ""}
      <div class="zb-preview">${renderPreview()}</div>
      ${q.initial ? `
      <div class="zb-block-row">
        <span class="zb-block-label">聲母</span>
        <div class="zb-chip-list">${state.initialOptions.map((v) => renderChip(v, q.initial, "initial")).join("")}</div>
      </div>` : ""}
      ${q.final ? `
      <div class="zb-block-row">
        <span class="zb-block-label">韻母</span>
        <div class="zb-chip-list">${state.finalOptions.map((v) => renderChip(v, q.final, "final")).join("")}</div>
      </div>` : ""}
      <div class="zb-block-row">
        <span class="zb-block-label">聲調</span>
        <div class="zb-chip-list">${state.toneOptions.map((v) => renderToneChip(v, q.tone)).join("")}</div>
      </div>
      ${state.answered
        ? `<button class="next-button" id="zb-next">${state.index + 1 >= state.questions.length ? "查看結果 🏆" : "下一題 →"}</button>`
        : `<button class="confirm-button" id="zb-confirm">✅ 確認</button>`}
    `;

    root.querySelector("#zb-back").addEventListener("click", () => onBack && onBack());

    if (state.answered) {
      root.querySelector("#zb-next").addEventListener("click", () => {
        state.index += 1;
        state.answered = false;
        if (state.index < state.questions.length) prepareQuestion();
        render();
      });
    } else {
      root.querySelector("#zb-confirm").addEventListener("click", () => handleConfirm(q));
      root.querySelectorAll(".zb-chip[data-initial]").forEach((btn) => {
        btn.addEventListener("click", () => selectPart("initial", btn.dataset.initial));
      });
      root.querySelectorAll(".zb-chip[data-final]").forEach((btn) => {
        btn.addEventListener("click", () => selectPart("final", btn.dataset.final));
      });
      root.querySelectorAll(".zb-chip[data-tone]").forEach((btn) => {
        btn.addEventListener("click", () => selectPart("tone", Number(btn.dataset.tone)));
      });
    }
  }

  function selectPart(part, value) {
    if (state.answered) return;
    state.selected[part] = state.selected[part] === value ? (part === "tone" ? null : "") : value;
    render();
  }

  function renderPreview() {
    const tone = state.selected.tone;
    const text = `${state.selected.initial}${state.selected.final}${tone ? TONE_MARKS[tone] : ""}`;
    return text ? `<span class="zb-preview-text">${escapeHtml(text)}</span>` : `<span class="zb-preview-placeholder">✏️ 點選下方積木拼出注音</span>`;
  }

  function renderChip(value, correctValue, part) {
    const selectedValue = state.selected[part];
    const cls = !state.answered
      ? value === selectedValue ? " selected" : ""
      : value === correctValue ? " correct" : value === selectedValue ? " wrong" : " dim";
    return `<button class="zb-chip${cls}" data-${part}="${escapeHtml(value)}" ${state.answered ? "disabled" : ""}>${escapeHtml(value)}</button>`;
  }

  function renderToneChip(tone, correctTone) {
    const selectedTone = state.selected.tone;
    const cls = !state.answered
      ? tone === selectedTone ? " selected" : ""
      : tone === correctTone ? " correct" : tone === selectedTone ? " wrong" : " dim";
    return `<button class="zb-chip zb-tone-chip${cls}" data-tone="${tone}" ${state.answered ? "disabled" : ""}>
      <span class="zb-tone-mark">${TONE_DISPLAY[tone]}</span>
      <span class="zb-tone-label">${tone}聲</span>
    </button>`;
  }

  function renderFeedback(q) {
    const isCorrect = state.selected.initial === q.initial && state.selected.final === q.final && state.selected.tone === q.tone;
    if (isCorrect) {
      return `<div class="feedback-banner is-correct">🎉 ✨ 💥<br>答對了！太棒了！</div>`;
    }
    const correctSpelling = `${q.initial}${q.final}${TONE_MARKS[q.tone]}`;
    return `<div class="feedback-banner is-wrong">💡 正確注音是：<span class="feedback-answer">${escapeHtml(correctSpelling)}</span></div>`;
  }

  function handleConfirm(q) {
    if (state.answered) return;
    state.answered = true;
    const isCorrect = state.selected.initial === q.initial && state.selected.final === q.final && state.selected.tone === q.tone;
    if (isCorrect) {
      state.correctCount += 1;
    } else {
      const correctSpelling = `${q.initial}${q.final}${TONE_MARKS[q.tone]}`;
      const selectedSpelling = `${state.selected.initial}${state.selected.final}${state.selected.tone ? TONE_MARKS[state.selected.tone] : ""}`;
      logMistake(subjectId, { id: q.char, letter: q.char, correctAnswer: correctSpelling }, selectedSpelling);
    }
    render();
    if (isCorrect) {
      spawnConfetti(root.querySelector(".quiz-prompt"));
      playCorrectSound();
    } else {
      playWrongSound();
    }
    setTimeout(() => speakText(q.char), 400);
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
        <span class="quiz-cat-chip">🈶 注音拼音</span>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="zb-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="zb-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#zb-retry").addEventListener("click", () => {
      state.questions = shuffle([...syllables]);
      state.index = 0;
      state.correctCount = 0;
      state.answered = false;
      prepareQuestion();
      render();
    });
    root.querySelector("#zb-home").addEventListener("click", () => onHome && onHome());
  }
}
