// 國語注音符號手寫題庫：21 個聲符 + 16 個韻符，共 37 個符號。
// 注音沒有大小寫概念，upper/lower 故意設成同一個符號，這樣 initHandwriting 不用改核心邏輯，
// 搭配呼叫時傳 showCaseToggle:false 隱藏大小寫切換 UI 即可直接重用同一個元件。
const ZHUYIN_SYMBOLS = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ".split("");

window.ZHUYIN_LETTERS = ZHUYIN_SYMBOLS.map((symbol) => ({ upper: symbol, lower: symbol }));

window.ZHUYIN_WORDS = {
  "ㄅ": { word: "爸爸", emoji: "👨" },
  "ㄆ": { word: "葡萄", emoji: "🍇" },
  "ㄇ": { word: "媽媽", emoji: "👩" },
  "ㄈ": { word: "房子", emoji: "🏠" },
  "ㄉ": { word: "蛋", emoji: "🥚" },
  "ㄊ": { word: "兔子", emoji: "🐰" },
  "ㄋ": { word: "牛奶", emoji: "🥛" },
  "ㄌ": { word: "老虎", emoji: "🐯" },
  "ㄍ": { word: "狗", emoji: "🐶" },
  "ㄎ": { word: "褲子", emoji: "👖" },
  "ㄏ": { word: "河馬", emoji: "🦛" },
  "ㄐ": { word: "雞", emoji: "🐔" },
  "ㄑ": { word: "鉛筆", emoji: "✏️" },
  "ㄒ": { word: "西瓜", emoji: "🍉" },
  "ㄓ": { word: "豬", emoji: "🐷" },
  "ㄔ": { word: "車子", emoji: "🚗" },
  "ㄕ": { word: "獅子", emoji: "🦁" },
  "ㄖ": { word: "肉", emoji: "🍖" },
  "ㄗ": { word: "字", emoji: "📝" },
  "ㄘ": { word: "草莓", emoji: "🍓" },
  "ㄙ": { word: "傘", emoji: "☂️" },
  "ㄚ": { word: "蛙", emoji: "🐸" },
  "ㄛ": { word: "菠菜", emoji: "🥬" },
  "ㄜ": { word: "鵝", emoji: "🦢" },
  "ㄝ": { word: "椰子", emoji: "🥥" },
  "ㄞ": { word: "愛心", emoji: "❤️" },
  "ㄟ": { word: "妹妹", emoji: "👧" },
  "ㄠ": { word: "貓", emoji: "🐱" },
  "ㄡ": { word: "猴子", emoji: "🐒" },
  "ㄢ": { word: "飯", emoji: "🍚" },
  "ㄣ": { word: "門", emoji: "🚪" },
  "ㄤ": { word: "糖", emoji: "🍬" },
  "ㄥ": { word: "燈", emoji: "💡" },
  "ㄦ": { word: "耳朵", emoji: "👂" },
  "ㄧ": { word: "椅子", emoji: "🪑" },
  "ㄨ": { word: "烏龜", emoji: "🐢" },
  "ㄩ": { word: "魚", emoji: "🐟" }
};
