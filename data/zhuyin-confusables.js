// 注音易混淆聽辨題庫：給 js/zhuyin-listen.js 用。
// 每一組（group）是一對容易聽錯的音，sides[0] 固定是「左邊／橘色」、sides[1] 是「右邊／綠色」，
// 每個 pair 是只差那一個音的兩個字（a 屬於 sides[0]、b 屬於 sides[1]），出題時唸其中一個字、讓小朋友從 a/b 兩個注音裡選。
// 每個 pair 會拆成兩題：`${pair.id}-a`（唸 a）跟 `${pair.id}-b`（唸 b），錯題本靠這個 id 對回題目，
// 所以 pair 的 id 不能重複使用或換給別的字組；要加新字組一律用新的 id。
// 挑字原則：一個字只有一種常用讀音（避開破音字，語音才不會唸錯）、兩個字聲調相同、盡量都有 emoji 可以配圖。
// zhuyin 照台灣課本寫法，一聲不標、其餘聲調符號寫在最後。
// 發音用教育部《國語辭典簡編本》真人錄音（對照表在 data/zhuyin-audio.js），所以挑字還要確認辭典有收錄這個字的錄音；
// 已停用的 id（字沒有錄音而換掉，不可再拿來用）：zl-en-01（心/星）、zl-hf-04（花/發）、zl-rf-03（春/村）。
const ZHUYIN_LISTEN_GROUPS = [
  {
    key: "an-ang",
    icon: "ㄢㄤ",
    title: "ㄢ 和 ㄤ",
    subtitle: "船 / 床、碗 / 網、羊 / 鹽…",
    sides: [
      { label: "ㄢ", symbols: ["ㄢ"], tip: "舌頭往前頂住上面牙齒後面，聲音停在前面" },
      { label: "ㄤ", symbols: ["ㄤ"], tip: "嘴巴張大大，舌頭往後縮，聲音從喉嚨後面出來" }
    ],
    pairs: [
      { id: "zl-an-01", a: { char: "船", zhuyin: "ㄔㄨㄢˊ", emoji: "🚢" }, b: { char: "床", zhuyin: "ㄔㄨㄤˊ", emoji: "🛏️" } },
      { id: "zl-an-02", a: { char: "碗", zhuyin: "ㄨㄢˇ", emoji: "🥣" }, b: { char: "網", zhuyin: "ㄨㄤˇ", emoji: "🕸️" } },
      { id: "zl-an-03", a: { char: "山", zhuyin: "ㄕㄢ", emoji: "⛰️" }, b: { char: "傷", zhuyin: "ㄕㄤ", emoji: "🩹" } },
      { id: "zl-an-04", a: { char: "談", zhuyin: "ㄊㄢˊ", emoji: "💬" }, b: { char: "糖", zhuyin: "ㄊㄤˊ", emoji: "🍬" } },
      { id: "zl-an-05", a: { char: "藍", zhuyin: "ㄌㄢˊ", emoji: "🔵" }, b: { char: "狼", zhuyin: "ㄌㄤˊ", emoji: "🐺" } },
      { id: "zl-an-06", a: { char: "鹽", zhuyin: "ㄧㄢˊ", emoji: "🧂" }, b: { char: "羊", zhuyin: "ㄧㄤˊ", emoji: "🐑" } },
      { id: "zl-an-07", a: { char: "線", zhuyin: "ㄒㄧㄢˋ", emoji: "🧵" }, b: { char: "象", zhuyin: "ㄒㄧㄤˋ", emoji: "🐘" } },
      { id: "zl-an-08", a: { char: "班", zhuyin: "ㄅㄢ", emoji: "🏫" }, b: { char: "幫", zhuyin: "ㄅㄤ", emoji: "🤝" } }
    ]
  },
  {
    key: "en-eng",
    icon: "ㄣㄥ",
    title: "ㄣ 和 ㄥ",
    subtitle: "盆 / 朋、輪 / 龍、晨 / 城…",
    sides: [
      { label: "ㄣ", symbols: ["ㄣ"], tip: "舌頭往前頂住上面牙齒後面，嘴巴小小的" },
      { label: "ㄥ", symbols: ["ㄥ"], tip: "舌頭往後縮，聲音在鼻子後面「嗡～」的響" }
    ],
    pairs: [
      { id: "zl-en-02", a: { char: "金", zhuyin: "ㄐㄧㄣ", emoji: "🪙" }, b: { char: "鯨", zhuyin: "ㄐㄧㄥ", emoji: "🐳" } },
      { id: "zl-en-03", a: { char: "音", zhuyin: "ㄧㄣ", emoji: "🎵" }, b: { char: "鷹", zhuyin: "ㄧㄥ", emoji: "🦅" } },
      { id: "zl-en-04", a: { char: "林", zhuyin: "ㄌㄧㄣˊ", emoji: "🌳" }, b: { char: "鈴", zhuyin: "ㄌㄧㄥˊ", emoji: "🔔" } },
      { id: "zl-en-05", a: { char: "輪", zhuyin: "ㄌㄨㄣˊ", emoji: "🛞" }, b: { char: "龍", zhuyin: "ㄌㄨㄥˊ", emoji: "🐉" } },
      { id: "zl-en-06", a: { char: "盆", zhuyin: "ㄆㄣˊ", emoji: "🪴" }, b: { char: "朋", zhuyin: "ㄆㄥˊ", emoji: "🧑‍🤝‍🧑" } },
      { id: "zl-en-07", a: { char: "晨", zhuyin: "ㄔㄣˊ", emoji: "🌅" }, b: { char: "城", zhuyin: "ㄔㄥˊ", emoji: "🏰" } },
      { id: "zl-en-08", a: { char: "神", zhuyin: "ㄕㄣˊ", emoji: "🧞" }, b: { char: "繩", zhuyin: "ㄕㄥˊ", emoji: "🪢" } },
      { id: "zl-en-09", a: { char: "針", zhuyin: "ㄓㄣ", emoji: "🪡" }, b: { char: "蒸", zhuyin: "ㄓㄥ", emoji: "♨️" } }
    ]
  },
  {
    key: "h-f",
    icon: "ㄏㄈ",
    title: "ㄏ 和 ㄈ",
    subtitle: "虎 / 斧、黃 / 房、狐 / 福…",
    sides: [
      { label: "ㄏ", symbols: ["ㄏ"], tip: "嘴巴張開，從喉嚨「哈～」出氣，嘴唇不用動" },
      { label: "ㄈ", symbols: ["ㄈ"], tip: "上面牙齒輕輕咬住下嘴唇，再「ㄈ～」的吹氣" }
    ],
    pairs: [
      { id: "zl-hf-01", a: { char: "虎", zhuyin: "ㄏㄨˇ", emoji: "🐯" }, b: { char: "斧", zhuyin: "ㄈㄨˇ", emoji: "🪓" } },
      { id: "zl-hf-02", a: { char: "汗", zhuyin: "ㄏㄢˋ", emoji: "💦" }, b: { char: "飯", zhuyin: "ㄈㄢˋ", emoji: "🍚" } },
      { id: "zl-hf-03", a: { char: "狐", zhuyin: "ㄏㄨˊ", emoji: "🦊" }, b: { char: "福", zhuyin: "ㄈㄨˊ", emoji: "🧧" } },
      { id: "zl-hf-05", a: { char: "揮", zhuyin: "ㄏㄨㄟ", emoji: "👋" }, b: { char: "飛", zhuyin: "ㄈㄟ", emoji: "✈️" } },
      { id: "zl-hf-06", a: { char: "黃", zhuyin: "ㄏㄨㄤˊ", emoji: "🟡" }, b: { char: "房", zhuyin: "ㄈㄤˊ", emoji: "🏠" } },
      { id: "zl-hf-07", a: { char: "壺", zhuyin: "ㄏㄨˊ", emoji: "🫖" }, b: { char: "服", zhuyin: "ㄈㄨˊ", emoji: "👕" } }
    ]
  },
  {
    key: "retroflex",
    icon: "ㄓㄗ",
    title: "捲舌 和 不捲舌",
    subtitle: "ㄓㄗ、ㄔㄘ、ㄕㄙ、ㄖㄌ：山 / 三、蟲 / 叢…",
    sides: [
      { label: "捲舌", symbols: ["ㄓ", "ㄔ", "ㄕ", "ㄖ"], tip: "舌頭翹起來，往上捲" },
      { label: "不捲舌", symbols: ["ㄗ", "ㄘ", "ㄙ", "ㄌ"], tip: "舌頭平平的，頂在上面牙齒後面" }
    ],
    pairs: [
      { id: "zl-rf-01", a: { char: "紙", zhuyin: "ㄓˇ", emoji: "📄" }, b: { char: "紫", zhuyin: "ㄗˇ", emoji: "🟣" } },
      { id: "zl-rf-02", a: { char: "鐘", zhuyin: "ㄓㄨㄥ", emoji: "⏰" }, b: { char: "棕", zhuyin: "ㄗㄨㄥ", emoji: "🟤" } },
      { id: "zl-rf-04", a: { char: "炒", zhuyin: "ㄔㄠˇ", emoji: "🍳" }, b: { char: "草", zhuyin: "ㄘㄠˇ", emoji: "🌿" } },
      { id: "zl-rf-05", a: { char: "山", zhuyin: "ㄕㄢ", emoji: "⛰️" }, b: { char: "三", zhuyin: "ㄙㄢ", emoji: "3️⃣" } },
      { id: "zl-rf-06", a: { char: "獅", zhuyin: "ㄕ", emoji: "🦁" }, b: { char: "絲", zhuyin: "ㄙ", emoji: "🧶" } },
      { id: "zl-rf-07", a: { char: "閃", zhuyin: "ㄕㄢˇ", emoji: "⚡" }, b: { char: "傘", zhuyin: "ㄙㄢˇ", emoji: "☂️" } },
      { id: "zl-rf-08", a: { char: "肉", zhuyin: "ㄖㄡˋ", emoji: "🍖" }, b: { char: "漏", zhuyin: "ㄌㄡˋ", emoji: "💧" } },
      { id: "zl-rf-09", a: { char: "蟲", zhuyin: "ㄔㄨㄥˊ", emoji: "🐛" }, b: { char: "叢", zhuyin: "ㄘㄨㄥˊ", emoji: "🌳" } }
    ]
  }
];

window.ZHUYIN_LISTEN_GROUPS = ZHUYIN_LISTEN_GROUPS;
