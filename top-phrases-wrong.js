function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[(),„“"«»]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// Словари
const incorrectPhrases = new Map();
const correctPhrasesSet = new Set();

// Исключаем категорию "38"
const filteredQuestions = questions.filter((q) => q.categoryId !== "38");

// Сканируем все вопросы
filteredQuestions.forEach((q) => {
  const qId = q.qId;

  q.Choices.forEach((choice) => {
    const words = tokenize(choice.Text);

    for (let len = 1; len <= words.length; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(" ");
        if (choice.isCorrect) {
          correctPhrasesSet.add(phrase);
        } else {
          if (!incorrectPhrases.has(phrase))
            incorrectPhrases.set(phrase, new Set());
          incorrectPhrases.get(phrase).add(qId);
        }
      }
    }
  });
});

// Удаляем фразы, которые встречаются в правильных ответах
let candidates = Array.from(incorrectPhrases.entries()).filter(
  ([phrase]) => !correctPhrasesSet.has(phrase)
);

// Удаляем фразы, которые являются подстроками других фраз с тем же или большим охватом
const allPhrases = candidates.map(([p]) => p);
const finalSet = new Map();

candidates.forEach(([phrase, qIds]) => {
  const isSubstring = allPhrases.some(
    (other) =>
      other !== phrase &&
      other.includes(phrase) &&
      incorrectPhrases.get(other).size >= qIds.size
  );
  if (!isSubstring) {
    finalSet.set(phrase, qIds.size);
  }
});

// Получаем топ-100
const topPhrases = Array.from(finalSet.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 100);

// Выводим как строку
const resultString = topPhrases
  .map(([phrase, count]) => `"${phrase}"(${count})`)
  .join("; ");

console.log(resultString);
