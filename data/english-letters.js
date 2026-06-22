// 手寫練習題庫：A~Z，含大寫與小寫字形。之後若要加筆順提示可以在每個物件加欄位，不影響元件邏輯。
window.ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  upper: letter,
  lower: letter.toLowerCase()
}));
