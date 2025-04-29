// Хелпер: токенизация без запятых и скобок
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[(),„“"«»]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// Словари
const correctPhrases = new Map();
const incorrectPhrases = new Set();
const correctQuestionsPerPhrase = new Map();

// Фильтруем вопросы с categoryId !== "38"
const filteredQuestions = questions.filter((q) => q.categoryId !== "38");

filteredQuestions.forEach((q) => {
  const correct = q.Choices.filter((c) => c.isCorrect);
  const incorrect = q.Choices.filter((c) => !c.isCorrect);
  const qId = q.qId;

  correct.forEach((c) => {
    const words = tokenize(c.Text);

    for (let len = 1; len <= words.length; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(" ");
        if (!correctPhrases.has(phrase)) correctPhrases.set(phrase, new Set());
        correctPhrases.get(phrase).add(qId);
      }
    }
  });

  incorrect.forEach((c) => {
    const words = tokenize(c.Text);
    for (let len = 1; len <= words.length; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(" ");
        incorrectPhrases.add(phrase);
      }
    }
  });
});

// Оставляем только фразы, которых нет в неправильных ответах
let candidates = Array.from(correctPhrases.entries()).filter(
  ([phrase]) => !incorrectPhrases.has(phrase)
);

// Сортируем по охвату вопросов
candidates.sort((a, b) => b[1].size - a[1].size);

// Удаляем фразы, которые полностью содержатся в других более длинных фразах с тем же или большим охватом
const finalSet = new Map();
const allPhrases = candidates.map(([p]) => p);

candidates.forEach(([phrase, qIds]) => {
  const isSubstring = allPhrases.some(
    (other) =>
      other !== phrase &&
      other.includes(phrase) &&
      correctPhrases.get(other).size >= qIds.size
  );
  if (!isSubstring) {
    finalSet.set(phrase, qIds.size);
  }
});

// Получаем топ-100 фраз
const topPhrases = Array.from(finalSet.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 100);

// Результат в виде строки
const resultString = topPhrases
  .map(([phrase, count]) => `"${phrase}"(${count})`)
  .join("; ");

console.log(resultString);
