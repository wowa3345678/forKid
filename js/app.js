// 畫面切換邏輯：用 hidden 屬性切換 .screen，不做整頁重新載入。
document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

  function navigateTo(id) {
    screens.forEach((s) => (s.hidden = s.id !== id));
  }

  document.querySelectorAll(".back-pill[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.target));
  });

  document.querySelector("#home-english").addEventListener("click", () => {
    navigateTo("screen-english-menu");
  });

  // 國語：目前只有注音符號手寫練習，先直接進入，之後題型變多再加分類選單
  document.querySelector("#home-chinese").addEventListener("click", () => {
    const chineseHandwritingRoot = document.querySelector("#chinese-handwriting-root");
    navigateTo("screen-chinese-handwriting");
    initHandwriting(chineseHandwritingRoot, ZHUYIN_LETTERS, {
      onBack: () => navigateTo("screen-home"),
      wordMap: ZHUYIN_WORDS,
      showCaseToggle: false,
      unitLabel: "符號"
    });
  });

  // 選擇題：先選分類，按分類卡片即進入題目
  const quizSetup = document.querySelector("#quiz-setup");
  const quizRoot = document.querySelector("#quiz-root");

  document.querySelector("#menu-quiz").addEventListener("click", () => {
    quizSetup.hidden = false;
    quizRoot.hidden = true;
    quizRoot.innerHTML = "";
    navigateTo("screen-quiz");
  });

  document.querySelectorAll("#quiz-setup .category-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      const pool = category === "all"
        ? ENGLISH_MC
        : ENGLISH_MC.filter((q) => q.category === category);
      quizSetup.hidden = true;
      quizRoot.hidden = false;
      initQuiz(quizRoot, pool, {
        onBack: () => {
          quizSetup.hidden = false;
          quizRoot.hidden = true;
          quizRoot.innerHTML = "";
        },
        onHome: () => navigateTo("screen-home"),
        subjectId: "english-mc"
      });
    });
  });

  // 手寫練習：每次進入畫面才初始化，避免畫布在隱藏狀態下量到 0 尺寸
  document.querySelector("#menu-handwriting").addEventListener("click", () => {
    const handwritingRoot = document.querySelector("#handwriting-root");
    navigateTo("screen-handwriting");
    initHandwriting(handwritingRoot, ENGLISH_LETTERS, {
      onBack: () => navigateTo("screen-english-menu"),
      wordMap: ENGLISH_WORDS
    });
  });

  // 翻牌記憶卡：先選分類，按分類卡片即進入配對遊戲
  const memorySetup = document.querySelector("#memory-setup");
  const memoryRoot = document.querySelector("#memory-root");

  document.querySelector("#menu-memory").addEventListener("click", () => {
    memorySetup.hidden = false;
    memoryRoot.hidden = true;
    memoryRoot.innerHTML = "";
    navigateTo("screen-memory");
  });

  document.querySelectorAll("#memory-setup .category-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      const wordMap = category === "all"
        ? Object.assign({}, ...Object.values(ENGLISH_CATEGORY_WORDS))
        : ENGLISH_CATEGORY_WORDS[category];
      const meta = CATEGORY_META[category] || { label: "綜合" };
      memorySetup.hidden = true;
      memoryRoot.hidden = false;
      initMemory(memoryRoot, wordMap, {
        onBack: () => {
          memorySetup.hidden = false;
          memoryRoot.hidden = true;
          memoryRoot.innerHTML = "";
        },
        onHome: () => navigateTo("screen-home"),
        categoryLabel: meta.label
      });
    });
  });
});
