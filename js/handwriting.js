// 手寫練習元件：畫布顯示淡色範本字，用 Pointer Events 畫筆跡（支援 Apple Pencil 壓力感應）。
// letters 參數吃 data/english-letters.js 的 schema，wordMap 吃 data/english-mc.js 匯出的 ENGLISH_WORDS（letter -> {word, emoji}）。
// 之後國字也可用同一個元件，只要換資料。
function initHandwriting(root, letters, { onBack, wordMap = {}, showCaseToggle = true, unitLabel = "字母" } = {}) {
  const state = { index: 0, caseMode: "upper", isDrawing: false, lastPoint: null, logicalWidth: 0, logicalHeight: 0 };

  render();

  function render() {
    root.innerHTML = `
      <div class="hw-header">
        <button class="back-pill" id="hw-back">◀ 返回</button>
        <div class="hw-nav">
          <button class="hw-nav-arrow" id="hw-prev" aria-label="上一個">‹</button>
          <span class="hw-counter" id="hw-counter"></span>
          <button class="hw-nav-arrow" id="hw-next-letter" aria-label="下一個">›</button>
        </div>
      </div>
      ${showCaseToggle ? `
      <div class="case-toggle">
        <button class="chip selected" data-case="upper">大寫 Aa</button>
        <button class="chip" data-case="lower">小寫 aa</button>
      </div>
      ` : ""}
      <div class="hw-info-card">
        <div class="hw-letter-badge" id="hw-badge"></div>
        <div>
          <div class="hw-word-row"><span class="hw-word-emoji" id="hw-word-emoji"></span><span id="hw-word-text"></span></div>
          <div class="hw-info-sub">✍️ 練習書寫這個${unitLabel}</div>
        </div>
      </div>
      <div class="hw-canvas-card">
        <p class="hw-canvas-label">✏️ 在這裡練習書寫</p>
        <canvas id="handwriting-canvas"></canvas>
      </div>
      <div class="handwriting-actions">
        <button class="clear-button" id="hw-clear">🗑️ 清除</button>
        <button class="hw-next-button" id="hw-next">下一個${unitLabel} →</button>
      </div>
    `;

    const canvas = root.querySelector("#handwriting-canvas");
    const ctx = canvas.getContext("2d");
    state.canvas = canvas;
    state.ctx = ctx;

    setupCanvasSize();
    drawTemplate();
    updateInfo();

    root.querySelector("#hw-back").addEventListener("click", () => onBack && onBack());
    root.querySelector("#hw-prev").addEventListener("click", () => changeLetter(-1));
    root.querySelector("#hw-next-letter").addEventListener("click", () => changeLetter(1));
    root.querySelector("#hw-next").addEventListener("click", () => changeLetter(1));
    root.querySelector("#hw-clear").addEventListener("click", drawTemplate);

    root.querySelectorAll(".case-toggle .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        root.querySelectorAll(".case-toggle .chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        state.caseMode = chip.dataset.case;
        drawTemplate();
        updateInfo();
      });
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("pointerleave", onPointerEnd);
  }

  window.addEventListener("resize", () => {
    if (!state.canvas) return;
    setupCanvasSize();
    drawTemplate();
  });

  function changeLetter(delta) {
    state.index = (state.index + delta + letters.length) % letters.length;
    drawTemplate();
    updateInfo();
  }

  function currentLetter() {
    return letters[state.index][state.caseMode];
  }

  function updateInfo() {
    const upper = letters[state.index].upper;
    const info = wordMap[upper] || { word: "", emoji: "" };
    root.querySelector("#hw-counter").textContent = `${unitLabel} ${state.index + 1} / ${letters.length}`;
    root.querySelector("#hw-badge").textContent = currentLetter();
    root.querySelector("#hw-word-emoji").textContent = info.emoji;
    root.querySelector("#hw-word-text").textContent = info.word;
  }

  function setupCanvasSize() {
    const canvas = state.canvas;
    const ctx = state.ctx;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    state.logicalWidth = rect.width;
    state.logicalHeight = rect.height;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawTemplate() {
    const ctx = state.ctx;
    const { logicalWidth: w, logicalHeight: h } = state;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `bold ${Math.floor(h * 0.7)}px "Trebuchet MS", sans-serif`;
    ctx.fillStyle = "#d1d5db";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentLetter(), w / 2, h / 2);
  }

  function getPos(e) {
    const rect = state.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e) {
    state.canvas.setPointerCapture(e.pointerId);
    state.isDrawing = true;
    state.lastPoint = getPos(e);
  }

  function onPointerMove(e) {
    if (!state.isDrawing) return;
    const ctx = state.ctx;
    const p = getPos(e);
    const pressure = e.pressure > 0 ? e.pressure : 0.5;
    ctx.strokeStyle = "#2563eb";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, pressure * 14);
    ctx.beginPath();
    ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    state.lastPoint = p;
  }

  function onPointerEnd() {
    state.isDrawing = false;
  }
}
