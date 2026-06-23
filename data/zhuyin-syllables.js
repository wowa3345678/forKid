// 注音拼音點選積木題庫：把 grade1-2_chinese_characters.md 整理的常用字拆解成「聲母＋韻母＋聲調」，
// 給點選拼音元件 (js/zhuyin-builder.js) 出題用。
// initial/final 留空字串代表「這個字不需要選那一塊積木」（例如「一」沒有聲母、「字」聲母自成一音不需要韻母），
// 元件評分時直接把使用者選的（可能是空字串，代表沒選）跟這裡的 initial/final/tone 比對即可，不用額外發明「空」按鈕。
// 形容詞類缺乏清楚對應的單一 emoji，不放進這份題庫（仍保留在參考字表文件 grade1-2_chinese_characters.md 裡）。
const ZHUYIN_SYLLABLES = [
  // 數字 Numbers
  { char: "一", emoji: "1️⃣", category: "numbers", initial: "", final: "ㄧ", tone: 1 },
  { char: "二", emoji: "2️⃣", category: "numbers", initial: "", final: "ㄦ", tone: 4 },
  { char: "三", emoji: "3️⃣", category: "numbers", initial: "ㄙ", final: "ㄢ", tone: 1 },
  { char: "四", emoji: "4️⃣", category: "numbers", initial: "ㄙ", final: "", tone: 4 },
  { char: "五", emoji: "5️⃣", category: "numbers", initial: "", final: "ㄨ", tone: 3 },
  { char: "六", emoji: "6️⃣", category: "numbers", initial: "ㄌ", final: "ㄧㄡ", tone: 4 },
  { char: "七", emoji: "7️⃣", category: "numbers", initial: "ㄑ", final: "ㄧ", tone: 1 },
  { char: "八", emoji: "8️⃣", category: "numbers", initial: "ㄅ", final: "ㄚ", tone: 1 },
  { char: "九", emoji: "9️⃣", category: "numbers", initial: "ㄐ", final: "ㄧㄡ", tone: 3 },
  { char: "十", emoji: "🔟", category: "numbers", initial: "ㄕ", final: "", tone: 2 },

  // 顏色 Colors
  { char: "紅", emoji: "🔴", category: "colors", initial: "ㄏ", final: "ㄨㄥ", tone: 2 },
  { char: "黃", emoji: "🟡", category: "colors", initial: "ㄏ", final: "ㄨㄤ", tone: 2 },
  { char: "藍", emoji: "🔵", category: "colors", initial: "ㄌ", final: "ㄢ", tone: 2 },
  { char: "綠", emoji: "🟢", category: "colors", initial: "ㄌ", final: "ㄩ", tone: 4 },
  { char: "白", emoji: "⚪", category: "colors", initial: "ㄅ", final: "ㄞ", tone: 2 },
  { char: "黑", emoji: "⚫", category: "colors", initial: "ㄏ", final: "ㄟ", tone: 1 },

  // 動物 Animals
  { char: "狗", emoji: "🐶", category: "animals", initial: "ㄍ", final: "ㄡ", tone: 3 },
  { char: "貓", emoji: "🐱", category: "animals", initial: "ㄇ", final: "ㄠ", tone: 1 },
  { char: "魚", emoji: "🐟", category: "animals", initial: "", final: "ㄩ", tone: 2 },
  { char: "鳥", emoji: "🐦", category: "animals", initial: "ㄋ", final: "ㄧㄠ", tone: 3 },
  { char: "牛", emoji: "🐮", category: "animals", initial: "ㄋ", final: "ㄧㄡ", tone: 2 },
  { char: "羊", emoji: "🐑", category: "animals", initial: "", final: "ㄧㄤ", tone: 2 },
  { char: "虎", emoji: "🐯", category: "animals", initial: "ㄏ", final: "ㄨ", tone: 3 },
  { char: "兔", emoji: "🐰", category: "animals", initial: "ㄊ", final: "ㄨ", tone: 4 },
  { char: "雞", emoji: "🐔", category: "animals", initial: "ㄐ", final: "ㄧ", tone: 1 },
  { char: "鴨", emoji: "🦆", category: "animals", initial: "", final: "ㄧㄚ", tone: 1 },
  { char: "豬", emoji: "🐷", category: "animals", initial: "ㄓ", final: "ㄨ", tone: 1 },
  { char: "象", emoji: "🐘", category: "animals", initial: "ㄒ", final: "ㄧㄤ", tone: 4 },

  // 家庭成員 Family
  { char: "爸", emoji: "👨", category: "family", initial: "ㄅ", final: "ㄚ", tone: 4 },
  { char: "媽", emoji: "👩", category: "family", initial: "ㄇ", final: "ㄚ", tone: 1 },
  { char: "哥", emoji: "🧑", category: "family", initial: "ㄍ", final: "ㄜ", tone: 1 },
  { char: "姐", emoji: "👧", category: "family", initial: "ㄐ", final: "ㄧㄝ", tone: 3 },
  { char: "弟", emoji: "👦", category: "family", initial: "ㄉ", final: "ㄧ", tone: 4 },
  { char: "妹", emoji: "👧", category: "family", initial: "ㄇ", final: "ㄟ", tone: 4 },
  { char: "爺", emoji: "👴", category: "family", initial: "", final: "ㄧㄝ", tone: 2 },
  { char: "奶", emoji: "👵", category: "family", initial: "ㄋ", final: "ㄞ", tone: 3 },

  // 身體部位 Body Parts
  { char: "頭", emoji: "🙂", category: "body", initial: "ㄊ", final: "ㄡ", tone: 2 },
  { char: "眼", emoji: "👁️", category: "body", initial: "", final: "ㄧㄢ", tone: 3 },
  { char: "耳", emoji: "👂", category: "body", initial: "", final: "ㄦ", tone: 3 },
  { char: "鼻", emoji: "👃", category: "body", initial: "ㄅ", final: "ㄧ", tone: 2 },
  { char: "口", emoji: "👄", category: "body", initial: "ㄎ", final: "ㄡ", tone: 3 },
  { char: "手", emoji: "✋", category: "body", initial: "ㄕ", final: "ㄡ", tone: 3 },
  { char: "腳", emoji: "🦶", category: "body", initial: "ㄐ", final: "ㄧㄠ", tone: 3 },

  // 大自然 Nature
  { char: "天", emoji: "🌤️", category: "nature", initial: "ㄊ", final: "ㄧㄢ", tone: 1 },
  { char: "山", emoji: "⛰️", category: "nature", initial: "ㄕ", final: "ㄢ", tone: 1 },
  { char: "水", emoji: "💧", category: "nature", initial: "ㄕ", final: "ㄨㄟ", tone: 3 },
  { char: "火", emoji: "🔥", category: "nature", initial: "ㄏ", final: "ㄨㄛ", tone: 3 },
  { char: "日", emoji: "☀️", category: "nature", initial: "ㄖ", final: "", tone: 4 },
  { char: "月", emoji: "🌙", category: "nature", initial: "", final: "ㄩㄝ", tone: 4 },
  { char: "星", emoji: "⭐", category: "nature", initial: "ㄒ", final: "ㄧㄥ", tone: 1 },
  { char: "雲", emoji: "☁️", category: "nature", initial: "", final: "ㄩㄣ", tone: 2 },
  { char: "雨", emoji: "🌧️", category: "nature", initial: "", final: "ㄩ", tone: 3 },
  { char: "風", emoji: "🌬️", category: "nature", initial: "ㄈ", final: "ㄥ", tone: 1 },

  // 食物 Food
  { char: "飯", emoji: "🍚", category: "food", initial: "ㄈ", final: "ㄢ", tone: 4 },
  { char: "麵", emoji: "🍜", category: "food", initial: "ㄇ", final: "ㄧㄢ", tone: 4 },
  { char: "蛋", emoji: "🥚", category: "food", initial: "ㄉ", final: "ㄢ", tone: 4 },
  { char: "糖", emoji: "🍬", category: "food", initial: "ㄊ", final: "ㄤ", tone: 2 },

  // 學校用品 School Supplies
  { char: "書", emoji: "📖", category: "school", initial: "ㄕ", final: "ㄨ", tone: 1 },
  { char: "筆", emoji: "✏️", category: "school", initial: "ㄅ", final: "ㄧ", tone: 3 },
  { char: "字", emoji: "🔤", category: "school", initial: "ㄗ", final: "", tone: 4 },
  { char: "本", emoji: "📓", category: "school", initial: "ㄅ", final: "ㄣ", tone: 3 },
  { char: "椅", emoji: "🪑", category: "school", initial: "", final: "ㄧ", tone: 3 },

  // 基本動作 Action Verbs
  { char: "走", emoji: "🚶", category: "actions", initial: "ㄗ", final: "ㄡ", tone: 3 },
  { char: "跑", emoji: "🏃", category: "actions", initial: "ㄆ", final: "ㄠ", tone: 3 },
  { char: "跳", emoji: "🤸", category: "actions", initial: "ㄊ", final: "ㄧㄠ", tone: 4 },
  { char: "吃", emoji: "🍴", category: "actions", initial: "ㄔ", final: "", tone: 1 },
  { char: "喝", emoji: "🥤", category: "actions", initial: "ㄏ", final: "ㄜ", tone: 1 },
  { char: "睡", emoji: "😴", category: "actions", initial: "ㄕ", final: "ㄨㄟ", tone: 4 },
  { char: "看", emoji: "👀", category: "actions", initial: "ㄎ", final: "ㄢ", tone: 4 },
  { char: "笑", emoji: "😄", category: "actions", initial: "ㄒ", final: "ㄧㄠ", tone: 4 },
  { char: "哭", emoji: "😢", category: "actions", initial: "ㄎ", final: "ㄨ", tone: 1 }
];

window.ZHUYIN_SYLLABLES = ZHUYIN_SYLLABLES;

window.ZHUYIN_BUILDER_CATEGORY_META = {
  numbers: { emoji: "🔢", label: "數字" },
  colors: { emoji: "🌈", label: "顏色" },
  animals: { emoji: "🐶", label: "動物" },
  family: { emoji: "👨‍👩‍👧", label: "家庭" },
  body: { emoji: "🧍", label: "身體" },
  nature: { emoji: "🌞", label: "大自然" },
  food: { emoji: "🍎", label: "食物" },
  school: { emoji: "🏫", label: "學校用品" },
  actions: { emoji: "🏃", label: "動作" }
};

// 注音標準順序的聲母／韻母表（跟 data/chinese-zhuyin.js 的手寫練習共用同一套符號），
// 用 filter 只留下這份題庫實際會用到的符號，孩子不會看到一堆從沒出過題的按鈕。
const ZHUYIN_INITIAL_ORDER = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ".split("");
const ZHUYIN_FINAL_ORDER = [
  "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ",
  "ㄧ", "ㄧㄚ", "ㄧㄝ", "ㄧㄠ", "ㄧㄡ", "ㄧㄢ", "ㄧㄣ", "ㄧㄤ", "ㄧㄥ",
  "ㄨ", "ㄨㄛ", "ㄨㄟ", "ㄨㄢ", "ㄨㄣ", "ㄨㄤ", "ㄨㄥ",
  "ㄩ", "ㄩㄝ", "ㄩㄢ", "ㄩㄣ", "ㄩㄥ"
];

const usedInitials = new Set(ZHUYIN_SYLLABLES.map((s) => s.initial).filter(Boolean));
const usedFinals = new Set(ZHUYIN_SYLLABLES.map((s) => s.final).filter(Boolean));

window.ZHUYIN_INITIALS = ZHUYIN_INITIAL_ORDER.filter((s) => usedInitials.has(s));
window.ZHUYIN_FINALS = ZHUYIN_FINAL_ORDER.filter((s) => usedFinals.has(s));
window.ZHUYIN_TONES = [1, 2, 3, 4];
