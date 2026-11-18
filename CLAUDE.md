# 小一練習網

給即將升小一的孩子用的課業練習網站，目標裝置是 iPad + Apple Pencil。Phase 1 為英文練習，之後會用同一套架構擴充國語、數學。

## 架構

純靜態網站，沒有 build step、沒有框架，直接用瀏覽器打開（或用簡單的 HTTP server）即可跑：

```
index.html          # 畫面結構（home / 英文選單 / 選擇題 / 手寫練習 / 翻牌記憶卡 / 國語手寫練習 / 數學選單與各練習）
css/style.css        # 全站樣式（design system 見下方）
js/app.js             # 畫面導覽（.screen 用 hidden 屬性切換）
js/quiz.js            # 通用選擇題元件 initQuiz(root, questions, opts)
js/handwriting.js     # 通用手寫練習元件 initHandwriting(root, letters, opts)，沒有大小寫概念的科目（如注音）可傳 showCaseToggle:false 隱藏大小寫切換 UI
js/memory.js          # 通用翻牌記憶卡元件 initMemory(root, wordMap, opts)
js/zhuyin-builder.js  # 注音拼音點選積木元件 initZhuyinBuilder(root, syllables, opts)
js/zhuyin-listen.js   # 注音易混淆聽辨元件 initZhuyinListen(root, groups, opts)：選一組（ㄢㄤ/ㄣㄥ/ㄏㄈ/捲舌不捲舌）→「先聽聽看」教學頁（口訣 + 字組點了就唸）→ 🐥看圖+注音 / 🐍只看注音 練習；選擇頁另有 🐯 四組混合、👂 家長試聽清單（顯示國字 + 目前用哪個語音，給家長在實機上檢查語音有沒有唸錯）。播一個字的真人錄音（沒有錄音才退回語音合成）、二選一點注音作答，畫面不出現國字（小朋友還不識字）；教學頁的注音符號可以點，播符號單音。答錯記錄錯題本（subject: zhuyin-listen），錯題重練傳 opts.retry={questions:[q]}。也匯出 zlQuestionsOf(groups) 給錯題複習用 id 找回題目
js/mistake-review.js  # 錯題複習元件 initMistakeReview(root, opts)，讀 quiz.js 寫入的 forkid:mistakes，去重後列清單，點一筆可跳回原出題元件單獨重練那一題
js/carry-addition-teach.js # 十位數加法進位教學元件 initCarryAdditionTeach(root, problems, opts)，用十格積木視覺化「個位湊10綁成1個十、搬到十位」，每題拆成算個位/綁十/算十位/看結果四步驟，是教學流程不是測驗，答錯不記錄錯題本
js/math-quiz.js       # 通用數學測驗引擎 initMathQuiz(root, problemsInput, opts)，加法測驗/減法測驗/分與合練習共用，差異只在 opts.operator（+/-）跟資料內容。problemsInput 給 {chick,snake,tiger} 三層物件會先顯示難度選擇畫面（小雞/蛇/老虎），給單一陣列（錯題複習單題重練用）則跳過難度選擇直接進測驗。題目 {id,a,b} 可另帶 op（覆蓋 operator）、blank（"a"/"b"/"result"，挖空哪格）、show:"house"（用分合屋圖出題）；opts.difficultyDesc 可自訂難度說明。一題一個算式 4 選 1，答錯會記錄到 forkid:mistakes
js/number-bond.js     # 分與合教學元件 initNumberBond(root, {onBack, onPractice})，三個分頁：🔬探索（點東西移到另一盤 + 所有分法）/ 🏠分合屋（分合屋圖 + 1 加 2 減三個算式 + 可唸出的生活故事）/ 🎯練習（呼叫 onPractice 交給 app.js 開 initMathQuiz）。是教學流程不記錄錯題。也匯出全域 renderBondHouse() 給 math-quiz.js 的 show:"house" 題目共用
data/english-mc.js    # 英文選擇題題庫（依分類，不綁字母）+ 匯出 ENGLISH_WORDS、ENGLISH_CATEGORY_WORDS 給手寫練習/記憶卡共用
data/english-letters.js # 英文手寫字母清單（大小寫）
data/chinese-zhuyin.js # 國語注音符號手寫題庫（37 個符號 + 示範詞 wordMap），upper/lower 設成同一符號搭配 showCaseToggle:false 重用手寫元件
data/zhuyin-syllables.js # 國語注音拼音積木題庫（常用字拆解成聲母/韻母/聲調）
data/zhuyin-confusables.js # 注音易混淆聽辨題庫 ZHUYIN_LISTEN_GROUPS，每組 sides[0]/sides[1] 是兩邊的音（左橘右綠），pairs 是只差那個音、聲調相同、非破音字、而且教育部辭典有收錄錄音的兩個字（每個 pair 拆成 -a/-b 兩題，id 不能重複使用，已停用的 id 列在檔案開頭）。ㄖ 跟 ㄌ 配對放在「捲舌 vs 不捲舌」組
data/zhuyin-audio.js # 注音聽辨的真人錄音對照表：ZHUYIN_CHAR_AUDIO（字 → 辭典錄音檔 + 只播字音要停在第幾秒 end）、ZHUYIN_SYMBOL_AUDIO（符號 → 注音符號手冊錄音 + 音量倍率 gain）。改題庫時要一起更新
audio/                # 教育部公開授權音檔，原檔照原樣存放（來源、授權、檔名規則見 audio/README.md）：moe-dict/ 國語辭典簡編本單字錄音（CC BY-ND 3.0 TW，必須保留使用說明 PDF）、bopomofo/ 國語注音符號手冊符號錄音（CC BY 4.0）
data/carry-addition.js # 進位教學題庫（兩位數+兩位數，刻意挑個位相加會超過10、十位相加+進位不超過9的組合），教學元件專用，不分難度
data/addition-quiz.js # 加法測驗題庫（不進位），{chick,snake,tiger} 三層難度＝10 以內 / 兩位數+一位數 / 兩位數+兩位數（小一範圍，不出三位數），規則是逐位相加都不超過9
data/subtraction-quiz.js # 減法測驗題庫（不退位），{chick,snake,tiger} 三層難度＝10 以內 / 兩位數−一位數 / 兩位數−兩位數，規則是被減數逐位都大於等於減數對應位
data/number-bond-quiz.js # 分與合練習題庫（10 以內），chick＝分合屋合起來、snake＝分合屋分一分、tiger＝加減算式填空；另匯出 NUMBER_BOND_DIFFICULTY_DESC
music.html            # 五線譜小樂園（獨立頁面，樣式/腳本內嵌，從首頁「音樂」卡片進入，左上角「◀ 返回首頁」回 index.html）：認識音階 / 玩音符 / 彈歌曲 / 小測驗
data/music-songs.js   # 「彈歌曲」歌單，用簡譜字串寫（1 = 中央 Do），載入時自動檢查每小節拍數跟音域，寫錯的歌不上架並在 console 報錯；加歌只改這個檔
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

**數學計算題（加法/減法測驗）的難度分層慣例**：用「小雞🐥簡單／蛇🐍中等／老虎🐯困難」三種動物代表難度，資料寫成 `{ chick: [...], snake: [...], tiger: [...] }` 三層物件丟給 `initMathQuiz`，元件會先顯示難度選擇畫面（重用 `.category-button.cat-chick/.cat-snake/.cat-tiger`），選完才進測驗。要加新的數學測驗科目，只要準備同樣的三層資料 + 在 `js/app.js` 呼叫 `initMathQuiz(root, data, {operator, icon, categoryLabel, subjectId, onBack, onHome})`，不用改元件本身。錯題複習單題重練時則直接傳單一陣列（不是三層物件）給 `initMathQuiz`，元件會跳過難度選擇直接進入那一題。

**數學題目 id 不能重複使用**：錯題本只靠 `questionId` 對回題目，調整難度分層時，舊題目搬到別層要沿用原本的 id（例如 `add-q-chick-01` 現在在 snake 層），新題目一律用新的 id；把 id 換給不同的算式會讓舊錯題記錄對到錯的題目。

**分與合的顏色約定**：左邊一組＝橘（`#FFF3E0`/`#E65100`）、右邊一組＝綠（`#E8F5E9`/`#166534`）、總數＝紫（紫色漸層 / `#6D28D9`），探索、分合屋、故事、算式、練習題全部一致，讓小朋友靠顏色認出「哪個數字是哪一組」。

**選擇題題庫不是「1 字母 1 題」**：`data/english-mc.js` 用 `CATEGORY_WORDS = { 分類: { 單字: emoji, ... } }` 組織，每個單字各自成一題，干擾選項從同分類單字池隨機抽 3 個。要加新題目只要在對應分類物件裡加一筆 `單字: emoji`；要加新分類，除了加 `CATEGORY_WORDS` 的 key，還要在 `js/quiz.js` 的 `CATEGORY_META` 加 emoji/label、在 `index.html` 的 `.category-list` 加一顆 `.category-button.cat-xxx`、在 `css/style.css` 加對應漸層色（見下方色票）。手寫練習仍維持 `LETTER_WORD`（A~Z 各一個代表單字）獨立維護，不受選擇題分類調整影響。

## 設計決策

- **Emoji 用 Twemoji CDN 圖片**，不用系統字型 emoji：`https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/72x72/{codepoints}.png`（見 `js/quiz.js` 的 `twemojiUrl()`）。原因是 Windows 字型沒有某些 emoji（例如 🩻 X-ray）會顯示空白，CDN 圖片確保所有裝置/瀏覽器長相一致。版本號刻意寫死不用 `@latest`：jsDelivr 解析 `@latest` 較慢、快取不穩，上游改版也可能讓圖片突然變樣；要用新版 emoji 時再手動升版號，升級後要確認題庫用到的每個 emoji 在新版都還在。
- **iPad 觸控**：`css/style.css` 全站設 `touch-action: manipulation`（防連點觸發雙擊放大，需要 `touch-action:none` 的畫布用 class 覆蓋）、圖片關掉長按選單、所有按鈕用 `:where(...):active` 統一「按下縮一下」的回饋（權重最低，元件自己的 `:active` 會優先）。新元件不用另外處理這三件事。
- **答錯記錄到 localStorage**，key 是 `forkid:mistakes`，格式 `{subject, questionId, letter, correctAnswer, selectedWrong, timestamp}`，不分科目共用一份錯題本，方便之後做總覽。
- **選擇題流程是「答錯立刻揭曉正確答案、不能重試，按『下一題』手動前進」**，不是自動跳題或重試到對。這是照抄使用者提供的參考檔 `小一練習.html`（Claude Design 產出的原型）的 UX。
- **手寫練習保留大小寫切換 + 完整 A~Z**，這點刻意超越參考檔（參考檔原型只做了 6 個大寫字母示範）。
- **注音聽辨例外：用教育部真人錄音**。台灣中文語音合成（iOS 美佳、Windows Hanhan 等）本身就 ㄣㄥ 不分、捲舌不明顯——這是台灣國語的發音演變（陽明交大/台大 2025 研究證實 ㄣㄥ 正在合併，前面接 ㄧ 時最難分），語音是照台灣人的聲音訓練的，換哪個台灣語音都一樣，所以 `js/zhuyin-listen.js` 改播 `audio/` 的教育部錄音。辭典授權禁止改作，所以**不剪檔、不轉檔**，用 Web Audio `start(0, 0, end)` 只播開頭字音段；iOS 網頁音訊預設走鈴聲音量很小聲，所以設 `navigator.audioSession.type = "playback"`，輸出再串壓縮器 + 增益 + 柔性限幅（參數用 OfflineAudioContext 實測調過）。
- **其它音效不用外部音檔，全部即時合成**：單字發音用瀏覽器內建 `speechSynthesis`（`js/quiz.js` 的 `speakWord()`），答對/答錯提示音用 Web Audio API 振盪器即時合成（`playTone()`/`playCorrectSound()`/`playWrongSound()`）。原因是不用下載/管理音檔資源，也沒有授權問題。每個選項旁的 🔊 圖示點擊只唸該單字、不會被當成選答案（用 `stopPropagation()` 跟父層的 option-button click 區隔）；答題後無論對錯都會自動唸一次正確答案的發音做加強記憶。

## GUI Design System

字體：Google Fonts **Nunito**（700/800/900），圓潤兒童風，全站套用。

### 色票

| 用途 | 顏色 |
|---|---|
| 背景 | `#FFF9F0` |
| 主文字 | `#292524` (stone-800) |
| 副文字 | `#78716C` (stone-500) |
| 橘色漸層（英文 / 水果 / 選擇題 / 進度條起點） | `linear-gradient(145deg, #FF7043, #FFA726)` |
| 青色漸層（動物類別 / 音樂卡片） | `linear-gradient(145deg, #26C6DA, #4DB6AC)` |
| 紫色漸層（其它類別 / 國語卡片） | `linear-gradient(145deg, #AB47BC, #7E57C2)` |
| 藍色漸層（數學卡片 / 全部類別） | `linear-gradient(145deg, #42A5F5, #5C6BC0)` |
| 綠色漸層（手寫練習主題色） | `linear-gradient(135deg, #22C55E, #4ADE80)` |
| 黃褐漸層（文具類別） | `linear-gradient(145deg, #F59E0B, #FBBF24)` |
| 萊姆綠漸層（大自然類別） | `linear-gradient(145deg, #65A30D, #A3E635)` |
| 玫紅漸層（身體類別） | `linear-gradient(145deg, #F43F5E, #FB7185)` |
| 黃色漸層（小雞🐥難度，數學測驗最簡單） | `linear-gradient(145deg, #FBBF24, #FDE047)` |
| 綠色漸層（蛇🐍難度，數學測驗中等） | `linear-gradient(145deg, #16A34A, #4ADE80)` |
| 深橘紅漸層（老虎🐯難度，數學測驗最難） | `linear-gradient(145deg, #EA580C, #DC2626)` |
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
