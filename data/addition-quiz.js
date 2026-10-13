// 加法測驗題庫（不進位）：依難度分三層 chick/snake/tiger，對應「小雞／蛇／老虎」三種難度。
// chick：10 以內的加法，snake：兩位數 + 一位數，tiger：兩位數 + 兩位數（都是小一範圍，不出三位數）。
// 每一題都刻意挑「逐位相加不超過 9」的組合，確保不會用到進位（進位另外在「進位教學」data/carry-addition.js 練習）。
// id 是錯題本（forkid:mistakes）對應題目的唯一依據，舊題目換層時沿用原本的 id，不要改；新題目用新的 id，
// 不要重複使用已經出現過的 id，否則舊的錯題記錄會對應到不同的算式。
const ADDITION_QUIZ_PROBLEMS = {
  chick: [
    { id: "add-q-ten-01", a: 2, b: 3 },
    { id: "add-q-ten-02", a: 4, b: 5 },
    { id: "add-q-ten-03", a: 1, b: 6 },
    { id: "add-q-ten-04", a: 3, b: 3 },
    { id: "add-q-ten-05", a: 6, b: 2 },
    { id: "add-q-ten-06", a: 7, b: 3 },
    { id: "add-q-ten-07", a: 2, b: 8 },
    { id: "add-q-ten-08", a: 5, b: 4 },
    { id: "add-q-ten-09", a: 1, b: 9 },
    { id: "add-q-ten-10", a: 4, b: 4 }
  ],
  snake: [
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
  tiger: [
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
  ]
};

window.ADDITION_QUIZ_PROBLEMS = ADDITION_QUIZ_PROBLEMS;
