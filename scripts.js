async function getData(questionSubcategoryId) {
  try {
    const response = await fetch(
      _AppDir_ + "/QuestionsPractice/GetQuestionsPracticeData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          id: practiceId,
          languageId: languageId,
          questionSubcategoryId: questionSubcategoryId,
        }),
      }
    );

    return await response.json();
  } catch (e) {
    return null;
  }
}

for (var k in cats) {
  var cat = cats[k];
  var catId = cat["id"];
  for (var subcatKey in cat.subcategories) {
    let subCategoryId = cat.subcategories[subcatKey]["Id"];
    let questionsD = await getData(cat.subcategories[subcatKey]["Id"]);
    let questions = questionsD.practiceData;
    for (var q in questions) {
      questions[q]["categoryId"] = catId;
      questions[q]["subcategoryId"] = subCategoryId;
      result2.push(questions[q]);
    }
  }
}


function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var canDownload = false;
async function downloadImagesWithDelay(result2) {
  for (let t in result2) {
    let q = result2[t];
    if (q["HasImage"]) {
      if(q["qId"] == '9228') {
        canDownload = true;
      } 
      if (canDownload) {
        let url =
          "https://servisi.euprava.gov.rs/autoskole/Question/QuestionsPracticeImage?id=" +
          q["qId"] +
          "&guid=[paste quid here";
        downloadURI(url, q["qId"] + ".jpeg");
        console.log("download " + q["qId"] + ".jpeg");
        await sleep(200);
      }
    }
  }
}
 
downloadImagesWithDelay(data);
