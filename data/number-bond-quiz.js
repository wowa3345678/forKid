// 分與合練習題庫（10 以內）：依難度分三層 chick/snake/tiger，丟給 initMathQuiz 共用數學測驗引擎。
// 每題是 { id, a, b, op?, blank?, show? }：算式是 a op b = 結果（op 沒寫就用 "+"），
// blank 指定哪一格挖空要小朋友選（"a" | "b" | "result"，沒寫就是 "result"），
// show: "house" 代表用分合屋圖呈現（屋頂是結果、下面兩格是 a 和 b），沒寫就用一般算式呈現。
// chick：分合屋「合起來」（兩邊給好，算屋頂）
// snake：分合屋「分一分」（屋頂跟一邊給好，算另一邊，含 0 的分法）
// tiger：算式填空，加法和減法都有，空格可能在任何位置
const NUMBER_BOND_QUIZ_PROBLEMS = {
  chick: [
    { id: "bond-q-chick-01", a: 2, b: 3, show: "house" },
    { id: "bond-q-chick-02", a: 4, b: 1, show: "house" },
    { id: "bond-q-chick-03", a: 3, b: 5, show: "house" },
    { id: "bond-q-chick-04", a: 6, b: 2, show: "house" },
    { id: "bond-q-chick-05", a: 4, b: 4, show: "house" },
    { id: "bond-q-chick-06", a: 7, b: 2, show: "house" },
    { id: "bond-q-chick-07", a: 5, b: 5, show: "house" },
    { id: "bond-q-chick-08", a: 3, b: 6, show: "house" },
    { id: "bond-q-chick-09", a: 1, b: 8, show: "house" },
    { id: "bond-q-chick-10", a: 6, b: 4, show: "house" }
  ],
  snake: [
    { id: "bond-q-snake-01", a: 3, b: 4, blank: "b", show: "house" },
    { id: "bond-q-snake-02", a: 4, b: 5, blank: "a", show: "house" },
    { id: "bond-q-snake-03", a: 2, b: 4, blank: "b", show: "house" },
    { id: "bond-q-snake-04", a: 7, b: 3, blank: "a", show: "house" },
    { id: "bond-q-snake-05", a: 5, b: 3, blank: "b", show: "house" },
    { id: "bond-q-snake-06", a: 4, b: 1, blank: "a", show: "house" },
    { id: "bond-q-snake-07", a: 6, b: 4, blank: "b", show: "house" },
    { id: "bond-q-snake-08", a: 0, b: 8, blank: "a", show: "house" },
    { id: "bond-q-snake-09", a: 2, b: 7, blank: "b", show: "house" },
    { id: "bond-q-snake-10", a: 2, b: 2, blank: "a", show: "house" }
  ],
  tiger: [
    { id: "bond-q-tiger-01", a: 3, b: 5, blank: "b" },
    { id: "bond-q-tiger-02", a: 6, b: 4, blank: "a" },
    { id: "bond-q-tiger-03", a: 9, b: 3, op: "-" },
    { id: "bond-q-tiger-04", a: 7, b: 5, op: "-", blank: "b" },
    { id: "bond-q-tiger-05", a: 9, b: 4, op: "-", blank: "a" },
    { id: "bond-q-tiger-06", a: 2, b: 7, blank: "b" },
    { id: "bond-q-tiger-07", a: 10, b: 4, op: "-", blank: "b" },
    { id: "bond-q-tiger-08", a: 2, b: 5, blank: "a" },
    { id: "bond-q-tiger-09", a: 8, b: 8, op: "-" },
    { id: "bond-q-tiger-10", a: 6, b: 5, op: "-", blank: "b" }
  ]
};

// 難度選擇畫面的說明文字（覆蓋 initMathQuiz 預設照 operator 產生的說明）
const NUMBER_BOND_DIFFICULTY_DESC = {
  chick: "分合屋：兩邊合起來是多少？",
  snake: "分合屋：分成兩邊，另一邊是多少？",
  tiger: "算式填空：加法、減法都有"
};

window.NUMBER_BOND_QUIZ_PROBLEMS = NUMBER_BOND_QUIZ_PROBLEMS;
