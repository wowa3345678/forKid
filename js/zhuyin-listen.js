// 注音易混淆聽辨元件：吃 data/zhuyin-confusables.js 的 ZHUYIN_LISTEN_GROUPS。
// 流程：選一組（ㄢㄤ／ㄣㄥ／ㄏㄈ／捲舌不捲舌）→「先聽聽看」教學頁（兩邊的口訣 + 每組字點了就唸）
// → 選難度練習：🐥 看圖+注音、🐍 只看注音；選擇頁另有 🐯「全部混合」把四組混在一起只看注音。
// 練習時語音唸一個字，畫面只有兩個注音選項（同一組只差一個音的兩個字），小朋友還不識字，所以畫面上不出現國字。
// 左邊一組（sides[0]）的關鍵符號標橘色、右邊（sides[1]）標綠色，跟分與合「左橘右綠」的顏色約定一致。
// 答錯流程跟其它練習一樣「立刻揭曉、不能重試、按下一題前進」，答錯記到 forkid:mistakes（subject: zhuyin-listen）。
// 作答後兩個選項都可以再點來聽，讓小朋友自己比較兩個音哪裡不一樣。
// 錯題複習重練時傳 opts.retry = { questions: [q] }，直接進入那一題（只看注音），練完按 ◀ 呼叫 onBack。
const ZL_ROUND_SIZE = 10;

const ZL_MODE_META = {
  chick: { icon: "🐥", title: "小雞　簡單", desc: "看圖片 + 注音" },
  snake: { icon: "🐍", title: "蛇　中等", desc: "只看注音，不看圖片" }
};

// 優先挑台灣中文語音（iPad 是「美佳」，Windows Edge 是 HsiaoChen/Yating/Hanhan…），找不到才退而求其次用其它中文語音
function zlFindVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices();
  const twVoices = voices.filter((v) => /zh[-_]TW/i.test(v.lang));
  return twVoices.find((v) => /natural/i.test(v.name))
    || twVoices[0]
    || voices.find((v) => /zh[-_]Hant|Taiwan|臺灣|台灣/i.test(`${v.lang} ${v.name}`))
    || voices.find((v) => /^zh/i.test(v.lang))
    || null;
}

// 一次唸一個或依序唸好幾個字；每個字各自一個 utterance，避免語音把兩個字連成詞而變調
function zlSpeak(chars) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const voice = zlFindVoice();
  chars.forEach((char) => {
    const utter = new SpeechSynthesisUtterance(char);
    utter.lang = "zh-TW";
    if (voice) utter.voice = voice;
    utter.rate = 0.75;
    speechSynthesis.speak(utter);
  });
}

// 把每個字組拆成「唸 a」「唸 b」兩題，id 是 `${pair.id}-a` / `${pair.id}-b`；錯題複習也用這個函式靠 id 找回題目
function zlQuestionsOf(groups) {
  return groups.flatMap((group) =>
    group.pairs.flatMap((pair) => ["a", "b"].map((target) => ({ id: `${pair.id}-${target}`, groupKey: group.key, pair, target })))
  );
}

function initZhuyinListen(root, groups, { onBack, onHome, subjectId = "zhuyin-listen", retry } = {}) {
  const state = {
    view: retry ? "quiz" : "select",
    group: null,
    mode: retry ? "snake" : null,
    pool: retry ? retry.questions : null,
    questions: retry ? [...retry.questions] : null,
    index: 0,
    correctCount: 0,
    answered: false,
    selectedSide: null,
    // 每題的兩個選項左右順序隨機，避免「正確答案永遠在左邊」
    options: shuffle(["a", "b"])
  };

  // 語音清單在部分瀏覽器是非同步載入的，載好後重畫一次選擇頁/試聽頁（才能正確顯示「找不到中文語音」提示）。
  // 用 onvoiceschanged 指定（不是 addEventListener），重新進入元件時會蓋掉舊的 handler，不會有舊實例去重畫新畫面。
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = () => {
      if (state.view === "select" || state.view === "parent") render();
    };
  }

  render();
  if (retry) speakTarget();

  function groupOf(q) {
    return groups.find((g) => g.key === q.groupKey);
  }

  function itemOf(q, side) {
    return q.pair[side];
  }

  // 同一組字的兩題不要連續出現，不然小朋友會用「上一題是船、這題應該是床」去猜
  function buildRound(pool) {
    const list = shuffle([...pool]).slice(0, ZL_ROUND_SIZE);
    for (let i = 1; i < list.length; i++) {
      if (list[i].pair.id === list[i - 1].pair.id) {
        const j = list.findIndex((q, k) => k > i && q.pair.id !== list[i - 1].pair.id);
        if (j > -1) [list[i], list[j]] = [list[j], list[i]];
      }
    }
    return list;
  }

  function startQuiz(mode, pool) {
    state.mode = mode;
    state.pool = pool;
    state.questions = buildRound(pool);
    state.index = 0;
    state.correctCount = 0;
    state.answered = false;
    state.selectedSide = null;
    state.options = shuffle(["a", "b"]);
    state.view = "quiz";
    render();
    speakTarget();
  }

  function speakTarget() {
    const q = state.questions[state.index];
    if (q) zlSpeak([itemOf(q, q.target).char]);
  }

  function zhuyinHtml(item, group, side) {
    const symbols = group.sides[side === "a" ? 0 : 1].symbols;
    return Array.from(item.zhuyin)
      .map((ch) => (symbols.includes(ch) ? `<span class="zl-key zl-key-${side}">${ch}</span>` : escapeHtml(ch)))
      .join("");
  }

  function emojiImg(emoji, cls) {
    return `<img class="${cls}" src="${twemojiUrl(emoji)}" alt="${escapeHtml(emoji)}" onerror="this.outerHTML='<span class=&quot;${cls}&quot;>${emoji}</span>'">`;
  }

  function render() {
    if (state.view === "select") renderSelect();
    else if (state.view === "learn") renderLearn();
    else if (state.view === "parent") renderParent();
    else if (state.index >= state.questions.length) renderResult();
    else renderQuestion();
  }

  function voiceWarning() {
    if (!("speechSynthesis" in window)) {
      return `<div class="info-banner"><span class="info-emoji">⚠️</span><span>這個瀏覽器不支援語音，題目唸不出來。</span></div>`;
    }
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0 || zlFindVoice()) return "";
    return `<div class="info-banner"><span class="info-emoji">⚠️</span><span>這台裝置找不到中文語音，題目可能唸不出來。iPad 可以到「設定 › 輔助使用 › 朗讀內容 › 聲音」下載「中文（台灣）」語音。</span></div>`;
  }

  function renderSelect() {
    root.innerHTML = `
      <button class="back-pill" id="zl-back">◀ 返回</button>
      <h2 class="section-heading">注音聽聽看</h2>
      <p class="section-subtitle">選一組容易搞混的音，先聽再練習！</p>
      ${voiceWarning()}
      <div class="category-list">
        ${groups.map((g, i) => `
          <button class="category-button cat-zl-${i + 1}" data-group="${g.key}">
            <span class="row-icon zl-row-icon">${g.icon}</span>
            <span class="row-text">
              <span class="row-title">${escapeHtml(g.title)}</span>
              <span class="row-subtitle">${escapeHtml(g.subtitle)}</span>
            </span>
          </button>
        `).join("")}
        <button class="category-button cat-tiger" id="zl-mixed">
          <span class="row-icon">🐯</span>
          <span class="row-text">
            <span class="row-title">老虎　全部混合</span>
            <span class="row-subtitle">四組混在一起出題，只看注音</span>
          </span>
        </button>
      </div>
      <button class="zl-parent-link" id="zl-parent">👂 家長試聽清單</button>
    `;
    root.querySelector("#zl-back").addEventListener("click", () => onBack && onBack());
    root.querySelectorAll("[data-group]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.group = groups.find((g) => g.key === btn.dataset.group);
        state.view = "learn";
        render();
      });
    });
    root.querySelector("#zl-mixed").addEventListener("click", () => {
      state.group = null;
      startQuiz("tiger", zlQuestionsOf(groups));
    });
    root.querySelector("#zl-parent").addEventListener("click", () => {
      state.view = "parent";
      render();
    });
  }

  function renderWordButton(item, group, side, { showChar = false } = {}) {
    return `
      <button class="zl-word zl-word-${side}" data-char="${escapeHtml(item.char)}">
        ${emojiImg(item.emoji, "zl-word-emoji")}
        ${showChar ? `<span class="zl-word-char">${escapeHtml(item.char)}</span>` : ""}
        <span class="zl-zhuyin">${zhuyinHtml(item, group, side)}</span>
      </button>
    `;
  }

  function bindWordButtons() {
    root.querySelectorAll(".zl-word").forEach((btn) => {
      btn.addEventListener("click", () => zlSpeak([btn.dataset.char]));
    });
    root.querySelectorAll(".zl-pair-play").forEach((btn) => {
      btn.addEventListener("click", () => zlSpeak(btn.dataset.chars.split(",")));
    });
  }

  function renderLearn() {
    const group = state.group;
    root.innerHTML = `
      <button class="back-pill" id="zl-back">◀ 返回</button>
      <h2 class="section-heading">${escapeHtml(group.title)}</h2>
      <div class="zl-sides">
        ${group.sides.map((side, i) => `
          <div class="zl-side zl-side-${i === 0 ? "a" : "b"}">
            <span class="zl-side-symbol">${side.symbols.join(" ")}</span>
            ${side.label !== side.symbols[0] ? `<span class="zl-side-label">${escapeHtml(side.label)}</span>` : ""}
            <span class="zl-side-tip">${escapeHtml(side.tip)}</span>
          </div>
        `).join("")}
      </div>
      <p class="zl-section-label">👂 點一點，聽聽看哪裡不一樣（中間的 🔁 會兩個連著唸）</p>
      <div class="zl-pair-list">
        ${group.pairs.map((pair) => `
          <div class="zl-pair-row">
            ${renderWordButton(pair.a, group, "a")}
            <button class="zl-pair-play" data-chars="${escapeHtml(pair.a.char)},${escapeHtml(pair.b.char)}" aria-label="兩個連著唸">🔁</button>
            ${renderWordButton(pair.b, group, "b")}
          </div>
        `).join("")}
      </div>
      <p class="zl-section-label">🎯 聽懂了嗎？選一個難度來練習！</p>
      <div class="category-list">
        ${Object.keys(ZL_MODE_META).map((mode) => `
          <button class="category-button cat-${mode}" data-mode="${mode}">
            <span class="row-icon">${ZL_MODE_META[mode].icon}</span>
            <span class="row-text">
              <span class="row-title">${ZL_MODE_META[mode].title}</span>
              <span class="row-subtitle">${ZL_MODE_META[mode].desc}</span>
            </span>
          </button>
        `).join("")}
      </div>
    `;
    root.querySelector("#zl-back").addEventListener("click", () => {
      state.view = "select";
      render();
    });
    bindWordButtons();
    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => startQuiz(btn.dataset.mode, zlQuestionsOf([group])));
    });
  }

  // 給家長用：每個字都顯示國字，方便在實際裝置上逐一聽過，確認語音沒有唸錯聲調或破音字
  function renderParent() {
    const voice = zlFindVoice();
    root.innerHTML = `
      <button class="back-pill" id="zl-back">◀ 返回</button>
      <h2 class="section-heading">家長試聽清單</h2>
      <p class="section-subtitle">每個字點一下聽聽看，唸錯的字請記下來換掉</p>
      ${voiceWarning()}
      <div class="info-banner">
        <span class="info-emoji">🗣️</span>
        <span>目前使用的語音：${voice ? `${escapeHtml(voice.name)}（${escapeHtml(voice.lang)}）` : "（瀏覽器預設）"}</span>
      </div>
      ${groups.map((group) => `
        <div class="zl-parent-group">
          <h3 class="zl-parent-title">${escapeHtml(group.title)}</h3>
          <div class="zl-pair-list">
            ${group.pairs.map((pair) => `
              <div class="zl-pair-row">
                ${renderWordButton(pair.a, group, "a", { showChar: true })}
                <button class="zl-pair-play" data-chars="${escapeHtml(pair.a.char)},${escapeHtml(pair.b.char)}" aria-label="兩個連著唸">🔁</button>
                ${renderWordButton(pair.b, group, "b", { showChar: true })}
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    `;
    root.querySelector("#zl-back").addEventListener("click", () => {
      state.view = "select";
      render();
    });
    bindWordButtons();
  }

  function quizLabel() {
    if (state.mode === "tiger") return "全部混合";
    const q = state.questions[0];
    return (state.group || (q && groupOf(q)) || { title: "注音" }).title;
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const group = groupOf(q);
    const target = itemOf(q, q.target);
    const progressPct = Math.round((state.index / state.questions.length) * 100);
    const showEmoji = state.mode === "chick";
    const isCorrect = state.selectedSide === q.target;

    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="zl-back">◀</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="quiz-counter-pill">${state.index + 1} / ${state.questions.length}</div>
      </div>
      <div class="quiz-meta-row">
        <span class="quiz-cat-chip">👂 ${escapeHtml(quizLabel())}</span>
        <span class="quiz-score">⭐ ${state.correctCount} 分</span>
      </div>
      <div class="quiz-prompt">
        <div class="zl-prompt-row">
          ${state.answered ? emojiImg(target.emoji, "zl-prompt-emoji") : ""}
          <button class="zl-speak-big" id="zl-replay" aria-label="再聽一次">🔊</button>
        </div>
        ${!state.answered
          ? `<span class="prompt-caption">聽聽看，是哪一個？（按 🔊 可以再聽一次）</span>`
          : isCorrect
            ? `<span class="prompt-caption is-correct">🎉 答對了！太棒了！</span>`
            : `<span class="prompt-caption is-wrong">💡 正確答案：<span class="prompt-answer zl-zhuyin">${zhuyinHtml(target, group, q.target)}</span></span>`}
      </div>
      <div class="quiz-options zl-options">
        ${state.options.map((side) => {
          const item = itemOf(q, side);
          return `
            <button class="option-button zl-option${showEmoji ? " has-emoji" : ""}${optionClass(side, q)}" data-side="${side}">
              ${showEmoji ? emojiImg(item.emoji, "zl-option-emoji") : ""}
              <span class="zl-zhuyin">${zhuyinHtml(item, group, side)}</span>
            </button>
          `;
        }).join("")}
      </div>
      ${state.answered ? `
        <p class="zl-hint">👆 點上面的選項，可以聽聽看兩個音有什麼不一樣</p>
        <button class="next-button" id="zl-next">${state.index + 1 >= state.questions.length ? "查看結果 🏆" : "下一題 →"}</button>
      ` : ""}
    `;

    root.querySelector("#zl-back").addEventListener("click", () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      if (retry) {
        onBack && onBack();
      } else {
        state.view = state.group ? "learn" : "select";
        render();
      }
    });
    root.querySelector("#zl-replay").addEventListener("click", speakTarget);

    root.querySelectorAll(".zl-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.answered) {
          zlSpeak([itemOf(q, btn.dataset.side).char]);
        } else {
          handleAnswer(btn.dataset.side, q);
        }
      });
    });

    if (state.answered) {
      root.querySelector("#zl-next").addEventListener("click", () => {
        state.index += 1;
        state.answered = false;
        state.selectedSide = null;
        state.options = shuffle(["a", "b"]);
        render();
        speakTarget();
      });
    }
  }

  function optionClass(side, q) {
    if (!state.answered) return "";
    if (side === q.target) return " correct";
    if (side === state.selectedSide) return " wrong";
    return " dim";
  }

  function handleAnswer(side, q) {
    if (state.answered) return;
    state.answered = true;
    state.selectedSide = side;
    const target = itemOf(q, q.target);
    const isCorrect = side === q.target;
    if (isCorrect) {
      state.correctCount += 1;
    } else {
      logMistake(subjectId, { id: q.id, letter: target.char, correctAnswer: target.zhuyin }, itemOf(q, side).zhuyin);
    }
    render();
    if (isCorrect) {
      spawnConfetti(root.querySelector(".quiz-prompt"));
      playCorrectSound();
    } else {
      playWrongSound();
    }
    setTimeout(() => zlSpeak([target.char]), 400);
  }

  function renderResult() {
    const total = state.questions.length;
    const pct = total === 0 ? 0 : state.correctCount / total;
    const stars = pct === 1 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    const message = pct === 1
      ? "太完美了！你的耳朵好厲害！🌟"
      : pct >= 0.6
        ? "做得很好！繼續加油！💪"
        : "再接再厲，多聽幾次就會更好！🌱";

    root.innerHTML = `
      <div class="result-box">
        <div class="result-stars">${"⭐".repeat(stars)}</div>
        <div class="result-score-circle">
          <span class="score-num">${state.correctCount}</span>
          <span class="score-total">/ ${total}</span>
        </div>
        <div class="result-message">${message}</div>
        <span class="quiz-cat-chip">👂 ${escapeHtml(quizLabel())}</span>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="zl-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="zl-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#zl-retry").addEventListener("click", () => startQuiz(state.mode, state.pool));
    root.querySelector("#zl-home").addEventListener("click", () => onHome && onHome());
  }
}
