// 十位數加法進位教學題庫：兩位數 + 兩位數，刻意挑「個位相加會超過 10」的組合（需要進位到十位），
// 且十位相加再加上進位後不超過 9（這個元件只教「個位進位到十位」這一種情境，不教十位進位到百位）。
const CARRY_ADDITION_PROBLEMS = [
  { a: 27, b: 15 },
  { a: 38, b: 24 },
  { a: 49, b: 16 },
  { a: 56, b: 27 },
  { a: 19, b: 34 },
  { a: 45, b: 38 }
];

window.CARRY_ADDITION_PROBLEMS = CARRY_ADDITION_PROBLEMS;
