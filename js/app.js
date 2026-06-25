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

  // 國語：先進選單，選「注音手寫練習」或「注音拼音積木」
  document.querySelector("#home-chinese").addEventListener("click", () => {
    navigateTo("screen-chinese-menu");
  });

  document.querySelector("#menu-chinese-handwriting").addEventListener("click", () => {
    const chineseHandwritingRoot = document.querySelector("#chinese-handwriting-root");
    navigateTo("screen-chinese-handwriting");
    initHandwriting(chineseHandwritingRoot, ZHUYIN_LETTERS, {
      onBack: () => navigateTo("screen-chinese-menu"),
      wordMap: ZHUYIN_WORDS,
      showCaseToggle: false,
      unitLabel: "符號"
    });
  });

  document.querySelector("#menu-zhuyin-builder").addEventListener("click", () => {
    const zhuyinBuilderRoot = document.querySelector("#zhuyin-builder-root");
    navigateTo("screen-zhuyin-builder");
    initZhuyinBuilder(zhuyinBuilderRoot, ZHUYIN_SYLLABLES, {
      onBack: () => navigateTo("screen-chinese-menu"),
      onHome: () => navigateTo("screen-home")
    });
  });

  // 數學：先進選單，「加法測驗／減法測驗」都用 initMathQuiz 共用引擎，先選難度（小雞/蛇/老虎）再進測驗
  document.querySelector("#home-math").addEventListener("click", () => {
    navigateTo("screen-math-menu");
  });

  document.querySelector("#menu-addition-quiz").addEventListener("click", () => {
    const additionQuizRoot = document.querySelector("#addition-quiz-root");
    navigateTo("screen-addition-quiz");
    initMathQuiz(additionQuizRoot, ADDITION_QUIZ_PROBLEMS, {
      operator: "+",
      icon: "➕",
      categoryLabel: "加法測驗",
      subjectId: "addition-quiz",
      onBack: () => navigateTo("screen-math-menu"),
      onHome: () => navigateTo("screen-home")
    });
  });

  document.querySelector("#menu-subtraction-quiz").addEventListener("click", () => {
    const subtractionQuizRoot = document.querySelector("#subtraction-quiz-root");
    navigateTo("screen-subtraction-quiz");
    initMathQuiz(subtractionQuizRoot, SUBTRACTION_QUIZ_PROBLEMS, {
      operator: "-",
      icon: "➖",
      categoryLabel: "減法測驗",
      subjectId: "subtraction-quiz",
      onBack: () => navigateTo("screen-math-menu"),
      onHome: () => navigateTo("screen-home")
    });
  });

  document.querySelector("#menu-carry-teach").addEventListener("click", () => {
    const carryTeachRoot = document.querySelector("#carry-teach-root");
    navigateTo("screen-carry-teach");
    initCarryAdditionTeach(carryTeachRoot, CARRY_ADDITION_PROBLEMS, {
      onBack: () => navigateTo("screen-math-menu"),
      onHome: () => navigateTo("screen-home")
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

  // 錯題複習：點首頁卡片進清單，點清單裡的一筆會跳回原本的出題元件（選擇題/拼音積木）單獨重練那一題，
  // 練完按 ◀ 會回到錯題清單而不是原本科目的選單，所以每次都重新呼叫 openMistakeReview 取得最新清單。
  function openMistakeReview() {
    navigateTo("screen-mistake-review");
    initMistakeReview(document.querySelector("#mistake-review-root"), {
      onRetry: (subject, info) => {
        if (subject === "english-mc") {
          quizSetup.hidden = true;
          quizRoot.hidden = false;
          quizRoot.innerHTML = "";
          navigateTo("screen-quiz");
          info.launch(quizRoot, {
            onBack: openMistakeReview,
            onHome: () => navigateTo("screen-home"),
            subjectId: "english-mc"
          });
        } else if (subject === "zhuyin-builder") {
          const zhuyinBuilderRoot = document.querySelector("#zhuyin-builder-root");
          navigateTo("screen-zhuyin-builder");
          info.launch(zhuyinBuilderRoot, {
            onBack: openMistakeReview,
            onHome: () => navigateTo("screen-home")
          });
        } else if (subject === "addition-quiz") {
          const additionQuizRoot = document.querySelector("#addition-quiz-root");
          navigateTo("screen-addition-quiz");
          info.launch(additionQuizRoot, {
            onBack: openMistakeReview,
            onHome: () => navigateTo("screen-home")
          });
        } else if (subject === "subtraction-quiz") {
          const subtractionQuizRoot = document.querySelector("#subtraction-quiz-root");
          navigateTo("screen-subtraction-quiz");
          info.launch(subtractionQuizRoot, {
            onBack: openMistakeReview,
            onHome: () => navigateTo("screen-home")
          });
        }
      }
    });
  }

  document.querySelector("#home-mistake-review").addEventListener("click", openMistakeReview);
  refreshMistakeBadge();
});
