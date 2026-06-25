// 加法測驗題庫（不進位）：依難度分三層 chick/snake/tiger，對應「小雞／蛇／老虎」三種難度。
// chick：兩位數 + 一位數，snake：兩位數 + 兩位數，tiger：三位數 + 三位數。
// 每一題都刻意挑「逐位相加不超過 9」的組合，確保不會用到進位（進位另外在「進位教學」data/carry-addition.js 練習）。
const ADDITION_QUIZ_PROBLEMS = {
  chick: [
    { id: "add-q-chick-01", a: 54, b: 4 },
    { id: "add-q-chick-02", a: 63, b: 5 },
    { id: "add-q-chick-03", a: 41, b: 3 },
    { id: "add-q-chick-04", a: 33, b: 4 },
    { id: "add-q-chick-05", a: 20, b: 5 },
    { id: "add-q-chick-06", a: 61, b: 6 },
    { id: "add-q-chick-07", a: 21, b: 4 },
    { id: "add-q-chick-08", a: 52, b: 7 },
    { id: "add-q-chick-09", a: 68, b: 1 },
    { id: "add-q-chick-10", a: 14, b: 2 }
  ],
  snake: [
    { id: "add-q-snake-01", a: 41, b: 50 },
    { id: "add-q-snake-02", a: 21, b: 31 },
    { id: "add-q-snake-03", a: 11, b: 84 },
    { id: "add-q-snake-04", a: 21, b: 75 },
    { id: "add-q-snake-05", a: 10, b: 19 },
    { id: "add-q-snake-06", a: 36, b: 10 },
    { id: "add-q-snake-07", a: 29, b: 40 },
    { id: "add-q-snake-08", a: 12, b: 51 },
    { id: "add-q-snake-09", a: 31, b: 51 },
    { id: "add-q-snake-10", a: 54, b: 24 }
  ],
  tiger: [
    { id: "add-q-tiger-01", a: 362, b: 526 },
    { id: "add-q-tiger-02", a: 441, b: 253 },
    { id: "add-q-tiger-03", a: 453, b: 102 },
    { id: "add-q-tiger-04", a: 476, b: 201 },
    { id: "add-q-tiger-05", a: 131, b: 302 },
    { id: "add-q-tiger-06", a: 141, b: 714 },
    { id: "add-q-tiger-07", a: 154, b: 132 },
    { id: "add-q-tiger-08", a: 571, b: 401 },
    { id: "add-q-tiger-09", a: 307, b: 641 },
    { id: "add-q-tiger-10", a: 233, b: 230 }
  ]
};

window.ADDITION_QUIZ_PROBLEMS = ADDITION_QUIZ_PROBLEMS;
