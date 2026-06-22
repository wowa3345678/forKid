// 英文選擇題題庫：A~Z，每題一個 prompt（圖案或文字）+ 4 個選項
// prompt.type 支援 "emoji"（目前用）與 "text"（之後國語/數學的算式、文字題可沿用同一個 schema）
(function () {
  const FRUITS = ["Apple", "Banana", "Grapes", "Kiwi", "Orange", "Pineapple", "Strawberry"];
  const ANIMALS = ["Cat", "Dog", "Elephant", "Fish", "Horse", "Lion", "Monkey", "Rabbit", "Tiger", "Whale", "Zebra"];
  const OBJECTS = ["Ice Cream", "Jellyfish", "Nest", "Queen", "Umbrella", "Violin", "X-ray", "Yo-yo"];

  const EMOJI = {
    Apple: "🍎", Banana: "🍌", Grapes: "🍇", Kiwi: "🥝", Orange: "🍊", Pineapple: "🍍", Strawberry: "🍓",
    Cat: "🐱", Dog: "🐶", Elephant: "🐘", Fish: "🐟", Horse: "🐴", Lion: "🦁", Monkey: "🐒", Rabbit: "🐰",
    Tiger: "🐯", Whale: "🐳", Zebra: "🦓",
    "Ice Cream": "🍦", Jellyfish: "🪼", Nest: "🪺", Queen: "👸", Umbrella: "☂️", Violin: "🎻", "X-ray": "🩻", "Yo-yo": "🪀"
  };

  const LETTER_WORD = {
    A: "Apple", B: "Banana", C: "Cat", D: "Dog", E: "Elephant", F: "Fish", G: "Grapes",
    H: "Horse", I: "Ice Cream", J: "Jellyfish", K: "Kiwi", L: "Lion", M: "Monkey", N: "Nest",
    O: "Orange", P: "Pineapple", Q: "Queen", R: "Rabbit", S: "Strawberry", T: "Tiger",
    U: "Umbrella", V: "Violin", W: "Whale", X: "X-ray", Y: "Yo-yo", Z: "Zebra"
  };

  const POOL_BY_CATEGORY = { fruits: FRUITS, animals: ANIMALS, objects: OBJECTS };

  function categoryOf(word) {
    if (FRUITS.includes(word)) return "fruits";
    if (ANIMALS.includes(word)) return "animals";
    return "objects";
  }

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

  window.ENGLISH_MC = Object.entries(LETTER_WORD).map(([letter, word], idx) => {
    const category = categoryOf(word);
    const distractors = pickDistractors(word, POOL_BY_CATEGORY[category], 3);
    return {
      id: `en-mc-${String(idx + 1).padStart(2, "0")}`,
      letter,
      category,
      prompt: { type: "emoji", value: EMOJI[word] },
      correctAnswer: word,
      options: shuffle([word, ...distractors])
    };
  });

  // 給手寫練習用：每個字母對應的單字 + emoji，跟選擇題共用同一份資料，不重複定義。
  window.ENGLISH_WORDS = Object.fromEntries(
    Object.entries(LETTER_WORD).map(([letter, word]) => [
      letter,
      { word, emoji: EMOJI[word], category: categoryOf(word) }
    ])
  );
})();
