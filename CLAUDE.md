# 小一練習網

給即將升小一的孩子用的課業練習網站，目標裝置是 iPad + Apple Pencil。Phase 1 為英文練習，之後會用同一套架構擴充國語、數學。

## 架構

純靜態網站，沒有 build step、沒有框架，直接用瀏覽器打開（或用簡單的 HTTP server）即可跑：

```
index.html          # 畫面結構（home / 英文選單 / 選擇題 / 手寫練習 / 翻牌記憶卡 / 國語手寫練習）
css/style.css        # 全站樣式（design system 見下方）
js/app.js             # 畫面導覽（.screen 用 hidden 屬性切換）
js/quiz.js            # 通用選擇題元件 initQuiz(root, questions, opts)
js/handwriting.js     # 通用手寫練習元件 initHandwriting(root, letters, opts)，沒有大小寫概念的科目（如注音）可傳 showCaseToggle:false 隱藏大小寫切換 UI
js/memory.js          # 通用翻牌記憶卡元件 initMemory(root, wordMap, opts)
js/zhuyin-builder.js  # 注音拼音點選積木元件 initZhuyinBuilder(root, syllables, opts)
js/mistake-review.js  # 錯題複習元件 initMistakeReview(root, opts)，讀 quiz.js 寫入的 forkid:mistakes，去重後列清單，點一筆可跳回原出題元件單獨重練那一題
data/english-mc.js    # 英文選擇題題庫（依分類，不綁字母）+ 匯出 ENGLISH_WORDS、ENGLISH_CATEGORY_WORDS 給手寫練習/記憶卡共用
data/english-letters.js # 英文手寫字母清單（大小寫）
data/chinese-zhuyin.js # 國語注音符號手寫題庫（37 個符號 + 示範詞 wordMap），upper/lower 設成同一符號搭配 showCaseToggle:false 重用手寫元件
data/zhuyin-syllables.js # 國語注音拼音積木題庫（常用字拆解成聲母/韻母/聲調）
grade1-2_english_vocabulary.md # 國小一二年級英文單字參考清單（出題詞彙來源，唯讀）
```

本機預覽：`.claude/launch.json` 設定用 `python -m http.server 5500`，裡面有兩組設定給不同電腦用（這個 repo 會在 Windows 跟 Mac 兩台機器上 clone）：
- `static-site-windows`：用完整路徑 `C:\ProgramData\Anaconda3\python.exe`，因為純 `python` 指令在這個 Windows 環境的 preview 啟動流程裡找不到（PATH 沒帶到 Anaconda）。
- `static-site-mac`：用 `python3`（macOS 內建路徑 `/usr/bin/python3` 通常就在預設 PATH 裡，不用寫死絕對路徑）。

用 `preview_start` 啟動時依照當前作業系統選對應的 name；Windows 用 `static-site-windows`，Mac 用 `static-site-mac`。

## 通用化資料 schema（給國語/數學擴充用）

選擇題只要準備同樣 schema 的資料丟給 `initQuiz`，元件不用改：

```js
{
  id: "en-mc-01",
  letter: "A",                 // 跟字母/單元的關聯
  category: "fruits",          // 用於分類晶片顏色 + localStorage 記錄
  prompt: { type: "emoji" | "text", value: "🍎" },  // emoji 用 Twemoji 圖、text 用大字（給算式/注音之類用）
  correctAnswer: "Apple",
  options: ["Apple", "Banana", "Orange", "Grape"]
}
```

手寫練習只要準備 `{ upper, lower }` 陣列 + 一份 `wordMap`（`letter -> {word, emoji}`）即可重用 `initHandwriting`。

**選擇題題庫不是「1 字母 1 題」**：`data/english-mc.js` 用 `CATEGORY_WORDS = { 分類: { 單字: emoji, ... } }` 組織，每個單字各自成一題，干擾選項從同分類單字池隨機抽 3 個。要加新題目只要在對應分類物件裡加一筆 `單字: emoji`；要加新分類，除了加 `CATEGORY_WORDS` 的 key，還要在 `js/quiz.js` 的 `CATEGORY_META` 加 emoji/label、在 `index.html` 的 `.category-list` 加一顆 `.category-button.cat-xxx`、在 `css/style.css` 加對應漸層色（見下方色票）。手寫練習仍維持 `LETTER_WORD`（A~Z 各一個代表單字）獨立維護，不受選擇題分類調整影響。

## 設計決策

- **Emoji 用 Twemoji CDN 圖片**，不用系統字型 emoji：`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/{codepoints}.png`（見 `js/quiz.js` 的 `twemojiUrl()`）。原因是 Windows 字型沒有某些 emoji（例如 🩻 X-ray）會顯示空白，CDN 圖片確保所有裝置/瀏覽器長相一致。
- **答錯記錄到 localStorage**，key 是 `forkid:mistakes`，格式 `{subject, questionId, letter, correctAnswer, selectedWrong, timestamp}`，不分科目共用一份錯題本，方便之後做總覽。
- **選擇題流程是「答錯立刻揭曉正確答案、不能重試，按『下一題』手動前進」**，不是自動跳題或重試到對。這是照抄使用者提供的參考檔 `小一練習.html`（Claude Design 產出的原型）的 UX。
- **手寫練習保留大小寫切換 + 完整 A~Z**，這點刻意超越參考檔（參考檔原型只做了 6 個大寫字母示範）。
- **音效不用外部音檔，全部即時合成**：單字發音用瀏覽器內建 `speechSynthesis`（`js/quiz.js` 的 `speakWord()`），答對/答錯提示音用 Web Audio API 振盪器即時合成（`playTone()`/`playCorrectSound()`/`playWrongSound()`）。原因是不用下載/管理音檔資源，也沒有授權問題。每個選項旁的 🔊 圖示點擊只唸該單字、不會被當成選答案（用 `stopPropagation()` 跟父層的 option-button click 區隔）；答題後無論對錯都會自動唸一次正確答案的發音做加強記憶。

## GUI Design System

字體：Google Fonts **Nunito**（700/800/900），圓潤兒童風，全站套用。

### 色票

| 用途 | 顏色 |
|---|---|
| 背景 | `#FFF9F0` |
| 主文字 | `#292524` (stone-800) |
| 副文字 | `#78716C` (stone-500) |
| 橘色漸層（英文 / 水果 / 選擇題 / 進度條起點） | `linear-gradient(145deg, #FF7043, #FFA726)` |
| 青色漸層（動物類別） | `linear-gradient(145deg, #26C6DA, #4DB6AC)` |
| 紫色漸層（其它類別 / 國語卡片） | `linear-gradient(145deg, #AB47BC, #7E57C2)` |
| 藍色漸層（數學卡片 / 全部類別） | `linear-gradient(145deg, #42A5F5, #5C6BC0)` |
| 綠色漸層（手寫練習主題色） | `linear-gradient(135deg, #22C55E, #4ADE80)` |
| 黃褐漸層（文具類別） | `linear-gradient(145deg, #F59E0B, #FBBF24)` |
| 萊姆綠漸層（大自然類別） | `linear-gradient(145deg, #65A30D, #A3E635)` |
| 玫紅漸層（身體類別） | `linear-gradient(145deg, #F43F5E, #FB7185)` |
| 進度條漸層 | `linear-gradient(90deg, #FF7043, #FBBF24)` |
| 答對 | 背景 `#DCFCE7` / 邊框 `#22C55E` / 文字 `#166534` |
| 答錯 | 背景 `#FEE2E2` / 邊框 `#EF4444` / 文字 `#991B1B` |
| 正確答案提示 banner | 背景 `#FEF9C3`，答案文字 `#C2410C` |

### 圓角 / 陰影

- 卡片類（subject-card、category-button、menu-row、quiz-prompt、result 區塊）：22px，大圖卡 prompt 用 28px
- 按鈕類（option-button、next/primary/secondary-button、clear/hw-next-button）：16–18px，全部是「全圓角」風格，不用方角
- icon-only 小按鈕（back-square、hw-nav-arrow）：12px，刻意維持小尺寸跟參考檔一致
- 陰影分兩級：`--shadow-sm`（小元件用，`0 2px 6px rgba(0,0,0,.06)`）、`--shadow-md`（卡片用，`0 6px 20px rgba(0,0,0,.08)`），漸層卡片各自有對應顏色的彩色陰影（如 `rgba(255,112,67,.35)`）

### 觸控目標

所有可點擊按鈕（選項、下一題、再玩一次、清除、手寫下一個字母）最小高度 **66px**，符合平板手指/Pencil 操作。例外：icon-only 的 back-square / hw-nav-arrow 維持參考檔量到的 42px/32px 小尺寸，不放大。

### 版面間距

題目畫面內（`#quiz-root`）用 `display:flex; flex-direction:column; gap:16px`，讓進度條區、分類/分數列、題目卡、答題回饋 banner、選項格、下一題按鈕之間維持一致 16px 間距（不能只靠陰影硬擠出視覺間距）。

**新增任何畫面/元件時，根容器（如 `#xxx-root`）都要套用同樣的 `display:flex; flex-direction:column; gap:16px`**，讓裡面一排一排的區塊（標題列、進度列、卡片、回饋 banner、選項列、按鈕）自動維持 16px 間距，不要漏加。容器內若還有更小的子分組（例如一排選項按鈕、一組 chip），用 `gap:8~10px` 讓同排元素之間也有呼吸空間，不要讓元素緊貼在一起。新元件寫完後務必在瀏覽器裡看一輪排版，間距不夠就直接加 `gap`，不要事後才補。

### 動畫

| 名稱 | 用在哪裡 | 效果 |
|---|---|---|
| `bounceOwl` | 首頁貓頭鷹吉祥物 `.mascot` | 無限循環緩慢上下彈跳 |
| `correctPop` | 答對選項 `.option-button.correct` | 短暫放大再縮回 |
| `wrongShake` | 答錯選項 `.option-button.wrong` | 左右震動 |
| `slideUp` | 答題回饋 banner `.feedback-banner` | 從下滑入 + 淡入 |

confetti（✨⭐🎉）動畫在答對時於 `.quiz-prompt` 上方噴出，邏輯在 `js/quiz.js` 的 `spawnConfetti()`。

## 參考檔案

`小一練習.html` 是使用者用「Claude Design」工具產出的 GUI 原型，**唯讀、不要編輯**。它是壓縮過的單檔 bundle，沒有語意化的 class/id，只能用瀏覽器渲染後讀 DOM/算 computed style 來還原設計規格，不能直接當原始碼讀。上面這份 design system 就是這樣量出來的。
