import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
let extraOptions = JSONConfig.extraOptions;
let extraSelectsContainer = document.getElementById("extraSelectsContainer");
let commentInput = document.getElementById("commentInput");

let extraSelects = [];
generateSelects();
loadStoredData();

function loadStoredData() {
  let data = localStorage.getItem("06extra");
  if (data != null) {
    let extraData = JSON.parse(data);
    for (let i = 0; i < extraOptions.length; i++) {
      extraSelects[i].value = extraData[extraOptions[i].name];
    }
  }
}

// Dynamically generating select elements
function generateSelects() {
  for (let i = 0; i < extraOptions.length; i++) {
    let container = document.createElement("div");
    extraSelects.push(document.createElement("select"));
    let label = document.createElement("h3");
    label.innerHTML = extraOptions[i].name;
    let possibleResults = extraOptions[i].possibleResults;
    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      extraSelects[extraSelects.length - 1].appendChild(option);
    }

    label.classList.add("inputLabel");
    container.classList.add("inputContainer");
    container.appendChild(label);
    container.appendChild(extraSelects[extraSelects.length - 1]);

    extraSelectsContainer.appendChild(container);
  }
}

window.saveData = saveData;
window.submitData = submitData;
function saveData() {
  let extra = {};
  for (let i = 0; i < extraOptions.length; i++) {
    extra[extraOptions[i].name] = extraSelects[i].value;
  }

  extra["Comments"] = commentInput.value;
  localStorage.setItem("06extra", JSON.stringify(extra));
}

let matchSubmitted = false;
async function submitData() {
  if (
    !matchSubmitted ||
    confirm("Are you sure you want to submit a duplicate match?")
  ) {
    matchSubmitted = true;
    let response = await fetch("../submitData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localStorage),
    });

    if (response.status == 200) {
      alert("Match Submitted");
    }
  }
}

document.scoutAgain = scoutAgain;
function scoutAgain() {
  if (!matchSubmitted) {
    if (confirm("You haven't submitted a match, your data will be lost.")) {
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}
