// 減法測驗題庫（不退位）：依難度分三層 chick/snake/tiger，對應「小雞／蛇／老虎」三種難度。
// chick：10 以內的減法，snake：兩位數 − 一位數，tiger：兩位數 − 兩位數（都是小一範圍，不出三位數）。
// 每一題都刻意挑「被減數每一位都大於等於減數對應位」的組合，確保不會用到退位（借位）。
// id 是錯題本（forkid:mistakes）對應題目的唯一依據，舊題目換層時沿用原本的 id，不要改；新題目用新的 id，
// 不要重複使用已經出現過的 id，否則舊的錯題記錄會對應到不同的算式。
const SUBTRACTION_QUIZ_PROBLEMS = {
  chick: [
    { id: "sub-q-ten-01", a: 5, b: 2 },
    { id: "sub-q-ten-02", a: 8, b: 3 },
    { id: "sub-q-ten-03", a: 9, b: 4 },
    { id: "sub-q-ten-04", a: 7, b: 5 },
    { id: "sub-q-ten-05", a: 10, b: 6 },
    { id: "sub-q-ten-06", a: 6, b: 1 },
    { id: "sub-q-ten-07", a: 10, b: 3 },
    { id: "sub-q-ten-08", a: 9, b: 7 },
    { id: "sub-q-ten-09", a: 8, b: 4 },
    { id: "sub-q-ten-10", a: 6, b: 6 }
  ],
  snake: [
    { id: "sub-q-chick-01", a: 57, b: 1 },
    { id: "sub-q-chick-02", a: 25, b: 1 },
    { id: "sub-q-chick-03", a: 82, b: 2 },
    { id: "sub-q-chick-04", a: 83, b: 1 },
    { id: "sub-q-chick-05", a: 94, b: 2 },
    { id: "sub-q-chick-06", a: 72, b: 1 },
    { id: "sub-q-chick-07", a: 47, b: 1 },
    { id: "sub-q-chick-08", a: 22, b: 2 },
    { id: "sub-q-chick-09", a: 99, b: 3 },
    { id: "sub-q-chick-10", a: 84, b: 1 }
  ],
  tiger: [
    { id: "sub-q-snake-01", a: 46, b: 32 },
    { id: "sub-q-snake-02", a: 68, b: 30 },
    { id: "sub-q-snake-03", a: 22, b: 10 },
    { id: "sub-q-snake-04", a: 37, b: 26 },
    { id: "sub-q-snake-05", a: 22, b: 11 },
    { id: "sub-q-snake-06", a: 82, b: 81 },
    { id: "sub-q-snake-07", a: 33, b: 12 },
    { id: "sub-q-snake-08", a: 81, b: 71 },
    { id: "sub-q-snake-09", a: 68, b: 37 },
    { id: "sub-q-snake-10", a: 74, b: 60 }
  ]
};

window.SUBTRACTION_QUIZ_PROBLEMS = SUBTRACTION_QUIZ_PROBLEMS;
