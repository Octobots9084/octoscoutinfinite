import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
let endgameOptions = JSONConfig.endgameOptions;
let endgameSelects = [];
generateSelects();
loadStoredData();

function loadStoredData() {
  let data = localStorage.getItem("05endgame");
  if (data != null) {
    let endgameData = JSON.parse(data);
    for (let i = 0; i < endgameOptions.length; i++) {
      endgameSelects[i].value = endgameData[endgameOptions[i].name];
    }
  }
}

// Dynamically generating select elements
function generateSelects() {
  for (let i = 0; i < endgameOptions.length; i++) {
    let container = document.createElement("div");
    endgameSelects.push(document.createElement("select"));
    let label = document.createElement("h3");
    label.innerHTML = endgameOptions[i].name;
    let possibleResults = endgameOptions[i].possibleResults;
    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      endgameSelects[endgameSelects.length - 1].appendChild(option);
    }

    label.classList.add("inputLabel");
    container.classList.add("inputContainer");
    container.appendChild(label);
    container.appendChild(endgameSelects[endgameSelects.length - 1]);

    document.body.appendChild(container);
  }
}

window.saveData = saveData;
function saveData() {
  let endgame = {};
  for (let i = 0; i < endgameOptions.length; i++) {
    endgame[endgameOptions[i].name] = endgameSelects[i].value;
  }
  localStorage.setItem("05endgame", JSON.stringify(endgame));
}
