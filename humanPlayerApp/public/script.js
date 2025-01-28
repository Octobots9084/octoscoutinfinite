let scoutNameInput = document.getElementById("scoutNameInput");
let matchNumberInput = document.getElementById("matchNumberInput");
let teamNumberInput = document.getElementById("teamNumberInput");
let teamColorInput = document.getElementById("teamColorInput");

function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    teamColorInput.value = metaData.teamColor;
  }
}

function saveData() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  metaData.matchNumber = matchNumberInput.value;
  metaData.teamNumber = teamNumberInput.value;
  metaData.teamColor = teamColorInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}

loadStoredData();
localStorage.clear();
