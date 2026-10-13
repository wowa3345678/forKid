// 分與合教學元件：把 10 以內的數字分成兩組、再合起來，分成三個分頁：
//   🔬 探索：選一種東西跟總數，點一下東西它就跑到另一盤，下方即時顯示「L + R = T」跟所有分法一覽
//   🏠 分合屋：分合屋圖 + 同一間屋子變出 1 個加法、2 個減法算式 + 生活小故事（可以唸出來）
//   🎯 練習：不在這裡出題，呼叫 opts.onPractice 交給 app.js 用 initMathQuiz 開分與合練習
// 探索跟分合屋共用同一份 total/left 狀態，切分頁時分法不會跑掉。這是教學流程不是測驗，不記錄錯題。
// 重用 js/quiz.js 的 twemojiUrl()/escapeHtml()/speakText()。
const NUMBER_BOND_ITEMS = [
  { emoji: "🍎", name: "蘋果", unit: "個" },
  { emoji: "🍊", name: "橘子", unit: "個" },
  { emoji: "🍓", name: "草莓", unit: "顆" },
  { emoji: "🍇", name: "葡萄", unit: "串" },
  { emoji: "🍌", name: "香蕉", unit: "根" },
  { emoji: "🐣", name: "小雞", unit: "隻" },
  { emoji: "⭐", name: "星星", unit: "顆" },
  { emoji: "🌸", name: "花", unit: "朵" }
];
const NUMBER_BOND_MIN = 2;
const NUMBER_BOND_MAX = 10;

// 分合屋圖：屋頂是總數，下面兩格是分開的兩組。三個參數都可以是 HTML（例如練習題挖空的「?」），
// 也給 js/math-quiz.js 的 show:"house" 題目共用，所以宣告成全域函式。
function renderBondHouse(totalHtml, leftHtml, rightHtml, extraClass = "") {
  return `
    <div class="bond-house ${extraClass}">
      <div class="bond-roof"><span class="bond-total">${totalHtml}</span></div>
      <svg class="bond-legs" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true">
        <line x1="120" y1="0" x2="60" y2="40" />
        <line x1="120" y1="0" x2="180" y2="40" />
      </svg>
      <div class="bond-children">
        <span class="bond-part is-left">${leftHtml}</span>
        <span class="bond-part is-right">${rightHtml}</span>
      </div>
    </div>
  `;
}

function initNumberBond(root, { onBack, onPractice } = {}) {
  const state = {
    tab: "explore",
    item: NUMBER_BOND_ITEMS[0],
    total: 8,
    left: 3,
    justMoved: null,
    revealed: false
  };

  render();

  function right() {
    return state.total - state.left;
  }

  function setSplit(left, { speak = true } = {}) {
    state.left = Math.max(0, Math.min(state.total, left));
    state.revealed = false;
    render();
    if (speak) speakText(`${state.total} 可以分成 ${state.left} 和 ${right()}`);
  }

  function setTotal(n) {
    state.total = n;
    state.justMoved = null;
    setSplit(Math.floor(n / 2), { speak: false });
    speakText(`${n}`);
  }

  function itemImg(cls = "") {
    const { emoji } = state.item;
    return `<img class="nb-item-img ${cls}" src="${twemojiUrl(emoji)}" alt="${escapeHtml(emoji)}" onerror="this.outerHTML='<span class=&quot;nb-item-emoji&quot;>${emoji}</span>'">`;
  }

  function num(value, side) {
    return `<span class="nb-num is-${side}">${value}</span>`;
  }

  function render() {
    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="nb-back">◀</button>
        <span class="quiz-cat-chip">🏠 分與合</span>
      </div>
      <div class="nb-tabs">
        <button class="nb-tab${state.tab === "explore" ? " is-active" : ""}" data-tab="explore">🔬 探索</button>
        <button class="nb-tab${state.tab === "house" ? " is-active" : ""}" data-tab="house">🏠 分合屋</button>
        <button class="nb-tab" data-tab="practice">🎯 練習</button>
      </div>
      ${state.tab === "explore" ? renderExplore() : renderHouseTab()}
    `;
    state.justMoved = null;

    root.querySelector("#nb-back").addEventListener("click", () => onBack && onBack());
    root.querySelectorAll(".nb-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.tab === "practice") {
          if (onPractice) onPractice();
          return;
        }
        state.tab = btn.dataset.tab;
        render();
      });
    });
    root.querySelectorAll(".nb-total-btn").forEach((btn) => {
      btn.addEventListener("click", () => setTotal(Number(btn.dataset.total)));
    });

    if (state.tab === "explore") wireExplore();
    else wireHouseTab();
  }

  function renderTotalPicker() {
    const nums = [];
    for (let n = NUMBER_BOND_MIN; n <= NUMBER_BOND_MAX; n++) nums.push(n);
    return `
      <div class="nb-card">
        <p class="nb-card-title">總共有幾個？</p>
        <div class="nb-total-row">
          ${nums.map((n) => `<button class="nb-total-btn${n === state.total ? " is-active" : ""}" data-total="${n}">${n}</button>`).join("")}
        </div>
      </div>
    `;
  }

  // ---------- 🔬 探索 ----------
  function renderExplore() {
    const L = state.left, R = right(), T = state.total;
    const pairs = [];
    for (let a = 0; a <= T; a++) pairs.push(a);

    return `
      <div class="nb-card">
        <p class="nb-card-title">選一種東西</p>
        <div class="nb-item-row">
          ${NUMBER_BOND_ITEMS.map((it) => `
            <button class="nb-item-pick${it.emoji === state.item.emoji ? " is-active" : ""}" data-emoji="${escapeHtml(it.emoji)}" aria-label="${it.name}">
              <img class="nb-item-img" src="${twemojiUrl(it.emoji)}" alt="${escapeHtml(it.emoji)}" onerror="this.outerHTML='<span class=&quot;nb-item-emoji&quot;>${it.emoji}</span>'">
            </button>`).join("")}
        </div>
      </div>
      ${renderTotalPicker()}
      <div class="nb-card">
        <p class="nb-card-title">點一下，它會跑到另一邊喔！</p>
        <div class="nb-plates">
          ${renderPlate("left", L)}
          ${renderPlate("right", R)}
        </div>
        <div class="nb-equation">
          ${num(L, "left")}<span class="nb-op">+</span>${num(R, "right")}<span class="nb-op">=</span>${num(T, "total")}
        </div>
        <p class="nb-sentence">${T} 可以分成 ${L} 和 ${R}</p>
      </div>
      <div class="nb-card">
        <p class="nb-card-title">${T} 的所有分法</p>
        <div class="nb-pair-grid">
          ${pairs.map((a) => `
            <button class="nb-pair${a === L ? " is-active" : ""}" data-left="${a}">
              ${num(a, "left")}<span class="nb-op">和</span>${num(T - a, "right")}
            </button>`).join("")}
        </div>
      </div>
    `;
  }

  function renderPlate(side, count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const isNew = state.justMoved === side && i === count - 1;
      items.push(`<button class="nb-item${isNew ? " is-new" : ""}" data-side="${side}">${itemImg()}</button>`);
    }
    return `
      <div class="nb-plate is-${side}">
        <span class="nb-plate-label">${side === "left" ? "左邊" : "右邊"} ${count} ${state.item.unit}</span>
        <div class="nb-plate-items">${items.join("") || `<span class="nb-plate-empty">空空的</span>`}</div>
      </div>
    `;
  }

  function wireExplore() {
    root.querySelectorAll(".nb-item-pick").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.item = NUMBER_BOND_ITEMS.find((it) => it.emoji === btn.dataset.emoji);
        render();
      });
    });
    root.querySelectorAll(".nb-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const fromLeft = btn.dataset.side === "left";
        state.justMoved = fromLeft ? "right" : "left";
        setSplit(state.left + (fromLeft ? -1 : 1));
      });
    });
    root.querySelectorAll(".nb-pair").forEach((btn) => {
      btn.addEventListener("click", () => setSplit(Number(btn.dataset.left)));
    });
  }

  // ---------- 🏠 分合屋 ----------
  function storyLines() {
    const L = state.left, R = right(), T = state.total;
    const { name, unit } = state.item;
    const count = (n) => (n === 0 ? `0 ${unit}（一${unit}都沒有）` : `${n} ${unit}`);
    return {
      text: `這裡有 ${T} ${unit}${name}，分給哥哥 ${count(L)}，分給妹妹 ${count(R)}。`,
      formulas: [
        { tag: "加法", cls: "is-add", expr: [num(L, "left"), "+", num(R, "right"), "=", num(T, "total")], hint: `哥哥的加妹妹的，合起來 ${T} ${unit}` },
        { tag: "減法", cls: "is-sub", expr: [num(T, "total"), "−", num(L, "left"), "=", num(R, "right")], hint: `拿走哥哥的 ${L} ${unit}，剩下妹妹的 ${R} ${unit}` },
        { tag: "減法", cls: "is-sub", expr: [num(T, "total"), "−", num(R, "right"), "=", num(L, "left")], hint: `拿走妹妹的 ${R} ${unit}，剩下哥哥的 ${L} ${unit}` }
      ]
    };
  }

  function renderHouseTab() {
    const L = state.left, R = right(), T = state.total;
    const story = storyLines();
    const scene = Array.from({ length: T }).map((_, i) => itemImg(i < L ? "is-left" : "is-right")).join("");

    return `
      ${renderTotalPicker()}
      <div class="nb-card nb-house-card">
        ${renderBondHouse(T, L, R)}
        <div class="nb-move-row">
          <button class="nb-move-btn" id="nb-more-left" ${R === 0 ? "disabled" : ""}>◀ 左邊多 1</button>
          <button class="nb-move-btn" id="nb-more-right" ${L === 0 ? "disabled" : ""}>右邊多 1 ▶</button>
        </div>
      </div>
      <div class="nb-card">
        <div class="nb-story-head">
          <p class="nb-card-title">說一個故事</p>
          <button class="nb-speak-btn" id="nb-speak" aria-label="唸故事">🔊</button>
        </div>
        <div class="nb-scene">${scene}</div>
        <p class="nb-story-text">${story.text}</p>
      </div>
      ${state.revealed
        ? `<div class="nb-formula-list">
            ${story.formulas.map((f, i) => `
              <div class="nb-formula" style="animation-delay:${i * 0.15}s">
                <span class="nb-formula-tag ${f.cls}">${f.tag}</span>
                <span class="nb-formula-expr">${f.expr.map((part) => (part.startsWith("<") ? part : `<span class="nb-op">${part}</span>`)).join("")}</span>
                <span class="nb-formula-hint">${f.hint}</span>
              </div>`).join("")}
          </div>`
        : `<button class="next-button nb-reveal-btn" id="nb-reveal">✨ 一間分合屋，變出 3 個算式！</button>`}
    `;
  }

  function wireHouseTab() {
    root.querySelector("#nb-more-left").addEventListener("click", () => setSplit(state.left + 1));
    root.querySelector("#nb-more-right").addEventListener("click", () => setSplit(state.left - 1));
    root.querySelector("#nb-speak").addEventListener("click", () => speakText(storyLines().text));
    const revealBtn = root.querySelector("#nb-reveal");
    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        state.revealed = true;
        render();
        playCorrectSound();
        const L = state.left, R = right(), T = state.total;
        speakText(`${L} 加 ${R} 等於 ${T}，${T} 減 ${L} 等於 ${R}，${T} 減 ${R} 等於 ${L}`);
      });
    }
  }
}
