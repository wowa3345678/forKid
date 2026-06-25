// 十位數加法進位教學元件：用十格積木視覺化「個位湊滿 10 就綁成 1 個十、搬到十位」這個概念，
// 每題拆成 4 個步驟（算個位 → 綁成一捆十 → 算十位 → 看結果），用點選數字選項代替手寫算式。
// 答錯時跟 initQuiz 一樣立刻揭曉正確答案、不能重試，按「繼續」手動進到下一步。
// 這是教學流程不是測驗，答錯不記錄到 forkid:mistakes 錯題本。
function initCarryAdditionTeach(root, problems, { onBack, onHome } = {}) {
  const state = {
    problems: shuffle([...problems]),
    index: 0
  };

  prepareProblem();
  render();

  function prepareProblem() {
    const p = state.problems[state.index];
    const tensA = Math.floor(p.a / 10), onesA = p.a % 10;
    const tensB = Math.floor(p.b / 10), onesB = p.b % 10;
    const onesSum = onesA + onesB;
    const onesRemainder = onesSum % 10;
    const tensSum = tensA + tensB + 1;
    state.cur = { a: p.a, b: p.b, tensA, onesA, tensB, onesB, onesSum, onesRemainder, tensSum };
    state.onesOptions = buildChoices(onesSum, [onesSum - 1, onesSum + 1, onesRemainder]);
    state.tensOptions = buildChoices(tensSum, [tensSum - 1, tensSum + 1, tensA + tensB]);
    state.step = "ones";
    state.stepAnswered = false;
    state.picked = null;
  }

  function buildChoices(correct, hints) {
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
    if (state.index >= state.problems.length) {
      renderResult();
      return;
    }
    const c = state.cur;
    const progressPct = Math.round((state.index / state.problems.length) * 100);

    root.innerHTML = `
      <div class="quiz-header">
        <button class="back-square" id="cab-back">◀</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="quiz-counter-pill">${state.index + 1} / ${state.problems.length}</div>
      </div>
      <div class="quiz-meta-row">
        <span class="quiz-cat-chip">🔢 進位教學</span>
      </div>
      <div class="quiz-prompt cab-prompt">
        ${renderEquation(c)}
      </div>
      ${renderStepBody(c)}
    `;

    root.querySelector("#cab-back").addEventListener("click", () => onBack && onBack());
    wireStepEvents();
  }

  function digitClass(col) {
    if (state.step === "ones" || state.step === "bundle") return col === "ones" ? " is-active" : "";
    if (state.step === "tens") return col === "tens" ? " is-active" : "";
    return "";
  }

  function renderEquation(c) {
    const showResult = state.step === "result";
    const showCarry = state.step === "tens" || showResult;
    return `
      <div class="cab-equation">
        <div class="cab-row">
          <span class="cab-op"></span>
          <span class="cab-digit${digitClass("tens")}">${showCarry ? `<span class="cab-carry-mark">1</span>` : ""}${c.tensA}</span>
          <span class="cab-digit${digitClass("ones")}">${c.onesA}</span>
        </div>
        <div class="cab-row">
          <span class="cab-op">+</span>
          <span class="cab-digit${digitClass("tens")}">${c.tensB}</span>
          <span class="cab-digit${digitClass("ones")}">${c.onesB}</span>
        </div>
        <div class="cab-line"></div>
        <div class="cab-row">
          <span class="cab-op"></span>
          <span class="cab-digit cab-result-digit${showResult ? " is-filled" : ""}">${showResult ? c.tensSum : "?"}</span>
          <span class="cab-digit cab-result-digit${showResult ? " is-filled" : ""}">${showResult ? c.onesRemainder : "?"}</span>
        </div>
      </div>
    `;
  }

  function renderUnits(n) {
    return Array.from({ length: n }).map(() => `<span class="cab-unit"></span>`).join("");
  }

  function renderRods(n, carried) {
    return Array.from({ length: n }).map(() => `<span class="cab-rod${carried ? " is-carried" : ""}">10</span>`).join("");
  }

  function renderChoiceList(options, prefix) {
    return `
      <div class="quiz-options">
        ${options.map((v) => `<button class="option-button${optionClass(v)}" data-${prefix}="${v}" ${state.stepAnswered ? "disabled" : ""}>
          <span class="option-text">${v}</span>
        </button>`).join("")}
      </div>
    `;
  }

  function optionClass(value) {
    if (!state.stepAnswered) return "";
    const correct = state.step === "ones" ? state.cur.onesSum : state.cur.tensSum;
    if (value === correct) return " correct";
    if (value === state.picked) return " wrong";
    return " dim";
  }

  function renderStepBody(c) {
    if (state.step === "ones") {
      return `
        <div class="cab-blocks-zone">
          <div class="cab-block-group">
            <span class="cab-group-label">${c.onesA}</span>
            <div class="cab-units">${renderUnits(c.onesA)}</div>
          </div>
          <span class="cab-plus">+</span>
          <div class="cab-block-group">
            <span class="cab-group-label">${c.onesB}</span>
            <div class="cab-units">${renderUnits(c.onesB)}</div>
          </div>
        </div>
        <p class="prompt-caption cab-step-caption">先算個位：${c.onesA} + ${c.onesB} = ?</p>
        ${renderChoiceList(state.onesOptions, "ones")}
        ${state.stepAnswered ? `<button class="next-button" id="cab-next">繼續 →</button>` : ""}
      `;
    }

    if (state.step === "bundle") {
      return `
        <div class="cab-blocks-zone cab-blocks-zone--bundle">
          <div class="cab-units cab-units--bundle">
            ${Array.from({ length: c.onesSum }).map((_, i) => `<span class="cab-unit${i < 10 ? " is-ten-group" : ""}"></span>`).join("")}
          </div>
        </div>
        <p class="prompt-caption cab-step-caption">${c.onesA} + ${c.onesB} = ${c.onesSum}，湊滿 10 個了！10 個方塊可以綁成 1 個十喔～</p>
        <button class="confirm-button" id="cab-bundle">📦 綁成一捆十，搬到十位！</button>
      `;
    }

    if (state.step === "tens") {
      return `
        <div class="cab-blocks-zone">
          <div class="cab-block-group">
            <span class="cab-group-label">${c.tensA} 個十</span>
            <div class="cab-rods">${renderRods(c.tensA)}</div>
          </div>
          <span class="cab-plus">+</span>
          <div class="cab-block-group">
            <span class="cab-group-label">${c.tensB} 個十</span>
            <div class="cab-rods">${renderRods(c.tensB)}</div>
          </div>
          <span class="cab-plus">+</span>
          <div class="cab-block-group">
            <span class="cab-group-label">進位來的</span>
            <div class="cab-rods">${renderRods(1, true)}</div>
          </div>
        </div>
        <p class="prompt-caption cab-step-caption">個位進位來了 1 個十！現在十位：${c.tensA} + ${c.tensB} + 1（進位） = 幾個十？</p>
        ${renderChoiceList(state.tensOptions, "tens")}
        ${state.stepAnswered ? `<button class="next-button" id="cab-next">看結果 →</button>` : ""}
      `;
    }

    return `
      <p class="prompt-caption is-correct cab-step-caption">🎉 ${c.a} + ${c.b} = ${c.tensSum}${c.onesRemainder}！個位 ${c.onesA}+${c.onesB}=${c.onesSum}，進位 1 到十位，十位 ${c.tensA}+${c.tensB}+1=${c.tensSum}。</p>
      <button class="next-button" id="cab-next">${state.index + 1 >= state.problems.length ? "完成教學 🏆" : "下一題 →"}</button>
    `;
  }

  function wireStepEvents() {
    if (state.step === "ones" || state.step === "tens") {
      if (!state.stepAnswered) {
        root.querySelectorAll(".option-button").forEach((btn) => {
          btn.addEventListener("click", () => handlePick(Number(btn.dataset.ones ?? btn.dataset.tens)));
        });
      } else {
        root.querySelector("#cab-next").addEventListener("click", () => {
          if (state.step === "ones") {
            state.step = "bundle";
          } else {
            state.step = "result";
            spawnConfetti(root.querySelector(".quiz-prompt"));
            playCorrectSound();
          }
          render();
        });
      }
      return;
    }

    if (state.step === "bundle") {
      root.querySelector("#cab-bundle").addEventListener("click", () => {
        state.step = "tens";
        state.stepAnswered = false;
        state.picked = null;
        render();
      });
      return;
    }

    root.querySelector("#cab-next").addEventListener("click", () => {
      state.index += 1;
      if (state.index < state.problems.length) prepareProblem();
      render();
    });
  }

  function handlePick(value) {
    if (state.stepAnswered) return;
    state.stepAnswered = true;
    state.picked = value;
    const correct = state.step === "ones" ? state.cur.onesSum : state.cur.tensSum;
    render();
    if (value === correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }

  function renderResult() {
    root.innerHTML = `
      <div class="result-box">
        <div class="result-stars">⭐⭐⭐</div>
        <div class="result-message">進位教學完成！你學會「個位湊 10 進位到十位」了 🎉</div>
        <span class="quiz-cat-chip">🔢 進位教學</span>
        <div class="result-mascot">🦉</div>
        <div class="result-actions">
          <button class="primary-button" id="cab-retry">🔄 再玩一次</button>
          <button class="secondary-button" id="cab-home">🏠 返回首頁</button>
        </div>
      </div>
    `;
    root.querySelector("#cab-retry").addEventListener("click", () => {
      state.problems = shuffle([...problems]);
      state.index = 0;
      prepareProblem();
      render();
    });
    root.querySelector("#cab-home").addEventListener("click", () => onHome && onHome());
  }
}
