import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let extraOptions = JSONConfig.extraOptions;
let extraSelectsContainer = document.getElementById("extraSelectsContainer");
let commentInput = document.getElementById("commentInput");
let rescoutInput = document.getElementById("reScoutInput");
let extraSelects = [];
let currentCupcakeImage = null;
let matchSubmitted = false;

// Initialize page
generateSelects();
loadStoredData();

// Load saved data from localStorage
function loadStoredData() {
  let data = localStorage.getItem("06extra");
  if (data != null) {
    let extraData = JSON.parse(data);
    for (let i = 0; i < extraOptions.length; i++) {
      extraSelects[i].value = extraData[extraOptions[i].name];
    }

    if (extraData["Comments"]) {
      commentInput.value = extraData["Comments"];
    }
  }
}

// Dynamically generate select elements
function generateSelects() {
  for (let i = 0; i < extraOptions.length; i++) {
    // Create container for each select
    let container = document.createElement("div");
    container.classList.add("inputContainer");

    // Create select element
    extraSelects.push(document.createElement("select"));

    // Create label
    let label = document.createElement("h3");
    label.innerHTML = extraOptions[i].name;
    label.classList.add("inputLabel");

    // Add options to select
    let possibleResults = extraOptions[i].possibleResults;
    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      extraSelects[extraSelects.length - 1].appendChild(option);
    }

    // Add elements to container and page
    container.appendChild(label);
    container.appendChild(extraSelects[extraSelects.length - 1]);
    extraSelectsContainer.appendChild(container);
  }
}

// Save data to localStorage
window.saveData = function () {
  let extra = {};
  for (let i = 0; i < extraOptions.length; i++) {
    extra[extraOptions[i].name] = extraSelects[i].value;
  }

  extra["Comments"] = commentInput.value;
  extra["reScout"] = rescoutInput.checked;
  localStorage.setItem("06extra", JSON.stringify(extra));
};

// Submit data to server
window.submitData = async function () {
  if (
    !matchSubmitted ||
    confirm("Are you sure you want to submit a duplicate match?")
  ) {
    matchSubmitted = true;
    localStorage.removeItem("teamPosition");
    localStorage.removeItem("left");
    localStorage.removeItem("team");
    try {
      let response = await fetch("../submitData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localStorage),
      });

      if (response.status == 200) {
        alert("Match Submitted");
      } else {
        alert("Error submitting data. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data. Please check your connection.");
    }
  }
};

// Handle Scout Again button
window.scoutAgain = function () {
  if (!matchSubmitted) {
    if (confirm("You haven't submitted a match, your data will be lost.")) {
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
};
