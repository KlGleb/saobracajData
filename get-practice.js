(async () => {
  const results = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < 100; i++) {
    try {
      // 1. Открыть симуляцию в новом окне
      const popup = window.open(
        "https://servisi.euprava.gov.rs/autoskole/ExamPractice/CandidateSimulation",
        "_blank"
      );

      // 2. Ждать редиректа и получить id из URL
      const id = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          try {
            const href = popup?.location?.href;
            const match = href && href.match(/\/Index\/([a-f0-9-]+)/);
            if (match) {
              clearInterval(interval);
              popup.close();
              resolve(match[1]);
            }
          } catch (_) {
            /* CORS пока не загружено — игнор */
          }
        }, 300);

        setTimeout(() => {
          clearInterval(interval);
          popup?.close();
          reject(new Error("Не удалось получить ID за 10 секунд"));
        }, 10000);
      });

      // 3. Отправить язык
      const boundary = "----WebKitFormBoundaryNFqBMuoAVZP0xAv2";
      const body = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="id"\r\n`,
        id,
        `--${boundary}`,
        `Content-Disposition: form-data; name="LanguageId"\r\n`,
        `9`,
        `--${boundary}--`,
      ].join("\r\n");

      await fetch(
        "https://servisi.euprava.gov.rs/autoskole/ExamPractice/ChooseLanguage",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": `multipart/form-data; boundary=${boundary}`,
          },
          body,
          referrer: `https://servisi.euprava.gov.rs/autoskole/ExamPractice/ChooseLanguage?id=${id}`,
          referrerPolicy: "strict-origin-when-cross-origin",
        }
      );

      // 4. Получить данные
      const dataResponse = await fetch(
        "https://servisi.euprava.gov.rs/autoskole/ExamPractice/GetExamPracticeData",
        {
          method: "POST",
          credentials: "include",
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/json; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
          },
          body: JSON.stringify({ id }),
          referrer: `https://servisi.euprava.gov.rs/autoskole/ExamPractice/Index/${id}`,
          referrerPolicy: "strict-origin-when-cross-origin",
        }
      );

      const data = await dataResponse.json();
      const qIds = data.practiceData.map((item) => item.qId);
      results.push(qIds);
      console.log(`✅ ${i + 1}/100 — получено ${qIds.length} qId`);
    } catch (err) {
      console.error(`❌ ${i + 1}/100 — ошибка:`, err);
      results.push([]);
    }

    await delay(1000);
  }

  console.log("✅ Готово! Все qId:");
  console.log(results);
})();
