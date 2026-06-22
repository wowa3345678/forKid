// 英文選擇題題庫：依分類組織單字，每個單字各自成一題，不再侵限「1 字母 1 題」。
// 干擾選項從同分類的單字池隨機抽 3 個。要加新題目只要在對應分類的物件裡加一筆 單字: emoji。
// prompt.type 支援 "emoji"（目前用）與 "text"（之後國語/數學的算式、文字題可沿用同一個 schema）
(function () {
  const CATEGORY_WORDS = {
    fruits: {
      Apple: "🍎", Banana: "🍌", Grapes: "🍇", Kiwi: "🥝", Orange: "🍊", Pineapple: "🍍",
      Strawberry: "🍓", Watermelon: "🍉", Bread: "🍞", Milk: "🥛", Water: "💧", Cake: "🎂",
      Egg: "🥚", Cookie: "🍪", Rice: "🍚"
    },
    animals: {
      Cat: "🐱", Dog: "🐶", Elephant: "🐘", Fish: "🐟", Horse: "🐴", Lion: "🦁", Monkey: "🐒",
      Rabbit: "🐰", Tiger: "🐯", Whale: "🐳", Zebra: "🦓", Bird: "🐦", Frog: "🐸", Butterfly: "🦋"
    },
    objects: {
      "Ice Cream": "🍦", Jellyfish: "🪼", Nest: "🪺", Queen: "👸", Umbrella: "☂️", Violin: "🎻",
      "X-ray": "🩻", "Yo-yo": "🪀"
    },
    school: {
      Book: "📖", Pen: "🖊️", Pencil: "✏️", Ruler: "📏", Bag: "🎒", Chair: "🪑"
    },
    nature: {
      Sun: "☀️", Moon: "🌙", Star: "⭐", Cloud: "☁️", Rain: "🌧️", Tree: "🌳", Flower: "🌸", Grass: "🌱"
    },
    bodyparts: {
      Eye: "👁️", Ear: "👂", Nose: "👃", Mouth: "👄", Hand: "✋", Foot: "🦶", Arm: "💪", Leg: "🦵"
    }
  };

  // 手寫練習用：A~Z 各對應一個代表單字，跟上面的選擇題題庫分開維護，
  // 避免題庫分類調整時動到手寫練習的字母對照表。
  const LETTER_WORD = {
    A: "Apple", B: "Banana", C: "Cat", D: "Dog", E: "Elephant", F: "Fish", G: "Grapes",
    H: "Horse", I: "Ice Cream", J: "Jellyfish", K: "Kiwi", L: "Lion", M: "Monkey", N: "Nest",
    O: "Orange", P: "Pineapple", Q: "Queen", R: "Rabbit", S: "Strawberry", T: "Tiger",
    U: "Umbrella", V: "Violin", W: "Whale", X: "X-ray", Y: "Yo-yo", Z: "Zebra"
  };
  const LETTER_EMOJI = {
    Apple: "🍎", Banana: "🍌", Cat: "🐱", Dog: "🐶", Elephant: "🐘", Fish: "🐟", Grapes: "🍇",
    Horse: "🐴", "Ice Cream": "🍦", Jellyfish: "🪼", Kiwi: "🥝", Lion: "🦁", Monkey: "🐒", Nest: "🪺",
    Orange: "🍊", Pineapple: "🍍", Queen: "👸", Rabbit: "🐰", Strawberry: "🍓", Tiger: "🐯",
    Umbrella: "☂️", Violin: "🎻", Whale: "🐳", "X-ray": "🩻", "Yo-yo": "🪀", Zebra: "🦓"
  };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickDistractors(word, pool, count) {
    return shuffle(pool.filter((w) => w !== word)).slice(0, count);
  }

  const questions = [];
  Object.entries(CATEGORY_WORDS).forEach(([category, words]) => {
    const wordList = Object.keys(words);
    wordList.forEach((word) => {
      const distractors = pickDistractors(word, wordList, 3);
      questions.push({
        id: `en-mc-${String(questions.length + 1).padStart(2, "0")}`,
        letter: word[0].toUpperCase(),
        category,
        prompt: { type: "emoji", value: words[word] },
        correctAnswer: word,
        options: shuffle([word, ...distractors])
      });
    });
  });

  window.ENGLISH_MC = questions;

  // 給手寫練習用：每個字母對應的單字 + emoji。
  window.ENGLISH_WORDS = Object.fromEntries(
    Object.entries(LETTER_WORD).map(([letter, word]) => [
      letter,
      { word, emoji: LETTER_EMOJI[word] }
    ])
  );
})();
