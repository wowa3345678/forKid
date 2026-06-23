// 錯題複習元件：讀 js/quiz.js 寫入的 forkid:mistakes 清單，依 subject+questionId 去重後列成清單
// （同一題答錯多次只顯示最新一筆），點一筆會透過 onRetry 跳回那一題的出題元件再練習一次，
// 也支援單筆刪除（✕）跟清除全部。subject 對應原始題庫的查表邏輯集中在 MISTAKE_LOOKUP，
// 之後數學科目要支援錯題複習，只要在這裡補一筆對應 subject 的查表函式即可。
const MISTAKE_LOOKUP = {
  "english-mc": (questionId) => {
    const q = (window.ENGLISH_MC || []).find((item) => item.id === questionId);
    if (!q) return null;
    const meta = (window.CATEGORY_META || {})[q.category] || { label: "綜合" };
    return {
      emoji: q.prompt.value,
      categoryLabel: meta.label,
      launch: (root, opts) => initQuiz(root, [q], opts)
    };
  },
  "zhuyin-builder": (questionId) => {
    const s = (window.ZHUYIN_SYLLABLES || []).find((item) => item.char === questionId);
    if (!s) return null;
    const meta = (window.ZHUYIN_BUILDER_CATEGORY_META || {})[s.category] || { label: "注音" };
    return {
      emoji: s.emoji,
      categoryLabel: meta.label,
      launch: (root, opts) => initZhuyinBuilder(root, [s], opts)
    };
  }
};

// MISTAKES_KEY 已經在 js/quiz.js 宣告過（同一份 forkid:mistakes 錯題本），這裡直接重用，不要重複宣告，
// 不然多個 <script> 標籤共用同一個全域作用域，重複 const 宣告會直接 SyntaxError 讓整個檔案連帶 app.js 都跑不起來。
function loadMistakes() {
  try {
    return JSON.parse(localStorage.getItem(MISTAKES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveMistakes(list) {
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
}

function dedupeMistakes(log) {
  const latestByKey = new Map();
  log.forEach((entry) => {
    const key = `${entry.subject}::${entry.questionId}`;
    const existing = latestByKey.get(key);
    if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
      latestByKey.set(key, entry);
    }
  });
  return [...latestByKey.values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function mistakeBadgeText() {
  const count = dedupeMistakes(loadMistakes()).length;
  return count > 0 ? `${count} 題待複習` : "尚無錯題";
}

function refreshMistakeBadge() {
  const badge = document.querySelector("#mistake-review-badge");
  if (badge) badge.textContent = mistakeBadgeText();
}

function initMistakeReview(root, { onRetry } = {}) {
  render();

  function render() {
    const items = dedupeMistakes(loadMistakes());
    refreshMistakeBadge();

    if (items.length === 0) {
      root.innerHTML = `
        <div class="mistake-empty">
          <div class="mistake-empty-emoji">🎉</div>
          <p class="mistake-empty-title">沒有錯題！</p>
          <p class="mistake-empty-subtitle">繼續保持，你很棒！</p>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="mistake-list">${items.map((entry) => renderRow(entry)).join("")}</div>
      <span class="mistake-clear-all" id="mistake-clear-all">🗑️ 清除全部錯題記錄</span>
    `;

    root.querySelectorAll(".mistake-row").forEach((rowEl) => {
      rowEl.addEventListener("click", () => {
        const { subject, questionId } = rowEl.dataset;
        const lookup = MISTAKE_LOOKUP[subject];
        const info = lookup && lookup(questionId);
        if (info && onRetry) onRetry(subject, info);
      });
    });

    root.querySelectorAll(".mistake-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rowEl = btn.closest(".mistake-row");
        const { subject, questionId } = rowEl.dataset;
        saveMistakes(loadMistakes().filter((m) => !(m.subject === subject && m.questionId === questionId)));
        render();
      });
    });

    root.querySelector("#mistake-clear-all").addEventListener("click", () => {
      saveMistakes([]);
      render();
    });
  }

  function renderRow(entry) {
    const lookup = MISTAKE_LOOKUP[entry.subject];
    const info = lookup && lookup(entry.questionId);
    const emoji = info ? info.emoji : "❓";
    const categoryLabel = info ? info.categoryLabel : "";
    const url = twemojiUrl(emoji);
    return `
      <div class="mistake-row" data-subject="${escapeHtml(entry.subject)}" data-question-id="${escapeHtml(entry.questionId)}">
        <img class="mistake-row-emoji-img" src="${url}" alt="${escapeHtml(emoji)}" onerror="this.outerHTML='<span class=&quot;mistake-row-emoji&quot;>${emoji}</span>'">
        <span class="mistake-row-text">
          <span class="mistake-row-word">${escapeHtml(entry.correctAnswer)}</span>
          <span class="mistake-row-category">${escapeHtml(categoryLabel)}</span>
        </span>
        <button class="mistake-remove" aria-label="移除這筆錯題">✕</button>
      </div>
    `;
  }
}
