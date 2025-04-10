import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let endgameOptions = JSONConfig.endgameOptions;
let endgameSelects = [];

// Get the form container instead of appending to body
const formContainer = document.getElementById("endgame-form");

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
    container.classList.add("inputContainer");

    endgameSelects.push(document.createElement("select"));

    let label = document.createElement("h3");
    label.innerHTML = endgameOptions[i].name;
    label.classList.add("inputLabel");

    let possibleResults = endgameOptions[i].possibleResults;
    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      endgameSelects[endgameSelects.length - 1].appendChild(option);
    }

    container.appendChild(label);
    container.appendChild(endgameSelects[endgameSelects.length - 1]);

    // Append to form container instead of body
    formContainer.appendChild(container);
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
