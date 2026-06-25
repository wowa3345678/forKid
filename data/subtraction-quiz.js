// 減法測驗題庫（不退位）：依難度分三層 chick/snake/tiger，對應「小雞／蛇／老虎」三種難度。
// chick：兩位數 − 一位數，snake：兩位數 − 兩位數，tiger：三位數 − 三位數。
// 每一題都刻意挑「被減數每一位都大於等於減數對應位」的組合，確保不會用到退位（借位）。
const SUBTRACTION_QUIZ_PROBLEMS = {
  chick: [
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
  snake: [
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
  ],
  tiger: [
    { id: "sub-q-tiger-01", a: 904, b: 304 },
    { id: "sub-q-tiger-02", a: 613, b: 512 },
    { id: "sub-q-tiger-03", a: 542, b: 532 },
    { id: "sub-q-tiger-04", a: 638, b: 406 },
    { id: "sub-q-tiger-05", a: 712, b: 311 },
    { id: "sub-q-tiger-06", a: 784, b: 741 },
    { id: "sub-q-tiger-07", a: 961, b: 751 },
    { id: "sub-q-tiger-08", a: 249, b: 239 },
    { id: "sub-q-tiger-09", a: 988, b: 942 },
    { id: "sub-q-tiger-10", a: 885, b: 811 }
  ]
};

window.SUBTRACTION_QUIZ_PROBLEMS = SUBTRACTION_QUIZ_PROBLEMS;
