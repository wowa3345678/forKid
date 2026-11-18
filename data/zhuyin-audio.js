// 注音聽辨用的真人錄音對照表（由 scratchpad 分析腳本產生，改題庫時要一起更新）。
// ZHUYIN_CHAR_AUDIO：教育部《國語辭典簡編本》單字屬性聲音檔（audio/moe-dict/，CC BY-ND 3.0 TW，原檔未修改）。
//   每個原檔約 10 秒，開頭第一段是字本身的讀音，後面是其它屬性說明；end 是只播字音時要停在第幾秒
//   （第一段結束再多留 0.35 秒、不超過第二段開始前 0.12 秒，避免把 ㄥ/ㄣ 的鼻音尾巴切掉）。
//   檔名是辭典的字詞號；破音字（如 汗、羊）已依辭典文字資料庫的注音挑對讀音。
// ZHUYIN_SYMBOL_AUDIO：教育部《國語注音符號手冊》開放部件音檔（audio/bopomofo/，CC BY 4.0），F1~F37 依 ㄅ~ㄩ 順序；
//   原檔音量偏小，gain 是把峰值拉到 0.9 的播放倍率（只在播放時放大，不改檔案）。
const ZHUYIN_CHAR_AUDIO = {
  "船": { file: "audio/moe-dict/4848.wav", end: 0.9 },
  "床": { file: "audio/moe-dict/4869.wav", end: 0.94 },
  "碗": { file: "audio/moe-dict/6369.wav", end: 0.88 },
  "網": { file: "audio/moe-dict/6409.wav", end: 0.89 },
  "山": { file: "audio/moe-dict/5015.wav", end: 0.88 },
  "傷": { file: "audio/moe-dict/5074.wav", end: 0.93 },
  "談": { file: "audio/moe-dict/1389.wav", end: 0.85 },
  "糖": { file: "audio/moe-dict/1410.wav", end: 0.79 },
  "藍": { file: "audio/moe-dict/1823.wav", end: 0.68 },
  "狼": { file: "audio/moe-dict/1837.wav", end: 0.69 },
  "鹽": { file: "audio/moe-dict/6097.wav", end: 0.86 },
  "羊": { file: "audio/moe-dict/6166.wav", end: 0.8 },
  "線": { file: "audio/moe-dict/4037.wav", end: 0.85 },
  "象": { file: "audio/moe-dict/4083.wav", end: 0.86 },
  "班": { file: "audio/moe-dict/0113.wav", end: 0.63 },
  "幫": { file: "audio/moe-dict/0140.wav", end: 0.77 },
  "金": { file: "audio/moe-dict/3322.wav", end: 0.82 },
  "鯨": { file: "audio/moe-dict/3373.wav", end: 0.76 },
  "音": { file: "audio/moe-dict/6132.wav", end: 0.81 },
  "鷹": { file: "audio/moe-dict/6190.wav", end: 0.82 },
  "林": { file: "audio/moe-dict/2005.wav", end: 0.73 },
  "鈴": { file: "audio/moe-dict/2055.wav", end: 0.71 },
  "輪": { file: "audio/moe-dict/2152.wav", end: 0.7 },
  "龍": { file: "audio/moe-dict/2156.wav", end: 0.68 },
  "盆": { file: "audio/moe-dict/0377.wav", end: 0.75 },
  "朋": { file: "audio/moe-dict/0401.wav", end: 0.87 },
  "晨": { file: "audio/moe-dict/4739.wav", end: 0.89 },
  "城": { file: "audio/moe-dict/4783.wav", end: 0.88 },
  "神": { file: "audio/moe-dict/5060.wav", end: 0.91 },
  "繩": { file: "audio/moe-dict/5093.wav", end: 0.92 },
  "針": { file: "audio/moe-dict/4421.wav", end: 0.75 },
  "蒸": { file: "audio/moe-dict/4480.wav", end: 0.87 },
  "虎": { file: "audio/moe-dict/2828.wav", end: 0.92 },
  "斧": { file: "audio/moe-dict/0971.wav", end: 0.73 },
  "汗": { file: "audio/moe-dict/2764.wav", end: 0.74 },
  "飯": { file: "audio/moe-dict/0872.wav", end: 0.71 },
  "狐": { file: "audio/moe-dict/2809.wav", end: 0.77 },
  "福": { file: "audio/moe-dict/0964.wav", end: 0.72 },
  "揮": { file: "audio/moe-dict/2888.wav", end: 0.76 },
  "飛": { file: "audio/moe-dict/0824.wav", end: 0.84 },
  "黃": { file: "audio/moe-dict/2970.wav", end: 0.8 },
  "房": { file: "audio/moe-dict/0899.wav", end: 0.7 },
  "壺": { file: "audio/moe-dict/2824.wav", end: 0.77 },
  "服": { file: "audio/moe-dict/0958.wav", end: 0.75 },
  "紙": { file: "audio/moe-dict/4260.wav", end: 0.79 },
  "紫": { file: "audio/moe-dict/5297.wav", end: 0.85 },
  "鐘": { file: "audio/moe-dict/4609.wav", end: 0.84 },
  "棕": { file: "audio/moe-dict/5411.wav", end: 0.88 },
  "炒": { file: "audio/moe-dict/4692.wav", end: 0.94 },
  "草": { file: "audio/moe-dict/5465.wav", end: 0.96 },
  "三": { file: "audio/moe-dict/5622.wav", end: 0.93 },
  "獅": { file: "audio/moe-dict/4893.wav", end: 0.89 },
  "絲": { file: "audio/moe-dict/5560.wav", end: 0.88 },
  "閃": { file: "audio/moe-dict/5029.wav", end: 1.0 },
  "傘": { file: "audio/moe-dict/5625.wav", end: 1.05 },
  "肉": { file: "audio/moe-dict/5194.wav", end: 0.74 },
  "漏": { file: "audio/moe-dict/1812.wav", end: 0.66 },
  "蟲": { file: "audio/moe-dict/4881.wav", end: 0.87 },
  "叢": { file: "audio/moe-dict/5552.wav", end: 0.92 }
};

const ZHUYIN_SYMBOL_AUDIO = {
  "ㄈ": { file: "audio/bopomofo/F4.WAV", gain: 2.79 },
  "ㄌ": { file: "audio/bopomofo/F8.WAV", gain: 2.72 },
  "ㄏ": { file: "audio/bopomofo/F11.WAV", gain: 3.99 },
  "ㄓ": { file: "audio/bopomofo/F15.WAV", gain: 5.05 },
  "ㄔ": { file: "audio/bopomofo/F16.WAV", gain: 2.49 },
  "ㄕ": { file: "audio/bopomofo/F17.WAV", gain: 3.55 },
  "ㄖ": { file: "audio/bopomofo/F18.WAV", gain: 4.37 },
  "ㄗ": { file: "audio/bopomofo/F19.WAV", gain: 2.9 },
  "ㄘ": { file: "audio/bopomofo/F20.WAV", gain: 2.44 },
  "ㄙ": { file: "audio/bopomofo/F21.WAV", gain: 2.45 },
  "ㄢ": { file: "audio/bopomofo/F30.WAV", gain: 2.63 },
  "ㄣ": { file: "audio/bopomofo/F31.WAV", gain: 2.84 },
  "ㄤ": { file: "audio/bopomofo/F32.WAV", gain: 2.46 },
  "ㄥ": { file: "audio/bopomofo/F33.WAV", gain: 4.29 }
};

window.ZHUYIN_CHAR_AUDIO = ZHUYIN_CHAR_AUDIO;
window.ZHUYIN_SYMBOL_AUDIO = ZHUYIN_SYMBOL_AUDIO;
