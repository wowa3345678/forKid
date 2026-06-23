// 手寫練習元件：畫布顯示淡色範本字，用 Pointer Events 畫筆跡（支援 Apple Pencil 壓力感應）。
// letters 參數吃 data/english-letters.js 的 schema，wordMap 吃 data/english-mc.js 匯出的 ENGLISH_WORDS（letter -> {word, emoji}）。
// 之後國字也可用同一個元件，只要換資料。
//
// 評分邏輯：另開一個不顯示在畫面上的 inkCanvas，跟可視畫布同步畫筆跡（座標、線寬都一樣，只是不畫範本字），
// 按「確認」時比對 inkCanvas 跟範本字的像素遮罩，算出「覆蓋率」（範本筆畫被描到多少）跟「超出率」（筆跡畫出範本外的比例），
// 兩者一起決定 Perfect / Good / You Can Be Better 三檔，不是真的手寫辨識，只是描摹精準度的幾何近似值。
// 比對時不要求逐像素重疊：先把兩個遮罩各自做一次模糊（等同形態學膨脹）再取閾值，
// 墨跡線寬本來就比範本字的印刷筆畫細很多，留一個容忍區間才不會讓完美沿著範本描的人也拿不到 Perfect。
function initHandwriting(root, letters, { onBack, wordMap = {}, showCaseToggle = true, unitLabel = "字母" } = {}) {
  const state = { index: 0, caseMode: "upper", isDrawing: false, lastPoint: null, logicalWidth: 0, logicalHeight: 0, locked: false };

  const RESULT_COPY = {
    perfect: { cls: "is-correct", label: "🌟 Perfect！寫得好標準！", speech: "寫得太棒了，非常標準！" },
    good: { cls: "is-good", label: "👍 Good！很不錯！", speech: "很好，繼續加油！" },
    tryagain: { cls: "is-wrong", label: "🌱 You Can Be Better，再試一次！", speech: "再練習一次，你可以更好！" }
  };

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
      <div id="hw-result-slot" hidden></div>
      <div class="handwriting-actions">
        <button class="clear-button" id="hw-clear">🗑️ 清除</button>
        <button class="confirm-button" id="hw-confirm">✅ 確認</button>
        <button class="hw-next-button" id="hw-next" hidden>下一個${unitLabel} →</button>
      </div>
    `;

    const canvas = root.querySelector("#handwriting-canvas");
    const ctx = canvas.getContext("2d");
    state.canvas = canvas;
    state.ctx = ctx;

    setupCanvasSize();
    resetAttempt();
    updateInfo();

    root.querySelector("#hw-back").addEventListener("click", () => onBack && onBack());
    root.querySelector("#hw-prev").addEventListener("click", () => changeLetter(-1));
    root.querySelector("#hw-next-letter").addEventListener("click", () => changeLetter(1));
    root.querySelector("#hw-next").addEventListener("click", () => changeLetter(1));
    root.querySelector("#hw-clear").addEventListener("click", resetAttempt);
    root.querySelector("#hw-confirm").addEventListener("click", handleConfirm);

    root.querySelectorAll(".case-toggle .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        root.querySelectorAll(".case-toggle .chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        state.caseMode = chip.dataset.case;
        resetAttempt();
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
    resetAttempt();
  });

  function changeLetter(delta) {
    state.index = (state.index + delta + letters.length) % letters.length;
    resetAttempt();
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

    if (!state.inkCanvas) state.inkCanvas = document.createElement("canvas");
    state.inkCanvas.width = canvas.width;
    state.inkCanvas.height = canvas.height;
    state.inkCtx = state.inkCanvas.getContext("2d");
    state.inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // 重新開始這一個字的練習：清空筆跡、重畫範本字、解鎖畫布、把確認/下一個按鈕跟結果 banner 還原成初始狀態。
  function resetAttempt() {
    drawTemplate();
    state.inkCtx.clearRect(0, 0, state.logicalWidth, state.logicalHeight);
    state.locked = false;
    const confirmBtn = root.querySelector("#hw-confirm");
    if (!confirmBtn) return;
    confirmBtn.hidden = false;
    root.querySelector("#hw-next").hidden = true;
    const bannerSlot = root.querySelector("#hw-result-slot");
    bannerSlot.hidden = true;
    bannerSlot.innerHTML = "";
  }

  function drawTemplate() {
    const ctx = state.ctx;
    const { logicalWidth: w, logicalHeight: h } = state;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `bold ${Math.floor(h * 0.7)}px "Andika", sans-serif`;
    ctx.fillStyle = "#d1d5db";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentLetter(), w / 2, h / 2);
    state.templateImageData = ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
  }

  function getPos(e) {
    const rect = state.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e) {
    if (state.locked) return;
    state.canvas.setPointerCapture(e.pointerId);
    state.isDrawing = true;
    state.lastPoint = getPos(e);
  }

  function onPointerMove(e) {
    if (!state.isDrawing || state.locked) return;
    const p = getPos(e);
    const pressure = e.pressure > 0 ? e.pressure : 0.5;
    const lineWidth = Math.max(3, pressure * 14);
    [state.ctx, state.inkCtx].forEach((ctx) => {
      ctx.strokeStyle = "#2563eb";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    state.lastPoint = p;
  }

  function onPointerEnd() {
    state.isDrawing = false;
  }

  // 把來源畫面（canvas 或 ImageData）模糊處理，等同形態學膨脹：模糊半徑內的像素都會被「擴散」進來，
  // 用來在比對時容忍墨跡跟範本筆畫之間的小幅位置/寬度落差。
  function buildBlurredMask(source, blurPx) {
    const w = state.canvas.width;
    const h = state.canvas.height;
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = w;
    srcCanvas.height = h;
    const srcCtx = srcCanvas.getContext("2d");
    if (source instanceof ImageData) {
      srcCtx.putImageData(source, 0, 0);
    } else {
      srcCtx.drawImage(source, 0, 0);
    }
    const outCanvas = document.createElement("canvas");
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext("2d");
    outCtx.filter = `blur(${blurPx}px)`;
    outCtx.drawImage(srcCanvas, 0, 0);
    return outCtx.getImageData(0, 0, w, h).data;
  }

  // 比對範本字跟使用者筆跡的 alpha 遮罩：覆蓋率 = 範本筆畫被畫到的比例，超出率 = 筆跡畫到範本外的比例。
  // 覆蓋率用「模糊後的墨跡」比對「原始範本」（墨跡在容忍範圍內就算描到了該筆畫），
  // 超出率用「原始墨跡」比對「模糊後的範本」（墨跡只要落在範本筆畫附近就不算超出），
  // 容忍半徑跟裝置畫素密度（dpr）連動，確保在 Retina 螢幕上也是同樣的視覺寬度。
  function scoreAttempt() {
    const dpr = window.devicePixelRatio || 1;
    const tolerancePx = 6 * dpr;
    const tpl = state.templateImageData.data;
    const ink = state.inkCtx.getImageData(0, 0, state.canvas.width, state.canvas.height).data;
    const blurredInk = buildBlurredMask(state.inkCanvas, tolerancePx);
    const blurredTpl = buildBlurredMask(state.templateImageData, tolerancePx);
    let templateCount = 0;
    let coveredCount = 0;
    let inkCount = 0;
    let overDrawCount = 0;
    for (let i = 3; i < tpl.length; i += 4) {
      const tplOn = tpl[i] > 40;
      const inkOn = ink[i] > 40;
      if (tplOn) {
        templateCount++;
        if (blurredInk[i] > 15) coveredCount++;
      }
      if (inkOn) {
        inkCount++;
        if (blurredTpl[i] <= 15) overDrawCount++;
      }
    }
    const coverage = templateCount > 0 ? coveredCount / templateCount : 0;
    const overDrawRatio = inkCount > 0 ? overDrawCount / inkCount : 0;
    let tier = "tryagain";
    if (coverage >= 0.85 && overDrawRatio <= 0.2) tier = "perfect";
    else if (coverage >= 0.55 && overDrawRatio <= 0.4) tier = "good";
    return tier;
  }

  function handleConfirm() {
    if (state.locked) return;
    const tier = scoreAttempt();
    state.locked = true;
    root.querySelector("#hw-confirm").hidden = true;
    root.querySelector("#hw-next").hidden = false;
    const bannerSlot = root.querySelector("#hw-result-slot");
    bannerSlot.hidden = false;
    bannerSlot.innerHTML = `<div class="feedback-banner ${RESULT_COPY[tier].cls}">${RESULT_COPY[tier].label}</div>`;
    if (tier === "tryagain") {
      playWrongSound();
    } else {
      playCorrectSound();
    }
    setTimeout(() => speakText(RESULT_COPY[tier].speech), 300);
  }
}
