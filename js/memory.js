// 翻牌記憶卡元件：吃 wordMap（word -> emoji），隨機抽 pairCount 組單字，
// 每組出兩張卡（emoji 卡 + 單字卡），翻兩張配對成功就留著翻開，配對失敗就翻回去。
// 重用 js/quiz.js 已定義的 twemojiUrl()/escapeHtml()/shuffle()/playCorrectSound()/playWrongSound()，
// 所以 index.html 載入順序要排在 js/quiz.js 之後、js/app.js 之前。
function initMemory(root, wordMap, { onBack, onHome, categoryLabel = "", pairCount = 6 } = {}) {
  const state = { cards: [], flipped: [], matched: new Set(), moves: 0, busy: false, mismatchIds: null, loading: true };

  setup();

  function setup() {
    const words = shuffle(Object.keys(wordMap)).slice(0, pairCount);
    const cards = [];
    words.forEach((word) => {
      cards.push({ id: `${word}-emoji`, word, type: "emoji", value: wordMap[word] });
      cards.push({ id: `${word}-word`, word, type: "word", value: word });
    });
    state.cards = shuffle(cards);
    state.flipped = [];
    state.matched = new Set();
    state.moves = 0;
    state.busy = false;
    state.mismatchIds = null;
    state.loading = true;
    renderLoading();
    preloadImages(words.map((word) => twemojiUrl(wordMap[word]))).then(() => {
      state.loading = false;
      render();
    });
  }

  function preloadImages(urls) {
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = url;
          })
      )
    );
  }

  function renderLoading() {
    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="memory-back">◀</button>
        <div class="memory-title">🃏 ${escapeHtml(categoryLabel)}配對</div>
        <div class="quiz-counter-pill">🔁 0</div>
      </div>
      <div class="result-box">
        <div class="result-mascot">🦉</div>
        <div class="result-message">圖片準備中...</div>
      </div>
    `;
    root.querySelector("#memory-back").addEventListener("click", () => onBack && onBack());
  }

  function render() {
    if (state.loading) {
      renderLoading();
      return;
    }
    const totalPairs = state.cards.length / 2;
    if (state.matched.size === totalPairs) {
      renderResult();
      return;
    }
    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="memory-back">◀</button>
        <div class="memory-title">🃏 ${escapeHtml(categoryLabel)}配對</div>
        <div class="quiz-counter-pill">🔁 ${state.moves}</div>
      </div>
      <div class="memory-grid">
        ${state.cards.map((card) => renderCard(card)).join("")}
      </div>
    `;
    root.querySelector("#memory-back").addEventListener("click", () => onBack && onBack());
    root.querySelectorAll(".memory-card").forEach((el) => {
      el.addEventListener("click", () => handleFlip(el.dataset.id));
    });
  }

  function renderCard(card) {
    const isMatched = state.matched.has(card.word);
    const isFlipped = isMatched || state.flipped.some((c) => c.id === card.id);
    const isMismatch = !!(state.mismatchIds && state.mismatchIds.includes(card.id));
    let inner = "❓";
    if (isFlipped) {
      inner = card.type === "emoji"
        ? `<img class="card-emoji-img" src="${twemojiUrl(card.value)}" alt="${escapeHtml(card.value)}" onerror="this.outerHTML='<span>${card.value}</span>'">`
        : `<span class="card-word">${escapeHtml(card.value)}</span>`;
    }
    const cls = `memory-card ${isFlipped ? "face-up" : "face-down"}${isMatched ? " matched" : ""}${isMismatch ? " mismatch" : ""}`;
    return `<button class="${cls}" data-id="${card.id}">${inner}</button>`;
  }

  function handleFlip(id) {
    if (state.busy) return;
    const card = state.cards.find((c) => c.id === id);
    if (!card || state.matched.has(card.word)) return;
    if (state.flipped.some((c) => c.id === id)) return;
    if (state.flipped.length >= 2) return;

    state.flipped.push(card);
    render();

    if (state.flipped.length === 2) {
      state.moves += 1;
      const [a, b] = state.flipped;
      if (a.word === b.word) {
        state.matched.add(a.word);
        state.flipped = [];
        playCorrectSound();
        render();
      } else {
        state.busy = true;
        state.mismatchIds = [a.id, b.id];
        playWrongSound();
        render();
        setTimeout(() => {
          state.flipped = [];
          state.mismatchIds = null;
          state.busy = false;
          render();
        }, 700);
      }
    }
  }

  function renderResult() {
    root.innerHTML = `
      <div class="result-box">
        <div class="result-stars">🎉🎉🎉</div>
        <div class="result-message">全部配對成功！用了 ${state.moves} 次</div>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="memory-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="memory-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#memory-retry").addEventListener("click", setup);
    root.querySelector("#memory-home").addEventListener("click", () => onHome && onHome());
  }
}
